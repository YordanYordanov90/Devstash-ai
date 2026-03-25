# Dashboard Documentation

## Overview

The dashboard is the main authenticated area of DevStash where users manage their knowledge base. It consists of a sidebar navigation, top bar, and main content area.

All dashboard data is fetched from the PostgreSQL database using Drizzle ORM, with data scoped to the authenticated user.

---

## Layout Hierarchy

```
app/(app)/
├── layout.tsx              # Protects routes, syncs user from Neon Auth
└── dashboard/
    ├── layout.tsx          # Wraps dashboard pages with DashboardShell + SidebarContent
    └── page.tsx            # Main dashboard view (Stats + Collections + Pinned)

components/dashboard/
├── DashboardShell.tsx      # Main app container (client component)
├── SidebarContent.tsx      # Sidebar with types/collections (server component)
├── TopBar.tsx             # Header with search and actions
├── StatsCards.tsx         # Statistics cards (server component)
├── CollectionsSection.tsx # Collections grid (client component)
├── PinnedItems.tsx        # Pinned items list (client component)
└── ItemList.tsx           # Reusable item row (client component)
```

---

## Data Flow Architecture

### Server Components (Data Fetching)

Dashboard data is fetched server-side using Drizzle ORM:

```
┌─────────────────────────────────────────────────────────────┐
│ DashboardPage (Server Component)                             │
│ • Fetches session via authServer.getSession()               │
│ • Gets userId from session                                   │
│ • Calls getDashboardData(userId) once                        │
│ • Passes data as props to child components                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ SidebarContent (Server Component)                           │
│ • Fetches its own session and user data                     │
│ • Queries: itemTypes, collections, items                    │
└─────────────────────────────────────────────────────────────┘
```

### Client/Server Boundary

The architecture uses a **server component as prop pattern** to pass server components to client components:

- **`DashboardShell`** (client) accepts `sidebar: React.ReactNode` prop
- **`dashboard/layout.tsx`** passes `<SidebarContent />` as the sidebar prop
- This allows server components (with DB access) to be rendered inside client component trees

---

## Query Functions

**File:** `lib/db/queries.ts`

### Available Functions

| Function | Description |
|----------|-------------|
| `getSystemItemTypes()` | Returns all system item types (`isSystem: true`) |
| `getUserCollections(userId)` | Returns all collections for a user, sorted by favorites then date |
| `getUserItems(userId)` | Returns all items for a user, sorted by creation date |
| `getUserTags(userId)` | Returns all tags for a user |
| `getItemTagsForItems(itemIds)` | Returns item-tag relationships for specified items |
| `getUserById(userId)` | Returns user info (name derived from email) |
| `getDashboardData(userId)` | Convenience function that fetches all dashboard data |
| `getStatsForUser(userId)` | Legacy helper (dashboard now derives stats from loaded props) |

### Usage Example

```typescript
import { getDashboardData } from "@/lib/db/queries";

export default async function DashboardPage() {
  const { data: session } = await authServer.getSession();
  const userId = session?.user?.id ?? null;

  const data = userId ? await getDashboardData(userId) : null;

  return (
    <StatsCards items={data?.items ?? []} collections={data?.collections ?? []} />
    <CollectionsSection
      collections={data?.collections ?? []}
      items={data?.items ?? []}
      itemTypes={data?.itemTypes ?? []}
    />
    <PinnedItems
      items={data?.items ?? []}
      itemTypes={data?.itemTypes ?? []}
      tags={data?.tags ?? []}
      itemTags={data?.itemTags ?? []}
    />
  );
}
```

---

## Shared Types

**File:** `types/dashboard.ts`

All dashboard components use shared TypeScript interfaces:

```typescript
interface ItemTypeInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
  isSystem: boolean;
}

interface CollectionInfo {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  createdAt: Date;
}

interface ItemInfo {
  id: string;
  title: string;
  description: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  typeId: string;
  collectionId: string | null;
  language: string | null;
  createdAt: Date;
}

interface TagInfo {
  id: string;
  name: string;
}

interface ItemTagInfo {
  itemId: string;
  tagId: string;
}

interface UserInfo {
  id: string;
  email: string;
  name: string;
  isPro: boolean;
}
```

---

## Component Props

### StatsCards

```typescript
interface StatsCardsProps {
  items: ItemInfo[];
  collections: CollectionInfo[];
}
```

### CollectionsSection

```typescript
interface CollectionsSectionProps {
  collections: CollectionInfo[];
  items: ItemInfo[];
  itemTypes: ItemTypeInfo[];
}
```

### PinnedItems

```typescript
interface PinnedItemsProps {
  items: ItemInfo[];
  itemTypes: ItemTypeInfo[];
  tags?: TagInfo[];
  itemTags?: ItemTagInfo[];
}
```

### ItemListRow

```typescript
interface ItemListRowProps {
  item: ItemForList;           // Subset of ItemInfo
  showFavorite?: boolean;
  className?: string;
  itemTypes: ItemTypeInfo[];  // Required for type icon lookup
  tags?: TagInfo[];           // For tag display
  itemTags?: ItemTagInfo[];   // For tag lookup
}
```

---

## DashboardShell

**File:** `components/dashboard/DashboardShell.tsx`

This is the main app container with three main sections:

| Section | Purpose |
|---------|---------|
| **TopBar** | Header with search, sidebar toggle, and action buttons |
| **Sidebar** | Collapsible navigation with Types + Collections |
| **Main Content** | Dynamic page content (`{children}`) |

### Key Features

- **Responsive**: Sidebar hides on mobile, becomes a drawer (Sheet component)
- **Collapsible**: On desktop, sidebar can collapse to icon-only mode (64px vs 256px)
- **State management**: Uses `useState` for `sidebarCollapsed` and `mobileMenuOpen`
- **Server component prop**: Accepts `sidebar` as `React.ReactNode` to render server components

---

## TopBar

**File:** `components/dashboard/TopBar.tsx`

Located at the top with two zones:

### Left Zone
- Mobile menu button (visible only on mobile, opens the Sheet sidebar)
- Search input

### Right Zone
- "New Collection" button (outline variant)
- "New Item" button (primary/filled variant)

### Search Input
- Shows placeholder "Search items..."
- Keyboard shortcut hint `⌘K` (visual only, not functional yet)
- Read-only (search not implemented yet)

---

## SidebarContent

**File:** `components/dashboard/SidebarContent.tsx`

This is a **server component** that fetches its own data from the database.

The sidebar has four distinct sections:

### 1. Logo Section
- DevStash logo (Layers icon)
- App name "DevStash"

### 2. Types Section (Collapsible)
Shows all system item types:
- Snippets
- Prompts
- Notes
- Commands
- Files
- Images
- Links

Each type displays:
- Icon (colored by type)
- Display name (e.g., "Snippets", "Links")
- Item count (fetched from database)

### 3. Collections Section (Collapsible)
Two subsections:

1. **Favorites** - Collections marked `isFavorite: true`
2. **All Collections** - Remaining collections sorted by `createdAt`

Each collection displays:
- Folder icon
- Name
- Star icon if favorited
- Item count

### 4. User Profile Section
- Avatar (initials from name, derived from email)
- Name and email
- Settings button

### Data Fetching

SidebarContent fetches:
- System item types
- User's collections
- User's items (for counts)
- User's tags
- Session user info

---

## Main Dashboard Page

**File:** `app/(app)/dashboard/page.tsx`

Simple server component structure:
1. Header with title "Dashboard" and subtitle
2. StatsCards (async server component)
3. CollectionsSection
4. PinnedItems

---

## CollectionsSection

**File:** `components/dashboard/CollectionsSection.tsx`

Displays all collections as cards in a responsive grid (1-3 columns based on screen size).

### Card Content
- **Header**: Name + favorite star + more menu button
- **Body**: Item count, description (truncated), type icons
- **Styling**: Left border color-coded by collection

### Dynamic Type Icons and Card Colors
Shows up to 3 icons representing the item types in each collection.

Card left-border color is derived from the dominant item type in each collection, with muted fallback for empty collections.

---

## PinnedItems

**File:** `components/dashboard/PinnedItems.tsx`

A list of items where `isPinned: true`. Each row is an `ItemListRow` component. If no pinned items exist, shows an empty state message.

---

## ItemListRow

**File:** `components/dashboard/ItemList.tsx`

Reusable component for displaying a single item in a list.

### Structure
```
┌────────────────────────────────────────────────────┐
│ [ICON]  Title          ★  📌          Mar 15      │
│         Description                               │
│         [tag] [tag]                               │
└────────────────────────────────────────────────────┘
```

### Elements
- **Type Icon** - Colored background + icon (left side)
- **Title** - Item title
- **Pinned/Favorite** indicators - Star and pin icons
- **Description** - Optional subtitle
- **Tags** - Badge list (e.g., "react", "hooks")
- **Date** - Formatted as "Mar 15" (right side)

---

## Empty States

When there's no data in the database, components handle empty states gracefully:

| Component | Empty State |
|-----------|-------------|
| StatsCards | Shows 0 for all counts |
| CollectionsSection | Shows empty grid |
| PinnedItems | "No pinned items." message |
| Sidebar | No collections shown, only types with 0 counts |

---

## What's Not Functional (Yet)

- **Search** - Input is read-only, no filtering logic implemented
- **New Item/Collection buttons** - No click handlers, no forms
- **Navigation links** - Routes exist but pages are empty/minimal
- **Settings** - Button is present but non-functional
- **More menu** - Three-dot menu on collection cards is non-functional
- **Item tags** - Tags display is wired up but creating/managing tags not implemented

---

## File Structure Summary

```
types/
└── dashboard.ts              # Shared TypeScript interfaces

lib/
├── db/
│   └── queries.ts            # Database query functions (Drizzle ORM)
└── utils.ts                  # cn(), itemTypeToSlug(), getTagNamesForItem()

app/(app)/
├── layout.tsx                # Protected route layout (auth check, user sync)
└── dashboard/
    ├── layout.tsx            # Dashboard layout with shell + sidebar
    └── page.tsx              # Main dashboard page (fetches data)

components/dashboard/
├── DashboardShell.tsx        # Main app container (client)
├── SidebarContent.tsx       # Sidebar navigation (server)
├── TopBar.tsx               # Top header bar
├── StatsCards.tsx           # Statistics cards (server)
├── CollectionsSection.tsx   # Collection cards grid
├── PinnedItems.tsx          # Pinned items list
└── ItemList.tsx              # Reusable item row component
```

---

## Key Utility Functions

### `lib/utils.ts`

1. **`cn(...inputs)`** - Merges Tailwind CSS classes using clsx and tailwind-merge

2. **`itemTypeToSlug(name)`** - Converts type name to URL slug
   - "Snippet" → "snippets"
   - "URL" → "links"

3. **`getTagNamesForItem(itemId, itemTags, tags)`** - Gets tag names for an item from the many-to-many relationship

---

## Dependencies Used

- **Drizzle ORM** - Database queries
- **Neon Postgres** - PostgreSQL database
- **Lucide React** - Icons
- **Tailwind CSS v4** - Styling
- **ShadCN UI components** - Button, Card, Badge, Avatar, Sheet, ScrollArea, Collapsible, Input

---

## Security Notes

⚠️ **SECURITY ALERT**

- **All data is user-scoped.** Queries filter by `userId` from the authenticated session.
- **Server-side data fetching.** Dashboard components fetch data on the server, not client.
- **No direct DB access from client.** The `postgres` package only runs in server components.
- **Session validation.** User sync happens in `app/(app)/layout.tsx` before any dashboard content renders.

---

## Related Docs

- `docs/neon-auth.md` - Authentication with Neon Auth
- `docs/neon-db-drizzle.md` - Database schema and Drizzle ORM
- `docs/next-security-headers.md` - Security headers configuration
- `docs/project-overview.md` - Project vision and specifications
- `docs/project-spec.md` - Detailed feature specifications
