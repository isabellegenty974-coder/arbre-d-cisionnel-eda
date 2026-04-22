import ListPage from '@/components/ListPage';

export default function ActionsAbsenteisme() {
  const items = [
    "Dialogue avec la famille et l'élève",
    "Mise en place d'un plan de retour à l'école",
    "Partenariats avec les services externes"
  ];

  return <ListPage title="Actions recommandées – Absentéisme" items={items} />;
}