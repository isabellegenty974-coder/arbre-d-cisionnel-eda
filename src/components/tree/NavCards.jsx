import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const iconColors = [
  "bg-primary/10 text-primary",
  "bg-accent/10 text-accent",
  "bg-chart-2/10 text-chart-2",
  "bg-chart-4/10 text-chart-4",
];

export default function NavCards({ items }) {
  return (
    <div className="grid gap-3">
      {items.map((item, i) => (
        <motion.div
          key={item.to}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.08 * i }}
        >
          <Link
            to={item.to}
            className="group flex items-center justify-between gap-4 p-4 sm:p-5 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-semibold ${iconColors[i % iconColors.length]}`}>
                {item.icon || item.label.charAt(0)}
              </div>
              <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                {item.label}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </Link>
        </motion.div>
      ))}
    </div>
  );
}