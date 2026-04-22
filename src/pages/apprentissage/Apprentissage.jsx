import ScreenLayout from "../../components/tree/ScreenLayout";
import NavCards from "../../components/tree/NavCards";

const items = [
  { label: "Lecture", to: "/apprentissage/lecture" },
  { label: "Écriture", to: "/apprentissage/ecriture" },
  { label: "Mathématiques", to: "/apprentissage/maths" },
  { label: "Difficultés globales", to: "/apprentissage/global" },
];

export default function Apprentissage() {
  return (
    <ScreenLayout title="Difficultés d'apprentissage">
      <NavCards items={items} />
    </ScreenLayout>
  );
}