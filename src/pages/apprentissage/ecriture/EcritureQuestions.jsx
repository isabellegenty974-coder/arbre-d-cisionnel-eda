import ScreenLayout from "../../../components/tree/ScreenLayout";
import NavCards from "../../../components/tree/NavCards";

export default function EcritureQuestions() {
  return (
    <ScreenLayout title="🔍 Questions diagnostiques – Écriture" subtitle="Choisissez la situation qui correspond à l'élève.">
      <NavCards
        items={[
          { label: "Q11 – Écrit avec tension, lenteur et douleur", to: "/apprentissage/ecriture/questions/q11" },
          { label: "Q12 – Écriture illisible et irrégulière", to: "/apprentissage/ecriture/questions/q12" },
          { label: "Q13 – Refuse d'écrire car « ça fait mal »", to: "/apprentissage/ecriture/questions/q13" },
          { label: "Q14 – Beaucoup d'erreurs phonologiques à l'écrit", to: "/apprentissage/ecriture/questions/q14" },
          { label: "Q15 – Bon oral mais orthographe très faible", to: "/apprentissage/ecriture/questions/q15" },
          { label: "Q16 – Écrit très lentement mais proprement", to: "/apprentissage/ecriture/questions/q16" },
          { label: "Q17 – Écriture très petite et serrée", to: "/apprentissage/ecriture/questions/q17" },
          { label: "Q18 – Écriture très grande et débordante", to: "/apprentissage/ecriture/questions/q18" },
        ]}
      />
    </ScreenLayout>
  );
}