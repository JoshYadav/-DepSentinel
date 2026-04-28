import React from 'react';
import { motion } from 'framer-motion';
import { Scan, Shield, Lock, Zap } from 'lucide-react';

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1], staggerChildren: 0.1 } },
};
const childVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
};

const features = [
  {
    icon: Scan, title: 'Static Analysis', subtitle: 'Deep code diff inspection',
    desc: 'Compares package source against known-good PyPI distributions to detect injected code, unauthorized modifications, and supply-chain tampering.',
    glowColor: 'rgba(192, 38, 211, 0.4)',
  },
  {
    icon: Shield, title: 'Threat Patterns', subtitle: 'Malicious signature detection',
    desc: 'Scans for obfuscated payloads, base64 exfiltration, reverse shells, credential harvesting, and 15+ known malicious code patterns.',
    glowColor: 'rgba(168, 85, 247, 0.4)',
  },
  {
    icon: Lock, title: 'Hash Integrity', subtitle: 'Cryptographic verification',
    desc: 'Validates SHA-256 checksums of every package against PyPI registry hashes to ensure binary integrity and prevent man-in-the-middle attacks.',
    glowColor: 'rgba(236, 72, 153, 0.4)',
  },
  {
    icon: Zap, title: 'AI Analysis', subtitle: 'Gemini-powered insights',
    desc: 'Leverages Google Gemini to perform deep behavioral analysis, detect zero-day obfuscation techniques, and provide human-readable threat summaries.',
    glowColor: 'rgba(232, 121, 249, 0.4)',
  },
];

const FeatureSection = () => (
  <motion.section
    className="mt-20 relative z-10"
    variants={sectionVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-80px' }}
  >
    {/* Section Header */}
    <motion.div className="text-center mb-10" variants={childVariants}>
      <h2 className="text-2xl font-display font-bold text-white tracking-tight">Security Pipeline</h2>
      <div className="mt-3 mx-auto w-16 h-[2px] rounded-full bg-gradient-to-r from-transparent via-accent to-transparent" />
    </motion.div>

    {/* 2x2 Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {features.map(({ icon: Icon, title, subtitle, desc, glowColor }) => (
        <motion.div
          key={title}
          variants={childVariants}
          className="group relative bg-bg-card border border-border-subtle rounded-xl p-6 hover:border-border-focus transition-all duration-300 cursor-default shadow-card overflow-hidden"
        >
          {/* Hover glow */}
          <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl pointer-events-none"
            style={{ background: glowColor }}
          />

          <div className="relative z-10 flex items-start gap-4">
            {/* Glowing icon */}
            <div className="shrink-0 w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center relative">
              <Icon className="w-6 h-6 text-accent-light" strokeWidth={1.5} />
              <div className="absolute inset-0 rounded-xl animate-pulse-slow" style={{ boxShadow: `0 0 18px ${glowColor}` }} />
            </div>

            <div className="min-w-0">
              <h3 className="text-[15px] font-display font-semibold text-white">{title}</h3>
              <p className="text-xs text-accent-light font-medium mt-0.5">{subtitle}</p>
              <p className="text-[12px] text-text-muted leading-relaxed mt-2">{desc}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.section>
);

export default FeatureSection;
