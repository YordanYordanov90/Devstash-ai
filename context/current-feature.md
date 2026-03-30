### Quick Wins (Low/No Risk)

**Quick Win #1: Fix open redirect in `returnTo` parameter**
- File: app/actions/items.ts:169-172
- Time: ~10 minutes
- Risk: None (tightens existing behavior)
- Benefit: Closes a HIGH-severity open redirect vulnerability
- Suggested change:

```typescript
function safeReturnTo(raw: string | undefined, fallback: string): string {
  if (!raw || raw.trim().length === 0) return fallback;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  return trimmed;
}
```

Replace `currentUrl({ returnTo }, ...)` calls to use `safeReturnTo(returnTo, fallback)`.

**Quick Win #2: Sanitize `Content-Disposition` filename**
- File: app/api/download/[...key]/route.ts:43
- Time: ~5 minutes
- Risk: None
- Benefit: Prevents header injection from malicious filenames
- Suggested change:

```typescript
const safeName = (item.fileName ?? "download").replace(/[\r\n"]/g, "_");
const contentDisposition = `attachment; filename="${safeName}"`;
```

**Quick Win #3: Update root layout metadata**
- File: app/layout.tsx:20-23
- Time: ~5 minutes
- Risk: None
- Benefit: Fixes placeholder "Create Next App" title/description for SEO and branding
- Suggested change:

```typescript
export const metadata: Metadata = {
  title: "DevStash — Developer Knowledge Hub",
  description: "Save, organize, and find your code snippets, commands, AI prompts, and files.",
};
```

**Quick Win #4: Replace `window.location.reload()` with `router.refresh()`**
- File: components/dashboard/CreateItemDialog.tsx:135, components/dashboard/CollectionDialog.tsx:43
- Time: ~10 minutes
- Risk: None (uses the standard Next.js approach)
- Benefit: Eliminates full-page reload flash after creating items/collections

**Quick Win #5: Add `app/(app)/error.tsx` error boundary**
- File: app/(app)/error.tsx (new file)
- Time: ~15 minutes
- Risk: None
- Benefit: Graceful error handling instead of blank crash page for all app routes
- Suggested change: Create a simple error boundary component with retry button

**Quick Win #6: Add `aria-label` to collection card more button or remove it**
- File: components/dashboard/CollectionsSection.tsx:161-164
- Time: ~5 minutes
- Risk: None
- Benefit: Fixes accessibility violation, removes dead UI button
- Suggested change: Remove the non-functional button, or add `aria-label="Collection options"` if you plan to wire it up
