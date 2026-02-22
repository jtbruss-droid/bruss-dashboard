# BRUSS HOUSEHOLD DASHBOARD & ADU GUEST BOARD — PROJECT BRIEF
### Created: February 21, 2026
### Status: Planning — not yet started. This document seeds a new project.
### Origin: Conceived during the Bruss financial overhaul project (Phases 1–4).

---

## VISION

Two separate but technologically related systems:

1. **Household Status Board** — A persistent, always-on dashboard displayed on screens throughout the Bruss home (basement, bedroom, bathroom, kitchen, etc.). All screens show the same content. Think of it as a constantly-present situation awareness display for the household. Also accessible from phones/laptops anywhere, but the primary use case is glanceable wall-mounted or countertop displays at home.

2. **ADU Guest Board** — A guest-facing display inside "The PDX Loft" (Airbnb-operated ADU at 3850 NE 33rd, Portland). One central screen in the unit, plus QR code access so guests can pull it up on their own devices via browser. No app required. Privacy-first. Must comply with Airbnb's rules. Does not expose any household data.

These share technology (likely the same framework/platform) but are completely separate in data and access. A guest should never see household financial data, calendars, or personal information — and the household should never feel like it's surveilling guests.

---

## HOUSEHOLD STATUS BOARD

### Content (known wants)
- **Combined calendar**: Jeff's calendar + Bethany's calendar + Airbnb/Hosttools booking calendar, all in one view. Calendar platform preference: **Microsoft/Outlook**. Both Jeff and Bethany are comfortable with Microsoft 365.
- **Weather forecast**: Portland, OR. Multi-day. Glanceable.
- **Shopping list**: Shared, editable from any device. No specific app currently in use — this is aspirational. Could be integrated or could link to an external shared list.
- **Financial pulse**: A simplified strip from the daily forecast tool (already built as a React artifact — see `bruss_daily_forecast.jsx` in project files). Show today's predicted checking balance, green/yellow/red status, next few days of upcoming bills. Not the full forecast — just the glanceable version.
- **Possibly**: Airbnb booking summary (next guest check-in, current occupancy status) — helpful for Jeff to see at a glance whether the ADU is occupied or has a gap coming up.

### Hardware Approach
- **Preferred**: Cheap tablets (Amazon Fire tablets at $35–50, or repurposed old tablets/iPads) running a full-screen browser in kiosk mode, pointed at a single URL.
- **Alternative**: Raspberry Pi + small display, but more complex and more expensive per unit.
- **Quantity**: 4–6 displays throughout the house. All showing the same dashboard URL.
- **Network**: Home WiFi. All devices on the same local network. Dashboard should work even if internet is down (graceful degradation for weather/calendar, but financial data is local).

### Display Characteristics
- Always on (or motion-activated wake — depends on hardware)
- Auto-refresh or live-updating
- Readable from a distance (large fonts, high contrast)
- Dark mode strongly preferred (bedroom, nighttime use)
- Touch interaction optional but nice (for shopping list editing, etc.)
- Landscape orientation likely, but should work in portrait too

---

## ADU GUEST BOARD

### Content (known wants)
- **Current visit info**: Guest name (from Airbnb), check-in/check-out dates, WiFi password, any special instructions
- **House manual**: Digital version of the PDX Loft house manual. Easy to navigate. FAQ section.
- **Weather**: Portland forecast
- **Local recommendations**: Restaurants, attractions, transit info. Could be curated by Jeff.
- **Possibly**: Simple messaging/request system ("We need more towels" type thing) — but this needs careful thought re: Airbnb rules

### What it is NOT
- Not a surveillance tool. No cameras, no microphones, no tracking.
- Not required for any part of the stay. Everything on the board is also available through normal Airbnb channels.
- Not collecting personal data from guests beyond what Airbnb already provides.
- Not circumventing Airbnb's communication policies (all booking-related communication stays on Airbnb's platform).

### Hardware
- One tablet in the ADU, mounted or on a stand, running the guest board URL in kiosk mode
- QR code printed/displayed in the unit that guests can scan to open the same dashboard on their phone's browser
- No app download required — pure web

### Airbnb Compliance Notes
- Airbnb requires disclosure of all recording/monitoring devices. This board has none — it's an information display, not a monitoring device.
- The board should include a brief note: "This display shows information about your stay. It does not record audio, video, or any personal data."
- All guest-facing data comes from the Airbnb reservation (which the guest consented to) or is public information (weather).
- If a messaging feature is added, it must not replace Airbnb's messaging system for anything booking-related.

### Integration with Household Board
- The household board can show a simple Airbnb status: "Guest checking in Thursday" / "Unit vacant" / "Turnover tomorrow"
- This data flows ONE DIRECTION: from the booking system to the household board. The guest board never shows household data.
- The guest board does not know the household board exists.

---

## TECHNOLOGY CONSIDERATIONS

### Calendar Integration
- **Microsoft/Outlook preferred**. Both Jeff and Bethany will use Outlook calendars.
- Outlook calendars expose iCal feeds and have Microsoft Graph API access.
- Hosttools (Airbnb channel manager) provides iCal feed for booking calendar.
- The dashboard needs to consume 3+ iCal feeds and render a unified calendar view.
- Color-coding by source (Jeff = one color, Bethany = another, Airbnb = third).

### Existing Home Hardware
- **Ring security system**: Hub, doorbell, alarm base station. Currently controlling nothing but has been connected to sensors and keypads in the past. Ring has limited open API access — integrates with Alexa ecosystem, and HomeAssistant can pull from it via unofficial integration (ring-mqtt or similar). Worth noting but not central to the dashboard project.
- **No existing home automation hub** (no HomeAssistant, no SmartThings).

### Platform Options to Evaluate

**Option A: HomeAssistant Dashboard**
- Pros: Massive ecosystem, handles calendar/weather/device integration natively, great dashboard builder (Lovelace), huge community, runs on a Raspberry Pi or old laptop, free
- Cons: Significant learning curve, requires ongoing maintenance, the guest board would need a separate instance or careful access control, Ring integration is unofficial
- Jeff's comfort level: "Can follow detailed instructions" — HomeAssistant has good docs but can be fiddly

**Option B: Custom Web App (self-hosted)**
- Pros: Full control, can be exactly what's needed, React/Next.js or similar, the financial forecast tool is already React
- Cons: Requires development (Claude can build it), needs a host (Pi, old laptop, or cheap cloud), more upfront work
- Natural fit given that the financial forecast tool is already a React artifact

**Option C: MagicMirror²**
- Pros: Purpose-built for exactly this use case (info displays around the house), modular, huge plugin ecosystem, calendar/weather built in
- Cons: Primarily designed for single displays not multi-screen sync, Node.js based, the guest board would be a separate thing, less flexible for custom financial integration
- Worth evaluating — may be the fastest path to a working household board

**Option D: Dakboard or similar commercial product**
- Pros: Turnkey, minimal setup, looks good out of the box
- Cons: Subscription cost, limited customization, can't integrate the financial forecast, doesn't solve the guest board
- Probably not the right fit given the custom requirements

**Recommendation to evaluate first**: Start with **MagicMirror²** for the household board (fastest to a working product, handles calendar + weather natively, can add custom modules for financial data) and a **simple custom web app** for the guest board (lightweight, no framework dependency, just serves info). If MagicMirror proves too limiting, pivot to a full custom app for both.

### Hosting
- **Self-hosted on home network** is the right default. A Raspberry Pi 4 ($45–60) or an old laptop can run the server. Dashboard pages are served to tablets over WiFi.
- The guest board needs to be accessible from the ADU's WiFi. If the ADU is on the same network as the house, this is trivial. If it's on a separate network (common for Airbnb setups), the server needs to be reachable from both networks, or the guest board needs its own lightweight host.
- For remote access (Jeff checking from his phone away from home), a Cloudflare Tunnel or Tailscale VPN provides secure access without opening ports. Both are free for personal use.

---

## FINANCIAL INTEGRATION DETAILS

The daily balance forecast tool (`bruss_daily_forecast.jsx`) is a React artifact built during Phase 4 of the financial project. It shows:
- Today's predicted checking account balance
- 90-day forward forecast with color coding (green ≥$1,000, yellow $500–1,000, red <$500)
- All recurring bills and income mapped to specific days
- Actual balance input for variance tracking

For the dashboard, a **simplified glanceable widget** should be extracted from or inspired by this tool:
- Today's predicted balance (large number)
- Color status indicator
- Next 3 days: upcoming transactions and predicted balances
- No settings, no full calendar — just the pulse

The full forecast tool remains available as a standalone app for detailed review.

### Key Financial Data Sources (from project files)
- `bruss_financial_bible.md` — Comprehensive household financial reference (income, bills, debt, behavioral insights)
- `bruss_daily_forecast.jsx` — Working React forecast tool with all bill amounts, dates, and seasonal patterns
- `SPEC_daily_forecast_tool.md` — Detailed spec for the forecast tool
- `bruss_phase2_financial_plan.xlsx` — Budget workbook with seasonal cash flow model
- `transactions_FINAL.csv` — 4,754 transactions, Feb 2024–Feb 2026 (for reference/validation)

---

## JEFF'S TECHNICAL PROFILE

- **Comfort level**: Can follow detailed, step-by-step instructions. Not a developer, but not intimidated by technology.
- **Past experience**: Has used Quicken for Mac, managed Airbnb/Hosttools, set up Ring system. Comfortable with web interfaces and basic troubleshooting.
- **Known friction point**: NW Preferred Credit Union doesn't support direct connect for any financial software. Manual data processes lose him. Automation and "set it and forget it" are critical for sustained engagement.
- **Key behavioral insight**: Jeff thrives with constant visibility and loses motivation without it. The entire dashboard concept is an extension of this pattern — the financial forecast tool was designed around it, and the household dashboard generalizes it to all aspects of household management.

---

## BUDGET CONTEXT

The Bruss household is in an active debt snowball paying down $86K in non-mortgage debt (target: December 2029). Monthly surplus is thin (~$196/month in 2-paycheck months, covered by bonuses and 3-paycheck months for ~$15,400/year net positive). Major discretionary spending should be deferred or kept minimal.

**Realistic budget for this project**:
- 4–6 Fire tablets: $140–300 (can be acquired gradually, one or two at a time)
- 1 Raspberry Pi 4 (if needed for server): $45–60
- 1 tablet for ADU: $35–50
- Ongoing costs: Near zero if self-hosted (electricity only). Possibly a small Cloudflare or domain cost ($10–15/year).
- **Total estimated**: $250–450, spreadable over several months

This is NOT a project that should involve monthly SaaS subscriptions or expensive hardware. The value proposition is high (daily visibility = better financial discipline = faster debt payoff), but the implementation needs to respect the current financial reality.

---

## AIRBNB/ADU CONTEXT

- **Property**: "The PDX Loft" — 473 sq ft, 2-story ADU at 3850 NE 33rd, Portland
- **Platform**: Airbnb, managed via Hosttools (channel manager)
- **2025 gross revenue**: $41,708 (up 8.7% YoY)
- **Occupancy pattern**: Winter trough (Jan–Feb ~$2K/mo), summer peak (May–Aug ~$3,400–4,900/mo)
- **Rate increase planned**: 2026, not yet implemented. 15% increase = ~$5,600/yr additional net.
- **Concurrent project**: Jeff has a separate Airbnb-centric project in progress. The guest board should coordinate with but not duplicate that work.
- **Hosttools capabilities**: Provides iCal feeds, automated messaging, booking management. The guest board can pull stay data from Hosttools or directly from Airbnb's iCal.

---

## OPEN QUESTIONS FOR THE NEW PROJECT

1. **Network topology**: Is the ADU on the same WiFi network as the main house, or separate? This affects how the server communicates with the guest board.
2. **Microsoft 365 subscription**: Do Jeff and Bethany already have Microsoft 365 (personal or family), or would this need to be set up? Calendar integration via Microsoft Graph API requires an M365 account.
3. **Shopping list tool**: No current shared list app in use. Should the dashboard integrate with a specific service (Microsoft To Do, Apple Reminders, Google Keep), or build a simple custom list?
4. **Display mounting**: Wall-mounted (permanent) or stand-based (movable)? Affects hardware choices (power routing, viewing angles).
5. **ADU automation ideas**: Jeff mentioned "some level of automation" but nothing specific yet. Smart lock (for self-check-in)? Smart thermostat? Automated lighting? These would require a hub (possibly HomeAssistant) and are a separate phase.
6. **Hosttools API access**: What data can be pulled programmatically from Hosttools? iCal is confirmed, but is there a richer API for guest names, check-in instructions, etc.?
7. **Ring integration priority**: Is integrating Ring into the dashboard important (e.g., doorbell camera feed, alarm status), or is Ring staying separate?
8. **Timeline**: When does Jeff want a working v1? This affects whether to go fast (MagicMirror + simple guest page) or thorough (custom build).

---

## SUGGESTED PHASING

**Phase 1: Household board MVP**
- Set up server (Pi or old laptop)
- Calendar integration (Jeff + Bethany Outlook + Hosttools iCal)
- Weather widget
- Financial pulse widget (simplified from existing forecast tool)
- Deploy on 1–2 tablets as proof of concept

**Phase 2: Guest board MVP**
- Simple web page with stay info, house manual, weather, local tips
- QR code for guest phone access
- Deploy on 1 tablet in ADU

**Phase 3: Expand & polish**
- Add shopping list to household board
- Add more tablets throughout house
- Refine guest board based on guest feedback
- Add Airbnb occupancy status to household board

**Phase 4: Automation exploration**
- Evaluate smart lock, thermostat, lighting for ADU
- Consider HomeAssistant if automation scope grows
- Integrate Ring if desired

---

## FILES FROM THE FINANCIAL PROJECT (for reference)

These files contain data and tools relevant to the dashboard's financial integration:

| File | Relevance |
|------|-----------|
| `bruss_daily_forecast.jsx` | Working React forecast tool — extract/adapt for dashboard widget |
| `SPEC_daily_forecast_tool.md` | Detailed spec for the forecast tool (data model, bill dates, amounts) |
| `bruss_financial_bible.md` | Complete household financial reference (income, bills, debt, seasonality) |
| `bruss_action_plan_feb2026.md` | 90-day action plan (context for priorities) |
| `bruss_phase2_financial_plan.xlsx` | Budget workbook with cash flow model |
| `transactions_FINAL.csv` | 24 months of transaction data (validation reference) |
| `debt_snowball_02162026.csv` | Current debt balances |
