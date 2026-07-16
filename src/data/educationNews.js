/**
 * Education news & exam-updates dataset — powers the Exams page news rail,
 * notification strip and deadline tracker whenever the API has no content.
 * Shapes mirror the /news and /exams API contracts (NewsCard-compatible).
 */

export const EDUCATION_NEWS = [
  {
    _id: 'news-001', category: 'Exam Alert',
    title: 'JEE Main 2026 Session 2 city intimation slips released on jeemain.nta.nic.in',
    summary: 'NTA has activated the advance city intimation link for the April session. Admit cards are expected 3 days before each shift; candidates should verify their chosen exam cities now.',
    source: 'NTA', publishedAt: '2026-07-14', tag: 'trending',
  },
  {
    _id: 'news-002', category: 'Counselling',
    title: 'JoSAA 2026 Round 3 seat allotment result announced — freeze/float window open till July 19',
    summary: 'Candidates allotted seats in Round 3 must complete online reporting, fee payment and document verification before the deadline or forfeit the allotment.',
    source: 'JoSAA', publishedAt: '2026-07-13', tag: 'deadline',
  },
  {
    _id: 'news-003', category: 'Government Update',
    title: 'UGC notifies biannual admissions: universities can now admit students in January and July',
    summary: 'The University Grants Commission has permitted all recognised universities to run two admission cycles per year from the 2026-27 session, aligning Indian intakes with global calendars.',
    source: 'UGC', publishedAt: '2026-07-11', tag: 'policy',
  },
  {
    _id: 'news-004', category: 'Exam Alert',
    title: 'NEET UG 2026 counselling schedule out: MCC Round 1 registration begins July 21',
    summary: 'The Medical Counselling Committee will open Round 1 choice filling for 15% All India Quota seats, all deemed universities and central institutes from July 21 to July 28.',
    source: 'MCC', publishedAt: '2026-07-10', tag: 'trending',
  },
  {
    _id: 'news-005', category: 'Scholarship',
    title: 'National Means-cum-Merit Scholarship portal reopens; state quota seats enhanced for 2026-27',
    summary: 'The NSP portal is accepting fresh and renewal applications until September 30. Several states have raised their NMMS seat quotas this cycle.',
    source: 'Ministry of Education', publishedAt: '2026-07-09', tag: 'policy',
  },
  {
    _id: 'news-006', category: 'Admission News',
    title: 'CUET UG 2026 results declared — 13.2 lakh candidates qualify; central university counselling from July 25',
    summary: 'NTA published final answer keys and scorecards. Delhi University, BHU and JNU will begin their CSAS counselling portals in the last week of July.',
    source: 'NTA', publishedAt: '2026-07-08', tag: 'trending',
  },
  {
    _id: 'news-007', category: 'State Update',
    title: 'MHT-CET 2026 CAP Round 1 provisional allotment on July 24; PERA CET final round registrations open',
    summary: 'Maharashtra’s State CET Cell confirmed the Centralised Admission Process calendar for engineering and pharmacy. Private-university PERA CET candidates get a final attempt window in August.',
    source: 'Maharashtra CET Cell', publishedAt: '2026-07-07', tag: 'deadline',
  },
  {
    _id: 'news-008', category: 'Government Update',
    title: 'AICTE mandates internship-embedded degrees for all B.Tech programs from 2026 intake',
    summary: 'Every approved technical institution must integrate at least one semester-equivalent internship, with credits recorded on the Academic Bank of Credits.',
    source: 'AICTE', publishedAt: '2026-07-05', tag: 'policy',
  },
  {
    _id: 'news-009', category: 'Exam Alert',
    title: 'CAT 2026 notification expected July 30; exam likely on November 29',
    summary: 'IIM Kozhikode, this year’s convening institute, is expected to release the official CAT notification by month-end, with registrations through August and September.',
    source: 'IIM Kozhikode', publishedAt: '2026-07-04', tag: 'upcoming',
  },
  {
    _id: 'news-010', category: 'Admission News',
    title: 'CLAT 2027 to be held December 6, consortium confirms single-cycle calendar',
    summary: 'The Consortium of NLUs confirmed the next CLAT will run on the first Sunday of December with registrations opening August 1, keeping the one-exam-per-year format.',
    source: 'Consortium of NLUs', publishedAt: '2026-07-02', tag: 'upcoming',
  },
];

export const EXAM_NOTIFICATIONS = [
  { _id: 'notif-01', type: 'closing-soon', exam: 'VITEEE Phase 3', title: 'VIT Vellore Phase 3 application window closes', date: '2026-07-20', link: '/exams' },
  { _id: 'notif-02', type: 'closing-soon', exam: 'Amrita AEEE', title: 'AEEE late-window registration ends', date: '2026-07-19', link: '/exams' },
  { _id: 'notif-03', type: 'admit-card', exam: 'MET 2026', title: 'Manipal MET Phase 2 admit cards released', date: '2026-07-16', link: '/exams' },
  { _id: 'notif-04', type: 'result', exam: 'CUET UG', title: 'CUET UG 2026 scorecards available for download', date: '2026-07-08', link: '/exams' },
  { _id: 'notif-05', type: 'counselling', exam: 'JoSAA', title: 'Round 3 online reporting deadline', date: '2026-07-19', link: '/exams' },
  { _id: 'notif-06', type: 'closing-soon', exam: 'LPUNEST', title: 'LPUNEST August attempt registration closing', date: '2026-07-27', link: '/exams' },
  { _id: 'notif-07', type: 'exam-date', exam: 'NEET PG', title: 'NEET PG 2026 scheduled — single shift confirmed', date: '2026-08-09', link: '/exams' },
  { _id: 'notif-08', type: 'counselling', exam: 'MCC NEET UG', title: 'MCC Round 1 registration opens', date: '2026-07-21', link: '/exams' },
];

export const UPCOMING_DEADLINES = [
  { _id: 'dl-01', title: 'Manipal MAHE B.Tech lateral window', deadline: '2026-07-22', kind: 'Application' },
  { _id: 'dl-02', title: 'DTU B.Tech spot-round registration', deadline: '2026-07-18', kind: 'Counselling' },
  { _id: 'dl-03', title: 'Amity Nagpur merit scholarship cut-off submission', deadline: '2026-07-25', kind: 'Scholarship' },
  { _id: 'dl-04', title: 'Thakur College MHT-CET institute round', deadline: '2026-07-25', kind: 'Application' },
  { _id: 'dl-05', title: 'Nirma University B.Tech GUJCET round', deadline: '2026-07-24', kind: 'Application' },
  { _id: 'dl-06', title: 'SRMIST Chennai Phase 3 slot booking', deadline: '2026-08-05', kind: 'Exam' },
  { _id: 'dl-07', title: 'Chandigarh University CUCET final phase', deadline: '2026-08-10', kind: 'Application' },
  { _id: 'dl-08', title: 'NSP merit scholarship fresh applications', deadline: '2026-09-30', kind: 'Scholarship' },
];

export const TRENDING_EXAMS = [
  { _id: 'tr-01', shortName: 'JEE Main', name: 'Joint Entrance Examination (Main)', category: 'engineering', searches: '2.4M monthly', change: '+12%' },
  { _id: 'tr-02', shortName: 'NEET UG', name: 'National Eligibility cum Entrance Test', category: 'medical', searches: '2.1M monthly', change: '+8%' },
  { _id: 'tr-03', shortName: 'CUET UG', name: 'Common University Entrance Test', category: 'others', searches: '1.6M monthly', change: '+21%' },
  { _id: 'tr-04', shortName: 'CAT', name: 'Common Admission Test', category: 'management', searches: '890K monthly', change: '+31%' },
  { _id: 'tr-05', shortName: 'MHT-CET', name: 'Maharashtra Common Entrance Test', category: 'engineering', searches: '640K monthly', change: '+5%' },
  { _id: 'tr-06', shortName: 'CLAT', name: 'Common Law Admission Test', category: 'law', searches: '410K monthly', change: '+18%' },
];

export const IMPORTANT_ANNOUNCEMENTS = [
  {
    _id: 'ann-01', urgency: 'high',
    title: 'JoSAA Round 3 reporting closes July 19, 5 PM IST',
    body: 'Failure to report online and pay the seat acceptance fee will cancel the allotted seat and exclude candidates from further rounds.',
  },
  {
    _id: 'ann-02', urgency: 'high',
    title: 'MCC NEET UG counselling: mandatory Aadhaar-linked registration this year',
    body: 'MCC has made Aadhaar e-KYC compulsory during Round 1 registration. Keep the registered mobile number active for OTP verification.',
  },
  {
    _id: 'ann-03', urgency: 'medium',
    title: 'UGC warns against 21 unrecognised universities',
    body: 'The UGC published its annual fake-universities list. Verify recognition status on ugc.gov.in before paying any admission fee.',
  },
];

/**
 * Fallback exams catalogue — mirrors the /exams API shape so the directory
 * stays browsable when the API returns nothing.
 */
export const FALLBACK_EXAMS = [
  {
    _id: 'ex-jee', name: 'Joint Entrance Examination (Main) 2026', shortName: 'JEE Main',
    category: 'engineering', scope: 'national', conductingBody: 'National Testing Agency (NTA)',
    examDate: '2026-04-04', registrationDeadline: '2026-03-05',
    courses: ['B.Tech', 'B.E.', 'B.Arch', 'B.Planning'],
    highlights: ['Gateway to NITs, IIITs and GFTIs', 'Qualifier for JEE Advanced (IITs)', 'Held twice a year — best score counts'],
    eligibility: 'Class 12 with Physics, Chemistry and Mathematics. No age limit; three consecutive attempt years.',
    officialUrl: 'https://jeemain.nta.nic.in', participatingUniversities: 2400,
  },
  {
    _id: 'ex-neet', name: 'National Eligibility cum Entrance Test (UG) 2026', shortName: 'NEET UG',
    category: 'medical', scope: 'national', conductingBody: 'National Testing Agency (NTA)',
    examDate: '2026-05-03', registrationDeadline: '2026-03-15',
    courses: ['MBBS', 'BDS', 'BAMS', 'BHMS', 'B.Sc Nursing'],
    highlights: ['Single window for all medical UG seats in India', 'Pen-and-paper mode, 720 marks', 'Counselling via MCC and state committees'],
    eligibility: 'Class 12 with Physics, Chemistry, Biology/Biotechnology; minimum 50% aggregate (40% reserved categories).',
    officialUrl: 'https://neet.nta.nic.in', participatingUniversities: 700,
  },
  {
    _id: 'ex-cuet', name: 'Common University Entrance Test (UG) 2026', shortName: 'CUET UG',
    category: 'others', scope: 'national', conductingBody: 'National Testing Agency (NTA)',
    examDate: '2026-05-15', registrationDeadline: '2026-03-31',
    courses: ['BA', 'B.Sc', 'B.Com', 'BBA', 'BCA'],
    highlights: ['Admission to 250+ central, state and private universities', 'Subject-combination based CBT', 'Normalised scores across shifts'],
    eligibility: 'Class 12 in the relevant subject combination for the chosen programs.',
    officialUrl: 'https://cuet.nta.nic.in', participatingUniversities: 250,
  },
  {
    _id: 'ex-mhtcet', name: 'Maharashtra Common Entrance Test 2026', shortName: 'MHT-CET',
    category: 'engineering', scope: 'state', state: 'Maharashtra', conductingBody: 'State CET Cell, Maharashtra',
    examDate: '2026-04-20', registrationDeadline: '2026-02-28',
    courses: ['B.Tech', 'B.Pharm', 'B.Sc Agriculture'],
    highlights: ['Mandatory for Maharashtra state-quota engineering seats', 'PCM and PCB groups held separately', 'CAP counselling across 350+ institutes'],
    eligibility: 'Class 12 with PCM/PCB; Maharashtra domicile for state quota (others eligible for institute quota).',
    officialUrl: 'https://cetcell.mahacet.org', participatingUniversities: 360,
  },
  {
    _id: 'ex-bitsat', name: 'BITS Admission Test 2026', shortName: 'BITSAT',
    category: 'engineering', scope: 'university', conductingBody: 'BITS Pilani',
    examDate: '2026-05-20', registrationDeadline: '2026-04-10',
    courses: ['B.E.', 'B.Pharm', 'M.Sc'],
    highlights: ['Computer-based with bonus-question speed round', 'Direct admission for board toppers', 'Common test for Pilani, Goa and Hyderabad campuses'],
    eligibility: 'Class 12 with PCM and minimum 75% aggregate (60% in each of P, C, M).',
    officialUrl: 'https://www.bitsadmission.com', participatingUniversities: 3,
  },
  {
    _id: 'ex-cat', name: 'Common Admission Test 2026', shortName: 'CAT',
    category: 'management', scope: 'national', conductingBody: 'IIM Kozhikode (2026 convenor)',
    examDate: '2026-11-29', registrationDeadline: '2026-09-20',
    courses: ['MBA', 'PGDM', 'Executive MBA'],
    highlights: ['Gateway to 20 IIMs and 1,000+ B-schools', 'VARC, DILR and QA sections', 'Score valid for one admission cycle'],
    eligibility: 'Bachelor’s degree with 50% marks (45% for reserved categories); final-year students may apply.',
    officialUrl: 'https://iimcat.ac.in', participatingUniversities: 1000,
  },
  {
    _id: 'ex-clat', name: 'Common Law Admission Test 2027', shortName: 'CLAT',
    category: 'law', scope: 'national', conductingBody: 'Consortium of National Law Universities',
    examDate: '2026-12-06', registrationDeadline: '2026-10-15',
    courses: ['BA LLB', 'BBA LLB', 'LLM'],
    highlights: ['Admission to 24 National Law Universities', 'Comprehension-driven paper since 2020', 'Also accepted by top private law schools'],
    eligibility: 'Class 12 with 45% marks (40% reserved categories) for UG; LLB degree for PG.',
    officialUrl: 'https://consortiumofnlus.ac.in', participatingUniversities: 62,
  },
  {
    _id: 'ex-viteee', name: 'VIT Engineering Entrance Examination 2026', shortName: 'VITEEE',
    category: 'engineering', scope: 'university', conductingBody: 'Vellore Institute of Technology',
    examDate: '2026-04-19', registrationDeadline: '2026-03-31',
    courses: ['B.Tech'],
    highlights: ['Slot-booking CBT across 120+ cities', 'Category-wise fee waivers for top ranks', 'Single counselling for all four VIT campuses'],
    eligibility: 'Class 12 with PCM/PCB and 60% aggregate (50% for reserved categories and J&K/NE candidates).',
    officialUrl: 'https://viteee.vit.ac.in', participatingUniversities: 4,
  },
];
