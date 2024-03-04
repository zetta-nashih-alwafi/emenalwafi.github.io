          mutation UpdateStudentInAcademicJourney($id: ID!, $lang: String!, $student_input: StudentInput) {
            UpdateStudent(_id: $id, lang: $lang, student_input: $student_input) {
              _id
              last_name
              first_name
              date_of_birth
              nationality
              place_of_birth
              professional_email
              photo
              is_photo_in_s3
              photo_s3_path
              description
              identification_type
              identification_number
              student_address {
                address
                city
                country
                department
                is_main_address
                postal_code
                region
              }
            }
          }
        `,variables:{lang:this.translate.currentLang,id:"5aa91e19155c845d8f80ddb6",student_input:b}}).pipe((0,P.U)(tt=>tt.data.UpdateStudent))}GetOneUser(m){return this.apollo.query({query:p.ZP`
          query{
              GetOneUser(_id:"${m}"){
                  _id
                  student_id{
                      _id
                  }
                  email
              }
              }
      `,fetchPolicy:"network-only"}).pipe((0,P.U)(b=>b.data.GetOneUser))}GetOneStudentdetails(m){return this.apollo.query({query:p.ZP`
          query{
              GetOneStudent(_id:"${m}")
              {
                  _id
                  last_name
                  civility
                  first_name
                  date_of_birth
                  nationality
                  tele_phone
                  place_of_birth
                  professional_email
                  photo
                  is_photo_in_s3
                  photo_s3_path
                  description
                  identification_type
                  identification_number
                  student_address {
                      address
                      city
                      country
                      department
                      is_main_address
                      postal_code
                      region
                  }
                  academic_journey_id {
                    diplomas {
                      institute_name
                      graduation_date{
                          month
                          year
                      }
                      qualification
                      location
                      field_of_study
                      major
                      grade
                      score
                      out_of_score
                      additional_information
                      diploma_upload_date
                      diploma_photo
                    }
                    experiences {
                      description
                      position_name
                      position_level
                      company_name
                      location
                      join_duration_from {
                          month
                          year
                      }
                      join_duration_to {
                          month
                          year
                      }
                      present
                      role
                      country
                      industry
                      monthly_salary
                      monthly_salary_currency
                      specialization_name
                    }
                    skills {
                      skill
                      level
                    }
                    languages {
                        language
                        spoken
                        written
                        primary
                    }
                    interests
                  }
                }
              }
      `,fetchPolicy:"network-only"}).pipe((0,P.U)(b=>b.data.GetOneStudent))}GetStudentId(m){return this.apollo.query({query:p.ZP`
        query GetStudentId {
          GetOneUser(_id:"${m}"){
            student_id{
                _id
            }
          }
        }
    `,fetchPolicy:"network-only"}).pipe((0,P.U)(b=>b.data.GetOneUser))}GetStudentDataProfileFirstTime(m){return this.apollo.query({query:p.ZP`
        query GetStudentDataToPopulateProfile {
          GetOneStudent(_id:"${m}"){
            first_name
            last_name
            age
            email
            photo
            civility
            tele_phone
            date_of_birth
            place_of_birth
            nationality
            identification_type
            identification_number
            student_address{
              address
              postal_code
              city
              region
              department
              country
              is_main_address
            }
          }
        }
    `,fetchPolicy:"network-only"}).pipe((0,P.U)(b=>b.data.GetOneStudent))}getMySummary(m){return this.apollo.query({query:p.ZP`
        query GetMyProfile {
          GetOneAcademicJourney(student_id:"${m}"){
            _id
            student_id {
              _id
            }
            general_presentation {
              first_name
              last_name
              age
              email
              description
              photo
              civility
              tele_phone
              date_of_birth
              place_of_birth
              nationality
              identification_type
              identification_number
              address {
                address
                postal_code
                city
                region
                department
                country
                is_main_address
              }
            }
            diplomas {
              institute_name
              graduation_date {
                date
                time
              }
              diploma_name
              city
              country
              qualification
              location
              field_of_study
              major
              grade
              score
              out_of_score
              additional_information
              diploma_upload_date
              diploma_photo
            }
            experiences {
              description
              position_name
              position_level
              company_name
              location
              join_duration_from {
                month
                year
              }
              join_duration_to {
                month
                year
              }
              present
              role
              country
              monthly_salary
              industry
              monthly_salary_currency
              specialization_name
            }
            skills {
              skill
              level
            }
            languages {
              language
              spoken
              written
              primary
            }
            interests {
              text
            }
          }
        }
    `,fetchPolicy:"network-only"}).pipe((0,P.U)(b=>b.data.GetOneAcademicJourney))}getMyProfile(m){return this.apollo.query({query:p.ZP`
        query GetMyProfile {
          GetOneAcademicJourney(student_id:"${m}"){
            _id
            student_id {
              _id
            }
            general_presentation {
              first_name
              last_name
              age
              email
              description
              photo
              civility
              tele_phone
              date_of_birth
              place_of_birth
              nationality
              identification_type
              identification_number
              address {
                address
                postal_code
                city
                region
                department
                country
                is_main_address
              }
            }
          }
        }
    `,fetchPolicy:"network-only"}).pipe((0,P.U)(b=>b.data.GetOneAcademicJourney))}getMyDiplomas(m){return this.apollo.query({query:p.ZP`
        query GetMyDiplomas {
          GetOneAcademicJourney(student_id:"${m}"){
            _id
            student_id {
              _id
            }
            diplomas {
              institute_name
              graduation_date {
                date
                time
              }
              diploma_name
              city
              country
              qualification
              location
              field_of_study
              major
              grade
              score
              out_of_score
              additional_information
              diploma_upload_date
              diploma_photo
            }
          }
        }
    `,fetchPolicy:"network-only"}).pipe((0,P.U)(b=>b.data.GetOneAcademicJourney))}getMySkills(m){return this.apollo.query({query:p.ZP`
        query GetMySkills {
          GetOneAcademicJourney(student_id:"${m}"){
            _id
            student_id {
              _id
            }
            skills {
              skill
              level
            }
          }
        }
    `,fetchPolicy:"network-only"}).pipe((0,P.U)(b=>b.data.GetOneAcademicJourney))}getMylanguages(m){return this.apollo.query({query:p.ZP`
        query GetMyLanguage {
          GetOneAcademicJourney(student_id:"${m}"){
            _id
            student_id {
              _id
            }
            languages {
              language
              spoken
              written
              primary
            }
          }
        }
    `,fetchPolicy:"network-only"}).pipe((0,P.U)(b=>b.data.GetOneAcademicJourney))}getMyInterest(m){return this.apollo.query({query:p.ZP`
        query getMyInterest {
          GetOneAcademicJourney(student_id:"${m}"){
            _id
            student_id {
              _id
            }
            interests {
              text
            }
          }
        }
    `,fetchPolicy:"network-only"}).pipe((0,P.U)(b=>b.data.GetOneAcademicJourney))}getMyExperience(m){return this.apollo.query({query:p.ZP`
        query getMyExperience {
          GetOneAcademicJourney(student_id:"${m}"){
            _id
            student_id {
              _id
            }
            experiences {
              description
              position_name
              position_level
              company_name
              location
              join_duration_from {
                month
                year
              }
              join_duration_to {
                month
                year
              }
              present
              role
              country
              monthly_salary
              industry
              monthly_salary_currency
              specialization_name
            }
          }
        }
    `,fetchPolicy:"network-only"}).pipe((0,P.U)(b=>b.data.GetOneAcademicJourney))}createAcademicJourney(m){return this.apollo.mutate({mutation:p.ZP`
          mutation CreateAcademicJourney($academic_journey_input: AcademicJourneyInput) {
            CreateAcademicJourney(academic_journey_input: $academic_journey_input) {
              _id
            }
          }
        `,variables:{academic_journey_input:m}}).pipe((0,P.U)(b=>b.data.CreateAcademicJourney))}updateAcademicJourney(m,b){return this.apollo.mutate({mutation:p.ZP`
          mutation UpdateAcademicJourney($_id: ID!, $academic_journey_input: AcademicJourneyInput) {
            UpdateAcademicJourney(_id: $_id, academic_journey_input: $academic_journey_input) {
              _id
              general_presentation {
                photo
              }
            }
          }
        `,variables:{_id:m,academic_journey_input:b}}).pipe((0,P.U)(tt=>tt.data.UpdateAcademicJourney))}getCurrency(){return this.httpClient.get("assets/data/currency.json")}}return X.\u0275fac=function(m){return new(m||X)(Z.\u0275\u0275inject(ot._M),Z.\u0275\u0275inject(I.sK),Z.\u0275\u0275inject($.eN))},X.\u0275prov=Z.\u0275\u0275defineInjectable({token:X,factory:X.\u0275fac,providedIn:"root"}),X})()}}]);