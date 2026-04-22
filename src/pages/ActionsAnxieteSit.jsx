import ListPage from '@/components/ListPage';

export default function ActionsAnxieteSit() {
  const items = [
    "Identifier les situations déclenchantes précises",
    "Proposer des aménagements contextuels",
    "Techniques de gestion du stress adaptées"
  ];

  return <ListPage title="Actions – Anxiété situationnelle" items={items} />;
}