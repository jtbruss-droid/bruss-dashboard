# BRUSS DASHBOARD — COMPRESSED CHAT HANDOFF
### Date: February 21, 2026

---

## WHAT WE WERE TRYING TO DO

Jeff is sick of copy-pasting files between Claude.ai and his Mac. The goal of this entire session was to get Claude Code connected to his project files so future sessions require zero copy-paste — just open Claude Code, describe what you want, it gets built.

We never got to actual dashboard work. The whole session was setup.

---

## WHAT GOT DONE

- Homebrew installed on Mac (Apple Silicon M5)
- Node.js installed via Homebrew
- Claude Code confirmed working (he already had it)
- Git configured: user "Jeff Bruss", email jtbruss@gmail.com
- GitHub account: https://github.com/jtbruss-droid
- Private repo created: https://github.com/jtbruss-droid/bruss-dashboard
- Local folder created: ~/bruss-dashboard
- README.md committed and pushed to GitHub
- All 5 project files written to ~/bruss-dashboard via bootstrap.sh script

## WHAT IS NOT DONE

- Files in ~/bruss-dashboard have NOT been committed to GitHub yet
- No actual dashboard code has been written
- Claude Code has not been pointed at the project folder and verified working

---

## NEXT STEPS — DO THESE IN ORDER

**In regular terminal:**
```bash
cd ~/bruss-dashboard
git add .
git commit -m "add project files"
git push
```

Then open Claude Code, navigate to ~/bruss-dashboard, and verify it can read the files:
```bash
cd ~/bruss-dashboard
claude
```

Once Claude Code can see the files, start building Phase 1 of the dashboard.

---

## THE PROJECT

Two things being built:

**1. Household Status Board** — Dashboard on cheap Amazon Fire tablets in kiosk mode throughout the Bruss house. Shows: calendar (Jeff + Bethany Outlook + Hosttools/Airbnb iCal), Portland weather, shopping list, financial pulse widget.

**2. ADU Guest Board** — Guest-facing display for "The PDX Loft" Airbnb at 3850 NE 33rd, Portland. Shows: stay info, house manual, weather, local tips. QR code for guest phones. No household data exposed to guests.

**Phase 1 (start here):** Household board MVP — financial pulse widget + weather + calendar scaffold. Deploy on 1-2 Fire tablets.

---

## THE EXISTING FORECAST TOOL

`bruss_daily_forecast.jsx` is a fully working React app already built in a prior session. It forecasts the Bruss checking account balance day by day, 6 months forward. All bill amounts, dates, seasonal patterns hardcoded from a 24-month transaction audit. Uses window.storage (shared:true).

Do NOT rebuild this. Extract a simplified glanceable widget from it for the dashboard.

---

## KEY FINANCIAL FACTS

- Bank: NW Preferred Credit Union, checking account S0055
- Jeff paycheck: $2,728.45 bi-weekly (15th + last business day of month)
- Bethany paycheck: $3,259.00 bi-weekly (same days)
- ADU income: ~$300/mo winter, ~$2,000/mo summer
- Non-mortgage debt: $86K, snowball payoff target December 2029

---

## JEFF'S PREFERENCES — NEVER VIOLATE THESE

- Give direct URLs. Example: https://github.com/settings/tokens — never "go to Settings, click Developer settings..."
- Always say "regular terminal" or "Claude Code" — never "Window 1" or "Window 2"
- Warn before asking for any token, password, or secret
- Produce a handoff document at end of every session, proactively
- Show working things fast — he loses motivation without visible progress
- Mac, Apple Silicon M5, home WiFi, no weird configurations
- Not a developer but comfortable in terminal
