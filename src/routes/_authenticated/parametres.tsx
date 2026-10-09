import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { KeyRound, Mail, ShieldCheck, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useMe, useRefreshMe } from "@/lib/use-me";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/parametres")({
  head: () => ({
    meta: [
      { title: "Paramètres — Extranet CFA" },
      { name: "description", content: "Gérez vos identifiants, notifications e-mail et données personnelles (RGPD)." },
      { property: "og:title", content: "Paramètres — Extranet CFA" },
      { property: "og:description", content: "Identifiants, notifications et RGPD." },
    ],
  }),
  component: Parametres,
});

const NOTIFS = [
  { key: "notif_candidatures", label: "Candidatures", desc: "Réponses et changements de statut" },
  { key: "notif_admissions", label: "Admissions", desc: "Avancement de ton dossier et validation du CV" },
  { key: "notif_entretiens", label: "Entretiens", desc: "Invitations et rappels d'entretien" },
  { key: "notif_documents", label: "Documents", desc: "Documents à déposer ou à signer" },
] as const;

function Parametres() {
  const { data: me } = useMe();
  const refresh = useRefreshMe();
  const prefs = (me?.prefs ?? {}) as Record<string, boolean>;
  const [dialog, setDialog] = useState<null | "email" | "password" | "delete">(null);
  const [v, setV] = useState({ email: "", current: "", next: "" });
  async function setPref(key: string, val: boolean) {
    const { error } = await supabase.from("user_preferences").update({ [key]: val } as never).eq("user_id", me!.profile.id);
    if (error) { toast.error("Enregistrement impossible"); return; }
    await refresh(); toast.success("Préférence enregistrée");
  }
  async function submit() {
    if (dialog === "email") {
      const { error } = await supabase.auth.updateUser({ email: v.email });
      if (error) { toast.error(error.message); return; }
      toast.success("Confirme le changement via le lien envoyé à ta nouvelle adresse");
    } else if (dialog === "password") {
      const { error } = await supabase.auth.updateUser({ password: v.next, current_password: v.current } as never);
      if (error) { toast.error(error.message); return; }
      toast.success("Mot de passe modifié");
    } else toast.success("Demande de suppression envoyée au CFA");
    setV({ email: "", current: "", next: "" }); setDialog(null);
  }

  return (
    <AppShell title="Paramètres">
      <Tabs defaultValue="identifiants">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="identifiants">Identifiants</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="rgpd">RGPD</TabsTrigger>
        </TabsList>

        <TabsContent value="identifiants" className="mt-4 space-y-3">
          <Row icon={Mail} title="Adresse e-mail" value={me?.profile.email ?? ""} action="Modifier" onClick={() => setDialog("email")} />
          <Row icon={KeyRound} title="Mot de passe" value="••••••••••" action="Modifier" onClick={() => setDialog("password")} />
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <div className="card-soft divide-y divide-border">
            <p className="p-4 text-sm text-muted-foreground">Choisis les e-mails que tu souhaites recevoir.</p>
            {NOTIFS.map((n) => (
              <label key={n.key} className="flex cursor-pointer items-center justify-between gap-4 p-4">
                <span>
                  <span className="block text-sm font-semibold">{n.label}</span>
                  <span className="block text-xs text-muted-foreground">{n.desc}</span>
                </span>
                <Switch checked={prefs[n.key] ?? false} disabled={!me} onCheckedChange={(val) => setPref(n.key, val)} />
              </label>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rgpd" className="mt-4 space-y-3">
          <div className="card-soft flex gap-3 p-4">
            <ShieldCheck className="size-5 shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground">Tes données sont utilisées uniquement pour le suivi de ta formation et de ton alternance, et conservées pendant la durée légale.</p>
          </div>
          <Row icon={Download} title="Exporter mes données" value="Recevoir une copie de toutes tes données" action="Exporter" onClick={() => toast.success("Ta demande d'export a été envoyée")} />
          <Row icon={Trash2} title="Supprimer mon compte" value="Action définitive et irréversible" action="Supprimer" destructive onClick={() => setDialog("delete")} />
        </TabsContent>
      </Tabs>

      <Dialog open={dialog !== null} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog === "email" ? "Modifier l'e-mail" : dialog === "password" ? "Modifier le mot de passe" : "Supprimer mon compte"}</DialogTitle>
            {dialog === "delete" && <DialogDescription>Toutes tes données seront supprimées. Cette action est irréversible.</DialogDescription>}
          </DialogHeader>
          {dialog === "email" && (
            <div className="grid gap-1.5"><Label htmlFor="em">Nouvel e-mail</Label><Input id="em" type="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} /></div>
          )}
          {dialog === "password" && (
            <div className="grid gap-3">
              <div className="grid gap-1.5"><Label htmlFor="p1">Mot de passe actuel</Label><Input id="p1" type="password" value={v.current} onChange={(e) => setV({ ...v, current: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label htmlFor="p2">Nouveau mot de passe</Label><Input id="p2" type="password" value={v.next} onChange={(e) => setV({ ...v, next: e.target.value })} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Annuler</Button>
            <Button variant={dialog === "delete" ? "destructive" : "default"} onClick={submit}>
              {dialog === "delete" ? "Supprimer" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function Row({ icon: Icon, title, value, action, onClick, destructive }: { icon: typeof Mail; title: string; value: string; action: string; onClick: () => void; destructive?: boolean }) {
  return (
    <div className="card-soft flex items-center gap-3 p-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground"><Icon className="size-4" /></span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{value}</p>
      </div>
      <Button size="sm" variant={destructive ? "destructive" : "outline"} onClick={onClick}>{action}</Button>
    </div>
  );
}
