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

- Keep vendor applications in a private, applicant-owned review table rather than the public vendors directory, because applicants' contacts and inventory pricing must not be exposed before approval.
- Serve public catalogue pages through approved-only views that omit vendor contact and internal pricing fields; direct vendor/profile rows remain owner or admin scoped to prevent exposing private business details.
- Create booking requests through a database-owned pricing function and permit renters only to cancel pending requests; client-calculated quotes are display-only and must not determine persisted payment amounts.
- Reserve listing inventory only for confirmed or paid bookings, and enforce date capacity in the database to prevent concurrent overbooking.
- Expose assistant access through OAuth-authenticated MCP tools that forward the caller token so existing row-level permissions remain authoritative.
- Run AI rental recommendations in a server function that only lets the model choose from published catalogue rows, so suggestions can never invent items, prices or availability.
