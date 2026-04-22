import ListPage from '@/components/ListPage';

export default function ActionsChangements() {
  const items = [
    "Accompagnement lors des transitions",
    "Soutien adapté à la période de changement",
    "Coordination avec les familles"
  ];

  return <ListPage title="Actions recommandées – Changements" items={items} />;
}