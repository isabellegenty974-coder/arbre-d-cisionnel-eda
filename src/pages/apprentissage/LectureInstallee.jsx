import ScreenLayout from "../../components/tree/ScreenLayout";
import NavCards from "../../components/tree/NavCards";

export default function LectureInstallee() {
  return (
    <ScreenLayout
      title="📘 Lecture – Difficulté installée"
      subtitle="Plusieurs hypothèses peuvent être envisagées."
    >
      <NavCards
        items={[
          { label: "🔍 Questions diagnostiques", to: "/apprentissage/lecture/questions" },
          { label: "🧠 Hypothèses possibles", to: "/apprentissage/lecture/hypotheses" },
          { label: "🛠️ Actions recommandées", to: "/apprentissage/lecture/actions" },
        ]}
      />
    </ScreenLayout>
  );
}