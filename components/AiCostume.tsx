import React, { useState } from 'react';
import { generateCostumeIdeas } from '../services/geminiService';
import { Sparkles, Bot, Loader2 } from 'lucide-react';

const AiCostume: React.FC = () => {
  const [input, setInput] = useState('');
  const [ideas, setIdeas] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setError('');
    try {
      // Check if API key is presumably available in env
      if (!process.env.API_KEY) {
        // Mock response for demo purposes if no API key is present
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIdeas(`
### 🎭 Rodetes AI Suggestions (Mock Mode):

1. **Cyber-Rodetes Punk**: Neon wires woven into traditional hair buns, metallic face paint, and LED-lit suspenders.
2. **Vintage Space Traveler**: 1950s silver suit but with "Rodetes" styled antennas.
3. **The Disco Roller**: Classic roller derby gear, glitter everywhere, and double-bun hairstyle!

*(Add a valid API_KEY to .env to use real Gemini AI)*
        `);
      } else {
        const result = await generateCostumeIdeas(input);
        setIdeas(result);
      }
    } catch (e) {
      setError("The AI party planner is taking a nap. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-party-900 rounded-2xl p-6 md:p-10 shadow-2xl border border-white/10 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-500/20 rounded-full mb-4">
          <Sparkles className="w-8 h-8 text-indigo-300" />
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Not sure what to wear?</h3>
        <p className="text-gray-300">Ask the Rodetes AI for crazy costume ideas based on your style!</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="E.g., I have a blue wig and cowboy boots..."
          className="flex-1 bg-black/30 border border-white/20 rounded-xl px-5 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-party-500 transition-all"
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !input.trim()}
          className="bg-gradient-to-r from-party-600 to-indigo-600 hover:from-party-500 hover:to-indigo-500 text-white font-bold py-3 px-8 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Bot className="w-5 h-5" />}
          <span>Generate</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 text-red-200 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      {ideas && (
        <div className="mt-8 bg-black/40 rounded-xl p-6 border border-white/10 animate-fade-in">
          <h4 className="text-lg font-semibold text-party-300 mb-3 border-b border-white/10 pb-2">Your Custom Ideas:</h4>
          <div className="prose prose-invert max-w-none text-gray-200 whitespace-pre-wrap leading-relaxed">
            {ideas}
          </div>
        </div>
      )}
    </div>
  );
};

export default AiCostume;