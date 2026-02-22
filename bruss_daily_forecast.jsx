import { useState, useEffect, useCallback, useMemo } from "react";

// â”€â”€â”€ FINANCIAL DATA (from 24-month transaction audit) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const JEFF_PAYCHECK = 2728.45;
const BETHANY_PAYCHECK = 3259.00;
const NW_NATURAL_BY_MONTH   = [320, 280, 250, 200, 150, 107, 107, 107, 137, 137, 200, 280];
const PACIFIC_POWER_BY_MONTH = [360, 382, 372, 303, 311, 318, 282, 433, 438, 381, 324, 373];
const ADU_BY_MONTH = [300, 300, 300, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 300];

const MONTHLY_BILLS = [
  { id: "patreon",      name: "Patreon",           amount: 54.00,   day: 1  },
  { id: "missionlane",  name: "Mission Lane",       amount: 525.00,  day: 4  },
  { id: "capitalone",   name: "Capital One",        amount: 125.00,  day: 5  },
  { id: "tmobile",      name: "T-Mobile",           amount: 182.08,  day: 6  },
  { id: "comcastadu",   name: "Comcast ADU",        amount: 104.00,  day: 8  },
  { id: "amazonprime",  name: "Amazon Prime",       amount: 2.99,    day: 9  },
  { id: "audible",      name: "Audible",            amount: 14.95,   day: 15 },
  { id: "pacificpower", name: "Pacific Power",      amount: null,    day: 15, seasonal: "pacificpower" },
  { id: "cinciins",     name: "Cincinnati Ins.",    amount: 440.00,  day: 16 },
  { id: "mazda",        name: "Mazda (CU)",         amount: 519.00,  day: 17 },
  { id: "mortgage",     name: "Mortgage",           amount: 7006.33, day: 18 },
  { id: "irs",          name: "IRS",                amount: 1000.00, day: 19 },
  { id: "disneyplus",   name: "Disney+",            amount: 15.99,   day: 19, optional: true },
  { id: "comcastmain",  name: "Comcast Main",       amount: 115.00,  day: 21 },
  { id: "healthypaws",  name: "Healthy Paws",       amount: 398.08,  day: 23 },
  { id: "nwnatural",    name: "NW Natural",         amount: null,    day: 27, seasonal: "nwnatural" },
  { id: "studentloan",  name: "Student Loan",       amount: 190.65,  day: 28 },
  { id: "kia",          name: "Kia",                amount: 563.86,  day: 29 },
  { id: "arrowhead",    name: "Arrowhead Ins.",     amount: 43.00,   day: 29 },
  { id: "homedepot",    name: "Home Depot",         amount: 29.00,   day: 29 },
  { id: "target",       name: "Target Card",        amount: 30.00,   day: 30 },
  { id: "netflix",      name: "Netflix",            amount: 24.99,   day: 30 },
];

const PERIODIC_BILLS = [
  { id: "disposal", name: "Portland Disposal", amount: 195.40, day: 2,  months: [1,3,5,7,9,11] },
  { id: "water",    name: "Portland Water",    amount: 580.00, day: 25, months: [1,4,7,10] },
  { id: "rohealth", name: "RO Health",         amount: 165.00, day: 28, months: [2,5,8,11] },
];

const EPBB_STIPEND   = 100.00;
const WEEKLY_JEFF    = 275.00;
const WEEKLY_BETHANY = 210.00;
const MONTHLY_JEFF   = 1140.00;
const MONTHLY_BETHANY = 850.00;

// â”€â”€â”€ HELPERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function lastBizDay(year, month) {
  const d = new Date(year, month + 1, 0);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() - 1);
  return d.getDate();
}

function isPayday(date) {
  const dom = date.getDate();
  const lbd = lastBizDay(date.getFullYear(), date.getMonth());
  return dom === 15 || dom === lbd;
}

function isFriday(d) { return d.getDay() === 5; }

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function fmt(n) {
  if (n === undefined || n === null) return "â€”";
  const abs = Math.abs(n);
  const s = abs.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (n < 0 ? '-$' : '$') + s;
}

function fmtShort(n) {
  if (n === undefined || n === null) return "â€”";
  const abs = Math.abs(n);
  if (abs >= 10000) return (n < 0 ? '-$' : '$') + (abs/1000).toFixed(0) + 'k';
  if (abs >= 1000)  return (n < 0 ? '-$' : '$') + (abs/1000).toFixed(1) + 'k';
  return (n < 0 ? '-$' : '$') + abs.toFixed(0);
}

// â”€â”€â”€ FORECAST ENGINE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function buildForecastMap(settings, oneTimeTxns, aduOverrides) {
  const today = new Date(); today.setHours(0,0,0,0);
  const map = {};
  let balance = settings.startingBalance;

  // Run forward 6 months from today
  const end = new Date(today.getFullYear(), today.getMonth() + 6, 0);

  for (let d = new Date(today); d <= end; d.setDate(d.getDate() + 1)) {
    const date = new Date(d);
    const m   = date.getMonth();
    const dom = date.getDate();
    const txns = [];

    // INCOME
    if (isPayday(date)) {
      txns.push({ name: "Jeff Paycheck",    amount: JEFF_PAYCHECK,    type: "income" });
      txns.push({ name: "Bethany Paycheck", amount: BETHANY_PAYCHECK, type: "income" });
    }
    if (dom === 5)
      txns.push({ name: "EPBB Cell Stipend", amount: EPBB_STIPEND, type: "income" });
    if (dom === 1) {
      const adu = aduOverrides[m] ?? ADU_BY_MONTH[m];
      if (adu > 0) txns.push({ name: "ADU Income", amount: adu, type: "income" });
    }

    // ALLOWANCES
    if (settings.weeklyTransfers && isFriday(date)) {
      txns.push({ name: "Jeff Allowance",    amount: -WEEKLY_JEFF,    type: "allowance" });
      txns.push({ name: "Bethany Allowance", amount: -WEEKLY_BETHANY, type: "allowance" });
    }
    if (!settings.weeklyTransfers && dom === 1) {
      txns.push({ name: "Jeff Allowance",    amount: -MONTHLY_JEFF,    type: "allowance" });
      txns.push({ name: "Bethany Allowance", amount: -MONTHLY_BETHANY, type: "allowance" });
    }

    // MONTHLY BILLS
    for (const bill of MONTHLY_BILLS) {
      if (settings.disabledBills?.[bill.id]) continue;
      const lastDom = new Date(date.getFullYear(), m+1, 0).getDate();
      const billDay = Math.min(bill.day, lastDom);
      if (dom === billDay) {
        let amt = bill.amount;
        if (bill.seasonal === "nwnatural")    amt = settings.nwNatural?.[m]    ?? NW_NATURAL_BY_MONTH[m];
        if (bill.seasonal === "pacificpower") amt = settings.pacificPower?.[m] ?? PACIFIC_POWER_BY_MONTH[m];
        txns.push({ name: bill.name, amount: -amt, type: "expense", id: bill.id });
      }
    }

    // PERIODIC BILLS
    for (const bill of PERIODIC_BILLS) {
      if (settings.disabledBills?.[bill.id]) continue;
      if (bill.months.includes(m) && dom === bill.day)
        txns.push({ name: bill.name, amount: -bill.amount, type: "expense" });
    }

    // ONE-TIME
    const dk = dateKey(date);
    for (const ot of (oneTimeTxns || [])) {
      if (ot.date === dk)
        txns.push({ name: ot.name, amount: ot.amount, type: ot.amount >= 0 ? "income" : "expense" });
    }

    const delta = txns.reduce((s,t) => s + t.amount, 0);
    balance += delta;
    map[dk] = { balance, delta, txns };
  }

  return map;
}

// â”€â”€â”€ STORAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function loadStor(key) {
  try { const r = await window.storage.get(key, true); return r ? JSON.parse(r.value) : null; }
  catch { return null; }
}
async function saveStor(key, val) {
  try { await window.storage.set(key, JSON.stringify(val), true); } catch {}
}

// â”€â”€â”€ CALENDAR HELPERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const DOW_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function calendarCells(year, month) {
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

// â”€â”€â”€ DAY CELL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function DayCell({ dom, year, month, forecastMap, actuals, today, onSelect }) {
  if (dom === null) {
    return <div style={{ minHeight: 70, borderRadius: 8, background: "rgba(255,255,255,0.01)" }} />;
  }

  const date = new Date(year, month, dom);
  const dk = dateKey(date);
  const data = forecastMap[dk];
  const actual = actuals[dk];
  const isToday = dk === dateKey(today);
  const isPast  = date < today && !isToday;

  const displayBalance = actual !== undefined ? actual : data?.balance;
  const hasTxns    = data?.txns?.length > 0;
  const hasIncome  = data?.txns?.some(t => t.type === "income");
  const hasBigBill = data?.txns?.some(t => t.amount <= -500);
  const hasSmallBill = hasTxns && !hasIncome && !hasBigBill;

  let bgColor     = "rgba(18,18,32,0.5)";
  let borderColor = "rgba(255,255,255,0.05)";
  let balColor    = "#475569";

  if (displayBalance !== undefined) {
    if (displayBalance >= 1000) {
      bgColor = "rgba(15,35,22,0.75)"; borderColor = "rgba(34,197,94,0.22)"; balColor = "#86efac";
    } else if (displayBalance >= 500) {
      bgColor = "rgba(38,32,10,0.75)"; borderColor = "rgba(234,179,8,0.28)"; balColor = "#fde047";
    } else if (displayBalance >= 0) {
      bgColor = "rgba(48,15,15,0.75)"; borderColor = "rgba(239,68,68,0.35)"; balColor = "#fca5a5";
    } else {
      bgColor = "rgba(75,8,8,0.85)"; borderColor = "rgba(239,68,68,0.65)"; balColor = "#ef4444";
    }
  }

  if (isToday) borderColor = "#7c3aed";
  if (isPast && actual === undefined) { bgColor = "rgba(12,12,22,0.35)"; balColor = "#334155"; }

  return (
    <div
      onClick={() => onSelect({ date, dk, data, actual })}
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: 8,
        minHeight: 70,
        padding: "5px 6px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        userSelect: "none",
      }}
    >
      {/* Day number */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{
          fontSize: "0.72rem",
          fontWeight: isToday ? 900 : 500,
          color: isToday ? "#a78bfa" : isPast ? "#334155" : "#64748b",
          background: isToday ? "rgba(124,58,237,0.25)" : "transparent",
          borderRadius: 4,
          padding: isToday ? "1px 4px" : 0,
          lineHeight: 1.4,
        }}>{dom}</span>
        {actual !== undefined && (
          <span style={{ fontSize: "0.45rem", color: "#a78bfa", fontWeight: 900, letterSpacing: "0.05em", lineHeight: 1.5 }}>ACT</span>
        )}
      </div>

      {/* Balance */}
      {displayBalance !== undefined && (
        <div style={{
          fontSize: "0.7rem", fontWeight: 700,
          color: isPast && actual === undefined ? "#334155" : balColor,
          letterSpacing: "-0.02em",
          fontVariantNumeric: "tabular-nums",
        }}>
          {fmtShort(displayBalance)}
        </div>
      )}

      {/* Dots */}
      {hasTxns && (
        <div style={{ display: "flex", gap: 3, marginTop: 3 }}>
          {hasIncome  && <span style={{ width:5,height:5,borderRadius:"50%",background:"#22c55e",display:"inline-block",flexShrink:0 }} />}
          {hasBigBill && <span style={{ width:5,height:5,borderRadius:"50%",background:"#ef4444",display:"inline-block",flexShrink:0 }} />}
          {hasSmallBill && <span style={{ width:5,height:5,borderRadius:"50%",background:"#f87171",opacity:0.55,display:"inline-block",flexShrink:0 }} />}
        </div>
      )}
    </div>
  );
}

// â”€â”€â”€ DAY DETAIL MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function DayModal({ sel, onClose, onSetActual, onRemoveActual }) {
  const [input, setInput] = useState(sel.actual !== undefined ? String(sel.actual) : "");
  const { date, data, actual } = sel;
  const predicted = data?.balance;
  const variance  = actual !== undefined && predicted !== undefined ? actual - predicted : null;

  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.82)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:300,backdropFilter:"blur(6px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:"#0f0f1e",
        border:"1px solid rgba(124,58,237,0.45)",
        borderRadius:"16px 16px 0 0",
        padding:"20px 18px 40px",
        width:"100%", maxWidth:520,
        animation:"slideUp 0.2s ease",
      }}>
        {/* Header */}
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14 }}>
          <div>
            <div style={{ fontSize:"1.05rem",fontWeight:800,color:"#f1f5f9" }}>
              {date.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}
            </div>
            {predicted !== undefined && (
              <div style={{ fontSize:"0.68rem",color:"#64748b",marginTop:3 }}>
                Predicted: <span style={{ color:"#94a3b8",fontWeight:700 }}>{fmt(predicted)}</span>
                {variance !== null && (
                  <span style={{ marginLeft:8,fontWeight:700,color:variance>=0?"#86efac":"#fca5a5" }}>
                    ({variance>=0?"+":""}{fmt(variance)} vs forecast)
                  </span>
                )}
              </div>
            )}
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,padding:"5px 10px",color:"#64748b",cursor:"pointer",fontSize:"1rem",lineHeight:1 }}>âœ•</button>
        </div>

        {/* Transactions */}
        <div style={{ maxHeight:220,overflowY:"auto",marginBottom:16 }}>
          {(!data?.txns || data.txns.length === 0) && (
            <div style={{ color:"#334155",fontSize:"0.8rem",padding:"8px 0" }}>No scheduled transactions this day.</div>
          )}
          {data?.txns?.map((t,i) => (
            <div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                <span style={{ color:t.amount>=0?"#22c55e":t.type==="allowance"?"#a78bfa":"#f87171",fontSize:"0.85rem",width:14,textAlign:"center" }}>
                  {t.amount>=0?"â†‘":"â†“"}
                </span>
                <span style={{ fontSize:"0.85rem",color:"#cbd5e1" }}>{t.name}</span>
              </div>
              <span style={{ fontSize:"0.88rem",fontWeight:700,color:t.amount>=0?"#86efac":"#fca5a5",fontVariantNumeric:"tabular-nums",letterSpacing:"-0.01em" }}>
                {t.amount>=0?"+":""}{fmt(t.amount)}
              </span>
            </div>
          ))}
        </div>

        {/* Actual input */}
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.07)",paddingTop:14 }}>
          <div style={{ fontSize:"0.62rem",color:"#7c3aed",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:7 }}>Log Actual Balance</div>
          <div style={{ display:"flex",gap:8 }}>
            <div style={{ position:"relative",flex:1 }}>
              <span style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#64748b" }}>$</span>
              <input
                value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&(()=>{const n=parseFloat(input);if(!isNaN(n)){onSetActual(sel.dk,n);onClose();}})()}
                placeholder="What NW Preferred showsâ€¦"
                style={{ width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.14)",borderRadius:8,padding:"10px 10px 10px 24px",color:"#f1f5f9",fontSize:"0.88rem",outline:"none",fontFamily:"inherit" }}
              />
            </div>
            <button
              onClick={()=>{const n=parseFloat(input);if(!isNaN(n)){onSetActual(sel.dk,n);onClose();}}}
              style={{ background:"#7c3aed",border:"none",borderRadius:8,padding:"10px 16px",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:"0.82rem",fontFamily:"inherit" }}>
              Save
            </button>
            {actual !== undefined && (
              <button onClick={()=>{onRemoveActual(sel.dk);onClose();}}
                style={{ background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,padding:"10px 12px",color:"#94a3b8",cursor:"pointer",fontFamily:"inherit",fontSize:"0.82rem" }}>
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€ ADD TRANSACTION PANEL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function AddTxnPanel({ onAdd, onClose }) {
  const today = new Date();
  const defaultDate = dateKey(today);
  const [form, setForm] = useState({ name:"", amount:"", date: defaultDate, isIncome: false });

  return (
    <div style={{ background:"rgba(18,18,36,0.98)",border:"1px solid rgba(124,58,237,0.3)",borderRadius:10,padding:14,marginBottom:12 }}>
      <div style={{ fontWeight:700,color:"#c4b5fd",fontSize:"0.7rem",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10 }}>Add One-Time Transaction</div>
      <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
        <input placeholder="Description (e.g. Jeff bonus Q2)"
          value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
          style={{ background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:7,padding:"8px 10px",color:"#f1f5f9",fontSize:"0.82rem",outline:"none",fontFamily:"inherit" }} />
        <div style={{ display:"flex",gap:8 }}>
          <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}
            style={{ flex:1,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:7,padding:"8px 10px",color:"#f1f5f9",fontSize:"0.82rem",outline:"none",fontFamily:"inherit" }} />
          <div style={{ flex:1,position:"relative" }}>
            <span style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#64748b",fontSize:"0.85rem" }}>$</span>
            <input placeholder="Amount" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))}
              style={{ width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:7,padding:"8px 8px 8px 22px",color:"#f1f5f9",fontSize:"0.82rem",outline:"none",fontFamily:"inherit" }} />
          </div>
        </div>
        <div style={{ display:"flex",gap:10,alignItems:"center" }}>
          <label style={{ display:"flex",gap:6,alignItems:"center",cursor:"pointer",fontSize:"0.78rem",color:"#94a3b8" }}>
            <input type="checkbox" checked={form.isIncome} onChange={e=>setForm(f=>({...f,isIncome:e.target.checked}))} />
            Income (not expense)
          </label>
          <div style={{ flex:1 }} />
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.06)",border:"none",borderRadius:7,padding:"7px 12px",color:"#64748b",cursor:"pointer",fontSize:"0.78rem",fontFamily:"inherit" }}>Cancel</button>
          <button onClick={()=>{
            const amt=parseFloat(form.amount);
            if(!form.name||isNaN(amt)||!form.date)return;
            onAdd({name:form.name,amount:form.isIncome?amt:-amt,date:form.date});
            onClose();
          }} style={{ background:"#7c3aed",border:"none",borderRadius:7,padding:"7px 14px",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:"0.78rem",fontFamily:"inherit" }}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€ MAIN APP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function BrussForecast() {
  const today = useMemo(() => { const d=new Date(); d.setHours(0,0,0,0); return d; }, []);

  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [settings,  setSettings]  = useState({ startingBalance: 3000, weeklyTransfers: true, disabledBills: {} });
  const [actuals,   setActuals]   = useState({});
  const [oneTimeTxns,  setOneTimeTxns]  = useState([]);
  const [aduOverrides, setAduOverrides] = useState({});
  const [loaded, setLoaded] = useState(false);

  const [selectedCell, setSelectedCell] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddTxn,   setShowAddTxn]   = useState(false);
  const [todayInput,   setTodayInput]   = useState("");

  // Load from shared storage
  useEffect(() => {
    (async () => {
      const s   = await loadStor("forecast:settings");
      const a   = await loadStor("forecast:actuals");
      const o   = await loadStor("forecast:onetimes");
      const adu = await loadStor("forecast:adu");
      if (s)   setSettings(prev => ({...prev,...s}));
      if (a)   setActuals(a);
      if (o)   setOneTimeTxns(o);
      if (adu) setAduOverrides(adu);
      setLoaded(true);
    })();
  }, []);

  const saveSettings = useCallback(async s => { setSettings(s);        await saveStor("forecast:settings", s); }, []);
  const saveActuals  = useCallback(async a => { setActuals(a);         await saveStor("forecast:actuals",  a); }, []);
  const saveOneTime  = useCallback(async o => { setOneTimeTxns(o);     await saveStor("forecast:onetimes", o); }, []);

  const forecastMap = useMemo(
    () => buildForecastMap(settings, oneTimeTxns, aduOverrides),
    [settings, oneTimeTxns, aduOverrides]
  );

  const cells = useMemo(() => calendarCells(viewYear, viewMonth), [viewYear, viewMonth]);

  // Today stats
  const todayDk       = dateKey(today);
  const todayForecast = forecastMap[todayDk];
  const todayActual   = actuals[todayDk];
  const todayBalance  = todayActual ?? todayForecast?.balance;
  const todayVariance = (todayActual !== undefined && todayForecast) ? todayActual - todayForecast.balance : null;

  // Month summary
  const monthStats = useMemo(() => {
    const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate();
    let income=0, expense=0, lowest=Infinity;
    for (let d=1; d<=daysInMonth; d++) {
      const dk = dateKey(new Date(viewYear, viewMonth, d));
      const fd = forecastMap[dk]; if (!fd) continue;
      fd.txns.forEach(t => { if(t.amount>0) income+=t.amount; else expense+=t.amount; });
      if (fd.balance < lowest) lowest = fd.balance;
    }
    return { income, expense, net: income+expense, lowest: lowest===Infinity ? null : lowest };
  }, [forecastMap, viewYear, viewMonth]);

  // Nav
  const prevMonth = () => { if(viewMonth===0){setViewMonth(11);setViewYear(y=>y-1);}else setViewMonth(m=>m-1); };
  const nextMonth = () => { if(viewMonth===11){setViewMonth(0);setViewYear(y=>y+1);}else setViewMonth(m=>m+1); };
  const goToday   = () => { setViewMonth(today.getMonth()); setViewYear(today.getFullYear()); };

  const handleSetActual    = useCallback(async (dk,val) => { await saveActuals({...actuals,[dk]:val}); }, [actuals,saveActuals]);
  const handleRemoveActual = useCallback(async dk => { const n={...actuals}; delete n[dk]; await saveActuals(n); }, [actuals,saveActuals]);
  const handleAddTxn       = useCallback(async txn => { await saveOneTime([...oneTimeTxns, txn]); }, [oneTimeTxns,saveOneTime]);
  const handleRemoveTxn    = useCallback(async i => { await saveOneTime(oneTimeTxns.filter((_,idx)=>idx!==i)); }, [oneTimeTxns,saveOneTime]);

  const handleTodayInput = useCallback(async () => {
    const n = parseFloat(todayInput);
    if (!isNaN(n)) { await handleSetActual(todayDk, n); setTodayInput(""); }
  }, [todayInput, todayDk, handleSetActual]);

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString("en-US",{month:"long",year:"numeric"});
  const isCurrentMonth = viewMonth === today.getMonth() && viewYear === today.getFullYear();

  if (!loaded) return (
    <div style={{ minHeight:"100vh",background:"#0c0c18",display:"flex",alignItems:"center",justifyContent:"center",color:"#7c3aed",fontFamily:"monospace" }}>
      Loading forecastâ€¦
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#0c0c18", fontFamily:"'DM Mono','JetBrains Mono','Fira Mono',monospace", color:"#f1f5f9", maxWidth:640, margin:"0 auto", paddingBottom:60 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        @keyframes slideUp { from{transform:translateY(28px);opacity:0}to{transform:translateY(0);opacity:1} }
        @keyframes fadeIn  { from{opacity:0}to{opacity:1} }
        input[type=date]::-webkit-calendar-picker-indicator { filter:invert(0.5); }
      `}</style>

      {/* â•â• STICKY HEADER â•â• */}
      <div style={{ position:"sticky",top:0,zIndex:50,background:"rgba(12,12,24,0.97)",backdropFilter:"blur(14px)",borderBottom:"1px solid rgba(124,58,237,0.18)" }}>

        {/* Account label + settings toggle */}
        <div style={{ padding:"12px 16px 8px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div>
            <div style={{ fontSize:"0.52rem",letterSpacing:"0.16em",color:"#6d28d9",textTransform:"uppercase",fontWeight:700 }}>BRUSS Â· NW PREFERRED S0055</div>
            <div style={{ fontSize:"0.62rem",color:"#475569",marginTop:1 }}>{today.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</div>
          </div>
          <button onClick={()=>setShowSettings(s=>!s)}
            style={{ background:showSettings?"rgba(124,58,237,0.2)":"rgba(255,255,255,0.05)",border:`1px solid ${showSettings?"rgba(124,58,237,0.5)":"rgba(255,255,255,0.1)"}`,borderRadius:8,padding:"6px 12px",color:showSettings?"#c4b5fd":"#94a3b8",cursor:"pointer",fontSize:"0.68rem",fontFamily:"inherit",fontWeight:600 }}>
            {showSettings?"â†‘ close":"âš™ settings"}
          </button>
        </div>

        {/* Today balance + input */}
        <div style={{ padding:"0 16px 10px" }}>
          <div style={{ display:"flex",alignItems:"baseline",gap:10,marginBottom:4 }}>
            <div style={{ fontSize:"clamp(1.7rem,7vw,2.3rem)",fontWeight:500,letterSpacing:"-0.04em",
              color:todayBalance===undefined?"#334155":todayBalance>=1000?"#86efac":todayBalance>=500?"#fde047":"#fca5a5" }}>
              {todayBalance!==undefined?fmt(todayBalance):"â€”"}
            </div>
            {todayBalance!==undefined&&(
              <span style={{ fontSize:"0.58rem",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",
                color:todayBalance>=1000?"#22c55e":todayBalance>=500?"#eab308":"#ef4444" }}>
                {todayBalance>=1000?"on track":todayBalance>=500?"low buffer":"danger"}
              </span>
            )}
          </div>
          {todayVariance!==null&&(
            <div style={{ fontSize:"0.68rem",color:todayVariance>=0?"#86efac":"#fca5a5",fontWeight:700,marginBottom:5 }}>
              {todayVariance>=0?"â–²":"â–¼"} {fmt(Math.abs(todayVariance))} {todayVariance>=0?"above":"below"} forecast
            </div>
          )}
          <div style={{ display:"flex",gap:8 }}>
            <div style={{ position:"relative",flex:1 }}>
              <span style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#64748b",fontSize:"0.8rem" }}>$</span>
              <input
                value={todayInput}
                onChange={e=>setTodayInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handleTodayInput()}
                placeholder={todayActual!==undefined?`Actual set: ${fmt(todayActual)} â€” update?`:"Enter today's actual balance from NW Preferredâ€¦"}
                style={{ width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"8px 8px 8px 22px",color:"#f1f5f9",fontSize:"0.76rem",outline:"none",fontFamily:"inherit" }}
              />
            </div>
            <button onClick={handleTodayInput} style={{ background:"#4c1d95",border:"none",borderRadius:8,padding:"8px 14px",color:"#c4b5fd",cursor:"pointer",fontWeight:700,fontSize:"0.7rem",fontFamily:"inherit" }}>Set</button>
          </div>
        </div>

        {/* Month nav */}
        <div style={{ padding:"0 16px 10px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <button onClick={prevMonth} style={{ background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"7px 16px",color:"#94a3b8",cursor:"pointer",fontSize:"1rem",lineHeight:1,fontFamily:"inherit" }}>â€¹</button>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:"0.95rem",fontWeight:700,color:"#f1f5f9",letterSpacing:"-0.01em" }}>{monthLabel}</div>
            {!isCurrentMonth&&(
              <button onClick={goToday} style={{ background:"none",border:"none",color:"#7c3aed",cursor:"pointer",fontSize:"0.62rem",fontFamily:"inherit",fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",padding:"2px 0",marginTop:1 }}>â† back to today</button>
            )}
          </div>
          <button onClick={nextMonth} style={{ background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"7px 16px",color:"#94a3b8",cursor:"pointer",fontSize:"1rem",lineHeight:1,fontFamily:"inherit" }}>â€º</button>
        </div>
      </div>

      {/* â•â• SETTINGS PANEL â•â• */}
      {showSettings&&(
        <div style={{ padding:16,borderBottom:"1px solid rgba(255,255,255,0.07)",animation:"fadeIn 0.15s ease",display:"flex",flexDirection:"column",gap:16 }}>

          <div>
            <label style={{ fontSize:"0.62rem",color:"#7c3aed",letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700,display:"block",marginBottom:5 }}>Starting Balance (today's seed)</label>
            <input type="number" value={settings.startingBalance}
              onChange={e=>saveSettings({...settings,startingBalance:parseFloat(e.target.value)||0})}
              style={{ width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,padding:"9px 12px",color:"#f1f5f9",fontSize:"0.88rem",outline:"none",fontFamily:"inherit" }} />
            <div style={{ fontSize:"0.6rem",color:"#475569",marginTop:3 }}>Set this to what NW Preferred shows right now to seed the whole forecast</div>
          </div>

          <div>
            <label style={{ fontSize:"0.62rem",color:"#7c3aed",letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700,display:"block",marginBottom:5 }}>Allowance System</label>
            <div style={{ display:"flex",gap:8 }}>
              {[["Weekly â€” $485/Fri",true],["Monthly â€” $1,990/1st",false]].map(([label,isW])=>{
                const active=settings.weeklyTransfers===isW;
                return <button key={label} onClick={()=>saveSettings({...settings,weeklyTransfers:isW})}
                  style={{ flex:1,background:active?"#4c1d95":"rgba(255,255,255,0.05)",border:`1px solid ${active?"#7c3aed":"rgba(255,255,255,0.1)"}`,borderRadius:8,padding:"8px 6px",color:active?"#c4b5fd":"#64748b",cursor:"pointer",fontSize:"0.7rem",fontFamily:"inherit",fontWeight:active?700:400 }}>{label}</button>;
              })}
            </div>
          </div>

          <div>
            <label style={{ fontSize:"0.62rem",color:"#7c3aed",letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700,display:"block",marginBottom:5 }}>Optional Bills</label>
            <label style={{ display:"flex",gap:8,alignItems:"center",cursor:"pointer",fontSize:"0.8rem",color:"#94a3b8" }}>
              <input type="checkbox" checked={!settings.disabledBills?.disneyplus}
                onChange={e=>saveSettings({...settings,disabledBills:{...settings.disabledBills,disneyplus:!e.target.checked}})} />
              Disney+ â€” $15.99/mo
            </label>
          </div>

          <div>
            <label style={{ fontSize:"0.62rem",color:"#7c3aed",letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700,display:"block",marginBottom:5 }}>ADU Monthly Income</label>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5 }}>
              {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((mo,i)=>(
                <div key={i}>
                  <div style={{ fontSize:"0.57rem",color:"#64748b",marginBottom:2 }}>{mo}</div>
                  <input type="number" value={aduOverrides[i]??ADU_BY_MONTH[i]}
                    onChange={async e=>{const next={...aduOverrides,[i]:parseFloat(e.target.value)||0};setAduOverrides(next);await saveStor("forecast:adu",next);}}
                    style={{ width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:5,padding:"5px 6px",color:"#f1f5f9",fontSize:"0.67rem",outline:"none",fontFamily:"inherit" }} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
              <label style={{ fontSize:"0.62rem",color:"#7c3aed",letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700 }}>One-Time Transactions</label>
              <button onClick={()=>setShowAddTxn(s=>!s)}
                style={{ background:"#4c1d95",border:"none",borderRadius:6,padding:"4px 10px",color:"#c4b5fd",cursor:"pointer",fontSize:"0.68rem",fontFamily:"inherit",fontWeight:700 }}>+ Add</button>
            </div>
            {showAddTxn&&<AddTxnPanel onAdd={handleAddTxn} onClose={()=>setShowAddTxn(false)} />}
            {oneTimeTxns.length===0&&<div style={{ fontSize:"0.72rem",color:"#475569" }}>None yet â€” add bonuses, windfalls, etc.</div>}
            {oneTimeTxns.map((t,i)=>(
              <div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                <div>
                  <span style={{ fontSize:"0.78rem",color:"#cbd5e1" }}>{t.name}</span>
                  <span style={{ fontSize:"0.6rem",color:"#475569",marginLeft:8 }}>{t.date}</span>
                </div>
                <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                  <span style={{ fontSize:"0.82rem",fontWeight:700,color:t.amount>=0?"#86efac":"#fca5a5" }}>{t.amount>=0?"+":""}{fmt(t.amount)}</span>
                  <button onClick={()=>handleRemoveTxn(i)} style={{ background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:"0.85rem",padding:"0 4px",fontFamily:"inherit" }}>âœ•</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* â•â• CALENDAR â•â• */}
      <div style={{ padding:"12px 10px 0" }}>

        {/* DOW headers */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:4 }}>
          {DOW_LABELS.map(d=>(
            <div key={d} style={{ textAlign:"center",fontSize:"0.58rem",color:"#334155",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",padding:"3px 0" }}>{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3 }}>
          {cells.map((dom,i)=>(
            <DayCell
              key={i}
              dom={dom}
              year={viewYear}
              month={viewMonth}
              forecastMap={forecastMap}
              actuals={actuals}
              today={today}
              onSelect={setSelectedCell}
            />
          ))}
        </div>
      </div>

      {/* â•â• MONTH SUMMARY â•â• */}
      <div style={{ margin:"10px 10px 0",background:"rgba(18,18,36,0.6)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        {[
          ["Income",  fmt(monthStats.income),  "#86efac"],
          ["Expenses",fmt(monthStats.expense), "#fca5a5"],
          ["Net",     (monthStats.net>=0?"+":"")+fmt(monthStats.net), monthStats.net>=0?"#86efac":"#fca5a5"],
          ["Month Low", monthStats.lowest!==null?fmtShort(monthStats.lowest):"â€”",
            monthStats.lowest===null?"#475569":monthStats.lowest>=1000?"#86efac":monthStats.lowest>=500?"#fde047":"#fca5a5"],
        ].map(([label,val,col])=>(
          <div key={label} style={{ textAlign:"center" }}>
            <div style={{ fontSize:"0.55rem",color:"#475569",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:3 }}>{label}</div>
            <div style={{ fontSize:"0.82rem",fontWeight:700,color:col,fontVariantNumeric:"tabular-nums",letterSpacing:"-0.01em" }}>{val}</div>
          </div>
        ))}
      </div>

      {/* â•â• LEGEND â•â• */}
      <div style={{ margin:"8px 10px 0",display:"flex",gap:12,alignItems:"center",flexWrap:"wrap" }}>
        {[
          ["rgba(15,35,22,0.75)","rgba(34,197,94,0.22)","â‰¥ $1k"],
          ["rgba(38,32,10,0.75)","rgba(234,179,8,0.28)","$500â€“1k"],
          ["rgba(48,15,15,0.75)","rgba(239,68,68,0.35)","< $500"],
        ].map(([bg,border,label])=>(
          <div key={label} style={{ display:"flex",gap:5,alignItems:"center" }}>
            <div style={{ width:11,height:11,borderRadius:3,background:bg,border:`1px solid ${border}` }} />
            <span style={{ fontSize:"0.58rem",color:"#475569" }}>{label}</span>
          </div>
        ))}
        <div style={{ display:"flex",gap:4,alignItems:"center" }}>
          <span style={{ width:6,height:6,borderRadius:"50%",background:"#22c55e",display:"inline-block" }} />
          <span style={{ fontSize:"0.58rem",color:"#475569" }}>paycheck/income</span>
        </div>
        <div style={{ display:"flex",gap:4,alignItems:"center" }}>
          <span style={{ width:6,height:6,borderRadius:"50%",background:"#ef4444",display:"inline-block" }} />
          <span style={{ fontSize:"0.58rem",color:"#475569" }}>big bill â‰¥$500</span>
        </div>
      </div>

      {/* â•â• DAY MODAL â•â• */}
      {selectedCell&&(
        <DayModal
          sel={selectedCell}
          onClose={()=>setSelectedCell(null)}
          onSetActual={handleSetActual}
          onRemoveActual={handleRemoveActual}
        />
      )}
    </div>
  );
}
