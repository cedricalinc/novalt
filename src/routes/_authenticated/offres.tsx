import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Lock, MapPin, Send, Check } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/lib/use-me";

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

const LABEL: Record<string, string> = {
  ENVOYE: "Candidature envoyée",
  ENTRETIEN_PROGRAMME: "Entretien programmé",
  ACCEPTE: "Acceptée",
  REFUSE: "Refusée",
};

function Offres() {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const offres = useQuery({
    queryKey: ["offres"],
    queryFn: async () => {
      const { data, error } = await supabase.from("offres_et_ateliers").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const cands = useQuery({
    queryKey: ["mes-candidatures"],
    enabled: !!me,
    queryFn: async () => {
      const { data, error } = await supabase.from("candidatures").select("*").eq("candidat_id", me!.profile.id);
      if (error) throw error;
      return data;
    },
  });
  const cvOk = me?.admission?.statut_cv === "VALIDE_CFA";
  const refresh = () => { qc.invalidateQueries({ queryKey: ["mes-candidatures"] }); qc.invalidateQueries({ queryKey: ["me"] }); };

  async function postuler(offre_id: string) {
    const { error } = await supabase.from("candidatures").insert({ candidat_id: me!.profile.id, offre_id });
    if (error) { toast.error(error.message.includes("CV") ? "Ton CV doit être validé par le CFA" : "Candidature impossible"); return; }
    toast.success("Candidature envoyée"); refresh();
  }
  async function accepter(id: string) {
    const { error } = await supabase.from("candidatures").update({ statut: "ACCEPTE" }).eq("id", id);
    if (error) { toast.error("Action impossible"); return; }
    toast.success("Offre acceptée — ta fiche de mission est créée"); refresh();
  }

  const list = offres.data?.filter((o) => o.type === "OFFRE_ALTERNANCE") ?? [];
  const events = offres.data?.filter((o) => o.type !== "OFFRE_ALTERNANCE") ?? [];

  return (
    <AppShell title="Recherche & offres">
      {!cvOk && (
        <div className="mb-4 flex gap-3 rounded-xl bg-warning-soft p-4 text-sm">
          <Lock className="size-4 shrink-0 text-warning" />
          <p>Ton CV doit être validé par le CFA avant de pouvoir postuler.</p>
        </div>
      )}
      {offres.isLoading && <p className="text-sm text-muted-foreground">Chargement…</p>}
      {!offres.isLoading && list.length === 0 && <p className="text-sm text-muted-foreground">Aucune offre publiée pour le moment.</p>}
      <ul className="space-y-3">
        {list.map((o) => {
          const c = cands.data?.find((x) => x.offre_id === o.id);
          return (
            <li key={o.id} className="card-soft p-4">
              <p className="font-semibold">{o.titre}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3" />{[o.entreprise_nom, o.lieu].filter(Boolean).join(" — ")}</p>
              {o.description && <p className="mt-2 text-sm text-muted-foreground">{o.description}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {c ? (
                  <>
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">{LABEL[c.statut]}</span>
                    {c.statut === "ENTRETIEN_PROGRAMME" && <Button size="sm" onClick={() => accepter(c.id)}><Check /> Accepter l'offre</Button>}
                  </>
                ) : (
                  <Button size="sm" disabled={!cvOk} onClick={() => postuler(o.id)}>{cvOk ? <Send /> : <Lock />} Postuler</Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {events.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 font-bold">Ateliers & événements</h2>
          <ul className="space-y-3">
            {events.map((e) => (
              <li key={e.id} className="card-soft p-4">
                <p className="font-semibold">{e.titre}</p>
                <p className="text-xs text-muted-foreground">
                  {e.date_evenement && new Date(e.date_evenement).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
                  {e.lieu && ` · ${e.lieu}`}
                </p>
                {e.description && <p className="mt-2 text-sm text-muted-foreground">{e.description}</p>}
              </li>
            ))}
          </ul>
        </>
      )}
    </AppShell>
  );
}
