export default function RapportContent({ text }) {
  if (!text) return null;

  // Remplace "Patient" et "patient" par "L'élève" / "l'élève"
  const cleanedText = text
    .replace(/\bPatient\b/g, "L'élève")
    .replace(/\bpatient\b/g, "l'élève")
    .replace(/\bPATIENT\b/g, "L'ÉLÈVE")
    .replace(/\bpatients\b/g, "élèves")
    .replace(/\bPatients\b/g, "Élèves");

  const lines = cleanedText.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) { i++; continue; }

    // Numbered section title: "1. Titre", "2. Titre", etc.
    const numberedMatch = line.match(/^(\d+)\.\s+\*{0,2}(.+?)\*{0,2}$/);
    if (numberedMatch) {
      elements.push(
        <div key={i} className="mt-6 mb-2 flex items-center gap-3">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
            {numberedMatch[1]}
          </span>
          <h3 className="font-display font-semibold text-base text-foreground">{numberedMatch[2]}</h3>
        </div>
      );
      i++; continue;
    }

    // Markdown heading ## or ###
    const headingMatch = line.match(/^#{1,3}\s+(.+)$/);
    if (headingMatch) {
      elements.push(
        <h3 key={i} className="mt-5 mb-1.5 font-display font-semibold text-base text-foreground border-b border-border pb-1">
          {headingMatch[1]}
        </h3>
      );
      i++; continue;
    }

    // Bold line **title** or *title* alone
    const boldLineMatch = line.match(/^\*{1,2}(.+?)\*{1,2}:?$/);
    if (boldLineMatch && line.length < 80) {
      elements.push(
        <p key={i} className="mt-4 mb-1 font-semibold text-sm text-foreground">
          {boldLineMatch[1]}
        </p>
      );
      i++; continue;
    }

    // Bullet point - or •
    const bulletMatch = line.match(/^[-•*]\s+(.+)$/);
    if (bulletMatch) {
      const bulletItems = [];
      while (i < lines.length) {
        const bl = lines[i].trim();
        const bm = bl.match(/^[-•*]\s+(.+)$/);
        if (!bm) break;
        bulletItems.push(bm[1]);
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="my-2 space-y-1.5">
          {bulletItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-foreground/90 leading-relaxed">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>') }} />
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Regular paragraph
    const rendered = line
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/L'élève/g, "<strong>l'élève</strong>") // Highlight élève mentions
    elements.push(
      <p key={i} className="text-sm text-foreground/90 leading-relaxed mb-2.5"
        dangerouslySetInnerHTML={{ __html: rendered }} />
    );
    i++;
  }

  return <div className="space-y-0.5">{elements}</div>;
}