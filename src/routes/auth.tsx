import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion — Extranet CFA" },
      { name: "description", content: "Connectez-vous ou créez votre compte apprenti sur l'extranet du CFA." },
      { property: "og:title", content: "Connexion — Extranet CFA" },
      { property: "og:description", content: "Accédez à votre espace apprenti." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [f, setF] = useState({ email: "", password: "", prenom: "", nom: "", formation: "" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) navigate({ to: "/" }); });
  }, [navigate]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: f.email, password: f.password });
    setLoading(false);
    if (error) return toast.error("E-mail ou mot de passe incorrect");
    navigate({ to: "/" });
  }
  async function signUp(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: f.email, password: f.password,
      options: { emailRedirectTo: window.location.origin, data: { prenom: f.prenom, nom: f.nom, formation: f.formation } },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Compte créé ! Confirme ton adresse via le lien reçu par e-mail.");
  }
  async function forgot() {
    if (!f.email) return toast.error("Saisis d'abord ton e-mail");
    const { error } = await supabase.auth.resetPasswordForEmail(f.email, { redirectTo: `${window.location.origin}/reset-password` });
    if (error) return toast.error(error.message);
    toast.success("E-mail de réinitialisation envoyé");
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <div className="card-soft w-full max-w-md p-6">
        <div className="mb-6 flex items-center gap-2">
          <div className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground"><GraduationCap className="size-5" /></div>
          <div><p className="font-bold">Extranet CFA</p><p className="text-xs text-muted-foreground">Portail apprenti</p></div>
        </div>
        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Connexion</TabsTrigger>
            <TabsTrigger value="signup">Créer un compte</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={signIn} className="mt-4 grid gap-3">
              <div className="grid gap-1.5"><Label htmlFor="e1">E-mail</Label><Input id="e1" type="email" required value={f.email} onChange={set("email")} /></div>
              <div className="grid gap-1.5"><Label htmlFor="p1">Mot de passe</Label><Input id="p1" type="password" required value={f.password} onChange={set("password")} /></div>
              <Button type="submit" disabled={loading}>Se connecter</Button>
              <button type="button" onClick={forgot} className="text-sm text-primary hover:underline">Mot de passe oublié ?</button>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={signUp} className="mt-4 grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label htmlFor="pr">Prénom</Label><Input id="pr" required value={f.prenom} onChange={set("prenom")} /></div>
                <div className="grid gap-1.5"><Label htmlFor="no">Nom</Label><Input id="no" required value={f.nom} onChange={set("nom")} /></div>
              </div>
              <div className="grid gap-1.5"><Label htmlFor="fo">Formation visée</Label><Input id="fo" value={f.formation} onChange={set("formation")} placeholder="ex. BTS NDRC" /></div>
              <div className="grid gap-1.5"><Label htmlFor="e2">E-mail</Label><Input id="e2" type="email" required value={f.email} onChange={set("email")} /></div>
              <div className="grid gap-1.5"><Label htmlFor="p2">Mot de passe</Label><Input id="p2" type="password" minLength={8} required value={f.password} onChange={set("password")} /></div>
              <Button type="submit" disabled={loading}>Créer mon compte</Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
