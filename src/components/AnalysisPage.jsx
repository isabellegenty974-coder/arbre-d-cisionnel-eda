import { useParams } from "react-router-dom";
import AnalysisScreen from "./AnalysisScreen";
import { getQuestion } from "@/lib/questionsConfig";

export default function AnalysisPage() {
  const { domain, questionNum, analysisCode } = useParams();
  const questionId = `q${questionNum}`;
  const question = getQuestion(domain, questionId);

  if (!question) {
    return <div className="p-8 text-center text-muted-foreground">Analyse non trouvée</div>;
  }

  const optionIndex = analysisCode.charCodeAt(0) - 97; // 'a' -> 0, 'b' -> 1, etc.
  const option = question.options[optionIndex];

  if (!option) {
    return <div className="p-8 text-center text-muted-foreground">Analyse non trouvée</div>;
  }

  const analysis = option.analysis;
  return (
    <AnalysisScreen
      title={analysis.title}
      items={analysis.items}
      analysisType={analysis.analysisType}
      questionId={`${questionId}${analysisCode}`}
      category={question.category}
    />
  );
}