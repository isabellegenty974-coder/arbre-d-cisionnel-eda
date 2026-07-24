import { motion } from 'framer-motion';

export default function AuthCard({ emoji = '🔐', title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A3353]/5 to-[#3B82C4]/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl border border-border shadow-soft p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#1A3353]/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">{emoji}</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {children}
          {footer && <p className="text-center text-xs text-muted-foreground mt-6">{footer}</p>}
        </div>
      </motion.div>
    </div>
  );
}