import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

const StatCard = ({ icon: Icon, value, label, color = 'accent', delay = 0 }) => {
  const colorMap = {
    accent: { text: 'text-accent-light', iconBg: 'bg-accent/12', iconBorder: 'border-accent/20' },
    purple: { text: 'text-accent-purple-light', iconBg: 'bg-accent-purple/12', iconBorder: 'border-accent-purple/20' },
    pink: { text: 'text-accent-pink-light', iconBg: 'bg-accent-pink/12', iconBorder: 'border-accent-pink/20' },
    danger: { text: 'text-danger-light', iconBg: 'bg-danger/12', iconBorder: 'border-danger/20' },
    safe: { text: 'text-safe-light', iconBg: 'bg-safe/12', iconBorder: 'border-safe/20' },
  };
  const c = colorMap[color] || colorMap.accent;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="group relative bg-bg-card border border-border-subtle rounded-xl p-5 flex items-center justify-between transition-all duration-300 hover:border-border-focus cursor-default overflow-hidden shadow-card"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
      </div>
      <div className="relative z-10">
        <span className="text-2xl font-display font-bold text-white">
          {typeof value === 'number' ? <CountUp end={value} duration={2} /> : value}
        </span>
        <p className="text-[11px] text-text-muted uppercase tracking-widest mt-1 font-medium">{label}</p>
      </div>
      <div className={`w-11 h-11 rounded-full ${c.iconBg} border ${c.iconBorder} flex items-center justify-center relative z-10`}>
        <Icon className={`w-5 h-5 ${c.text}`} strokeWidth={1.8} />
      </div>
    </motion.div>
  );
};

export default StatCard;
