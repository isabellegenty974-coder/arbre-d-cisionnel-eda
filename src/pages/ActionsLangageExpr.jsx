import ListPage from '@/components/ListPage';

export default function ActionsLangageExpr() {
  const items = [
    "Bilan orthophonique approfondi",
    "Exercices d'entraînement expressif",
    "Valorisation des communications alternatives si nécessaire"
  ];

  return <ListPage title="Actions recommandées – Expression" items={items} />;
}