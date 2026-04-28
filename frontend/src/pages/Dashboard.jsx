import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Package, AlertTriangle, Clock, FileText, Zap, ArrowRight, Scan, Lock, ArrowUp } from 'lucide-react';

import ScanLoader from '../components/ScanLoader';
import FloatingParticles from '../components/dashboard/FloatingParticles';
import RiskGauge from '../components/dashboard/RiskGauge';
import StatCard from '../components/dashboard/StatCard';
import FeatureSection from '../components/dashboard/FeatureSection';
import RecentActivitySection from '../components/dashboard/RecentActivitySection';
import SystemStatusSection from '../components/dashboard/SystemStatusSection';

function Dashboard() {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [requirementsText, setRequirementsText] = useState('requests==2.28.0\nflask==3.0.0\nnumpy==1.26.0');
  const [error, setError] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const textareaRef = useRef(null);

  const [stats, setStats] = useState({
    packagesScanned: 0,
    threatsBlocked: 0,
    cleanPackages: 0,
    lastScan: '—',
    riskScore: 0
  });
  const [recentHistory, setRecentHistory] = useState([]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchLedgerStats = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/ledger');
        if (!res.ok) return;
        const data = await res.json();
        
        const entries = data.ledger || [];
        const packagesScanned = entries.length;
        const threatsBlocked = entries.filter(e => e.verdict === 'BLOCK').length;
        const cleanPackages = entries.filter(e => e.verdict === 'ALLOW' || e.verdict === 'ALLOW with warning').length;
        
        let lastScan = '—';
        if (entries.length > 0) {
          const latest = new Date(Math.max(...entries.map(e => new Date(e.timestamp).getTime())));
          const now = new Date();
          const diffMins = Math.floor((now - latest) / 60000);
          if (diffMins < 1) lastScan = 'Just now';
          else if (diffMins < 60) lastScan = `${diffMins}m ago`;
          else if (diffMins < 1440) lastScan = `${Math.floor(diffMins/60)}h ago`;
          else lastScan = `${Math.floor(diffMins/1440)}d ago`;
        }

        const recentScans = [...entries].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);
        let riskScore = 0;
        
        if (recentScans.length > 0) {
          const hasBlock = recentScans.some(e => e.verdict === 'BLOCK');
          const hasMedium = recentScans.some(e => e.verdict === 'ALLOW with warning');
          
          if (hasBlock) {
            riskScore = Math.floor(Math.random() * (100 - 75 + 1)) + 75; // 75-100
          } else if (hasMedium) {
            riskScore = Math.floor(Math.random() * (60 - 40 + 1)) + 40; // 40-60
          } else {
            riskScore = Math.floor(Math.random() * (25 - 10 + 1)) + 10; // 10-25
          }
        }

        const mappedRecent = recentScans.slice(0, 5).map(e => ({
          package: e.package_name,
          version: e.version,
          risk: e.verdict === 'BLOCK' ? 'CRITICAL' : (e.verdict === 'ALLOW with warning' ? 'CAUTION' : 'SAFE'),
          timestamp: new Date(e.timestamp).toLocaleString(undefined, { 
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
          })
        }));

        setStats({ packagesScanned, threatsBlocked, cleanPackages, lastScan, riskScore });
        setRecentHistory(mappedRecent);
      } catch (err) {
        console.error('Failed to fetch ledger stats:', err);
      }
    };

    fetchLedgerStats();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScan = async () => {
    setIsScanning(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirements_text: requirementsText }),
      });
      
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      console.log('DepSentinel API Response:', JSON.stringify(data, null, 2));
      
      const hasBlock = data.results.some(
        r => r.risk?.recommendation === 'BLOCK' || r.risk?.risk_level === 'HIGH'
      );
      if (hasBlock) {
        const blockedPkg = data.results.find(
          r => r.risk?.recommendation === 'BLOCK' || r.risk?.risk_level === 'HIGH'
        );
        navigate('/alert-block', { state: { packageData: blockedPkg, allResults: data.results } });
      } else {
        navigate('/scan-results', { state: { results: data.results } });
      }
    } catch (err) {
      console.error(err);
      setError('Failed to connect to backend. Ensure Flask is running on port 5000.');
      setIsScanning(false);
    }
  };

  const lineCount = requirementsText.split('\n').length;

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col relative px-6 lg:px-8 pb-10">
      <FloatingParticles />
      <AnimatePresence>{isScanning && <ScanLoader />}</AnimatePresence>

      {/* ═══════ SECTION 1: HERO ═══════ */}
      <section className="relative z-10 pt-6">
        {/* Top stat cards row */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <StatCard icon={Package} value={stats.packagesScanned} label="Packages Scanned" color="accent" delay={0.05} />
          <StatCard icon={AlertTriangle} value={stats.threatsBlocked} label="Threats Blocked" color="pink" delay={0.1} />
          <StatCard icon={Shield} value={stats.cleanPackages} label="Clean Packages" color="purple" delay={0.15} />
          <StatCard icon={Clock} value={stats.lastScan} label="Last Scan" color="safe" delay={0.2} />
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 w-full">
          
          {/* Col 1 (35%): Hero Text */}
          <motion.div 
            className="w-full lg:w-[35%] flex flex-col gap-6"
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="space-y-4">
              <motion.div 
                className="inline-flex items-center gap-2 bg-accent/8 border border-accent/15 rounded-full px-3.5 py-1.5 text-accent-light text-xs font-medium"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>AI-Powered Security Scanner</span>
              </motion.div>
              
              <h1 className="text-[40px] lg:text-[46px] leading-[1.1] font-display font-bold text-white tracking-tight">
                Dependency<br/>
                <span style={{
                  background: 'linear-gradient(to right, #c026d3, #e879f9, #a855f7)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  Security Monitor
                </span>
              </h1>
              <p className="text-text-secondary text-[15px] lg:text-[16px] leading-relaxed max-w-md">
                Real-time supply chain threat detection. Analyze, verify, and protect your dependencies before they compromise your stack.
              </p>
            </div>
          </motion.div>

          {/* Col 2 (35%): Input Area */}
          <motion.div 
            className="w-full lg:w-[35%] flex flex-col gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-text-secondary">
                <FileText className="w-4.5 h-4.5" />
                <span className="text-[15px] font-medium font-display">requirements.txt</span>
              </div>
              <span className="text-xs text-text-muted font-mono">{lineCount} {lineCount === 1 ? 'line' : 'lines'}</span>
            </div>
            
            <div className="relative group flex-1 flex flex-col">
              <div className="absolute -inset-[1px] bg-gradient-to-b from-accent/20 via-accent/5 to-transparent rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-sm" />
              
              <div className="relative bg-void border border-border-default rounded-xl overflow-hidden group-focus-within:border-border-focus transition-colors duration-300 flex-1 flex flex-col min-h-[200px]">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border-subtle bg-bg-primary/50 shrink-0">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-danger/50" />
                    <div className="w-3 h-3 rounded-full bg-warning/50" />
                    <div className="w-3 h-3 rounded-full bg-safe/50" />
                  </div>
                  <span className="text-[11px] text-text-muted font-mono ml-2">pip-manifest</span>
                </div>
                
                <textarea 
                  ref={textareaRef}
                  className="w-full flex-1 bg-transparent p-5 text-[14px] text-text-primary font-mono resize-none focus:outline-none placeholder:text-text-muted/50 leading-relaxed"
                  value={requirementsText}
                  onChange={(e) => setRequirementsText(e.target.value)}
                  placeholder="requests==2.28.0&#10;flask==3.0.0&#10;numpy==1.26.0"
                  spellCheck="false"
                />
              </div>
            </div>
            
            <motion.button
              onClick={handleScan}
              disabled={isScanning || !requirementsText.trim()}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full shrink-0 h-[52px] bg-[#c026d3] hover:bg-[#a21caf] text-white font-display font-bold text-[15px] rounded-xl flex items-center justify-center gap-2.5 transition-colors shadow-[0_0_20px_rgba(192,38,211,0.3)] disabled:opacity-40 disabled:cursor-not-allowed mt-1 relative group"
            >
              <Shield className="w-5 h-5" strokeWidth={2.5} />
              <span className="tracking-wide">Run Security Scan</span>
              <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 -translate-x-2 transition-all duration-300" />
            </motion.button>
            
            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-danger text-sm font-medium flex items-center gap-2 mt-1"
              >
                <AlertTriangle className="w-4 h-4" />
                {error}
              </motion.p>
            )}
          </motion.div>

          {/* Col 3 (30%): Gauge + Coverage card */}
          <motion.div 
            className="w-full lg:w-[30%] flex flex-col gap-6"
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1], delay: 0.15 }}
          >
            <div className="flex flex-col gap-5 h-full">
              {/* Risk Gauge Card */}
              <motion.div 
                className="bg-bg-card border border-border-subtle rounded-xl p-6 flex flex-col items-center justify-center shadow-card flex-1"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <RiskGauge score={stats.riskScore} />
                <h2 className="text-sm font-display font-semibold text-white mt-6">System Risk Assessment</h2>
                <p className="text-[13px] text-text-muted mt-1 text-center">Run a scan to calculate threat level across all dependencies</p>
              </motion.div>

              {/* Coverage / Capabilities Card */}
              <motion.div
                className="bg-bg-card border border-border-subtle rounded-xl p-6 shadow-card flex-1 flex flex-col justify-center"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.6 }}
              >
                <h3 className="text-sm font-display font-semibold text-white mb-5">Security Coverage</h3>
                
                <div className="flex flex-col gap-1">
                  {[
                    { icon: Scan, label: 'Static Analysis', count: 'Enabled' },
                    { icon: Shield, label: 'Pattern Detection', count: 'Active' },
                    { icon: Lock, label: 'Hash Verification', count: 'Ready' },
                    { icon: Zap, label: 'AI Analysis', count: 'Gemini' },
                  ].map(({ icon: Icon, label, count }, i) => (
                    <motion.div 
                      key={label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.07 }}
                      className="flex items-center justify-between py-3 border-b border-border-subtle/50 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-accent/8 border border-accent/15 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-accent-light" strokeWidth={1.5} />
                        </div>
                        <span className="text-[13px] text-text-primary font-medium">{label}</span>
                      </div>
                      <span className="text-xs text-accent-light font-mono font-medium bg-accent/10 px-2 py-0.5 rounded-md shrink-0">{count}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ═══════ SECTION 2: FEATURE OVERVIEW ═══════ */}
      <FeatureSection />

      {/* ═══════ SECTION 3: RECENT ACTIVITY ═══════ */}
      <RecentActivitySection history={recentHistory} />

      {/* ═══════ SECTION 4: SYSTEM STATUS ═══════ */}
      <SystemStatusSection />

      {/* ═══════ BACK TO TOP ═══════ */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 w-12 h-12 bg-bg-card border border-border-focus rounded-full flex items-center justify-center text-accent-light shadow-[0_0_15px_rgba(192,38,211,0.2)] hover:bg-accent/10 transition-colors z-50 group"
          >
            <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
}

export default Dashboard;
