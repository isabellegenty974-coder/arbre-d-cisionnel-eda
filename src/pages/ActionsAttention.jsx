import ListPage from '@/components/ListPage';

export default function ActionsAttention() {
  const items = [
    "Aménagements de l'environnement d'apprentissage",
    "Stratégies de maintien de l'attention",
    "Bilan neuropsychologique si nécessaire"
  ];

  return <ListPage title="Actions recommandées – Attention" items={items} />;
}