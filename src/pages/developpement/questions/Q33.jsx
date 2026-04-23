import ScreenLayout from "../../../components/tree/ScreenLayout";
import QuestionOptions from "../../../components/tree/QuestionOptions";

export default function DeveloppementQ33() {
  return (
    <ScreenLayout
      title="🧠 Développement – Question 33"
      subtitle="Un élève a un langage oral pauvre."
    >
      <QuestionOptions
        question="Quelle hypothèse vous semble la plus probable ?"
        options={[
          { label: "Trouble du langage oral", to: "/developpement/questions/q33/a" },
          { label: "TDAH", to: "/developpement/questions/q33/b" },
          { label: "Immaturité", to: "/developpement/questions/q33/c" },
          { label: "Stress", to: "/developpement/questions/q33/d" },
        ]}
      />
    </ScreenLayout>
  );
}