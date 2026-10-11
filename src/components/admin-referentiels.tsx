import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export async function fetchReferentiels() {
  const [e, f, p] = await Promise.all([
    supabase.from("etablissements").select("*").order("nom"),
    supabase.from("formations").select("*").order("intitule"),
    supabase.from("promotions").select("*").order("nom"),
  ]);
  if (e.error || f.error || p.error) throw e.error ?? f.error ?? p.error;
  return { etablissements: e.data, formations: f.data, promotions: p.data };
}
export const refQuery = { queryKey: ["referentiels"], queryFn: fetchReferentiels };

export function AdminReferentiels() {
  const qc = useQueryClient();
  const { data } = useQuery(refQuery);
  const refresh = () => qc.invalidateQueries({ queryKey: ["referentiels"] });
  const [etab, setEtab] = useState({ nom: "", ville: "" });
  const [form, setForm] = useState<Record<string, string>>({});
  const [promo, setPromo] = useState<Record<string, string>>({});

  async function run(p: PromiseLike<{ error: unknown }>) {
    const { error } = await p;
    if (error) { toast.error("Opération impossible"); return false; }
    toast.success("Enregistré"); refresh(); return true;
  }
  const del = (t: "etablissements" | "formations" | "promotions", id: string) => {
    if (confirm("Supprimer cet élément et tout ce qu'il contient ?")) run(supabase.from(t).delete().eq("id", id));
  };

  if (!data) return <p className="text-sm text-muted-foreground">Chargement…</p>;
  return (
    <div className="space-y-4">
      <form className="card-soft flex flex-wrap gap-2 p-4" onSubmit={async (e) => {
        e.preventDefault(); if (!etab.nom.trim()) return;
        if (await run(supabase.from("etablissements").insert({ nom: etab.nom.trim(), ville: etab.ville.trim() || null }))) setEtab({ nom: "", ville: "" });
      }}>
        <Input className="flex-1 min-w-40" placeholder="Nouvel établissement" value={etab.nom} onChange={(e) => setEtab({ ...etab, nom: e.target.value })} />
        <Input className="w-40" placeholder="Ville" value={etab.ville} onChange={(e) => setEtab({ ...etab, ville: e.target.value })} />
        <Button type="submit">Ajouter</Button>
      </form>
      {data.etablissements.length === 0 && <p className="text-sm text-muted-foreground">Aucun établissement pour l'instant.</p>}
      {data.etablissements.map((et) => (
        <div key={et.id} className="card-soft space-y-3 p-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold">{et.nom}{et.ville && <span className="font-normal text-muted-foreground"> · {et.ville}</span>}</p>
            <button aria-label="Supprimer" onClick={() => del("etablissements", et.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
          </div>
          <div className="space-y-2 border-l-2 border-border pl-4">
            {data.formations.filter((f) => f.etablissement_id === et.id).map((f) => (
              <div key={f.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{f.intitule}</p>
                  <button aria-label="Supprimer" onClick={() => del("formations", f.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-3.5" /></button>
                </div>
                <div className="flex flex-wrap items-center gap-2 pl-4">
                  {data.promotions.filter((p) => p.formation_id === f.id).map((p) => (
                    <span key={p.id} className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs">
                      {p.nom}
                      <select aria-label="Durée" className="bg-transparent text-xs text-muted-foreground" value={p.duree_annees}
                        onChange={(e) => run(supabase.from("promotions").update({ duree_annees: Number(e.target.value) }).eq("id", p.id))}>
                        {[1, 2, 3].map((n) => <option key={n} value={n}>{n} an{n > 1 ? "s" : ""}</option>)}
                      </select>
                      <button aria-label="Supprimer" onClick={() => del("promotions", p.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-3" /></button>
                    </span>
                  ))}
                  <form className="flex gap-1" onSubmit={async (e) => {
                    e.preventDefault(); const v = promo[f.id]?.trim(); if (!v) return;
                    if (await run(supabase.from("promotions").insert({ formation_id: f.id, nom: v, duree_annees: Number(promo[f.id + ":d"] ?? 1) }))) setPromo({ ...promo, [f.id]: "" });
                  }}>
                    <Input className="h-8 w-40 text-xs" placeholder="Nouvelle promotion" value={promo[f.id] ?? ""} onChange={(e) => setPromo({ ...promo, [f.id]: e.target.value })} />
                    <select aria-label="Durée" className="h-8 rounded-md border border-input bg-background px-1 text-xs" value={promo[f.id + ":d"] ?? "1"} onChange={(e) => setPromo({ ...promo, [f.id + ":d"]: e.target.value })}>
                      {[1, 2, 3].map((n) => <option key={n} value={n}>{n} an{n > 1 ? "s" : ""}</option>)}
                    </select>
                    <Button size="sm" variant="outline" type="submit">+</Button>
                  </form>
                </div>
              </div>
            ))}
            <form className="flex gap-2" onSubmit={async (e) => {
              e.preventDefault(); const v = form[et.id]?.trim(); if (!v) return;
              if (await run(supabase.from("formations").insert({ etablissement_id: et.id, intitule: v }))) setForm({ ...form, [et.id]: "" });
            }}>
              <Input className="h-9" placeholder="Nouvelle formation" value={form[et.id] ?? ""} onChange={(e) => setForm({ ...form, [et.id]: e.target.value })} />
              <Button size="sm" variant="outline" type="submit">Ajouter</Button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
