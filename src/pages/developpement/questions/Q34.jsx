import ScreenLayout from "../../../components/tree/ScreenLayout";
import QuestionOptions from "../../../components/tree/QuestionOptions";

export default function DeveloppementQ34() {
  return (
    <ScreenLayout
      title="🧠 Développement – Question 34"
      subtitle="Un élève a une articulation floue."
    >
      <QuestionOptions
        question="Quelle hypothèse vous semble la plus probable ?"
        options={[
          { label: "Trouble phonologique", to: "/developpement/questions/q34/a" },
          { label: "Trouble visuel", to: "/developpement/questions/q34/b" },
          { label: "Stress", to: "/developpement/questions/q34/c" },
          { label: "TDAH", to: "/developpement/questions/q34/d" },
        ]}
      />
    </ScreenLayout>
  );
}