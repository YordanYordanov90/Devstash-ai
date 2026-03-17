# Dashboard Documentation

## Overview

The dashboard is the main authenticated area of DevStash where users manage their knowledge base. It consists of a sidebar navigation, top bar, and main content area.

---

## Layout Hierarchy

```
app/dashboard/
├── layout.tsx          # Wraps all dashboard pages with DashboardShell
└── page.tsx            # Main dashboard view (Collections + Pinned)
```

The layout wraps every dashboard page with `DashboardShell`, which provides the persistent sidebar and top bar.

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

---

## TopBar

**File:** `components/dashboard/TopBar.tsx`

Located at the top with two zones:

### Left Zone
- Mobile menu button (visible only on mobile)
- Sidebar toggle button (visible only on desktop)
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

The sidebar has four distinct sections:

### 1. Logo Section
- DevStash logo (Layers icon)
- App name "DevStash"

### 2. Types Section (Collapsible)
Shows all 7 item types:
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
- Item count

**Type Icons Mapping:**
```typescript
const typeIcons = {
  code: Code,           // Snippet
  bot: Bot,             // Prompt
  "file-text": FileText, // Note
  terminal: Terminal,    // Command
  file: File,            // File
  image: Image,          // Image
  link: LinkIcon,        // Link
};
```

**Type Colors:**
| Type | Icon Color |
|------|------------|
| Snippet | text-blue-400 |
| Prompt | text-purple-400 |
| Note | text-blue-400 |
| Command | text-amber-400 |
| File | text-gray-400 |
| Image | text-pink-400 |
| Link | text-teal-400 |

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
- Avatar (initials from name)
- Name and email
- Settings button

---

## Main Dashboard Page

**File:** `app/dashboard/page.tsx`

Simple two-section layout:
1. Header with title "Dashboard" and subtitle
2. CollectionsSection
3. PinnedItems

---

## CollectionsSection

**File:** `components/dashboard/CollectionsSection.tsx`

Displays all collections as cards in a responsive grid (1-3 columns based on screen size).

### Card Content
- **Header**: Name + favorite star + more menu button
- **Body**: Item count, description (truncated), type icons
- **Styling**: Left border color-coded by collection

### Dynamic Type Icons
Shows up to 3 icons representing the item types in each collection. This helps users quickly see what types are in each collection.

### Collection Color Mapping
| Collection | Border Color | Icon Color |
|------------|--------------|------------|
| React Patterns | amber-500 | amber-500 |
| AI Prompts | purple-500 | purple-500 |
| Git Commands | orange-500 | orange-500 |
| Python Snippets | yellow-500 | yellow-500 |
| Context Files | amber-500 | amber-500 |
| Interview Prep | purple-500 | purple-500 |

---

## PinnedItems

**File:** `components/dashboard/PinnedItems.tsx`

A simple list of items where `isPinned: true`. Each row is an `ItemListRow` component. If no pinned items exist, shows an empty state message.

---

## ItemListRow

**File:** `components/dashboard/ItemList.tsx`

Reusable component for displaying a single item in a list.

### Structure
```
┌────────────────────────────────────────────────────┐
│ [ICON]  Title          ★  📌          Mar 15      │
│         Description                               │
│         [tag] [tag]                                │
└────────────────────────────────────────────────────┘
```

### Elements
- **Type Icon** - Colored background + icon (left side)
- **Title** - Item title
- **Pinned/Favorite** indicators - Star and pin icons
- **Description** - Optional subtitle
- **Tags** - Badge list (e.g., "react", "hooks")
- **Date** - Formatted as "Mar 15" (right side)

### Type Styling
Each type has specific background and icon colors:

| Type | Background | Icon |
|------|------------|------|
| Snippet | bg-blue-500/15 | text-blue-400 |
| Prompt | bg-purple-500/15 | text-purple-400 |
| Note | bg-blue-500/15 | text-blue-400 |
| Command | bg-amber-500/15 | text-amber-400 |
| File | bg-gray-500/15 | text-gray-400 |
| Image | bg-pink-500/15 | text-pink-400 |
| Link | bg-teal-500/15 | text-teal-400 |

---

## Data Flow

All data currently comes from `lib/mock-data.ts`:

```
mock-data.ts
├── currentUser       # Demo user
├── itemTypes        # 7 system types
├── tags             # User tags
├── itemTags         # Many-to-many relation (item-tag)
├── collections      # 6 collections
└── items            # 12 sample items
```

The components filter/sort this data locally:
- `items.filter(i => i.isPinned)` → PinnedItems
- `items.filter(i => i.collectionId === col.id)` → Collection item counts
- `collections.filter(c => c.isFavorite)` → Favorite collections

---

## Visual Summary

```
┌─────────────────────────────────────────────────────────────────┐
│ TopBar:  [☰] [🔍 Search...    ⌘K]   [New Collection] [New Item]│
├──────────┬──────────────────────────────────────────────────────┤
│          │                                                      │
│ SIDEBAR  │  MAIN CONTENT                                        │
│          │                                                      │
│ ○ Types  │  ┌──────────────────────────────────────────────┐   │
│   • Snip │  │ Collections (grid of cards)                  │   │
│   • Prom │  │ ┌─────────┐ ┌─────────┐ ┌─────────┐          │   │
│   • Note │  │ │React    │ │AI       │ │Git      │          │   │
│   • Cmd  │  │ │Patterns │ │Prompts  │ │Commands │          │   │
│          │  │ └─────────┘ └─────────┘ └─────────┘          │   │
│ ○ Collect│  └──────────────────────────────────────────────┘   │
│   ★ Fav  │                                                      │
│   • All  │  ┌──────────────────────────────────────────────┐   │
│          │  │ Pinned (list of items)                       │   │
│ [User]   │  │ • useDebounce Hook                          │   │
│          │  │ • useAuth Hook                              │   │
│          │  └──────────────────────────────────────────────┘   │
└──────────┴──────────────────────────────────────────────────────┘
```

---

## What's Not Functional (Yet)

- **Search** - Input is read-only, no filtering logic implemented
- **New Item/Collection buttons** - No click handlers, no forms
- **Navigation links** - Routes exist but pages are empty/minimal
- **Database** - All data is hardcoded mock data, no backend integration
- **Settings** - Button is present but non-functional
- **More menu** - Three-dot menu on collection cards is non-functional

---

## File Structure Summary

```
components/dashboard/
├── DashboardShell.tsx     # Main app container
├── SidebarContent.tsx    # Sidebar navigation
├── TopBar.tsx            # Top header bar
├── CollectionsSection.tsx # Collection cards grid
├── PinnedItems.tsx       # Pinned items list
└── ItemList.tsx           # Reusable item row component
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

- **Lucide React** - Icons
- **Framer Motion** - Animations (for landing page, not used in dashboard yet)
- **Tailwind CSS v4** - Styling
- **ShadCN UI components** - Button, Card, Badge, Avatar, Sheet, ScrollArea, Collapsible, Input
