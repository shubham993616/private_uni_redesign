import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';
import PageSection from '../layout/PageSection';
import { Button } from '../ui';

/**
 * M-13 CTA banner — conversion band on an ink surface. Two modes:
 *  form: "newsletter"  → working subscribe form (the dead homepage form is fixed)
 *  form: "none"        → primary/secondary CTA pair
 *
 * props: { headline, text, form, primary {label,to}, secondary {label,to} }
 */
export default function CTASection({
  headline = 'Never miss an admission deadline',
  text = 'Weekly alerts on application windows, entrance exams and new universities — free, no spam.',
  form = 'newsletter',
  primary,
  secondary,
}) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const subscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error('Enter your email address');
    setSubmitting(true);
    try {
      await api.post('/newsletter/subscribe', { email: email.trim() });
      toast.success('Subscribed! Watch your inbox.');
      setEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not subscribe. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageSection background="ink" spacing="compact">
      <div className="flex flex-col md:flex-row md:items-center gap-6 py-4">
        <div className="flex-1">
          <h2 className="text-h2 !text-white">{headline}</h2>
          <p className="text-support !text-white/70 mt-1.5 max-w-xl">{text}</p>
        </div>
        {form === 'newsletter' ? (
          <form onSubmit={subscribe} className="flex w-full md:w-auto gap-2">
            <label htmlFor="cta-newsletter" className="sr-only">Email address</label>
            <input
              id="cta-newsletter"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-12 flex-1 md:w-72 px-4 rounded-btn bg-white/10 border border-white/15 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <Button type="submit" size="lg" loading={submitting} className="shrink-0">
              Subscribe
            </Button>
          </form>
        ) : (
          <div className="flex gap-3">
            {primary && <Button as={Link} to={primary.to} size="lg">{primary.label}</Button>}
            {secondary && (
              <Button as={Link} to={secondary.to} size="lg" variant="ghost" className="border border-white/20 !text-white hover:!bg-white/10">
                {secondary.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </PageSection>
  );
}
