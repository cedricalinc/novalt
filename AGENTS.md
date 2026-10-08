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
- Phase 1 UI reads from src/lib/mock-data.ts; swap to real queries once auth is added.
