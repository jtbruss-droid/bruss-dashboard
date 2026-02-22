# SPEC: Bruss Daily Balance Forecast Tool

## Purpose
A React single-page app (Claude artifact) that shows Jeff and Bethany Bruss their predicted checking account balance for every day, 90 days forward. The core value proposition: open the app, see today's predicted balance, compare to the NW Preferred CU app, know instantly whether you're on track.

## User Context
Jeff loses financial motivation without daily visibility. He had a working Voyant + Quicken system ~15-20 years ago that provided this. Voyant is dead. Quicken for Mac 8.2 exists but NW Preferred CU doesn't support direct connect, and manual imports produced garbled data. This tool replaces that daily feedback loop.

## Core View: Daily Balance Timeline

### Layout
- **Header**: "Bruss Daily Forecast" + current date + predicted balance for today (large, prominent)
- **Manual actual balance input**: Single number field where Jeff types what NW Preferred shows. Optional. Persists via window.storage.
- **Variance indicator**: If actual entered, show delta (e.g., "Actual: $2,341 | Predicted: $2,580 | You're $239 under")
- **Calendar/timeline view**: Scrollable 90-day view showing each day with:
  - Predicted end-of-day balance
  - Color coding: Green (>$1,000 buffer), Yellow ($500-$1,000), Red (<$500)
  - Icons or markers on days with known transactions (paycheck days, mortgage day, etc.)
  - If actual balance was entered for a past day, show both numbers
- **Monthly summary row**: Below each month section, show that month's net cash flow

### Navigation
- Scroll/swipe through days
- Tap a day to see detail: what transactions are predicted for that day, running total
- "Jump to today" button

## Data Model

### Starting Balance
- User-editable field: "What's in checking right now?" â€” this seeds the forecast
- Stored in window.storage so it persists
- Default: $3,000 (reasonable mid-month estimate)

### Recurring Income (all to main checking 858820-0055)

| Item | Amount | Timing | Notes |
|------|--------|--------|-------|
| Jeff paycheck | $2,728 | 15th + last business day of month | Bi-weekly. Both Jeff and Bethany land same day. |
| Bethany paycheck | $3,259 | 15th + last business day of month | Same schedule as Jeff. |
| EPBB cell stipend | $100 | ~5th of month | Lands 3rd-7th, model as 5th. |
| ADU transfer | variable | ~monthly | User-editable per month. Default: $300 winter (Nov-Mar), $2,000 summer (Apr-Oct). |

**3-paycheck months**: Approximately 5x per year each, Jeff and Bethany get a 3rd paycheck in a month. The tool should let the user mark specific months as 3-paycheck months (adding $2,728 or $3,259 on the mid-month date). Default: detect from the bi-weekly calendar.

**Jeff bonuses**: Not in the daily forecast by default (unpredictable timing). User can manually add a one-time income on any date. The tool should have a simple "Add one-time transaction" feature (date, amount, description).

### Recurring Expenses (all from main checking unless noted)

#### Bills with verified dates and amounts (from 24-month audit):

| Bill | Amount | Day of Month | Variation |
|------|--------|-------------|-----------|
| NW Natural Gas | $107-$320 | ~1st or ~27th | Seasonal. Default by month: Jan $320, Feb $280, Mar $250, Apr $200, May $150, Jun $107, Jul $107, Aug $107, Sep $137, Oct $137, Nov $200, Dec $280 |
| T-Mobile | $182.08 | 6th | Fixed |
| Mission Lane | $180 | ~4th | Manual payment, target $525 ($150 min + $375 extra) once snowball active |
| Capital One | $125 | ~5th (once autopay set) | Currently chaotic; model as single $125 payment |
| Comcast ADU | $104 | ~8th | Recently increased from $63 |
| Amazon Prime | $2.99 | ~9th | Monthly |
| Audible | $14.95 | ~15th | Monthly |
| Pacific Power | $210-$438 | ~14th-16th | Seasonal as "ROCKYMTNPACIFIC". Default: Jan $360, Feb $382, Mar $372, Apr $303, May $311, Jun $318, Jul $282, Aug $433, Sep $438, Oct $381, Nov $324, Dec $373 |
| Cincinnati Insurance | $440 | ~16th | Homeowners. Fluctuates $428-$449 |
| Mazda (CU internal) | $519 | 17th | Always 17th exactly. Internal transfer to 858820-0050 |
| Mortgage (NSM) | $7,006.33 | ~17th-20th | Model as 18th |
| IRS | $1,000 | ~18th-20th | Model as 19th |
| Disney+ | $15.99 | ~19th | Intermittent â€” include by default, user can toggle |
| Comcast main | $115 | ~21st | Recently increased from $85 |
| Healthy Paws (Ruby, main) | $398.08 | ~23rd | From main checking |
| Healthy Paws (Kermit, 0200) | $81.73 | ~28th | From 858820-0200 â€” does NOT hit main checking. Include as memo only. |
| Netflix | $24.99 | ~last day | Monthly |
| NW Natural (2nd hit?) | verify | ~27th | Some months show two NW Natural charges |
| Kia (KMF) | $563.86 | ~29th | Monthly |
| Student Loan (Dept Ed) | $190.65 | ~28th | Monthly |
| Arrowhead (earthquake ins) | $43 | ~29th | Monthly |
| Home Depot card | $29 | verify | Minimum payment |
| Target card | $30 | verify | Minimum payment |

#### Periodic bills:
| Bill | Amount | Frequency | Notes |
|------|--------|-----------|-------|
| Portland Disposal | $195.40 | Bimonthly | ~1st-3rd of even months |
| Portland Water | $580 | Quarterly | ~late month. Actual range $497-$733. Quarters: approx Feb, May/Jun, Aug, Oct/Nov |
| RO Health | $165 | Quarterly | ~late month. Mar, Jun, Sep, Dec |
| Patreon | $54 | ~1st | Monthly but was recently $183, now appears to be ~$54 |

#### Weekly recurring:
| Item | Amount | Day | Notes |
|------|--------|-----|-------|
| Jeff allowance transfer | $275 | Friday | Proposed new system. Currently monthly lump. |
| Bethany allowance transfer | $210 | Friday | Proposed new system. |

**Note**: The weekly transfers are the new plan. If not yet implemented, the tool should have a toggle: "Weekly transfers active?" â€” if off, model as monthly ($1,140 Jeff, $850 Bethany on the 1st).

### Settings Panel
- Starting balance (editable)
- Toggle weekly vs monthly allowance transfers
- ADU income per month (12 editable fields)
- Add/remove one-time transactions
- Toggle individual bills on/off (for "what if" scenarios)
- Seasonal utility overrides (Pacific Power and NW Natural per month)

## Technical Requirements

### Framework
- React artifact (.jsx)
- Tailwind for styling
- Use window.storage for persistence (actual balances entered, settings, one-time transactions)
- No external APIs or imports beyond what Claude artifacts support (React, recharts, lucide-react, lodash, d3)

### Persistence
- Use window.storage with keys like:
  - `forecast:settings` â€” starting balance, toggle states
  - `forecast:actuals` â€” {date: balance} map of manually entered actuals
  - `forecast:onetimes` â€” array of one-time transactions
  - `forecast:adu` â€” monthly ADU income overrides

### Mobile-First
- Must work well on phone screen (Jeff will check from bed)
- Touch-friendly date navigation
- Large, readable balance numbers

### Sharing
- Bethany accesses same URL
- Use shared storage (shared: true) for actuals and settings so both see the same data
- No authentication needed

## Visual Design
- Clean, minimal. Not financial-software-busy.
- Today's predicted balance should be the dominant visual element
- Green/yellow/red color system for buffer status
- Transaction detail on tap/click, not always visible
- Dark mode option (nice to have, not required)

## What This Is NOT
- Not a budget tracker (the workbook handles that)
- Not a transaction importer (no OFX/QFX parsing)
- Not a lifetime financial planner (Voyant replacement comes later)
- Not a debt payoff calculator (the snowball tab handles that)

It is exactly one thing: a daily balance forecast that answers "am I where I should be today?"

## Accuracy Expectations
The forecast will drift from reality over a month due to irregular spending, timing shifts, and unmodeled transactions. That's fine. The value is catching divergence early â€” if the model says $2,400 and reality shows $1,800, Jeff knows $600 went somewhere unplanned and can investigate before it cascades. The manual "actual balance" input lets him recalibrate at any time.

## Files Available for Reference
- `/mnt/project/transactions_FINAL.csv` â€” 4,754 transactions, Feb 2024-Feb 2026
- `/mnt/project/debt_snowball_02162026.csv` â€” current debt balances
- `/mnt/user-data/outputs/bruss_phase2_financial_plan.xlsx` â€” budget and cash flow workbook
- Bible document (attached) â€” comprehensive household financial reference
