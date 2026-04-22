import { Link } from "react-router-dom";
import { HelpCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function QuestionOptions({ question, options }) {
  return (
    <div>
      <div className="flex items-start gap-3 p-4 sm:p-5 rounded-xl bg-primary/5 border border-primary/10 mb-5">
        <HelpCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
        <p className="text-foreground font-medium">{question}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((opt, i) => (
          <motion.div
            key={opt.to}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + 0.06 * i }}
          >
            <Link
              to={opt.to}
              className="group flex items-center justify-between gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200"
            >
              <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                {opt.label}
              </span>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}