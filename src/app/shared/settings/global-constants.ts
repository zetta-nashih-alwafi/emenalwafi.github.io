import { environment } from '../../../environments/environment';

export const GlobalConstants = {
  // Privay Policy Links
  privacyPolicy: {
    ENLink: 'https://api.zetta-staging.work/privacy-policy/EN.html',
    FRLink: 'https://api.zetta-staging.work/privacy-policy/FR.html',
  },

  correctionTypes: [
    {
      value: 'pc',
      view: 'Cross Correction',
    },
    {
      value: 'cp',
      view: 'Certifier',
    },
    {
      value: 'free',
      view: 'Preparation Centre',
    },
    {
      value: 'operator',
      view: 'operator',
    },
  ],

  TestType: [
    { key: 'Oral', value: 'oral' },
    { key: 'Written', value: 'written' },
    { key: 'Memoire-ECRIT', value: 'memoire_ecrit' },
    { key: 'Memoire-ORAL', value: 'memoire_oral' },
    { key: 'free-continuous-control', value: 'free_continuous_control' },
    { key: 'mentor-evaluation', value: 'mentor_evaluation' },
    { key: 'Jury', value: 'jury' },
    { key: 'School-Mentor-Evaluation', value: 'school_mentor_evaluation' },
    //  { key: 'Business-Game', value: 'business_game' },
    // { key: 'CaseStudies', value: 'case-studies' },
    // { key: 'Memoire', value: 'Memoire' }
    // { key: 'SkillsAssessment', value: 'skills_assessment' },
    // { key: 'Competition', value: 'competition' },
    // { key: 'ExamenExterne', value: 'external_test' },
  ],

  TestTypeForSubTest: [
    { key: 'Oral', value: 'oral' },
    { key: 'Written', value: 'written' },
    { key: 'Memoire-ECRIT', value: 'memoire_ecrit' },
  ],

  DateType: [
    { key: 'marks', value: 'marks' },
    { key: 'different', value: 'different' },
    { key: 'fixed', value: 'fixed' },
  ],

  CorrectionTypesStringArr: [
    'none',
    'cross_correction',
    'certifier',
    'prep_center',
    'operator',
    'mentor'
  ],

  TestCorrectionTypeStringArr: [
    'none',
    'cross_correction',
    'certifier',
    'prep_center',
    'operator'
  ],

  DateTypeStringArr: [
    'fixed',
    'different',
    'marks'
  ]
};
