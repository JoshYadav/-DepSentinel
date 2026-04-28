import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { 
  Shield, ShieldCheck, ShieldAlert, ShieldX, ArrowLeft, Code2, 
  AlertTriangle, CheckCircle, Sparkles, Link2, ChevronRight,
  FileWarning, Bug, Eye
} from 'lucide-react';

const Typewriter = ({ text, delay = 0 }) => {
  const [currentText, setCurrentText] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (currentText.length < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(text.slice(0, currentText.length + 1));
      }, 25);
      return () => clearTimeout(timeout);
    }
  }, [currentText, text, started]);

  return (
    <span>
      {currentText}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ repeat: Infinity, duration: 0.7 }}
        className="inline-block w-[6px] h-[13px] bg-accent-light ml-1 align-middle rounded-sm"
      />
    </span>
  );
};

// Animated threat category row
const ThreatRow = ({ cat, count, idx, status }) => {
  const hasThreat = status === 'THREAT';
  const isPending = status === 'PENDING';
  
  return (
    <motion.div 
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.1 + idx * 0.06, duration: 0.4 }}
      className={`flex items-center justify-between p-3.5 rounded-lg border transition-all duration-300 ${
        hasThreat 
          ? 'bg-danger/5 border-danger/20 hover:bg-danger/8 hover:border-danger/30' 
          : 'bg-bg-elevated/50 border-border-subtle hover:border-border-default'
      }`}
    >
      <div className="flex items-center gap-3">
        {hasThreat ? (
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-danger" />
          </span>
        ) : isPending ? (
          <div className="w-2.5 h-2.5 rounded-full bg-text-muted/50" />
        ) : (
          <CheckCircle className="w-4 h-4 text-safe" strokeWidth={2} />
        )}
        <span className={`text-sm font-medium ${hasThreat ? 'text-danger-light' : 'text-text-primary'}`}>{cat}</span>
      </div>
      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md font-mono ${
        hasThreat 
          ? 'bg-danger/15 text-danger-light border border-danger/20' 
          : isPending
          ? 'bg-bg-elevated text-text-muted border border-border-subtle'
          : 'bg-safe/10 text-safe border border-safe/15'
      }`}>
        {hasThreat ? `${count} FOUND` : isPending ? 'PENDING' : 'CLEAN'}
      </span>
    </motion.div>
  );
};

function ScanResults() {
  const location = useLocation();
  const results = location.state?.results || [];
  
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-2xl bg-accent/8 border border-accent/15 flex items-center justify-center mb-5">
          <Eye className="w-7 h-7 text-accent opacity-50" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-display font-bold text-white mb-2">No scan results found</h2>
        <p className="text-text-muted text-sm mb-6">Run a dependency scan first to view analysis</p>
        <Link to="/" className="inline-flex items-center gap-2 text-accent hover:text-accent-light transition-colors font-medium text-sm">
          <ArrowLeft className="w-4 h-4" />
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const result = results[0];
  const { package: pkgName, version, diff, patterns, risk } = result;
  console.log('PACKAGE DATA:', JSON.stringify(result, null, 2));
  console.log('RECOMMENDATION:', risk?.recommendation);
  console.log('RISK LEVEL:', risk?.risk_level);
  console.log('RISK SCORE:', risk?.risk_score);
  const aiExplanation = risk?.ai_explanation || null;
  const isBlock = risk.recommendation === 'BLOCK' || risk.risk_level === 'HIGH';
  const diffText = diff?.unified_diff || 'No diff available for this package';

  return (
    <motion.div 
      className="max-w-[1500px] mx-auto space-y-6 pb-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="text-[28px] font-display font-bold text-white tracking-tight">{pkgName}</h1>
          <span className="bg-bg-elevated border border-accent/20 text-accent-light px-2.5 py-1 rounded-md text-xs font-mono font-medium">
            v{version}
          </span>
          <span className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold flex items-center gap-1.5 ${
            isBlock 
              ? 'bg-danger/10 text-danger-light border border-danger/25' 
              : 'bg-safe/10 text-safe-light border border-safe/25'
          }`}>
            {isBlock ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            {risk.recommendation}
          </span>
        </div>
        <Link to="/" className="text-sm text-text-muted hover:text-white transition-colors bg-bg-card border border-border-subtle hover:border-border-focus px-4 py-2 rounded-lg font-medium flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      {/* VERDICT BANNER */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className={`w-full p-5 rounded-xl flex items-center gap-4 border ${
          isBlock 
            ? 'bg-gradient-to-r from-danger/10 via-danger/5 to-transparent border-danger/20 shadow-glow-danger' 
            : 'bg-gradient-to-r from-safe/10 via-safe/5 to-transparent border-safe/20 shadow-glow-safe'
        }`}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          isBlock ? 'bg-danger/15' : 'bg-safe/15'
        }`}>
          {isBlock ? (
            <ShieldAlert className="w-5 h-5 text-danger-light" strokeWidth={1.8} />
          ) : (
            <ShieldCheck className="w-5 h-5 text-safe-light" strokeWidth={1.8} />
          )}
        </div>
        <div>
          <h2 className={`text-base font-display font-bold ${isBlock ? 'text-danger-light' : 'text-safe-light'}`}>
            {isBlock ? 'High Risk Threat Detected' : 'Package Verified — No Threats Detected'}
          </h2>
          <p className="text-text-secondary mt-0.5 text-sm">
            {isBlock ? risk.reasons.join('. ') : 'Static analysis and threat pattern checks passed successfully.'}
          </p>
        </div>
      </motion.div>

      {/* MAIN 2-COLUMN LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* LEFT: Code Diff */}
        <motion.div 
          className="w-full lg:w-[55%]"
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="bg-bg-card border border-border-subtle rounded-xl overflow-hidden shadow-card h-full flex flex-col">
            {/* Header bar */}
            <div className="bg-bg-secondary/80 px-4 py-3 border-b border-border-subtle flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <Code2 className="w-4 h-4 text-accent" strokeWidth={1.8} />
                <span className="text-text-primary font-display font-semibold text-sm">Code Diff</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono font-medium">
                <span className="text-safe bg-safe/10 px-2 py-0.5 rounded border border-safe/15">
                  +{diff?.added_lines?.length || 0}
                </span>
                <span className="text-danger bg-danger/10 px-2 py-0.5 rounded border border-danger/15">
                  -{diff?.removed_lines?.length || 0}
                </span>
              </div>
            </div>
            
            <div className="bg-void overflow-y-auto overflow-x-auto max-h-[420px] text-[12px] flex-1">
              <SyntaxHighlighter
                language="diff"
                style={atomOneDark}
                showLineNumbers={true}
                wrapLines={true}
                customStyle={{ margin: 0, padding: '1rem', background: 'transparent', fontSize: '12px' }}
                lineProps={lineNumber => {
                  const lineText = diffText.split('\n')[lineNumber - 1] || '';
                  if (lineText.startsWith('+')) {
                    return { style: { display: 'block', backgroundColor: 'rgba(16, 185, 129, 0.08)', borderLeft: '3px solid #10b981', paddingLeft: '8px' } };
                  }
                  if (lineText.startsWith('-')) {
                    return { style: { display: 'block', backgroundColor: 'rgba(239, 68, 68, 0.08)', borderLeft: '3px solid #ef4444', paddingLeft: '8px' } };
                  }
                  return { style: { display: 'block', paddingLeft: '11px', opacity: lineText.startsWith('@') ? 0.5 : 1 } };
                }}
              >
                {diffText}
              </SyntaxHighlighter>
            </div>
          </div>
        </motion.div>

        {/* RIGHT: Cards Stack */}
        <motion.div 
          className="w-full lg:w-[45%] flex flex-col gap-5"
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          
          {/* Threat Vectors Card */}
          <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-card">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-accent" strokeWidth={1.8} />
              </div>
              <h3 className="text-white font-display font-bold text-sm">Threat Vectors</h3>
            </div>
            
            <div className="space-y-2.5">
              {['Code Execution', 'Obfuscation', 'Network', 'Persistence', 'Sensitive Data'].map((cat, idx) => {
                const count = patterns?.categories?.[cat]?.length || 0;
                let status = 'CLEAN';
                if (!patterns) status = 'PENDING';
                else if (count > 0) status = 'THREAT';
                
                return <ThreatRow key={cat} cat={cat} count={count} idx={idx} status={status} />;
              })}
            </div>
          </div>

          {/* AI Analysis Card */}
          <div className="bg-bg-card border border-accent/15 rounded-xl p-5 shadow-card relative overflow-hidden flex-1 flex flex-col">
            {/* Ambient glow */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-accent-light" strokeWidth={1.8} />
                </div>
                <h3 className="text-white font-display font-bold text-sm">AI Security Analysis</h3>
              </div>
              <div className="flex items-center gap-2">
                {/* Confidence Indicator */}
                {aiExplanation && aiExplanation.confidence && (
                  <span className={`flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-md font-mono border ${
                    aiExplanation.confidence === 'HIGH' ? 'bg-safe/10 text-safe border-safe/20' :
                    aiExplanation.confidence === 'MEDIUM' ? 'bg-warning/10 text-warning border-warning/20' :
                    'bg-text-muted/10 text-text-muted border-border-subtle'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      aiExplanation.confidence === 'HIGH' ? 'bg-safe' :
                      aiExplanation.confidence === 'MEDIUM' ? 'bg-warning' :
                      'bg-text-muted'
                    }`} />
                    {aiExplanation.confidence}
                  </span>
                )}
                <span className="bg-accent/10 text-accent-light border border-accent/20 text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-md font-mono">
                  GEMINI
                </span>
              </div>
            </div>

            {aiExplanation && aiExplanation.behavioral_intent && aiExplanation.behavioral_intent !== 'AI analysis unavailable — static analysis results used' ? (
              <>
                <div className="space-y-4 flex-1 relative z-10 text-sm">
                  {/* Behavioral Intent */}
                  <div>
                    <p className="text-text-muted text-[10px] uppercase font-bold tracking-widest mb-1.5">Behavioral Intent</p>
                    <p className="text-text-primary font-mono text-[13px]">
                      <Typewriter text={aiExplanation.behavioral_intent?.startsWith('AI analysis failed:') ? 'AI analysis temporarily unavailable — static detection results displayed above' : aiExplanation.behavioral_intent} delay={400} />
                    </p>
                  </div>

                  {/* Attack Type Badge */}
                  <div>
                    <p className="text-text-muted text-[10px] uppercase font-bold tracking-widest mb-1.5">Attack Type</p>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                      aiExplanation.attack_type === 'Supply Chain Injection' ? 'bg-danger/10 text-danger-light border-danger/25' :
                      aiExplanation.attack_type === 'Typosquatting' ? 'bg-orange-500/10 text-orange-400 border-orange-500/25' :
                      aiExplanation.attack_type === 'Known CVE' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/25' :
                      aiExplanation.attack_type === 'Clean' ? 'bg-safe/10 text-safe-light border-safe/25' :
                      aiExplanation.attack_type === 'Dependency Confusion' ? 'bg-danger/10 text-danger-light border-danger/25' :
                      'bg-orange-500/10 text-orange-400 border-orange-500/25'
                    }`}>
                      {aiExplanation.attack_type === 'Clean' ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <AlertTriangle className="w-3 h-3" />
                      )}
                      {aiExplanation.attack_type}
                    </span>
                  </div>
                  
                  {/* Specific Concerns */}
                  <div>
                    <p className="text-text-muted text-[10px] uppercase font-bold tracking-widest mb-1.5">Specific Concerns</p>
                    {aiExplanation.specific_concerns && aiExplanation.specific_concerns.length > 0 ? (
                      <ul className="space-y-1.5">
                        {aiExplanation.specific_concerns.map((concern, i) => (
                          <motion.li 
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            className="flex items-start gap-2 text-text-primary text-sm"
                          >
                            <ChevronRight className="w-3 h-3 text-accent opacity-60 mt-1 shrink-0" />
                            <span>{concern}</span>
                          </motion.li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-text-muted text-sm italic">No specific concerns identified</p>
                    )}
                  </div>
                </div>

                {/* SOC Action */}
                <div className="mt-4 bg-bg-elevated/60 border border-border-subtle p-3.5 rounded-lg relative z-10">
                  <p className="text-text-muted text-[10px] uppercase font-bold tracking-widest mb-1">Recommended Action</p>
                  <p className="text-white font-display font-medium text-sm">
                    {aiExplanation.soc_action}
                  </p>
                </div>

                {/* Powered by label */}
                <p className="text-text-muted/40 text-[10px] text-right mt-3 relative z-10 font-mono">
                  Powered by Gemini 2.5 Flash
                </p>
              </>
            ) : (
              <div className="space-y-4 flex-1 relative z-10 text-sm">
                <div>
                  <p className="text-text-muted text-[10px] uppercase font-bold tracking-widest mb-1.5">Behavioral Intent</p>
                  <p className="text-text-muted font-mono text-[13px] italic">
                    AI analysis pending — static detection results displayed above
                  </p>
                </div>
                <div className="mt-4 bg-bg-elevated/60 border border-border-subtle p-3.5 rounded-lg">
                  <p className="text-text-muted text-[10px] uppercase font-bold tracking-widest mb-1">Recommended Action</p>
                  <p className="text-white font-display font-medium text-sm">
                    {isBlock ? "Block package and review logic manually." : "Safe to proceed with deployment."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* BOTTOM: Blockchain Verification */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`w-full bg-bg-card border rounded-xl p-5 shadow-card transition-all duration-300 ${
          result.blockchain_etherscan_url 
            ? 'border-safe/25 hover:border-safe/40' 
            : result.blockchain_status === 'blockchain unavailable'
            ? 'border-yellow-500/20 hover:border-yellow-500/30'
            : 'border-border-subtle hover:border-border-focus'
        }`}
      >
        {/* Verified on Sepolia */}
        {result.blockchain_etherscan_url ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-safe/10 border border-safe/20 flex items-center justify-center">
                  <Link2 className="w-5 h-5 text-safe" strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="text-safe-light font-display font-bold text-sm">Verified on Sepolia Testnet</h3>
                  <p className="text-text-muted text-xs mt-0.5">Immutable on-chain record of this scan</p>
                </div>
              </div>
              <span className="bg-safe/10 text-safe border border-safe/15 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest font-mono">
                ON-CHAIN
              </span>
            </div>
            
            <div className="bg-bg-elevated/60 border border-border-subtle rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-text-muted text-[10px] uppercase font-bold tracking-widest">Transaction Hash</span>
                <span className="font-mono text-[12px] text-safe-light bg-safe/5 px-2.5 py-1 rounded border border-safe/10" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {result.blockchain_tx_hash 
                    ? `${result.blockchain_tx_hash.substring(0, 10)}...${result.blockchain_tx_hash.substring(result.blockchain_tx_hash.length - 6)}`
                    : 'N/A'}
                </span>
              </div>
              {result.blockchain_tx_hash && (
                <div className="flex items-center justify-between">
                  <span className="text-text-muted text-[10px] uppercase font-bold tracking-widest">Block Number</span>
                  <span className="font-mono text-[12px] text-text-primary">
                    Recorded in block #{results[0]?.blockchain_block_number || '—'}
                  </span>
                </div>
              )}
            </div>

            <a
              href={result.blockchain_etherscan_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-bg-elevated hover:bg-bg-elevated/80 border border-safe/30 hover:border-safe/50 text-safe-light px-4 py-2.5 rounded-lg text-sm font-display font-bold transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]"
            >
              View on Etherscan ↗
            </a>
          </div>
        ) : result.blockchain_status === 'blockchain unavailable' ? (
          /* Blockchain unavailable fallback */
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-400" strokeWidth={1.8} />
              </div>
              <div>
                <h3 className="text-yellow-400 font-display font-bold text-sm">Blockchain Unavailable</h3>
                <p className="text-text-muted text-xs mt-0.5">Hash chain ledger updated locally</p>
              </div>
            </div>
            <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/15 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest font-mono">
              LOCAL
            </span>
          </div>
        ) : (
          /* Blocked — not recorded */
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-bg-elevated border border-border-subtle flex items-center justify-center">
                <ShieldX className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-text-muted font-display font-bold text-sm">Not Recorded — Package Blocked</h3>
                <p className="text-text-muted/70 text-xs mt-0.5">Malicious packages are never added to the integrity ledger</p>
              </div>
            </div>
            <span className="bg-danger/8 text-danger-light border border-danger/15 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest font-mono">
              BLOCKED
            </span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default ScanResults;
