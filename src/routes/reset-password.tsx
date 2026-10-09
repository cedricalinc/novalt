import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nouveau mot de passe — Extranet CFA" },
      { name: "description", content: "Choisissez un nouveau mot de passe pour votre compte apprenti." },
      { property: "og:title", content: "Nouveau mot de passe — Extranet CFA" },
      { property: "og:description", content: "Réinitialisation du mot de passe." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) { toast.error(error.message); return; }
    toast.success("Mot de passe mis à jour");
    navigate({ to: "/" });
  }
  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <form onSubmit={submit} className="card-soft grid w-full max-w-md gap-3 p-6">
        <h1 className="text-lg font-bold">Nouveau mot de passe</h1>
        <div className="grid gap-1.5"><Label htmlFor="np">Mot de passe</Label><Input id="np" type="password" minLength={8} required value={pw} onChange={(e) => setPw(e.target.value)} /></div>
        <Button type="submit">Enregistrer</Button>
      </form>
    </div>
  );
}
