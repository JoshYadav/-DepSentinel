import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, Code2, AlertTriangle, ArrowLeft, XCircle, ChevronRight } from 'lucide-react';

function AlertBlock() {
  const location = useLocation();
  const packageData = location.state?.packageData;
  const riskData = packageData?.risk || {};
  const aiExplanation = riskData?.ai_explanation || {};

  const pkgName = packageData?.package || 'Unknown Package';
  const patterns = packageData?.patterns?.categories || {};

  const allThreats = Object.entries(patterns).flatMap(([cat, matches]) => 
    matches.map(m => ({ category: cat, ...m }))
  );

  const titleText = "THREAT DETECTED";

  // Background particles
  const particles = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    size: Math.floor(Math.random() * 3) + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 12,
    opacity: Math.random() * 0.1 + 0.03,
  }));

  return (
    <motion.div 
      className="max-w-[800px] mx-auto min-h-[70vh] flex flex-col items-center justify-center relative pb-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background vignette */}
      <div className="fixed inset-0 pointer-events-none z-0" 
        style={{ 
          background: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(239,68,68,0.04) 0%, transparent 70%)'
        }} 
      />
      
      {/* CRT scanlines overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.02]" 
        style={{ background: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 4px)' }}
      />
      
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute bg-danger rounded-full"
            style={{ 
              width: p.size, height: p.size,
              left: `${p.x}%`,
              opacity: p.opacity,
            }}
            animate={{ y: [`${p.y}%`, `${p.y - 30}%`, `${p.y}%`] }}
            transition={{ duration: p.duration, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center text-center mb-8 z-10">
        {/* Animated Shield */}
        <motion.div 
          className="relative mb-6"
          animate={{ 
            scale: [1, 1.06, 1], 
            filter: ['drop-shadow(0 0 15px rgba(239,68,68,0.2))', 'drop-shadow(0 0 40px rgba(239,68,68,0.7))', 'drop-shadow(0 0 15px rgba(239,68,68,0.2))'] 
          }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          {/* Pulse rings */}
          <motion.div
            className="absolute inset-0 -m-4 border-2 border-danger/20 rounded-full"
            animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
          />
          <motion.div
            className="absolute inset-0 -m-4 border border-danger/10 rounded-full"
            animate={{ scale: [1, 2.2], opacity: [0.3, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeOut", delay: 0.3 }}
          />
          
          <div className="w-20 h-20 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center relative">
            <ShieldAlert className="w-10 h-10 text-danger" strokeWidth={1.5} />
          </div>
        </motion.div>
        
        {/* Title with staggered letters */}
        <h1 className="text-4xl font-display font-extrabold text-danger tracking-[0.2em] flex gap-0.5">
          {titleText.split('').map((char, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.2 }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </h1>
        <p className="text-text-secondary mt-3 text-base max-w-lg leading-relaxed">
          The installation of <strong className="text-white font-mono text-sm">{pkgName}</strong> was blocked due to severe malicious patterns.
        </p>
      </div>

      {/* Threat Details Card */}
      <motion.div 
        className="w-full relative z-10"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {/* Outer glow border */}
        <div className="absolute -inset-[1px] bg-gradient-to-b from-danger/30 via-danger/10 to-transparent rounded-2xl blur-sm" />
        
        <div className="relative bg-bg-secondary border border-danger/20 rounded-2xl overflow-hidden shadow-[0_20px_80px_rgba(239,68,68,0.1)]">
          
            {/* Header */}
            <div className="px-6 py-4 border-b border-danger/15 flex justify-between items-center bg-danger/5">
              <div className="flex items-center gap-3">
                <Code2 className="w-4 h-4 text-danger-light" strokeWidth={2} />
                <h2 className="text-white font-display font-bold tracking-wide uppercase text-sm">Threat Details</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-danger text-white px-3 py-1 rounded-md text-[11px] font-bold tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.4)] font-mono">
                  CRITICAL
                </span>
                {aiExplanation.attack_type && (
                  <span className={`bg-orange-500/10 text-orange-400 border border-orange-500/25 text-[11px] font-bold px-2 py-1 rounded-md tracking-widest font-mono`}>
                    {aiExplanation.attack_type}
                  </span>
                )}
              </div>
            </div>

           {/* Threats List */}
           <div className="p-6">
             {allThreats.length > 0 ? (
               <div className="space-y-3">
                 {allThreats.map((threat, idx) => (
                   <motion.div 
                     key={idx} 
                     className="bg-danger/5 border border-danger/15 rounded-xl p-4 hover:bg-danger/8 hover:border-danger/25 transition-all duration-300"
                     initial={{ x: -15, opacity: 0 }}
                     animate={{ x: 0, opacity: 1 }}
                     transition={{ delay: 0.3 + (idx * 0.05), duration: 0.3 }}
                   >
                     <div className="flex items-start gap-3">
                       <div className="mt-1 shrink-0">
                         <span className="flex h-2.5 w-2.5 relative">
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75" />
                           <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-danger" />
                         </span>
                       </div>
                       <div className="flex-1 min-w-0">
                         <div className="flex items-center justify-between mb-1.5 gap-2">
                           <span className="text-danger-light font-display font-bold text-sm uppercase tracking-wide">{threat.category}</span>
                           <span className="text-text-muted text-[11px] font-mono shrink-0">Line {threat.line}</span>
                         </div>
                         <p className="text-text-primary text-sm leading-relaxed">{threat.description}</p>
                         <div className="mt-3 bg-void border border-danger/15 rounded-lg p-3 overflow-x-auto">
                           <code className="text-danger-light/90 font-mono text-[12px] whitespace-pre">{threat.match}</code>
                         </div>
                       </div>
                     </div>
                   </motion.div>
                 ))}
               </div>
             ) : (
               <>
                 {aiExplanation && Object.keys(aiExplanation).length > 0 ? (
                   <>
                     {aiExplanation.specific_concerns && aiExplanation.specific_concerns.length > 0 ? (
                       <div className="space-y-3">
                         <p className="text-text-muted text-[10px] uppercase font-bold tracking-widest mb-2">Specific Concerns</p>
                         <ul className="space-y-2">
                           {aiExplanation.specific_concerns.map((concern, i) => (
                             <motion.li 
                               key={i}
                               initial={{ opacity: 0, x: -10 }}
                               animate={{ opacity: 1, x: 0 }}
                               transition={{ delay: 0.3 + i * 0.05, duration: 0.3 }}
                               className="flex items-start gap-2 text-text-primary text-sm"
                             >
                               <AlertTriangle className="w-3 h-3 text-danger mt-1 shrink-0" />
                               <span>{concern}</span>
                             </motion.li>
                           ))}
                         </ul>
                       </div>
                     ) : null}
                     
                     {aiExplanation.behavioral_intent ? (
                       <div className="space-y-4">
                         <p className="text-text-muted text-[10px] uppercase font-bold tracking-widest mb-2">Behavioral Intent</p>
                         <p className="text-text-primary font-mono text-[13px] leading-relaxed">
                           {aiExplanation.behavioral_intent?.startsWith('AI analysis failed:') ? 'AI analysis temporarily unavailable — static detection results displayed above' : aiExplanation.behavioral_intent}
                         </p>
                       </div>
                     ) : null}
                     
                     {aiExplanation.soc_action ? (
                       <div className="mt-6 pt-4 border-t border-danger/20">
                         <p className="text-text-muted text-[10px] uppercase font-bold tracking-widest mb-2">Recommended Action</p>
                         <div className="bg-danger/5 border border-danger/20 rounded-lg p-4">
                           <p className="text-text-primary font-mono text-[13px] leading-relaxed">
                             {aiExplanation.soc_action}
                           </p>
                         </div>
                       </div>
                     ) : null}
                     
                     <div className="mt-4">
                       <span className={`bg-danger text-white px-3 py-1 rounded-md text-[11px] font-bold tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.4)] font-mono`}>
                         {aiExplanation.attack_type || 'UNKNOWN'}
                       </span>
                     </div>
                   </>
                 ) : (
                   <div className="text-center text-text-muted py-10">
                     <AlertTriangle className="w-8 h-8 mx-auto mb-3 opacity-40" />
                     <p>No specific threat patterns provided in the payload.</p>
                   </div>
                 )}
               </>
             )}
           </div>
          
          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-danger/15 flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 text-text-muted hover:text-white transition-colors text-sm font-medium">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
            <Link 
              to="/" 
              className="bg-danger/10 border border-danger/30 text-danger-light hover:bg-danger hover:text-white transition-all duration-300 px-6 py-2.5 rounded-lg font-display font-bold text-sm tracking-wide hover:shadow-glow-danger"
            >
              ACKNOWLEDGE & DISMISS
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default AlertBlock;
