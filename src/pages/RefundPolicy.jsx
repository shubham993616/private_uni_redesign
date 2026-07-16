import Seo from '../components/common/Seo';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import Container from '../components/layout/Container';

const sections = [
  {
    title: 'Refund and Cancellation Policy',
    content: `Our focus is absolute student's satisfaction. In the event of your inability to login to your mock tests or to any of our other products, because of technical faults from our end, or for any failed transactions, we will refund back the money, provided the reasons are genuine and proved after investigation.

We shall also refund your money if the products or the mock exams is/are not provided to you, for any reason, even on scheduled day or on any other allotted day. Please read the fine prints of each purchase, before buying it, as it provides all the details about the services or the products you purchase.

Our Policy for cancellations and refunds is as follows:

For Cancellations, please contact us via a mail to: support@vidyarthimitra.org.

Requests for cancellations received later than 7 business days prior to the end of the validity of the product or mock exam, will be treated as cancellation of services and no refund is allowed in such cases.

If paid by credit card, refunds will be issued to the original credit card provided at the time of purchase and in case of payment gateway name payments refund will be made to the same account.`,
  },
];

export default function RefundPolicy() {
  return (
    <div className="bg-light-card dark:bg-dark-bg min-h-screen">
      <Seo
        title="Refund & Cancellation Policy | Vidyarthi Mitra"
        description="Read the Refund and Cancellation Policy for Vidyarthi Mitra's products and services."
        path="/refund-cancellation"
      />

      {/* Hero */}
      <div className="relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary-dark/20 to-slate-900/40" />
        <Container className="relative py-16 md:py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-eyebrow !text-primary-300 mb-4 inline-flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" /> Policy
            </p>
            <h1 className="text-display-serif !text-white">
              Refund &amp; <span className="text-primary-300">Cancellation</span>
            </h1>
          </motion.div>
        </Container>
      </div>

      <Container className="py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="max-w-prose mx-auto bg-white dark:bg-dark-card rounded-card p-6 md:p-10 border border-light-border dark:border-dark-border shadow-card"
        >
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-h2 mb-6 pb-4 border-b border-light-border dark:border-dark-border">{s.title}</h2>
              <div className="space-y-4">
                {s.content.split('\n\n').map((para, i) => (
                  <p key={i} className="text-body">{para}</p>
                ))}
              </div>
            </div>
          ))}
          <p className="mt-8 text-caption border-t border-light-border dark:border-dark-border pt-6">
            Last updated: 2024 · VidyarthiMitra.org
          </p>
        </motion.div>
      </Container>
    </div>
  );
}
