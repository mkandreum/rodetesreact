import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { Guest } from '../types';

interface RsvpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RsvpModal: React.FC<RsvpModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<Guest>({
    name: '',
    email: '',
    guestsCount: 1,
    dietaryRestrictions: ''
  });
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
      // Reset form after a delay and close
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', email: '', guestsCount: 1, dietaryRestrictions: '' });
        onClose();
      }, 3000);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative bg-black border-2 border-white w-full max-w-md shadow-[0_0_20px_rgba(255,255,255,0.2)] transform transition-all p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
          <h2 className="text-3xl font-bold font-pixel text-white text-glow-white">JOIN THE PARTY</h2>
          <button onClick={onClose} className="text-white hover:text-party-500 transition-colors">
            <X className="w-8 h-8" />
          </button>
        </div>

        {/* Content */}
        <div>
          {submitted ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-3xl font-pixel text-white mb-2">YOU'RE ON THE LIST!</h3>
              <p className="text-gray-400 font-pixel text-xl">GET READY TO ROCK.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xl font-pixel text-gray-300 mb-1">FULL NAME</label>
                <input
                  required
                  type="text"
                  className="w-full bg-[#111] border border-gray-700 p-2 text-white font-pixel text-lg focus:border-party-500 outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xl font-pixel text-gray-300 mb-1">EMAIL</label>
                <input
                  required
                  type="email"
                  className="w-full bg-[#111] border border-gray-700 p-2 text-white font-pixel text-lg focus:border-party-500 outline-none transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xl font-pixel text-gray-300 mb-1">GUESTS</label>
                <select
                  className="w-full bg-[#111] border border-gray-700 p-2 text-white font-pixel text-lg focus:border-party-500 outline-none transition-all"
                  value={formData.guestsCount}
                  onChange={(e) => setFormData({ ...formData, guestsCount: Number(e.target.value) })}
                >
                  {[1, 2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xl font-pixel text-gray-300 mb-1">DIETARY RESTRICTIONS</label>
                <textarea
                  className="w-full bg-[#111] border border-gray-700 p-2 text-white font-pixel text-lg focus:border-party-500 outline-none transition-all h-24 resize-none"
                  value={formData.dietaryRestrictions}
                  onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                  placeholder="OPTIONAL..."
                />
              </div>

              <button
                type="submit"
                className="w-full neon-btn font-pixel text-2xl py-3 mt-6"
              >
                CONFIRM RSVP
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RsvpModal;