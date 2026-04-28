import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Package, Shield, AlertTriangle, Clock } from 'lucide-react';

function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [ledger, setLedger] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current && query === '') {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchFilteredLedger = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('http://localhost:5000/api/ledger');
        if (res.ok) {
          const data = await res.json();
          let results = data.ledger || [];
          
          // Sort newest first
          results = results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          
          // Filter by package name if query exists
          if (query.trim()) {
            const q = query.toLowerCase();
            results = results.filter(item => 
              item.package_name && item.package_name.toLowerCase().includes(q)
            );
          }
          
          setLedger(results);
        }
      } catch (e) {
        console.error('Failed to fetch ledger for search');
      } finally {
        setIsLoading(false);
      }
    };

    // Small debounce to prevent hammering the server on very fast typing
    const timeoutId = setTimeout(() => {
      fetchFilteredLedger();
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [isOpen, query]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const filteredResults = ledger;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0a0b1e]/80 backdrop-blur-sm"
          />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl bg-bg-card border border-border-focus shadow-[0_20px_60px_rgba(192,38,211,0.15)] rounded-2xl overflow-hidden flex flex-col mx-4"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border-subtle bg-bg-secondary/50">
              <Search className="w-5 h-5 text-accent-light shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search packages, CVEs, scan history..."
                className="flex-1 bg-transparent border-none outline-none text-white text-[15px] placeholder:text-text-muted font-display"
              />
              <button 
                onClick={onClose}
                className="p-1 rounded-md hover:bg-bg-elevated text-text-muted hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results Area */}
            <div className="max-h-[50vh] overflow-y-auto p-2">
              {!query.trim() ? (
                <div className="px-5 py-16 text-center text-text-muted flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-bg-elevated flex items-center justify-center mb-4 border border-border-subtle">
                    <Search className="w-8 h-8 opacity-40" />
                  </div>
                  <p className="text-sm font-medium">Type to start searching your security history</p>
                </div>
              ) : isLoading ? (
                <div className="px-5 py-16 text-center text-text-muted">
                  <div className="w-8 h-8 border-2 border-accent/30 border-t-accent-light rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm font-medium">Loading ledger data...</p>
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="px-5 py-16 text-center text-text-muted">
                  <Package className="w-10 h-10 mx-auto mb-3 opacity-30 text-accent" />
                  <p className="text-sm font-medium text-white mb-1">No results found</p>
                  <p className="text-xs">We couldn't find any packages matching "{query}"</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {filteredResults.map((scan, i) => (
                    <div
                      key={i}
                      className="px-4 py-3.5 rounded-xl hover:bg-bg-elevated border border-transparent hover:border-border-subtle transition-all flex items-center justify-between group cursor-default"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          scan.verdict === 'BLOCK' ? 'bg-danger/10 text-danger border border-danger/20' :
                          scan.verdict.includes('warning') ? 'bg-warning/10 text-warning border border-warning/20' :
                          'bg-safe/10 text-safe border border-safe/20'
                        }`}>
                          {scan.verdict === 'BLOCK' ? <AlertTriangle className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-sm font-bold text-white font-display tracking-wide">{scan.package_name}</span>
                            <span className="text-[11px] text-text-muted font-mono bg-bg-elevated px-1.5 py-0.5 rounded">v{scan.version}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-text-secondary font-medium tracking-wide">
                            <Clock className="w-3 h-3 opacity-70" />
                            {new Date(scan.timestamp).toLocaleString(undefined, {
                              year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right flex flex-col items-end">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md flex items-center gap-1 border ${
                          scan.verdict === 'BLOCK' ? 'bg-danger/10 text-danger border-danger/20' :
                          scan.verdict.includes('warning') ? 'bg-warning/10 text-warning border-warning/20' :
                          'bg-safe/10 text-safe border-safe/20'
                        }`}>
                          {scan.verdict}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="px-5 py-3 border-t border-border-subtle bg-bg-secondary/50 flex justify-between items-center text-xs text-text-muted">
              <span className="font-medium">{filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'}</span>
              <div className="flex items-center gap-2">
                <span>Press</span>
                <kbd className="px-1.5 py-0.5 rounded bg-bg-elevated border border-border-subtle font-mono text-[10px] text-white">ESC</kbd>
                <span>to close</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default SearchModal;
