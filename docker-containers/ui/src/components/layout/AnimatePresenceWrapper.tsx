import { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface AnimatePresenceWrapperProps {
  children: ReactNode;
}

const AnimatePresenceWrapper = ({ children }: AnimatePresenceWrapperProps) => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimatePresenceWrapper;