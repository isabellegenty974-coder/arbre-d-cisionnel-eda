import ListPage from '@/components/ListPage';

export default function MotriciteFine() {
  const items = [
    "Difficultés de coordination fine",
    "Graphomotricité compromise",
    "Activités de rééducation recommandées"
  ];

  return <ListPage title="Motricité fine" items={items} />;
}