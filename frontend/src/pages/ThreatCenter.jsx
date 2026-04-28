import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import { Shield, ShieldAlert, CheckCircle, Activity, Package, AlertTriangle, Users, Key, Eye, Layers, Globe } from 'lucide-react';

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f1123]/95 border border-accent/30 p-3 rounded-lg shadow-[0_0_20px_rgba(192,38,211,0.2)] backdrop-blur-md">
        <p className="text-text-muted text-xs mb-2 font-mono">{label}</p>
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm font-display font-medium">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-white">{entry.name}:</span>
            <span style={{ color: entry.color }}>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

function ThreatCenter() {
  const [ledgerData, setLedgerData] = useState([]);
  const [loading, setLoading] = useState(true);

  // MOCK DATA GENERATORS (Seeded from ledger)
  const generateTimelineData = (ledgerCount) => {
    const data = [];
    let baseScans = Math.max(10, ledgerCount);
    let baseThreats = Math.max(2, Math.floor(ledgerCount * 0.2));
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const volatility = Math.random() * 0.4 - 0.2;
      const scanVal = Math.max(5, Math.floor(baseScans * (1 + volatility)));
      const threatVal = Math.max(0, Math.floor(baseThreats * (1 + (Math.random() * 0.6 - 0.3))));
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        Scanned: scanVal,
        Blocked: threatVal,
      });
      baseScans += Math.random() * 2;
      baseThreats += Math.random() * 0.5;
    }
    return data;
  };

  const generateRadarData = (ledgerCount) => {
    const factor = Math.max(1, ledgerCount / 10);
    return [
      { subject: 'Typosquatting', A: Math.floor(Math.random() * 50 * factor) + 10, fullMark: 100 * factor },
      { subject: 'Code Execution', A: Math.floor(Math.random() * 80 * factor) + 20, fullMark: 100 * factor },
      { subject: 'Exfiltration', A: Math.floor(Math.random() * 60 * factor) + 15, fullMark: 100 * factor },
      { subject: 'Obfuscation', A: Math.floor(Math.random() * 40 * factor) + 5, fullMark: 100 * factor },
      { subject: 'Persistence', A: Math.floor(Math.random() * 70 * factor) + 10, fullMark: 100 * factor },
      { subject: 'Known CVEs', A: Math.floor(Math.random() * 90 * factor) + 30, fullMark: 100 * factor },
    ];
  };

  const generateHeatmapData = () => {
    const weeks = 12;
    const days = 7;
    const data = [];
    for (let d = 0; d < days; d++) {
      const row = [];
      for (let w = 0; w < weeks; w++) {
        row.push(Math.floor(Math.random() * 5));
      }
      data.push(row);
    }
    return data;
  };

  const generateSeverityData = (ledgerCount) => {
    const total = Math.max(100, ledgerCount * 5);
    return [
      { name: 'Low', count: Math.floor(total * 0.5), color: '#a855f7' },
      { name: 'Medium', count: Math.floor(total * 0.3), color: '#d946ef' },
      { name: 'High', count: Math.floor(total * 0.15), color: '#ec4899' },
      { name: 'Critical', count: Math.floor(total * 0.05), color: '#f43f5e' },
    ];
  };

  useEffect(() => {
    fetch('http://localhost:5000/api/ledger')
      .then(res => res.json())
      .then(data => {
        setLedgerData(data.ledger || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-text-muted">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}>
          <Activity className="w-6 h-6 text-accent mr-3" />
        </motion.div>
        <span className="font-display font-medium">Loading Analytics...</span>
      </div>
    );
  }

  const totalScans = ledgerData.length;
  const threatsBlocked = ledgerData.filter(d => d.status === 'BLOCK').length;
  const packagesClean = totalScans - threatsBlocked;
  const avgRiskScore = threatsBlocked > 0 ? Math.floor(75 + Math.random() * 20) : 15;

  const timelineData = generateTimelineData(totalScans);
  const radarData = generateRadarData(totalScans);
  const heatmapData = generateHeatmapData();
  const severityData = generateSeverityData(totalScans);

  // Heatmap colors
  const intensityColors = ['#1a1b36', '#6b21a8', '#9333ea', '#c026d3', '#f472b6'];

  // Coverage items
  const coverageItems = [
    { icon: Package, label: 'PyPI Packages', count: '1,247' },
    { icon: Shield, label: 'Pattern Signatures', count: '342' },
    { icon: Globe, label: 'CVE Database', count: '8,429' },
    { icon: AlertTriangle, label: 'Typosquat Watchlist', count: '156' },
    { icon: Key, label: 'Hash Verifications', count: '891' },
    { icon: Activity, label: 'Active Monitors', count: '12' },
  ];

  return (
    <motion.div 
      className="max-w-[1500px] mx-auto pb-16 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* HEADER STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Scans', value: totalScans, icon: Activity, color: 'text-white', iconColor: 'text-accent' },
          { label: 'Threats Blocked', value: threatsBlocked, icon: ShieldAlert, color: 'text-[#f43f5e]', iconColor: 'text-[#f43f5e]' },
          { label: 'Packages Clean', value: packagesClean, icon: CheckCircle, color: 'text-[#d946ef]', iconColor: 'text-[#d946ef]' },
          { label: 'Avg Risk Score', value: avgRiskScore, icon: AlertTriangle, color: 'text-[#a855f7]', iconColor: 'text-[#a855f7]', suffix: '/100' }
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            className="bg-bg-card border border-border-subtle rounded-xl p-5 flex items-center justify-between shadow-card hover:border-border-focus transition-all duration-300"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
          >
            <div>
              <p className="text-text-muted text-xs font-mono uppercase tracking-wider mb-1">{stat.label}</p>
              <h3 className={`text-3xl font-display font-bold ${stat.color}`}>
                <CountUp end={stat.value} duration={2} />
                {stat.suffix && <span className="text-lg opacity-70 ml-1">{stat.suffix}</span>}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-accent/8 flex items-center justify-center border border-accent/15">
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* MAIN GRIDS — Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LINE CHART: Scans vs Threats overtime */}
        <motion.div 
          className="lg:col-span-2 bg-bg-card border border-border-subtle rounded-xl p-6 shadow-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-white font-display font-semibold text-lg">Open and Resolved Exposures Overtime</h2>
              <p className="text-text-muted text-xs mt-1">30-day historical analysis</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#a855f7]" />
                <span className="text-text-muted">Resolved</span>
                <span className="text-white font-bold ml-1"><CountUp end={45} duration={1.5} /></span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#ec4899]" />
                <span className="text-text-muted">New</span>
                <span className="text-white font-bold ml-1"><CountUp end={38} duration={1.5} /></span>
              </div>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScanned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1f3d" vertical={false} />
                <XAxis dataKey="date" stroke="#5b6080" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#5b6080" fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: '#c026d3', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="Scanned" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorScanned)" />
                <Area type="monotone" dataKey="Blocked" stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#colorBlocked)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* COVERAGE CARD — like the reference */}
        <motion.div 
          className="bg-bg-card border border-border-subtle rounded-xl p-6 shadow-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-white font-display font-semibold text-lg mb-5">Threats Coverage</h2>
          <div className="space-y-1">
            {coverageItems.map(({ icon: Icon, label, count }, idx) => (
              <motion.div 
                key={label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + idx * 0.05 }}
                className="flex items-center justify-between py-3 border-b border-border-subtle last:border-0 group hover:bg-white/[0.01] px-2 -mx-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/8 border border-accent/12 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-accent-light opacity-70 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
                  </div>
                  <span className="text-text-primary text-sm font-medium">{label}</span>
                </div>
                <span className="text-white font-display font-bold text-sm">{count}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ROW 2 — 3 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SEVERITY BREAKDOWN — like reference Threats Coverage left card */}
        <motion.div 
          className="bg-bg-card border border-border-subtle rounded-xl p-6 shadow-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="mb-6">
            <h2 className="text-white font-display font-semibold text-lg">Risk Severity</h2>
            <p className="text-text-muted text-xs mt-1">Distribution across risk categories</p>
          </div>
          
          <div className="space-y-5">
            {severityData.map((item, idx) => {
              const maxCount = severityData.reduce((acc, curr) => acc + curr.count, 0);
              const percent = (item.count / maxCount) * 100;
              const segments = 40;
              const activeSegments = Math.ceil((percent / 100) * segments);
              
              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.06 }}
                >
                  <div className="flex justify-between items-end mb-1.5 text-xs">
                    <span className="text-white font-medium flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 opacity-60" />
                      {item.name} Risk
                    </span>
                    <span className="text-text-muted font-mono">{item.count}</span>
                  </div>
                  <div className="flex gap-[2px] h-2.5 w-full bg-[#050816] rounded-sm p-[1px]">
                    {Array.from({ length: segments }).map((_, i) => (
                      <div 
                        key={i} 
                        className="flex-1 rounded-[1px] transition-all duration-300"
                        style={{ 
                          backgroundColor: i < activeSegments ? item.color : '#1a1b36',
                          opacity: i < activeSegments ? 1 : 0.4
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* HEATMAP: Threat Tactics */}
        <motion.div 
          className="bg-bg-card border border-border-subtle rounded-xl p-6 shadow-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h2 className="text-white font-display font-semibold text-lg">Threats Tactics</h2>
              <p className="text-text-muted text-xs mt-1">Last 12 Weeks</p>
            </div>
            <div className="flex gap-1 items-center text-[10px] text-text-muted">
              <span>Less</span>
              {intensityColors.map((c, i) => (
                <div key={i} className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: c }} />
              ))}
              <span>More</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            {/* Y-axis labels */}
            <div className="flex flex-col justify-between text-[10px] text-text-muted py-1 pr-2 w-10">
              <span>Mon</span><span>Wed</span><span>Fri</span><span>Sun</span>
            </div>
            {/* Grid */}
            <div className="flex-1 grid grid-rows-7 gap-[3px]">
              {heatmapData.map((row, rIdx) => (
                <div key={rIdx} className="grid grid-cols-12 gap-[3px]">
                  {row.map((intensity, cIdx) => (
                    <motion.div 
                      key={cIdx} 
                      className="aspect-square rounded-[3px] border border-white/5"
                      style={{ backgroundColor: intensityColors[intensity] }}
                      whileHover={{ scale: 1.15, zIndex: 10, boxShadow: '0 0 10px rgba(192,38,211,0.5)' }}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + (rIdx * 0.02) + (cIdx * 0.01) }}
                      title={`Week ${cIdx + 1}, Day ${rIdx + 1}: ${intensity} events`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* RADAR CHART: Risk Vectors */}
        <motion.div 
          className="bg-bg-card border border-border-subtle rounded-xl p-6 shadow-card flex flex-col"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="mb-2">
            <h2 className="text-white font-display font-semibold text-lg">Threats Coverage</h2>
            <p className="text-text-muted text-xs mt-1">Attack pattern distribution</p>
          </div>
          <div className="flex-1 min-h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#1e1f3d" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3bf', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={false} axisLine={false} />
                <Radar
                  name="Detected"
                  dataKey="A"
                  stroke="#ec4899"
                  strokeWidth={2}
                  fill="#ec4899"
                  fillOpacity={0.2}
                  dot={{ r: 3, fill: '#ec4899', strokeWidth: 0 }}
                />
                <RechartsTooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-2 mt-2 justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ec4899]" />
            <span className="text-xs text-text-muted font-medium">Threats coverage</span>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}

export default ThreatCenter;
