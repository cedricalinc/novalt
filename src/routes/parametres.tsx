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
import { mockProfile } from "@/lib/mock-data";

export const Route = createFileRoute("/parametres")({
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
  const [prefs, setPrefs] = useState<Record<string, boolean>>({ notif_candidatures: true, notif_admissions: true, notif_entretiens: true, notif_documents: false });
  const [dialog, setDialog] = useState<null | "email" | "password" | "delete">(null);

  return (
    <AppShell title="Paramètres">
      <Tabs defaultValue="identifiants">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="identifiants">Identifiants</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="rgpd">RGPD</TabsTrigger>
        </TabsList>

        <TabsContent value="identifiants" className="mt-4 space-y-3">
          <Row icon={Mail} title="Adresse e-mail" value={mockProfile.email} action="Modifier" onClick={() => setDialog("email")} />
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
                <Switch checked={prefs[n.key] ?? false} onCheckedChange={(v) => { setPrefs({ ...prefs, [n.key]: v }); toast.success("Préférence enregistrée"); }} />
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
            <div className="grid gap-1.5"><Label htmlFor="em">Nouvel e-mail</Label><Input id="em" type="email" defaultValue={mockProfile.email} /></div>
          )}
          {dialog === "password" && (
            <div className="grid gap-3">
              <div className="grid gap-1.5"><Label htmlFor="p1">Mot de passe actuel</Label><Input id="p1" type="password" /></div>
              <div className="grid gap-1.5"><Label htmlFor="p2">Nouveau mot de passe</Label><Input id="p2" type="password" /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Annuler</Button>
            <Button variant={dialog === "delete" ? "destructive" : "default"} onClick={() => { toast.success(dialog === "delete" ? "Demande de suppression envoyée" : "Modification enregistrée"); setDialog(null); }}>
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
