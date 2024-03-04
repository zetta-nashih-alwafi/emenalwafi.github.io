import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmissionFormComponent } from './admission-form.component';
import { AuthService } from 'app/service/auth-service/auth.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatCommonModule } from '@angular/material';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdmissionService } from 'app/service/admission/admission.service';
import { of } from 'rxjs';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

const mockCandidateData = {
  _id: '61bc8aad851a935350ff39c1',
  region: 'Île-de-France',
  civility: 'MR',
  first_name: 'Hugo',
  last_name: 'JEANNE',
  telephone: '0695583500',
  department: 'Hauts-de-Seine',
  payment_method: 'credit_card',
  is_admitted: true,
  email: 'hugoleojeanne@yopmail.com',
  finance: 'family',
  candidate_admission_status: 'registered',
  nationality: 'France',
  last_name_used: 'JEANNE',
  first_name_used: 'Hugo',
  address: '7 RUE FRANCOIS BOUGAULT',
  additional_address: '',
  country: 'France',
  city: 'Suresnes',
  post_code: '92150',
  school_contract_pdf_link: "Contrat d'étude-Hugo-JEANNE-f4316f3d-e2fb-4d74-a375-a8cdf782e1c3.pdf",
  date_of_birth: '16/06/2004',
  country_of_birth: 'France',
  nationality_second: '',
  post_code_of_birth: '92150',
  city_of_birth: 'Suresnes',
  autorization_account: false,
  campus: {
    _id: '6166e899fd74d459cd965db9',
    name: 'Paris',
    address: '',
    levels: [
      {
        _id: '6166e89afd74d459cd965ddd',
        name: '1 EN',
      },
      {
        _id: '61aa4d3de682877d6381745d',
        name: 'Cycle I',
      },
      {
        _id: '61aa4d3de682877d6381745f',
        name: 'Cycle II',
      },
      {
        _id: '6166e899fd74d459cd965da3',
        name: '2',
      },
      {
        _id: '6166e899fd74d459cd965da4',
        name: '3',
      },
      {
        _id: '6166e899fd74d459cd965da2',
        name: '1',
      },
      {
        _id: '6166e899fd74d459cd965da6',
        name: '5',
      },
      {
        _id: '61aa4d3de682877d6381745b',
        name: 'Prépa',
      },
      {
        _id: '6166e899fd74d459cd965da5',
        name: '4',
      },
      {
        _id: '6166e899fd74d459cd965dd4',
        name: '1RD',
      },
    ],
    specialities: [],
  },
  photo: 'Portrait-Hugo-2021-HD---Tête-49021bd6-0165-43eb-b5c4-91fd1845b9a9.jpg',
  announcement_call: 'done',
  announcement_email: {
    sent_date: '17/12/2021',
    sent_time: '13:04',
  },
  registration_profile_type: 'external',
  intake_channel: {
    _id: '61aa4d69e682877d638174d9',
    program: 'ESEPAR Prépa Générale',
    scholar_season_id: {
      _id: '61792005de9a18612a52a5da',
      scholar_season: '22-23',
    },
    admission_document: {
      s3_file_name: 'ESEC-CGV_22-23_VF-05548281-7c87-4bec-9294-e3f9e5fb6f2e.pdf',
      document_name: 'CGV',
    },
  },
  registration_profile: {
    _id: '61ae283ee087d42f863f8ac8',
    name: 'Externe ESEC [FR]',
    is_down_payment: 'yes',
    other_amount: null,
    discount_on_full_rate: 0,
    type_of_formation: {
      _id: '61892e7367e6e4135fe90271',
      type_of_information: 'classic',
    },
    additional_cost_ids: [
      {
        additional_cost: "Frais d'inscription ESEC BRASSART MOPA 370€ ",
        amount: 370,
      },
    ],
    description: 'Externe ESEC (CB + Virement + SEPA)',
    payment_modes: [
      {
        _id: '61af720a88acb73fa64ca007',
        name: 'Paiement en 3 fois (ESEC)',
        description: 'Paiement en 3 fois (ESEC)',
        additional_cost: 0,
        currency: 'EUR',
        term: 3,
        select_payment_method_available: ['bank_debit'],
        payment_date: [
          {
            date: '08/30/2022',
            amount: null,
            percentage: 33,
          },
          {
            date: '11/15/2022',
            amount: null,
            percentage: 33,
          },
          {
            date: '01/15/2023',
            amount: null,
            percentage: 34,
          },
        ],
      },
      {
        _id: '61af729988acb73fa64ca063',
        name: 'Paiement 5 fois (ESEC)',
        description: 'Paiement 5 fois (ESEC)',
        additional_cost: 100,
        currency: 'EUR',
        term: 5,
        select_payment_method_available: ['bank_debit'],
        payment_date: [
          {
            date: '08/30/2022',
            amount: null,
            percentage: 20,
          },
          {
            date: '11/15/2022',
            amount: null,
            percentage: 20,
          },
          {
            date: '01/15/2023',
            amount: null,
            percentage: 20,
          },
          {
            date: '03/15/2023',
            amount: null,
            percentage: 20,
          },
          {
            date: '05/15/2023',
            amount: null,
            percentage: 20,
          },
        ],
      },
      {
        _id: '61af732888acb73fa64ca096',
        name: 'Paiement 1 fois (ESEC)',
        description: 'Paiement 1 fois (ESEC)',
        additional_cost: 0,
        currency: 'EUR',
        term: 1,
        select_payment_method_available: ['bank_debit', 'transfer'],
        payment_date: [
          {
            date: '08/30/2022',
            amount: null,
            percentage: 100,
          },
        ],
      },
    ],
  },
  engagement_level: 'registered',
  level: {
    _id: '61aa4d3de682877d6381745b',
    name: 'Prépa',
    specialities: [],
  },
  speciality: null,
  scholar_season: {
    _id: '61792005de9a18612a52a5da',
    scholar_season: '22-23',
  },
  sector: {
    _id: '61aa4d69e682877d638174d5',
    name: 'Générale',
  },
  school: {
    _id: '6185229a8f64393a46e71103',
    school_logo: 'logo-esec-bbd91250-4580-45ff-855b-de85a7b1a966.png',
    short_name: 'ESEC',
    long_name: "L'École Supérieure d'étude Cinématographique",
    campuses: [
      {
        _id: '6166e899fd74d459cd965db9',
        name: 'Paris',
        bank: {
          name: '',
          city: '',
          address: '',
        },
        levels: [
          {
            _id: '6166e89afd74d459cd965ddd',
            name: '1 EN',
          },
          {
            _id: '61aa4d3de682877d6381745d',
            name: 'Cycle I',
          },
          {
            _id: '61aa4d3de682877d6381745f',
            name: 'Cycle II',
          },
          {
            _id: '6166e899fd74d459cd965da3',
            name: '2',
          },
          {
            _id: '6166e899fd74d459cd965da4',
            name: '3',
          },
          {
            _id: '6166e899fd74d459cd965da2',
            name: '1',
          },
          {
            _id: '6166e899fd74d459cd965da6',
            name: '5',
          },
          {
            _id: '61aa4d3de682877d6381745b',
            name: 'Prépa',
          },
          {
            _id: '6166e899fd74d459cd965da5',
            name: '4',
          },
          {
            _id: '6166e899fd74d459cd965dd4',
            name: '1RD',
          },
        ],
      },
    ],
  },
  connection: 'done',
  personal_information: 'done',
  signature: 'done',
  method_of_payment: 'credit_card',
  payment: 'done',
  admission_member_id: {
    _id: '61af6be588acb73fa64c94ce',
    first_name: 'Habib',
    last_name: 'BOULTAM',
    civility: 'MR',
    profile_picture: 'IMG_0687-3b60ff6c-6456-429e-81a1-e61343853c37.JPG',
    email: 'h.boultam@yopmail.com',
    position: 'Responsable admission',
    portable_phone: '0785680457',
  },
  fixed_phone: '',
  is_whatsapp: false,
  participate_in_open_house_day: false,
  participate_in_job_meeting: false,
  count_document: null,
  user_id: '61bc8ac6851a935350ff3a0e',
  payment_splits: [
    {
      payer_name: 'M. Hugo JEANNE',
      percentage: 0,
    },
    {
      payer_name: 'M. Pascal JEANNE',
      percentage: 100,
    },
  ],
  selected_payment_plan: {
    name: '5700.00€ - 5 echeances',
    times: 5,
    additional_expense: 470,
    down_payment: 1000,
    total_amount: 5700,
    payment_date: [
      {
        date: '30/09/2021',
        amount: 1140,
      },
      {
        date: '15/11/2022',
        amount: 1140,
      },
      {
        date: '15/01/2023',
        amount: 1140,
      },
      {
        date: '15/03/2023',
        amount: 1140,
      },
      {
        date: '15/05/2023',
        amount: 1140,
      },
    ],
  },
  payment_supports: [
    {
      upload_document_rib: 'IBAN_BNP_CJ_2019-ef2f2675-d460-4979-90ba-5264f20510f4.pdf',
      family_name: 'JEANNE',
      relation: 'father',
      name: 'Pascal',
      sex: null,
      civility: 'MR',
      tele_phone: '0674093559',
      email: 'hugoleojeanne@yopmail.com',
      autorization_account: true,
      iban: 'FR7630004026670000005343937',
      bic: 'BNPAFRPPBBT',
      parent_address: [
        {
          address: '7 RUE FRANCOIS BOUGAULT',
          additional_address: '',
          postal_code: '92150',
          city: 'Suresnes',
          region: '',
          department: '',
          country: 'France',
        },
      ],
    },
  ],
  program_desired: 'Anne Prparatoire',
  trial_date: '16/12/2021',
  program_confirmed: 'done',
  candidate_sign_date: {
    date: '20/12/2021',
    time: '14:25',
  },
  iban: '',
  bic: '',
};

describe('AdmissionFormComponent', () => {
  let component: AdmissionFormComponent;
  let fixture: ComponentFixture<AdmissionFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdmissionFormComponent],
      imports: [
        CommonModule,
        MatCommonModule,
        MatButtonModule,
        ApolloTestingModule,
        HttpClientTestingModule,
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader },
        }),
        SlickCarouselModule,
        FormsModule,
        ReactiveFormsModule,
        SweetAlert2Module.forRoot(),
      ],
      providers: [{ provide: AuthService, useClass: AuthServiceStub }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdmissionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle response from getOneCandidate', () => {
    const service = TestBed.get(AdmissionService);
    spyOn(service, 'getCandidateAdmission').and.returnValue(of(mockCandidateData));
    component.getOneCandidate();
    expect(component.candidateData).toEqual(mockCandidateData);
  });

  it('Should have school logo', () => {
    const service = TestBed.get(AdmissionService);
    spyOn(service, 'getCandidateAdmission').and.returnValue(
      of({
        _id: '61bc8aad851a935350ff39c1',
        photo: 'Portrait-Hugo-2021-HD---Tête-49021bd6-0165-43eb-b5c4-91fd1845b9a9.jpg',
      }),
    );
    component.getOneCandidate();
    expect(component.is_photo_in_s3).toBeTruthy();
  });
});

export class AuthServiceStub {
  getPermission() {
    return ['operator_dir'];
  }
  getLocalStorageUser() {
    return {
      _id: '5ffec5c2ce635b2fb6a81f2d',
      civility: 'MRS',
      first_name: 'Maeva',
      last_name: 'Mugnier',
      email: 'm.mugnier2@yopmail.com',
      position: null,
      student_id: null,
      office_phone: '',
      direct_line: '',
      portable_phone: '',
      profile_picture: 'POC-Maeva-Mugnier-2-2c010322-3bb7-43e8-81ca-f3133d78b3ac.png',
      is_password_set: true,
      is_registered: true,
      entities: [
        {
          school: null,
          campus: null,
          level: null,
          entity_name: 'operator',
          school_type: null,
          group_of_schools: [],
          group_of_school: null,
          assigned_rncp_title: null,
          class: null,
          type: {
            _id: '5fe98eeadb866c403defdc6b',
            name: 'operator_dir',
          },
        },
      ],
    };
  }
}
