import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function ActionButton({ label, to }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
    >
      {label}
      <ArrowRight className="w-4 h-4" />
    </Link>
  );
}