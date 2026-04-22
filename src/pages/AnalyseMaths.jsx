import ListPage from '@/components/ListPage';

export default function AnalyseMaths() {
  const items = [
    "Compréhension du nombre et de sa représentation",
    "Capacités de calcul et de logique",
    "Résolution de problèmes"
  ];

  return <ListPage title="Analyse – Mathématiques" items={items} />;
}