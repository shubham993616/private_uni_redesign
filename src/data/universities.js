/**
 * Local university catalogue — realistic development dataset.
 *
 * Serves the listing, detail, compare and sponsored surfaces whenever the API
 * is unreachable or returns an empty catalogue, so the product is fully
 * browsable in every environment. The record shape mirrors the API contract
 * exactly (UniversityCard, UniversityDetail and the brochure generator read
 * the same fields), which also makes this file a reference fixture for the
 * future CMS import.
 *
 * Helpers exported alongside the data implement the full marketplace filter
 * and sort vocabulary client-side.
 */

const GALLERY_POOL = [
  'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1200',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200',
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200',
  'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=1200',
  'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1200',
  'https://images.unsplash.com/photo-1607013251379-e6eecfffe234?q=80&w=1200',
  'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?q=80&w=1200',
  'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?q=80&w=1200',
];

const slugify = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const lakh = (n) => {
  if (n >= 100) return `₹${(n / 100).toFixed(n % 100 === 0 ? 0 : 1)} Cr`;
  return `₹${n % 1 === 0 ? n : n.toFixed(1)}L`;
};

let seq = 0;

/** Normalise a compact record into the full API-compatible shape. */
function U(u) {
  seq += 1;
  const slug = u.slug || slugify(u.name);
  const feesMin = u.feesMin; // ₹ per year
  const feesMax = u.feesMax;
  return {
    _id: `local-${String(seq).padStart(3, '0')}`,
    slug,
    isLocalRecord: true,
    name: u.name,
    tagline: u.tagline,
    description: u.description,
    city: u.city,
    state: u.state,
    location: `${u.city}, ${u.state}`,
    established: u.established,
    type: u.type, // 'private' | 'government' | 'deemed'
    institutionKind: u.type === 'deemed' ? 'deemed' : u.type,
    approvals: u.approvals || ['UGC'],
    accreditation: u.naacGrade ? `NAAC ${u.naacGrade}` : 'UGC Recognised',
    naacGrade: u.naacGrade || null,
    nirfRank: u.nirfRank || null,
    bannerUrl: u.bannerUrl || GALLERY_POOL[seq % GALLERY_POOL.length],
    gallery: u.gallery || [
      GALLERY_POOL[seq % GALLERY_POOL.length],
      GALLERY_POOL[(seq + 3) % GALLERY_POOL.length],
      GALLERY_POOL[(seq + 5) % GALLERY_POOL.length],
    ],
    fees: {
      min: feesMin,
      max: feesMax,
      display: `${lakh(feesMin / 100000)} – ${lakh(feesMax / 100000)} / yr`,
    },
    streams: u.streams,
    degrees: u.degrees || ['UG', 'PG'],
    courses: u.courses,
    branches: u.branches || [],
    stats: {
      avgPackageLPA: u.avgLPA,
      highestPackageLPA: u.highestLPA,
      avgFees: `${lakh(((feesMin + feesMax) / 2) / 100000)}/yr`,
      totalCoursesCount: u.courseCount || u.courses.length * 6,
      placementRate: u.placementRate,
    },
    placements: {
      avgLPA: u.avgLPA,
      highestLPA: u.highestLPA,
      placementRate: u.placementRate,
      recruiters: u.recruiters,
    },
    scholarships: u.scholarships || [
      { name: 'Merit Scholarship', benefit: 'Up to 50% tuition waiver for 90%+ in Class 12 or top entrance ranks.' },
      { name: 'Girl Child Scholarship', benefit: '10% tuition concession for female students across programs.' },
    ],
    hasScholarship: true,
    hostel: u.hostel !== false
      ? { available: true, feesPerYear: u.hostelFees || 95000, note: 'Separate AC/non-AC hostels for boys and girls with mess.' }
      : { available: false },
    facilities: u.facilities || ['Library', 'Hostel', 'Sports Complex', 'Labs', 'Wi-Fi Campus', 'Cafeteria', 'Auditorium', 'Medical Centre'],
    entranceExams: u.entranceExams || ['CUET'],
    admissions: {
      status: u.admissionStatus || 'open', // 'open' | 'closing-soon' | 'closed'
      session: 'Admissions 2026–27',
      deadline: u.deadline || '2026-08-31',
      process: u.process || 'Apply online → entrance/merit shortlisting → counselling → document verification → fee payment.',
    },
    internationalPrograms: !!u.internationalPrograms,
    studyModes: u.studyModes || ['Full-time'],
    rating: u.rating,
    reviewsCount: u.reviewsCount,
    reviews: u.reviews || [],
    website: u.website || `https://www.${slug.replace(/-/g, '')}.edu.in`,
    contact: {
      phone: u.phone || '+91 1800 120 4500',
      email: u.email || `admissions@${slug.replace(/-/g, '')}.edu.in`,
      address: u.address || `${u.name} Campus, ${u.city}, ${u.state}`,
    },
    isSponsored: !!u.isSponsored,
    sponsorTier: u.sponsorTier || null,
    popularity: u.popularity, // relative interest score for "Popularity" sort
    coordinates: u.coordinates || null,
  };
}

export const LOCAL_UNIVERSITIES = [
  U({
    name: 'Amity University', city: 'Noida', state: 'Uttar Pradesh', established: 2005, type: 'private',
    tagline: 'India’s largest private education group',
    description: 'Amity University Noida is the flagship campus of the Amity Education Group, spread over 60 acres with more than 150 programs across engineering, management, law, communication and life sciences. The university is known for industry-aligned curricula, strong corporate placement tie-ups and an active international exchange network with 200+ partner universities.',
    approvals: ['UGC', 'AICTE', 'BCI', 'NCTE'], naacGrade: 'A+', nirfRank: 32,
    feesMin: 180000, feesMax: 420000, avgLPA: 6.8, highestLPA: 58, placementRate: 92,
    streams: ['Engineering', 'Management', 'Law', 'Science', 'Design & Architecture', 'Arts & Humanities'],
    courses: ['B.Tech', 'M.Tech', 'MBA', 'BBA', 'B.Com', 'BA LLB', 'B.Des', 'B.Sc', 'BCA', 'MCA'],
    branches: ['Computer Science', 'AI & ML', 'Electronics', 'Mechanical', 'Civil', 'Biotechnology', 'Finance', 'Marketing', 'HR'],
    recruiters: ['Microsoft', 'Amazon', 'Deloitte', 'EY', 'TCS', 'Wipro', 'HCL', 'Adobe'],
    entranceExams: ['JEE Main', 'Amity JEE', 'CUET'], internationalPrograms: true,
    studyModes: ['Full-time', 'Online', 'Distance'],
    rating: 4.2, reviewsCount: 3841, popularity: 98, courseCount: 156,
    admissionStatus: 'open', deadline: '2026-07-31', hostelFees: 165000,
    isSponsored: true, sponsorTier: 'Platinum',
    coordinates: { lat: 28.5449, lng: 77.3320 },
    reviews: [
      { name: 'Ishaan Verma', course: 'B.Tech CSE', rating: 4, comment: 'Great exposure and events. Placements for CSE are strong if you keep your CGPA above 8.' },
      { name: 'Sneha Patil', course: 'MBA', rating: 4.5, comment: 'The corporate resource centre works hard — I had three offers before the final semester.' },
    ],
  }),
  U({
    name: 'SAGE University', city: 'Indore', state: 'Madhya Pradesh', established: 2017, type: 'private',
    tagline: 'Skill-first university in the heart of Indore',
    description: 'SAGE University Indore focuses on employability-first education across engineering, management, agriculture and paramedical sciences. Compact cohorts, mentor-led labs and a city location close to Indore’s industrial belt make it a practical choice for students who want early industry contact.',
    approvals: ['UGC', 'AICTE', 'PCI'], naacGrade: 'A', nirfRank: null,
    feesMin: 80000, feesMax: 220000, avgLPA: 4.2, highestLPA: 24, placementRate: 85,
    streams: ['Engineering', 'Management', 'Science', 'Pharmacy', 'Commerce'],
    courses: ['B.Tech', 'MBA', 'B.Pharm', 'BBA', 'B.Sc Agriculture', 'BCA', 'B.Com'],
    branches: ['Computer Science', 'Data Science', 'Mechanical', 'Pharmacy', 'Agriculture'],
    recruiters: ['Infosys', 'TCS', 'Byju’s', 'ICICI Bank', 'Reliance Retail', 'Impetus'],
    entranceExams: ['JEE Main', 'CUET', 'SAGE Entrance Test'],
    rating: 4.0, reviewsCount: 1210, popularity: 74, courseCount: 88,
    admissionStatus: 'open', deadline: '2026-08-15', hostelFees: 90000,
    isSponsored: true, sponsorTier: 'Gold',
    coordinates: { lat: 22.6708, lng: 75.9063 },
    reviews: [
      { name: 'Aditi Sharma', course: 'B.Pharm', rating: 4, comment: 'Labs are new and faculty are approachable. Hostel food could improve.' },
    ],
  }),
  U({
    name: 'Thakur College of Engineering & Technology', city: 'Mumbai', state: 'Maharashtra', established: 2001, type: 'private',
    tagline: 'Autonomous engineering institute in Kandivali, Mumbai',
    description: 'TCET is an autonomous engineering college affiliated to the University of Mumbai, consistently ranked among the top self-financed engineering institutes in Maharashtra. Its Kandivali campus offers strong placement pipelines into IT services and product companies, active technical societies and NBA-accredited programs.',
    approvals: ['UGC', 'AICTE', 'NBA'], naacGrade: 'A++', nirfRank: 178,
    feesMin: 160000, feesMax: 210000, avgLPA: 6.1, highestLPA: 36, placementRate: 94,
    streams: ['Engineering'],
    courses: ['B.Tech', 'M.Tech', 'MCA'],
    branches: ['Computer Engineering', 'IT', 'AI & DS', 'Electronics & Telecom', 'Mechanical', 'Civil'],
    recruiters: ['JP Morgan', 'LTI Mindtree', 'Capgemini', 'Accenture', 'TCS', 'Oracle'],
    entranceExams: ['MHT-CET', 'JEE Main'],
    rating: 4.3, reviewsCount: 2105, popularity: 88, courseCount: 14,
    admissionStatus: 'closing-soon', deadline: '2026-07-25', hostelFees: 110000,
    isSponsored: true, sponsorTier: 'Gold',
    coordinates: { lat: 19.2094, lng: 72.8526 },
    reviews: [
      { name: 'Rohan Naik', course: 'B.Tech IT', rating: 4.5, comment: 'Placement cell is serious — 90%+ of my batch was placed before results.' },
    ],
  }),
  U({
    name: 'O.P. Jindal University', city: 'Raigarh', state: 'Chhattisgarh', established: 2014, type: 'private',
    tagline: 'Industry-embedded engineering and management education',
    description: 'Backed by the Jindal Steel & Power group, OPJU Raigarh runs engineering, management and science programs with direct access to one of India’s largest steel plants for internships and live projects. The residential campus emphasises hands-on plant training and core-sector placements.',
    approvals: ['UGC', 'AICTE'], naacGrade: 'A', nirfRank: null,
    feesMin: 120000, feesMax: 250000, avgLPA: 5.0, highestLPA: 21, placementRate: 88,
    streams: ['Engineering', 'Management', 'Science'],
    courses: ['B.Tech', 'MBA', 'B.Sc', 'Diploma Engineering'],
    branches: ['Metallurgy', 'Mechanical', 'Electrical', 'Computer Science', 'Operations'],
    recruiters: ['Jindal Steel & Power', 'Tata Steel', 'Vedanta', 'Adani Power', 'UltraTech'],
    entranceExams: ['JEE Main', 'OPJU Entrance'],
    rating: 4.1, reviewsCount: 640, popularity: 61, courseCount: 32,
    admissionStatus: 'open', deadline: '2026-08-20',
    isSponsored: true, sponsorTier: 'Silver',
    coordinates: { lat: 21.8974, lng: 83.3950 },
  }),
  U({
    name: 'Manipal Academy of Higher Education', city: 'Manipal', state: 'Karnataka', established: 1953, type: 'deemed',
    tagline: 'India’s original university town',
    description: 'MAHE Manipal is an Institution of Eminence with more than 300 programs across medicine, engineering, pharmacy, management and humanities. The self-contained university town hosts 30,000+ students from 60+ countries, world-class hospitals and one of the strongest alumni networks in Indian private education.',
    approvals: ['UGC', 'AICTE', 'NMC', 'PCI'], naacGrade: 'A++', nirfRank: 4,
    feesMin: 240000, feesMax: 1650000, avgLPA: 9.5, highestLPA: 64, placementRate: 91,
    streams: ['Engineering', 'Medical & Health Sciences', 'Management', 'Pharmacy', 'Arts & Humanities'],
    courses: ['MBBS', 'B.Tech', 'BDS', 'B.Pharm', 'MBA', 'B.Arch', 'B.Sc Nursing', 'BA Media'],
    branches: ['CSE', 'IT', 'ECE', 'Biomedical', 'Medicine', 'Dentistry', 'Pharmacy'],
    recruiters: ['Google', 'Microsoft', 'Goldman Sachs', 'Philips', 'Cisco', 'Apollo Hospitals'],
    entranceExams: ['MET', 'NEET', 'JEE Main'], internationalPrograms: true,
    rating: 4.5, reviewsCount: 6230, popularity: 96, courseCount: 312,
    admissionStatus: 'closing-soon', deadline: '2026-07-22', hostelFees: 180000,
    coordinates: { lat: 13.3525, lng: 74.7928 },
    reviews: [
      { name: 'Kavya Rao', course: 'B.Tech ECE', rating: 5, comment: 'The campus, peers and opportunities are unmatched. Fest season is legendary.' },
    ],
  }),
  U({
    name: 'Birla Institute of Technology and Science, Pilani', city: 'Pilani', state: 'Rajasthan', established: 1964, type: 'deemed',
    tagline: 'The benchmark for private technical education',
    description: 'BITS Pilani is consistently rated India’s top private engineering institution, with a no-attendance-policy academic culture, the flagship Practice School internship program and campuses in Pilani, Goa, Hyderabad and Dubai. Admission is through the computer-based BITSAT.',
    approvals: ['UGC', 'AICTE'], naacGrade: 'A++', nirfRank: 20,
    feesMin: 520000, feesMax: 600000, avgLPA: 18.5, highestLPA: 92, placementRate: 96,
    streams: ['Engineering', 'Science', 'Pharmacy'],
    courses: ['B.E.', 'B.Pharm', 'M.Sc', 'M.E.', 'MBA'],
    branches: ['CSE', 'ECE', 'EEE', 'Mechanical', 'Chemical', 'Mathematics & Computing'],
    recruiters: ['Google', 'Microsoft', 'Amazon', 'Qualcomm', 'Texas Instruments', 'McKinsey'],
    entranceExams: ['BITSAT'], internationalPrograms: true,
    rating: 4.7, reviewsCount: 4980, popularity: 95, courseCount: 42,
    admissionStatus: 'closed', deadline: '2026-06-30', hostelFees: 140000,
    coordinates: { lat: 28.3639, lng: 75.5860 },
  }),
  U({
    name: 'Vellore Institute of Technology', city: 'Vellore', state: 'Tamil Nadu', established: 1984, type: 'deemed',
    tagline: 'India’s largest single-campus placement engine',
    description: 'VIT Vellore records among the highest placement offer counts in the country every year, driven by its fully flexible credit system and one of Asia’s largest annual recruitment drives. The 372-acre campus hosts students from every Indian state and 50+ countries.',
    approvals: ['UGC', 'AICTE', 'NBA'], naacGrade: 'A++', nirfRank: 11,
    feesMin: 195000, feesMax: 385000, avgLPA: 8.2, highestLPA: 102, placementRate: 93,
    streams: ['Engineering', 'Science', 'Management', 'Law'],
    courses: ['B.Tech', 'M.Tech', 'MBA', 'B.Sc', 'BBA LLB', 'B.Des'],
    branches: ['CSE', 'AI & ML', 'Cybersecurity', 'ECE', 'Mechanical', 'Biotech'],
    recruiters: ['TCS', 'Cognizant', 'Amazon', 'PayPal', 'VMware', 'Bosch', 'Hyundai'],
    entranceExams: ['VITEEE'], internationalPrograms: true,
    rating: 4.4, reviewsCount: 7150, popularity: 97, courseCount: 64,
    admissionStatus: 'closing-soon', deadline: '2026-07-20', hostelFees: 155000,
    coordinates: { lat: 12.9698, lng: 79.1559 },
  }),
  U({
    name: 'SRM Institute of Science and Technology', city: 'Chennai', state: 'Tamil Nadu', established: 1985, type: 'deemed',
    tagline: 'Metro-scale campus with research depth',
    description: 'SRMIST Kattankulathur is one of India’s largest deemed universities with 50,000+ students, a dedicated research park, super-speciality hospital and strong semiconductor and software placement pipelines into Chennai’s IT corridor.',
    approvals: ['UGC', 'AICTE', 'NMC'], naacGrade: 'A++', nirfRank: 18,
    feesMin: 260000, feesMax: 450000, avgLPA: 7.2, highestLPA: 57, placementRate: 90,
    streams: ['Engineering', 'Medical & Health Sciences', 'Management', 'Science', 'Law'],
    courses: ['B.Tech', 'MBBS', 'MBA', 'B.Arch', 'B.Sc', 'BA LLB'],
    branches: ['CSE', 'Software Engineering', 'ECE', 'Aerospace', 'Automobile', 'Medicine'],
    recruiters: ['Infosys', 'Wipro', 'Dell', 'Samsung', 'Zoho', 'Freshworks'],
    entranceExams: ['SRMJEEE', 'NEET'], internationalPrograms: true,
    rating: 4.1, reviewsCount: 5820, popularity: 89, courseCount: 148,
    admissionStatus: 'open', deadline: '2026-08-05', hostelFees: 145000,
    coordinates: { lat: 12.8230, lng: 80.0444 },
  }),
  U({
    name: 'Lovely Professional University', city: 'Phagwara', state: 'Punjab', established: 2005, type: 'private',
    tagline: 'India’s biggest single campus, 600+ programs',
    description: 'LPU’s 600-acre campus on NH-44 is the largest single-campus university in India, with in-house malls, hospitals and workshops. It offers one of the widest program catalogues in the country and aggressive merit scholarships tied to the LPUNEST entrance.',
    approvals: ['UGC', 'AICTE', 'PCI', 'BCI', 'COA'], naacGrade: 'A++', nirfRank: 27,
    feesMin: 120000, feesMax: 320000, avgLPA: 5.8, highestLPA: 64, placementRate: 87,
    streams: ['Engineering', 'Management', 'Design & Architecture', 'Agriculture', 'Pharmacy', 'Arts & Humanities'],
    courses: ['B.Tech', 'MBA', 'B.Des', 'B.Arch', 'B.Pharm', 'B.Sc Agriculture', 'BFA', 'B.Com'],
    branches: ['CSE', 'AI & ML', 'Robotics', 'Fashion Design', 'Agribusiness', 'Pharmacy'],
    recruiters: ['Capgemini', 'Cognizant', 'Amazon', 'Bosch', 'Hitachi', 'Tech Mahindra'],
    entranceExams: ['LPUNEST', 'JEE Main', 'CUET'], internationalPrograms: true,
    studyModes: ['Full-time', 'Online', 'Distance'],
    rating: 4.0, reviewsCount: 8930, popularity: 92, courseCount: 604,
    admissionStatus: 'open', deadline: '2026-08-25', hostelFees: 120000,
    coordinates: { lat: 31.2554, lng: 75.7049 },
  }),
  U({
    name: 'Symbiosis International University', city: 'Pune', state: 'Maharashtra', established: 2002, type: 'deemed',
    tagline: 'Pune’s premier multidisciplinary deemed university',
    description: 'Symbiosis International groups some of India’s most sought-after institutes — SLS for law, SIBM and SCMHRD for management, SIT for engineering and SSMC for media — across hill-top campuses in Pune. Admissions run through SET, SLAT and SNAP.',
    approvals: ['UGC', 'BCI', 'AICTE'], naacGrade: 'A++', nirfRank: 24,
    feesMin: 310000, feesMax: 780000, avgLPA: 11.2, highestLPA: 46, placementRate: 92,
    streams: ['Management', 'Law', 'Engineering', 'Arts & Humanities', 'Computer Applications'],
    courses: ['BBA', 'BA LLB', 'B.Tech', 'MBA', 'BCA', 'BA Media'],
    branches: ['Business Analytics', 'Corporate Law', 'CSE', 'Mass Communication'],
    recruiters: ['Deloitte', 'KPMG', 'HUL', 'Barclays', 'Trilegal', 'AZB & Partners'],
    entranceExams: ['SET', 'SLAT', 'SNAP'], internationalPrograms: true,
    rating: 4.4, reviewsCount: 3310, popularity: 90, courseCount: 96,
    admissionStatus: 'closed', deadline: '2026-05-31', hostelFees: 170000,
    coordinates: { lat: 18.5362, lng: 73.7311 },
  }),
  U({
    name: 'Shiv Nadar University', city: 'Greater Noida', state: 'Uttar Pradesh', established: 2011, type: 'private',
    tagline: 'Research-led liberal education, Ivy-style campus',
    description: 'Founded by the HCL founder’s foundation, Shiv Nadar IoE pairs a 286-acre residential campus with genuinely multidisciplinary academics — engineering students take humanities minors and vice versa. Generous need- and merit-based aid covers a large share of the cohort.',
    approvals: ['UGC'], naacGrade: 'A+', nirfRank: 62,
    feesMin: 300000, feesMax: 480000, avgLPA: 10.4, highestLPA: 65, placementRate: 89,
    streams: ['Engineering', 'Science', 'Management', 'Arts & Humanities'],
    courses: ['B.Tech', 'B.Sc Research', 'BMS', 'BA Research', 'MBA'],
    branches: ['CSE', 'ECE', 'Chemistry', 'Economics', 'English'],
    recruiters: ['Microsoft', 'Adobe', 'American Express', 'ZS Associates', 'Sprinklr'],
    entranceExams: ['SNUSAT', 'JEE Main'], internationalPrograms: true,
    rating: 4.3, reviewsCount: 980, popularity: 72, courseCount: 48,
    admissionStatus: 'open', deadline: '2026-07-28', hostelFees: 190000,
    coordinates: { lat: 28.5266, lng: 77.5747 },
  }),
  U({
    name: 'Chandigarh University', city: 'Mohali', state: 'Punjab', established: 2012, type: 'private',
    tagline: 'Fast-rising NIRF climber with global tie-ups',
    description: 'Chandigarh University has climbed the NIRF rankings faster than any private peer, on the back of 1,000+ recruiter relationships, a dedicated Silicon-Valley-style incubator and exchange agreements with 400+ international universities.',
    approvals: ['UGC', 'AICTE', 'NBA'], naacGrade: 'A+', nirfRank: 20,
    feesMin: 160000, feesMax: 330000, avgLPA: 6.2, highestLPA: 75, placementRate: 91,
    streams: ['Engineering', 'Management', 'Design & Architecture', 'Science', 'Arts & Humanities'],
    courses: ['B.Tech', 'BBA', 'MBA', 'B.Arch', 'B.Des', 'BCA', 'B.Sc'],
    branches: ['CSE', 'AI & ML', 'Blockchain', 'Civil', 'Interior Design'],
    recruiters: ['Amazon', 'IBM', 'Deloitte', 'Hitachi', 'Airtel', 'Flipkart'],
    entranceExams: ['CUCET', 'JEE Main'], internationalPrograms: true,
    rating: 4.1, reviewsCount: 5480, popularity: 91, courseCount: 210,
    admissionStatus: 'open', deadline: '2026-08-10', hostelFees: 130000,
    coordinates: { lat: 30.7710, lng: 76.5764 },
  }),
  U({
    name: 'KIIT University', city: 'Bhubaneswar', state: 'Odisha', established: 2004, type: 'deemed',
    tagline: 'Eastern India’s placement powerhouse',
    description: 'Kalinga Institute of Industrial Technology spreads across 25 campuses in Bhubaneswar and is eastern India’s strongest private placement record-holder. Its sibling KISS institute educates 30,000 tribal students free of cost on the adjacent campus.',
    approvals: ['UGC', 'AICTE', 'NMC', 'BCI'], naacGrade: 'A++', nirfRank: 16,
    feesMin: 180000, feesMax: 460000, avgLPA: 7.0, highestLPA: 63, placementRate: 92,
    streams: ['Engineering', 'Medical & Health Sciences', 'Law', 'Management', 'Science'],
    courses: ['B.Tech', 'MBBS', 'BA LLB', 'MBA', 'BCA', 'B.Sc Nursing'],
    branches: ['CSE', 'IT', 'ECE', 'Medicine', 'Corporate Law'],
    recruiters: ['Accenture', 'Cognizant', 'Capgemini', 'HighRadius', 'Juspay', 'Deloitte'],
    entranceExams: ['KIITEE', 'NEET'], internationalPrograms: true,
    rating: 4.2, reviewsCount: 4110, popularity: 86, courseCount: 120,
    admissionStatus: 'open', deadline: '2026-07-30', hostelFees: 125000,
    coordinates: { lat: 20.3534, lng: 85.8195 },
  }),
  U({
    name: 'Delhi Technological University', city: 'New Delhi', state: 'Delhi NCR', established: 1941, type: 'government',
    tagline: 'Delhi’s flagship state engineering university',
    description: 'Formerly Delhi College of Engineering, DTU is the capital’s premier state technical university. Rock-bottom government fees, a strong product-company placement roster and a fiercely competitive JEE-based intake make it one of the best-value engineering seats in India.',
    approvals: ['UGC', 'AICTE'], naacGrade: 'A+', nirfRank: 29,
    feesMin: 90000, feesMax: 120000, avgLPA: 12.5, highestLPA: 85, placementRate: 90,
    streams: ['Engineering', 'Management', 'Science'],
    courses: ['B.Tech', 'M.Tech', 'MBA', 'B.Des'],
    branches: ['CSE', 'Software Engineering', 'ECE', 'Mechanical', 'Environmental'],
    recruiters: ['Google', 'Microsoft', 'Uber', 'Goldman Sachs', 'DE Shaw', 'Samsung'],
    entranceExams: ['JEE Main'],
    rating: 4.5, reviewsCount: 2870, popularity: 93, courseCount: 38,
    admissionStatus: 'closing-soon', deadline: '2026-07-18', hostelFees: 65000,
    coordinates: { lat: 28.7500, lng: 77.1177 },
  }),
  U({
    name: 'Savitribai Phule Pune University', city: 'Pune', state: 'Maharashtra', established: 1949, type: 'government',
    tagline: 'The Oxford of the East',
    description: 'SPPU anchors Pune’s reputation as a student city, affiliating 700+ colleges and running highly ranked departments in science, social science and management on its historic 411-acre campus. Government fee structures keep quality education accessible.',
    approvals: ['UGC'], naacGrade: 'A+', nirfRank: 37,
    feesMin: 15000, feesMax: 90000, avgLPA: 5.2, highestLPA: 22, placementRate: 78,
    streams: ['Science', 'Management', 'Arts & Humanities', 'Commerce', 'Law'],
    courses: ['B.Sc', 'M.Sc', 'MBA', 'BA', 'M.A.', 'LLB'],
    branches: ['Physics', 'Computer Science', 'Economics', 'Management'],
    recruiters: ['Infosys', 'TCS', 'Persistent', 'Bajaj Finserv', 'Deloitte'],
    entranceExams: ['MHT-CET', 'CUET', 'SPPU Entrance'],
    rating: 4.3, reviewsCount: 3660, popularity: 84, courseCount: 240,
    admissionStatus: 'open', deadline: '2026-08-12', hostelFees: 42000,
    coordinates: { lat: 18.5529, lng: 73.8250 },
  }),
  U({
    name: 'Jamia Millia Islamia', city: 'New Delhi', state: 'Delhi NCR', established: 1920, type: 'government',
    tagline: 'Central university with a century of legacy',
    description: 'Jamia Millia Islamia is a NAAC A++ central university whose architecture, engineering, mass communication and law schools rank among India’s best. Central-university fee levels make it one of the most competitive admissions in the capital.',
    approvals: ['UGC', 'AICTE', 'BCI', 'COA'], naacGrade: 'A++', nirfRank: 3,
    feesMin: 10000, feesMax: 75000, avgLPA: 6.5, highestLPA: 30, placementRate: 82,
    streams: ['Engineering', 'Arts & Humanities', 'Law', 'Design & Architecture', 'Science'],
    courses: ['B.Tech', 'B.Arch', 'BA LLB', 'BA', 'B.Sc', 'MA Mass Communication'],
    branches: ['CSE', 'Civil', 'Architecture', 'Journalism', 'Law'],
    recruiters: ['L&T', 'Maruti Suzuki', 'NDTV', 'Wipro', 'CBRE'],
    entranceExams: ['CUET', 'JEE Main', 'JMI Entrance'],
    rating: 4.4, reviewsCount: 2540, popularity: 82, courseCount: 138,
    admissionStatus: 'closed', deadline: '2026-06-15', hostelFees: 38000,
    coordinates: { lat: 28.5620, lng: 77.2810 },
  }),
  U({
    name: 'Parul University', city: 'Vadodara', state: 'Gujarat', established: 2015, type: 'private',
    tagline: 'Gujarat’s most international private campus',
    description: 'Parul University hosts students from 75+ countries on its 150-acre Vadodara campus, with particularly strong pharmacy, physiotherapy and engineering schools. Its diploma-to-degree lateral pathways and industry MoUs draw a large vocational intake.',
    approvals: ['UGC', 'AICTE', 'PCI', 'NCTE'], naacGrade: 'A++', nirfRank: null,
    feesMin: 85000, feesMax: 260000, avgLPA: 4.5, highestLPA: 30, placementRate: 83,
    streams: ['Engineering', 'Pharmacy', 'Management', 'Medical & Health Sciences', 'Design & Architecture'],
    courses: ['B.Tech', 'B.Pharm', 'MBA', 'BPT', 'B.Des', 'BHMS', 'B.Sc Nursing'],
    branches: ['CSE', 'Pharmacy', 'Physiotherapy', 'Homeopathy', 'Design'],
    recruiters: ['Zydus', 'Sun Pharma', 'TCS', 'Adani', 'Torrent Pharma'],
    entranceExams: ['GUJCET', 'JEE Main', 'CUET'], internationalPrograms: true,
    rating: 3.9, reviewsCount: 3120, popularity: 79, courseCount: 250,
    admissionStatus: 'open', deadline: '2026-08-18', hostelFees: 85000,
    coordinates: { lat: 22.2587, lng: 73.3634 },
  }),
  U({
    name: 'Nirma University', city: 'Ahmedabad', state: 'Gujarat', established: 2003, type: 'private',
    tagline: 'Gujarat’s benchmark for law, pharma and tech',
    description: 'Nirma University’s Institute of Technology, Institute of Law and Institute of Pharmacy are each ranked among the country’s top private schools in their fields. A compact green campus on the SG Highway anchors Ahmedabad’s student ecosystem.',
    approvals: ['UGC', 'AICTE', 'BCI', 'PCI'], naacGrade: 'A+', nirfRank: 61,
    feesMin: 150000, feesMax: 380000, avgLPA: 8.0, highestLPA: 39, placementRate: 90,
    streams: ['Engineering', 'Law', 'Pharmacy', 'Management', 'Science'],
    courses: ['B.Tech', 'BA LLB', 'B.Pharm', 'MBA', 'B.Com LLB'],
    branches: ['CSE', 'Chemical', 'IP Law', 'Pharmaceutics', 'Finance'],
    recruiters: ['Reliance', 'Cadila', 'ICICI Bank', 'Khaitan & Co', 'Infosys'],
    entranceExams: ['JEE Main', 'GUJCET', 'CLAT'],
    rating: 4.3, reviewsCount: 1730, popularity: 77, courseCount: 58,
    admissionStatus: 'closing-soon', deadline: '2026-07-24', hostelFees: 105000,
    coordinates: { lat: 23.1290, lng: 72.5420 },
  }),
  U({
    name: 'Christ University', city: 'Bengaluru', state: 'Karnataka', established: 1969, type: 'deemed',
    tagline: 'Bengaluru’s most sought-after deemed university',
    description: 'Christ (Deemed to be University) combines disciplined academics with one of India’s widest UG catalogues in commerce, humanities, management and law. Its central Bengaluru campus and triple-main honours combinations attract 25,000+ applicants per program.',
    approvals: ['UGC', 'AICTE', 'BCI'], naacGrade: 'A+', nirfRank: 60,
    feesMin: 120000, feesMax: 350000, avgLPA: 6.5, highestLPA: 27, placementRate: 88,
    streams: ['Commerce', 'Management', 'Arts & Humanities', 'Law', 'Science', 'Engineering'],
    courses: ['B.Com', 'BBA', 'BA', 'BA LLB', 'B.Tech', 'B.Sc', 'MBA'],
    branches: ['Finance', 'Psychology', 'Journalism', 'Corporate Law', 'Data Science'],
    recruiters: ['EY', 'KPMG', 'Deloitte', 'Goldman Sachs', 'Federal Bank', 'Oracle'],
    entranceExams: ['CUET', 'Christ Entrance Test'],
    rating: 4.2, reviewsCount: 4890, popularity: 87, courseCount: 132,
    admissionStatus: 'closed', deadline: '2026-05-20', hostelFees: 115000,
    coordinates: { lat: 12.9343, lng: 77.6060 },
  }),
  U({
    name: 'UPES Dehradun', city: 'Dehradun', state: 'Uttarakhand', established: 2003, type: 'private',
    tagline: 'Domain-specialised programs in the Doon valley',
    description: 'The University of Petroleum and Energy Studies pioneered sector-specific degrees — energy, aviation, logistics, legal tech — and now spans design, business and computer science schools on twin forest-edge campuses in Dehradun.',
    approvals: ['UGC', 'AICTE', 'BCI'], naacGrade: 'A', nirfRank: 46,
    feesMin: 280000, feesMax: 440000, avgLPA: 6.8, highestLPA: 50, placementRate: 91,
    streams: ['Engineering', 'Law', 'Management', 'Design & Architecture', 'Computer Applications'],
    courses: ['B.Tech', 'BBA LLB', 'B.Des', 'MBA', 'BCA', 'B.Sc'],
    branches: ['Petroleum', 'Aerospace', 'AI & ML', 'Energy Law', 'Game Design'],
    recruiters: ['ONGC', 'Schlumberger', 'Accenture', 'Infosys', 'Shell'],
    entranceExams: ['UPESEAT', 'ULSAT', 'JEE Main'], internationalPrograms: true,
    rating: 4.0, reviewsCount: 2340, popularity: 76, courseCount: 110,
    admissionStatus: 'open', deadline: '2026-08-08', hostelFees: 160000,
    coordinates: { lat: 30.4180, lng: 77.9680 },
  }),
  U({
    name: 'Bennett University', city: 'Greater Noida', state: 'Uttar Pradesh', established: 2016, type: 'private',
    tagline: 'The Times Group university for new-economy careers',
    description: 'Founded by the Times of India group, Bennett University focuses on media, computer science and entrepreneurship, with a Babson-inspired startup centre and one of the highest CSE placement medians among young private universities.',
    approvals: ['UGC', 'AICTE', 'BCI'], naacGrade: 'A+', nirfRank: null,
    feesMin: 285000, feesMax: 450000, avgLPA: 7.5, highestLPA: 52, placementRate: 90,
    streams: ['Engineering', 'Management', 'Law', 'Arts & Humanities'],
    courses: ['B.Tech', 'BBA', 'BA Journalism', 'BA LLB', 'MBA'],
    branches: ['CSE', 'AI', 'Media Studies', 'Corporate Law'],
    recruiters: ['Times Internet', 'Amazon', 'Paytm', 'Deloitte', 'Zomato'],
    entranceExams: ['JEE Main', 'CUET', 'Bennett Entrance'],
    rating: 4.1, reviewsCount: 860, popularity: 68, courseCount: 34,
    admissionStatus: 'open', deadline: '2026-08-02', hostelFees: 175000,
    coordinates: { lat: 28.4506, lng: 77.5842 },
  }),
  U({
    name: 'Ashoka University', city: 'Sonipat', state: 'Haryana', established: 2014, type: 'private',
    tagline: 'India’s liberal-arts flagship',
    description: 'Ashoka University brought the American liberal-arts model to India: small seminars, a core multidisciplinary curriculum and star faculty across economics, political science and computer science. Need-blind financial aid supports nearly half the student body.',
    approvals: ['UGC'], naacGrade: 'A', nirfRank: null,
    feesMin: 850000, feesMax: 1050000, avgLPA: 9.8, highestLPA: 35, placementRate: 86,
    streams: ['Arts & Humanities', 'Science', 'Management'],
    courses: ['BA Honours', 'B.Sc Honours', 'MA', 'Young India Fellowship'],
    branches: ['Economics', 'Political Science', 'Computer Science', 'Psychology', 'English'],
    recruiters: ['McKinsey', 'BCG', 'Dalberg', 'Teach For India', 'Goldman Sachs'],
    entranceExams: ['Ashoka Aptitude Test'], internationalPrograms: true,
    rating: 4.6, reviewsCount: 720, popularity: 71, courseCount: 26,
    admissionStatus: 'closed', deadline: '2026-04-30', hostelFees: 210000,
    coordinates: { lat: 28.9470, lng: 77.1020 },
  }),
  U({
    name: 'Galgotias University', city: 'Greater Noida', state: 'Uttar Pradesh', established: 2011, type: 'private',
    tagline: 'High-volume tech education on the Yamuna Expressway',
    description: 'Galgotias University pairs affordable fee bands with a large recruiter base drawn from the Noida IT corridor. Its hackathon culture and smart-classroom infrastructure serve one of NCR’s biggest undergraduate tech cohorts.',
    approvals: ['UGC', 'AICTE', 'BCI', 'PCI'], naacGrade: 'A+', nirfRank: null,
    feesMin: 95000, feesMax: 210000, avgLPA: 4.8, highestLPA: 41, placementRate: 84,
    streams: ['Engineering', 'Management', 'Law', 'Pharmacy', 'Computer Applications'],
    courses: ['B.Tech', 'BCA', 'MBA', 'BBA', 'B.Pharm', 'BA LLB'],
    branches: ['CSE', 'AI & ML', 'Cybersecurity', 'Pharmacy'],
    recruiters: ['TCS', 'Wipro', 'HCL', 'Tech Mahindra', 'Byju’s'],
    entranceExams: ['CUET', 'JEE Main'],
    rating: 3.9, reviewsCount: 4230, popularity: 81, courseCount: 176,
    admissionStatus: 'open', deadline: '2026-08-22', hostelFees: 95000,
    coordinates: { lat: 28.3670, lng: 77.5410 },
  }),
  U({
    name: 'Banasthali Vidyapith', city: 'Banasthali', state: 'Rajasthan', established: 1935, type: 'deemed',
    tagline: 'The world’s largest fully residential women’s university',
    description: 'Banasthali Vidyapith has educated women leaders since 1935 through its five-fold education philosophy blending academics, arts, sports and rural outreach. Aviation, pharmacy and computer science are standout departments; fees remain among the lowest in its class.',
    approvals: ['UGC', 'AICTE', 'PCI'], naacGrade: 'A++', nirfRank: 86,
    feesMin: 60000, feesMax: 150000, avgLPA: 4.6, highestLPA: 23, placementRate: 80,
    streams: ['Science', 'Engineering', 'Pharmacy', 'Management', 'Arts & Humanities'],
    courses: ['B.Tech', 'B.Pharm', 'B.Sc', 'BBA', 'BA', 'B.Des'],
    branches: ['CSE', 'Pharmacy', 'Aviation Science', 'Design'],
    recruiters: ['Infosys', 'Accenture', 'Cipla', 'ICICI Bank', 'Capgemini'],
    entranceExams: ['Banasthali Aptitude Test'],
    rating: 4.2, reviewsCount: 1980, popularity: 66, courseCount: 94,
    admissionStatus: 'open', deadline: '2026-07-26', hostelFees: 60000,
    coordinates: { lat: 26.4058, lng: 75.8737 },
  }),
  U({
    name: 'MIT World Peace University', city: 'Pune', state: 'Maharashtra', established: 2017, type: 'private',
    tagline: 'Kothrud’s value-based engineering legacy',
    description: 'MIT-WPU carries forward four decades of the MIT Pune legacy with engineering, management and liberal-arts schools on its Kothrud campus, a peace-studies core inspired by its founder, and consistent top-quartile placements in Pune’s IT ecosystem.',
    approvals: ['UGC', 'AICTE'], naacGrade: 'A++', nirfRank: null,
    feesMin: 190000, feesMax: 400000, avgLPA: 6.4, highestLPA: 51, placementRate: 89,
    streams: ['Engineering', 'Management', 'Science', 'Commerce', 'Law'],
    courses: ['B.Tech', 'MBA', 'BBA', 'B.Sc', 'BA LLB', 'B.Des'],
    branches: ['CSE', 'AI & DS', 'Mechanical', 'Marketing', 'Economics'],
    recruiters: ['Persistent', 'Infosys', 'Mastercard', 'Cummins', 'Barclays'],
    entranceExams: ['MHT-CET', 'JEE Main', 'MIT-WPU CET'],
    rating: 4.1, reviewsCount: 2610, popularity: 80, courseCount: 102,
    admissionStatus: 'closing-soon', deadline: '2026-07-21', hostelFees: 135000,
    coordinates: { lat: 18.5089, lng: 73.8077 },
  }),
  U({
    name: 'Jain University', city: 'Bengaluru', state: 'Karnataka', established: 2009, type: 'deemed',
    tagline: 'Entrepreneurship-first deemed university',
    description: 'Jain (Deemed-to-be University) is known for its incubation centre CIME, a deep sports culture that has produced Olympians, and flexible UG programs across commerce, sciences and humanities spread over multiple Bengaluru campuses.',
    approvals: ['UGC', 'AICTE'], naacGrade: 'A++', nirfRank: 85,
    feesMin: 110000, feesMax: 290000, avgLPA: 5.6, highestLPA: 26, placementRate: 85,
    streams: ['Commerce', 'Management', 'Science', 'Engineering', 'Arts & Humanities'],
    courses: ['B.Com', 'BBA', 'B.Tech', 'BCA', 'B.Sc', 'MBA'],
    branches: ['Fintech', 'Data Science', 'Aerospace', 'Forensic Science'],
    recruiters: ['KPMG', 'Deloitte', 'Mu Sigma', 'TCS', 'Swiggy'],
    entranceExams: ['JET', 'CUET'], studyModes: ['Full-time', 'Online'],
    rating: 4.0, reviewsCount: 3150, popularity: 78, courseCount: 168,
    admissionStatus: 'open', deadline: '2026-08-14', hostelFees: 100000,
    coordinates: { lat: 12.9308, lng: 77.5838 },
  }),
  U({
    name: 'Graphic Era University', city: 'Dehradun', state: 'Uttarakhand', established: 2008, type: 'deemed',
    tagline: 'Uttarakhand’s top-ranked private technical school',
    description: 'Graphic Era consistently posts the strongest NIRF engineering rank in Uttarakhand, with a placement cell that brings 400+ recruiters to Dehradun and research output that punches above its size in computer science and biotechnology.',
    approvals: ['UGC', 'AICTE', 'NBA'], naacGrade: 'A+', nirfRank: 52,
    feesMin: 140000, feesMax: 310000, avgLPA: 5.9, highestLPA: 44, placementRate: 90,
    streams: ['Engineering', 'Management', 'Science', 'Commerce'],
    courses: ['B.Tech', 'MBA', 'BBA', 'B.Com', 'B.Sc', 'BCA'],
    branches: ['CSE', 'AI & ML', 'Biotech', 'Civil', 'Finance'],
    recruiters: ['Amazon', 'Adobe', 'Infosys', 'Cognizant', 'HCL'],
    entranceExams: ['JEE Main', 'GEU Entrance'],
    rating: 4.1, reviewsCount: 2020, popularity: 73, courseCount: 86,
    admissionStatus: 'open', deadline: '2026-08-06', hostelFees: 110000,
    coordinates: { lat: 30.2725, lng: 77.9990 },
  }),
  U({
    name: 'Amrita Vishwa Vidyapeetham', city: 'Coimbatore', state: 'Tamil Nadu', established: 2003, type: 'deemed',
    tagline: 'Top-10 NIRF multidisciplinary research university',
    description: 'Amrita pairs a strong values-based residential culture with serious research output — it ranks in India’s top ten universities overall. Engineering at Coimbatore and medicine at Kochi anchor an eight-campus network across South India.',
    approvals: ['UGC', 'AICTE', 'NMC'], naacGrade: 'A++', nirfRank: 7,
    feesMin: 210000, feesMax: 520000, avgLPA: 8.7, highestLPA: 60, placementRate: 92,
    streams: ['Engineering', 'Medical & Health Sciences', 'Management', 'Science', 'Arts & Humanities'],
    courses: ['B.Tech', 'MBBS', 'MBA', 'B.Sc', 'BDS', 'B.Com'],
    branches: ['CSE', 'AI', 'ECE', 'Medicine', 'Nanotech'],
    recruiters: ['Microsoft', 'Bosch', 'Qualcomm', 'TCS R&D', 'Siemens'],
    entranceExams: ['AEEE', 'NEET', 'JEE Main'], internationalPrograms: true,
    rating: 4.4, reviewsCount: 3480, popularity: 85, courseCount: 207,
    admissionStatus: 'closing-soon', deadline: '2026-07-19', hostelFees: 120000,
    coordinates: { lat: 10.9027, lng: 76.9006 },
  }),
  U({
    name: 'Dev Sanskriti Vishwavidyalaya', city: 'Haridwar', state: 'Uttarakhand', established: 2002, type: 'private',
    tagline: 'Yoga, wellness and value education by the Ganga',
    description: 'Dev Sanskriti Vishwavidyalaya specialises in yoga science, holistic health, rural management and Indian culture studies on a serene Shantikunj campus in Haridwar, with among the lowest fee structures of any private university in India.',
    approvals: ['UGC'], naacGrade: 'A', nirfRank: null,
    feesMin: 20000, feesMax: 60000, avgLPA: 3.2, highestLPA: 9, placementRate: 70,
    streams: ['Science', 'Arts & Humanities', 'Management'],
    courses: ['B.Sc Yoga', 'BA Psychology', 'B.Voc', 'M.Sc Yoga Therapy', 'BBA Rural Management'],
    branches: ['Yoga Science', 'Clinical Psychology', 'Ayurveda Wellness'],
    recruiters: ['Patanjali Wellness', 'Art of Living', 'AYUSH Ministry Projects', 'Wellness Resorts'],
    entranceExams: ['DSVV Entrance'],
    rating: 4.5, reviewsCount: 540, popularity: 48, courseCount: 40,
    admissionStatus: 'open', deadline: '2026-08-28', hostelFees: 30000,
    coordinates: { lat: 29.9080, lng: 78.0920 },
  }),
  U({
    name: 'ITM University', city: 'Gwalior', state: 'Madhya Pradesh', established: 2011, type: 'private',
    tagline: 'Central India’s NAAC A++ private campus',
    description: 'ITM University Gwalior spreads across a green 150-acre campus with schools of engineering, nursing, agriculture and fine arts. Strong regional placement links and an uncommon NAAC A++ grade for its segment make it a central-India draw.',
    approvals: ['UGC', 'AICTE', 'INC'], naacGrade: 'A++', nirfRank: null,
    feesMin: 70000, feesMax: 190000, avgLPA: 4.0, highestLPA: 18, placementRate: 81,
    streams: ['Engineering', 'Medical & Health Sciences', 'Agriculture', 'Arts & Humanities', 'Management'],
    courses: ['B.Tech', 'B.Sc Nursing', 'B.Sc Agriculture', 'BFA', 'MBA', 'BBA'],
    branches: ['CSE', 'Nursing', 'Agronomy', 'Fine Arts'],
    recruiters: ['TCS', 'Infosys', 'Apollo Hospitals', 'ITC Agri', 'HDFC Bank'],
    entranceExams: ['JEE Main', 'ITM NEST'],
    rating: 4.0, reviewsCount: 890, popularity: 58, courseCount: 74,
    admissionStatus: 'open', deadline: '2026-08-16', hostelFees: 80000,
    coordinates: { lat: 26.2530, lng: 78.2020 },
  }),
  U({
    name: 'ISBM University', city: 'Raipur', state: 'Chhattisgarh', established: 2016, type: 'private',
    tagline: 'Affordable degrees for the Chhattisgarh belt',
    description: 'ISBM University serves first-generation learners across Chhattisgarh with low-fee UG programs in commerce, computer applications, education and vocational trades, plus regional-language student support and generous state scholarship integration.',
    approvals: ['UGC'], naacGrade: 'B++', nirfRank: null,
    feesMin: 30000, feesMax: 90000, avgLPA: 3.0, highestLPA: 8, placementRate: 68,
    streams: ['Commerce', 'Computer Applications', 'Management', 'Arts & Humanities', 'Science'],
    courses: ['B.Com', 'BCA', 'BBA', 'BA', 'B.Sc', 'B.Ed'],
    branches: ['Accounting', 'Software Development', 'Education'],
    recruiters: ['Jio', 'Airtel', 'Bandhan Bank', 'Local Industries Board'],
    entranceExams: ['Direct / Merit'],
    rating: 3.8, reviewsCount: 410, popularity: 41, courseCount: 60,
    admissionStatus: 'open', deadline: '2026-09-05', hostelFees: 45000,
    coordinates: { lat: 21.2514, lng: 81.6296 },
  }),
  U({
    name: 'AAFT University of Media and Arts', city: 'Raipur', state: 'Chhattisgarh', established: 2018, type: 'private',
    tagline: 'India’s first media-and-arts-only university',
    description: 'Founded by the Marwah Studios group, AAFT University focuses exclusively on film, animation, journalism, fashion and performing arts, with studio-grade production infrastructure and Mumbai/Noida industry immersion built into every program.',
    approvals: ['UGC'], naacGrade: 'B++', nirfRank: null,
    feesMin: 120000, feesMax: 280000, avgLPA: 4.4, highestLPA: 15, placementRate: 74,
    streams: ['Design & Architecture', 'Arts & Humanities', 'Management'],
    courses: ['BA Film & TV', 'B.Des Fashion', 'B.Sc Animation', 'BA Journalism', 'BBA Event Management'],
    branches: ['Film Making', 'Animation & VFX', 'Fashion Design', 'Journalism'],
    recruiters: ['Zee Studios', 'Balaji Telefilms', 'Red Chillies VFX', 'Times Network'],
    entranceExams: ['AAFT GEE'],
    rating: 4.0, reviewsCount: 380, popularity: 46, courseCount: 45,
    admissionStatus: 'open', deadline: '2026-08-30', hostelFees: 95000,
    coordinates: { lat: 21.1938, lng: 81.3509 },
  }),
  U({
    name: 'C.V. Raman Global University', city: 'Bhubaneswar', state: 'Odisha', established: 2020, type: 'private',
    tagline: 'Odisha’s hands-on engineering specialist',
    description: 'CGU Bhubaneswar grew out of eastern India’s oldest self-financed engineering college, with an unusual focus on workshop-led learning: every engineering student builds working projects from the first semester in its 40+ fabrication and robotics labs.',
    approvals: ['UGC', 'AICTE'], naacGrade: 'A', nirfRank: null,
    feesMin: 110000, feesMax: 200000, avgLPA: 4.9, highestLPA: 29, placementRate: 86,
    streams: ['Engineering', 'Science', 'Management'],
    courses: ['B.Tech', 'M.Tech', 'MBA', 'B.Sc'],
    branches: ['Mechanical', 'CSE', 'Robotics', 'Electrical'],
    recruiters: ['Tata Motors', 'L&T', 'Cognizant', 'Amazon', 'Vedanta'],
    entranceExams: ['OJEE', 'JEE Main'],
    rating: 4.1, reviewsCount: 760, popularity: 57, courseCount: 36,
    admissionStatus: 'open', deadline: '2026-08-11', hostelFees: 75000,
    coordinates: { lat: 20.2260, lng: 85.7350 },
  }),
  U({
    name: 'Rishihood University', city: 'Sonipat', state: 'Haryana', established: 2020, type: 'private',
    tagline: 'Impact-first education in the NCR education city',
    description: 'Rishihood positions itself as India’s first impact university: small cohorts in design, entrepreneurship, psychology and public leadership, mentor networks drawn from founders and policymakers, and a build-your-own-degree credit structure.',
    approvals: ['UGC'], naacGrade: null, nirfRank: null,
    feesMin: 250000, feesMax: 400000, avgLPA: 5.5, highestLPA: 16, placementRate: 77,
    streams: ['Design & Architecture', 'Management', 'Arts & Humanities'],
    courses: ['B.Des', 'BBA Entrepreneurship', 'BA Psychology', 'B.Tech AI'],
    branches: ['Product Design', 'Entrepreneurship', 'Psychology', 'AI'],
    recruiters: ['Razorpay', 'Zerodha ecosystem startups', 'Design studios', 'CIIE.CO'],
    entranceExams: ['RUSAT'],
    rating: 4.3, reviewsCount: 190, popularity: 39, courseCount: 18,
    admissionStatus: 'open', deadline: '2026-08-24', hostelFees: 150000,
    coordinates: { lat: 29.0130, lng: 77.0380 },
  }),
];

/* ────────────────────────── filter + sort helpers ────────────────────────── */

export const UNIVERSITY_TYPES = [
  { value: 'private', label: 'Private' },
  { value: 'government', label: 'Government' },
  { value: 'deemed', label: 'Deemed' },
];

export const STREAM_OPTIONS = [
  'Engineering', 'Management', 'Medical & Health Sciences', 'Science', 'Commerce',
  'Law', 'Design & Architecture', 'Arts & Humanities', 'Pharmacy', 'Computer Applications', 'Agriculture',
];

export const DEGREE_OPTIONS = ['UG', 'PG', 'Diploma', 'PhD'];

export const FACILITY_OPTIONS = ['Hostel', 'Sports Complex', 'Library', 'Labs', 'Wi-Fi Campus', 'Cafeteria', 'Auditorium', 'Medical Centre'];

export const EXAM_OPTIONS = ['JEE Main', 'NEET', 'CUET', 'MHT-CET', 'BITSAT', 'VITEEE', 'SRMJEEE', 'CLAT', 'GUJCET', 'OJEE', 'KIITEE', 'LPUNEST', 'SET', 'MET'];

export const STUDY_MODES = ['Full-time', 'Online', 'Distance'];

export const NAAC_ORDER = ['A++', 'A+', 'A', 'B++', 'B+', 'B'];

export const localStates = () => [...new Set(LOCAL_UNIVERSITIES.map((u) => u.state))].sort();
export const localCities = (state) =>
  [...new Set(
    LOCAL_UNIVERSITIES.filter((u) => !state || u.state === state).map((u) => u.city)
  )].sort();

/**
 * Apply the full marketplace filter object to a university list.
 * Every key is optional; empty values are ignored.
 */
export function filterUniversities(list, f = {}) {
  const q = (f.search || '').trim().toLowerCase();
  return list.filter((u) => {
    if (q) {
      const hay = [u.name, u.city, u.state, ...(u.streams || []), ...(u.courses || [])].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (f.states?.length && !f.states.includes(u.state)) return false;
    if (f.city && u.city !== f.city) return false;
    if (f.types?.length && !f.types.includes(u.type)) return false;
    if (f.streams?.length && !f.streams.some((s) => u.streams?.includes(s))) return false;
    if (f.degrees?.length && !f.degrees.some((d) => u.degrees?.includes(d))) return false;
    if (f.branch) {
      const b = f.branch.toLowerCase();
      if (![...(u.branches || []), ...(u.courses || [])].some((x) => x.toLowerCase().includes(b))) return false;
    }
    if (Array.isArray(f.feeRange)) {
      const [lo, hi] = f.feeRange;
      if (u.fees.max < lo || u.fees.min > hi) return false;
    }
    if (f.minAvgPackage && (u.placements?.avgLPA || 0) < f.minAvgPackage) return false;
    if (f.minHighestPackage && (u.placements?.highestLPA || 0) < f.minHighestPackage) return false;
    if (f.naacGrades?.length && !f.naacGrades.includes(u.naacGrade)) return false;
    if (f.nirfOnly && !u.nirfRank) return false;
    if (f.approvals?.length && !f.approvals.every((a) => u.approvals?.includes(a))) return false;
    if (f.hostel && !u.hostel?.available) return false;
    if (f.scholarship && !(u.scholarships?.length > 0)) return false;
    if (f.exams?.length && !f.exams.some((e) => u.entranceExams?.includes(e))) return false;
    if (f.admissionOpen && u.admissions?.status === 'closed') return false;
    if (f.facilities?.length && !f.facilities.every((x) => u.facilities?.includes(x))) return false;
    if (f.internationalOnly && !u.internationalPrograms) return false;
    if (f.studyModes?.length && !f.studyModes.some((m) => u.studyModes?.includes(m))) return false;
    return true;
  });
}

/** Sort vocabulary shared with SortControl. */
export function sortUniversities(list, sort) {
  const arr = [...list];
  const by = {
    popularity: (a, b) => (b.popularity || 0) - (a.popularity || 0),
    placement: (a, b) => (b.placements?.avgLPA || 0) - (a.placements?.avgLPA || 0),
    package: (a, b) => (b.placements?.avgLPA || 0) - (a.placements?.avgLPA || 0),
    fees_asc: (a, b) => (a.fees?.min || 0) - (b.fees?.min || 0),
    fees_desc: (a, b) => (b.fees?.min || 0) - (a.fees?.min || 0),
    newest: (a, b) => (b.established || 0) - (a.established || 0),
    established: (a, b) => (a.established || 9999) - (b.established || 9999),
    rating: (a, b) => (b.rating || 0) - (a.rating || 0),
    ranking: (a, b) => (a.nirfRank || 999) - (b.nirfRank || 999),
    name: (a, b) => a.name.localeCompare(b.name),
    name_desc: (a, b) => b.name.localeCompare(a.name),
  }[sort] || ((a, b) => (b.popularity || 0) - (a.popularity || 0));
  arr.sort(by);
  // Sponsored-first ordering is preserved for default/popularity views only.
  if (!sort || sort === 'popularity' || sort === 'ranking') {
    arr.sort((a, b) => Number(b.isSponsored) - Number(a.isSponsored));
  }
  return arr;
}

export const getSponsoredUniversities = () =>
  LOCAL_UNIVERSITIES.filter((u) => u.isSponsored);

/** Nearby = same state first, then same region, excluding the given ids. */
export function getNearbyUniversities({ state, city, excludeIds = [], limit = 4 } = {}) {
  const pool = LOCAL_UNIVERSITIES.filter((u) => !excludeIds.includes(u._id));
  const sameCity = pool.filter((u) => city && u.city === city);
  const sameState = pool.filter((u) => u.state === state && !sameCity.includes(u));
  const rest = pool.filter((u) => !sameCity.includes(u) && !sameState.includes(u))
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  return [...sameCity, ...sameState, ...rest].slice(0, limit);
}

export function getLocalUniversityBySlug(slug) {
  return LOCAL_UNIVERSITIES.find((u) => u.slug === slug || u._id === slug) || null;
}
