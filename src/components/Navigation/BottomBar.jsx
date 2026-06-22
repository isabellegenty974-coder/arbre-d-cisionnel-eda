import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Home, Users, TreePine, BarChart2, Settings } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useOfflineSync } from '@/lib/useOfflineSync';

const NAV_ITEMS = [
  { icon: Home,      label: 'Accueil',    to: '/dashboard' },
  { icon: Users,     label: 'Élèves',     to: '/liste-eleves' },
  { icon: TreePine,  label: 'Arbre',      to: '/evaluation-domains' },
  { icon: BarChart2, label: 'Stats',      to: '/stats-annuelles' },
  { icon: Settings,  label: 'Paramètres', to: '/parametres' },
];

export default function BottomBar() {
  const { pathname } = useLocation();
  const [user, setUser] = useState(null);
  const { isOnline } = useOfflineSync();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border flex items-center justify-around h-16 px-2 safe-area-pb">
      {NAV_ITEMS.map(({ icon: Icon, label, to }) => {
        const active = pathname === to;
        const isSettings = to === '/parametres';
        return (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors relative ${
              active ? 'text-accent' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className={`w-5 h-5 transition-transform ${active ? 'scale-110' : ''}`} />
            <span className="text-[10px] font-medium">{label}</span>
            {isSettings && user && isOnline && (
              <span className="absolute top-2.5 right-2 w-2 h-2 rounded-full bg-green-500"></span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}