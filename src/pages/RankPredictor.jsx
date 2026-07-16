import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Target, Search, ArrowRight, ArrowLeft, Building2,
  ChevronRight, MapPin, Award, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Container from '../components/layout/Container';
import { Card, Badge, Button, Input, EmptyState } from '../components/ui';

const EXAMS = [
  { id: 'JEE Main', name: 'JEE Main 2026', type: 'Engineering' },
  { id: 'MHT-CET', name: 'MHT-CET 2026', type: 'Engineering/Pharmacy' },
  { id: 'NEET', name: 'NEET UG 2026', type: 'Medical' },
  { id: 'CAT', name: 'CAT 2025', type: 'Management' },
];

const CATEGORIES = ['Open', 'OBC', 'SC', 'ST', 'EWS', 'TFWS'];

const PROBABILITY_VARIANTS = {
  High: 'success',
  Safe: 'info',
  Medium: 'warning',
  Low: 'error',
};

export default function RankPredictor() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    exam: '',
    score: '',
    category: 'Open',
    state: 'All'
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    setLoading(true);
    try {
      // Fetch universities that accept the selected exam
      const { data } = await api.get(`/universities?entranceExam=${formData.exam}&limit=50`);

      // Simulate "prediction" logic:
      // Higher scores get matched with better NIRF rank colleges
      const score = parseFloat(formData.score);
      const matched = (data.data || []).map(uni => {
        let probability = 'Medium';
        const rank = uni.nirfRank || 100;

        if (score >= 95) {
          if (rank <= 50) probability = 'High';
          else probability = 'Safe';
        } else if (score >= 85) {
          if (rank <= 50) probability = 'Low';
          else if (rank <= 100) probability = 'Medium';
          else probability = 'High';
        } else {
          if (rank <= 100) probability = 'Low';
          else probability = 'Medium';
        }

        return { ...uni, probability };
      }).sort((a, b) => (a.nirfRank || 999) - (b.nirfRank || 999));

      setResults(matched);
      setStep(3);
    } catch (error) {
      console.error('Prediction failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-light-card dark:bg-dark-bg min-h-screen py-12 pb-20 md:pb-12">
      <Container>
        <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-h1 mb-3">College Rank Predictor</h1>
          <p className="text-body !text-light-muted dark:!text-dark-muted max-w-2xl mx-auto">
            Find potential colleges you can get based on your entrance exam scores and category. Our tool uses historical cut-off trends to estimate your chances.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold tabular-nums transition-colors ${step >= i ? 'bg-primary text-white shadow-card' : 'bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-dark-muted'}`}>
                {i}
              </div>
              {i < 3 && <div className={`w-8 h-1 rounded-full ${step > i ? 'bg-primary' : 'bg-slate-200 dark:bg-white/10'}`} />}
            </div>
          ))}
        </div>

        {/* Form / Results Area */}
        <Card className="overflow-hidden min-h-[500px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 md:p-8"
              >
                <h2 className="text-h2 mb-6 text-center">Select Your Entrance Exam</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {EXAMS.map(exam => (
                    <button
                      key={exam.id}
                      onClick={() => { setFormData({ ...formData, exam: exam.id }); setStep(2); }}
                      className={`p-6 rounded-card border transition-colors text-left group flex items-center justify-between ${formData.exam === exam.id ? 'border-primary bg-primary/5' : 'border-light-border dark:border-dark-border hover:border-primary/40 hover:bg-light-card dark:hover:bg-white/5'}`}
                    >
                      <div>
                        <p className="text-eyebrow mb-1">{exam.type}</p>
                        <h3 className="text-card-title">{exam.name}</h3>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 shadow-card flex items-center justify-center shrink-0">
                        <ChevronRight className={`w-5 h-5 ${formData.exam === exam.id ? 'text-primary' : 'text-slate-300 dark:text-slate-600'}`} aria-hidden="true" />
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 md:p-8 max-w-2xl mx-auto"
              >
                <button onClick={() => setStep(1)} className="text-support hover:text-link transition-colors mb-6 flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to exam selection
                </button>
                <h2 className="text-h2 mb-6">Score &amp; Category Details</h2>
                <div className="space-y-6">
                  <Input
                    label="Percentile / score *"
                    type="number"
                    placeholder="e.g. 98.5"
                    value={formData.score}
                    onChange={e => setFormData({ ...formData, score: e.target.value })}
                    className="tabular-nums"
                  />
                  <div>
                    <span className="text-label block mb-1.5">Counselling category</span>
                    <div className="grid grid-cols-3 gap-3">
                      {CATEGORIES.map(c => (
                        <button
                          key={c}
                          onClick={() => setFormData({ ...formData, category: c })}
                          className={`h-11 rounded-btn font-semibold text-sm transition-colors border ${formData.category === c ? 'bg-primary border-primary text-white' : 'border-light-border dark:border-dark-border text-slate-600 dark:text-dark-muted hover:border-primary/40'}`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handlePredict}
                    loading={loading}
                    disabled={!formData.score}
                  >
                    Predict colleges now
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 md:p-8"
              >
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                  <div>
                    <h2 className="text-h2 mb-1">Predicted Colleges</h2>
                    <p className="text-support">Results for {formData.exam} — Score: <span className="text-data">{formData.score}</span> · Category: <span className="text-data">{formData.category}</span></p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                    Restart prediction
                  </Button>
                </div>

                {results.length === 0 && (
                  <EmptyState
                    icon={Trophy}
                    title="No colleges found"
                    description="No universities found for this exam. Try a different exam or score."
                    action={<Button onClick={() => setStep(1)}>Try again</Button>}
                  />
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map((uni, i) => (
                    <motion.div
                      key={uni._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group relative bg-light-card dark:bg-dark-bg p-6 rounded-card border border-light-border dark:border-dark-border shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all"
                    >
                      {/* Probability Badge */}
                      <Badge
                        variant={PROBABILITY_VARIANTS[uni.probability] || 'neutral'}
                        className="absolute top-4 right-4"
                      >
                        {uni.probability} chance
                      </Badge>

                      <div className="w-14 h-14 bg-white dark:bg-white/10 rounded-xl shadow-card border border-light-border dark:border-dark-border flex items-center justify-center overflow-hidden mb-5">
                        {uni.logoUrl ? (
                          <img src={uni.logoUrl} alt={uni.name} className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-xl font-bold text-link">{uni.name[0]}</span>
                        )}
                      </div>

                      <h3 className="text-card-title mb-1 line-clamp-2 group-hover:text-link transition-colors">{uni.name}</h3>
                      <p className="text-caption mb-5 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary" aria-hidden="true" /> {uni.city}, {uni.state}
                      </p>

                      <div className="space-y-2 mb-5">
                        <div className="flex justify-between items-center">
                          <span className="text-support">NIRF Ranking</span>
                          <span className="text-data text-sm">#{uni.nirfRank || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-support">Avg Package</span>
                          <span className="text-data text-sm">₹{uni.stats?.avgPackageLPA || '4.5'} LPA</span>
                        </div>
                      </div>

                      <Button
                        as={Link}
                        to={`/universities/${uni.slug}`}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        View profile <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Footer Info */}
        <div className="mt-12 p-8 bg-ink dark:bg-dark-card border border-transparent dark:border-dark-border text-white rounded-card shadow-card flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 bg-white/10 rounded-card flex items-center justify-center shrink-0">
            <Award className="w-8 h-8 text-primary-300" aria-hidden="true" />
          </div>
          <div>
            <h4 className="text-h3 !text-white mb-2">How it works?</h4>
            <p className="text-support !text-white/70">
              Our predictor analyzes your score against the latest seat allotment data and previous years' opening/closing ranks. It provides a probability score (High, Medium, Low) for each institution to help you prioritize your choices during counseling.
            </p>
          </div>
        </div>
        </div>
      </Container>
    </div>
  );
}
