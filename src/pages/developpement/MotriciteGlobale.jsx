import ListPage from '@/components/ListPage';

export default function MotriciteGlobale() {
  const items = [
    "Difficultés d'équilibre ou de coordination",
    "Manque de tonus musculaire",
    "Bilan moteur recommandé"
  ];

  return <ListPage title="Motricité globale" items={items} />;
}
