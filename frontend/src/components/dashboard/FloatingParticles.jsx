import React from 'react';
import { motion } from 'framer-motion';

const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    size: Math.random() * 2 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 30 + 20,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.12 + 0.03,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-accent"
          style={{
            width: p.size, height: p.size,
            left: `${p.x}%`, top: `${p.y}%`,
            opacity: p.opacity,
          }}
          animate={{
            x: [0, Math.random() * 80 - 40, Math.random() * 80 - 40, 0],
            y: [0, Math.random() * 60 - 30, Math.random() * 60 - 30, 0],
          }}
          transition={{ duration: p.duration, repeat: Infinity, ease: 'linear', delay: p.delay }}
        />
      ))}
    </div>
  );
};

export default FloatingParticles;
