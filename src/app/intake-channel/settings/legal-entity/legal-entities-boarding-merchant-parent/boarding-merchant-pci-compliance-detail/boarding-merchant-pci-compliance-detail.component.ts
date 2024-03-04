import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FinancesService } from 'app/service/finance/finance.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-boarding-merchant-pci-compliance-detail',
  templateUrl: './boarding-merchant-pci-compliance-detail.component.html',
  styleUrls: ['./boarding-merchant-pci-compliance-detail.component.scss'],
})
export class BoardingMerchantPciComplianceDetailComponent implements OnInit {
  @Input() legalEntityId: any;
  @Output() cancelTab: EventEmitter<boolean> = new EventEmitter();
  @Output() updateData: EventEmitter<boolean> = new EventEmitter();
  @Output() previousTab: EventEmitter<number> = new EventEmitter();

  private subs = new SubSink();
  isWaitingForResponse = false;
  dataEntity;
  accountHolderCode;

  constructor(
    private financeService: FinancesService, 
    private translate: TranslateService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.getOneLegalEntity();
  }

  getOneLegalEntity() {
    if (this.legalEntityId) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.financeService.getOneLegalEntity(this.legalEntityId).subscribe(
        (resp) => {
          if (resp) {
            this.isWaitingForResponse = false;
            this.dataEntity = _.cloneDeep(resp);
          }
        },
        (err) => {
          this.isWaitingForResponse = false;
          this.authService.postErrorLog(err)
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
    }
  }

  onCancel() {
    this.cancelTab.emit(true);
  }

  onPrevious() {
    this.previousTab.emit(3);
  }

  getPCIQuestionnaire() {
    let return_url = window.location.href;

    if (return_url.includes('?openLegalEntities=true')) {
      return_url = window.location.href;
    } else if (return_url.includes('legalEntityId')) {
      const urlReplace = return_url.replace(`?legalEntityId=${this.legalEntityId}`, '?openLegalEntities=true');
      return_url = urlReplace;
    } else {
      return_url = return_url + '?openLegalEntities=true';
    }

    const payloadPCI = {
      account_holder_code: this.dataEntity && this.dataEntity.account_holder_code ? this.dataEntity.account_holder_code : null,
      return_url,
    };

    this.subs.sink = this.financeService.GetPCIQuestionairUrl(payloadPCI).subscribe(
      (resp) => {
        if (resp) {
          this.isWaitingForResponse = false;
          window.open(resp.redirect_url, '_blank');
          this.onCancel();
        } else {
          this.isWaitingForResponse = false;
          let listOfIssue = '';
          if (resp && resp.error && resp.error.length) {
            listOfIssue += '<ul style="text-align: start; margin-left: 20px">';
            resp.error = _.uniqBy(resp.error, 'error_description');
            resp.error.forEach((block) => {
              if (block && block && block.error_description) {
                listOfIssue += `<li> ${block.field_name} : ${block.error_description} </li>`;
              }
            });
            listOfIssue += '</ul>';
            Swal.fire({
              type: 'info',
              title: this.translate.instant('MERCHANT_S2.TITLE'),
              html: this.translate.instant('MERCHANT_S2.TEXT', { listOfIssue: listOfIssue }),
              confirmButtonText: this.translate.instant('MERCHANT_S2.BUTTON'),
            });
          }
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.authService.postErrorLog(err)
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }
}
