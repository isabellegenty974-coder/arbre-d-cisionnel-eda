import ListPage from '@/components/ListPage';

export default function ActionsInteractions() {
  const items = [
    "Interventions pour améliorer les compétences sociales",
    "Travail avec le groupe classe",
    "Suivi individuel si nécessaire"
  ];

  return <ListPage title="Actions recommandées – Interactions sociales" items={items} />;
}