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
- Movie listings and showtimes are scraped live from BookMyShow via Firecrawl in src/lib/bms.server.ts (markdown parsing); reviews are local until a database is added. Why: no official BookMyShow API.
- All app pages live under src/routes/_authenticated (client-only gate redirecting to /auth); /auth and /reset-password stay public. Why: the user requires sign-in before using the tracker.
