import { motion } from 'framer-motion';

export default function ItemCard({ icon: Icon, color, iconColor, title, description, signes, pistes, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`rounded-xl border overflow-hidden shadow-soft hover:shadow-soft-md transition-shadow ${color}`}
    >
      {/* Header avec icône et titre */}
      <div className="flex items-start gap-4 p-5 bg-white/40 backdrop-blur-sm border-b border-inherit">
        <div className={`p-3 rounded-lg bg-white/70 ${iconColor} shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-5 space-y-4">
        {/* Signes */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">🔍 Signes à observer</p>
          <ul className="space-y-2.5">
            {signes.map((signe, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mt-1.5 opacity-60 shrink-0" />
                <span className="text-sm text-foreground leading-snug">{signe}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pistes */}
        <div className="pt-2 border-t border-inherit/20">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">💡 Pistes d'action</p>
          <p className="text-sm text-foreground leading-relaxed">{pistes}</p>
        </div>
      </div>
    </motion.div>
  );
}