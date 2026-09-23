# FRESHVII Frontend Guide

## Stack

- React 19 with TypeScript and Vite
- Tailwind CSS v4 through `@tailwindcss/vite`
- shadcn/ui with Radix UI primitives
- Lucide icons
- Firebase client SDK for Auth and Firestore

## Visual Direction

The interface should feel fresh, practical, and easy to scan during a busy kitchen workflow. Use the existing product palette as the starting point: leafy green for primary actions, warm yellow for attention, muted orange for borders and food warmth, green for fresh states, and coral for waste or destructive actions.

Use color together with an icon and text label for freshness. Never make color the only signal.

## Component Responsibilities

- `Fridge`: owns the visual storage area and shelf layout.
- `FridgeShelf`: groups items by shelf or storage zone and handles responsive wrapping.
- `FoodItem`: compact item representation for dense visual fridge layouts.
- `FreshnessBadge`: maps freshness state to label, icon, color, and accessible description.
- `StorageTabs`: switches between fridge, freezer, and pantry while preserving the active filter.
- `FoodCard`: full inventory summary and entry point to Food Detail.
- `QuantitySelector`: validates non-negative decimal quantities and displays the unit.
- `RecipeCard`: displays recipe match context and the primary cook action.
- `QuickActionMenu`: exposes consume, freeze, and discard actions; use a Sheet or DropdownMenu on small screens.
- Swipe actions: supplement, never replace, visible buttons and keyboard-accessible actions.

## shadcn/ui Mapping

Use shadcn components as composable primitives rather than creating parallel versions:

| Need | Component |
| --- | --- |
| Food summaries | Card, Badge |
| Storage navigation | Tabs |
| Edit and add forms | Form, Input, Select, Switch, Calendar |
| Quantity input | Input, Button |
| Quick actions | DropdownMenu, Sheet |
| Destructive confirmation | AlertDialog |
| Status feedback | Sonner |
| Loading state | Skeleton, Progress |
| Recipe and ingredient lists | Card, Checkbox, Separator |

## Interaction Rules

- Every action must show a pending, success, or error state.
- Destructive actions require confirmation unless they are easily undoable.
- Keep the primary action visible on mobile; move secondary actions into `QuickActionMenu`.
- Use optimistic updates only when rollback is defined.
- Preserve the user's selected storage tab and filters after updates.
- Use `aria-label` for icon-only buttons and tooltips for unfamiliar icons.
- Support keyboard focus, 44px minimum touch targets, and reduced-motion preferences.
- Avoid deeply nested cards. Use full-width page sections and cards only for repeated food or recipe items.

## Page Contracts

Pages should consume view models from domain services and repositories:

- Home receives grouped items, summary counts, and active filters.
- Add Food submits a validated draft and receives a repository result.
- Food Detail receives one item plus lifecycle commands.
- Rescue My Food receives urgency-ranked items and reason strings.
- Recipe Recommendation receives available ingredients and matched recipes.
- Consumption receives selected items and returns quantity decisions.

## Responsive Layout

- Mobile: single-column flow, bottom navigation, large touch targets, swipe or sheet actions.
- Tablet: two-column content with persistent storage tabs.
- Desktop: visual fridge and supporting summary panel side by side; keep item cards readable rather than packing unlimited columns.

## Styling Rules

- Prefer Tailwind utility classes and shared CSS variables over one-off inline styles.
- Use `cn()` for conditional class composition.
- Keep state colors consistent across badges, filters, cards, and charts.
- Avoid hard-coding Firebase or domain logic inside JSX.
- Use stable dimensions for cards, controls, and shelf layouts to avoid layout shift.