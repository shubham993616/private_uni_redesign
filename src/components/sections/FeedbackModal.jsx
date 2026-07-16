import { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';
import { Modal, Input, Textarea, Button, Select } from '../ui';
import { CheckCircle2 } from 'lucide-react';

/**
 * Feedback / testimonial submission — POSTs to the public /testimonials
 * moderation queue (isApproved:false server-side). Inline validation via the
 * form primitives; success state confirms the moderation step honestly.
 */
export default function FeedbackModal({ open, onClose }) {
  const [form, setForm] = useState({ name: '', role: '', university: '', content: '', rating: 5 });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const upd = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Enter your name';
    if (!form.role.trim()) errs.role = 'Tell us who you are (student, parent…)';
    if (form.content.trim().length < 10) errs.content = 'Write at least a sentence or two';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      await api.post('/testimonials', { ...form, rating: Number(form.rating) });
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit right now. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const close = () => {
    onClose();
    setTimeout(() => { setDone(false); setForm({ name: '', role: '', university: '', content: '', rating: 5 }); setErrors({}); }, 200);
  };

  return (
    <Modal open={open} onClose={close} title={done ? undefined : 'Share your experience'} size="sm">
      {done ? (
        <div className="text-center py-6">
          <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" aria-hidden="true" />
          <h3 className="text-h3 mb-1">Thank you!</h3>
          <p className="text-support">Your story goes to our moderation team and appears on the site once approved.</p>
          <Button onClick={close} className="mt-5">Done</Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5" noValidate>
          <Input label="Your name" value={form.name} onChange={upd('name')} error={errors.name} placeholder="e.g. Aarav Patil" />
          <Input label="You are a…" value={form.role} onChange={upd('role')} error={errors.role} placeholder="Student · Parent · Counsellor" />
          <Input label="University (optional)" value={form.university} onChange={upd('university')} placeholder="Where did you get admitted?" />
          <Select
            label="Rating"
            value={form.rating}
            onChange={upd('rating')}
            options={[5, 4, 3, 2, 1].map((n) => ({ value: n, label: `${n} star${n > 1 ? 's' : ''}` }))}
          />
          <Textarea label="Your experience" value={form.content} onChange={upd('content')} error={errors.content} rows={4} placeholder="How did Vidyarthi Mitra help your search?" />
          <p className="text-caption">Submissions are reviewed before publishing. We never post your contact details.</p>
          <Button type="submit" loading={submitting} className="w-full" size="lg">Submit for review</Button>
        </form>
      )}
    </Modal>
  );
}
