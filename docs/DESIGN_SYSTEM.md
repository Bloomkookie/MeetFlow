# MeetFlow Design System

This document outlines the core styling philosophy and implementation details for the application.

## 1. Why these colors were chosen
The design system aims for a professional, clean, and modern aesthetic heavily inspired by enterprise video conferencing tools like Zoom and Google Meet. 
- **Light Mode** leans on `#F7F8FA` and `#FFFFFF` for a crisp, high-contrast dashboard that feels lightweight.
- **Dark Mode** actively avoids pure black (`#000000`) and instead builds depth using layered slate-blue tones (`#111827`, `#1E293B`, `#273449`) which reduces eye strain and feels more premium (similar to native OS dark modes).
- **Primary Brand** stays true to a vibrant, accessible Zoom-style blue (`#0B5CFF`).

## 2. Semantic Color Tokens

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--background` | `#F7F8FA` | `#111827` | Application background base |
| `--foreground` | `#1F2937` | `#F8FAFC` | Main primary text color |
| `--card` | `#FFFFFF` | `#1E293B` | Base surface for elevated cards and modals |
| `--card-foreground` | `#1F2937` | `#F8FAFC` | Text on cards |
| `--primary` | `#0B5CFF` | `#3B82F6` | Main brand color for buttons, active links |
| `--secondary` | `#F1F3F5` | `#172033` | Subtle surfaces, sidebars |
| `--muted` | `#F1F3F5` | `#273449` | Disabled backgrounds, empty states |
| `--border` | `#E4E7EC` | `#334155` | Default component borders |

## 3. Why avoid hardcoded colors
Hardcoding utility colors like `bg-gray-50` or `text-gray-900` directly into components fractures the design language and makes supporting true Dark Mode extremely difficult. 
By utilizing semantic Tailwind variables (e.g., `bg-background` and `text-foreground`), the application automatically inverses correctly on theme swaps without needing conditional logic.

## 4. How dark mode and persistence works
The app utilizes `next-themes` wrapped via `ThemeProvider` (`app/layout.tsx`).
- Toggling the theme writes the preference (`light`, `dark`, or `system`) to `localStorage`.
- The provider injects the `.dark` class onto the root `<html>` element based on this preference, enabling all CSS variables under the `.dark` block in `globals.css`.

## 5. Adding a new themed component
To build a new component:
1. Wrap it in a card: `className="bg-card border border-border shadow-sm rounded-xl"`
2. Add text: `className="text-foreground"` for headers, `text-muted-foreground` for sub-labels.
3. Add a primary action: `className="bg-primary text-primary-foreground hover:bg-primary-hover"`

## 6. Meeting Room Exception
The `MeetingRoom` and `VideoTile` components deliberately **override** standard light mode theme behaviors. Video looks best against dark, pure contrast surfaces. Thus, even if the app is in Light Mode, the video room uses fixed dark hex codes (e.g. `#0B0F19` for the main background and `#161B26` for tiles).

## 7. ZoomSense AI Integration
ZoomSense AI avoids jarring purple overlays. Instead, it utilizes standard application surfaces (cards, borders) but introduces small, purposeful accent badges (e.g., Light: `#F3E8FF` background with `#7C3AED` text) to distinguish AI-generated content gently without breaking the brand identity.
