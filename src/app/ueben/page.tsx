export const metadata = { title: "Üben · Narra" };

const modes = [
  { title: "Quiz", text: "Multiple Choice und offene Fragen, jede mit Beleg." },
  { title: "Karteikarten", text: "Figuren, Motive und Zitate, auch als Anki-Export." },
  { title: "Aussprache", text: "Italienische Namen und Ausdrücke hören und nachsprechen." },
  { title: "Zitat-Duell", text: "Wer sagt das? Welche Szene? Gegen deine Klasse." },
];

export default function PracticePage() {
  return (
    <div className="flex w-full flex-col gap-6 px-6 pt-8 pb-6 lg:mx-auto lg:max-w-3xl lg:px-10 lg:pt-12">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">Üben</h1>
        <p className="text-sm text-muted">Finde heraus, wo du noch Lücken hast.</p>
      </header>
      <ul className="grid grid-cols-2 gap-3 lg:gap-4">
        {modes.map((m) => (
          <li key={m.title} className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-4">
            <h2 className="font-display text-lg font-bold">{m.title}</h2>
            <p className="text-[13px] leading-snug text-muted">{m.text}</p>
            <p className="mt-auto text-xs font-semibold text-accent">Bald</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
