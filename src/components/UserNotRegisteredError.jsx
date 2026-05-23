import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const UserNotRegisteredError = () => {
  useEffect(() => {
    // Redirect new invited users to the registration page
    window.location.href = '/register';
  }, []);

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 text-center px-6"
      >
        <div className="w-10 h-10 border-4 border-[#D4A574]/30 border-t-[#D4A574] rounded-full animate-spin" />
        <p className="text-white/80 text-sm">Redirection vers l&apos;inscription...</p>
      </motion.div>
    </div>
  );
};

export default UserNotRegisteredError;