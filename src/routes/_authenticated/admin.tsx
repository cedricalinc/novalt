import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/lib/use-me";
import { ETAPES } from "@/lib/mock-data";
import { AdminOffres } from "@/components/admin-offres";
import { AdminReferentiels, fetchReferentiels, refQuery } from "@/components/admin-referentiels";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Espace CFA — Extranet CFA" },
      { name: "description", content: "Suivi des apprentis : validation des CV et avancement des parcours." },
      { property: "og:title", content: "Espace CFA — Extranet CFA" },
      { property: "og:description", content: "Portail administrateur du CFA." },
    ],
  }),
  component: AdminPage,
});

const CV = ["EN_ATTENTE_VALIDATION", "A_CORRIGER", "VALIDE_CFA"] as const;
const DOSSIER = ["BROUILLON", "EN_REVISION", "VALIDE", "INCOMPLET"] as const;

async function fetchCandidats() {
  const { data, error } = await supabase
    .from("parcours_cfa")
    .select("id, etape_courante, annee_scolaire, intitule_formation, promotion_id, profiles(id, prenom, nom, email, role), admissions_dossier(id, statut_cv, statut_dossier, commentaire_conseiller)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

type Refs = Awaited<ReturnType<typeof fetchReferentiels>>;

function AdminPage() {
  const { data: me } = useMe();
  const [tab, setTab] = useState<"apprentis" | "offres" | "referentiels">("apprentis");
  const isAdmin = me?.profile.role === "ADMIN_CFA";
  const list = useQuery({ queryKey: ["admin-candidats"], queryFn: fetchCandidats, enabled: isAdmin });
  const refs = useQuery({ ...refQuery, enabled: isAdmin });
  const [fEtab, setFEtab] = useState("");
  const [fForm, setFForm] = useState("");
  const [fPromo, setFPromo] = useState("");
  const [q, setQ] = useState("");

  if (!me) return <AppShell title="Espace CFA"><p className="text-sm text-muted-foreground">Chargement…</p></AppShell>;
  if (!isAdmin)
    return (
      <AppShell title="Espace CFA">
        <p className="text-sm text-muted-foreground">Cet espace est réservé à l'équipe du CFA.</p>
        <Link to="/" className="mt-3 inline-block text-sm text-primary hover:underline">Retour à mon parcours</Link>
      </AppShell>
    );

  const r = refs.data;
  const promoInfo = (pid: string | null) => {
    const p = r?.promotions.find((x) => x.id === pid);
    const f = r?.formations.find((x) => x.id === p?.formation_id);
    const e = r?.etablissements.find((x) => x.id === f?.etablissement_id);
    return { p, f, e };
  };
  const needle = q.trim().toLowerCase();
  const apprentis = (list.data?.filter((p) => p.profiles?.role === "CANDIDAT") ?? []).filter((p) => {
    const { p: pr, f, e } = promoInfo(p.promotion_id);
    if (fPromo && (fPromo === "none" ? p.promotion_id : pr?.id !== fPromo)) return false;
    if (fForm && f?.id !== fForm) return false;
    if (fEtab && e?.id !== fEtab) return false;
    if (needle && !`${p.profiles?.prenom} ${p.profiles?.nom} ${p.profiles?.email}`.toLowerCase().includes(needle)) return false;
    return true;
  });
  const groups = new Map<string, { label: string; items: typeof apprentis }>();
  for (const a of apprentis) {
    const { p, f, e } = promoInfo(a.promotion_id);
    const key = p?.id ?? "none";
    const label = p ? `${e?.nom} › ${f?.intitule} › ${p.nom}` : "Sans promotion";
    if (!groups.has(key)) groups.set(key, { label, items: [] });
    groups.get(key)!.items.push(a);
  }
  const sorted = [...groups.entries()].sort(([ka, a], [kb, b]) => (ka === "none" ? 1 : kb === "none" ? -1 : a.label.localeCompare(b.label)));
  const formOpts = r?.formations.filter((f) => !fEtab || f.etablissement_id === fEtab) ?? [];
  const promoOpts = r?.promotions.filter((p) => formOpts.some((f) => f.id === p.formation_id) && (!fForm || p.formation_id === fForm)) ?? [];
  const sel = "h-9 rounded-md border border-input bg-background px-2 text-sm";

  return (
    <AppShell title="Espace CFA">
      <div className="mb-6 flex flex-wrap gap-2">
        {(["apprentis", "offres", "referentiels"] as const).map((t) => (
          <Button key={t} size="sm" variant={tab === t ? "default" : "outline"} onClick={() => setTab(t)}>
            {t === "apprentis" ? "Apprentis" : t === "offres" ? "Offres & candidatures" : "Référentiels"}
          </Button>
        ))}
      </div>
      {tab === "offres" ? <AdminOffres /> : tab === "referentiels" ? <AdminReferentiels /> : <>
        <div className="mb-4 grid gap-2 sm:grid-cols-4">
          <Input placeholder="Rechercher un nom, un e-mail…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className={sel} value={fEtab} onChange={(e) => { setFEtab(e.target.value); setFForm(""); setFPromo(""); }}>
            <option value="">Tous les établissements</option>
            {r?.etablissements.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
          </select>
          <select className={sel} value={fForm} onChange={(e) => { setFForm(e.target.value); setFPromo(""); }}>
            <option value="">Toutes les formations</option>
            {formOpts.map((f) => <option key={f.id} value={f.id}>{f.intitule}</option>)}
          </select>
          <select className={sel} value={fPromo} onChange={(e) => setFPromo(e.target.value)}>
            <option value="">Toutes les promotions</option>
            {!fEtab && !fForm && <option value="none">Sans promotion</option>}
            {promoOpts.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
          </select>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">{apprentis.length} apprenti(s)</p>
        <div className="flex flex-col gap-6">
          {sorted.map(([k, g]) => (
            <section key={k} className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground">{g.label} ({g.items.length})</h2>
              {g.items.map((p) => <CandidatCard key={p.id} p={p} refs={r} />)}
            </section>
          ))}
        </div>
      </>}
    </AppShell>
  );
}

type Row = Awaited<ReturnType<typeof fetchCandidats>>[number];

function CandidatCard({ p }: { p: Row }) {
  const qc = useQueryClient();
  const adm = Array.isArray(p.admissions_dossier) ? p.admissions_dossier[0] : p.admissions_dossier;
  const [comment, setComment] = useState(adm?.commentaire_conseiller ?? "");
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-candidats"] });

  async function upd(table: "admissions_dossier" | "parcours_cfa", id: string, values: Record<string, unknown>) {
    const { error } = await supabase.from(table).update(values as never).eq("id", id);
    if (error) { toast.error("Enregistrement impossible"); return; }
    toast.success("Enregistré"); refresh();
  }

  const sel = "h-9 rounded-md border border-input bg-background px-2 text-sm";
  return (
    <div className="card-soft space-y-3 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{p.profiles?.prenom} {p.profiles?.nom}</p>
          <p className="text-xs text-muted-foreground">{p.profiles?.email} · {p.intitule_formation ?? "Formation à préciser"} · {p.annee_scolaire}</p>
        </div>
        {adm && <StatusBadge status={adm.statut_cv} />}
      </div>
      <label className="grid gap-1 text-xs text-muted-foreground">Promotion
        <select className={sel} value={p.promotion_id ?? ""} onChange={(e) => upd("parcours_cfa", p.id, { promotion_id: e.target.value || null })}>
          <option value="">Sans promotion</option>
          {refs?.promotions.map((pr) => {
            const f = refs.formations.find((x) => x.id === pr.formation_id);
            const et = refs.etablissements.find((x) => x.id === f?.etablissement_id);
            return <option key={pr.id} value={pr.id}>{et?.nom} › {f?.intitule} › {pr.nom}</option>;
          })}
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="grid gap-1 text-xs text-muted-foreground">Étape
          <select className={sel} value={p.etape_courante} onChange={(e) => upd("parcours_cfa", p.id, { etape_courante: e.target.value })}>
            {ETAPES.map((s) => <option key={s.code} value={s.code}>{s.num} {s.label}</option>)}
          </select>
        </label>
        {adm && <>
          <label className="grid gap-1 text-xs text-muted-foreground">CV
            <select className={sel} value={adm.statut_cv} onChange={(e) => upd("admissions_dossier", adm.id, { statut_cv: e.target.value })}>
              {CV.map((s) => <option key={s} value={s}>{s === "VALIDE_CFA" ? "Validé" : s === "A_CORRIGER" ? "À corriger" : "En attente"}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-xs text-muted-foreground">Dossier
            <select className={sel} value={adm.statut_dossier} onChange={(e) => upd("admissions_dossier", adm.id, { statut_dossier: e.target.value })}>
              {DOSSIER.map((s) => <option key={s} value={s}>{s.replace("_", " ").toLowerCase()}</option>)}
            </select>
          </label>
        </>}
      </div>
      {adm && (
        <div className="space-y-2">
          <Textarea placeholder="Commentaire pour l'apprenti" value={comment} onChange={(e) => setComment(e.target.value)} />
          <Button size="sm" variant="outline" onClick={() => upd("admissions_dossier", adm.id, { commentaire_conseiller: comment || null })}>Enregistrer le commentaire</Button>
        </div>
      )}
    </div>
  );
}
