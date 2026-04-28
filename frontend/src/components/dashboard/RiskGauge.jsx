import React from 'react';
import { motion } from 'framer-motion';

const RiskGauge = ({ score = 0 }) => {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const safePercent = 100 - score;
  const strokeDashoffset = circumference * (1 - safePercent / 100);
  const color = score === 0 ? '#10b981' : score < 50 ? '#f59e0b' : '#ef4444';
  const label = score === 0 ? 'SECURE' : score < 50 ? 'CAUTION' : 'CRITICAL';

  return (
    <div className="relative w-[160px] h-[160px] flex items-center justify-center">
      <div className="absolute inset-0 rounded-full" style={{ boxShadow: `0 0 40px ${color}15, 0 0 80px ${color}08` }} />
      <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(192,38,211,0.08)" strokeWidth="6" />
        <motion.circle
          cx="70" cy="70" r={radius} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
          style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-display font-bold tracking-wider" style={{ color }}>{label}</span>
        <span className="text-xs text-text-muted font-mono mt-1">{score} / 100</span>
      </div>
    </div>
  );
};

export default RiskGauge;
