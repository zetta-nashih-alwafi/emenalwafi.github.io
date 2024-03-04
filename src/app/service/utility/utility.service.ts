import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import { AuthService } from '../auth-service/auth.service';
import * as _ from 'lodash';
import { NgxPermissionsService } from 'ngx-permissions';
import { Apollo } from 'apollo-angular';
import { Observable, throwError } from 'rxjs';
import { AppPermission } from 'app/models/app-permission.model';
import gql from 'graphql-tag';
import { map } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ObjectCache } from 'apollo-cache-inmemory';
import { UserProfileData } from 'app/users/user.model';

@Injectable({
  providedIn: 'root',
})
export class UtilityService {
  // start heirarchy per entity
  listHierarchyEntity = ['operator', 'academic', 'admission', 'finance', 'company_relation', 'company', 'alumni'];
  // end heirarchy per entity

  // Top heirarchy
  listEntitiesNonProgram = ['operator'];
  // start heirarchy per user type
  listHierarchyUserType = {
    operator: ['operator_dir', 'operator_admin'],
    academic: ['Academic Director', 'Academic Member', 'Contract Manager', 'Academic referent', 'Teacher', 'Student', 'Candidate'],
    admission: ['Admission Director', 'Admission Member', 'Continuous formation manager'],
    finance: ['Finance Director', 'Finance Member'],
    company_relation: ['Company Relation Director', 'Company Relation Member'],
    company: ['CEO', 'Mentor'],
    alumni: ['Alumni Member'],
  };

  operatorTypeList = ['operator_dir', 'operator_admin'];
  academicTypeList = ['Academic Director', 'Academic Member', 'Contract Manager', 'Academic referent', 'Teacher', 'Student', 'Candidate'];
  admissionTypeList = ['Admission Director', 'Admission Member', 'Continuous formation manager'];
  financeTypeList = ['Finance Director', 'Finance Member'];
  relationTypeList = ['Company Relation Director', 'Company Relation Member'];
  companyTypeList = ['CEO', 'Mentor'];
  alumniTypeList = ['Alumni Member'];
  // end heirarchy per user type

  userTypeList = [
    {
      _id: '5a2e1ecd53b95d22c82f954e',
      name: 'operator_admin',
    },
    {
      _id: '5a2e1ecd53b95d22c82f954b',
      name: 'operator_dir',
    },
    {
      _id: '5a2e1ecd53b95d22c82f954d',
      name: 'operator_visitor',
    },
    {
      _id: '5a2e1ecd53b95d22c82f9555',
      name: 'Academic Admin',
    },
    {
      _id: '5a2e1ecd53b95d22c82f9554',
      name: 'Academic Director',
    },
    {
      _id: '5cdbdeaf4b1f6a1b5a0b3fb6',
      name: 'Academic Final Jury Member',
    },
    {
      _id: '5c173695ba179819bd115df1',
      name: 'Academic Final Jury Member',
    },
    {
      _id: '5a2e1ecd53b95d22c82f9550',
      name: 'Certifier Admin',
    },
    {
      _id: '5a66cd0813f5aa05902fac1e',
      name: 'Chief Group Academic',
    },
    {
      _id: '5bc066042a35327127ad9dfa',
      name: 'Collaborateur Ext. ADMTC',
    },
    {
      _id: '5b1ffb5c9e25da6d30bde480',
      name: 'Correcteur PFE Oral',
    },
    {
      _id: '5a2e1ecd53b95d22c82f9559',
      name: 'Corrector',
    },
    {
      _id: '5f33552b683818419d13028b',
      name: 'Animator Business game',
    },
    {
      _id: '5b210d24090336708818ded1',
      name: 'Corrector Certifier',
    },
    {
      _id: '5a2e1ecd53b95d22c82f9552',
      name: 'Corrector Quality',
    },
    {
      _id: '5a2e1ecd53b95d22c82f9551',
      name: 'Corrector of Problematic',
    },
    {
      _id: '5a9e7ddf8228f45eb2e9bc77',
      name: 'Cross Corrector',
    },
    {
      _id: '5a2e1ecd53b95d22c82f954f',
      name: 'CR School Director',
    },
    {
      _id: '5a2e1ecd53b95d22c82f9553',
      name: 'PC School Director',
    },
    {
      _id: '5a2e603c53b95d22c82f958f',
      name: 'HR',
    },
    {
      _id: '5a2e603f53b95d22c82f9590',
      name: 'Mentor',
    },
    {
      _id: '5a3cd5e7e6fae44c7c11561e',
      name: 'President of Jury',
    },
    {
      _id: '5cdbde9b4b1f6a1b5a0b3fb5',
      name: 'Professional Jury Member',
    },
    {
      _id: '5a2e1ecd53b95d22c82f954c',
      name: 'Sales',
    },
    {
      _id: '5a2e1ecd53b95d22c82f9558',
      name: 'Teacher',
    },
    {
      _id: '5e93dd18ef9a2925e85eeb29',
      name: 'Teacher Certifier',
    },
    {
      _id: '6110d01d08f82f5d8c8f7d5c',
      name: 'Company Member',
    },
    {
      _id: '6110d01d08f82f5d8c8f7d5e',
      name: 'CEO',
    },
  ];

  industryList = [
    'none',
    'food',
    'bank',
    'wood_paper_cardboard_printing',
    'building_construction_materials',
    'chemistry_parachemistry',
    'sales_trading_distribution',
    'education',
    'edition_communication_multimedia',
    'electronics_electricity',
    'studies_and_consultancy',
    'professional_training',
    'pharmaceutical_industry',
    'it_telecom',
    'machinery_and_equipment_automotive',
    'metallurgy_metal_working',
    'plastic_rubber',
    'business_services',
    'textile_clothing_shoes',
    'transport_logistics',
  ];

  operatorDetail: AppPermission;

  constructor(
    private authService: AuthService,
    private permissionService: NgxPermissionsService,
    private apollo: Apollo,
    private permissions: NgxPermissionsService,
    private translate: TranslateService,
  ) {}

  getAppPermission(): Observable<AppPermission> {
    return this.apollo
      .query({
        query: gql`
          query GetAppPermission {
            GetAppPermission {
              group_name
              group_logo
              is_site_active
              mails {
                help_mail
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAppPermission']));
  }

  get operator() {
    return this.operatorDetail;
  }

  set operator(val: AppPermission) {
    this.operatorDetail = val;
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('userProfile'));
  }

  getCurrentUserType() {
    const user = this.getCurrentUser();
    if (user && user.entities && user.entities[0] && user.entities[0].type && user.entities[0].type._id) {
      return user.entities[0].type._id;
    } else {
      return null;
    }
  }

  getAssignedTitles() {
    const user = JSON.parse(localStorage.getItem('userProfile'));
    const titles = [];
    if (user && user.entities && user.entities.length) {
      user.entities.forEach((entity) => {
        if (entity && entity.assigned_rncp_title) {
          titles.push(entity.assigned_rncp_title);
        }
      });
    }
    return titles;
  }

  getAllAssignedTitles(entities) {
    const titles = [];
    if (entities && entities.length) {
      entities.forEach((entity) => {
        if (entity && entity.assigned_rncp_title) {
          titles.push(entity.assigned_rncp_title);
        }
      });
    }
    return titles;
  }

  isUserOPERATOR() {
    const permission = this.authService.getPermission();
    let isEntityExist = false;
    console.log(permission);
    permission.forEach((entityName) => {
      if (entityName === 'operator_admin') {
        isEntityExist = true;
      }
    });
    return isEntityExist;
  }

  isUserOPERATORDir() {
    const permission = this.authService.getPermission();
    let isEntityExist = false;
    permission.forEach((entityName) => {
      if (entityName === 'operator_dir') {
        isEntityExist = true;
      }
    });
    return isEntityExist;
  }

  isUserEntityOPERATOR() {
    const permission = this.authService.getPermission();
    let isEntityExist = false;
    permission.forEach((entityName) => {
      if (entityName === 'operator_admin' || entityName === 'operator_dir') {
        isEntityExist = true;
      }
    });
    return isEntityExist;
  }

  isUserJuryMember() {
    return (
      !!this.permissions.getPermission('Academic Final Jury Member') ||
      !!this.permissions.getPermission('Professional Jury Member Certifier') ||
      !!this.permissions.getPermission('Professional Jury Member') ||
      !!this.permissions.getPermission('Academic jury member')
    );
  }

  isUserOneOfADMTCEntity() {
    const user = this.getCurrentUser();
    let result = false;
    if (user && user.entities) {
      user.entities.forEach((entity) => {
        if (entity && entity.entity_name === 'admtc') {
          result = true;
        }
      });
    }
    return result;
  }

  isUserEntityADMTC() {
    return !!this.permissions.getPermission('ADMTC Admin') || !!this.permissions.getPermission('ADMTC Director');
  }

  isUserOneOfOPERATOREntity() {
    const user = this.getCurrentUser();
    let result = false;
    if (user && user.entities) {
      user.entities.forEach((entity) => {
        if (entity && entity.entity_name === 'operator') {
          result = true;
        }
      });
    }
    return result;
  }

  isUserAcadir() {
    const permission = this.authService.getPermission();
    let isEntityExist = false;
    permission.forEach((entityName) => {
      if (entityName === 'Academic Director') {
        isEntityExist = true;
      }
    });
    return isEntityExist;
  }

  isUserAcadAdmin() {
    const permission = this.authService.getPermission();
    let isEntityExist = false;
    permission.forEach((entityName) => {
      if (entityName === 'Academic Admin') {
        isEntityExist = true;
      }
    });
    return isEntityExist;
  }

  isUserAcadDirAdmin() {
    return (
      !!this.permissions.getPermission('Academic Admin') ||
      !!this.permissions.getPermission('Academic Director') ||
      !!this.permissions.getPermission('Academic Member')
    );
    // const permission = this.authService.getPermission();
    // let isEntityExist = false;
    // permission.forEach((entityName) => {
    //   if (entityName === 'Academic Director' || entityName === 'Academic Admin') {
    //     isEntityExist = true;
    //   }
    // });
    // return isEntityExist;
  }

  isUserPCDirector() {
    return !!this.permissions.getPermission('PC School Director');
  }

  isUserCRDirAdmin() {
    return !!this.permissions.getPermission('Certifier Admin') || !!this.permissions.getPermission('CR School Director');
    // const permission = this.authService.getPermission();
    // let isEntityExist = false;
    // permission.forEach((entityName) => {
    //   if (entityName === 'Certifier Admin' || entityName === 'CR School Director') {
    //     isEntityExist = true;
    //   }
    // });
    // return isEntityExist;
  }

  isUserCompany() {
    return (
      !!this.permissions.getPermission('Mentor') ||
      !!this.permissions.getPermission('HR') ||
      !!this.permissions.getPermission('Company Member') ||
      !!this.permissions.getPermission('CEO')
    );
  }

  isUserPresidentOfJury() {
    return !!this.permissions.getPermission('President of Jury');
  }

  isUserCrossCorrection() {
    const permission = this.authService.getPermission();
    let isEntityExist = false;
    permission.forEach((entityName) => {
      if (entityName === 'Cross Corrector') {
        isEntityExist = true;
      }
    });
    return isEntityExist;
  }

  isUserStudent() {
    const permission = this.authService.getPermission();
    let isEntityExist = false;
    permission.forEach((entityName) => {
      if (entityName === 'Student') {
        isEntityExist = true;
      }
    });
    return isEntityExist;
  }

  // !!this.permissions.getPermission('Student');

  isUserMentor() {
    const permission = this.authService.getPermission();
    let isEntityExist = false;
    permission.forEach((entityName) => {
      if (entityName === 'Mentor') {
        isEntityExist = true;
      }
    });
    return isEntityExist;
  }

  isCorrector() {
    const permission = this.authService.getPermission();
    let isEntityExist = false;
    permission.forEach((entityName) => {
      if (entityName === 'Corrector') {
        isEntityExist = true;
      }
    });
    return isEntityExist;
  }

  isAnimator() {
    const permission = this.authService.getPermission();
    let isEntityExist = false;
    permission.forEach((entityName) => {
      if (entityName === 'Animator Business game') {
        isEntityExist = true;
      }
    });
    return isEntityExist;
  }

  isDirector() {
    const permission = this.authService.getPermission();
    let isEntityExist = false;
    permission.forEach((entityName) => {
      if (entityName === 'PC School Director') {
        isEntityExist = true;
      }
    });
    return isEntityExist;
  }

  isTeacher() {
    const permission = this.authService.getPermission();
    let isEntityExist = false;
    permission.forEach((entityName) => {
      if (entityName === 'Teacher') {
        isEntityExist = true;
      }
    });
    return isEntityExist;
  }

  isProfesionalJuryMember() {
    const permission = this.authService.getPermission();
    let isEntityExist = false;
    permission.forEach((entityName) => {
      if (entityName === 'Professional Jury Member') {
        isEntityExist = true;
      }
    });
    return isEntityExist;
  }

  isCertifierAdmin() {
    const permission = this.authService.getPermission();
    let isEntityExist = false;
    permission.forEach((entityName) => {
      if (entityName === 'Certifier Admin') {
        isEntityExist = true;
      }
    });
    return isEntityExist;
  }

  isAcademicJuryMember() {
    const permission = this.authService.getPermission();
    let isEntityExist = false;
    permission.forEach((entityName) => {
      if (entityName === 'Academic Final Jury Member') {
        isEntityExist = true;
      }
    });
    return isEntityExist;
  }

  isCertifierDirector() {
    const permission = this.authService.getPermission();
    let isEntityExist = false;
    permission.forEach((entityName) => {
      if (entityName === 'CR School Director') {
        isEntityExist = true;
      }
    });
    return isEntityExist;
  }

  isCorrectorCertifier() {
    const permission = this.authService.getPermission();
    let isEntityExist = false;
    permission.forEach((entityName) => {
      if (entityName === 'Corrector Certifier') {
        isEntityExist = true;
      }
    });
    return isEntityExist;
  }

  isCorrectorOfProblematic() {
    return !!this.permissions.getPermission('Corrector of Problematic');
    // const permission = this.authService.getPermission();
    // let isEntityExist = false;

    // permission.forEach((entityName) => {
    //   if (entityName === 'Corrector of Problematic') {
    //     isEntityExist = true;
    //   }
    // });
    // return isEntityExist;
  }

  isCorrectorQuality() {
    const permission = this.authService.getPermission();
    let isEntityExist = false;
    permission.forEach((entityName) => {
      if (entityName === 'Corrector Quality') {
        isEntityExist = true;
      }
    });
    return isEntityExist;
  }

  isPresidentofJury() {
    const permission = this.authService.getPermission();
    let isEntityExist = false;
    permission.forEach((entityName) => {
      if (entityName === 'President of Jury') {
        isEntityExist = true;
      }
    });
    return isEntityExist;
  }

  isMentor() {
    const permission = this.authService.getPermission();
    let isEntityExist = false;
    permission.forEach((entityName) => {
      if (entityName === 'Mentor') {
        isEntityExist = true;
      }
    });
    return isEntityExist;
  }

  isCRM() {
    const permission = this.authService.getPermission();
    let isEntityExist = false;
    permission.forEach((entityName) => {
      if (entityName === 'Company Relation Member') {
        isEntityExist = true;
      }
    });
    return isEntityExist;
  }

  isUserCEO() {
    const permission = this.authService.getPermission();
    let isEntityExist = false;
    permission.forEach((entityName) => {
      if (entityName === 'CEO') {
        isEntityExist = true;
      }
    });
    return isEntityExist;
  }

  isUserCompanyMember() {
    const permission = this.authService.getPermission();
    let isEntityExist = false;
    permission.forEach((entityName) => {
      if (entityName === 'Company Member') {
        isEntityExist = true;
      }
    });
    return isEntityExist;
  }

  isUserCompanyManager() {
    const permission = this.authService.getPermission();
    let isEntityExist = false;
    permission.forEach((entityName) => {
      if (entityName === 'Company Manager') {
        isEntityExist = true;
      }
    });
    return isEntityExist;
  }

  isUserHR() {
    const permission = this.authService.getPermission();
    let isEntityExist = false;
    permission.forEach((entityName) => {
      if (entityName === 'HR') {
        isEntityExist = true;
      }
    });
    return isEntityExist;
  }

  isChiefGroupAcademic() {
    const permission = this.authService.getPermission();
    let isEntityExist = false;
    permission.forEach((entityName) => {
      if (entityName === 'Chief Group Academic') {
        isEntityExist = true;
      }
    });
    return isEntityExist;
  }

  isUserVisitor() {
    const permission = this.authService.getPermission();
    let isEntityExist = false;
    permission.forEach((entityName) => {
      if (entityName === 'operator_visitor') {
        isEntityExist = true;
      }
    });
    return isEntityExist;
  }

  checkUserIsFromGroupOfSchools() {
    const currentUser = JSON.parse(localStorage.getItem('userProfile'));
    let result = false;
    if (currentUser && currentUser.entities && currentUser.entities.length) {
      currentUser.entities.forEach((entity) => {
        if (entity.entity_name === 'group_of_schools') {
          result = true;
        }
      });
    }

    return result;
  }

  checkIsCurrentUserIncluded(userTypes: { _id: string; name: string }[]) {
    if (userTypes && userTypes.length) {
      for (const userType of userTypes) {
        let validate = false;
        switch (userType.name) {
          case 'Academic Director':
            validate = this.isUserAcadir();
            break;
          case 'Academic Admin':
            validate = this.isUserAcadAdmin();
            break;
          case 'Cross Corrector':
            validate = this.isUserCrossCorrection();
            break;
          case 'Corrector':
            validate = this.isCorrector();
            break;
          case 'Animator Business game':
            validate = this.isAnimator();
            break;
          case 'PC School Director':
            validate = this.isDirector();
            break;
          case 'Teacher':
            validate = this.isTeacher();
            break;
          case 'Professional Jury Member':
            validate = this.isProfesionalJuryMember();
            break;
          case 'Certifier Admin':
            validate = this.isCertifierAdmin();
            break;
          case 'Academic Final Jury Member':
            validate = this.isAcademicJuryMember();
            break;
          case 'CR School Director':
            validate = this.isCertifierDirector();
            break;
          case 'Corrector Certifier':
            validate = this.isCorrectorCertifier();
            break;
          case 'Corrector of Problematic':
            validate = this.isCorrectorOfProblematic();
            break;
          case 'Corrector Quality':
            validate = this.isCorrectorQuality();
            break;
          case 'President of Jury':
            validate = this.isPresidentofJury();
            break;
          case 'Mentor':
            validate = this.isMentor();
            break;
          case 'Chief Group Academic':
            validate = this.isChiefGroupAcademic();
            break;
        }
        if (validate) {
          return validate;
        }
      }
    }
    return false;
  }

  checkIsCurrentUserAssigned(userTypes: { _id: string; name: string }[]) {
    if (userTypes && userTypes.length) {
      for (const userType of userTypes) {
        let validate = false;
        switch (userType.name) {
          case 'Academic Director':
            validate = this.isUserAcadir() || this.isUserAcadAdmin() ? true : false;
            break;
          case 'Academic Admin':
            validate = this.isUserAcadir() || this.isUserAcadAdmin() ? true : false;
            break;
          case 'Cross Corrector':
            validate = this.isUserCrossCorrection();
            break;
          case 'Corrector':
            validate = this.isCorrector();
            break;
          case 'Animator Business game':
            validate = this.isAnimator();
            break;
          case 'PC School Director':
            validate = this.isDirector();
            break;
          case 'Teacher':
            validate = this.isTeacher();
            break;
          case 'Professional Jury Member':
            validate = this.isProfesionalJuryMember();
            break;
          case 'Certifier Admin':
            validate = this.isCertifierAdmin();
            break;
          case 'Academic Final Jury Member':
            validate = this.isAcademicJuryMember();
            break;
          case 'CR School Director':
            validate = this.isCertifierDirector();
            break;
          case 'Corrector Certifier':
            validate = this.isCorrectorCertifier();
            break;
          case 'Corrector of Problematic':
            validate = this.isCorrectorOfProblematic();
            break;
          case 'Corrector Quality':
            validate = this.isCorrectorQuality();
            break;
          case 'President of Jury':
            validate = this.isPresidentofJury();
            break;
          case 'Mentor':
            validate = this.isMentor();
            break;
          case 'Chief Group Academic':
            validate = this.isChiefGroupAcademic();
            break;
        }
        if (validate) {
          return validate;
        }
      }
    }
    return false;
  }

  getUserAllAssignedTitle() {
    const user = this.getCurrentUser();
    const entities = user.entities;
    const titleId = [];

    if (entities && entities.length) {
      entities.forEach((entity) => {
        if (entity.assigned_rncp_title && entity.assigned_rncp_title._id && !titleId.includes(entity.assigned_rncp_title._id)) {
          titleId.push(entity.assigned_rncp_title._id);
        }
      });
    }

    return titleId;
  }

  getAcademicAllAssignedTitle(entities) {
    const titleId = [];

    if (entities && entities.length) {
      entities.forEach((entity) => {
        if (entity.assigned_rncp_title && entity.assigned_rncp_title._id && !titleId.includes(entity.assigned_rncp_title._id)) {
          titleId.push(entity.assigned_rncp_title._id);
        }
      });
    }

    return titleId;
  }

  getAcademicAllAssignedSchool(entities) {
    const schoolId = [];

    if (entities && entities.length) {
      entities.forEach((entity) => {
        if (entity.programs && entity.programs.length) {
          entity.programs.forEach((program) => {
            if (program.school && program.school._id && !schoolId.includes(program.school._id)) {
              schoolId.push(program.school._id);
            }
          });
        }
        // if (entity.school && entity.school._id && !schoolId.includes(entity.school._id)) {
        //   schoolId.push(entity.school._id);
        // }
      });
    }

    return schoolId;
  }

  getUserAllAssignedSchool() {
    const user = this.getCurrentUser();
    const entities = user.entities;
    const schoolId = [];

    if (entities && entities.length) {
      entities.forEach((entity) => {
        if (entity.programs && entity.programs.length) {
          entity.programs.forEach((program) => {
            if (program.school && program.school._id && !schoolId.includes(program.school._id)) {
              schoolId.push(program.school._id);
            }
          });
        }
        // if (entity.school && entity.school._id && !schoolId.includes(entity.school._id)) {
        //   schoolId.push(entity.school._id);
        // }
      });
    }

    return schoolId;
  }

  getUserAllAssignedClass() {
    const user = this.getCurrentUser();
    const entities = user.entities;
    const classId = [];

    if (entities && entities.length) {
      entities.forEach((entity) => {
        if (entity.class && entity.class._id && !classId.includes(entity.class._id)) {
          classId.push(entity.class._id);
        }
      });
    }

    return classId;
  }

  getAcademicAllAssignedClass(entities) {
    const classId = [];

    if (entities && entities.length) {
      entities.forEach((entity) => {
        if (entity.class && entity.class._id && !classId.includes(entity.class._id)) {
          classId.push(entity.class._id);
        }
      });
    }

    return classId;
  }

  getUserAllSchoolAcadDirAdmin() {
    const user = this.getCurrentUser();
    const entities = user.entities.filter((ent) => ent?.type?.name === 'Academic Admin' || ent?.type?.name === 'Academic Director');
    const entityDatas = [];
    const schoolId = [];
    if (entities && entities.length) {
      entities.forEach((entity) => {
        if (entity?.programs && entity?.programs?.length) {
          entity.programs.forEach((program) => {
            if (program?.school && program?.school?._id && !schoolId.includes(program?.school?._id)) {
              schoolId.push(program?.school?._id);
              entityDatas.push(program);
            }
          });
        }
        // if (entity.school && entity.school._id && !schoolId.includes(entity.school._id)) {
        //   schoolId.push(entity.school._id);
        // }
      });
    }

    return entityDatas;
  }

  getUserAllSchoolCerAdmin() {
    const user = this.getCurrentUser();
    const entities = user.entities.filter((ent) => ent.type.name === 'Certifier Admin');
    const schoolId = [];

    if (entities && entities.length) {
      entities.forEach((entity) => {
        if (entity.programs && entity.programs.length) {
          entity.programs.forEach((program) => {
            if (program.school && program.school._id && !schoolId.includes(program.school._id)) {
              schoolId.push(program.school._id);
            }
          });
        }
        // if (entity.school && entity.school._id && !schoolId.includes(entity.school._id)) {
        //   schoolId.push(entity.school._id);
        // }
      });
    }

    return schoolId;
  }

  getAllSchoolFromChiefGroupUser() {
    const user = this.getCurrentUser();
    const entities = user.entities;

    const result = [];
    if (entities && entities.length) {
      let foundEntity;
      for (const entity of entities) {
        if (entity && entity.type && entity.type.name === 'Chief Group Academic') {
          foundEntity = entity;
          console.log('found entity', foundEntity);
        }
      }

      if (foundEntity && foundEntity.group_of_schools && foundEntity.group_of_schools.length) {
        foundEntity.group_of_schools.forEach((school) => {
          if (school && school._id) {
            result.push(school._id);
          }
        });
      }
      if (foundEntity.group_of_school) {
        if (foundEntity.group_of_school.headquarter) {
          result.push(foundEntity.group_of_school.headquarter._id);
        }
        if (foundEntity.group_of_school.school_members && foundEntity.group_of_school.school_members.length) {
          foundEntity.group_of_school.school_members.forEach((school) => {
            result.push(school._id);
          });
        }
      }
    }

    return result;
  }

  getAllSchoolFromCRUser() {
    const user = this.getCurrentUser();
    const entities = user.entities;
    console.log('user', user);
    const result = [];
    if (entities && entities.length) {
      let foundEntity;
      foundEntity = entities.filter((ent) => ent.type.name === 'CR School Director');
      if (foundEntity && foundEntity.length) {
        foundEntity.forEach((en) => {
          if (en.programs && en.programs.length) {
            en.programs.forEach((program) => {
              if (program.school && program.school._id && !result.includes(program.school._id)) {
                result.push(program.school._id);
              }
            });
          }
        });
        console.log('result', result);
        return result;
      }
    }
  }

  getAllTitleFromCRUser() {
    const user = this.getCurrentUser();
    const entities = user.entities;
    console.log('user', user);
    const result = [];
    if (entities && entities.length) {
      let foundEntity;
      foundEntity = entities.filter((ent) => ent.type.name === 'CR School Director');
      if (foundEntity && foundEntity.length) {
        foundEntity.forEach((en) => {
          if (en.school && en.assigned_rncp_title.short_name) {
            result.push(en.assigned_rncp_title.short_name);
          }
        });
        console.log('result', result);
        return result;
      }
    }
  }

  getAllTitleIdFromCRUser() {
    const user = this.getCurrentUser();
    const entities = user.entities;
    console.log('user', user);
    const result = [];
    if (entities && entities.length) {
      let foundEntity;
      foundEntity = entities.filter((ent) => {
        if (this.permissionService.getPermission('CR School Director')) {
          return ent.type.name === 'CR School Director';
        } else if (this.permissionService.getPermission('Certifier Admin')) {
          return ent.type.name === 'Certifier Admin';
        }
      });
      if (foundEntity && foundEntity.length) {
        foundEntity.forEach((en) => {
          if (en.school && en.assigned_rncp_title._id) {
            result.push(en.assigned_rncp_title._id);
          }
        });
        console.log('result', result);
        return result;
      }
    }
  }

  simpleDiacriticSensitiveRegex(text: string): string {
    if (text) {
      return text
        .replace(/[a,á,à,ä]/g, 'a')
        .replace(/[e,é,ë,è]/g, 'e')
        .replace(/[i,í,ï,Î,î]/g, 'i')
        .replace(/[o,ó,ö,ò,ô]/g, 'o')
        .replace(/[u,ü,ú,ù]/g, 'u')
        .replace(/[c,ç,ć,ĉ,č,¢]/g, 'c')
        .replace(/[ ,-]/g, ' ')
        .replace(/[',’]/g, '’');
    } else {
      return '';
    }
  }

  mergeHierarchyPermissionByLodash(entities) {
    if (entities && entities.length) {
      let permMerged = _.cloneDeep(entities[0].type.usertype_permission_id);
      entities.forEach((item) => {
        permMerged = _.merge(permMerged, item);
      });
      entities.forEach((item, idx) => {
        entities[idx].type.usertype_permission_id = permMerged;
      });
      console.log('mergeHierarchyPermission', entities);
    }
    return entities;
  }
  mergeChildPermission(parent, obj): any {
    const perm = _.cloneDeep(parent);
    if (perm) {
      for (const [key, value] of Object.entries(perm)) {
        if (Boolean(value) && typeof value === 'object') {
          if ((Boolean(value) && !obj && !obj[key]) || (Boolean(value) && obj[key] !== value)) {
            obj[key] = this.mergeChildPermission(value, obj[key]);
          } else if (obj[key] !== value) {
            obj[key] = this.mergeChildPermission(value, obj[key]);
          }
        } else if (Boolean(value)) {
          if (obj !== null && (!obj || !obj[key] || obj[key] !== value)) {
            obj[key] = value;
          } else if (obj !== null && obj[key] !== value) {
            obj[key] = value;
          }
        }
      }
    }
    return obj;
  }
  mergeHierarchyPermission(entities, from?) {
    // *************** need to filter the entity first, to prevent the null value of usertype_permission_id (Related to RA_EDH_0026)
    // *************** need to check the 'from' param when data comes from quickSearch or anywhere that doesn't have usertype_permission_id to prevent data from being filtered based on usertype_permission_id (Related to INT_009)
    const tempEntities = from ? entities : entities?.filter((entity) => entity?.type?.usertype_permission_id);
    if (tempEntities && tempEntities.length) {
      const obj = _.cloneDeep(tempEntities[0].type.usertype_permission_id);
      tempEntities.forEach((item, indx) => {
        if (indx !== 0) {
          if (item && item.type && item.type.usertype_permission_id) {
            const perm = _.cloneDeep(item.type.usertype_permission_id);
            for (const [key, value] of Object.entries(perm)) {
              if (Boolean(value) && typeof value === 'object') {
                if (!obj[key] || obj[key] !== value) {
                  obj[key] = this.mergeChildPermission(value, obj[key]);
                } else if (obj[key] !== value) {
                  obj[key] = this.mergeChildPermission(value, obj[key]);
                }
              } else if (Boolean(value)) {
                if (!obj[key] || obj[key] !== value) {
                  obj[key] = value;
                } else if (obj[key]) {
                  obj[key] = value;
                }
              }
            }
          }
        }
      });
      /*       console.log('mergeHierarchyPermission', obj); */
      tempEntities.forEach((item, idx) => {
        tempEntities[idx].type.usertype_permission_id = obj;
      });
    }
    return tempEntities;
  }

  disregardSpace(text: string): string {
    if (text) {
      return text.replace(/\s/g, '');
    } else {
      return '';
    }
  }

  simplifyRegex(text: string): string {
    if (text) {
      return this.simpleDiacriticSensitiveRegex(this.disregardSpace(text.trim().toLowerCase()));
    } else {
      return '';
    }
  }

  cleanHTML(text: string) {
    if (text) {
      let result = '';
      result = text.replace(/<[^>]*>/g, '').replace(/\&nbsp;/g, ' ');
      result = _.unescape(result);
      return result;
    } else {
      return '';
    }
  }

  isUrlFormat(text: string) {
    const pattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i',
    ); // fragment locator
    // console.log('input url check', !!pattern.test(text));
    return !!pattern.test(text);
  }
  isUrl(text: string) {
    const pattern =
      /([a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
    const regex = new RegExp(pattern);
    return !!regex.test(text);
  }

  countFileSize(file: File, maxSize: number) {
    console.log(file);
    if (file && file.size && maxSize) {
      const inMb = file.size / 1024 / 1024;
      return inMb < maxSize;
    } else if (maxSize === 0) {
      return true;
    } else {
      return false;
    }
  }

  getFileExtension(fileName: string) {
    if (fileName) {
      return fileName.split('.').pop();
    } else {
      return '';
    }
  }

  getFileTypeFromExtension(extension: string) {
    // doc and presentation
    const docper = ['doc', 'docx', 'ppt', 'pptx', 'txt', 'pdf', 'xlsx', 'xls'];
    const img = [
      'tiff',
      'pjp',
      'jfif',
      'gif',
      'svg',
      'bmp',
      'png',
      'jpeg',
      'svgz',
      'jpg',
      'webp',
      'ico',
      'xbm',
      'dib',
      'tif',
      'pjpeg',
      'avif',
    ];
    const vid = ['ogm', 'wmv', 'mpg', 'webm', 'ogv', 'mov', 'asx', 'mpeg', 'mp4', 'm4v', 'avi'];
    if (extension) {
      if (docper.includes(extension)) {
        return 'docper';
      } else if (img.includes(extension)) {
        return 'image';
      } else if (vid.includes(extension)) {
        return 'video';
      }
    }
  }

  getInitials(firstName: string, lastName: string) {
    const tempFirst = firstName ? firstName : '';
    const tempLast = lastName ? lastName : '';
    return tempFirst.charAt(0) + tempLast.charAt(0);
  }

  checkIfStringMongoDBID(stringInput: string) {
    const checkValidObjectId = new RegExp('^[0-9a-fA-F]{24}$');
    return stringInput.match(checkValidObjectId);
  }

  isValidURL(str: string): boolean {
    const pattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i',
    ); // fragment locator
    return !!pattern.test(str);
  }

  getIndustryList() {
    return this.industryList;
  }

  isUserLoginPCStaff() {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const entities = currentUser.entities;
      let isPCStaff = false;
      if (entities && entities[0] && entities[0].entity_name === 'academic' && entities[0].school_type === 'preparation_center') {
        isPCStaff = true;
      }
      return isPCStaff;
    }
  }
  setDataProgram(entities) {
    let school = [];
    let campus = [];
    let level = [];
    let user_type = [];
    let user_type_id = [];
    let school_package = [];
    const isThereOperator = entities.find((list) => this.listEntitiesNonProgram.includes(list.entity_name));
    school_package = this.setSchoolPackage(entities);
    if (entities && entities.length) {
      entities.forEach((entity) => {
        if (entity.programs && entity.programs.length) {
          entity.programs.forEach((program) => {
            if (program.school) {
              school.push(program.school);
            }
            if (program.campus) {
              campus.push(program.campus);
            }
            if (program.level) {
              level.push(program.level);
            }
          });
        }
        if (entity.type && entity.type._id) {
          user_type.push(entity.type);
          user_type_id.push(entity.type._id);
        }
      });
      school = _.uniqBy(school, '_id');
      campus = _.uniqBy(campus, '_id');
      level = _.uniqBy(level, '_id');
      if (isThereOperator) {
        school = [];
        campus = [];
        level = [];
        school_package = [];
      }
      user_type = _.uniqBy(user_type, '_id');
      user_type_id = _.uniqBy(user_type_id);
    }
    return {
      school,
      campus,
      level,
      school_package,
      user_type,
      user_type_id,
    };
  }
  setSchoolPackage(entities) {
    const data = [];
    if (entities && entities.length) {
      entities.forEach((entity) => {
        if (entity.programs && entity.programs.length) {
          entity.programs.forEach((program) => {
            if (data && !data.length) {
              const campus = [];
              const level = [];
              if (program.school) {
                if (program.campus) {
                  if (program.level) {
                    level.push(program.level);
                  }
                  campus.push({ ...program.campus, levels: level });
                }
                const temp = {
                  ...program.school,
                  campuses: campus,
                };
                data.push({ school: temp });
              }
            } else if (data && data.length) {
              if (program.school) {
                const findSchool = data.findIndex((dat) => dat.school && dat.school._id === program.school._id);
                if (findSchool >= 0 && program.campus && data[findSchool] && data[findSchool].school && data[findSchool].school.campuses) {
                  if (data[findSchool].school.campuses.length) {
                    const findCampus = data[findSchool].school.campuses.findIndex((camp) => camp._id === program.campus._id);
                    if (
                      findCampus >= 0 &&
                      program.level &&
                      data[findSchool].school.campuses[findCampus] &&
                      data[findSchool].school.campuses[findCampus].levels
                    ) {
                      if (data[findSchool].school.campuses[findCampus].levels.length) {
                        const findLevel = data[findSchool].school.campuses[findCampus].levels.findIndex(
                          (lvl) => lvl._id === program.level._id,
                        );
                        if (findLevel < 0) {
                          data[findSchool].school.campuses[findCampus].levels.push(program.level);
                        }
                      } else {
                        data[findSchool].school.campuses[findCampus].levels.push(program.level);
                      }
                    } else if (findCampus < 0) {
                      const level = [];
                      if (program.level) {
                        level.push(program.level);
                      }
                      data[findSchool].school.campuses.push({ ...program.campus, levels: level });
                    }
                  } else {
                    const level = [];
                    if (program.level) {
                      level.push(program.level);
                    }
                    data[findSchool].school.campuses.push({ ...program.campus, levels: level });
                  }
                } else if (findSchool < 0) {
                  const campus = [];
                  const level = [];
                  if (program.campus) {
                    if (program.level) {
                      level.push(program.level);
                    }
                    campus.push({ ...program.campus, levels: level });
                  }
                  const temp = {
                    ...program.school,
                    campuses: campus,
                  };
                  data.push({ school: temp });
                }
              }
            }
          });
        }
      });
    }
    return data;
  }

  sortEntitiesByHierarchy(entities) {
    let sortedEntities = [];
    let sortedUserTypes = [];
    for (const list of this.listHierarchyEntity) {
      sortedEntities = entities?.filter((ent) => ent?.entity_name?.toLowerCase() === list);
      if (sortedEntities && sortedEntities?.length) {
        break;
      }
    }
    if (sortedEntities && sortedEntities?.length > 1) {
      for (const key of Object.keys(this.listHierarchyUserType)) {
        if (sortedEntities[0]?.entity_name && sortedEntities[0]?.entity_name?.toLowerCase() === key) {
          for (const list of this.listHierarchyUserType[key]) {
            sortedUserTypes = sortedEntities?.filter((ent) => ent?.type?.name === list);
            if (sortedUserTypes && sortedUserTypes.length) {
              break;
            }
          }
        }
      }
    } else {
      sortedUserTypes = sortedEntities;
    }
    return sortedUserTypes;
  }

  decodeHTMLEntities(str) {
    if (str && typeof str === 'string') {
      // strip script/html tags
      str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gim, '');
      str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gim, '');
    }

    return str;
  }

  checkIfCandidateSelectNotNull(select, menu) {
    if (select < 1) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant(menu) }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
      return true;
    }
    return false;
  }
  checkArrayType(arrayList) {
    // Check the type of the first element
    let arrayType = '';
    const firstElementType = typeof arrayList[0];

    if (firstElementType === 'string') {
      // Check if all elements are strings
      for (let i = 1; i < arrayList.length; i++) {
        if (typeof arrayList[i] !== 'string') {
          arrayType = '';
        }
      }
      arrayType = 'string';
    }

    if (firstElementType === 'object') {
      // Check if all elements are objects
      for (let i = 1; i < arrayList.length; i++) {
        if (typeof arrayList[i] !== 'object') {
          arrayType = '';
        }
      }
      arrayType = 'object';
    }
    return arrayType;
  }

  constructStudentName(student) {
    const studentNames = [];
    if (student?.last_name) {
      studentNames.push(String(student.last_name).toUpperCase());
    }
    if (student?.first_name) {
      studentNames.push(String(student.first_name));
    }
    if (student?.civility) {
      studentNames.push(this.translate.instant(student.civility));
    }
    return studentNames.join(' ');
  }

  constructUserName(user: UserProfileData, order: ('civ' | 'first' | 'last')[]) {
    return order
      .map((value) => {
        if (value === 'civ' && user?.civility && user.civility !== 'neutral') {
          return this.translate.instant(user.civility);
        }
        if (value === 'first' && typeof user?.first_name === 'string') {
          return user.first_name;
        }
        if (value === 'last' && typeof user?.last_name === 'string') {
          return user.last_name.toLocaleUpperCase();
        }
      })
      .filter(Boolean)
      .join(' ');
  }

  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      const [, r, g, b] = result;
      return {
        r: parseInt(r, 16),
        g: parseInt(g, 16),
        b: parseInt(b, 16),
      };
    }
    return null;
  }
}
