import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { useDiagnostic } from "@/lib/DiagnosticContext";
import { motion } from "framer-motion";

export default function ResumeButton() {
  const { selections } = useDiagnostic();
  const hasSelections = Object.values(selections).some(arr => arr.length > 0);

  if (!hasSelections) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-6 right-6 z-40"
    >
      <Link
        to="/resume"
        className="flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-primary-foreground font-medium shadow-lg hover:shadow-xl hover:opacity-90 transition-all"
      >
        <FileText className="w-4 h-4" />
        Résumé
      </Link>
    </motion.div>
  );
}