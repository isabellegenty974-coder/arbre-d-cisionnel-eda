import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CardButton({ label, navigate: destination }) {
  const navigate = useNavigate();

  return (
    <motion.button
      whileHover={{ translateY: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/${destination}`)}
      className="w-full text-left p-5 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-foreground">{label}</span>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
    </motion.button>
  );
}