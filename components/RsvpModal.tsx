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
      <div className="relative bg-gray-900 border border-party-500/30 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-party-900 to-purple-900 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Join the Party!</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {submitted ? (
            <div className="text-center py-10">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">You're on the list!</h3>
              <p className="text-gray-400">Get ready to rock the Rodetes.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-party-500 focus:border-transparent outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  required
                  type="email"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-party-500 focus:border-transparent outline-none transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Number of Guests</label>
                <select
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-party-500 focus:border-transparent outline-none transition-all"
                  value={formData.guestsCount}
                  onChange={(e) => setFormData({...formData, guestsCount: Number(e.target.value)})}
                >
                  {[1, 2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Dietary Restrictions</label>
                <textarea
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-party-500 focus:border-transparent outline-none transition-all h-24 resize-none"
                  value={formData.dietaryRestrictions}
                  onChange={(e) => setFormData({...formData, dietaryRestrictions: e.target.value})}
                  placeholder="Optional..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-party-600 hover:bg-party-500 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-party-500/50 transition-all transform hover:-translate-y-1 mt-4"
              >
                Confirm RSVP
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RsvpModal;