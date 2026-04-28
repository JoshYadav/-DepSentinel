import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, Lock, Cpu, FileSearch, Fingerprint } from 'lucide-react';

const TypewriterText = ({ text, isActive }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    if (!isActive) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.substring(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 18);
    return () => clearInterval(interval);
  }, [text, isActive]);

  if (!isActive && displayedText === '') return null;
  
  return (
    <span className="text-safe-light font-mono">
      {isActive ? displayedText : text}
      {isActive && (
        <motion.span 
          animate={{ opacity: [1, 0, 1] }} 
          transition={{ repeat: Infinity, duration: 0.7 }}
          className="inline-block w-[7px] h-[14px] bg-accent-light ml-1 align-middle rounded-sm"
        />
      )}
    </span>
  );
};

const stepIcons = [FileSearch, Cpu, Cpu, Shield, Lock, Fingerprint];

function ScanLoader() {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    "Parsing requirements.txt manifest...",
    "Resolving packages from PyPI registry...",
    "Computing version diff analysis...",
    "Running threat pattern detection...",
    "Consulting AI security model...",
    "Verifying cryptographic integrity..."
  ];

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setActiveStep(prev => prev < steps.length - 1 ? prev + 1 : prev);
    }, 900);

    const totalTime = steps.length * 900;
    const progressInterval = setInterval(() => {
      setProgress(prev => prev >= 100 ? 100 : prev + (100 / (totalTime / 40)));
    }, 40);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(8, 11, 20, 0.85)',
      backdropFilter: 'blur(8px)'
    }}>
      <motion.div 
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-xl mx-4"
      >
        {/* Outer glow */}
        <div className="absolute -inset-[1px] bg-gradient-to-b from-accent/30 via-accent-purple/10 to-transparent rounded-2xl blur-sm" />
        
        <div className="relative bg-bg-secondary border border-border-default rounded-2xl overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.5)]">
          {/* Header */}
          <div className="px-6 pt-8 pb-4 flex flex-col items-center">
            {/* Shield animation */}
            <div className="relative mb-6">
              {/* Scan rings */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                className="absolute -inset-5 border border-accent/20 rounded-full"
                style={{ borderTopColor: 'rgba(192,38,211,0.6)', borderLeftColor: 'transparent', borderBottomColor: 'transparent' }}
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 4.5, ease: "linear" }}
                className="absolute -inset-3 border border-accent-purple/15 rounded-full"
                style={{ borderBottomColor: 'rgba(168,85,247,0.5)', borderRightColor: 'transparent', borderTopColor: 'transparent' }}
              />
              
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <Shield className="w-12 h-12 text-accent drop-shadow-[0_0_20px_rgba(192,38,211,0.6)]" strokeWidth={1.5} />
              </motion.div>
            </div>

            <h3 className="font-display text-lg font-semibold text-white tracking-tight">Analyzing Dependencies</h3>
            <p className="text-text-muted text-sm mt-1">Running security pipeline...</p>
          </div>

          {/* Terminal */}
          <div className="mx-6 mb-4 bg-void border border-border-subtle rounded-xl overflow-hidden">
            {/* Terminal title bar */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border-subtle bg-bg-primary/50">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-danger/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-safe/60" />
              </div>
              <span className="text-[10px] text-text-muted font-mono ml-2">depsentinel — scan</span>
            </div>
            
            <div className="p-4 font-mono text-[12px] h-44 overflow-y-auto space-y-2">
              {steps.map((step, index) => (
                <div 
                  key={index} 
                  className={`flex items-start gap-2 transition-all duration-300 ${index <= activeStep ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}
                >
                  {index < activeStep ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-safe mt-0.5 shrink-0" />
                      <span className="text-text-secondary">{step}</span>
                    </>
                  ) : index === activeStep ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="mt-0.5 shrink-0"
                      >
                        <Cpu className="w-3.5 h-3.5 text-accent" />
                      </motion.div>
                      <TypewriterText text={step} isActive={true} />
                    </>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div className="px-6 pb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] text-text-muted font-mono">PROGRESS</span>
              <span className="text-[11px] text-accent font-mono font-semibold">{Math.round(Math.min(progress, 100))}%</span>
            </div>
            <div className="w-full h-1.5 bg-bg-elevated rounded-full overflow-hidden">
              <motion.div 
                className="h-full rounded-full bg-gradient-to-r from-accent-dark via-accent to-accent-light relative"
                style={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.1 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine" />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ScanLoader;
