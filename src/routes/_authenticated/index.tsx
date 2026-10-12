import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { User, FileCheck2, CalendarDays, FolderOpen, Newspaper, Upload, Download, MapPin, CheckCircle2, Circle, MessageSquareText, Pencil } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { ParcoursStepper } from "@/components/parcours/stepper";
import { StatusBadge } from "@/components/status-badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { useMe, useRefreshMe } from "@/lib/use-me";
import { supabase } from "@/integrations/supabase/client";
import { StudentDocuments } from "@/components/documents";
import { mockAdmission, mockCalendrier, mockDocuments, mockActualites } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Mon parcours — Extranet CFA" },
      { name: "description", content: "Suivez votre parcours d'apprenti : inscription, recherche, contrat, entreprise et bilan." },
      { property: "og:title", content: "Mon parcours — Extranet CFA" },
      { property: "og:description", content: "Suivez votre parcours d'apprenti en 5 étapes." },
    ],
  }),
  component: MonParcours,
});

function SectionIcon({ icon: Icon }: { icon: typeof User }) {
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
      <Icon className="size-4" />
    </span>
  );
}

function MonParcours() {
  const { data: me, isLoading } = useMe();
  const refresh = useRefreshMe();
  const empty = { prenom: "", nom: "", email: "", telephone: "" };
  const [draft, setDraft] = useState(empty);
  const [editOpen, setEditOpen] = useState(false);
  if (isLoading || !me) return <AppShell title="Mon parcours"><p className="text-sm text-muted-foreground">Chargement…</p></AppShell>;
  if (me.profile.role !== "CANDIDAT") return <Navigate to="/admin" replace />;
  const profile = {
    prenom: me.profile.prenom ?? "", nom: me.profile.nom ?? "", email: me.profile.email ?? "", telephone: me.profile.telephone ?? "",
    intitule_formation: me.parcours?.intitule_formation ?? "Formation à préciser",
    annee_scolaire: me.parcours?.annee_scolaire ?? "—",
    etape_courante: (me.parcours?.etape_courante ?? "01_INSCRIPTION") as "01_INSCRIPTION",
  };
  const adm = {
    statut_dossier: me.admission?.statut_dossier ?? "BROUILLON",
    statut_cv: me.admission?.statut_cv ?? "EN_ATTENTE_VALIDATION",
    commentaire_conseiller: me.admission?.commentaire_conseiller,
  };
  async function save() {
    const { error } = await supabase.from("profiles").update({ prenom: draft.prenom, nom: draft.nom, telephone: draft.telephone }).eq("id", me!.profile.id);
    if (error) { toast.error("Enregistrement impossible"); return; }
    await refresh(); setEditOpen(false); toast.success("Informations mises à jour");
  }

  const sections = [
    { id: "infos", icon: User, title: "Mes informations", hint: "Profil et coordonnées" },
    { id: "admissions", icon: FileCheck2, title: "Mes admissions", hint: "Dossier et statut du CV" },
    { id: "calendrier", icon: CalendarDays, title: "Mon calendrier", hint: `${mockCalendrier.length} évènements à venir` },
    { id: "documents", icon: FolderOpen, title: "Mes documents", hint: "Dépôt de justificatifs" },
    { id: "actus", icon: Newspaper, title: "Mes actualités & ateliers", hint: "Fil du CFA" },
  ];

  return (
    <AppShell title="Mon parcours">
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">Bonjour {profile.prenom}</p>
        <p className="font-semibold">{profile.intitule_formation}</p>
        <p className="text-xs text-muted-foreground">Année {profile.annee_scolaire}</p>
      </div>

      <div className="sticky top-[57px] z-10 -mx-4 bg-background px-4 pb-3 md:static md:mx-0 md:px-0">
        <ParcoursStepper current={profile.etape_courante} />
      </div>

      <Accordion type="multiple" defaultValue={["admissions"]} className="mt-2 flex flex-col gap-3">
        {sections.map((s) => (
          <AccordionItem key={s.id} value={s.id} className="card-soft border-none px-4">
            <AccordionTrigger className="hover:no-underline">
              <span className="flex items-center gap-3 text-left">
                <SectionIcon icon={s.icon} />
                <span>
                  <span className="block font-semibold">{s.title}</span>
                  <span className="block text-xs font-normal text-muted-foreground">{s.hint}</span>
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              {s.id === "infos" && (
                <div className="space-y-3">
                  <dl className="grid gap-3 sm:grid-cols-2">
                    {[["Prénom", profile.prenom], ["Nom", profile.nom], ["E-mail", profile.email], ["Téléphone", profile.telephone]].map(([k, v]) => (
                      <div key={k} className="rounded-lg bg-muted p-3">
                        <dt className="text-xs text-muted-foreground">{k}</dt>
                        <dd className="font-medium">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <Button variant="outline" onClick={() => { setDraft({ prenom: profile.prenom, nom: profile.nom, email: profile.email, telephone: profile.telephone }); setEditOpen(true); }}>
                    <Pencil /> Modifier mes informations
                  </Button>
                </div>
              )}

              {s.id === "admissions" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 text-sm">Dossier <StatusBadge status={adm.statut_dossier} /></div>
                    <div className="flex items-center gap-2 text-sm">CV <StatusBadge status={adm.statut_cv} /></div>
                  </div>
                  {adm.commentaire_conseiller && <div className="flex gap-3 rounded-lg bg-warning-soft p-3 text-sm">
                    <MessageSquareText className="mt-0.5 size-4 shrink-0 text-warning" />
                    <div>
                      <p className="font-semibold">Commentaire du conseiller</p>
                      <p className="text-muted-foreground">{adm.commentaire_conseiller}</p>
                    </div>
                  </div>}
                  <ul className="space-y-2">
                    {mockAdmission.etapes.map((e) => (
                      <li key={e.label} className="flex items-center gap-2 text-sm">
                        {e.done ? <CheckCircle2 className="size-4 text-success" /> : <Circle className="size-4 text-muted-foreground" />}
                        <span className={e.done ? "" : "text-muted-foreground"}>{e.label}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground">Tant que ton CV n'est pas validé par le CFA, tu ne peux pas postuler aux offres.</p>
                </div>
              )}

              {s.id === "calendrier" && (
                <ul className="divide-y divide-border">
                  {mockCalendrier.map((c) => {
                    const d = new Date(c.date);
                    return (
                      <li key={c.titre} className="flex items-center gap-3 py-3">
                        <div className="w-12 shrink-0 rounded-lg bg-secondary py-1 text-center text-secondary-foreground">
                          <p className="text-lg font-bold leading-none">{d.getDate()}</p>
                          <p className="text-[10px] uppercase">{d.toLocaleDateString("fr-FR", { month: "short" })}</p>
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{c.titre}</p>
                          <p className="text-xs text-muted-foreground">{c.heure} · {c.lieu}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              {s.id === "documents" && me && <StudentDocuments profileId={me.profile.id} />}

              {s.id === "actus" && (
                <ul className="space-y-3">
                  {mockActualites.map((a) => (
                    <li key={a.titre} className="rounded-lg bg-muted p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                        {a.type === "ATELIER_CV" ? "Atelier" : a.type === "OFFRE_ALTERNANCE" ? "Offre" : "Networking"} · {a.date}
                      </p>
                      <p className="mt-1 font-semibold">{a.titre}</p>
                      <p className="text-sm text-muted-foreground">{a.description}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3" />{a.lieu}</p>
                    </li>
                  ))}
                </ul>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl md:mx-auto md:max-w-lg">
          <SheetHeader><SheetTitle>Modifier mes informations</SheetTitle></SheetHeader>
          <div className="grid gap-3 px-4">
            {(["prenom", "nom", "email", "telephone"] as const).map((f) => (
              <div key={f} className="grid gap-1.5">
                <Label htmlFor={f} className="capitalize">{f === "telephone" ? "Téléphone" : f === "prenom" ? "Prénom" : f === "email" ? "E-mail" : "Nom"}</Label>
                <Input id={f} disabled={f === "email"} value={draft[f]} onChange={(e) => setDraft({ ...draft, [f]: e.target.value })} />
              </div>
            ))}
          </div>
          <SheetFooter>
            <Button onClick={save}>Enregistrer</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}
