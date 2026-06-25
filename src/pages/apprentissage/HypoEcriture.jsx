import ListPage from '@/components/ListPage';

export default function HypoEcriture() {
  const items = [
    "Dysgraphie développementale",
    "Difficultés motrice affectant l'écriture",
    "Manque de mobilisation cognitive lors de la rédaction"
  ];

  return <ListPage title="Hypothèses – Écriture" items={items} />;
}
