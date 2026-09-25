# Acadium design tokens

Extracted from the landing page (`https://acadium-landing.netlify.app/`, `style.css`) and applied to the panel via CSS variables in `src/index.css` and `tailwind.config.ts`.

## Typography
| Token | Value |
|---|---|
| Font | **Manrope** (Google Fonts), weights 400 / 500 / 600 / 700 / 800 |
| Fallback | `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| Headings | weight 800, `letter-spacing: -0.02em`, line-height 1.15 |
| Body | 1rem / 1.6, `-webkit-font-smoothing: antialiased` |
| Labels (KPI small) | .74rem, weight 600, ink-mute |

## Colors
| Landing var | Hex | Tailwind |
|---|---|---|
| `--primary-color` | `#4a9eed` | `primary` |
| `--secondary-color` | `#8b5cf6` | `violet`, focus `ring` |
| `--gradient` | `linear-gradient(120deg, #4a9eed, #8b5cf6)` | `bg-brand` |
| `--ink` | `#0f172a` | `foreground`, `ink` |
| `--ink-soft` | `#475569` | `ink-soft`, `muted-foreground` |
| `--ink-mute` | `#94a3b8` | `ink-mute` |
| `--line` | `#e5e8ef` | `border` |
| `--bg` | `#ffffff` | `background`, `card` |
| `--bg-soft` | `#f6f7fb` | `soft` (app background) |
| `--tint` | `#eef3fe` (text `#3b5bdb` / `#4c63e6`) | `tint`, `tint-foreground`, `accent` |
| `--ok` | `#16a34a` on `#e7f7ee` | `ok`, `ok-soft` |
| `--warn` | `#d97706` on `#fdf2e2` | `warn`, `warn-soft` |
| (added) bad | `#dc2626` on `#fef2f2` | `bad`, `bad-soft` (the "Kelmagan"/absent state; landing uses `#f8c9c9` in the month heatmap) |
| Stats band | `#0f172a` bg, gradient text `#8cc4f7 → #b9a0fb`, sub `#a8b3c7` | — |

## Radius
| Landing | Value | Tailwind |
|---|---|---|
| `--radius-lg` | 20px | `rounded-xl` (cards, panels) |
| `--radius` | 12px | `rounded-lg` (KPIs, inputs area) |
| buttons / inputs | 10px | `rounded-md` |
| `--radius-sm` | 8px | `rounded-sm` (avatars, small chips) |
| pills | 999px | `rounded-full` |

## Shadows
| Name | Value |
|---|---|
| `shadow-lift` | `0 1px 2px rgba(15,23,42,.04), 0 12px 32px -12px rgba(15,23,42,.12)` — hover / dropdowns |
| `shadow-card` | `0 30px 60px -30px rgba(30,41,99,.35)` — hero dashboard mock |
| `shadow-btn` | `0 6px 18px -8px rgba(99,102,241,.7)` — primary button (hover: `0 10px 24px -8px …/.75` + `translateY(-2px)`) |

## Components
- **Primary button**: gradient bg, white, 600 weight, `padding 10px 18px`, radius 10px, lifts 2px on hover.
- **Ghost button**: white bg, `#e5e8ef` border → `#c9cfdc` on hover.
- **Card**: white, 1px line border, radius 20px; the dashboard mock has a `bg-soft` title bar with three `#dfe3ec` dots.
- **KPI**: 1px border, radius 12px, 12px padding, small muted label + 1.45rem/800 number.
- **Pill / badge**: `3px 9px`, radius 999px, .74rem/700; `ok` = green on `#e7f7ee`, `warn` = amber on `#fdf2e2`.
- **Avatar chip**: 28×28, radius 8px, tint bg, `#3b5bdb` initials, .68rem/700.
- **Icon tile**: 48×48, radius 14px, tint bg + `#4c63e6` icon; turns gradient + white on hover.
- **Tabs**: soft bg segmented control with 4px padding; active tab white with `0 1px 3px rgba(15,23,42,.12)`.
- **Language switcher**: bordered trigger with globe icon; list items with a 28×22 code badge, active badge gradient.
- **Focus**: `2px solid #8b5cf6`, offset 2–3px.
- **Icons**: stroke icons, 1.8–2px stroke, round caps/joins → `lucide-react` matches.
- **Logo**: 32×32 gradient square, radius 9px, white "A" glyph (SVG path from the landing), "Acadium" 800 weight.
- **Motion**: `.2s ease` on hover transitions; panels fade up 6px over .35s; respects `prefers-reduced-motion`.
