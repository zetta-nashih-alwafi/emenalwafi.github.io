"use strict";(self.webpackChunkGene=self.webpackChunkGene||[]).push([[4041],{54041:(g,_,i)=>{i.d(_,{z:()=>p});var a=i(13125),u=i(24850),o=i(94650),l=i(80529),d=i(18497);let p=(()=>{class s{constructor(e,t){this.httpClient=e,this.apollo=t,this._childrenFormValidationStatus=!0}get childrenFormValidationStatus(){return this._childrenFormValidationStatus}set childrenFormValidationStatus(e){this._childrenFormValidationStatus=e}getTypesOfSequence(){return["enseignement","period_in_company","school_exchange"]}GetAllTemplateCourseSequence(e,t,n){return this.apollo.watchQuery({query:a.ZP`
          query GetAllTemplateCourseSequence(
            $pagination: PaginationInput
            $filter: TemplateCourseSequenceFilterInput
            $sort: TemplateCourseSequenceSortingInput
          ) {
            GetAllTemplateCourseSequence(pagination: $pagination, filter: $filter, sorting: $sort) {
              _id
              name
              template_sequences_id {
                _id
                name
              }
              description
              created_date {
                date
                time
              }
              updated_date {
                date
                time
              }
              created_by {
                _id
                first_name
                last_name
                civility
                email
              }
              updated_by {
                _id
                first_name
                last_name
                civility
                email
              }
              is_published
              count_document
            }
          }
        `,variables:{pagination:e,filter:t,sort:n||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,u.U)(r=>r.data.GetAllTemplateCourseSequence))}getAllIdTemplateCourseSequenceCheckbox(e,t,n){return this.apollo.query({query:a.ZP`
          query GetAllTemplateCourseSequence(
            $pagination: PaginationInput
            $filter: TemplateCourseSequenceFilterInput
            $sort: TemplateCourseSequenceSortingInput
          ) {
            GetAllTemplateCourseSequence(pagination: $pagination, filter: $filter, sorting: $sort) {
              _id
            }
          }
        `,variables:{pagination:e,filter:t,sort:n||{}},fetchPolicy:"network-only"}).pipe((0,u.U)(r=>r.data.GetAllTemplateCourseSequence))}GetAllTemplateCourseSequenceDropdown(e){return this.apollo.watchQuery({query:a.ZP`
          query GetAllTemplateCourseSequence($filter: TemplateCourseSequenceFilterInput) {
            GetAllTemplateCourseSequence(filter: $filter) {
              _id
              name
              template_sequences_id {
                _id
                name
                description
                start_date {
                  date
                  time
                }
                end_date {
                  date
                  time
                }
                number_of_week
                status
                sequence_id
                type_of_sequence
                template_modules_id {
                  _id
                  name
                  short_name
                  english_name
                  ects
                  module_id
                  template_sequence_id
                  template_subjects_id {
                    _id
                    name
                    short_name
                    english_name
                    subject_id {
                      _id
                      name
                    }
                    template_sessions_id {
                      _id
                      name
                      volume_hours_student
                      duration
                      class_group
                      volume_hours
                      template_subject_id
                    }
                    volume_student_total
                    volume_hours_total
                    academic_objective
                    note
                    ects
                  }
                }
              }
              description
              created_date {
                date
                time
              }
              updated_date {
                date
                time
              }
              created_by {
                _id
                first_name
                last_name
                civility
                email
              }
              updated_by {
                _id
                first_name
                last_name
                civility
                email
              }
              is_published
            }
          }
        `,variables:{filter:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,u.U)(t=>t.data.GetAllTemplateCourseSequence))}GetOneTemplateCourseSequence(e){return this.apollo.watchQuery({query:a.ZP`
          query GetOneTemplateCourseSequence($_id: ID!) {
            GetOneTemplateCourseSequence(_id: $_id) {
              _id
              name
              template_sequences_id {
                _id
                name
              }
              description
              created_date {
                date
                time
              }
              updated_date {
                date
                time
              }
              created_by {
                _id
                first_name
                last_name
                civility
                email
              }
              updated_by {
                _id
                first_name
                last_name
                civility
                email
              }
              is_published
            }
          }
        `,variables:{_id:e}}).valueChanges.pipe((0,u.U)(t=>t.data.GetOneTemplateCourseSequence))}GetOneTemplateDetailFull(e){return this.apollo.watchQuery({query:a.ZP`
          query GetOneTemplateCourseSequence($_id: ID!) {
            GetOneTemplateCourseSequence(_id: $_id) {
              _id
              name
              template_sequences_id {
                _id
                name
                description
                start_date {
                  date
                  time
                }
                end_date {
                  date
                  time
                }
                number_of_week
                status
                sequence_id
                type_of_sequence
                template_modules_id {
                  _id
                  name
                  short_name
                  english_name
                  ects
                  module_id
                  template_sequence_id
                  template_subjects_id {
                    _id
                    name
                    short_name
                    english_name
                    subject_id {
                      _id
                    }
                    template_sessions_id {
                      _id
                      name
                      volume_hours_student
                      duration
                      class_group
                      volume_hours
                      template_subject_id
                    }
                    volume_student_total
                    volume_hours_total
                    academic_objective
                    note
                    ects
                  }
                }
              }
              description
              created_date {
                date
                time
              }
              updated_date {
                date
                time
              }
              created_by {
                _id
                first_name
                last_name
                civility
                email
              }
              updated_by {
                _id
                first_name
                last_name
                civility
                email
              }
              is_published
            }
          }
        `,variables:{_id:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,u.U)(t=>t.data.GetOneTemplateCourseSequence))}GetAllUserCreateTemplateDropdown(){return this.apollo.watchQuery({query:a.ZP`
          query GetAllUserCreateTemplateDropdown{
            GetAllUserCreateTemplateDropdown {
              _id
              first_name
              last_name
              civility
              email
            }
          }
        `}).valueChanges.pipe((0,u.U)(e=>e.data.GetAllUserCreateTemplateDropdown))}GetAllUserUpdateTemplateDropdown(){return this.apollo.watchQuery({query:a.ZP`
          query GetAllUserUpdateTemplateDropdown{
            GetAllUserUpdateTemplateDropdown {
              _id
              first_name
              last_name
              civility
              email
            }
          }
        `}).valueChanges.pipe((0,u.U)(e=>e.data.GetAllUserUpdateTemplateDropdown))}DeleteTemplateCourseSequence(e){return this.apollo.mutate({mutation:a.ZP`
          mutation DeleteTemplateCourseSequence($_id: ID!) {
            DeleteTemplateCourseSequence(_id: $_id) {
              name
            }
          }
        `,variables:{_id:e}}).pipe((0,u.U)(t=>t.data.DeleteTemplateCourseSequence))}CreateTemplateCourseSequence(e){return this.apollo.mutate({mutation:a.ZP`
          mutation CreateTemplateCourseSequence($course_sequence_input: TemplateCourseSequenceInput!) {
            CreateTemplateCourseSequence(course_sequence_input: $course_sequence_input) {
              name
            }
          }
        `,variables:{course_sequence_input:e}}).pipe((0,u.U)(t=>t.data.CreateTemplateCourseSequence))}UpdateTemplateCourseSequence(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateTemplateCourseSequence($course_sequence_input: TemplateCourseSequenceInput!, $_id: ID!) {
            UpdateTemplateCourseSequence(course_sequence_input: $course_sequence_input, _id: $_id) {
              name
            }
          }
        `,variables:{_id:t,course_sequence_input:e}}).pipe((0,u.U)(n=>n.data.UpdateTemplateCourseSequence))}CreateUpdateTemplateCourseAndSequence(e){return this.apollo.mutate({mutation:a.ZP`
          mutation CreateUpdateTemplateCourseAndSequence(
            $create_update_course_sequence_input: CreateUpdateTemplateCourseAndSequenceInput!
          ) {
            CreateUpdateTemplateCourseAndSequence(create_update_course_sequence_input: $create_update_course_sequence_input) {
              name
              _id
            }
          }
        `,variables:{create_update_course_sequence_input:e}}).pipe((0,u.U)(t=>t.data.CreateUpdateTemplateCourseAndSequence))}CreateUpdateProgramCourseAndSequence(e){return this.apollo.mutate({mutation:a.ZP`
          mutation CreateUpdateProgramCourseAndSequence($create_update_program_course_sequence: CreateUpdateProgramCourseSequenceInput!) {
            CreateUpdateProgramCourseAndSequence(create_update_program_course_sequence: $create_update_program_course_sequence) {
              name
              _id
              template_course_sequence_id
            }
          }
        `,variables:{create_update_program_course_sequence:e}}).pipe((0,u.U)(t=>t.data.CreateUpdateProgramCourseAndSequence))}DuplicateTemplateCourseSequence(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation DuplicateTemplateCourseSequence($template_course_sequence_id: ID!, $name: String!) {
            DuplicateTemplateCourseSequence(template_course_sequence_id: $template_course_sequence_id, name: $name) {
              name
            }
          }
        `,variables:{template_course_sequence_id:e,name:t}}).pipe((0,u.U)(n=>n.data.DuplicateTemplateCourseSequence))}getAllSequence(e,t,n,r){return this.apollo.query({query:a.ZP`
          query GetAllSequence($pagination: PaginationInput, $filter: SequenceFilterInput, $sort: SequenceSortingInput, $lang: String) {
            GetAllSequence(pagination: $pagination, filter: $filter, sorting: $sort, lang: $lang) {
              _id
              name
              description
              type_of_sequence
              start_date {
                date
                time
              }
              end_date {
                date
                time
              }
              number_of_week
              status
              count_document
            }
          }
        `,variables:{pagination:e,filter:t,sort:n||{},lang:r},fetchPolicy:"network-only"}).pipe((0,u.U)(m=>m.data.GetAllSequence))}getAllIdSequenceForExport(e,t,n){return this.apollo.query({query:a.ZP`
          query GetAllSequence($pagination: PaginationInput, $filter: SequenceFilterInput, $sort: SequenceSortingInput) {
            GetAllSequence(pagination: $pagination, filter: $filter, sorting: $sort) {
              _id
            }
          }
        `,variables:{pagination:e,filter:t,sort:n||{}},fetchPolicy:"network-only"}).pipe((0,u.U)(r=>r.data.GetAllSequence))}getAllSequenceDropdown(){return this.apollo.query({query:a.ZP`
          query GetAllSequence{
            GetAllSequence {
              _id
              name
              description
              type_of_sequence
              number_of_week
              status
              start_date {
                date
                time
              }
              end_date {
                date
                time
              }
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,u.U)(e=>e.data.GetAllSequence))}getAllSequenceId(e){return this.apollo.query({query:a.ZP`
          query GetAllSequenceID($filter: SequenceFilterInput) {
            GetAllSequence(pagination: null, filter: $filter) {
              _id
            }
          }
        `,variables:{filter:e},fetchPolicy:"network-only"}).pipe((0,u.U)(t=>t.data.GetAllSequence))}createSequence(e){return this.apollo.mutate({mutation:a.ZP`
          mutation CreateSequence($input: SequenceInput) {
            CreateSequence(sequence_input: $input) {
              _id
              name
              description
              type_of_sequence
              number_of_week
              status
              start_date {
                date
                time
              }
              end_date {
                date
                time
              }
            }
          }
        `,variables:{input:e}}).pipe((0,u.U)(t=>t.data.CreateSequence))}updateSequence(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateSequence($id: ID!, $input: SequenceInput) {
            UpdateSequence(_id: $id, sequence_input: $input) {
              _id
              name
              description
              type_of_sequence
              number_of_week
              status
              start_date {
                date
                time
              }
              end_date {
                date
                time
              }
            }
          }
        `,variables:{id:e,input:t}}).pipe((0,u.U)(n=>n.data.CreateSequence))}deleteSequence(e){return this.apollo.mutate({mutation:a.ZP`
          mutation DeleteSequence($_id: ID!) {
            DeleteSequence(_id: $_id) {
              _id
            }
          }
        `,variables:{_id:e}}).pipe((0,u.U)(t=>t.data.DeleteSequence))}getAllModule(e,t,n){return this.apollo.query({query:a.ZP`
          query GetAllModules($pagination: PaginationInput, $filter: ModuleFilterInput, $sorting: ModuleSortingInput) {
            GetAllModules(pagination: $pagination, filter: $filter, sorting: $sorting) {
              _id
              name
              short_name
              english_name
              count_document
            }
          }
        `,variables:{pagination:e,filter:t,sorting:n||{}},fetchPolicy:"network-only"}).pipe((0,u.U)(r=>r.data.GetAllModules))}getAllModulesIdForCheckbox(e,t,n){return this.apollo.query({query:a.ZP`
          query GetAllModules($pagination: PaginationInput, $filter: ModuleFilterInput, $sorting: ModuleSortingInput) {
            GetAllModules(pagination: $pagination, filter: $filter, sorting: $sorting) {
              _id
            }
          }
        `,variables:{pagination:e,filter:t,sorting:n||{}},fetchPolicy:"network-only"}).pipe((0,u.U)(r=>r.data.GetAllModules))}getAllModuleDropdown(){return this.apollo.query({query:a.ZP`
          query GetAllModules{
            GetAllModules {
              _id
              name
              short_name
              english_name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,u.U)(e=>e.data.GetAllModules))}DeleteModule(e){return this.apollo.mutate({mutation:a.ZP`
          mutation DeleteModule($_id: ID!) {
            DeleteModule(_id: $_id) {
              _id
            }
          }
        `,variables:{_id:e}}).pipe((0,u.U)(t=>t.data.DeleteModule))}CreateModule(e){return this.apollo.mutate({mutation:a.ZP`
          mutation CreateModule($module_input: ModuleInput!) {
            CreateModule(module_input: $module_input) {
              _id
              name
              short_name
              english_name
              count_document
            }
          }
        `,variables:{module_input:e}}).pipe((0,u.U)(t=>t.data.CreateModule))}UpdateModule(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateModule($_id: ID!, $module_input: ModuleInput!) {
            UpdateModule(_id: $_id, module_input: $module_input) {
              _id
            }
          }
        `,variables:{_id:e,module_input:t}}).pipe((0,u.U)(n=>n.data.UpdateModule))}createGroupClassType(e){return this.apollo.mutate({mutation:a.ZP`
          mutation CreateGroupClassType($input: GroupClassTypeInput!) {
            CreateGroupClassType(group_class_type_input: $input) {
              _id
            }
          }
        `,variables:{input:e},fetchPolicy:"network-only"}).pipe((0,u.U)(t=>t.CreateGroupClassType))}getAllCourseSubject(e,t,n){return this.apollo.query({query:a.ZP`
          query GetAllCourseSubject($pagination: PaginationInput, $filter: CourseSubjectFilterInput, $sorting: CourseSubjectSortingInput) {
            GetAllCourseSubject(pagination: $pagination, filter: $filter, sorting: $sorting) {
              _id
              name
              short_name
              english_name
              count_document
            }
          }
        `,variables:{filter:t,pagination:e,sorting:n||{}},fetchPolicy:"network-only"}).pipe((0,u.U)(r=>r.data.GetAllCourseSubject))}getAllCourseSubjectIds(e,t,n){return this.apollo.query({query:a.ZP`
          query GetAllCourseSubject($pagination: PaginationInput, $filter: CourseSubjectFilterInput, $sorting: CourseSubjectSortingInput) {
            GetAllCourseSubject(pagination: $pagination, filter: $filter, sorting: $sorting) {
              _id
            }
          }
        `,variables:{filter:t,pagination:e,sorting:n||{}},fetchPolicy:"network-only"}).pipe((0,u.U)(r=>r.data.GetAllCourseSubject))}getAllCourseSubjectDropdown(){return this.apollo.query({query:a.ZP`
          query GetAllCourseSubject{
            GetAllCourseSubject {
              _id
              name
              short_name
              english_name
              count_document
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,u.U)(e=>e.data.GetAllCourseSubject))}deleteCourseSubject(e){return this.apollo.mutate({mutation:a.ZP`
          mutation DeleteCourseSubject($_id: ID!) {
            DeleteCourseSubject(_id: $_id) {
              _id
            }
          }
        `,variables:{_id:e}}).pipe((0,u.U)(t=>t.data.DeleteCourseSubject))}CreateCourseSubject(e){return this.apollo.mutate({mutation:a.ZP`
          mutation CreateCourseSubject($course_subject_input: CourseSubjectInput) {
            CreateCourseSubject(course_subject_input: $course_subject_input) {
              _id
              name
              short_name
              english_name
              count_document
            }
          }
        `,variables:{course_subject_input:e}}).pipe((0,u.U)(t=>t.data.CreateCourseSubject))}sendProgramsToHyperplanning(e){return this.apollo.mutate({mutation:a.ZP`
          mutation SendProgramsToHyperplanning($program_ids: [ID]) {
            SendProgramsToHyperplanning(program_ids: $program_ids) {
              _id
              program
            }
          }
        `,variables:{program_ids:e}}).pipe((0,u.U)(t=>t.data.SendProgramsToHyperplanning))}UpdateCourseSubject(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation UpdateCourseSubject($_id: ID!, $course_subject_input: CourseSubjectInput) {
            UpdateCourseSubject(_id: $_id, course_subject_input: $course_subject_input) {
              _id
            }
          }
        `,variables:{_id:e,course_subject_input:t}}).pipe((0,u.U)(n=>n.data.UpdateCourseSubject))}getAllProgram(e,t,n){return this.apollo.query({query:a.ZP`
          query GetAllPrograms($pagination: PaginationInput, $filter: ProgramFilterInput, $user_type_logins: [ID]) {
            GetAllPrograms(pagination: $pagination, filter: $filter, user_type_logins: $user_type_logins) {
              _id
              program
              is_hyperplanning_updated
              scholar_season_id {
                _id
                scholar_season
              }
              school_id {
                _id
                short_name
              }
              campus {
                _id
                name
              }
              level {
                _id
                name
              }
              sector_id {
                _id
                name
              }
              speciality_id {
                _id
                name
              }
              course_sequence_id {
                _id
                name
                created_by {
                  _id
                  civility
                  first_name
                  last_name
                }
                updated_by {
                  _id
                  civility
                  first_name
                  last_name
                }
                updated_date {
                  date
                  time
                }
                program_sequences_id {
                  template_sequence_id {
                    _id
                    name
                  }
                }
              }
              count_document
            }
          }
        `,variables:{filter:t,pagination:e,user_type_logins:n},fetchPolicy:"network-only"}).pipe((0,u.U)(r=>r.data.GetAllPrograms))}getHyperplanningLatestStatus(e,t){return this.apollo.query({query:a.ZP`
          query GetHyperplanningLatestStatus($school_id: ID!, $scholar_season_id: ID!) {
            GetHyperplanningLatestStatus(school_id: $school_id, scholar_season_id: $scholar_season_id) {
              _id
              is_hyperplanning_updated
              latest_hyperplanning_updated {
                date
                time
              }
            }
          }
        `,variables:{school_id:e,scholar_season_id:t},fetchPolicy:"network-only"}).pipe((0,u.U)(n=>n.data.GetHyperplanningLatestStatus))}GetOneProgramCourseSequence(e){return this.apollo.watchQuery({query:a.ZP`
          query GetOneProgramCourseSequence($_id: ID!) {
            GetOneProgramCourseSequence(_id: $_id) {
              _id
              name
              template_course_sequence_id
              program_sequences_id {
                _id
                name
                description
                sequence_id
                program_sequence_groups {
                  _id
                  name
                  program_sequence_id {
                    _id
                  }
                  number_of_class
                  number_of_student_each_class
                  student_classes {
                    _id
                    name
                    program_sequence_id {
                      _id
                    }
                    students_id {
                      _id
                    }
                  }
                  group_class_types {
                    _id
                    name
                    group_classes_id {
                      name
                      student_classes_id {
                        _id
                        name
                      }
                      program_sequence_id {
                        _id
                      }
                    }
                  }
                }
                type_of_sequence
                start_date {
                  date
                  time
                }
                end_date {
                  date
                  time
                }
                number_of_week
                status
                template_sequence_id {
                  _id
                }
                program_modules_id {
                  _id
                  name
                  short_name
                  english_name
                  ects
                  module_id
                  template_module_id {
                    _id
                  }
                  program_sequence_id {
                    _id
                  }
                  program_subjects_id {
                    _id
                    name
                    short_name
                    english_name
                    note
                    ects
                    template_subject_id {
                      _id
                      volume_student_total
                      volume_hours_total
                      subject_id {
                        _id
                      }
                    }
                    volume_student_total
                    volume_hours_total
                    academic_objective
                    program_sessions_id {
                      _id
                      name
                      volume_hours_student
                      duration
                      class_group
                      volume_hours
                      program_subject_id {
                        _id
                      }
                      template_session_id
                      is_teacher_assigned
                    }
                  }
                }
                number_of_class
                number_of_student_each_class
                student_classes {
                  _id
                  name
                }
              }
              description
              created_date {
                date
                time
              }
              updated_date {
                date
                time
              }
              created_by {
                _id
                first_name
                last_name
                civility
                email
              }
              updated_by {
                _id
                first_name
                last_name
                civility
                email
              }
              is_published
              programs_id {
                _id
                program
              }
            }
          }
        `,variables:{_id:e}}).valueChanges.pipe((0,u.U)(t=>t.data.GetOneProgramCourseSequence))}getOneProgram(e){return this.apollo.watchQuery({query:a.ZP`
          query GetOneProgramCourseSequence($_id: ID!) {
            GetOneProgramCourseSequence(_id: $_id) {
              _id
              name
              program_sequences_id {
                _id
                name
                description
                type_of_sequence
                number_of_class
                number_of_student_each_class
                student_classes {
                  _id
                  name
                }
                group_classes {
                  name
                  student_classes_id {
                    _id
                    name
                  }
                }
              }
            }
          }
        `,variables:{_id:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,u.U)(t=>t.data.GetOneProgramCourseSequence))}GetOneProgramCourseSequenceTab(e){return this.apollo.query({query:a.ZP`
          query GetOneProgramCourseSequence($_id: ID!) {
            GetOneProgramCourseSequence(_id: $_id) {
              _id
              name
              template_course_sequence_id
              program_sequences_id {
                _id
                name
                description
                sequence_id
                program_sequence_groups {
                  _id
                  name
                  program_sequence_id {
                    _id
                  }
                  number_of_class
                  number_of_student_each_class
                  student_classes {
                    _id
                    name
                    program_sequence_id {
                      _id
                    }
                    students_id {
                      _id
                      first_name
                      civility
                      last_name
                    }
                  }
                  group_class_types {
                    _id
                    name
                    group_classes_id {
                      _id
                      name
                      student_classes_id {
                        _id
                        name
                      }
                      program_sequence_id {
                        _id
                      }
                      group_class_type_id
                    }
                  }
                }
                type_of_sequence
                start_date {
                  date
                  time
                }
                end_date {
                  date
                  time
                }
                number_of_week
                status
                template_sequence_id {
                  _id
                }
                program_modules_id {
                  _id
                  name
                  short_name
                  english_name
                  ects
                  module_id
                  template_module_id {
                    _id
                  }
                  program_sequence_id {
                    _id
                  }
                  program_subjects_id {
                    _id
                    name
                    short_name
                    english_name
                    note
                    ects
                    template_subject_id {
                      _id
                      subject_id {
                        _id
                      }
                    }
                    volume_student_total
                    volume_hours_total
                    academic_objective
                    program_sessions_id {
                      _id
                      name
                      volume_hours_student
                      duration
                      class_group
                      volume_hours
                      program_subject_id {
                        _id
                      }
                      template_session_id
                      is_teacher_assigned
                    }
                  }
                }
                number_of_class
                number_of_student_each_class
                student_classes {
                  _id
                  name
                  students_id {
                    _id
                    first_name
                    civility
                    last_name
                  }
                }
              }
              description
              created_date {
                date
                time
              }
              updated_date {
                date
                time
              }
              created_by {
                _id
                first_name
                last_name
                civility
                email
              }
              updated_by {
                _id
                first_name
                last_name
                civility
                email
              }
              is_published
              programs_id {
                _id
                program
              }
            }
          }
        `,variables:{_id:e},fetchPolicy:"network-only"}).pipe((0,u.U)(t=>t.data.GetOneProgramCourseSequence))}getAllStudentClasses(e){return this.apollo.query({query:a.ZP`
          query GetAllStudentClasses {
            GetAllStudentClasses(filter: {program_sequence_id: "${e}"}) {
              _id
              name
              program_sequence_id{
                _id
                name
                number_of_class
                number_of_student_each_class
              }
              students_id{
                _id
                last_name
                first_name
                civility
              }
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,u.U)(t=>t.data.GetAllStudentClasses))}CreateUpdateStudentClasses(e){return this.apollo.mutate({mutation:a.ZP`
          mutation CreateUpdateStudentClasses(
            $program_sequence_group_id: ID!
            $program_sequence_id: ID!
            $number_of_class: Int
            $number_of_student_each_class: Int
            $student_classes: [StudentClassesInput]
          ) {
            CreateUpdateStudentClasses(
              program_sequence_group_id: $program_sequence_group_id
              program_sequence_id: $program_sequence_id
              number_of_class: $number_of_class
              number_of_student_each_class: $number_of_student_each_class
              student_classes: $student_classes
            ) {
              _id
            }
          }
        `,variables:{program_sequence_group_id:e.program_sequence_group_id,program_sequence_id:e.program_sequence_id,number_of_class:e.number_of_class,number_of_student_each_class:e.number_of_student_each_class,student_classes:e.student_classes}}).pipe((0,u.U)(t=>t.data.CreateUpdateStudentClasses))}CreateProgramSequenceGroup(e,t){return this.apollo.mutate({mutation:a.ZP`
          mutation CreateProgramSequenceGroup($program_sequence_group_input: ProgramSequenceGroupInput!, $program_sequence_id: ID) {
            CreateProgramSequenceGroup(
              program_sequence_group_input: $program_sequence_group_input
              program_sequence_id: $program_sequence_id
            ) {
              _id
              name
            }
          }
        `,variables:{program_sequence_group_input:e,program_sequence_id:t}}).pipe((0,u.U)(n=>n.data.CreateProgramSequenceGroup))}createUpdateGroupClasses(e,t,n){return this.apollo.mutate({mutation:a.ZP`
          mutation CreateUpdateGroupClasses($program_sequence_id: ID!, $group_classes: [GroupClassesInput], $group_class_type_id: ID!) {
            CreateUpdateGroupClasses(
              program_sequence_id: $program_sequence_id
              group_classes: $group_classes
              group_class_type_id: $group_class_type_id
            ) {
              _id
            }
          }
        `,variables:{program_sequence_id:e,group_classes:t,group_class_type_id:n}}).pipe((0,u.U)(r=>r.data.CreateUpdateGroupClasses))}CreateUpdateGroupTypes(e,t,n){return this.apollo.mutate({mutation:a.ZP`
          mutation CreateUpdateGroupTypes(
            $program_sequence_id: ID!
            $group_class_types: [GroupClassTypesInput]
            $program_sequence_group_id: ID!
          ) {
            CreateUpdateGroupTypes(
              program_sequence_id: $program_sequence_id
              group_class_types: $group_class_types
              program_sequence_group_id: $program_sequence_group_id
            ) {
              _id
              name
            }
          }
        `,variables:{program_sequence_id:e,group_class_types:t,program_sequence_group_id:n}}).pipe((0,u.U)(r=>r.data.CreateUpdateGroupTypes))}}return s.\u0275fac=function(e){return new(e||s)(o.\u0275\u0275inject(l.eN),o.\u0275\u0275inject(d._M))},s.\u0275prov=o.\u0275\u0275defineInjectable({token:s,factory:s.\u0275fac,providedIn:"root"}),s})()}}]);