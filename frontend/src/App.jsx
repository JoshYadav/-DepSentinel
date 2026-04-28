import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ScanResults from './pages/ScanResults';
import Ledger from './pages/Ledger';
import AlertBlock from './pages/AlertBlock';
import ThreatCenter from './pages/ThreatCenter';

const pageVariants = {
  initial: { opacity: 0, y: 12, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -8, filter: 'blur(4px)' },
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/scan-results" element={<PageTransition><ScanResults /></PageTransition>} />
        <Route path="/ledger" element={<PageTransition><Ledger /></PageTransition>} />
        <Route path="/alert-block" element={<PageTransition><AlertBlock /></PageTransition>} />
        <Route path="/threat-center" element={<PageTransition><ThreatCenter /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function PageTransition({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen text-text-primary font-sans antialiased overflow-hidden flex flex-col relative">
        <Navbar />
        <main className="pt-20 px-4 sm:px-6 lg:px-8 flex-1 w-full">
          <AnimatedRoutes />
        </main>
      </div>
    </Router>
  );
}

export default App;
