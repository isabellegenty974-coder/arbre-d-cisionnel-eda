import ListPage from '@/components/ListPage';

export default function ActionsGlobalApprentissage() {
  const items = [
    "Bilan psychométrique si nécessaire",
    "Concertation équipe pédagogique",
    "Mise en place de supports adaptés"
  ];

  return <ListPage title="Actions – Difficultés globales" items={items} />;
}