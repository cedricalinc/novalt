import { createFileRoute } from "@tanstack/react-router";
import { Lock, MapPin } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { mockActualites } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/offres")({
  head: () => ({
    meta: [
      { title: "Recherche & offres — Extranet CFA" },
      { name: "description", content: "Offres d'alternance proposées par le CFA et ses entreprises partenaires." },
      { property: "og:title", content: "Recherche & offres — Extranet CFA" },
      { property: "og:description", content: "Offres d'alternance du CFA." },
    ],
  }),
  component: Offres,
});

function Offres() {
  const offres = mockActualites.filter((a) => a.type === "OFFRE_ALTERNANCE");
  return (
    <AppShell title="Recherche & offres">
      <div className="mb-4 flex gap-3 rounded-xl bg-warning-soft p-4 text-sm">
        <Lock className="size-4 shrink-0 text-warning" />
        <p>Ton CV doit être validé par le CFA avant de pouvoir postuler.</p>
      </div>
      <ul className="space-y-3">
        {offres.map((o) => (
          <li key={o.titre} className="card-soft p-4">
            <p className="font-semibold">{o.titre.replace("Nouvelle offre : ", "")}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3" />{o.lieu}</p>
            <p className="mt-2 text-sm text-muted-foreground">{o.description}</p>
            <Button className="mt-3" disabled><Lock /> Postuler</Button>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
