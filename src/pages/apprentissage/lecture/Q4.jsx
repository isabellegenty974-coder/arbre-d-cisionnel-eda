import ScreenLayout from "../../../components/tree/ScreenLayout";
import QuestionOptions from "../../../components/tree/QuestionOptions";

export default function LectureQ4() {
  return (
    <ScreenLayout title="📘 Lecture – Question 4" subtitle="Un élève inverse b/d/p/q après 8 ans.">
      <QuestionOptions
        question="Quelle hypothèse vous semble la plus probable ?"
        options={[
          { label: "Dyslexie", to: "/apprentissage/lecture/questions/q4/a" },
          { label: "Immaturité développementale", to: "/apprentissage/lecture/questions/q4/b" },
          { label: "Trouble visuel", to: "/apprentissage/lecture/questions/q4/c" },
          { label: "Stress / surcharge cognitive", to: "/apprentissage/lecture/questions/q4/d" },
        ]}
      />
    </ScreenLayout>
  );
}