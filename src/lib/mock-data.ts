import type { Application, University, Program, Requirement } from '@/types';

const mockUniversities: University[] = [
  {
    _id: '1',
    name: 'Stanford University',
    country: 'United States',
    city: 'Stanford',
    website: 'https://stanford.edu'
  },
  {
    _id: '2', 
    name: 'ETH Zurich',
    country: 'Switzerland',
    city: 'Zurich',
    website: 'https://ethz.ch'
  },
  {
    _id: '3',
    name: 'University of Toronto',
    country: 'Canada',
    city: 'Toronto',
    website: 'https://utoronto.ca'
  }
];

const mockPrograms: Program[] = [
  {
    _id: '1',
    universityId: '1',
    degree: 'MS',
    title: 'Computer Science',
    term: 'Fall',
    year: 2024,
    mode: 'On-campus'
  },
  {
    _id: '2',
    universityId: '2', 
    degree: 'MSc',
    title: 'Data Science',
    term: 'Fall',
    year: 2024,
    mode: 'On-campus'
  },
  {
    _id: '3',
    universityId: '3',
    degree: 'MEng',
    title: 'Electrical and Computer Engineering',
    term: 'Fall',
    year: 2024,
    mode: 'On-campus'
  }
];

const defaultRequirements: Requirement[] = [
  { key: 'sop', label: 'Statement of Purpose', required: true, completed: false },
  { key: 'cv', label: 'CV/Resume', required: true, completed: true },
  { key: 'transcript', label: 'Official Transcripts', required: true, completed: false },
  { key: 'lor', label: 'Letters of Recommendation', required: true, completed: false },
  { key: 'english', label: 'English Proficiency (IELTS/TOEFL)', required: true, completed: true },
  { key: 'gre', label: 'GRE Scores', required: false, completed: false },
  { key: 'portfolio', label: 'Portfolio/Work Samples', required: false, completed: false },
  { key: 'fee', label: 'Application Fee', required: true, completed: false }
];

export const mockApplications: Application[] = [
  {
    _id: '1',
    userId: 'user1',
    university: mockUniversities[0],
    program: mockPrograms[0], 
    status: 'APPLIED',
    priority: 'High',
    deadlines: [
      { label: 'Application Deadline', date: '2024-12-15', type: 'Final' },
      { label: 'Scholarship Deadline', date: '2024-11-30', type: 'Scholarship' }
    ],
    links: {
      official: 'https://cs.stanford.edu/academics/masters',
      apply: 'https://gradadmissions.stanford.edu/',
      portal: 'https://apply.stanford.edu/'
    },
    contacts: [
      { name: 'Dr. Sarah Chen', email: 'schen@stanford.edu' }
    ],
    eligibility: {
      gpa: '3.8/4.0',
      language: 'IELTS 7.5',
      tests: ['GRE 325'],
      notes: 'Strong background in ML required'
    },
    fees: {
      application: 125,
      tuitionAnnual: 58416,
      currency: 'USD',
      waiverEligible: false
    },
    requirements: defaultRequirements.map(req => 
      req.key === 'cv' || req.key === 'english' ? { ...req, completed: true } : req
    ),
    notes: 'Top choice program. Focus on AI/ML research opportunities.',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-02-10T14:30:00Z'
  },
  {
    _id: '2',
    userId: 'user1',
    university: mockUniversities[1],
    program: mockPrograms[1],
    status: 'ELIGIBLE',
    priority: 'High',
    deadlines: [
      { label: 'Application Deadline', date: '2024-12-31', type: 'Final' }
    ],
    links: {
      official: 'https://inf.ethz.ch/studies/master/data-science.html',
      apply: 'https://www.ethz.ch/en/studies/registration-application.html'
    },
    eligibility: {
      gpa: '3.8/4.0',
      language: 'IELTS 7.0',
      notes: 'Strong mathematical background preferred'
    },
    fees: {
      application: 150,
      tuitionAnnual: 1200,
      currency: 'CHF',
      waiverEligible: false
    },
    requirements: defaultRequirements,
    notes: 'Excellent research opportunities in machine learning.',
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-01-25T16:45:00Z'
  },
  {
    _id: '3',
    userId: 'user1',
    university: mockUniversities[2],
    program: mockPrograms[2],
    status: 'PLANNING',
    priority: 'Medium',
    deadlines: [
      { label: 'Application Deadline', date: '2025-01-15', type: 'Final' }
    ],
    links: {
      official: 'https://www.ece.utoronto.ca/graduate/masters-programs/',
      apply: 'https://www.sgs.utoronto.ca/apply/'
    },
    eligibility: {
      gpa: '3.7/4.0',
      language: 'IELTS 7.0',
      notes: 'Engineering background required'
    },
    fees: {
      application: 110,
      tuitionAnnual: 58160,
      currency: 'CAD',
      waiverEligible: true
    },
    requirements: defaultRequirements,
    notes: 'Strong engineering program with industry connections.',
    createdAt: '2024-02-01T11:00:00Z',
    updatedAt: '2024-02-01T11:00:00Z'
  }
];