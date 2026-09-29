import { PlanList } from "@/components/PlanView";
import { planInput } from "@/data/content";

export const metadata = { title: "Lernplan · Narra" };

export default function PlanPage() {
  return (
    <div className="flex w-full flex-col gap-6 px-6 pt-8 pb-6 lg:mx-auto lg:max-w-3xl lg:px-10 lg:pt-12">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">Lernplan</h1>
        <p className="text-sm text-muted">
          Jeden Tag ein kleines Stück, abgestimmt auf deinen Prüfungstermin. Pflicht sind die Schlüsselpassagen, ganze Seiten sind freiwillig.
          Dein Fortschritt bleibt nur in diesem Browser.
        </p>
      </header>
      <PlanList input={planInput} />
    </div>
  );
}
