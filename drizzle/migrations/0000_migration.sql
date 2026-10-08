
CREATE TYPE public.app_role AS ENUM ('CANDIDAT','ENTREPRISE_TUTEUR','ADMIN_CFA','FORMATEUR');
CREATE TYPE public.etape_parcours AS ENUM ('01_INSCRIPTION','02_RECHERCHE','03_CONTRAT','04_ENTREPRISE','05_BILAN');
CREATE TYPE public.statut_dossier AS ENUM ('BROUILLON','EN_REVISION','VALIDE','INCOMPLET');
CREATE TYPE public.statut_cv AS ENUM ('EN_ATTENTE_VALIDATION','A_CORRIGER','VALIDE_CFA');
CREATE TYPE public.type_offre AS ENUM ('OFFRE_ALTERNANCE','ATELIER_CV','EVENEMENT_NETWORKING');
CREATE TYPE public.statut_candidature AS ENUM ('ENVOYE','ENTRETIEN_PROGRAMME','ACCEPTE','REFUSE');
CREATE TYPE public.valide_par AS ENUM ('ETUDIANT','CFA_SUBSTITUTION');
CREATE TYPE public.statut_fiche AS ENUM ('GENEREE_AUTOMATIQUEMENT','SIGNEE_ELEVE','VALIDEE_CFA');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'CANDIDAT',
  nom text, prenom text, email text, telephone text, avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin(_uid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _uid AND role = 'ADMIN_CFA')
$$;

CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "profiles_insert_self" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid() AND role = 'CANDIDAT');
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_admin(auth.uid()));

-- Prevent non-admins from changing their own role
CREATE OR REPLACE FUNCTION public.protect_role() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Modification du rôle non autorisée';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_protect_role BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_role();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nom, prenom)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'nom', NEW.raw_user_meta_data->>'prenom');
  INSERT INTO public.user_preferences (user_id) VALUES (NEW.id);
  RETURN NEW;
END $$;

CREATE TABLE public.parcours_cfa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  etape_courante public.etape_parcours NOT NULL DEFAULT '01_INSCRIPTION',
  annee_scolaire text NOT NULL,
  intitule_formation text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.parcours_cfa TO authenticated;
GRANT ALL ON public.parcours_cfa TO service_role;
ALTER TABLE public.parcours_cfa ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parcours_select" ON public.parcours_cfa FOR SELECT TO authenticated
  USING (profile_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "parcours_admin_write" ON public.parcours_cfa FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.admissions_dossier (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parcours_id uuid NOT NULL REFERENCES public.parcours_cfa(id) ON DELETE CASCADE,
  statut_dossier public.statut_dossier NOT NULL DEFAULT 'BROUILLON',
  statut_cv public.statut_cv NOT NULL DEFAULT 'EN_ATTENTE_VALIDATION',
  commentaire_conseiller text,
  cv_url text, piece_identite_url text, diplomes_prev_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admissions_dossier TO authenticated;
GRANT ALL ON public.admissions_dossier TO service_role;
ALTER TABLE public.admissions_dossier ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admissions_select" ON public.admissions_dossier FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()) OR EXISTS (SELECT 1 FROM public.parcours_cfa p WHERE p.id = parcours_id AND p.profile_id = auth.uid()));
CREATE POLICY "admissions_admin_write" ON public.admissions_dossier FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.offres_et_ateliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.type_offre NOT NULL,
  titre text NOT NULL, description text, date_evenement timestamptz,
  entreprise_nom text, lieu text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.offres_et_ateliers TO authenticated;
GRANT ALL ON public.offres_et_ateliers TO service_role;
ALTER TABLE public.offres_et_ateliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "offres_select" ON public.offres_et_ateliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "offres_admin_write" ON public.offres_et_ateliers FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.candidatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidat_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  offre_id uuid NOT NULL REFERENCES public.offres_et_ateliers(id) ON DELETE CASCADE,
  statut public.statut_candidature NOT NULL DEFAULT 'ENVOYE',
  valide_par public.valide_par,
  date_acceptation timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (candidat_id, offre_id)
);
GRANT SELECT, INSERT, UPDATE ON public.candidatures TO authenticated;
GRANT ALL ON public.candidatures TO service_role;
ALTER TABLE public.candidatures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cand_select" ON public.candidatures FOR SELECT TO authenticated
  USING (candidat_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "cand_insert_self" ON public.candidatures FOR INSERT TO authenticated
  WITH CHECK (candidat_id = auth.uid() AND statut = 'ENVOYE');
CREATE POLICY "cand_update" ON public.candidatures FOR UPDATE TO authenticated
  USING (candidat_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE TABLE public.fiches_de_mission (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidature_id uuid NOT NULL UNIQUE REFERENCES public.candidatures(id) ON DELETE CASCADE,
  intitule_poste text, missions_description text,
  statut_fiche public.statut_fiche NOT NULL DEFAULT 'GENEREE_AUTOMATIQUEMENT',
  pdf_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fiches_de_mission TO authenticated;
GRANT ALL ON public.fiches_de_mission TO service_role;
ALTER TABLE public.fiches_de_mission ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fiches_select" ON public.fiches_de_mission FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()) OR EXISTS (SELECT 1 FROM public.candidatures c WHERE c.id = candidature_id AND c.candidat_id = auth.uid()));
CREATE POLICY "fiches_admin_write" ON public.fiches_de_mission FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.user_preferences (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  notif_candidatures boolean NOT NULL DEFAULT true,
  notif_admissions boolean NOT NULL DEFAULT true,
  notif_entretiens boolean NOT NULL DEFAULT true,
  notif_documents boolean NOT NULL DEFAULT true
);
GRANT SELECT, INSERT, UPDATE ON public.user_preferences TO authenticated;
GRANT ALL ON public.user_preferences TO service_role;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prefs_own" ON public.user_preferences FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Business rules on candidatures
CREATE OR REPLACE FUNCTION public.candidature_rules() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE is_adm boolean := public.is_admin(auth.uid());
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.admissions_dossier a JOIN public.parcours_cfa p ON p.id = a.parcours_id
      WHERE p.profile_id = NEW.candidat_id AND a.statut_cv = 'VALIDE_CFA'
    ) THEN
      RAISE EXCEPTION 'CV non validé par le CFA : candidature impossible';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.statut IS DISTINCT FROM OLD.statut THEN
    IF NOT is_adm AND NEW.statut <> 'ACCEPTE' THEN
      RAISE EXCEPTION 'Seul le CFA peut modifier ce statut';
    END IF;
    IF NEW.statut = 'ACCEPTE' THEN
      NEW.valide_par := CASE WHEN is_adm AND auth.uid() <> NEW.candidat_id THEN 'CFA_SUBSTITUTION'::public.valide_par ELSE 'ETUDIANT'::public.valide_par END;
      NEW.date_acceptation := now();
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_candidature_rules BEFORE INSERT OR UPDATE ON public.candidatures
  FOR EACH ROW EXECUTE FUNCTION public.candidature_rules();

CREATE OR REPLACE FUNCTION public.on_candidature_acceptee() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE o public.offres_et_ateliers;
BEGIN
  IF NEW.statut = 'ACCEPTE' AND (OLD.statut IS DISTINCT FROM 'ACCEPTE') THEN
    SELECT * INTO o FROM public.offres_et_ateliers WHERE id = NEW.offre_id;
    INSERT INTO public.fiches_de_mission (candidature_id, intitule_poste, missions_description)
    VALUES (NEW.id, o.titre, o.description)
    ON CONFLICT (candidature_id) DO NOTHING;
    UPDATE public.parcours_cfa SET etape_courante = '03_CONTRAT'
    WHERE profile_id = NEW.candidat_id AND etape_courante < '03_CONTRAT';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_candidature_acceptee AFTER UPDATE ON public.candidatures
  FOR EACH ROW EXECUTE FUNCTION public.on_candidature_acceptee();
