import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { 
  Clock, Link2, Shield, ShieldCheck, ShieldX, AlertTriangle,
  CheckCircle, XCircle, Database, Hash, ArrowRight, Loader2, ExternalLink
} from 'lucide-react';

function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 bg-bg-elevated/60 border border-border-subtle px-3.5 py-2 rounded-lg text-text-muted font-mono text-sm">
      <Clock className="w-3.5 h-3.5 text-accent" strokeWidth={2} />
      <span>{time.toLocaleTimeString()}</span>
    </div>
  );
}

function Ledger() {
  const [ledgerData, setLedgerData] = useState([]);
  const [isTampered, setIsTampered] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/ledger')
      .then(res => res.json())
      .then(data => {
        setLedgerData(data.ledger || []);
        setIsTampered(data.is_tampered || false);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-text-muted">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
        >
          <Loader2 className="w-8 h-8 text-accent mb-4" />
        </motion.div>
        <span className="font-display font-medium tracking-wide">Loading immutable ledger...</span>
      </div>
    );
  }

  const truncateHash = (hash) => {
    if (!hash) return 'N/A';
    if (hash === '0000000000000000000000000000000000000000000000000000000000000000') return 'GENESIS';
    return `${hash.substring(0, 12)}...${hash.substring(hash.length - 4)}`;
  };

  const getRiskBadge = (status) => {
    if (status === 'ALLOW' || status === 'SAFE') {
      return (
        <span className="inline-flex items-center gap-1.5 bg-safe/10 text-safe border border-safe/15 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide font-mono">
          <CheckCircle className="w-3 h-3" />
          ALLOW
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 bg-danger/10 text-danger-light border border-danger/15 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide font-mono">
        <XCircle className="w-3 h-3" />
        BLOCK
      </span>
    );
  };

  const last4 = [...ledgerData].reverse().slice(0, 4);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div 
      className="max-w-[1500px] mx-auto space-y-8 pb-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-2">
        <div>
          <div className="inline-flex items-center gap-2 bg-accent/8 border border-accent/15 rounded-full px-3.5 py-1.5 text-accent-light text-xs font-medium mb-3">
            <Database className="w-3.5 h-3.5" />
            <span>Immutable Record</span>
          </div>
          <h1 className="text-[32px] font-display font-bold text-white tracking-tight">Cryptographic Audit Ledger</h1>
          <p className="text-text-muted text-sm mt-1">Tamper-evident hash chain — every scan permanently recorded</p>
        </div>
        <LiveClock />
      </div>

      {/* Tamper Warning */}
      {isTampered && (
        <motion.div 
          initial={{ y: -15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-r from-danger/10 via-danger/5 to-transparent border border-danger/20 p-5 rounded-xl shadow-glow-danger flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-danger/15 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-danger animate-pulse" strokeWidth={1.8} />
          </div>
          <div>
            <h2 className="text-base font-display font-bold text-danger-light uppercase tracking-wide">Integrity Failure Detected</h2>
            <p className="text-text-secondary mt-0.5 text-sm">The ledger hash chain is broken. This indicates tampering with historical scan records.</p>
          </div>
        </motion.div>
      )}

      {/* CHAIN VISUALIZATION */}
      {ledgerData.length > 0 && (
        <motion.div 
          className="bg-bg-card border border-border-subtle rounded-xl p-6 shadow-card overflow-x-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Link2 className="w-4 h-4 text-accent" />
            <p className="text-[11px] text-text-muted uppercase font-bold tracking-widest font-mono">Recent Chain State</p>
          </div>
          <motion.div 
            className="flex items-center min-w-max gap-1"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {last4.reverse().map((entry, idx) => (
              <React.Fragment key={idx}>
                <motion.div 
                  variants={itemVariants} 
                  className={`bg-bg-elevated border border-border-subtle rounded-xl p-4 min-w-[200px] flex flex-col gap-2.5 hover:border-border-focus transition-all duration-300 group ${entry.blockchain_etherscan_url ? 'cursor-pointer' : ''}`}
                  onClick={() => entry.blockchain_etherscan_url && window.open(entry.blockchain_etherscan_url, '_blank')}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-white text-sm truncate">{entry.package}</span>
                    <div className="flex items-center gap-1.5">
                      {entry.blockchain_etherscan_url && (
                        <Link2 className="w-3 h-3 text-safe" strokeWidth={2} />
                      )}
                      <span className="font-mono text-[10px] text-text-muted bg-bg-card px-1.5 py-0.5 rounded">v{entry.version}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash className="w-3 h-3 text-accent opacity-50" />
                    <span className="font-mono text-[10px] text-text-muted truncate">{truncateHash(entry.hash)}</span>
                  </div>
                </motion.div>
                {idx < last4.length - 1 && (
                  <motion.div variants={itemVariants} className="flex items-center justify-center px-1">
                    <ArrowRight className="w-4 h-4 text-border-default" />
                  </motion.div>
                )}
              </React.Fragment>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Full Table */}
      <motion.div 
        className="bg-bg-card border border-border-subtle rounded-xl shadow-card overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="bg-bg-secondary/60 border-b border-border-subtle px-6 py-4 flex justify-between items-center">
          <h2 className="text-white font-display font-bold tracking-wide text-sm">Full Scan History</h2>
          <div className="flex items-center gap-2 text-[11px] font-mono font-medium text-text-muted">
            <span>ENTRIES:</span>
            <span className="text-accent font-bold text-sm bg-accent/10 px-2 py-0.5 rounded-md border border-accent/15">
              <CountUp end={ledgerData.length} duration={1.2} />
            </span>
          </div>
        </div>

        {ledgerData.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-text-muted">
            <div className="w-16 h-16 rounded-2xl bg-accent/8 border border-accent/15 flex items-center justify-center mb-5">
              <Database className="w-7 h-7 text-accent opacity-40" strokeWidth={1.5} />
            </div>
            <p className="text-base font-display font-medium text-text-primary">No scans recorded yet</p>
            <p className="text-sm mt-1">Run your first scan to start the audit trail.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-border-subtle text-text-muted text-[10px] uppercase tracking-widest font-bold font-mono">
                  <th className="px-6 py-3.5 w-12 text-center">#</th>
                  <th className="px-4 py-3.5">Package</th>
                  <th className="px-4 py-3.5">Version</th>
                  <th className="px-4 py-3.5">Risk</th>
                  <th className="px-4 py-3.5">SHA-256</th>
                  <th className="px-4 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5 text-center">On-Chain Tx</th>
                  <th className="px-4 py-3.5 text-center">Chain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-sm">
                {[...ledgerData].reverse().map((entry, idx) => (
                  <motion.tr 
                    key={idx} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-bg-elevated/40 transition-colors group"
                  >
                    <td className="px-6 py-4 text-center text-text-muted font-mono text-xs border-l-2 border-transparent group-hover:border-accent transition-all">
                      {ledgerData.length - idx}
                    </td>
                    <td className="px-4 py-4 font-display font-bold text-white">{entry.package}</td>
                    <td className="px-4 py-4 text-text-muted font-mono text-xs">v{entry.version}</td>
                    <td className="px-4 py-4">{getRiskBadge(entry.status)}</td>
                    <td className="px-4 py-4 font-mono text-[11px] text-text-secondary">
                      <div className="flex items-center gap-1.5" title={entry.hash}>
                        <Hash className="w-3 h-3 text-text-muted opacity-50" />
                        {truncateHash(entry.hash)}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-text-muted">
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {entry.blockchain_etherscan_url ? (
                        <a
                          href={entry.blockchain_etherscan_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-safe/10 text-safe border border-safe/15 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide font-mono hover:bg-safe/20 hover:border-safe/30 transition-all duration-200"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Tx ↗
                        </a>
                      ) : entry.status === 'BLOCK' ? (
                        <span className="inline-flex items-center gap-1.5 bg-danger/10 text-danger-light border border-danger/15 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide font-mono">
                          <XCircle className="w-3 h-3" />
                          Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-bg-elevated text-text-muted border border-border-subtle px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide font-mono">
                          Local only
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 flex justify-center">
                      {!isTampered ? (
                        <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.4 }}>
                          <ShieldCheck className="w-5 h-5 text-safe cursor-pointer" strokeWidth={1.8} />
                        </motion.div>
                      ) : (
                        <motion.div whileHover={{ rotate: 15 }}>
                          <ShieldX className="w-5 h-5 text-danger cursor-pointer" strokeWidth={1.8} />
                        </motion.div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default Ledger;
