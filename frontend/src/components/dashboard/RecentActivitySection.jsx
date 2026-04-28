import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ChevronRight, Activity } from 'lucide-react';

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1], staggerChildren: 0.1 } },
};
const childVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
};

const RecentActivitySection = ({ history = [] }) => {
  return (
    <motion.section
      className="mt-20 relative z-10"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
    >
      <motion.div className="flex items-center gap-3 mb-6" variants={childVariants}>
        <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
          <Clock className="w-4 h-4 text-accent-light" />
        </div>
        <h2 className="text-xl font-display font-semibold text-white">Recent Scan History</h2>
      </motion.div>

      {history.length === 0 ? (
        <motion.div variants={childVariants} className="bg-bg-card border border-border-default border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-accent/5 border border-accent/10 flex items-center justify-center mb-4 relative">
            <Activity className="w-8 h-8 text-accent/50" />
            <div className="absolute inset-0 rounded-full border border-accent/20 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
          </div>
          <h3 className="text-white font-display font-medium text-lg mb-1">No scans yet</h3>
          <p className="text-text-muted text-sm max-w-sm">Run your first dependency scan above to see detailed security analysis and threat history here.</p>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-3">
          {history.map((scan, i) => (
            <motion.div
              key={i}
              variants={childVariants}
              className="bg-bg-card border border-border-subtle rounded-xl p-4 flex items-center justify-between hover:border-border-focus hover:bg-bg-card-hover transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold text-sm ${
                  scan.risk === 'CRITICAL' ? 'bg-danger/10 text-danger-light border border-danger/20' :
                  scan.risk === 'CAUTION' ? 'bg-warning/10 text-warning-light border border-warning/20' :
                  'bg-safe/10 text-safe-light border border-safe/20'
                }`}>
                  {scan.risk[0]}
                </div>
                <div>
                  <h4 className="text-white font-medium font-mono text-sm">{scan.package} <span className="text-text-muted text-xs">v{scan.version}</span></h4>
                  <span className="text-xs text-text-secondary flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" /> {scan.timestamp}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-accent-light group-hover:translate-x-1 transition-all" />
            </motion.div>
          ))}
        </div>
      )}
    </motion.section>
  );
};

export default RecentActivitySection;
