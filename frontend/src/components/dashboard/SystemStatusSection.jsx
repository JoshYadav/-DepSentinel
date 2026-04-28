import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Server, Database, Brain, Hexagon, Shield, Activity } from 'lucide-react';

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1], staggerChildren: 0.1 } },
};
const childVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
};

const engines = [
  "Static AST Diffing",
  "Heuristic Pattern Matching",
  "YARA Signature Detection",
  "Cryptographic Hash Verification",
  "Behavioral Analysis (AI)"
];

const sources = [
  { name: "PyPI Registry API", status: "Online", icon: Database, color: "text-safe-light", bg: "bg-safe/10" },
  { name: "OSV Vulnerability DB", status: "Online", icon: Server, color: "text-safe-light", bg: "bg-safe/10" },
  { name: "Gemini Intelligence", status: "Online", icon: Brain, color: "text-accent-light", bg: "bg-accent/10" },
  { name: "Immutable Audit Ledger", status: "Ready", icon: Hexagon, color: "text-accent-purple-light", bg: "bg-accent-purple/10" }
];

const SystemStatusSection = () => {
  return (
    <motion.section
      className="mt-20 mb-20 relative z-10"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Detection Engines */}
        <motion.div variants={childVariants} className="bg-bg-card border border-border-subtle rounded-xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-subtle/50">
            <Shield className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-display font-semibold text-white">Detection Engines</h3>
          </div>
          <div className="space-y-4">
            {engines.map((engine, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-text-primary font-medium">{engine}</span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-safe/10 border border-safe/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-safe animate-pulse" />
                  <span className="text-[10px] uppercase font-bold tracking-wider text-safe-light">Active</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Intelligence Sources */}
        <motion.div variants={childVariants} className="bg-bg-card border border-border-subtle rounded-xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-subtle/50">
            <Activity className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-display font-semibold text-white">Intelligence Sources</h3>
          </div>
          <div className="space-y-4">
            {sources.map((source, i) => {
              const Icon = source.icon;
              return (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-bg-primary/50 border border-border-subtle/30">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center ${source.bg}`}>
                      <Icon className={`w-4 h-4 ${source.color}`} />
                    </div>
                    <span className="text-sm font-medium text-white">{source.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-safe" />
                    <span className="text-text-secondary">{source.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

      </div>
    </motion.section>
  );
};

export default SystemStatusSection;
