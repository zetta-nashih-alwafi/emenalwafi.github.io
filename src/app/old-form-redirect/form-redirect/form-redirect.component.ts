import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormFillingService } from 'app/form-filling/form-filling.service';
import { SubSink } from 'subsink';
import * as _ from 'lodash';

@Component({
  selector: 'ms-form-redirect',
  templateUrl: './form-redirect.component.html',
  styleUrls: ['./form-redirect.component.scss']
})
export class FormRedirectComponent implements OnInit {
  userTypeId: any;
  userId: any;
  candidateId: any;
  formId: any;
  formType: any;
  subs = new SubSink();
  validatorArrays = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formFillingService: FormFillingService,
  ) { }

  ngOnInit() {
    this.route.queryParamMap.subscribe((resp: any) => {
      this.formId = resp.get('formId') ? resp.get('formId') : '';
      this.formType = resp.get('formType') ? resp.get('formType') : '';
      this.userId = resp.get('userId') ? resp.get('userId') : '';
      this.userTypeId = resp.get('userTypeId') ? resp.get('userTypeId') : '';
      this.candidateId = resp.get('candidateId') ? resp.get('candidateId') : '';
     
      console.log('formId', this.formId, 'formtype', this.formType, 'usertype', this.userTypeId, 'userId', this.userId, 'candidate', this.candidateId);
    });
    this.getOneFormProcess();
  }

  formatNewLink() {
    const querys = {
      formId: this.formId,
      formType: this.formType,
      userId: this.userId,
      userTypeId: this.userTypeId,
    };
    const url = this.router.createUrlTree(['/form-fill'], { queryParams: querys });
    window.location.href = url.toString();
    // window.open(url.toString(), '_blank')
  }

  getOneFormProcess() {    
    this.formFillingService.getOneFormProcess(this.formId).subscribe((resp) => {
      if (resp) {        
        const data = _.cloneDeep(resp);
        console.log('getOneFormProcess', data)
        data.steps.forEach(step => {
          const stepValidator = {
            user_validator: step.user_validator &&  step.user_validator._id ? step.user_validator._id : '',
            validator : step.validator &&  step.validator._id ? step.validator._id : ''
          }
          this.validatorArrays.push(stepValidator);
        })

        console.log('validator', this.validatorArrays);
        if(this.validatorArrays.length) {
          if(this.userId){
            const matchUser = data.steps.find((step) => {
              if (step.user_validator && step.user_validator._id  === this.userId) {
               return step
              }
            })
            this.userTypeId = matchUser ? matchUser.validator._id : '5fe98eeadb866c403defdc6c';
            console.log('user type id :: ', this.userTypeId)
            this.formatNewLink();
          } else {
            this.getOneCandidate();  
          }
        } else {
          this.getOneCandidate();
        }
      }
    });
  }

  getOneCandidate(){
    this.subs.sink = this.formFillingService.GetOneCandidate(this.candidateId).subscribe((res) => {
      if (res) {
        if(res.user_id && res.user_id._id) {
          this.userId = res.user_id._id;
          this.userTypeId = '5fe98eeadb866c403defdc6c'
          this.formatNewLink();
        }
      } 
    })
  }

}
