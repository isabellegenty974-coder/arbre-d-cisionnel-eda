import { Link, useLocation } from 'react-router-dom';
import { Home, Users, TreePine, BarChart2 } from 'lucide-react';

const NAV_ITEMS = [
  { icon: Home,      label: 'Accueil',  to: '/' },
  { icon: Users,     label: 'Élèves',   to: '/dashboard' },
  { icon: TreePine,  label: 'Arbre',    to: '/evaluation-domains' },
  { icon: BarChart2, label: 'Stats',    to: '/stats-annuelles' },
];

export default function BottomBar() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border flex items-center justify-around h-16 px-2 safe-area-pb">
      {NAV_ITEMS.map(({ icon: Icon, label, to }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
              active ? 'text-accent' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className={`w-5 h-5 transition-transform ${active ? 'scale-110' : ''}`} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}