CREATE OR REPLACE FUNCTION public.cleanup_staff_parcours()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NEW.role <> 'CANDIDAT' AND OLD.role = 'CANDIDAT' THEN
    DELETE FROM public.admissions_dossier WHERE parcours_id IN (SELECT id FROM public.parcours_cfa WHERE profile_id = NEW.id);
    DELETE FROM public.parcours_cfa WHERE profile_id = NEW.id;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_cleanup_staff_parcours AFTER UPDATE OF role ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.cleanup_staff_parcours();