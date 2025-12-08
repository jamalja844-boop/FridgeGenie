import React, { useState, useEffect, useRef } from 'react';
import { Recipe } from '../types';
import { ArrowLeft, ChevronLeft, ChevronRight, Volume2, VolumeX, CheckCircle, RotateCcw, Clock } from 'lucide-react';

interface CookingModeProps {
  recipe: Recipe;
  onClose: () => void;
}

const CookingMode: React.FC<CookingModeProps> = ({ recipe, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const step = recipe.steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / recipe.steps.length) * 100;
  
  // TTS Setup
  const speak = (text: string) => {
    window.speechSynthesis.cancel(); // Stop any previous speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.onend = () => setIsSpeaking(false);
    utterance.onstart = () => setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleNext = () => {
    if (currentStepIndex < recipe.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrev = () => {
    if (isCompleted) {
        setIsCompleted(false);
        return;
    }
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleSpeakToggle = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      speak(step.instruction);
    }
  };

  // Auto-speak when step changes (optional, maybe too intrusive? let's make it manual or persistent toggle. 
  // For "hands-free", users usually want it to just read. Let's trigger once on mount if it's the first step, or on change.)
  useEffect(() => {
    // Only auto-speak if user "enabled" it, but for simplicity in this demo, let's just reset speaking state
    // We won't auto-speak to avoid annoyance, user must click the button.
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [currentStepIndex]);

  useEffect(() => {
     // Cleanup on unmount
     return () => window.speechSynthesis.cancel();
  }, []);

  if (isCompleted) {
    return (
        <div className="fixed inset-0 bg-emerald-50 z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
            <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Bon Appétit!</h2>
                <p className="text-slate-600 mb-8">You've finished cooking {recipe.title}. Enjoy your meal!</p>
                <div className="flex gap-4 justify-center">
                    <button onClick={() => { setIsCompleted(false); setCurrentStepIndex(0); }} className="px-6 py-3 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl font-medium transition-colors flex items-center gap-2">
                        <RotateCcw size={20} /> Cook Again
                    </button>
                    <button onClick={onClose} className="px-6 py-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl font-medium transition-colors shadow-lg shadow-emerald-200">
                        Back to Recipes
                    </button>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900 text-white z-50 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-200 line-clamp-1 max-w-[200px] md:max-w-md">
            {recipe.title}
          </h2>
          <div className="text-sm text-slate-500">
            Step {currentStepIndex + 1} of {recipe.steps.length}
          </div>
        </div>
        <div className="w-10"></div> {/* Spacer for alignment */}
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-slate-800 w-full">
        <div 
          className="h-full bg-emerald-500 transition-all duration-500 ease-out" 
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Step Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 lg:p-20 text-center overflow-y-auto">
        <div className="max-w-3xl mx-auto">
            {step.duration && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-emerald-400 rounded-full text-lg font-medium mb-8">
                    <Clock size={20} />
                    {step.duration}
                </div>
            )}
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-12 text-slate-100">
              {step.instruction}
            </h1>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 md:p-10 border-t border-slate-800 bg-slate-900 flex justify-between items-center gap-4">
        <button 
          onClick={handlePrev}
          disabled={currentStepIndex === 0}
          className="p-4 md:px-8 md:py-4 rounded-2xl bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={32} />
        </button>

        <button 
          onClick={handleSpeakToggle}
          className={`p-6 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-xl ${
            isSpeaking ? 'bg-amber-500 text-white animate-pulse' : 'bg-slate-700 text-white hover:bg-slate-600'
          }`}
          title="Read Aloud"
        >
          {isSpeaking ? <VolumeX size={32} /> : <Volume2 size={32} />}
        </button>

        <button 
          onClick={handleNext}
          className="p-4 md:px-8 md:py-4 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/50 transition-all"
        >
           <ChevronRight size={32} />
        </button>
      </div>
    </div>
  );
};

export default CookingMode;