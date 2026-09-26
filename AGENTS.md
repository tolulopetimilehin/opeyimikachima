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

- Keep the wedding invitation on the index route as one scrolling experience, with wedding copy in `src/lib/wedding.ts`; this preserves a single source of truth for event details.
- Save public RSVP submissions through a validated server function into a write-only RLS table; guests must never be able to read attendee names or access codes.
- Store uploaded couple photographs as CDN asset pointers in `src/assets` and use them in the story; this avoids committing binary media while preserving the guests' real photos.
