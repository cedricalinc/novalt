import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Me = Awaited<ReturnType<typeof fetchMe>>;

async function fetchMe() {
  const { data: u } = await supabase.auth.getUser();
  const uid = u.user!.id;
  const [profile, parcours, prefs] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", uid).single(),
    supabase.from("parcours_cfa").select("*").eq("profile_id", uid).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("user_preferences").select("*").eq("user_id", uid).maybeSingle(),
  ]);
  if (profile.error) throw profile.error;
  const admission = parcours.data
    ? (await supabase.from("admissions_dossier").select("*").eq("parcours_id", parcours.data.id).maybeSingle()).data
    : null;
  return { profile: profile.data, parcours: parcours.data, admission, prefs: prefs.data };
}

export function useMe() {
  return useQuery({ queryKey: ["me"], queryFn: fetchMe });
}

export function useRefreshMe() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["me"] });
}
