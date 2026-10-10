import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

const TYPES = [
  { v: "OFFRE_ALTERNANCE", l: "Offre d'alternance" },
  { v: "ATELIER_CV", l: "Atelier CV" },
  { v: "EVENEMENT_NETWORKING", l: "Événement networking" },
] as const;
const STATUTS = [
  { v: "ENVOYE", l: "Envoyée" },
  { v: "ENTRETIEN_PROGRAMME", l: "Entretien programmé" },
  { v: "ACCEPTE", l: "Acceptée (à la place de l'apprenti)" },
  { v: "REFUSE", l: "Refusée" },
] as const;
const field = "h-9 w-full rounded-md border border-input bg-background px-2 text-sm";

export function AdminOffres() {
  const qc = useQueryClient();
  const [f, setF] = useState({ type: "OFFRE_ALTERNANCE", titre: "", entreprise_nom: "", lieu: "", date_evenement: "", description: "" });
  const offres = useQuery({
    queryKey: ["offres"],
    queryFn: async () => (await supabase.from("offres_et_ateliers").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const cands = useQuery({
    queryKey: ["admin-candidatures"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidatures")
        .select("id, statut, valide_par, created_at, profiles(prenom, nom), offres_et_ateliers(titre, entreprise_nom)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function create() {
    if (!f.titre.trim()) return toast.error("Le titre est obligatoire");
    const { error } = await supabase.from("offres_et_ateliers").insert({
      type: f.type as (typeof TYPES)[number]["v"],
      titre: f.titre.trim(),
      entreprise_nom: f.entreprise_nom || null,
      lieu: f.lieu || null,
      description: f.description || null,
      date_evenement: f.date_evenement ? new Date(f.date_evenement).toISOString() : null,
    });
    if (error) return toast.error("Publication impossible");
    toast.success("Publié");
    setF({ ...f, titre: "", entreprise_nom: "", lieu: "", date_evenement: "", description: "" });
    qc.invalidateQueries({ queryKey: ["offres"] });
  }
  async function remove(id: string) {
    const { error } = await supabase.from("offres_et_ateliers").delete().eq("id", id);
    if (error) return toast.error("Suppression impossible (des candidatures existent peut-être)");
    qc.invalidateQueries({ queryKey: ["offres"] });
  }
  async function setStatut(id: string, statut: (typeof STATUTS)[number]["v"]) {
    const { error } = await supabase.from("candidatures").update({ statut }).eq("id", id);
    if (error) return toast.error("Modification impossible");
    toast.success("Statut mis à jour");
    qc.invalidateQueries({ queryKey: ["admin-candidatures"] });
    qc.invalidateQueries({ queryKey: ["admin-candidats"] });
  }

  return (
    <div className="space-y-8">
      <section className="card-soft space-y-3 p-4">
        <h2 className="font-bold">Publier une offre ou un événement</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <select className={field} value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
            {TYPES.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
          </select>
          <input className={field} placeholder="Titre *" value={f.titre} onChange={(e) => setF({ ...f, titre: e.target.value })} />
          <input className={field} placeholder="Entreprise" value={f.entreprise_nom} onChange={(e) => setF({ ...f, entreprise_nom: e.target.value })} />
          <input className={field} placeholder="Lieu" value={f.lieu} onChange={(e) => setF({ ...f, lieu: e.target.value })} />
          <input className={field} type="datetime-local" value={f.date_evenement} onChange={(e) => setF({ ...f, date_evenement: e.target.value })} />
        </div>
        <Textarea placeholder="Description" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
        <Button size="sm" onClick={create}>Publier</Button>
      </section>

      <section>
        <h2 className="mb-3 font-bold">Publications ({offres.data?.length ?? 0})</h2>
        <ul className="space-y-2">
          {offres.data?.map((o) => (
            <li key={o.id} className="card-soft flex items-center justify-between gap-2 p-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium">{o.titre}</p>
                <p className="text-xs text-muted-foreground">{TYPES.find((t) => t.v === o.type)?.l}{o.entreprise_nom && ` · ${o.entreprise_nom}`}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => remove(o.id)}>Supprimer</Button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 font-bold">Candidatures ({cands.data?.length ?? 0})</h2>
        {cands.data?.length === 0 && <p className="text-sm text-muted-foreground">Aucune candidature pour le moment.</p>}
        <ul className="space-y-2">
          {cands.data?.map((c) => (
            <li key={c.id} className="card-soft flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
              <div>
                <p className="font-medium">{c.profiles?.prenom} {c.profiles?.nom}</p>
                <p className="text-xs text-muted-foreground">
                  {c.offres_et_ateliers?.titre}{c.offres_et_ateliers?.entreprise_nom && ` · ${c.offres_et_ateliers.entreprise_nom}`}
                  {c.valide_par && ` · validée par ${c.valide_par === "ETUDIANT" ? "l'apprenti" : "le CFA"}`}
                </p>
              </div>
              <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={c.statut} disabled={c.statut === "ACCEPTE"} onChange={(e) => setStatut(c.id, e.target.value as (typeof STATUTS)[number]["v"])}>
                {STATUTS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
              </select>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
