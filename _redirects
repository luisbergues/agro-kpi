import { useState, useEffect, useCallback, useMemo } from "react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=DM+Mono:wght@400;500&display=swap');`;

const T = {
  bg: "#F3F4F6", sidebar: "#1C2333", sidebarHover: "rgba(255,255,255,.07)",
  sidebarActive: "#2D3A50", surface: "#FFFFFF", surfaceHover: "#F9FAFB",
  border: "#E5E7EB", borderLight: "#F0F1F3", text: "#111827", textSub: "#6B7280",
  textMuted: "#9CA3AF", accent: "#F0A500", accentDark: "#C98900",
  green: "#10B981", greenLight: "#D1FAE5", yellow: "#F59E0B", yellowLight: "#FEF3C7",
  red: "#EF4444", redLight: "#FEE2E2", blue: "#3B82F6", blueLight: "#DBEAFE",
  purple: "#8B5CF6", purpleLight: "#EDE9FE", cyan: "#06B6D4", cyanLight: "#CFFAFE",
};

const SEM_C = { green: T.green, yellow: T.yellow, red: T.red, neutral: T.blue };
const SEM_BG = { green: T.greenLight, yellow: T.yellowLight, red: T.redLight, neutral: T.blueLight };
const SEM_LBL = { green: "Óptimo", yellow: "Atención", red: "Crítico", neutral: "" };

function generateHistory(months = 12) {
  const now = new Date();
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    const label = d.toLocaleDateString("es-AR", { month: "short", year: "2-digit" });
    const t = i / months;
    const r = () => 1 + (Math.random() - 0.5) * 0.12;
    return {
      label, month: i,
      kgCarneHa: Math.round((70 + t * 40 + (Math.random() - 0.5) * 15) * r()),
      cargaAnimal: parseFloat((0.85 + t * 0.25 + (Math.random() - 0.5) * 0.1).toFixed(2)),
      adg: Math.round((520 + t * 120 + (Math.random() - 0.5) * 80) * r()),
      tasaDestete: parseFloat((62 + t * 12 + (Math.random() - 0.5) * 5).toFixed(1)),
      mortalidad: parseFloat((1.8 - t * 0.6 + Math.random() * 0.4).toFixed(2)),
      margenBrutoHa: Math.round((28 + t * 30 + (Math.random() - 0.5) * 12) * r()),
      ingresoPorHa: Math.round(155 + t * 15 + (Math.random() - 0.5) * 10),
      vsMercado: parseFloat((88 + t * 8 + (Math.random() - 0.5) * 4).toFixed(1)),
      eficienciaCosecha: parseFloat((54 + t * 14 + (Math.random() - 0.5) * 8).toFixed(1)),
      balanceForrajero: Math.round((200 + t * 600 + (Math.random() - 0.5) * 200) * r()),
      msProducida: Math.round(7200 + t * 800 + (Math.random() - 0.5) * 500),
      usdHaTotal: Math.round((95 + t * 45 + (Math.random() - 0.5) * 20) * r()),
      stockTotal: Math.round(265 + t * 5 + (Math.random() - 0.5) * 8),
    };
  });
}

const HISTORY = generateHistory(12);

const SK = "campokpi_pbi_v3";
const defaultState = {
  config: {
    totalHa: 500,
    lots: [
      { id: "l1", name: "Lote Norte", ha: 150, use: "agricola", soil: "Franco arcilloso" },
      { id: "l2", name: "Lote Sur", ha: 200, use: "ganadero", soil: "Franco arenoso" },
      { id: "l3", name: "Potrero Central", ha: 150, use: "ganadero", soil: "Franco" },
    ],
  },
  agricola: {
    marketValueUSD_ha: 180,
    contracts: [{
      id: "c1", lotId: "l1", priceUSD_ha: 165,
      startDate: "2024-03-01", durationMonths: 12, paymentType: "Anual",
      payments: [
        { id: "p1", date: "2024-03-01", amount: 24750, status: "pagado" },
        { id: "p2", date: "2025-03-01", amount: 24750, status: "pendiente" },
      ],
    }],
  },
  ganadero: {
    assignedHa: 350,
    stock: [
      { id: "s1", category: "Vaca", count: 120, initialWeight: 430, currentWeight: 455, entryDate: "2024-07-01", ev: 1.0 },
      { id: "s2", category: "Novillo", count: 80, initialWeight: 280, currentWeight: 340, entryDate: "2024-07-01", ev: 0.85 },
      { id: "s3", category: "Ternero", count: 65, initialWeight: 120, currentWeight: 165, entryDate: "2024-10-01", ev: 0.3 },
      { id: "s4", category: "Toro", count: 5, initialWeight: 600, currentWeight: 610, entryDate: "2024-07-01", ev: 1.2 },
    ],
    births: 72, deaths: 3, calvesWeaned: 62, cowsBase: 120,
    feedingCostUSD_ha: 45, ingresos: 16800,
  },
  pasturas: {
    lots: [
      { id: "ps1", lotId: "l2", MS_kg_ha: 8500, occupationDays: 7, restDays: 45, consumedMS_kg_ha: 6200 },
      { id: "ps2", lotId: "l3", MS_kg_ha: 7200, occupationDays: 6, restDays: 42, consumedMS_kg_ha: 5100 },
    ],
  },
};

const load = () => { try { const s = localStorage.getItem(SK); return s ? JSON.parse(s) : defaultState; } catch { return defaultState; } };

function calcKPIs(st) {
  const { config, agricola, ganadero, pasturas } = st;
  const agLots = config.lots.filter(l => l.use === "agricola");
  const agHa = agLots.reduce((s, l) => s + l.ha, 0);
  let agIngreso = 0, agPendiente = 0;
  agricola.contracts.forEach(c => {
    const lot = config.lots.find(l => l.id === c.lotId);
    if (lot) agIngreso += c.priceUSD_ha * lot.ha;
    c.payments.forEach(p => { if (p.status !== "pagado") agPendiente += p.amount; });
  });
  const agPorHa = agHa > 0 ? agIngreso / agHa : 0;
  const agVsMercado = agricola.marketValueUSD_ha > 0 ? (agPorHa / agricola.marketValueUSD_ha) * 100 : 0;

  const gHa = ganadero.assignedHa || 1;
  const totalEV = ganadero.stock.reduce((s, a) => s + a.count * (a.ev || 1), 0);
  const cargaAnimal = totalEV / gHa;
  const stockWithADG = ganadero.stock.map(a => {
    const days = Math.max(1, Math.round((Date.now() - new Date(a.entryDate).getTime()) / 86400000));
    return { ...a, adg: (a.currentWeight - a.initialWeight) / days, days };
  });
  const totalAnimals = ganadero.stock.reduce((s, a) => s + a.count, 0);
  const avgADG = stockWithADG.reduce((s, a) => s + a.adg * a.count, 0) / Math.max(1, totalAnimals);
  const kgCarneHaAnio = gHa > 0 ? stockWithADG.reduce((s, a) => s + a.adg * a.count * a.days, 0) / gHa : 0;
  const tasaDestete = ganadero.cowsBase > 0 ? (ganadero.calvesWeaned / ganadero.cowsBase) * 100 : 0;
  const mortalidad = totalAnimals > 0 ? (ganadero.deaths / totalAnimals) * 100 : 0;
  const margenBrutoHa = gHa > 0 ? (ganadero.ingresos - ganadero.feedingCostUSD_ha * gHa) / gHa : 0;

  const pStats = pasturas.lots.map(pl => ({
    ...pl,
    eficiencia: pl.MS_kg_ha > 0 ? (pl.consumedMS_kg_ha / pl.MS_kg_ha) * 100 : 0,
    balance: pl.MS_kg_ha - pl.consumedMS_kg_ha,
    rotacion: pl.occupationDays + pl.restDays,
  }));
  const avgEficiencia = pStats.length > 0 ? pStats.reduce((s, p) => s + p.eficiencia, 0) / pStats.length : 0;
  const balanceTotal = pStats.reduce((s, p) => s + p.balance * (config.lots.find(l => l.id === p.lotId)?.ha || 0), 0);
  const usdHaTotal = config.totalHa > 0 ? (agIngreso + ganadero.ingresos) / config.totalHa : 0;

  return {
    ag: { ingresoTotal: agIngreso, ingresoPorHa: agPorHa, vsMercado: agVsMercado, haTotal: agHa, pagosPendientes: agPendiente },
    gan: { cargaAnimal, avgADG, kgCarneHaAnio, tasaDestete, mortalidad, margenBrutoHa, totalEV, stockWithADG, totalAnimals },
    past: { pStats, avgEficiencia, balanceTotal },
    global: { usdHaTotal, agIngreso, ganIngresos: ganadero.ingresos },
  };
}

const f1 = (n, d = 1) => (isNaN(n) || n === undefined) ? "—" : Number(n).toLocaleString("es-AR", { maximumFractionDigits: d, minimumFractionDigits: d });
const f0 = n => (isNaN(n) || n === undefined) ? "—" : Number(n).toLocaleString("es-AR", { maximumFractionDigits: 0 });
const sem = (v, g, y) => v >= g ? "green" : v >= y ? "yellow" : "red";
const semInv = (v, g, y) => v <= g ? "green" : v <= y ? "yellow" : "red";

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 14px", boxShadow: "0 8px 24px rgba(0,0,0,.12)", fontFamily: "'DM Sans'" }}>
      <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, marginBottom: 7, letterSpacing: 0.5 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, marginBottom: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, display: "inline-block", flexShrink: 0 }} />
          <span style={{ color: T.textSub, flex: 1 }}>{p.name}:</span>
          <span style={{ fontWeight: 700, color: T.text }}>{f1(p.value, 1)}{unit ? " " + unit : ""}</span>
        </div>
      ))}
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [state, setState] = useState(load);
  const [page, setPage] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [timeRange, setTimeRange] = useState(12);

  useEffect(() => { localStorage.setItem(SK, JSON.stringify(state)); }, [state]);

  const kpis = useMemo(() => calcKPIs(state), [state]);
  const hist = useMemo(() => HISTORY.slice(-timeRange), [timeRange]);

  const update = useCallback((path, value) => {
    setState(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  }, []);

  const exportCSV = () => {
    const rows = [["Módulo","KPI","Valor","Unidad"],
      ["Global","USD/ha total",f1(kpis.global.usdHaTotal,0),"USD/ha"],
      ["Ganadero","Carga animal",f1(kpis.gan.cargaAnimal,2),"EV/ha"],
      ["Ganadero","Kg carne/ha/año",f0(kpis.gan.kgCarneHaAnio),"kg/ha/año"],
      ["Ganadero","ADG",f0(kpis.gan.avgADG*1000),"g/día"],
      ["Ganadero","Tasa destete",f1(kpis.gan.tasaDestete,1),"%"],
      ["Ganadero","Mortalidad",f1(kpis.gan.mortalidad,2),"%"],
      ["Agrícola","Ingreso/ha",f0(kpis.ag.ingresoPorHa),"USD/ha"],
      ["Pasturas","Eficiencia",f1(kpis.past.avgEficiencia,1),"%"],
    ];
    const blob = new Blob([rows.map(r=>r.join(";")).join("\n")],{type:"text/csv"});
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download="campo_kpis.csv"; a.click();
  };

  const alerts = [];
  if (kpis.gan.cargaAnimal > 1.2) alerts.push({ type:"red", msg:"Carga animal crítica: "+f1(kpis.gan.cargaAnimal,2)+" EV/ha" });
  if (kpis.gan.mortalidad > 2) alerts.push({ type:"red", msg:"Mortalidad "+f1(kpis.gan.mortalidad,1)+"% — revisar sanidad" });
  if (kpis.past.avgEficiencia < 55) alerts.push({ type:"yellow", msg:"Eficiencia pasturas "+f1(kpis.past.avgEficiencia,0)+"%" });
  if (kpis.ag.pagosPendientes > 0) alerts.push({ type:"yellow", msg:"Pago pendiente: USD "+f0(kpis.ag.pagosPendientes) });

  const navItems = [
    { id:"overview", icon:"⊞", label:"Overview" },
    { id:"ganadero", icon:"🐄", label:"Ganadero" },
    { id:"agricola", icon:"🌾", label:"Agrícola" },
    { id:"pasturas", icon:"🌿", label:"Pasturas" },
    { id:"historico", icon:"📈", label:"Histórico" },
    { id:"config", icon:"⚙", label:"Config" },
  ];

  const W = sidebarCollapsed ? 52 : 196;

  return (
    <div style={{ display:"flex", height:"100vh", background:T.bg, fontFamily:"'DM Sans',sans-serif", overflow:"hidden", fontSize:13 }}>
      <style>{`
        ${FONT_IMPORT}
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:4px;}
        input,select,button{font-family:'DM Sans',sans-serif;}
        .nav-item{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:7px;cursor:pointer;transition:all .15s;color:#9CA3AF;font-size:12.5px;font-weight:500;margin:1px 6px;white-space:nowrap;overflow:hidden;}
        .nav-item:hover{background:${T.sidebarHover};color:#E5E7EB;}
        .nav-item.active{background:${T.sidebarActive};color:${T.accent};}
        .nav-icon{font-size:13px;width:18px;text-align:center;flex-shrink:0;}
        .card{background:${T.surface};border:1px solid ${T.border};border-radius:10px;}
        .btn{border:none;border-radius:6px;cursor:pointer;font-family:'DM Sans';font-weight:600;font-size:12px;transition:all .15s;}
        .chip{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:10.5px;font-weight:700;letter-spacing:0.2px;}
        .time-btn{padding:5px 13px;border-radius:5px;font-size:11px;font-weight:700;cursor:pointer;border:1px solid ${T.border};background:white;color:${T.textSub};transition:all .15s;font-family:'DM Sans';}
        .time-btn.active{background:${T.accent};color:white;border-color:${T.accent};}
        .inp{background:#F9FAFB;border:1px solid ${T.border};border-radius:6px;padding:7px 10px;font-size:12.5px;color:${T.text};width:100%;transition:border .15s;}
        .inp:focus{outline:none;border-color:${T.accent};background:white;}
        .sec{font-size:10px;font-weight:800;color:${T.textMuted};letter-spacing:1.2px;text-transform:uppercase;margin-bottom:11px;}
        .stat-row{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid ${T.borderLight};}
        .stat-row:last-child{border-bottom:none;}
        table{border-collapse:collapse;width:100%;}
        th{padding:9px 12px;text-align:left;font-size:10px;color:${T.textMuted};font-weight:800;letter-spacing:0.8px;text-transform:uppercase;}
        td{padding:9px 12px;font-size:12.5px;border-bottom:1px solid ${T.borderLight};}
        tr:last-child td{border-bottom:none;}
      `}</style>

      {/* SIDEBAR */}
      <div style={{ width:W, background:T.sidebar, display:"flex", flexDirection:"column", flexShrink:0, transition:"width .2s ease", overflow:"hidden" }}>
        <div style={{ padding:"15px 12px 12px", borderBottom:"1px solid rgba(255,255,255,.06)", display:"flex", alignItems:"center", gap:9, cursor:"pointer", userSelect:"none" }} onClick={()=>setSidebarCollapsed(p=>!p)}>
          <span style={{ fontSize:18, flexShrink:0 }}>🌾</span>
          {!sidebarCollapsed && <div style={{ overflow:"hidden" }}>
            <div style={{ fontSize:12.5, fontWeight:800, color:T.accent, letterSpacing:0.5, whiteSpace:"nowrap" }}>CAMPO KPI</div>
            <div style={{ fontSize:9, color:"#6B7280", letterSpacing:1.2, marginTop:1 }}>ANALYTICS</div>
          </div>}
        </div>
        <nav style={{ flex:1, paddingTop:8 }}>
          {navItems.map(n=>(
            <div key={n.id} className={`nav-item${page===n.id?" active":""}`} onClick={()=>setPage(n.id)}>
              <span className="nav-icon">{n.icon}</span>
              {!sidebarCollapsed && <span>{n.label}</span>}
            </div>
          ))}
        </nav>
        {!sidebarCollapsed && <div style={{ padding:"12px 14px", borderTop:"1px solid rgba(255,255,255,.06)" }}>
          <div style={{ fontSize:9, color:"#6B7280", letterSpacing:0.8, fontWeight:700 }}>ESTABLECIMIENTO</div>
          <div style={{ fontSize:12, color:"#D1D5DB", fontWeight:600, marginTop:3 }}>{state.config.totalHa} ha · {state.config.lots.length} lotes</div>
          <div style={{ fontSize:10.5, color:"#6B7280", marginTop:1 }}>Campo mixto · Argentina</div>
        </div>}
      </div>

      {/* MAIN */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {/* TOPBAR */}
        <div style={{ background:T.surface, borderBottom:`1px solid ${T.border}`, padding:"0 18px", height:50, display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
          <div style={{ fontSize:14, fontWeight:800, color:T.text, flex:1 }}>
            {navItems.find(n=>n.id===page)?.label}
          </div>
          <div style={{ display:"flex", gap:4 }}>
            {[3,6,12].map(m=>(
              <button key={m} className={`time-btn${timeRange===m?" active":""}`} onClick={()=>setTimeRange(m)}>{m}M</button>
            ))}
          </div>
          {alerts.length > 0 && (
            <button className="btn" style={{ padding:"6px 12px", background:T.redLight, color:T.red, fontSize:11 }}>
              ⚠ {alerts.length} alerta{alerts.length>1?"s":""}
            </button>
          )}
          <button className="btn" onClick={exportCSV} style={{ padding:"7px 14px", background:T.bg, border:`1px solid ${T.border}`, color:T.textSub, fontSize:11 }}>
            ↓ CSV
          </button>
        </div>

        {/* PAGE */}
        <div style={{ flex:1, overflow:"auto", padding:18 }}>
          {page==="overview"  && <Overview  kpis={kpis} hist={hist} state={state} alerts={alerts} />}
          {page==="ganadero"  && <GanaderoPage  kpis={kpis.gan} hist={hist} state={state} setState={setState} update={update} />}
          {page==="agricola"  && <AgricolaPage  kpis={kpis.ag}  hist={hist} state={state} setState={setState} update={update} />}
          {page==="pasturas"  && <PasturasPage  kpis={kpis.past} hist={hist} state={state} setState={setState} />}
          {page==="historico" && <HistoricoPage hist={hist} />}
          {page==="config"    && <ConfigPage state={state} setState={setState} update={update} />}
        </div>
      </div>
    </div>
  );
}

// ── Overview ──────────────────────────────────────────────────────────────────
function Overview({ kpis, hist, state, alerts }) {
  const { ag, gan, past, global } = kpis;
  const pieData = [
    { name:"Agrícola", value: ag.haTotal, color: T.green },
    { name:"Ganadero", value: state.config.lots.filter(l=>l.use==="ganadero").reduce((s,l)=>s+l.ha,0), color: T.yellow },
  ];

  return (
    <div>
      {alerts.length>0 && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:14 }}>
          {alerts.map((a,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 13px", borderRadius:6, background:a.type==="red"?T.redLight:T.yellowLight, border:`1px solid ${a.type==="red"?"#FECACA":"#FDE68A"}`, fontSize:11.5, color:a.type==="red"?"#991B1B":"#92400E", fontWeight:500 }}>
              {a.type==="red"?"🔴":"🟡"} {a.msg}
            </div>
          ))}
        </div>
      )}

      {/* KPI ROW */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))", gap:10, marginBottom:14 }}>
        <KPIBadge label="USD/ha Total" value={f0(global.usdHaTotal)} unit="USD/ha" s={sem(global.usdHaTotal,130,90)} sub={`Ag $${f0(ag.ingresoTotal)} · Gan $${f0(global.ganIngresos)}`} />
        <KPIBadge label="Kg Carne/ha/año" value={f0(gan.kgCarneHaAnio)} unit="kg/ha/año" s={sem(gan.kgCarneHaAnio,100,60)} sub={`ADG ${f0(gan.avgADG*1000)} g/día`} />
        <KPIBadge label="Carga Animal" value={f1(gan.cargaAnimal,2)} unit="EV/ha" s={gan.cargaAnimal>1.2?"red":gan.cargaAnimal>1?"yellow":"green"} sub={`${f0(gan.totalEV)} EV totales`} />
        <KPIBadge label="Tasa Destete" value={f1(gan.tasaDestete,0)} unit="%" s={sem(gan.tasaDestete,70,55)} sub={`${state.ganadero.calvesWeaned} terneros`} />
        <KPIBadge label="Alquiler vs Mdo" value={f1(ag.vsMercado,0)} unit="%" s={sem(ag.vsMercado,90,80)} sub={`$${f0(ag.ingresoPorHa)}/ha actual`} />
        <KPIBadge label="Efic. Pasturas" value={f1(past.avgEficiencia,0)} unit="%" s={sem(past.avgEficiencia,65,50)} sub={`Balance ${f0(past.balanceTotal)} kg MS`} />
      </div>

      {/* CHARTS ROW 1 */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:10, marginBottom:10 }}>
        <ChartCard title="Ingreso Total — USD/ha" sub="Evolución mensual del campo completo">
          <ResponsiveContainer width="100%" height={195}>
            <AreaChart data={hist}>
              <defs>
                <linearGradient id="gUsd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.accent} stopOpacity={0.22}/>
                  <stop offset="95%" stopColor={T.accent} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={T.borderLight} />
              <XAxis dataKey="label" tick={{ fontSize:10, fill:T.textMuted }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize:10, fill:T.textMuted }} tickLine={false} axisLine={false} width={36} />
              <Tooltip content={<CustomTooltip unit="USD/ha" />} />
              <Area type="monotone" dataKey="usdHaTotal" name="USD/ha" stroke={T.accent} fill="url(#gUsd)" strokeWidth={2.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Uso del Campo" sub="Distribución por actividad">
          <ResponsiveContainer width="100%" height={195}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="44%" innerRadius={48} outerRadius={72} paddingAngle={4} dataKey="value">
                {pieData.map((e,i)=><Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v)=>[`${v} ha`,""]} />
              <Legend iconSize={8} wrapperStyle={{ fontSize:11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* CHARTS ROW 2 */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
        <ChartCard title="Producción Ganadera" sub="Kg/ha y ADG mensual">
          <ResponsiveContainer width="100%" height={175}>
            <ComposedChart data={hist}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.borderLight} />
              <XAxis dataKey="label" tick={{ fontSize:10, fill:T.textMuted }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="l" tick={{ fontSize:10, fill:T.textMuted }} tickLine={false} axisLine={false} width={32} />
              <YAxis yAxisId="r" orientation="right" tick={{ fontSize:10, fill:T.textMuted }} tickLine={false} axisLine={false} width={36} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconSize={8} wrapperStyle={{ fontSize:10 }} />
              <Bar yAxisId="l" dataKey="kgCarneHa" name="Kg/ha" fill={T.green} opacity={0.8} radius={[2,2,0,0]} />
              <Line yAxisId="r" type="monotone" dataKey="adg" name="ADG (g)" stroke={T.blue} strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Carga Animal vs Eficiencia Forrajera" sub="EV/ha y % cosecha">
          <ResponsiveContainer width="100%" height={175}>
            <ComposedChart data={hist}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.borderLight} />
              <XAxis dataKey="label" tick={{ fontSize:10, fill:T.textMuted }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="l" tick={{ fontSize:10, fill:T.textMuted }} tickLine={false} axisLine={false} width={32} />
              <YAxis yAxisId="r" orientation="right" tick={{ fontSize:10, fill:T.textMuted }} tickLine={false} axisLine={false} width={32} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconSize={8} wrapperStyle={{ fontSize:10 }} />
              <ReferenceLine yAxisId="l" y={1.2} stroke={T.red} strokeDasharray="4 3" label={{ value:"Límite", fontSize:9, fill:T.red, position:"right" }} />
              <Line yAxisId="l" type="monotone" dataKey="cargaAnimal" name="Carga (EV/ha)" stroke={T.yellow} strokeWidth={2} dot={false} />
              <Area yAxisId="r" type="monotone" dataKey="eficienciaCosecha" name="Efic. %" fill={T.greenLight} stroke={T.green} strokeWidth={1.5} dot={false} opacity={0.9} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* STOCK TABLE */}
      <ChartCard title="Stock Actual por Categoría" sub="">
        <table>
          <thead>
            <tr style={{ background:T.bg }}>
              {["Categoría","Cabezas","Peso ini","Peso act","ADG","EV Total","Estado"].map(h=><th key={h}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {kpis.gan.stockWithADG.map(a=>{
              const adgG=a.adg*1000;
              const s=sem(adgG,700,450);
              return (
                <tr key={a.id}>
                  <td style={{ fontWeight:700 }}>{a.category}</td>
                  <td>{a.count}</td>
                  <td style={{ color:T.textSub }}>{a.initialWeight} kg</td>
                  <td style={{ fontWeight:600 }}>{a.currentWeight} kg</td>
                  <td><span className="chip" style={{ background:SEM_BG[s], color:SEM_C[s] }}>{f0(adgG)} g/d</span></td>
                  <td>{f1(a.count*a.ev,1)}</td>
                  <td><span className="chip" style={{ background:SEM_BG[s], color:SEM_C[s] }}>{SEM_LBL[s]}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </ChartCard>
    </div>
  );
}

// ── Ganadero ──────────────────────────────────────────────────────────────────
function GanaderoPage({ kpis, hist, state, setState, update }) {
  const EV = { Vaca:1.0, Novillo:0.85, Vaquillona:0.9, Ternero:0.3, Toro:1.2, Otro:0.8 };
  const updStock = (i,f,v) => setState(prev=>{const n=JSON.parse(JSON.stringify(prev));n.ganadero.stock[i][f]=["count","initialWeight","currentWeight"].includes(f)?(parseFloat(v)||0):v;return n;});

  const radarData = [
    { m:"Destete", v:Math.min(100,kpis.tasaDestete) },
    { m:"ADG",     v:Math.min(100,(kpis.avgADG*1000/900)*100) },
    { m:"Kg/ha",   v:Math.min(100,(kpis.kgCarneHaAnio/150)*100) },
    { m:"Margen",  v:Math.min(100,(kpis.margenBrutoHa/100)*100) },
    { m:"Sanidad", v:Math.min(100,(1-(kpis.mortalidad/5))*100) },
    { m:"Carga",   v:Math.max(0,Math.min(100,(1.5-kpis.cargaAnimal)/1.5*100)) },
  ];

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:10, marginBottom:14 }}>
        <KPIBadge label="Carga Animal" value={f1(kpis.cargaAnimal,2)} unit="EV/ha" s={kpis.cargaAnimal>1.2?"red":kpis.cargaAnimal>1?"yellow":"green"} />
        <KPIBadge label="Kg Carne/ha" value={f0(kpis.kgCarneHaAnio)} unit="kg/ha/año" s={sem(kpis.kgCarneHaAnio,100,60)} />
        <KPIBadge label="ADG Promedio" value={f0(kpis.avgADG*1000)} unit="g/animal/día" s={sem(kpis.avgADG*1000,700,450)} />
        <KPIBadge label="Tasa Destete" value={f1(kpis.tasaDestete,1)} unit="%" s={sem(kpis.tasaDestete,70,55)} />
        <KPIBadge label="Mortalidad" value={f1(kpis.mortalidad,2)} unit="%" s={semInv(kpis.mortalidad,1,2)} />
        <KPIBadge label="Margen/ha" value={f0(kpis.margenBrutoHa)} unit="USD/ha" s={sem(kpis.margenBrutoHa,50,20)} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
        <ChartCard title="ADG y Kg Carne — Tendencia" sub="Evolución mensual">
          <ResponsiveContainer width="100%" height={195}>
            <ComposedChart data={hist}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.borderLight} />
              <XAxis dataKey="label" tick={{ fontSize:10, fill:T.textMuted }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="l" tick={{ fontSize:10, fill:T.textMuted }} tickLine={false} axisLine={false} width={32} />
              <YAxis yAxisId="r" orientation="right" tick={{ fontSize:10, fill:T.textMuted }} tickLine={false} axisLine={false} width={38} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconSize={8} wrapperStyle={{ fontSize:10 }} />
              <Bar yAxisId="l" dataKey="kgCarneHa" name="Kg/ha" fill={T.green} opacity={0.75} radius={[2,2,0,0]} />
              <Line yAxisId="r" type="monotone" dataKey="adg" name="ADG g" stroke={T.blue} strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Perfil Productivo" sub="% del benchmark óptimo">
          <ResponsiveContainer width="100%" height={195}>
            <RadarChart data={radarData} cx="50%" cy="50%">
              <PolarGrid stroke={T.border} />
              <PolarAngleAxis dataKey="m" tick={{ fontSize:10, fill:T.textSub }} />
              <Radar name="Actual" dataKey="v" stroke={T.accent} fill={T.accent} fillOpacity={0.18} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
        <ChartCard title="Carga Animal" sub="EV/ha — líneas de referencia">
          <ResponsiveContainer width="100%" height={155}>
            <AreaChart data={hist}>
              <defs>
                <linearGradient id="gCarga" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.yellow} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={T.yellow} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={T.borderLight} />
              <XAxis dataKey="label" tick={{ fontSize:10, fill:T.textMuted }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize:10, fill:T.textMuted }} tickLine={false} axisLine={false} width={32} domain={[0,1.7]} />
              <Tooltip content={<CustomTooltip unit="EV/ha" />} />
              <ReferenceLine y={1.2} stroke={T.red} strokeDasharray="4 3" label={{ value:"Crítico",fontSize:9,fill:T.red,position:"insideTopRight" }} />
              <ReferenceLine y={1.0} stroke={T.yellow} strokeDasharray="4 3" label={{ value:"Atención",fontSize:9,fill:T.yellow,position:"insideTopRight" }} />
              <Area type="monotone" dataKey="cargaAnimal" name="EV/ha" stroke={T.yellow} fill="url(#gCarga)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Destete y Mortalidad" sub="Indicadores sanitarios / reproductivos">
          <ResponsiveContainer width="100%" height={155}>
            <ComposedChart data={hist}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.borderLight} />
              <XAxis dataKey="label" tick={{ fontSize:10, fill:T.textMuted }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="l" tick={{ fontSize:10, fill:T.textMuted }} tickLine={false} axisLine={false} width={28} />
              <YAxis yAxisId="r" orientation="right" tick={{ fontSize:10, fill:T.textMuted }} tickLine={false} axisLine={false} width={28} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconSize={8} wrapperStyle={{ fontSize:10 }} />
              <Line yAxisId="l" type="monotone" dataKey="tasaDestete" name="Destete %" stroke={T.green} strokeWidth={2} dot={false} />
              <Bar yAxisId="r" dataKey="mortalidad" name="Mort. %" fill={T.red} opacity={0.7} radius={[2,2,0,0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Margen Bruto/ha — Evolución" sub="USD por hectárea ganadera">
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={hist}>
            <defs>
              <linearGradient id="gMargen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={T.purple} stopOpacity={0.22}/>
                <stop offset="95%" stopColor={T.purple} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={T.borderLight} />
            <XAxis dataKey="label" tick={{ fontSize:10, fill:T.textMuted }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize:10, fill:T.textMuted }} tickLine={false} axisLine={false} width={34} />
            <Tooltip content={<CustomTooltip unit="USD/ha" />} />
            <ReferenceLine y={0} stroke={T.red} strokeDasharray="3 3" />
            <Area type="monotone" dataKey="margenBrutoHa" name="Margen USD/ha" stroke={T.purple} fill="url(#gMargen)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:10 }}>
        <div className="card" style={{ padding:16 }}>
          <div className="sec">Parámetros del Rodeo</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
            {[["Ha asignadas","ganadero.assignedHa"],["Vacas base","ganadero.cowsBase"],["Terneros destetados","ganadero.calvesWeaned"],["Nacimientos","ganadero.births"],["Muertes","ganadero.deaths"],["Costo alim (USD/ha)","ganadero.feedingCostUSD_ha"]].map(([lb,path])=>(
              <div key={path}>
                <div style={{ fontSize:9.5, color:T.textMuted, marginBottom:4, fontWeight:700, letterSpacing:0.5 }}>{lb.toUpperCase()}</div>
                <input className="inp" type="number" value={path.split(".").reduce((o,k)=>o[k],state)} onChange={e=>update(path,parseFloat(e.target.value)||0)} />
              </div>
            ))}
          </div>
          <div style={{ marginTop:10 }}>
            <div style={{ fontSize:9.5, color:T.textMuted, marginBottom:4, fontWeight:700, letterSpacing:0.5 }}>INGRESOS VENTAS (USD)</div>
            <input className="inp" type="number" value={state.ganadero.ingresos} onChange={e=>update("ganadero.ingresos",parseFloat(e.target.value)||0)} />
          </div>
        </div>
        <div className="card" style={{ padding:16 }}>
          <div className="sec">Stock por Categoría</div>
          {kpis.stockWithADG.map((a,i)=>(
            <div key={a.id} style={{ display:"grid", gridTemplateColumns:"1fr 50px 50px 50px", gap:6, marginBottom:8, alignItems:"end" }}>
              <div>
                <div style={{ fontSize:9, color:T.textMuted, marginBottom:3, fontWeight:700 }}>CATEGORÍA</div>
                <select className="inp" value={a.category} onChange={e=>{updStock(i,"category",e.target.value);updStock(i,"ev",EV[e.target.value]||0.8);}}>
                  {Object.keys(EV).map(k=><option key={k}>{k}</option>)}
                </select>
              </div>
              {[["Cab","count"],["Kg0","initialWeight"],["Kgf","currentWeight"]].map(([lb,fd])=>(
                <div key={fd}>
                  <div style={{ fontSize:9, color:T.textMuted, marginBottom:3, fontWeight:700 }}>{lb}</div>
                  <input className="inp" type="number" value={a[fd]} onChange={e=>updStock(i,fd,e.target.value)} style={{ padding:"6px 7px" }} />
                </div>
              ))}
            </div>
          ))}
          <button className="btn" style={{ width:"100%", padding:"8px", background:T.bg, border:`1px dashed ${T.border}`, color:T.textSub, marginTop:4, fontSize:11.5 }}
            onClick={()=>setState(prev=>({...prev,ganadero:{...prev.ganadero,stock:[...prev.ganadero.stock,{id:`s${Date.now()}`,category:"Novillo",count:0,initialWeight:0,currentWeight:0,entryDate:new Date().toISOString().split("T")[0],ev:0.85}]}}))}>
            + Agregar categoría
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Agrícola ──────────────────────────────────────────────────────────────────
function AgricolaPage({ kpis, hist, state, setState, update }) {
  const togglePay = (ci,pi) => setState(prev=>{const n=JSON.parse(JSON.stringify(prev));const p=n.agricola.contracts[ci].payments[pi];p.status=p.status==="pagado"?"pendiente":"pagado";return n;});

  const compData = [
    { name:"Precio actual", value:kpis.ingresoPorHa },
    { name:"Valor mercado", value:state.agricola.marketValueUSD_ha },
  ];
  const barColors = [T.blue, T.textMuted];

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:10, marginBottom:14 }}>
        <KPIBadge label="Ingreso/ha" value={f0(kpis.ingresoPorHa)} unit="USD/ha" s={sem(kpis.ingresoPorHa,150,100)} />
        <KPIBadge label="vs Mercado" value={f1(kpis.vsMercado,1)} unit="%" s={sem(kpis.vsMercado,90,80)} />
        <KPIBadge label="Ingreso Total" value={`$${f0(kpis.ingresoTotal)}`} unit="USD" s="neutral" />
        <KPIBadge label="Pagos Pendientes" value={`$${f0(kpis.pagosPendientes)}`} unit="USD" s={kpis.pagosPendientes>0?"red":"green"} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:10, marginBottom:10 }}>
        <ChartCard title="Ingreso por ha — Tendencia" sub="USD/ha con referencia de mercado">
          <ResponsiveContainer width="100%" height={195}>
            <ComposedChart data={hist}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.borderLight} />
              <XAxis dataKey="label" tick={{ fontSize:10, fill:T.textMuted }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="l" tick={{ fontSize:10, fill:T.textMuted }} tickLine={false} axisLine={false} width={34} />
              <YAxis yAxisId="r" orientation="right" tick={{ fontSize:10, fill:T.textMuted }} tickLine={false} axisLine={false} width={30} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconSize={8} wrapperStyle={{ fontSize:10 }} />
              <ReferenceLine yAxisId="l" y={state.agricola.marketValueUSD_ha} stroke={T.red} strokeDasharray="4 3" label={{ value:"Mercado",fontSize:9,fill:T.red,position:"right" }} />
              <Bar yAxisId="l" dataKey="ingresoPorHa" name="USD/ha" fill={T.blue} opacity={0.8} radius={[3,3,0,0]} />
              <Line yAxisId="r" type="monotone" dataKey="vsMercado" name="% vs Mdo" stroke={T.accent} strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Precio vs Mercado" sub="Comparación actual">
          <ResponsiveContainer width="100%" height={195}>
            <BarChart data={compData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={T.borderLight} horizontal={false} />
              <XAxis type="number" tick={{ fontSize:10, fill:T.textMuted }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize:10.5, fill:T.textSub }} width={95} tickLine={false} axisLine={false} />
              <Tooltip formatter={v=>[`USD ${f0(v)}/ha`]} />
              <Bar dataKey="value" radius={[0,5,5,0]}>
                {compData.map((_,i)=><Cell key={i} fill={barColors[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {state.agricola.contracts.map((c,ci)=>{
        const lot=state.config.lots.find(l=>l.id===c.lotId);
        return (
          <div key={c.id} className="card" style={{ padding:16, marginBottom:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div>
                <div style={{ fontWeight:800, fontSize:14 }}>Contrato — {lot?.name}</div>
                <div style={{ fontSize:11, color:T.textMuted, marginTop:2 }}>{c.startDate} · {c.durationMonths} meses · {c.paymentType}</div>
              </div>
              <span className="chip" style={{ background:T.blueLight, color:T.blue }}>USD {f0(c.priceUSD_ha*(lot?.ha||0))} total</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
              <div>
                <div style={{ fontSize:9.5, color:T.textMuted, marginBottom:4, fontWeight:700 }}>PRECIO (USD/HA)</div>
                <input className="inp" type="number" value={c.priceUSD_ha} onChange={e=>setState(prev=>{const n=JSON.parse(JSON.stringify(prev));n.agricola.contracts[ci].priceUSD_ha=parseFloat(e.target.value)||0;return n;})} />
              </div>
              <div>
                <div style={{ fontSize:9.5, color:T.textMuted, marginBottom:4, fontWeight:700 }}>VALOR MERCADO REF.</div>
                <input className="inp" type="number" value={state.agricola.marketValueUSD_ha} onChange={e=>update("agricola.marketValueUSD_ha",parseFloat(e.target.value)||0)} />
              </div>
            </div>
            <div style={{ fontSize:10, color:T.textMuted, fontWeight:800, letterSpacing:0.8, marginBottom:8 }}>ESTADO DE PAGOS</div>
            {c.payments.map((p,pi)=>(
              <div key={p.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:`1px solid ${T.borderLight}` }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:500 }}>{p.date}</div>
                  <div style={{ fontSize:11, color:T.textMuted }}>USD {f0(p.amount)}</div>
                </div>
                <button className="btn chip" style={{ background:p.status==="pagado"?T.greenLight:T.redLight, color:p.status==="pagado"?T.green:T.red, cursor:"pointer" }} onClick={()=>togglePay(ci,pi)}>
                  {p.status==="pagado"?"✓ PAGADO":"PENDIENTE"}
                </button>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ── Pasturas ──────────────────────────────────────────────────────────────────
function PasturasPage({ kpis, hist, state, setState }) {
  const updP = (i,f,v) => setState(prev=>{const n=JSON.parse(JSON.stringify(prev));n.pasturas.lots[i][f]=parseFloat(v)||0;return n;});
  const msData = hist.map(h=>({...h, msConsumo: Math.round(h.msProducida*(h.eficienciaCosecha/100))}));

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:10, marginBottom:14 }}>
        <KPIBadge label="Efic. Cosecha" value={f1(kpis.avgEficiencia,1)} unit="%" s={sem(kpis.avgEficiencia,65,50)} />
        <KPIBadge label="Balance Forrajero" value={f0(kpis.balanceTotal)} unit="kg MS total" s={kpis.balanceTotal>=0?"green":"red"} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
        <ChartCard title="Producción vs Consumo MS" sub="kg materia seca / ha">
          <ResponsiveContainer width="100%" height={195}>
            <ComposedChart data={msData}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.borderLight} />
              <XAxis dataKey="label" tick={{ fontSize:10, fill:T.textMuted }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize:10, fill:T.textMuted }} tickLine={false} axisLine={false} width={42} />
              <Tooltip content={<CustomTooltip unit="kg/ha" />} />
              <Legend iconSize={8} wrapperStyle={{ fontSize:10 }} />
              <Bar dataKey="msProducida" name="Producida" fill={T.green} opacity={0.45} radius={[2,2,0,0]} />
              <Bar dataKey="msConsumo" name="Consumida" fill={T.blue} opacity={0.85} radius={[2,2,0,0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Eficiencia de Cosecha" sub="% MS aprovechada">
          <ResponsiveContainer width="100%" height={195}>
            <AreaChart data={hist}>
              <defs>
                <linearGradient id="gEfic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.green} stopOpacity={0.25}/>
                  <stop offset="95%" stopColor={T.green} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={T.borderLight} />
              <XAxis dataKey="label" tick={{ fontSize:10, fill:T.textMuted }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize:10, fill:T.textMuted }} tickLine={false} axisLine={false} width={30} domain={[0,100]} />
              <Tooltip content={<CustomTooltip unit="%" />} />
              <ReferenceLine y={65} stroke={T.green} strokeDasharray="4 3" label={{ value:"Óptimo",fontSize:9,fill:T.green,position:"right" }} />
              <ReferenceLine y={50} stroke={T.yellow} strokeDasharray="4 3" label={{ value:"Mínimo",fontSize:9,fill:T.yellow,position:"right" }} />
              <Area type="monotone" dataKey="eficienciaCosecha" name="Eficiencia %" stroke={T.green} fill="url(#gEfic)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {kpis.pStats.map((ps,i)=>{
        const lot=state.config.lots.find(l=>l.id===ps.lotId);
        const es=sem(ps.eficiencia,65,50);
        return (
          <div key={ps.id} className="card" style={{ padding:16, marginBottom:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
              <div style={{ fontWeight:800, fontSize:14 }}>{lot?.name||"Lote"} · {lot?.ha} ha</div>
              <span className="chip" style={{ background:SEM_BG[es], color:SEM_C[es] }}>Efic. {f1(ps.eficiencia,0)}%</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:9, marginBottom:14 }}>
              {[["MS producida (kg/ha)","MS_kg_ha"],["MS consumida (kg/ha)","consumedMS_kg_ha"],["Días ocupación","occupationDays"],["Días descanso","restDays"]].map(([lb,fd])=>(
                <div key={fd}>
                  <div style={{ fontSize:9.5, color:T.textMuted, marginBottom:4, fontWeight:700 }}>{lb.toUpperCase()}</div>
                  <input className="inp" type="number" value={ps[fd]} onChange={e=>updP(i,fd,e.target.value)} />
                </div>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
              {[["Eficiencia",f1(ps.eficiencia,1)+"%",es],["Balance",(ps.balance>=0?"+":"")+f0(ps.balance)+" kg MS/ha",ps.balance>=0?"green":"red"],["Rotación",ps.rotacion+" días","neutral"]].map(([lb,val,s])=>(
                <div key={lb} style={{ background:T.bg, borderRadius:7, padding:"10px 12px" }}>
                  <div style={{ fontSize:10, color:T.textMuted, marginBottom:3, fontWeight:700 }}>{lb.toUpperCase()}</div>
                  <div style={{ fontWeight:800, fontSize:15, color:s==="neutral"?T.text:SEM_C[s] }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Histórico ─────────────────────────────────────────────────────────────────
function HistoricoPage({ hist }) {
  const allKPIs = [
    { key:"usdHaTotal",       label:"USD/ha Total",      color:T.accent,  unit:"USD/ha"    },
    { key:"kgCarneHa",        label:"Kg Carne/ha",       color:T.green,   unit:"kg/ha"     },
    { key:"cargaAnimal",      label:"Carga Animal",      color:T.yellow,  unit:"EV/ha"     },
    { key:"adg",              label:"ADG",               color:T.blue,    unit:"g/día"     },
    { key:"tasaDestete",      label:"Tasa Destete",      color:T.purple,  unit:"%"         },
    { key:"mortalidad",       label:"Mortalidad",        color:T.red,     unit:"%"         },
    { key:"eficienciaCosecha",label:"Efic. Pasturas",    color:T.cyan,    unit:"%"         },
    { key:"ingresoPorHa",     label:"Ingreso Ag/ha",     color:T.blue,    unit:"USD/ha"    },
    { key:"margenBrutoHa",    label:"Margen Bruto/ha",   color:"#8B5CF6", unit:"USD/ha"    },
  ];
  const [active, setActive] = useState(["usdHaTotal","kgCarneHa","cargaAnimal"]);
  const toggle = k => setActive(p=>p.includes(k)?p.filter(x=>x!==k):[...p,k]);

  const summaryData = allKPIs.filter(k=>active.includes(k.key)).map(k=>{
    const vals=hist.map(h=>h[k.key]).filter(v=>v!==undefined);
    const avg=vals.reduce((a,b)=>a+b,0)/vals.length;
    const trend=vals.length>1?((vals[vals.length-1]-vals[0])/vals[0]*100):0;
    return { ...k, avg, min:Math.min(...vals), max:Math.max(...vals), trend, last:vals[vals.length-1] };
  });

  return (
    <div>
      {/* SELECTOR */}
      <div className="card" style={{ padding:14, marginBottom:14 }}>
        <div className="sec">Seleccionar KPIs a graficar</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
          {allKPIs.map(k=>(
            <button key={k.key} className="btn" style={{ padding:"6px 13px", fontSize:11.5, background:active.includes(k.key)?k.color:"white", color:active.includes(k.key)?"white":T.textSub, border:`1px solid ${active.includes(k.key)?k.color:T.border}` }} onClick={()=>toggle(k.key)}>
              {k.label}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CHART */}
      <ChartCard title="Evolución Histórica Comparativa" sub={`${hist.length} meses · ${active.length} KPI${active.length>1?"s":""} seleccionados`} style={{ marginBottom:10 }}>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={hist}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.borderLight} />
            <XAxis dataKey="label" tick={{ fontSize:10, fill:T.textMuted }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize:10, fill:T.textMuted }} tickLine={false} axisLine={false} width={36} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconSize={8} wrapperStyle={{ fontSize:10.5 }} />
            {allKPIs.filter(k=>active.includes(k.key)).map(k=>(
              <Line key={k.key} type="monotone" dataKey={k.key} name={k.label} stroke={k.color} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* STATS TABLE */}
      {summaryData.length>0 && (
        <div className="card" style={{ marginBottom:14, overflow:"hidden" }}>
          <div style={{ padding:"13px 16px", borderBottom:`1px solid ${T.border}` }}>
            <div style={{ fontWeight:800, fontSize:13 }}>Resumen Estadístico del Período</div>
            <div style={{ fontSize:11, color:T.textMuted }}>{hist.length} meses de datos</div>
          </div>
          <div style={{ overflowX:"auto" }}>
            <table>
              <thead>
                <tr style={{ background:T.bg }}>
                  {["KPI","Último valor","Promedio","Mínimo","Máximo","Tendencia"].map(h=><th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {summaryData.map(k=>(
                  <tr key={k.key}>
                    <td><div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ width:10,height:10,borderRadius:2,background:k.color,display:"inline-block",flexShrink:0 }} />
                      <span style={{ fontWeight:700 }}>{k.label}</span>
                    </div></td>
                    <td style={{ fontWeight:700 }}>{f1(k.last,1)} <span style={{ fontSize:10,color:T.textMuted }}>{k.unit}</span></td>
                    <td style={{ color:T.textSub }}>{f1(k.avg,1)}</td>
                    <td style={{ color:T.red }}>{f1(k.min,1)}</td>
                    <td style={{ color:T.green }}>{f1(k.max,1)}</td>
                    <td><span className="chip" style={{ background:k.trend>=0?T.greenLight:T.redLight, color:k.trend>=0?T.green:T.red }}>
                      {k.trend>=0?"↑":"↓"} {Math.abs(k.trend).toFixed(1)}%
                    </span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INDIVIDUAL SPARKLINES */}
      {summaryData.length>0 && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))", gap:10 }}>
          {summaryData.map(k=>(
            <ChartCard key={k.key} title={k.label} sub={`${k.unit} · ${k.trend>=0?"▲":"▼"} ${Math.abs(k.trend).toFixed(1)}%`}>
              <ResponsiveContainer width="100%" height={115}>
                <AreaChart data={hist}>
                  <defs>
                    <linearGradient id={`g-${k.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={k.color} stopOpacity={0.25}/>
                      <stop offset="95%" stopColor={k.color} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tick={{ fontSize:9, fill:T.textMuted }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize:9, fill:T.textMuted }} tickLine={false} axisLine={false} width={30} />
                  <Tooltip content={<CustomTooltip unit={k.unit} />} />
                  <Area type="monotone" dataKey={k.key} name={k.label} stroke={k.color} fill={`url(#g-${k.key})`} strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Config ────────────────────────────────────────────────────────────────────
function ConfigPage({ state, setState, update }) {
  const [newLot, setNewLot] = useState({ name:"", ha:"", use:"agricola", soil:"" });
  const [adding, setAdding] = useState(false);
  const totalLotHa = state.config.lots.reduce((s,l)=>s+l.ha,0);

  return (
    <div style={{ maxWidth:620 }}>
      <div className="card" style={{ padding:18, marginBottom:12 }}>
        <div className="sec">Superficie Total</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
          <div>
            <div style={{ fontSize:9.5, color:T.textMuted, marginBottom:4, fontWeight:700 }}>HA TOTALES DECLARADAS</div>
            <input className="inp" type="number" value={state.config.totalHa} onChange={e=>update("config.totalHa",parseFloat(e.target.value)||0)} />
          </div>
          <div style={{ background:T.bg, borderRadius:7, padding:"10px 12px" }}>
            <div style={{ fontSize:9.5, color:T.textMuted, fontWeight:700 }}>EN LOTES</div>
            <div style={{ fontSize:18, fontWeight:800, marginTop:3 }}>{totalLotHa} ha</div>
          </div>
          <div style={{ background:T.bg, borderRadius:7, padding:"10px 12px" }}>
            <div style={{ fontSize:9.5, color:T.textMuted, fontWeight:700 }}>SIN ASIGNAR</div>
            <div style={{ fontSize:18, fontWeight:800, marginTop:3, color:state.config.totalHa-totalLotHa<0?T.red:T.text }}>{Math.max(0,state.config.totalHa-totalLotHa)} ha</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding:18 }}>
        <div className="sec">Lotes del Campo</div>
        <table style={{ marginBottom:12 }}>
          <thead>
            <tr style={{ background:T.bg }}>
              {["Nombre","Ha","Uso","Suelo",""].map(h=><th key={h}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {state.config.lots.map(l=>(
              <tr key={l.id}>
                <td style={{ fontWeight:700 }}>{l.name}</td>
                <td>{l.ha} ha</td>
                <td><span className="chip" style={{ background:l.use==="agricola"?T.greenLight:T.yellowLight, color:l.use==="agricola"?T.green:T.yellow }}>{l.use==="agricola"?"Agrícola":"Ganadero"}</span></td>
                <td style={{ color:T.textSub, fontSize:11.5 }}>{l.soil||"—"}</td>
                <td>
                  <button className="btn" style={{ padding:"4px 10px", fontSize:10.5, background:T.redLight, color:T.red }} onClick={()=>setState(prev=>({...prev,config:{...prev.config,lots:prev.config.lots.filter(x=>x.id!==l.id)}}))}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {adding?(
          <div style={{ background:T.bg, borderRadius:8, padding:16, border:`1px solid ${T.border}` }}>
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:10, marginBottom:10 }}>
              {[["Nombre del lote","text","name","Lote Este"],["Hectáreas","number","ha","0"]].map(([lb,tp,fd,ph])=>(
                <div key={fd}>
                  <div style={{ fontSize:9.5, color:T.textMuted, marginBottom:4, fontWeight:700 }}>{lb.toUpperCase()}</div>
                  <input className="inp" type={tp} placeholder={ph} value={newLot[fd]} onChange={e=>setNewLot(p=>({...p,[fd]:e.target.value}))} />
                </div>
              ))}
              <div>
                <div style={{ fontSize:9.5, color:T.textMuted, marginBottom:4, fontWeight:700 }}>USO</div>
                <select className="inp" value={newLot.use} onChange={e=>setNewLot(p=>({...p,use:e.target.value}))}>
                  <option value="agricola">Agrícola</option>
                  <option value="ganadero">Ganadero</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:9.5, color:T.textMuted, marginBottom:4, fontWeight:700 }}>TIPO DE SUELO (OPCIONAL)</div>
              <input className="inp" type="text" placeholder="Franco arcilloso" value={newLot.soil} onChange={e=>setNewLot(p=>({...p,soil:e.target.value}))} />
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn" style={{ padding:"9px 18px", background:T.accent, color:"white", fontSize:12.5 }} onClick={()=>{if(!newLot.name||!newLot.ha)return;setState(prev=>({...prev,config:{...prev.config,lots:[...prev.config.lots,{...newLot,id:`l${Date.now()}`,ha:parseFloat(newLot.ha)}]}}));setNewLot({name:"",ha:"",use:"agricola",soil:""});setAdding(false);}}>Confirmar</button>
              <button className="btn" style={{ padding:"9px 18px", background:"white", border:`1px solid ${T.border}`, color:T.textSub, fontSize:12.5 }} onClick={()=>setAdding(false)}>Cancelar</button>
            </div>
          </div>
        ):(
          <button className="btn" style={{ padding:"9px 18px", background:"white", border:`1px dashed ${T.border}`, color:T.textSub, width:"100%", fontSize:12 }} onClick={()=>setAdding(true)}>+ Agregar Lote</button>
        )}
      </div>
    </div>
  );
}

// ── Shared ────────────────────────────────────────────────────────────────────
function KPIBadge({ label, value, unit, s="neutral", sub }) {
  const color = SEM_C[s] || T.blue;
  const bg = SEM_BG[s] || T.blueLight;
  return (
    <div className="card" style={{ padding:"13px 15px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:color, opacity:0.7, borderRadius:"10px 10px 0 0" }} />
      <div style={{ fontSize:9.5, fontWeight:800, color:T.textMuted, letterSpacing:0.8, textTransform:"uppercase", marginBottom:8, marginTop:2 }}>{label}</div>
      <div style={{ fontSize:24, fontWeight:800, color:color, lineHeight:1, letterSpacing:-0.5 }}>{value}</div>
      <div style={{ fontSize:10, color:T.textMuted, marginTop:3, fontWeight:500 }}>{unit}</div>
      {sub && <div style={{ fontSize:10, color:T.textMuted, marginTop:7, borderTop:`1px solid ${T.borderLight}`, paddingTop:6 }}>{sub}</div>}
    </div>
  );
}

function ChartCard({ title, sub, children, style }) {
  return (
    <div className="card" style={{ padding:16, ...style }}>
      <div style={{ marginBottom:13 }}>
        <div style={{ fontSize:13, fontWeight:800, color:T.text }}>{title}</div>
        {sub && <div style={{ fontSize:10.5, color:T.textMuted, marginTop:2 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}
