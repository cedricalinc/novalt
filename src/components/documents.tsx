import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Download, Eye, Trash2, Upload, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/status-badge";
import { supabase } from "@/integrations/supabase/client";

export const DOC_TYPES = { CV: "CV", PIECE_IDENTITE: "Pièce d'identité", DIPLOME: "Diplôme", AUTRE: "Autre" } as const;
type DocType = keyof typeof DOC_TYPES;

async function openDoc(path: string, download?: string) {
  const { data, error } = await supabase.storage.from("documents").createSignedUrl(path, 300, download ? { download } : undefined);
  if (error || !data) { toast.error("Fichier introuvable"); return; }
  window.open(data.signedUrl, "_blank", "noopener");
}

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["docs"] });
  qc.invalidateQueries({ queryKey: ["me"] });
  qc.invalidateQueries({ queryKey: ["admin-candidats"] });
}

export function StudentDocuments({ profileId }: { profileId: string }) {
  const qc = useQueryClient();
  const [type, setType] = useState<DocType>("CV");
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const docs = useQuery({
    queryKey: ["docs", profileId],
    queryFn: async () => {
      const { data, error } = await supabase.from("documents_etudiant").select("*").eq("profile_id", profileId).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function upload(file: File) {
    if (file.size > 10 * 1024 * 1024) { toast.error("Fichier trop lourd (10 Mo max)"); return; }
    setBusy(true);
    const path = `${profileId}/${crypto.randomUUID()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
    const up = await supabase.storage.from("documents").upload(path, file, { contentType: file.type });
    if (up.error) { setBusy(false); toast.error("Envoi impossible"); return; }
    const { error } = await supabase.from("documents_etudiant").insert({ profile_id: profileId, type, file_path: path, file_name: file.name });
    setBusy(false);
    if (error) { toast.error("Enregistrement impossible"); return; }
    toast.success("Document déposé, en attente de validation"); invalidate(qc);
  }

  async function remove(id: string, path: string) {
    if (!confirm("Supprimer ce document ?")) return;
    const { error } = await supabase.from("documents_etudiant").delete().eq("id", id);
    if (error) { toast.error("Suppression impossible"); return; }
    await supabase.storage.from("documents").remove([path]);
    invalidate(qc);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={type} onChange={(e) => setType(e.target.value as DocType)}>
          {Object.entries(DOC_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input ref={input} type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
        <Button size="sm" disabled={busy} onClick={() => input.current?.click()}><Upload />{busy ? "Envoi…" : "Déposer un fichier"}</Button>
      </div>
      {docs.data?.length === 0 && <p className="text-sm text-muted-foreground">Aucun document déposé.</p>}
      <ul className="space-y-2">
        {docs.data?.map((d) => (
          <li key={d.id} className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold">{DOC_TYPES[d.type as DocType]}</p>
                <p className="truncate text-xs text-muted-foreground">{d.file_name}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <StatusBadge status={d.statut} />
                <Button size="icon" variant="ghost" aria-label="Télécharger" onClick={() => openDoc(d.file_path, d.file_name)}><Download /></Button>
                {d.statut !== "VALIDE_CFA" && <Button size="icon" variant="ghost" aria-label="Supprimer" onClick={() => remove(d.id, d.file_path)}><Trash2 /></Button>}
              </div>
            </div>
            {d.commentaire && <p className="mt-2 rounded bg-muted p-2 text-xs">CFA : {d.commentaire}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Staff review: one student's documents (profileId) or every pending document. */
export function AdminDocuments({ profileId }: { profileId?: string }) {
  const qc = useQueryClient();
  const docs = useQuery({
    queryKey: ["docs", profileId ?? "pending"],
    queryFn: async () => {
      let q = supabase.from("documents_etudiant").select("*, profiles(prenom, nom, email)").order("created_at", { ascending: true });
      q = profileId ? q.eq("profile_id", profileId) : q.eq("statut", "EN_ATTENTE_VALIDATION");
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
  const [notes, setNotes] = useState<Record<string, string>>({});

  async function setStatut(id: string, statut: "VALIDE_CFA" | "A_CORRIGER") {
    const { error } = await supabase.from("documents_etudiant").update({ statut, commentaire: notes[id]?.trim() || null }).eq("id", id);
    if (error) { toast.error("Enregistrement impossible"); return; }
    toast.success(statut === "VALIDE_CFA" ? "Document validé" : "Renvoyé pour correction"); invalidate(qc);
  }

  if (!docs.data) return <p className="text-sm text-muted-foreground">Chargement…</p>;
  if (docs.data.length === 0) return <p className="text-sm text-muted-foreground">{profileId ? "Aucun document déposé." : "Aucun document en attente de validation."}</p>;
  return (
    <ul className="space-y-2">
      {docs.data.map((d) => (
        <li key={d.id} className="card-soft space-y-2 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              {!profileId && <p className="text-sm font-semibold">{d.profiles?.prenom} {d.profiles?.nom} <span className="font-normal text-muted-foreground">· {d.profiles?.email}</span></p>}
              <p className="text-sm">{DOC_TYPES[d.type as DocType]} · <span className="text-muted-foreground">{d.file_name}</span></p>
              <p className="text-xs text-muted-foreground">Déposé le {new Date(d.created_at).toLocaleDateString("fr-FR")}</p>
            </div>
            <div className="flex items-center gap-1">
              <StatusBadge status={d.statut} />
              <Button size="sm" variant="outline" onClick={() => openDoc(d.file_path)}><Eye />Lire</Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Input className="h-8 flex-1 min-w-40 text-xs" placeholder="Commentaire (facultatif)" value={notes[d.id] ?? d.commentaire ?? ""} onChange={(e) => setNotes({ ...notes, [d.id]: e.target.value })} />
            <Button size="sm" onClick={() => setStatut(d.id, "VALIDE_CFA")}><Check />Valider</Button>
            <Button size="sm" variant="outline" onClick={() => setStatut(d.id, "A_CORRIGER")}><X />À corriger</Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
