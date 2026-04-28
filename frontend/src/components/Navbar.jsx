import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Activity, BarChart3, Database, Bell, Settings, Search } from 'lucide-react';
import SearchModal from './SearchModal';

function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Dashboard', icon: Activity },
    { path: '/threat-center', label: 'Threats', icon: Shield },
    { path: '/ledger', label: 'Audit Ledger', icon: Database },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      scrolled 
        ? 'h-14 bg-[#0a0b1e]/92 backdrop-blur-xl shadow-[0_1px_0_rgba(192,38,211,0.1),0_4px_30px_rgba(0,0,0,0.4)]' 
        : 'h-16 bg-transparent'
    }`}>
      
      {/* Animated top accent line */}
      <div className="absolute top-0 left-0 w-full h-[1px] overflow-hidden">
        <motion.div
          className="h-full w-full"
          style={{
            background: 'linear-gradient(90deg, transparent, #c026d3, #a855f7, #ec4899, transparent)',
            backgroundSize: '200% 100%',
          }}
          animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="h-full max-w-[1500px] mx-auto px-6 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div
            className="relative"
            whileHover={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.4 }}
          >
            <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <img src="/logo.svg" alt="DepSentinel Logo" className="w-8 h-8 relative z-10" />
          </motion.div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display font-bold text-white text-lg tracking-tight">
              DepSentinel
            </span>
          </div>
        </Link>

        {/* Center Nav Links — pill container */}
        <div className="flex items-center gap-1 bg-bg-secondary/60 backdrop-blur-sm border border-border-subtle rounded-full px-1.5 py-1">
          {navLinks.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                isActive(path)
                  ? 'text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {isActive(path) && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 bg-accent/15 border border-accent/30 rounded-full"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon className="w-3.5 h-3.5 relative z-10" strokeWidth={2} />
              <span className="relative z-10">{label}</span>
            </Link>
          ))}
          
          {/* Search icon in nav pill */}
          <button 
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="relative px-3 py-1.5 rounded-full text-text-muted hover:text-text-primary transition-colors"
          >
            <Search className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* Right Side — notification + settings + status */}
        <div className="flex items-center gap-3">
          <button title="Alerts coming soon" className="w-9 h-9 rounded-full bg-bg-elevated/60 border border-border-subtle flex items-center justify-center text-text-muted hover:text-accent-light hover:border-accent/30 transition-all duration-300">
            <Bell className="w-4 h-4" strokeWidth={1.8} />
          </button>
          <button title="Configuration coming soon" className="w-9 h-9 rounded-full bg-bg-elevated/60 border border-border-subtle flex items-center justify-center text-text-muted hover:text-accent-light hover:border-accent/30 transition-all duration-300">
            <Settings className="w-4 h-4" strokeWidth={1.8} />
          </button>
          <div className="flex items-center gap-2 ml-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-[11px] text-text-muted font-medium tracking-widest uppercase font-mono">Online</span>
          </div>
        </div>
      </div>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </nav>
  );
}

export default Navbar;
