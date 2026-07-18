import Seo from '../components/common/Seo';
import { motion } from 'framer-motion';
import { Rocket, TrendingUp, Award, Users, BookOpen, Globe } from 'lucide-react';
import Container from '../components/layout/Container';
import { Card, Badge } from '../components/ui';

const teamMembers = [
  {
    name: 'Ravindra',
    role: 'Founder, Chairman & MD',
    qualifications: 'BE, MBA, MIE, GDMM',
    bio: [
      'Mr. Ravindra is a qualified Electrical Engineer from Walchand College of Engineering, a Government aided Autonomous engineering college in Maharashtra and an MBA graduate from India\'s then 3rd best (now in top 10) JBIMS, Mumbai. He has also completed a 2-year GDMM (Graduate Diploma in Materials Management) course. He is a MIE (Member of Institute of Engineers, India). He has an experience of more than 34 years of counselling students from all parts of Maharashtra and India. Most of the students counselled by him got enrolled into IITs, IIMs, top Medical Colleges and other prestigious colleges in India.',
      'He has an experience of counselling almost two generations of students. He has also guided them about entire admission procedure to Top Universities of USA, Canada, Europe, Australia, Singapore, Hong Kong and other major countries of the world. He has inculcated the habit of reading various English & Regional papers daily, since last 45 years, including weeklies & magazines like Employment News, India Today etc. He is well informed about all the national and international rankings of colleges, courses and streams.',
      'With the knowledge that he has acquired over the years, he has decided to aid the students all over the country by launching VidyarthiMitra.org and providing them the insight of current education scenario.',
    ],
    initial: 'R',
  },
  {
    name: 'Pawan Khamgaonkar',
    role: 'Head – Operations',
    qualifications: '',
    bio: [
      'Mr. Pawan is an avid enthusiast and a constant source of motivation. Along with being a resourceful and responsible Educational Researcher, he aims to bring positive change to the educational scenario in India and Abroad. He is known for his positive approach towards work and exceptional interpersonal communication skills. He is also recognized as one of the best team players with fast learning skills to adapt to diverse multicultural environment.',
      'During his days of teaching and guiding, he realized the dilemma students and parents face after entrance exams in choosing the best college, considering the number of colleges & universities available in Maharashtra. Thenceforth, he has contributed majorly in student-learning & educational development. He aspires to develop & identify creative educational resources in today\'s technological era and find meaningful interconnection that will help students to select colleges, courses, universities as per their interest, capacity, marks, category and other parameters and thus ease the admission process.',
    ],
    initial: 'P',
  },
];

const milestones = [
  { year: '1981–2014', label: 'Expert Advice', desc: 'More than 1 lakh students guided with data about various courses and careers.' },
  { year: '2015', label: 'Counselling Students', desc: 'Conducting seminars & one-on-one counselling all over India.' },
  { year: '2016', label: 'Inauguration', desc: 'By Hon. Shri Vinod Tawde, Minister of School, Higher & Technical Education, Maharashtra.' },
  { year: '2017', label: 'Launched Web Portal', desc: 'VidyarthiMitra.org — an extensive search engine for education, courses, colleges, cut-offs, scholarships, jobs & more.' },
  { year: '2018', label: 'Launched App & Aptitude Test', desc: 'Mobile application with college predictor based on cut-offs. Aptitude tests with counselling sessions.' },
  { year: '2019', label: 'Launched Online Mock Exam', desc: 'Mock exams for admission, MHT-CET, JEE and NEET. Huge response as Government converted all exams to online mode.' },
  { year: '2020', label: 'Free Online Mock Exams', desc: 'During the pandemic, VidyarthiMitra.org took initiative to conduct all free online exams and study classes across the state.' },
  { year: '2021', label: 'Career Assessment Test Portal', desc: 'VidyarthiMitra.org Career Assessment Test designed with the help of well-known senior professional psychologists & Artificial Intelligence.' },
];

const stats = [
  { icon: Users, value: '1L+', label: 'Students counselled' },
  { icon: BookOpen, value: '700+', label: 'Universities listed' },
  { icon: Globe, value: '35+', label: 'States covered' },
  { icon: Award, value: '40+', label: 'Years of experience' },
];

export default function About() {
  return (
    <div className="bg-light-card dark:bg-dark-bg min-h-screen pb-20 md:pb-0">
      <Seo
        title="About Us | Vidyarthi Mitra – Our Mission, Team & Story"
        description="Learn about Vidyarthi Mitra — India's trusted education portal. Our mission, vision, founding team, and milestones since 1981."
        path="/about"
      />

      {/* Hero */}
      <div className="relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary-dark/20 to-slate-900/40" aria-hidden="true" />
        <Container className="relative py-16 md:py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-eyebrow !text-primary-300 mb-4 inline-flex items-center gap-2">
              <Rocket className="w-4 h-4" aria-hidden="true" /> Est. 1981
            </p>
            <h1 className="text-display-serif !text-white mb-4">
              About <span className="text-primary-300">Vidyarthi Mitra</span>
            </h1>
            <p className="text-body !text-white/70 max-w-2xl mx-auto">
              India's most trusted education platform — empowering students with precise, authentic, and up-to-date information on courses, colleges, admissions, and careers.
            </p>
          </motion.div>
        </Container>
      </div>

      <Container className="py-16 space-y-16">

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {stats.map((s) => (
            <Card key={s.label} className="p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <s.icon className="w-6 h-6 text-primary" aria-hidden="true" />
              </div>
              <p className="text-stat mb-1">{s.value}</p>
              <p className="text-support">{s.label}</p>
            </Card>
          ))}
        </motion.div>

        {/* About Text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        >
          <Card className="p-6 md:p-10">
            <h2 className="text-h2 mb-6">
              About <span className="text-link">VidyarthiMitra.org</span>
            </h2>
            <div className="space-y-4 max-w-prose">
              <p className="text-body">
                <span className="text-link font-semibold">VidyarthiMitra.org</span> is a search engine for precise, authentic, and up-to-date information on education, skills, and careers. We cover everything from Courses, Schools, and Colleges to admission procedures, Entrance Exams, College &amp; Rank predictors, Govt. &amp; Private Scholarships &amp; Schemes, Education Loans, and Jobs, both in India and abroad.
              </p>
              <p className="text-body">
                We believe that with the right guidance, every student can succeed. That's why VidyarthiMitra.org serves as a one-stop solution for students and parents seeking the latest educational and career information. Our platform is designed to help you secure admission to top colleges, careers, or courses that align with your aspirations.
              </p>
              <p className="text-body">
                Our comprehensive services include <strong>Option Form Filling Assistance</strong> for courses like BE/BTech, BPharm, MBBS, BDS, BAMS, BHMS, MBA, and more. <strong>Admission Guidance</strong> with insights on cut-offs and required documents. <strong>Regular Updates</strong> on admission schedules, and <strong>Post-Admission Support</strong> including help with hostel arrangements and classes in Nominal Fees. We also offer <strong>Counselling &amp; Information</strong> from KG to PG, <strong>Career Aptitude Tests &amp; Mock Exams</strong>, <strong>Job &amp; Skill Training</strong>, and <strong>Study Abroad Guidance</strong>.
              </p>
              <p className="text-body">
                Additionally, we are proud to introduce our <strong>Career Book</strong> and <strong>E-Paper</strong>, designed to benefit the student community by providing valuable insights and information on career planning and opportunities.
              </p>
              <p className="text-support italic">
                www.vidyarthimitra.org is the property of <span className="font-semibold text-link">Sankshemam Foundation &amp; Sankshemam Seva Private Ltd.</span>
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              icon: Rocket,
              title: 'Mission',
              panel: 'border border-primary-200 bg-primary-50 dark:border-primary-900/40 dark:bg-primary-900/20',
              iconWrap: 'bg-primary/15',
              iconColor: 'text-primary-600 dark:text-primary-300',
              heading: '!text-slate-900 dark:!text-white',
              body: '!text-slate-600 dark:!text-white/80',
              text: 'We believe to provide students, parents, teachers and all other interested segments of the society with the most authentic, precise and up-to-date information about education & career in India and Abroad — genuine educational updates, career counselling and unmitigated news — thereby empowering them to make wiser decisions.',
            },
            {
              icon: TrendingUp,
              title: 'Vision',
              panel: 'bg-ink',
              iconWrap: 'bg-white/15',
              iconColor: 'text-white',
              heading: '!text-white',
              body: '!text-white/80',
              text: 'We aim to transform the current educational scenario and to empower students to reach their maximum potential and make lifelong, responsible and meaningful career choices in a global and dynamic world.',
            },
          ].map((item) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className={`${item.panel} rounded-card p-8 shadow-card`}
            >
              <div className={`w-12 h-12 rounded-xl ${item.iconWrap} flex items-center justify-center mb-6`}>
                <item.icon className={`w-6 h-6 ${item.iconColor}`} aria-hidden="true" />
              </div>
              <h3 className={`text-h3 ${item.heading} mb-3`}>{item.title}</h3>
              <p className={`text-body ${item.body}`}>{item.text}</p>
            </motion.div>
          ))}
        </div>

        {/* Our Team */}
        <div>
          <div className="text-center mb-12">
            <p className="text-eyebrow mb-3">The people behind it</p>
            <h2 className="text-h2 font-serif">Our Team</h2>
          </div>

          <div className="space-y-6">
            {teamMembers.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }}
              >
                <Card className="p-6 md:p-10">
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Avatar */}
                    <div className="shrink-0 flex flex-col items-center gap-4">
                      <div className="w-24 h-24 rounded-card bg-primary-100 dark:bg-primary-900/40 border border-primary-200 dark:border-primary-900/40 flex items-center justify-center shadow-card">
                        <span className="text-4xl font-serif font-bold text-primary-700 dark:text-primary-200">{member.initial}</span>
                      </div>
                      <div className="text-center">
                        <p className="text-card-title">{member.name}</p>
                        <p className="text-sm font-semibold text-link dark:text-primary-300">{member.role}</p>
                        {member.qualifications && (
                          <p className="text-caption mt-1">{member.qualifications}</p>
                        )}
                      </div>
                    </div>
                    {/* Bio */}
                    <div className="space-y-4 max-w-prose">
                      {member.bio.map((para, j) => (
                        <p key={j} className="text-body">{para}</p>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Milestones Timeline */}
        <div>
          <div className="text-center mb-12">
            <p className="text-eyebrow mb-3">Our journey</p>
            <h2 className="text-h2 font-serif">Milestones &amp; Achievements</h2>
          </div>

          <div className="relative">
            {/* Center line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-light-border dark:bg-dark-border -translate-x-1/2" aria-hidden="true" />

            <div className="space-y-8">
              {milestones.map((m, i) => (
                <motion.div
                  key={m.year}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
                  className={`relative flex flex-col md:flex-row gap-6 items-center ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  {/* Card */}
                  <Card className="w-full md:w-[45%] p-6">
                    <Badge variant="brand" className="mb-3">{m.label}</Badge>
                    <p className="text-support">{m.desc}</p>
                  </Card>

                  {/* Year bubble — center */}
                  <div className="shrink-0 z-10 w-20 h-20 rounded-full border-4 border-white dark:border-dark-bg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center shadow-card text-primary-800 dark:text-primary-200 font-bold text-xs text-center leading-tight px-1 tabular-nums">
                    {m.year}
                  </div>

                  {/* Spacer */}
                  <div className="hidden md:block w-[45%]" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

      </Container>
    </div>
  );
}
