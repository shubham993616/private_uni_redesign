import { useState } from 'react';
import { Settings, Save, MapPin, BookOpen, Building } from 'lucide-react';

export default function Preferences({ profile, onSave }) {
  const [formData, setFormData] = useState({
    state: profile.state || '',
    preferredStates: profile.preferredStates || [],
    preferredCourse: profile.preferredCourse || '',
    collegeType: profile.collegeType || 'both',
    stream: profile.stream || '',
    currentClass: profile.currentClass || ''
  });

  const [newState, setNewState] = useState('');

  const handleAddState = () => {
    if (newState && !formData.preferredStates.includes(newState)) {
      setFormData({ ...formData, preferredStates: [...formData.preferredStates, newState] });
      setNewState('');
    }
  };

  const handleRemoveState = (s) => {
    setFormData({ ...formData, preferredStates: formData.preferredStates.filter(st => st !== s) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-h2 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" aria-hidden="true" /> Preferences
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Current Location */}
          <div className="space-y-1.5">
            <label className="text-label flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" aria-hidden="true" /> Current state
            </label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder="e.g. Maharashtra"
              className="input-field text-sm"
            />
          </div>

          {/* Academic Info */}
          <div className="space-y-1.5">
            <label className="text-label flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" aria-hidden="true" /> Preferred stream
            </label>
            <select
              value={formData.stream}
              onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
              className="input-field text-sm"
            >
              <option value="">Select Stream</option>
              <option value="Engineering">Engineering</option>
              <option value="Medical">Medical</option>
              <option value="Management">Management</option>
              <option value="Law">Law</option>
              <option value="Arts">Arts</option>
              <option value="Science">Science</option>
            </select>
          </div>

          {/* Preferred States */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-label flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" aria-hidden="true" /> Preferred states for education
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newState}
                onChange={(e) => setNewState(e.target.value)}
                placeholder="Add a state..."
                className="input-field text-sm"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddState())}
              />
              <button type="button" onClick={handleAddState} className="btn-primary !py-2 !px-4 text-sm">Add</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.preferredStates.map(s => (
                <span key={s} className="badge badge-blue flex items-center gap-1.5 py-1.5">
                  {s}
                  <button type="button" onClick={() => handleRemoveState(s)} className="hover:text-red-500" aria-label={`Remove ${s}`}>x</button>
                </span>
              ))}
              {formData.preferredStates.length === 0 && <p className="text-caption">No preferred states added.</p>}
            </div>
          </div>

          {/* College Type */}
          <div className="space-y-1.5">
            <label className="text-label flex items-center gap-2">
              <Building className="w-4 h-4 text-primary" aria-hidden="true" /> College type
            </label>
            <div className="flex gap-4 mt-2">
              {['private', 'deemed', 'both'].map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="collegeType"
                    value={type}
                    checked={formData.collegeType === type}
                    onChange={(e) => setFormData({ ...formData, collegeType: e.target.value })}
                    className="accent-primary focus:ring-primary"
                  />
                  <span className="text-sm capitalize text-light-text dark:text-dark-text">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Target Course */}
          <div className="space-y-1.5">
            <label className="text-label flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" aria-hidden="true" /> Preferred course
            </label>
            <input
              type="text"
              value={formData.preferredCourse}
              onChange={(e) => setFormData({ ...formData, preferredCourse: e.target.value })}
              placeholder="e.g. B.Tech Computer Science"
              className="input-field text-sm"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-light-border dark:border-dark-border">
          <button type="submit" className="btn-primary flex items-center gap-2 w-full md:w-auto justify-center">
            <Save className="w-4 h-4" aria-hidden="true" /> Save preferences
          </button>
        </div>
      </form>
    </div>
  );
}
