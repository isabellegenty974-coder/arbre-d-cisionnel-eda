import { motion } from "framer-motion";
import { CheckCircle2, Lightbulb, Check } from "lucide-react";
import { useState } from "react";

export default function InfoList({ items, type = "hypothesis", onSelectItems }) {
  const isAction = type === "action";
  const Icon = isAction ? CheckCircle2 : Lightbulb;
  const iconClass = isAction
    ? "text-chart-2 bg-chart-2/10"
    : "text-accent bg-accent/10";
  
  const [selectedItems, setSelectedItems] = useState(new Set());

  const handleToggle = (index) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
    if (onSelectItems) {
      onSelectItems(Array.from(newSelected).map(i => items[i]));
    }
  };

  return (
    <div className="space-y-2.5">
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.06 * i }}
          className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
            selectedItems.has(i)
              ? "bg-primary/10 border-primary/50"
              : "bg-card border-border hover:border-border/80"
          }`}
          onClick={() => handleToggle(i)}
        >
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${selectedItems.has(i) ? "bg-primary text-primary-foreground" : iconClass}`}>
            {selectedItems.has(i) ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Icon className="w-3.5 h-3.5" />
            )}
          </div>
          <p className="text-sm text-foreground leading-relaxed pt-0.5">{item}</p>
        </motion.div>
      ))}
    </div>
  );
}