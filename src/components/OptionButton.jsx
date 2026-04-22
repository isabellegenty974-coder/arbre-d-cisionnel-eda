import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function OptionButton({ label, navigate: destination }) {
  const navigate = useNavigate();

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/${destination}`)}
      className="w-full px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
    >
      {label}
    </motion.button>
  );
}