import { useState } from 'react';
import Seo from '../components/common/Seo';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Send, CheckCircle2, MessageSquare, Clock, Globe } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import Container from '../components/layout/Container';
import { Card, Badge, Button, Input, Select, Textarea } from '../components/ui';

const officeLocations = [
  {
    city: 'PUNE',
    addresses: [
      'Raghunath Apartment, A-7, 4th Floor Opp. Yashwantrao Chavan NatyaGruha, Near Shivaji Maharaj Statue, Kothrud, Pune, Maharashtra 411038',
      '5, Tulsi Bhavan, 1194/14A, Modern College Road (Off F C Road), Shivaji Nagar, Pune (Maharashtra) - 411005',
    ],
    phones: ['+91 77200 25900', '+91 77200 81400'],
    emails: ['contact@vidyarthimitra.org', 'info@vidyarthimitra.org'],
    mapSrc:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3782.952432799!2d73.8190!3d18.5074!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c06bc19c6abb%3A0x781b21bd4e24f2!2sVidyarthi%20Mitra!5e0!3m2!1sen!2sin!4v1683600000000!5m2!1sen!2sin',
  },
  {
    city: 'MUMBAI',
    addresses: [
      'Andhra Mahasabha, 10/C, Lakhamsi Napoo Road, Dadar(E), Mumbai (Maharashtra) - 400014',
    ],
    phones: ['+91 77200 25900', '+91 77200 81400'],
    emails: ['contact@vidyarthimitra.org', 'info@vidyarthimitra.org'],
    mapSrc:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.6!2d72.8477!3d19.0178!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7cf12c9b6c9a5%3A0xde9d4e63e5ef8b9b!2sDadar%2C%20Mumbai!5e0!3m2!1sen!2sin!4v1683600000000!5m2!1sen!2sin',
  },
];

const infoCards = [
  {
    icon: Phone,
    title: 'Call us',
    lines: ['+91 77200 25900', '+91 77200 81400'],
    color: 'bg-info/10 text-info',
  },
  {
    icon: Mail,
    title: 'Email us',
    lines: ['contact@vidyarthimitra.org', 'info@vidyarthimitra.org'],
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: Clock,
    title: 'Working hours',
    lines: ['Mon – Sat: 9:00 AM – 7:00 PM', 'Sunday: Closed'],
    color: 'bg-warning/10 text-warning-text dark:text-warning',
  },
  {
    icon: Globe,
    title: 'Website',
    lines: ['vidyarthimitra.org'],
    color: 'bg-success/10 text-success-text dark:text-success',
  },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error('Please fill name, email, subject and message.');
      return;
    }
    setSending(true);
    try {
      await api.post('/contact', form);
      setSent(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      toast.success('Message sent! We\'ll get back to you soon.');
    } catch {
      toast.error('Failed to send. Please try again or call us directly.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-light-card dark:bg-dark-bg min-h-screen pb-20 md:pb-0">
      <Seo
        title="Contact Us | Vidyarthi Mitra – Pune & Mumbai Office"
        description="Get in touch with Vidyarthi Mitra. Visit our Pune or Mumbai offices, call us, or send a message. We're here to help you find the right career path."
        path="/contact"
      />

      {/* Hero */}
      <div className="relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary-dark/20 to-slate-900/40" aria-hidden="true" />
        <Container className="relative py-16 md:py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-eyebrow !text-primary-300 mb-4 inline-flex items-center gap-2">
              <MessageSquare className="w-4 h-4" aria-hidden="true" /> We're here to help
            </p>
            <h1 className="text-display-serif !text-white mb-4">
              Contact <span className="text-primary-300">Us</span>
            </h1>
            <p className="text-body !text-white/70 max-w-xl mx-auto">
              Have questions about admissions, courses, or our services? Reach out and our team will respond promptly.
            </p>
          </motion.div>
        </Container>
      </div>

      <Container className="py-16 space-y-16">

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {infoCards.map((card) => (
            <Card key={card.title} className="p-6 text-center">
              <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center mx-auto mb-4`}>
                <card.icon className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="text-card-title mb-2">{card.title}</h3>
              {card.lines.map((l) => (
                <p key={l} className="text-support break-all">{l}</p>
              ))}
            </Card>
          ))}
        </motion.div>

        {/* Office Cards + Map */}
        <div>
          <div className="text-center mb-12">
            <p className="text-eyebrow mb-3">Visit us</p>
            <h2 className="text-h2 font-serif">Our Offices</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {officeLocations.map((office, i) => (
              <motion.div
                key={office.city}
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
              >
                <Card className="overflow-hidden h-full">
                  {/* Map */}
                  <div className="h-52 overflow-hidden">
                    <iframe
                      src={office.mapSrc}
                      width="100%" height="100%" style={{ border: 0 }}
                      allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                      title={`${office.city} office map`}
                    />
                  </div>
                  <div className="p-6 space-y-4">
                    <Badge variant="brand">
                      <MapPin className="w-3.5 h-3.5" aria-hidden="true" /> {office.city}
                    </Badge>
                    <div className="space-y-2">
                      {office.addresses.map((addr, ai) => (
                        <div key={ai} className="flex gap-3 text-support">
                          <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                          <span>{addr}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2 pt-3 border-t border-light-border dark:border-dark-border">
                      {office.phones.map((p) => (
                        <a key={p} href={`tel:${p.replace(/\s/g, '')}`} className="flex items-center gap-3 text-support hover:text-link transition-colors">
                          <Phone className="w-4 h-4 text-primary shrink-0" aria-hidden="true" /> {p}
                        </a>
                      ))}
                      {office.emails.map((em) => (
                        <a key={em} href={`mailto:${em}`} className="flex items-center gap-3 text-support hover:text-link transition-colors break-all">
                          <Mail className="w-4 h-4 text-primary shrink-0" aria-hidden="true" /> {em}
                        </a>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        >
          <Card className="overflow-hidden">
            <div className="grid md:grid-cols-5">
              {/* Left panel */}
              <div className="md:col-span-2 bg-primary-dark p-8 md:p-10 flex flex-col justify-between text-white">
                <div>
                  <p className="text-eyebrow !text-white/80 mb-4">Send a message</p>
                  <h3 className="text-h2 !text-white mb-3">Let's talk about your future</h3>
                  <p className="text-support !text-white/75">
                    Whether you need help choosing a course, understanding admission processes, or finding the right university — we're just a message away.
                  </p>
                </div>
                <div className="mt-12 space-y-4">
                  {[
                    { icon: Phone, text: '+91 77200 25900' },
                    { icon: Mail, text: 'contact@vidyarthimitra.org' },
                    { icon: MapPin, text: 'Pune & Mumbai, Maharashtra' },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-3 text-support !text-white/85">
                      <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-white" aria-hidden="true" />
                      </div>
                      {text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right form */}
              <div className="md:col-span-3 p-6 md:p-10">
                {sent ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-success-tint dark:bg-success/10 flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-8 h-8 text-success" aria-hidden="true" />
                    </div>
                    <h3 className="text-h3 mb-2">Message sent!</h3>
                    <p className="text-support mb-6">Our team will get back to you within 24 hours.</p>
                    <Button onClick={() => setSent(false)}>Send another</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Input
                        label="Full name *"
                        name="name" value={form.name} onChange={handleChange} required
                        placeholder="Your name"
                      />
                      <Input
                        label="Email *"
                        name="email" value={form.email} onChange={handleChange} required type="email"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Input
                        label="Phone"
                        name="phone" value={form.phone} onChange={handleChange}
                        placeholder="+91 00000 00000"
                      />
                      <Select
                        label="Subject *"
                        name="subject" value={form.subject} onChange={handleChange} required
                      >
                        <option value="" disabled>Select a topic *</option>
                        <option>Admission Enquiry</option>
                        <option>Course Information</option>
                        <option>Rank Predictor</option>
                        <option>Scholarship Information</option>
                        <option>Technical Support</option>
                        <option>Partnership / Advertisement</option>
                        <option>Other</option>
                      </Select>
                    </div>
                    <Textarea
                      label="Message *"
                      name="message" value={form.message} onChange={handleChange} required rows={5}
                      placeholder="Tell us how we can help you..."
                    />
                    <Button type="submit" size="lg" loading={sending} className="w-full">
                      <Send className="w-4 h-4" aria-hidden="true" /> Send message
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

      </Container>
    </div>
  );
}
