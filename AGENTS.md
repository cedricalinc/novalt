<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Business rules (CV validation gate, ACCEPTE → fiche de mission + étape 03_CONTRAT, valide_par) live in Postgres triggers, so every portal (candidat, admin) gets them for free.
- Roles are stored in profiles.role and checked via the security-definer is_admin(); a trigger blocks non-admins from changing roles to prevent privilege escalation.
- Student pages live under src/routes/_authenticated and read their own rows via the browser client (RLS) through src/lib/use-me.ts; calendar, documents and news stay on mock-data until tables exist.
- Only CANDIDAT profiles have a parcours/admission; a trigger deletes them when a profile becomes staff, and staff land on /admin instead of Mon parcours, because staff are not students.
- Student files live in the private 'documents' bucket under <profile_id>/ with one documents_etudiant row each; a trigger derives admissions_dossier.statut_cv from the CV rows so the apply gate follows per-file validation.
