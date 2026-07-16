import Seo from '../components/common/Seo';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import Container from '../components/layout/Container';

const sections = [
  {
    title: 'Agreement to Terms',
    content: 'By using our platform VidyarthiMitra.org (the "Site"), you confirm that you are at least 13 years of age, you have read and understood these Terms and Conditions, and that you agree to be bound by them. If you do not agree to these terms, please do not use this Site.',
  },
  {
    title: 'Use of the Site',
    content: 'VidyarthiMitra.org is a search engine and educational information portal. You agree to use this Site only for lawful purposes and in a manner that does not infringe the rights of others. You must not misuse our site by knowingly introducing viruses or other malicious material. You must not attempt to gain unauthorized access to our site, the server on which our site is stored, or any server, computer or database connected to our site.',
  },
  {
    title: 'Intellectual Property',
    content: 'All content on this site — including text, graphics, logos, images, and software — is the property of Sankshemam Foundation & Sankshemam Seva Private Ltd. and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works from any content on this site without our express written permission.',
  },
  {
    title: 'User Accounts',
    content: 'When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party.',
  },
  {
    title: 'Disclaimer of Warranties',
    content: 'The information on this site is provided "as is" without any guarantees, conditions or warranties as to its accuracy. VidyarthiMitra.org makes every effort to ensure the accuracy of information published on the portal but cannot guarantee that all information is completely up to date at all times. University rankings, cut-offs, fees, and admission data may change without notice.',
  },
  {
    title: 'Limitation of Liability',
    content: 'To the maximum extent permitted by applicable law, VidyarthiMitra.org shall not be liable for any indirect, incidental, special, consequential or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from your access to or use of (or inability to access or use) the service.',
  },
  {
    title: 'Links to Other Sites',
    content: 'Our Service may contain links to third-party web sites or services that are not owned or controlled by VidyarthiMitra.org. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third party web sites or services. We strongly advise you to read the terms and conditions and privacy policy of any third-party web site that you visit.',
  },
  {
    title: 'Governing Law',
    content: 'These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Pune, Maharashtra.',
  },
  {
    title: 'Changes to Terms',
    content: 'We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms.',
  },
  {
    title: 'Contact Us',
    content: 'If you have any questions about these Terms, please contact us:\nEmail: support@vidyarthimitra.org\nPhone: +91 77200 25900\nAddress: Raghunath Apartment, A-7, 4th Floor, Kothrud, Pune, Maharashtra 411038',
  },
];

export default function TermsAndConditions() {
  return (
    <div className="bg-light-card dark:bg-dark-bg min-h-screen">
      <Seo
        title="Terms and Conditions | Vidyarthi Mitra"
        description="Read the Terms and Conditions governing your use of Vidyarthi Mitra's website and services."
        path="/terms-and-conditions"
      />

      {/* Hero */}
      <div className="relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary-dark/20 to-slate-900/40" />
        <Container className="relative py-16 md:py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-eyebrow !text-primary-300 mb-4 inline-flex items-center gap-2">
              <FileText className="w-4 h-4" aria-hidden="true" /> Legal
            </p>
            <h1 className="text-display-serif !text-white">
              Terms &amp; <span className="text-primary-300">Conditions</span>
            </h1>
          </motion.div>
        </Container>
      </div>

      <Container className="py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="max-w-prose mx-auto bg-white dark:bg-dark-card rounded-card p-6 md:p-10 border border-light-border dark:border-dark-border shadow-card space-y-8"
        >
          {sections.map((s, i) => (
            <div key={s.title} className={i > 0 ? 'border-t border-light-border dark:border-dark-border pt-6' : ''}>
              <h2 className="text-h3 mb-3">{s.title}</h2>
              <div className="space-y-3">
                {s.content.split('\n').map((para, j) => (
                  <p key={j} className="text-body">{para}</p>
                ))}
              </div>
            </div>
          ))}

          <p className="text-caption border-t border-light-border dark:border-dark-border pt-6">
            Last updated: 2024 · VidyarthiMitra.org
          </p>
        </motion.div>
      </Container>
    </div>
  );
}
