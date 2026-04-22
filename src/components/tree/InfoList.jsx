import { motion } from "framer-motion";
import { CheckCircle2, Lightbulb } from "lucide-react";

export default function InfoList({ items, type = "hypothesis" }) {
  const isAction = type === "action";
  const Icon = isAction ? CheckCircle2 : Lightbulb;
  const iconClass = isAction
    ? "text-chart-2 bg-chart-2/10"
    : "text-accent bg-accent/10";

  return (
    <div className="space-y-2.5">
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.06 * i }}
          className="flex items-start gap-3 p-3.5 rounded-xl bg-card border border-border"
        >
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${iconClass}`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <p className="text-sm text-foreground leading-relaxed pt-0.5">{item}</p>
        </motion.div>
      ))}
    </div>
  );
}