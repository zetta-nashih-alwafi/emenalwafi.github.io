import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/service/auth-service/auth.service';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { UserService } from 'app/service/user/user.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { environment } from 'environments/environment';
import { NgxImageCompressService } from 'ngx-image-compress';
import { NgxPermissionsService } from 'ngx-permissions';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import { merge } from 'rxjs'

@Component({
  selector: 'ms-profile-button-menu',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatMenuModule, MatButtonModule, MatProgressSpinnerModule, MatDividerModule, TranslateModule],
  templateUrl: './profile-button-menu.component.html',
  styleUrls: ['./profile-button-menu.component.scss'],
})
export class ProfileButtonMenuComponent implements OnInit {
  private _authService = inject(AuthService);
  private _fileUploadService = inject(FileUploadService);
  private _imageCompressor = inject(NgxImageCompressService);
  private _ngxPermission = inject(NgxPermissionsService);
  private _router = inject(Router);
  private _subs = new SubSink();
  private _translate = inject(TranslateService);
  private _userService = inject(UserService);
  private _utils = inject(UtilityService);

  currentUser = this._authService.getLocalStorageUser();
  currentUserTypeId = this.currentUser?.entities?.find((resp) => resp?.type?.name === this._authService.getPermission[0])?.type?._id;
  isLoadingUpload = false;
  imageBeforeCompressed;
  imageAfterCompressed;
  profilePic = new FormControl('');
  @ViewChild('fileUpload', { static: false })
  uploadInput: ElementRef<HTMLInputElement>;

  constructor() {}

  ngOnInit(): void {
    this._subs.sink = merge(
      this._userService.reloadCurrentUser$,
      this._userService.reloadPhotoUser$,
    ).subscribe(() => {
      this.currentUser = this._authService.getLocalStorageUser();
    })
    this.profilePic.patchValue(this.userPhotoPath);
  }

  get label() {
    return this._utils.constructUserName(this.currentUser, ['civ', 'first', 'last'])
  }

  get userPhotoPath() {
    return this.currentUser?.profile_picture
      ? environment.apiUrl.replace('/graphql', '/fileuploads/') + this.currentUser.profile_picture
      : this.currentUser.civility === 'MR'
      ? '/assets/img/student_icon.png'
      : '/assets/img/student_icon_fem.png';
  }

  get isLoggedInAsOther() {
    return this._authService.isLoginAsOther();
  }

  logOut() {
    this._authService.logOut();
  }

  backToPreviousLogin() {
    const user = JSON.parse(localStorage.getItem('backupUser'));
    this._authService.loginAsPreviousUser();

    const userLogin = user;
    const entities = userLogin.entities;

    const sortedEntities = this._utils.sortEntitiesByHierarchy(entities);
    const permissions = [];
    const permissionsId = [];
    if (sortedEntities && sortedEntities.length > 0) {
      sortedEntities.forEach((entity) => {
        permissions.push(entity.type.name);
        permissionsId.push(entity.type._id);
      });
    }

    this._authService.setPermission([permissions[0]]);
    this._ngxPermission.flushPermissions();
    this._ngxPermission.loadPermissions([permissions[0]]);

    this._userService.reloadCurrentUser(true);
    this._router.navigateByUrl('/mailbox/inbox', { skipLocationChange: true }).then(() => {
      if (this._ngxPermission.getPermission('Mentor') || this._ngxPermission.getPermission('HR')) {
        this._router.navigate(['/students-card']);
      } else if (this._ngxPermission.getPermission('Chief Group Academic')) {
        this._router.navigate(['/school-group']);
      } else if (this._ngxPermission.getPermission('Student')) {
        this._router.navigate(['/my-file']);
      } else {
        this._router.navigate(['/']);
      }
    });
  }

  openPrivacyPolicy() {
    const fileName = this._translate.currentLang.toUpperCase();
    const url = `${environment.apiUrl}/privacy-policy/${fileName}.html`.replace('/graphql', '');
    window.open(url, '_blank');
  }

  selectFile(fileInput: Event) {
    const acceptable = ['jpg', 'jpeg', 'png'];
    this.imageBeforeCompressed = (<HTMLInputElement>fileInput.target).files[0];
    if (this.imageBeforeCompressed) {
      const fileType = this._utils.getFileExtension(this.imageBeforeCompressed.name).toLocaleLowerCase();
      if (acceptable.includes(fileType)) {
        if (this.imageBeforeCompressed.size > 5000000) {
          Swal.fire({
            type: 'info',
            title: this._translate.instant('UPLOAD_IMAGE.TITLE'),
            text: this._translate.instant('UPLOAD_IMAGE.TEXT'),
            confirmButtonText: this._translate.instant('UPLOAD_IMAGE.BUTTON'),
          });
        } else {
          this.isLoadingUpload = true;
          const fileName = this.imageBeforeCompressed?.name;
          const size = this.imageBeforeCompressed?.size;
          const reader = new FileReader();
          reader.onload = (read: any) => {
            const localUrl = read.target.result;
            this.compressFile(localUrl, fileName, size);
          };
          reader.readAsDataURL(this.imageBeforeCompressed);
        }
      } else {
        Swal.fire({
          type: 'info',
          title: this._translate.instant('UPLOAD_ERROR.WRONG_TYPE_TITLE'),
          text: this._translate.instant('UPLOAD_ERROR.WRONG_TYPE_TEXT', { file_exts: '.jpg, .jpeg, .png' }),
          allowEscapeKey: false,
          allowOutsideClick: false,
          allowEnterKey: false,
        });
      }
    }
  }

  private compressFile(image, fileName, size) {
    const orientation = -1;
    let ratio: number;
    const compressedName = fileName.substring(0, fileName.lastIndexOf('.')) + '-Compressed' + fileName.substring(fileName.lastIndexOf('.'));

    //*************** set ratio based on image size
    if (size > 3000000 && size <= 5000000) {
      ratio = 20;
    } else if (size >= 1000000 && size <= 3000000) {
      ratio = 30;
    } else if (size < 1000000) {
      ratio = 40;
    }

    //*************** compress image
    if (ratio) {
      this._imageCompressor.compressFile(image, orientation, ratio, 50).then((result) => {
        fetch(result)
          .then((res) => res.blob())
          .then((blob) => {
            this.imageAfterCompressed = new File([blob], compressedName, { type: 'image/png' });
            this.uploadFile(this.imageAfterCompressed, this.imageBeforeCompressed);
          });
      });
    }
  }

  private uploadFile(imageAfter: File, imageBefore: File) {
    //*************** upload image before compressed
    if (imageBefore) {
      this._subs.sink = this._fileUploadService.singleUpload(imageBefore).subscribe(
        (resp) => {
          this.isLoadingUpload = false;
          this.profilePic.patchValue(resp.s3_file_name);
          this.currentUser.profile_picture = resp.s3_file_name;

          const payload = {};
          payload['email'] = this.currentUser.email;
          payload['profile_picture'] = resp.s3_file_name;
          payload['first_name'] = this.currentUser.first_name;
          payload['last_name'] = this.currentUser.last_name;

          //*************** upload image after compressed
          if (imageAfter) {
            this._subs.sink = this._fileUploadService.singleUpload(imageAfter).subscribe(
              (res) => {
                if (res) {
                  console.log('Image compressed upload success');
                  payload['compressed_photo'] = res.s3_file_name;
                  this._subs.sink = this._userService.updateUser(this.currentUser._id, payload, this.currentUserTypeId).subscribe(
                    (response) => {
                      if (response) {
                        const temp = this.currentUser;
                        temp.profile_picture = resp.s3_file_name;
                        localStorage.setItem('userProfile', JSON.stringify(temp));
                      }
                    },
                    (err) => {
                      this.isLoadingUpload = false;
                      if (
                        err &&
                        err['message'] &&
                        (err['message'].includes('jwt expired') ||
                          err['message'].includes('str & salt required') ||
                          err['message'].includes('Authorization header is missing') ||
                          err['message'].includes('salt'))
                      ) {
                        this._authService.handlerSessionExpired();
                        return;
                      }
                      Swal.fire({
                        type: 'info',
                        title: this._translate.instant('SORRY'),
                        text: err && err['message'] ? this._translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                        confirmButtonText: this._translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
                      });
                    },
                  );
                }
              },
              (err) => {
                if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
                  Swal.fire({
                    type: 'warning',
                    title: this._translate.instant('BAD_CONNECTION.Title'),
                    html: this._translate.instant('BAD_CONNECTION.Text'),
                    confirmButtonText: this._translate.instant('BAD_CONNECTION.Button'),
                    allowOutsideClick: false,
                    allowEnterKey: false,
                    allowEscapeKey: false,
                  });
                } else {
                  Swal.fire({
                    type: 'info',
                    title: 'Error !',
                    confirmButtonText: this._translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
                  }).then((res) => {
                    console.log('[BE Message] Error is : ', err);
                  });
                }
              },
            );
          }
        },
        (err) => {
          this.isLoadingUpload = false;
          if (
            err &&
            err['message'] &&
            (err['message'].includes('jwt expired') ||
              err['message'].includes('str & salt required') ||
              err['message'].includes('Authorization header is missing') ||
              err['message'].includes('salt'))
          ) {
            this._authService.handlerSessionExpired();
            return;
          }
          Swal.fire({
            type: 'info',
            title: this._translate.instant('SORRY'),
            text: err && err['message'] ? this._translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this._translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
    }
    this.resetFileState();
  }

  private resetFileState() {
    this.uploadInput.nativeElement.value = '';
  }
}
