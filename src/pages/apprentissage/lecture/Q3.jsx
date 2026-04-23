import ScreenLayout from "../../../components/tree/ScreenLayout";
import QuestionOptions from "../../../components/tree/QuestionOptions";

export default function LectureQ3() {
  return (
    <ScreenLayout title="📘 Lecture – Question 3" subtitle="Un élève comprend bien à l'oral mais échoue en compréhension écrite.">
      <QuestionOptions
        question="Quelle hypothèse vous semble la plus probable ?"
        options={[
          { label: "Dyslexie", to: "/apprentissage/lecture/questions/q3/a" },
          { label: "Dysorthographie", to: "/apprentissage/lecture/questions/q3/b" },
          { label: "Trouble visuo-attentionnel", to: "/apprentissage/lecture/questions/q3/c" },
          { label: "Déficit de vocabulaire", to: "/apprentissage/lecture/questions/q3/d" },
        ]}
      />
    </ScreenLayout>
  );
}