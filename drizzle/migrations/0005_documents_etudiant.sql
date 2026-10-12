CREATE TABLE public.documents_etudiant (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'CV' CHECK (type IN ('CV','PIECE_IDENTITE','DIPLOME','AUTRE')),
  file_path text NOT NULL,
  file_name text NOT NULL,
  statut public.statut_cv NOT NULL DEFAULT 'EN_ATTENTE_VALIDATION',
  commentaire text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents_etudiant TO authenticated;
GRANT ALL ON public.documents_etudiant TO service_role;
ALTER TABLE public.documents_etudiant ENABLE ROW LEVEL SECURITY;
CREATE POLICY docs_select ON public.documents_etudiant FOR SELECT TO authenticated USING (profile_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY docs_insert_self ON public.documents_etudiant FOR INSERT TO authenticated WITH CHECK (profile_id = auth.uid() AND statut = 'EN_ATTENTE_VALIDATION');
CREATE POLICY docs_delete ON public.documents_etudiant FOR DELETE TO authenticated USING ((profile_id = auth.uid() AND statut <> 'VALIDE_CFA') OR public.is_admin(auth.uid()));
CREATE POLICY docs_admin_update ON public.documents_etudiant FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.sync_cv_status() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE pid uuid := COALESCE(NEW.profile_id, OLD.profile_id); s public.statut_cv;
BEGIN
  SELECT CASE
    WHEN bool_or(statut = 'VALIDE_CFA') THEN 'VALIDE_CFA'
    WHEN bool_or(statut = 'EN_ATTENTE_VALIDATION') OR count(*) = 0 THEN 'EN_ATTENTE_VALIDATION'
    ELSE 'A_CORRIGER' END::public.statut_cv INTO s
  FROM public.documents_etudiant WHERE profile_id = pid AND type = 'CV';
  UPDATE public.admissions_dossier a SET statut_cv = s
  FROM public.parcours_cfa p WHERE p.id = a.parcours_id AND p.profile_id = pid;
  RETURN NULL;
END $$;
CREATE TRIGGER trg_sync_cv_status AFTER INSERT OR UPDATE OR DELETE ON public.documents_etudiant
FOR EACH ROW EXECUTE FUNCTION public.sync_cv_status();

CREATE POLICY docs_obj_select ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'documents' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin(auth.uid())));
CREATE POLICY docs_obj_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY docs_obj_delete ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'documents' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin(auth.uid())));