CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE pid uuid;
BEGIN
  INSERT INTO public.profiles (id, email, nom, prenom)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'nom', NEW.raw_user_meta_data->>'prenom');
  INSERT INTO public.user_preferences (user_id) VALUES (NEW.id);
  INSERT INTO public.parcours_cfa (profile_id, annee_scolaire, intitule_formation)
  VALUES (NEW.id, '2026-2027', NEW.raw_user_meta_data->>'formation')
  RETURNING id INTO pid;
  INSERT INTO public.admissions_dossier (parcours_id) VALUES (pid);
  RETURN NEW;
END $function$;