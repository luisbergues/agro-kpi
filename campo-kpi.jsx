<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Campo KPI — Analytics</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌾</text></svg>" />
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/recharts/2.5.0/Recharts.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.2/babel.min.js"></script>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
html,body,#root{height:100%;font-family:'DM Sans',sans-serif;}
body{background:#F3F4F6;color:#111827;}
::-webkit-scrollbar{width:5px;height:5px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:4px;}
input,select,button{font-family:'DM Sans',sans-serif;}
</style>
</head>
<body>
<div id="root"></div>
<script type="text/babel">
const {
  useState, useEffect, useCallback, useMemo
} = React;

const {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis
} = Recharts;

// ─── THEME ───────────────────────────────────────────────────────────────────
const T = {
  bg:"#F3F4F6", sidebar:"#1C2333", surface:"#FFFFFF",
  border:"#E5E7EB", borderLight:"#F0F1F3",
  text:"#111827", textSub:"#6B7280", textMuted:"#9CA3AF",
  accent:"#F0A500",
  green:"#10B981", greenLight:"#D1FAE5",
  yellow:"#F59E0B", yellowLight:"#FEF3C7",
  red:"#EF4444",   redLight:"#FEE2E2",
  blue:"#3B82F6",  blueLight:"#DBEAFE",
  purple:"#8B5CF6",cyan:"#06B6D4",
};
const SEM_C  = {green:T.green, yellow:T.yellow, red:T.red, neutral:T.blue};
const SEM_BG = {green:T.greenLight, yellow:T.yellowLight, red:T.redLight, neutral:T.blueLight};
const SEM_L  = {green:"Óptimo", yellow:"Atención", red:"Crítico", neutral:""};

// ─── HISTORY DATA ────────────────────────────────────────────────────────────
function genHistory(months) {
  const now = new Date();
  return Array.from({length:months},(_,i)=>{
    const d = new Date(now.getFullYear(), now.getMonth()-(months-1-i), 1);
    const label = d.toLocaleDateString("es-AR",{month:"short",year:"2-digit"});
    const t = i/months;
    const r = ()=>1+(Math.random()-0.5)*0.12;
    return {
      label, month:i,
      kgCarneHa:     Math.round((70+t*40+(Math.random()-0.5)*15)*r()),
      cargaAnimal:   parseFloat((0.85+t*0.25+(Math.random()-0.5)*0.1).toFixed(2)),
      adg:           Math.round((520+t*120+(Math.random()-0.5)*80)*r()),
      tasaDestete:   parseFloat((62+t*12+(Math.random()-0.5)*5).toFixed(1)),
      mortalidad:    parseFloat((1.8-t*0.6+Math.random()*0.4).toFixed(2)),
      margenBrutoHa: Math.round((28+t*30+(Math.random()-0.5)*12)*r()),
      ingresoPorHa:  Math.round(155+t*15+(Math.random()-0.5)*10),
      vsMercado:     parseFloat((88+t*8+(Math.random()-0.5)*4).toFixed(1)),
      eficienciaCosecha: parseFloat((54+t*14+(Math.random()-0.5)*8).toFixed(1)),
      msProducida:   Math.round(7200+t*800+(Math.random()-0.5)*500),
      usdHaTotal:    Math.round((95+t*45+(Math.random()-0.5)*20)*r()),
    };
  });
}
const HISTORY = genHistory(12);

// ─── DEFAULT STATE ───────────────────────────────────────────────────────────
const DEFAULT = {
  config:{
    totalHa:500,
    lots:[
      {id:"l1",name:"Lote Norte",ha:150,use:"agricola",soil:"Franco arcilloso"},
      {id:"l2",name:"Lote Sur",ha:200,use:"ganadero",soil:"Franco arenoso"},
      {id:"l3",name:"Potrero Central",ha:150,use:"ganadero",soil:"Franco"},
    ],
  },
  agricola:{
    marketValueUSD_ha:180,
    contracts:[{
      id:"c1",lotId:"l1",priceUSD_ha:165,
      startDate:"2024-03-01",durationMonths:12,paymentType:"Anual",
      payments:[
        {id:"p1",date:"2024-03-01",amount:24750,status:"pagado"},
        {id:"p2",date:"2025-03-01",amount:24750,status:"pendiente"},
      ],
    }],
  },
  ganadero:{
    assignedHa:350,
    stock:[
      {id:"s1",category:"Vaca",   count:120,initialWeight:430,currentWeight:455,entryDate:"2024-07-01",ev:1.0},
      {id:"s2",category:"Novillo",count:80, initialWeight:280,currentWeight:340,entryDate:"2024-07-01",ev:0.85},
      {id:"s3",category:"Ternero",count:65, initialWeight:120,currentWeight:165,entryDate:"2024-10-01",ev:0.3},
      {id:"s4",category:"Toro",   count:5,  initialWeight:600,currentWeight:610,entryDate:"2024-07-01",ev:1.2},
    ],
    births:72, deaths:3, calvesWeaned:62, cowsBase:120,
    feedingCostUSD_ha:45, ingresos:16800,
  },
  pasturas:{
    lots:[
      {id:"ps1",lotId:"l2",MS_kg_ha:8500,occupationDays:7,restDays:45,consumedMS_kg_ha:6200},
      {id:"ps2",lotId:"l3",MS_kg_ha:7200,occupationDays:6,restDays:42,consumedMS_kg_ha:5100},
    ],
  },
};

const SK = "campokpi_v4";
const loadState = ()=>{ try{const s=localStorage.getItem(SK);return s?JSON.parse(s):DEFAULT;}catch{return DEFAULT;} };

// ─── KPI ENGINE ───────────────────────────────────────────────────────────────
function calcKPIs(st) {
  const {config,agricola,ganadero,pasturas} = st;
  const agLots = config.lots.filter(l=>l.use==="agricola");
  const agHa = agLots.reduce((s,l)=>s+l.ha,0);
  let agIngreso=0, agPendiente=0;
  agricola.contracts.forEach(c=>{
    const lot=config.lots.find(l=>l.id===c.lotId);
    if(lot) agIngreso+=c.priceUSD_ha*lot.ha;
    c.payments.forEach(p=>{if(p.status!=="pagado") agPendiente+=p.amount;});
  });
  const agPorHa = agHa>0?agIngreso/agHa:0;
  const agVsMercado = agricola.marketValueUSD_ha>0?(agPorHa/agricola.marketValueUSD_ha)*100:0;

  const gHa = ganadero.assignedHa||1;
  const totalEV = ganadero.stock.reduce((s,a)=>s+a.count*(a.ev||1),0);
  const cargaAnimal = totalEV/gHa;
  const stockWithADG = ganadero.stock.map(a=>{
    const days=Math.max(1,Math.round((Date.now()-new Date(a.entryDate).getTime())/86400000));
    return {...a, adg:(a.currentWeight-a.initialWeight)/days, days};
  });
  const totalAnimals = ganadero.stock.reduce((s,a)=>s+a.count,0);
  const avgADG = stockWithADG.reduce((s,a)=>s+a.adg*a.count,0)/Math.max(1,totalAnimals);
  const kgCarneHaAnio = gHa>0?stockWithADG.reduce((s,a)=>s+a.adg*a.count*a.days,0)/gHa:0;
  const tasaDestete = ganadero.cowsBase>0?(ganadero.calvesWeaned/ganadero.cowsBase)*100:0;
  const mortalidad = totalAnimals>0?(ganadero.deaths/totalAnimals)*100:0;
  const margenBrutoHa = gHa>0?(ganadero.ingresos-ganadero.feedingCostUSD_ha*gHa)/gHa:0;

  const pStats = pasturas.lots.map(pl=>({
    ...pl,
    eficiencia: pl.MS_kg_ha>0?(pl.consumedMS_kg_ha/pl.MS_kg_ha)*100:0,
    balance: pl.MS_kg_ha-pl.consumedMS_kg_ha,
    rotacion: pl.occupationDays+pl.restDays,
  }));
  const avgEficiencia = pStats.length>0?pStats.reduce((s,p)=>s+p.eficiencia,0)/pStats.length:0;
  const balanceTotal = pStats.reduce((s,p)=>s+p.balance*(config.lots.find(l=>l.id===p.lotId)?.ha||0),0);
  const usdHaTotal = config.totalHa>0?(agIngreso+ganadero.ingresos)/config.totalHa:0;

  return {
    ag:{ingresoTotal:agIngreso,ingresoPorHa:agPorHa,vsMercado:agVsMercado,haTotal:agHa,pagosPendientes:agPendiente},
    gan:{cargaAnimal,avgADG,kgCarneHaAnio,tasaDestete,mortalidad,margenBrutoHa,totalEV,stockWithADG,totalAnimals},
    past:{pStats,avgEficiencia,balanceTotal},
    global:{usdHaTotal,agIngreso,ganIngresos:ganadero.ingresos},
  };
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const f1=(n,d=1)=>(isNaN(n)||n==null)?"—":Number(n).toLocaleString("es-AR",{maximumFractionDigits:d,minimumFractionDigits:d});
const f0=n=>(isNaN(n)||n==null)?"—":Number(n).toLocaleString("es-AR",{maximumFractionDigits:0});
const sem=(v,g,y)=>v>=g?"green":v>=y?"yellow":"red";
const semInv=(v,g,y)=>v<=g?"green":v<=y?"yellow":"red";

const CustomTooltip=({active,payload,label,unit})=>{
  if(!active||!payload?.length) return null;
  return React.createElement("div",{style:{background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 14px",boxShadow:"0 8px 24px rgba(0,0,0,.12)"}},
    React.createElement("div",{style:{fontSize:10,color:T.textMuted,fontWeight:600,marginBottom:7}},label),
    payload.map((p,i)=>React.createElement("div",{key:i,style:{display:"flex",alignItems:"center",gap:8,fontSize:12,marginBottom:4}},
      React.createElement("span",{style:{width:8,height:8,borderRadius:2,background:p.color,display:"inline-block"}}),
      React.createElement("span",{style:{color:T.textSub,flex:1}},p.name,":"),
      React.createElement("span",{style:{fontWeight:700,color:T.text}},f1(p.value,1),unit?" "+unit:"")
    ))
  );
};

// ─── KPI BADGE ────────────────────────────────────────────────────────────────
function KPIBadge({label,value,unit,s="neutral",sub}){
  const color=SEM_C[s]||T.blue;
  return React.createElement("div",{style:{background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:"13px 15px",position:"relative",overflow:"hidden"}},
    React.createElement("div",{style:{position:"absolute",top:0,left:0,right:0,height:3,background:color,borderRadius:"10px 10px 0 0"}}),
    React.createElement("div",{style:{fontSize:9.5,fontWeight:800,color:T.textMuted,letterSpacing:0.8,textTransform:"uppercase",marginBottom:8,marginTop:2}},label),
    React.createElement("div",{style:{fontSize:24,fontWeight:800,color,lineHeight:1}},value),
    React.createElement("div",{style:{fontSize:10,color:T.textMuted,marginTop:3}},unit),
    sub&&React.createElement("div",{style:{fontSize:10,color:T.textMuted,marginTop:7,borderTop:`1px solid ${T.borderLight}`,paddingTop:6}},sub)
  );
}

// ─── CHART CARD ───────────────────────────────────────────────────────────────
function ChartCard({title,sub,children,style}){
  return React.createElement("div",{style:{background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:16,...style}},
    React.createElement("div",{style:{marginBottom:13}},
      React.createElement("div",{style:{fontSize:13,fontWeight:800,color:T.text}},title),
      sub&&React.createElement("div",{style:{fontSize:10.5,color:T.textMuted,marginTop:2}},sub)
    ),
    children
  );
}

// ─── INPUT ────────────────────────────────────────────────────────────────────
function Inp({label,type="number",value,onChange,placeholder}){
  return React.createElement("div",null,
    React.createElement("div",{style:{fontSize:9.5,color:T.textMuted,marginBottom:4,fontWeight:700,letterSpacing:0.5}},label.toUpperCase()),
    React.createElement("input",{type,value,onChange,placeholder,style:{background:"#F9FAFB",border:`1px solid ${T.border}`,borderRadius:6,padding:"7px 10px",fontSize:12.5,color:T.text,width:"100%"}})
  );
}

// ─── OVERVIEW ────────────────────────────────────────────────────────────────
function Overview({kpis,hist,state,alerts}){
  const {ag,gan,past,global}=kpis;
  const pieData=[
    {name:"Agrícola",value:ag.haTotal,color:T.green},
    {name:"Ganadero",value:state.config.lots.filter(l=>l.use==="ganadero").reduce((s,l)=>s+l.ha,0),color:T.yellow},
  ];
  return React.createElement("div",null,
    // Alerts
    alerts.length>0&&React.createElement("div",{style:{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14}},
      alerts.map((a,i)=>React.createElement("div",{key:i,style:{display:"flex",alignItems:"center",gap:8,padding:"7px 13px",borderRadius:6,background:a.type==="red"?T.redLight:T.yellowLight,border:`1px solid ${a.type==="red"?"#FECACA":"#FDE68A"}`,fontSize:11.5,color:a.type==="red"?"#991B1B":"#92400E",fontWeight:500}},
        a.type==="red"?"🔴":"🟡"," ",a.msg
      ))
    ),
    // KPI grid
    React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:10,marginBottom:14}},
      React.createElement(KPIBadge,{label:"USD/ha Total",value:f0(global.usdHaTotal),unit:"USD/ha",s:sem(global.usdHaTotal,130,90),sub:`Ag $${f0(ag.ingresoTotal)} · Gan $${f0(global.ganIngresos)}`}),
      React.createElement(KPIBadge,{label:"Kg Carne/ha/año",value:f0(gan.kgCarneHaAnio),unit:"kg/ha/año",s:sem(gan.kgCarneHaAnio,100,60),sub:`ADG ${f0(gan.avgADG*1000)} g/día`}),
      React.createElement(KPIBadge,{label:"Carga Animal",value:f1(gan.cargaAnimal,2),unit:"EV/ha",s:gan.cargaAnimal>1.2?"red":gan.cargaAnimal>1?"yellow":"green",sub:`${f0(gan.totalEV)} EV totales`}),
      React.createElement(KPIBadge,{label:"Tasa Destete",value:f1(gan.tasaDestete,0),unit:"%",s:sem(gan.tasaDestete,70,55),sub:`${state.ganadero.calvesWeaned} terneros`}),
      React.createElement(KPIBadge,{label:"Alquiler vs Mdo",value:f1(ag.vsMercado,0),unit:"%",s:sem(ag.vsMercado,90,80),sub:`$${f0(ag.ingresoPorHa)}/ha actual`}),
      React.createElement(KPIBadge,{label:"Efic. Pasturas",value:f1(past.avgEficiencia,0),unit:"%",s:sem(past.avgEficiencia,65,50),sub:`Balance ${f0(past.balanceTotal)} kg MS`}),
    ),
    // Charts row 1
    React.createElement("div",{style:{display:"grid",gridTemplateColumns:"2fr 1fr",gap:10,marginBottom:10}},
      React.createElement(ChartCard,{title:"USD/ha — Evolución Global",sub:"Ingreso combinado por hectárea"},
        React.createElement(ResponsiveContainer,{width:"100%",height:195},
          React.createElement(AreaChart,{data:hist},
            React.createElement("defs",null,React.createElement("linearGradient",{id:"gUsd",x1:"0",y1:"0",x2:"0",y2:"1"},React.createElement("stop",{offset:"5%",stopColor:T.accent,stopOpacity:0.22}),React.createElement("stop",{offset:"95%",stopColor:T.accent,stopOpacity:0}))),
            React.createElement(CartesianGrid,{strokeDasharray:"3 3",stroke:T.borderLight}),
            React.createElement(XAxis,{dataKey:"label",tick:{fontSize:10,fill:T.textMuted},tickLine:false,axisLine:false}),
            React.createElement(YAxis,{tick:{fontSize:10,fill:T.textMuted},tickLine:false,axisLine:false,width:36}),
            React.createElement(Tooltip,{content:React.createElement(CustomTooltip,{unit:"USD/ha"})}),
            React.createElement(Area,{type:"monotone",dataKey:"usdHaTotal",name:"USD/ha",stroke:T.accent,fill:"url(#gUsd)",strokeWidth:2.5,dot:false})
          )
        )
      ),
      React.createElement(ChartCard,{title:"Uso del Campo",sub:"Distribución por actividad"},
        React.createElement(ResponsiveContainer,{width:"100%",height:195},
          React.createElement(PieChart,null,
            React.createElement(Pie,{data:pieData,cx:"50%",cy:"44%",innerRadius:48,outerRadius:72,paddingAngle:4,dataKey:"value"},
              pieData.map((e,i)=>React.createElement(Cell,{key:i,fill:e.color}))
            ),
            React.createElement(Tooltip,{formatter:(v)=>[`${v} ha`,""]}),
            React.createElement(Legend,{iconSize:8,wrapperStyle:{fontSize:11}})
          )
        )
      )
    ),
    // Charts row 2
    React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}},
      React.createElement(ChartCard,{title:"Producción Ganadera",sub:"Kg/ha y ADG mensual"},
        React.createElement(ResponsiveContainer,{width:"100%",height:175},
          React.createElement(ComposedChart,{data:hist},
            React.createElement(CartesianGrid,{strokeDasharray:"3 3",stroke:T.borderLight}),
            React.createElement(XAxis,{dataKey:"label",tick:{fontSize:10,fill:T.textMuted},tickLine:false,axisLine:false}),
            React.createElement(YAxis,{yAxisId:"l",tick:{fontSize:10,fill:T.textMuted},tickLine:false,axisLine:false,width:32}),
            React.createElement(YAxis,{yAxisId:"r",orientation:"right",tick:{fontSize:10,fill:T.textMuted},tickLine:false,axisLine:false,width:36}),
            React.createElement(Tooltip,{content:React.createElement(CustomTooltip,null)}),
            React.createElement(Legend,{iconSize:8,wrapperStyle:{fontSize:10}}),
            React.createElement(Bar,{yAxisId:"l",dataKey:"kgCarneHa",name:"Kg/ha",fill:T.green,opacity:0.8,radius:[2,2,0,0]}),
            React.createElement(Line,{yAxisId:"r",type:"monotone",dataKey:"adg",name:"ADG (g)",stroke:T.blue,strokeWidth:2,dot:false})
          )
        )
      ),
      React.createElement(ChartCard,{title:"Carga Animal vs Eficiencia",sub:"EV/ha y % cosecha"},
        React.createElement(ResponsiveContainer,{width:"100%",height:175},
          React.createElement(ComposedChart,{data:hist},
            React.createElement(CartesianGrid,{strokeDasharray:"3 3",stroke:T.borderLight}),
            React.createElement(XAxis,{dataKey:"label",tick:{fontSize:10,fill:T.textMuted},tickLine:false,axisLine:false}),
            React.createElement(YAxis,{yAxisId:"l",tick:{fontSize:10,fill:T.textMuted},tickLine:false,axisLine:false,width:32}),
            React.createElement(YAxis,{yAxisId:"r",orientation:"right",tick:{fontSize:10,fill:T.textMuted},tickLine:false,axisLine:false,width:32}),
            React.createElement(Tooltip,{content:React.createElement(CustomTooltip,null)}),
            React.createElement(Legend,{iconSize:8,wrapperStyle:{fontSize:10}}),
            React.createElement(ReferenceLine,{yAxisId:"l",y:1.2,stroke:T.red,strokeDasharray:"4 3",label:{value:"Límite",fontSize:9,fill:T.red,position:"right"}}),
            React.createElement(Line,{yAxisId:"l",type:"monotone",dataKey:"cargaAnimal",name:"Carga EV/ha",stroke:T.yellow,strokeWidth:2,dot:false}),
            React.createElement(Area,{yAxisId:"r",type:"monotone",dataKey:"eficienciaCosecha",name:"Efic. %",fill:T.greenLight,stroke:T.green,strokeWidth:1.5,dot:false})
          )
        )
      )
    ),
    // Stock table
    React.createElement(ChartCard,{title:"Stock por Categoría"},
      React.createElement("div",{style:{overflowX:"auto"}},
        React.createElement("table",{style:{width:"100%",borderCollapse:"collapse",fontSize:12.5}},
          React.createElement("thead",null,
            React.createElement("tr",{style:{background:T.bg}},
              ["Categoría","Cabezas","Peso ini","Peso act","ADG","EV Total","Estado"].map(h=>
                React.createElement("th",{key:h,style:{padding:"9px 12px",textAlign:"left",fontSize:10,color:T.textMuted,fontWeight:800,letterSpacing:0.8,textTransform:"uppercase"}},h)
              )
            )
          ),
          React.createElement("tbody",null,
            kpis.gan.stockWithADG.map(a=>{
              const adgG=a.adg*1000; const s=sem(adgG,700,450);
              return React.createElement("tr",{key:a.id,style:{borderBottom:`1px solid ${T.borderLight}`}},
                React.createElement("td",{style:{padding:"9px 12px",fontWeight:700}},a.category),
                React.createElement("td",{style:{padding:"9px 12px"}},a.count),
                React.createElement("td",{style:{padding:"9px 12px",color:T.textSub}},a.initialWeight," kg"),
                React.createElement("td",{style:{padding:"9px 12px",fontWeight:600}},a.currentWeight," kg"),
                React.createElement("td",{style:{padding:"9px 12px"}},React.createElement("span",{style:{display:"inline-flex",padding:"3px 9px",borderRadius:20,fontSize:10.5,fontWeight:700,background:SEM_BG[s],color:SEM_C[s]}},f0(adgG)," g/d")),
                React.createElement("td",{style:{padding:"9px 12px"}},f1(a.count*a.ev,1)),
                React.createElement("td",{style:{padding:"9px 12px"}},React.createElement("span",{style:{display:"inline-flex",padding:"3px 9px",borderRadius:20,fontSize:10.5,fontWeight:700,background:SEM_BG[s],color:SEM_C[s]}},SEM_L[s]))
              );
            })
          )
        )
      )
    )
  );
}

// ─── GANADERO ─────────────────────────────────────────────────────────────────
function GanaderoPage({kpis,hist,state,setState,update}){
  const EV={Vaca:1.0,Novillo:0.85,Vaquillona:0.9,Ternero:0.3,Toro:1.2,Otro:0.8};
  const updStock=(i,f,v)=>setState(prev=>{const n=JSON.parse(JSON.stringify(prev));n.ganadero.stock[i][f]=["count","initialWeight","currentWeight"].includes(f)?(parseFloat(v)||0):v;return n;});
  const radarData=[
    {m:"Destete",v:Math.min(100,kpis.tasaDestete)},
    {m:"ADG",v:Math.min(100,(kpis.avgADG*1000/900)*100)},
    {m:"Kg/ha",v:Math.min(100,(kpis.kgCarneHaAnio/150)*100)},
    {m:"Margen",v:Math.min(100,(kpis.margenBrutoHa/100)*100)},
    {m:"Sanidad",v:Math.min(100,(1-(kpis.mortalidad/5))*100)},
    {m:"Carga",v:Math.max(0,Math.min(100,(1.5-kpis.cargaAnimal)/1.5*100))},
  ];
  return React.createElement("div",null,
    React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:10,marginBottom:14}},
      React.createElement(KPIBadge,{label:"Carga Animal",value:f1(kpis.cargaAnimal,2),unit:"EV/ha",s:kpis.cargaAnimal>1.2?"red":kpis.cargaAnimal>1?"yellow":"green"}),
      React.createElement(KPIBadge,{label:"Kg Carne/ha",value:f0(kpis.kgCarneHaAnio),unit:"kg/ha/año",s:sem(kpis.kgCarneHaAnio,100,60)}),
      React.createElement(KPIBadge,{label:"ADG Promedio",value:f0(kpis.avgADG*1000),unit:"g/animal/día",s:sem(kpis.avgADG*1000,700,450)}),
      React.createElement(KPIBadge,{label:"Tasa Destete",value:f1(kpis.tasaDestete,1),unit:"%",s:sem(kpis.tasaDestete,70,55)}),
      React.createElement(KPIBadge,{label:"Mortalidad",value:f1(kpis.mortalidad,2),unit:"%",s:semInv(kpis.mortalidad,1,2)}),
      React.createElement(KPIBadge,{label:"Margen/ha",value:f0(kpis.margenBrutoHa),unit:"USD/ha",s:sem(kpis.margenBrutoHa,50,20)}),
    ),
    React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}},
      React.createElement(ChartCard,{title:"ADG y Kg Carne — Tendencia",sub:"Evolución mensual"},
        React.createElement(ResponsiveContainer,{width:"100%",height:195},
          React.createElement(ComposedChart,{data:hist},
            React.createElement(CartesianGrid,{strokeDasharray:"3 3",stroke:T.borderLight}),
            React.createElement(XAxis,{dataKey:"label",tick:{fontSize:10,fill:T.textMuted},tickLine:false,axisLine:false}),
            React.createElement(YAxis,{yAxisId:"l",tick:{fontSize:10,fill:T.textMuted},tickLine:false,axisLine:false,width:32}),
            React.createElement(YAxis,{yAxisId:"r",orientation:"right",tick:{fontSize:10,fill:T.textMuted},tickLine:false,axisLine:false,width:38}),
            React.createElement(Tooltip,{content:React.createElement(CustomTooltip,null)}),
            React.createElement(Legend,{iconSize:8,wrapperStyle:{fontSize:10}}),
            React.createElement(Bar,{yAxisId:"l",dataKey:"kgCarneHa",name:"Kg/ha",fill:T.green,opacity:0.75,radius:[2,2,0,0]}),
            React.createElement(Line,{yAxisId:"r",type:"monotone",dataKey:"adg",name:"ADG g",stroke:T.blue,strokeWidth:2,dot:false})
          )
        )
      ),
      React.createElement(ChartCard,{title:"Perfil Productivo",sub:"% del benchmark óptimo"},
        React.createElement(ResponsiveContainer,{width:"100%",height:195},
          React.createElement(RadarChart,{data:radarData,cx:"50%",cy:"50%"},
            React.createElement(PolarGrid,{stroke:T.border}),
            React.createElement(PolarAngleAxis,{dataKey:"m",tick:{fontSize:10,fill:T.textSub}}),
            React.createElement(Radar,{name:"Actual",dataKey:"v",stroke:T.accent,fill:T.accent,fillOpacity:0.18,strokeWidth:2})
          )
        )
      )
    ),
    React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}},
      React.createElement(ChartCard,{title:"Carga Animal",sub:"EV/ha con líneas límite"},
        React.createElement(ResponsiveContainer,{width:"100%",height:155},
          React.createElement(AreaChart,{data:hist},
            React.createElement("defs",null,React.createElement("linearGradient",{id:"gCA",x1:"0",y1:"0",x2:"0",y2:"1"},React.createElement("stop",{offset:"5%",stopColor:T.yellow,stopOpacity:0.3}),React.createElement("stop",{offset:"95%",stopColor:T.yellow,stopOpacity:0}))),
            React.createElement(CartesianGrid,{strokeDasharray:"3 3",stroke:T.borderLight}),
            React.createElement(XAxis,{dataKey:"label",tick:{fontSize:10,fill:T.textMuted},tickLine:false,axisLine:false}),
            React.createElement(YAxis,{tick:{fontSize:10,fill:T.textMuted},tickLine:false,axisLine:false,width:32,domain:[0,1.7]}),
            React.createElement(Tooltip,{content:React.createElement(CustomTooltip,{unit:"EV/ha"})}),
            React.createElement(ReferenceLine,{y:1.2,stroke:T.red,strokeDasharray:"4 3",label:{value:"Crítico",fontSize:9,fill:T.red,position:"insideTopRight"}}),
            React.createElement(ReferenceLine,{y:1.0,stroke:T.yellow,strokeDasharray:"4 3"}),
            React.createElement(Area,{type:"monotone",dataKey:"cargaAnimal",name:"EV/ha",stroke:T.yellow,fill:"url(#gCA)",strokeWidth:2,dot:false})
          )
        )
      ),
      React.createElement(ChartCard,{title:"Destete y Mortalidad",sub:"Indicadores sanitarios"},
        React.createElement(ResponsiveContainer,{width:"100%",height:155},
          React.createElement(ComposedChart,{data:hist},
            React.createElement(CartesianGrid,{strokeDasharray:"3 3",stroke:T.borderLight}),
            React.createElement(XAxis,{dataKey:"label",tick:{fontSize:10,fill:T.textMuted},tickLine:false,axisLine:false}),
            React.createElement(YAxis,{yAxisId:"l",tick:{fontSize:10,fill:T.textMuted},tickLine:false,axisLine:false,width:28}),
            React.createElement(YAxis,{yAxisId:"r",orientation:"right",tick:{fontSize:10,fill:T.textMuted},tickLine:false,axisLine:false,width:28}),
            React.createElement(Tooltip,{content:React.createElement(CustomTooltip,null)}),
            React.createElement(Legend,{iconSize:8,wrapperStyle:{fontSize:10}}),
            React.createElement(Line,{yAxisId:"l",type:"monotone",dataKey:"tasaDestete",name:"Destete %",stroke:T.green,strokeWidth:2,dot:false}),
            React.createElement(Bar,{yAxisId:"r",dataKey:"mortalidad",name:"Mort. %",fill:T.red,opacity:0.7,radius:[2,2,0,0]})
          )
        )
      )
    ),
    // Inputs
    React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}},
      React.createElement("div",{style:{background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:16}},
        React.createElement("div",{style:{fontSize:10,fontWeight:800,color:T.textMuted,letterSpacing:1.2,textTransform:"uppercase",marginBottom:11}},"Parámetros del Rodeo"),
        React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}},
          [["Ha asignadas","ganadero.assignedHa"],["Vacas base","ganadero.cowsBase"],["Terneros destetados","ganadero.calvesWeaned"],["Nacimientos","ganadero.births"],["Muertes","ganadero.deaths"],["Costo alim USD/ha","ganadero.feedingCostUSD_ha"]].map(([lb,path])=>
            React.createElement(Inp,{key:path,label:lb,value:path.split(".").reduce((o,k)=>o[k],state),onChange:e=>update(path,parseFloat(e.target.value)||0)})
          )
        ),
        React.createElement("div",{style:{marginTop:9}},
          React.createElement(Inp,{label:"Ingresos ventas (USD)",value:state.ganadero.ingresos,onChange:e=>update("ganadero.ingresos",parseFloat(e.target.value)||0)})
        )
      ),
      React.createElement("div",{style:{background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:16}},
        React.createElement("div",{style:{fontSize:10,fontWeight:800,color:T.textMuted,letterSpacing:1.2,textTransform:"uppercase",marginBottom:11}},"Stock por Categoría"),
        kpis.stockWithADG.map((a,i)=>
          React.createElement("div",{key:a.id,style:{display:"grid",gridTemplateColumns:"1fr 48px 48px 48px",gap:5,marginBottom:8,alignItems:"end"}},
            React.createElement("div",null,
              React.createElement("div",{style:{fontSize:9,color:T.textMuted,marginBottom:3,fontWeight:700}},"CATEGORÍA"),
              React.createElement("select",{style:{background:"#F9FAFB",border:`1px solid ${T.border}`,borderRadius:6,padding:"6px 8px",fontSize:12,color:T.text,width:"100%"},value:a.category,onChange:e=>{updStock(i,"category",e.target.value);updStock(i,"ev",EV[e.target.value]||0.8);}},
                Object.keys(EV).map(k=>React.createElement("option",{key:k},k))
              )
            ),
            ...["count","initialWeight","currentWeight"].map((fd,fi)=>
              React.createElement("div",{key:fd},
                React.createElement("div",{style:{fontSize:9,color:T.textMuted,marginBottom:3,fontWeight:700}},["Cab","Kg0","Kgf"][fi]),
                React.createElement("input",{type:"number",value:a[fd],onChange:e=>updStock(i,fd,e.target.value),style:{background:"#F9FAFB",border:`1px solid ${T.border}`,borderRadius:6,padding:"6px 5px",fontSize:11,color:T.text,width:"100%"}})
              )
            )
          )
        ),
        React.createElement("button",{onClick:()=>setState(prev=>({...prev,ganadero:{...prev.ganadero,stock:[...prev.ganadero.stock,{id:`s${Date.now()}`,category:"Novillo",count:0,initialWeight:0,currentWeight:0,entryDate:new Date().toISOString().split("T")[0],ev:0.85}]}})),style:{width:"100%",padding:"8px",background:T.bg,border:`1px dashed ${T.border}`,borderRadius:6,color:T.textSub,cursor:"pointer",fontSize:11.5,marginTop:4}},"+ Agregar categoría")
      )
    )
  );
}

// ─── AGRÍCOLA ─────────────────────────────────────────────────────────────────
function AgricolaPage({kpis,hist,state,setState,update}){
  const togglePay=(ci,pi)=>setState(prev=>{const n=JSON.parse(JSON.stringify(prev));const p=n.agricola.contracts[ci].payments[pi];p.status=p.status==="pagado"?"pendiente":"pagado";return n;});
  const compData=[{name:"Precio actual",value:kpis.ingresoPorHa},{name:"Valor mercado",value:state.agricola.marketValueUSD_ha}];
  return React.createElement("div",null,
    React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:10,marginBottom:14}},
      React.createElement(KPIBadge,{label:"Ingreso/ha",value:f0(kpis.ingresoPorHa),unit:"USD/ha",s:sem(kpis.ingresoPorHa,150,100)}),
      React.createElement(KPIBadge,{label:"vs Mercado",value:f1(kpis.vsMercado,1),unit:"%",s:sem(kpis.vsMercado,90,80)}),
      React.createElement(KPIBadge,{label:"Ingreso Total",value:`$${f0(kpis.ingresoTotal)}`,unit:"USD",s:"neutral"}),
      React.createElement(KPIBadge,{label:"Pagos Pendientes",value:`$${f0(kpis.pagosPendientes)}`,unit:"USD",s:kpis.pagosPendientes>0?"red":"green"}),
    ),
    React.createElement("div",{style:{display:"grid",gridTemplateColumns:"2fr 1fr",gap:10,marginBottom:10}},
      React.createElement(ChartCard,{title:"Ingreso por ha — Tendencia",sub:"USD/ha con referencia de mercado"},
        React.createElement(ResponsiveContainer,{width:"100%",height:195},
          React.createElement(ComposedChart,{data:hist},
            React.createElement(CartesianGrid,{strokeDasharray:"3 3",stroke:T.borderLight}),
            React.createElement(XAxis,{dataKey:"label",tick:{fontSize:10,fill:T.textMuted},tickLine:false,axisLine:false}),
            React.createElement(YAxis,{yAxisId:"l",tick:{fontSize:10,fill:T.textMuted},tickLine:false,axisLine:false,width:34}),
            React.createElement(YAxis,{yAxisId:"r",orientation:"right",tick:{fontSize:10,fill:T.textMuted},tickLine:false,axisLine:false,width:30}),
            React.createElement(Tooltip,{content:React.createElement(CustomTooltip,null)}),
            React.createElement(Legend,{iconSize:8,wrapperStyle:{fontSize:10}}),
            React.createElement(ReferenceLine,{yAxisId:"l",y:state.agricola.marketValueUSD_ha,stroke:T.red,strokeDasharray:"4 3",label:{value:"Mercado",fontSize:9,fill:T.red,position:"right"}}),
            React.createElement(Bar,{yAxisId:"l",dataKey:"ingresoPorHa",name:"USD/ha",fill:T.blue,opacity:0.8,radius:[3,3,0,0]}),
            React.createElement(Line,{yAxisId:"r",type:"monotone",dataKey:"vsMercado",name:"% vs Mdo",stroke:T.accent,strokeWidth:2,dot:false})
          )
        )
      ),
      React.createElement(ChartCard,{title:"Precio vs Mercado",sub:"Comparación actual"},
        React.createElement(ResponsiveContainer,{width:"100%",height:195},
          React.createElement(BarChart,{data:compData,layout:"vertical"},
            React.createElement(CartesianGrid,{strokeDasharray:"3 3",stroke:T.borderLight,horizontal:false}),
            React.createElement(XAxis,{type:"number",tick:{fontSize:10,fill:T.textMuted},tickLine:false,axisLine:false}),
            React.createElement(YAxis,{type:"category",dataKey:"name",tick:{fontSize:10.5,fill:T.textSub},width:95,tickLine:false,axisLine:false}),
            React.createElement(Tooltip,{formatter:v=>[`USD ${f0(v)}/ha`]}),
            React.createElement(Bar,{dataKey:"value",radius:[0,5,5,0]},
              compData.map((_,i)=>React.createElement(Cell,{key:i,fill:[T.blue,T.textMuted][i]}))
            )
          )
        )
      )
    ),
    state.agricola.contracts.map((c,ci)=>{
      const lot=state.config.lots.find(l=>l.id===c.lotId);
      return React.createElement("div",{key:c.id,style:{background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:16,marginBottom:10}},
        React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}},
          React.createElement("div",null,
            React.createElement("div",{style:{fontWeight:800,fontSize:14}},"Contrato — ",lot?.name),
            React.createElement("div",{style:{fontSize:11,color:T.textMuted,marginTop:2}},c.startDate," · ",c.durationMonths," meses · ",c.paymentType)
          ),
          React.createElement("span",{style:{display:"inline-flex",padding:"3px 9px",borderRadius:20,fontSize:10.5,fontWeight:700,background:T.blueLight,color:T.blue}},"USD ",f0(c.priceUSD_ha*(lot?.ha||0))," total")
        ),
        React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}},
          React.createElement(Inp,{label:"Precio (USD/ha)",value:c.priceUSD_ha,onChange:e=>setState(prev=>{const n=JSON.parse(JSON.stringify(prev));n.agricola.contracts[ci].priceUSD_ha=parseFloat(e.target.value)||0;return n;})}),
          React.createElement(Inp,{label:"Valor mercado ref.",value:state.agricola.marketValueUSD_ha,onChange:e=>update("agricola.marketValueUSD_ha",parseFloat(e.target.value)||0)})
        ),
        React.createElement("div",{style:{fontSize:10,color:T.textMuted,fontWeight:800,letterSpacing:0.8,marginBottom:8}},"ESTADO DE PAGOS"),
        c.payments.map((p,pi)=>
          React.createElement("div",{key:p.id,style:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${T.borderLight}`}},
            React.createElement("div",null,
              React.createElement("div",{style:{fontSize:13,fontWeight:500}},p.date),
              React.createElement("div",{style:{fontSize:11,color:T.textMuted}},"USD ",f0(p.amount))
            ),
            React.createElement("button",{onClick:()=>togglePay(ci,pi),style:{display:"inline-flex",padding:"4px 12px",borderRadius:20,fontSize:10.5,fontWeight:700,background:p.status==="pagado"?T.greenLight:T.redLight,color:p.status==="pagado"?T.green:T.red,border:"none",cursor:"pointer"}},
              p.status==="pagado"?"✓ PAGADO":"PENDIENTE"
            )
          )
        )
      );
    })
  );
}

// ─── PASTURAS ─────────────────────────────────────────────────────────────────
function PasturasPage({kpis,hist,state,setState}){
  const updP=(i,f,v)=>setState(prev=>{const n=JSON.parse(JSON.stringify(prev));n.pasturas.lots[i][f]=parseFloat(v)||0;return n;});
  const msData=hist.map(h=>({...h,msConsumo:Math.round(h.msProducida*(h.eficienciaCosecha/100))}));
  return React.createElement("div",null,
    React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:10,marginBottom:14}},
      React.createElement(KPIBadge,{label:"Efic. Cosecha",value:f1(kpis.avgEficiencia,1),unit:"%",s:sem(kpis.avgEficiencia,65,50)}),
      React.createElement(KPIBadge,{label:"Balance Forrajero",value:f0(kpis.balanceTotal),unit:"kg MS",s:kpis.balanceTotal>=0?"green":"red"}),
    ),
    React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}},
      React.createElement(ChartCard,{title:"Producción vs Consumo MS",sub:"kg materia seca / ha"},
        React.createElement(ResponsiveContainer,{width:"100%",height:195},
          React.createElement(ComposedChart,{data:msData},
            React.createElement(CartesianGrid,{strokeDasharray:"3 3",stroke:T.borderLight}),
            React.createElement(XAxis,{dataKey:"label",tick:{fontSize:10,fill:T.textMuted},tickLine:false,axisLine:false}),
            React.createElement(YAxis,{tick:{fontSize:10,fill:T.textMuted},tickLine:false,axisLine:false,width:42}),
            React.createElement(Tooltip,{content:React.createElement(CustomTooltip,{unit:"kg/ha"})}),
            React.createElement(Legend,{iconSize:8,wrapperStyle:{fontSize:10}}),
            React.createElement(Bar,{dataKey:"msProducida",name:"Producida",fill:T.green,opacity:0.45,radius:[2,2,0,0]}),
            React.createElement(Bar,{dataKey:"msConsumo",name:"Consumida",fill:T.blue,opacity:0.85,radius:[2,2,0,0]})
          )
        )
      ),
      React.createElement(ChartCard,{title:"Eficiencia de Cosecha",sub:"% MS aprovechada"},
        React.createElement(ResponsiveContainer,{width:"100%",height:195},
          React.createElement(AreaChart,{data:hist},
            React.createElement("defs",null,React.createElement("linearGradient",{id:"gEfic",x1:"0",y1:"0",x2:"0",y2:"1"},React.createElement("stop",{offset:"5%",stopColor:T.green,stopOpacity:0.25}),React.createElement("stop",{offset:"95%",stopColor:T.green,stopOpacity:0}))),
            React.createElement(CartesianGrid,{strokeDasharray:"3 3",stroke:T.borderLight}),
            React.createElement(XAxis,{dataKey:"label",tick:{fontSize:10,fill:T.textMuted},tickLine:false,axisLine:false}),
            React.createElement(YAxis,{tick:{fontSize:10,fill:T.textMuted},tickLine:false,axisLine:false,width:30,domain:[0,100]}),
            React.createElement(Tooltip,{content:React.createElement(CustomTooltip,{unit:"%"})}),
            React.createElement(ReferenceLine,{y:65,stroke:T.green,strokeDasharray:"4 3",label:{value:"Óptimo",fontSize:9,fill:T.green,position:"right"}}),
            React.createElement(ReferenceLine,{y:50,stroke:T.yellow,strokeDasharray:"4 3"}),
            React.createElement(Area,{type:"monotone",dataKey:"eficienciaCosecha",name:"Eficiencia %",stroke:T.green,fill:"url(#gEfic)",strokeWidth:2,dot:false})
          )
        )
      )
    ),
    kpis.pStats.map((ps,i)=>{
      const lot=state.config.lots.find(l=>l.id===ps.lotId);
      const es=sem(ps.eficiencia,65,50);
      return React.createElement("div",{key:ps.id,style:{background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:16,marginBottom:10}},
        React.createElement("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:14}},
          React.createElement("div",{style:{fontWeight:800,fontSize:14}},lot?.name||"Lote"," · ",lot?.ha," ha"),
          React.createElement("span",{style:{display:"inline-flex",padding:"3px 9px",borderRadius:20,fontSize:10.5,fontWeight:700,background:SEM_BG[es],color:SEM_C[es]}},"Efic. ",f1(ps.eficiencia,0),"%")
        ),
        React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:9,marginBottom:14}},
          [["MS producida (kg/ha)","MS_kg_ha"],["MS consumida (kg/ha)","consumedMS_kg_ha"],["Días ocupación","occupationDays"],["Días descanso","restDays"]].map(([lb,fd])=>
            React.createElement(Inp,{key:fd,label:lb,value:ps[fd],onChange:e=>updP(i,fd,e.target.value)})
          )
        ),
        React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}},
          [["Eficiencia",f1(ps.eficiencia,1)+"%",es],["Balance",(ps.balance>=0?"+":"")+f0(ps.balance)+" kg MS/ha",ps.balance>=0?"green":"red"],["Rotación",ps.rotacion+" días","neutral"]].map(([lb,val,s])=>
            React.createElement("div",{key:lb,style:{background:T.bg,borderRadius:7,padding:"10px 12px"}},
              React.createElement("div",{style:{fontSize:9.5,color:T.textMuted,marginBottom:3,fontWeight:700}},lb.toUpperCase()),
              React.createElement("div",{style:{fontWeight:800,fontSize:15,color:s==="neutral"?T.text:SEM_C[s]}},val)
            )
          )
        )
      );
    })
  );
}

// ─── HISTÓRICO ────────────────────────────────────────────────────────────────
function HistoricoPage({hist}){
  const allKPIs=[
    {key:"usdHaTotal",   label:"USD/ha Total",    color:T.accent,  unit:"USD/ha"},
    {key:"kgCarneHa",    label:"Kg Carne/ha",     color:T.green,   unit:"kg/ha"},
    {key:"cargaAnimal",  label:"Carga Animal",    color:T.yellow,  unit:"EV/ha"},
    {key:"adg",          label:"ADG",             color:T.blue,    unit:"g/día"},
    {key:"tasaDestete",  label:"Tasa Destete",    color:T.purple,  unit:"%"},
    {key:"mortalidad",   label:"Mortalidad",      color:T.red,     unit:"%"},
    {key:"eficienciaCosecha",label:"Efic. Pasturas",color:T.cyan,  unit:"%"},
    {key:"ingresoPorHa", label:"Ingreso Ag/ha",   color:"#6366F1", unit:"USD/ha"},
    {key:"margenBrutoHa",label:"Margen Bruto/ha", color:"#EC4899", unit:"USD/ha"},
  ];
  const [active,setActive]=useState(["usdHaTotal","kgCarneHa","cargaAnimal"]);
  const toggle=k=>setActive(p=>p.includes(k)?p.filter(x=>x!==k):[...p,k]);

  const summaryData=allKPIs.filter(k=>active.includes(k.key)).map(k=>{
    const vals=hist.map(h=>h[k.key]).filter(v=>v!=null);
    const avg=vals.reduce((a,b)=>a+b,0)/vals.length;
    const trend=vals.length>1?((vals[vals.length-1]-vals[0])/vals[0]*100):0;
    return {...k,avg,min:Math.min(...vals),max:Math.max(...vals),trend,last:vals[vals.length-1]};
  });

  return React.createElement("div",null,
    // Selector
    React.createElement("div",{style:{background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:14,marginBottom:14}},
      React.createElement("div",{style:{fontSize:10,fontWeight:800,color:T.textMuted,letterSpacing:1.2,textTransform:"uppercase",marginBottom:10}},"Seleccionar KPIs"),
      React.createElement("div",{style:{display:"flex",flexWrap:"wrap",gap:7}},
        allKPIs.map(k=>React.createElement("button",{key:k.key,onClick:()=>toggle(k.key),style:{padding:"6px 13px",fontSize:11.5,fontWeight:700,borderRadius:6,cursor:"pointer",background:active.includes(k.key)?k.color:"white",color:active.includes(k.key)?"white":T.textSub,border:`1px solid ${active.includes(k.key)?k.color:T.border}`}},k.label))
      )
    ),
    // Main chart
    React.createElement(ChartCard,{title:"Evolución Histórica Comparativa",sub:`${hist.length} meses · ${active.length} KPIs`,style:{marginBottom:10}},
      React.createElement(ResponsiveContainer,{width:"100%",height:280},
        React.createElement(LineChart,{data:hist},
          React.createElement(CartesianGrid,{strokeDasharray:"3 3",stroke:T.borderLight}),
          React.createElement(XAxis,{dataKey:"label",tick:{fontSize:10,fill:T.textMuted},tickLine:false,axisLine:false}),
          React.createElement(YAxis,{tick:{fontSize:10,fill:T.textMuted},tickLine:false,axisLine:false,width:36}),
          React.createElement(Tooltip,{content:React.createElement(CustomTooltip,null)}),
          React.createElement(Legend,{iconSize:8,wrapperStyle:{fontSize:10.5}}),
          ...allKPIs.filter(k=>active.includes(k.key)).map(k=>
            React.createElement(Line,{key:k.key,type:"monotone",dataKey:k.key,name:k.label,stroke:k.color,strokeWidth:2,dot:false})
          )
        )
      )
    ),
    // Stats table
    summaryData.length>0&&React.createElement("div",{style:{background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,marginBottom:14,overflow:"hidden"}},
      React.createElement("div",{style:{padding:"13px 16px",borderBottom:`1px solid ${T.border}`}},
        React.createElement("div",{style:{fontWeight:800,fontSize:13}},"Resumen Estadístico"),
        React.createElement("div",{style:{fontSize:11,color:T.textMuted}},hist.length," meses de datos")
      ),
      React.createElement("div",{style:{overflowX:"auto"}},
        React.createElement("table",{style:{width:"100%",borderCollapse:"collapse",fontSize:12.5}},
          React.createElement("thead",null,React.createElement("tr",{style:{background:T.bg}},
            ["KPI","Último","Promedio","Mín","Máx","Tendencia"].map(h=>React.createElement("th",{key:h,style:{padding:"9px 12px",textAlign:"left",fontSize:10,color:T.textMuted,fontWeight:800,letterSpacing:0.8,textTransform:"uppercase"}},h))
          )),
          React.createElement("tbody",null,
            summaryData.map(k=>React.createElement("tr",{key:k.key,style:{borderTop:`1px solid ${T.borderLight}`}},
              React.createElement("td",{style:{padding:"9px 12px"}},React.createElement("div",{style:{display:"flex",alignItems:"center",gap:8}},React.createElement("span",{style:{width:10,height:10,borderRadius:2,background:k.color,display:"inline-block"}}),React.createElement("span",{style:{fontWeight:700}},k.label))),
              React.createElement("td",{style:{padding:"9px 12px",fontWeight:700}},f1(k.last,1)," ",React.createElement("span",{style:{fontSize:10,color:T.textMuted}},k.unit)),
              React.createElement("td",{style:{padding:"9px 12px",color:T.textSub}},f1(k.avg,1)),
              React.createElement("td",{style:{padding:"9px 12px",color:T.red}},f1(k.min,1)),
              React.createElement("td",{style:{padding:"9px 12px",color:T.green}},f1(k.max,1)),
              React.createElement("td",{style:{padding:"9px 12px"}},React.createElement("span",{style:{display:"inline-flex",padding:"3px 9px",borderRadius:20,fontSize:10.5,fontWeight:700,background:k.trend>=0?T.greenLight:T.redLight,color:k.trend>=0?T.green:T.red}},k.trend>=0?"↑":"↓"," ",Math.abs(k.trend).toFixed(1),"%"))
            ))
          )
        )
      )
    ),
    // Sparklines grid
    summaryData.length>0&&React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10}},
      summaryData.map(k=>React.createElement(ChartCard,{key:k.key,title:k.label,sub:`${k.unit} · ${k.trend>=0?"▲":"▼"} ${Math.abs(k.trend).toFixed(1)}%`},
        React.createElement(ResponsiveContainer,{width:"100%",height:110},
          React.createElement(AreaChart,{data:hist},
            React.createElement("defs",null,React.createElement("linearGradient",{id:`g${k.key}`,x1:"0",y1:"0",x2:"0",y2:"1"},React.createElement("stop",{offset:"5%",stopColor:k.color,stopOpacity:0.25}),React.createElement("stop",{offset:"95%",stopColor:k.color,stopOpacity:0}))),
            React.createElement(XAxis,{dataKey:"label",tick:{fontSize:9,fill:T.textMuted},tickLine:false,axisLine:false}),
            React.createElement(YAxis,{tick:{fontSize:9,fill:T.textMuted},tickLine:false,axisLine:false,width:30}),
            React.createElement(Tooltip,{content:React.createElement(CustomTooltip,{unit:k.unit})}),
            React.createElement(Area,{type:"monotone",dataKey:k.key,name:k.label,stroke:k.color,fill:`url(#g${k.key})`,strokeWidth:2,dot:false})
          )
        )
      ))
    )
  );
}

// ─── CONFIG ───────────────────────────────────────────────────────────────────
function ConfigPage({state,setState,update}){
  const [newLot,setNewLot]=useState({name:"",ha:"",use:"agricola",soil:""});
  const [adding,setAdding]=useState(false);
  const totalLotHa=state.config.lots.reduce((s,l)=>s+l.ha,0);
  const addLot=()=>{
    if(!newLot.name||!newLot.ha) return;
    setState(prev=>({...prev,config:{...prev.config,lots:[...prev.config.lots,{...newLot,id:`l${Date.now()}`,ha:parseFloat(newLot.ha)}]}}));
    setNewLot({name:"",ha:"",use:"agricola",soil:""});setAdding(false);
  };
  return React.createElement("div",{style:{maxWidth:620}},
    React.createElement("div",{style:{background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:18,marginBottom:12}},
      React.createElement("div",{style:{fontSize:10,fontWeight:800,color:T.textMuted,letterSpacing:1.2,textTransform:"uppercase",marginBottom:11}},"Superficie Total"),
      React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}},
        React.createElement(Inp,{label:"Ha totales",value:state.config.totalHa,onChange:e=>update("config.totalHa",parseFloat(e.target.value)||0)}),
        React.createElement("div",{style:{background:T.bg,borderRadius:7,padding:"10px 12px"}},React.createElement("div",{style:{fontSize:9.5,color:T.textMuted,fontWeight:700}},"EN LOTES"),React.createElement("div",{style:{fontSize:18,fontWeight:800,marginTop:3}},totalLotHa," ha")),
        React.createElement("div",{style:{background:T.bg,borderRadius:7,padding:"10px 12px"}},React.createElement("div",{style:{fontSize:9.5,color:T.textMuted,fontWeight:700}},"SIN ASIGNAR"),React.createElement("div",{style:{fontSize:18,fontWeight:800,marginTop:3,color:state.config.totalHa-totalLotHa<0?T.red:T.text}},Math.max(0,state.config.totalHa-totalLotHa)," ha"))
      )
    ),
    React.createElement("div",{style:{background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:18}},
      React.createElement("div",{style:{fontSize:10,fontWeight:800,color:T.textMuted,letterSpacing:1.2,textTransform:"uppercase",marginBottom:11}},"Lotes del Campo"),
      React.createElement("table",{style:{width:"100%",borderCollapse:"collapse",fontSize:12.5,marginBottom:12}},
        React.createElement("thead",null,React.createElement("tr",{style:{background:T.bg}},["Nombre","Ha","Uso","Suelo",""].map(h=>React.createElement("th",{key:h,style:{padding:"9px 12px",textAlign:"left",fontSize:10,color:T.textMuted,fontWeight:800,letterSpacing:0.8,textTransform:"uppercase"}},h)))),
        React.createElement("tbody",null,state.config.lots.map(l=>
          React.createElement("tr",{key:l.id,style:{borderBottom:`1px solid ${T.borderLight}`}},
            React.createElement("td",{style:{padding:"9px 12px",fontWeight:700}},l.name),
            React.createElement("td",{style:{padding:"9px 12px"}},l.ha," ha"),
            React.createElement("td",{style:{padding:"9px 12px"}},React.createElement("span",{style:{display:"inline-flex",padding:"3px 9px",borderRadius:20,fontSize:10.5,fontWeight:700,background:l.use==="agricola"?T.greenLight:T.yellowLight,color:l.use==="agricola"?T.green:T.yellow}},l.use==="agricola"?"Agrícola":"Ganadero")),
            React.createElement("td",{style:{padding:"9px 12px",color:T.textSub,fontSize:11.5}},l.soil||"—"),
            React.createElement("td",{style:{padding:"9px 12px"}},React.createElement("button",{onClick:()=>setState(prev=>({...prev,config:{...prev.config,lots:prev.config.lots.filter(x=>x.id!==l.id)}})),style:{padding:"4px 10px",fontSize:10.5,fontWeight:700,background:T.redLight,color:T.red,border:"none",borderRadius:5,cursor:"pointer"}},"✕"))
          )
        ))
      ),
      adding
        ?React.createElement("div",{style:{background:T.bg,borderRadius:8,padding:16,border:`1px solid ${T.border}`}},
            React.createElement("div",{style:{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:10,marginBottom:10}},
              React.createElement(Inp,{label:"Nombre",type:"text",placeholder:"Lote Este",value:newLot.name,onChange:e=>setNewLot(p=>({...p,name:e.target.value}))}),
              React.createElement(Inp,{label:"Hectáreas",value:newLot.ha,onChange:e=>setNewLot(p=>({...p,ha:e.target.value}))}),
              React.createElement("div",null,React.createElement("div",{style:{fontSize:9.5,color:T.textMuted,marginBottom:4,fontWeight:700,letterSpacing:0.5}},"USO"),React.createElement("select",{value:newLot.use,onChange:e=>setNewLot(p=>({...p,use:e.target.value})),style:{background:"#F9FAFB",border:`1px solid ${T.border}`,borderRadius:6,padding:"7px 10px",fontSize:12.5,color:T.text,width:"100%"}},React.createElement("option",{value:"agricola"},"Agrícola"),React.createElement("option",{value:"ganadero"},"Ganadero")))
            ),
            React.createElement("div",{style:{marginBottom:12}},React.createElement(Inp,{label:"Tipo de suelo (opcional)",type:"text",placeholder:"Franco arcilloso",value:newLot.soil,onChange:e=>setNewLot(p=>({...p,soil:e.target.value}))})),
            React.createElement("div",{style:{display:"flex",gap:8}},
              React.createElement("button",{onClick:addLot,style:{padding:"9px 18px",fontWeight:700,fontSize:12.5,background:T.accent,color:"white",border:"none",borderRadius:6,cursor:"pointer"}},"Confirmar"),
              React.createElement("button",{onClick:()=>setAdding(false),style:{padding:"9px 18px",fontWeight:600,fontSize:12.5,background:"white",border:`1px solid ${T.border}`,borderRadius:6,cursor:"pointer",color:T.textSub}},"Cancelar")
            )
          )
        :React.createElement("button",{onClick:()=>setAdding(true),style:{padding:"9px 18px",fontWeight:600,fontSize:12,background:"white",border:`1px dashed ${T.border}`,borderRadius:6,cursor:"pointer",color:T.textSub,width:"100%"}},"+ Agregar Lote")
    )
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
function App(){
  const [state,setState]=useState(loadState);
  const [page,setPage]=useState("overview");
  const [collapsed,setCollapsed]=useState(false);
  const [timeRange,setTimeRange]=useState(12);

  useEffect(()=>{localStorage.setItem(SK,JSON.stringify(state));},[state]);

  const kpis=useMemo(()=>calcKPIs(state),[state]);
  const hist=useMemo(()=>HISTORY.slice(-timeRange),[timeRange]);

  const update=useCallback((path,value)=>{
    setState(prev=>{
      const next=JSON.parse(JSON.stringify(prev));
      const keys=path.split(".");let obj=next;
      for(let i=0;i<keys.length-1;i++) obj=obj[keys[i]];
      obj[keys[keys.length-1]]=value;return next;
    });
  },[]);

  const exportCSV=()=>{
    const rows=[["Módulo","KPI","Valor","Unidad"],["Global","USD/ha total",f0(kpis.global.usdHaTotal),"USD/ha"],["Ganadero","Carga animal",f1(kpis.gan.cargaAnimal,2),"EV/ha"],["Ganadero","Kg carne/ha/año",f0(kpis.gan.kgCarneHaAnio),"kg/ha/año"],["Ganadero","ADG",f0(kpis.gan.avgADG*1000),"g/día"],["Ganadero","Tasa destete",f1(kpis.gan.tasaDestete,1),"%"],["Ganadero","Mortalidad",f1(kpis.gan.mortalidad,2),"%"],["Agrícola","Ingreso/ha",f0(kpis.ag.ingresoPorHa),"USD/ha"],["Pasturas","Eficiencia",f1(kpis.past.avgEficiencia,1),"%"]];
    const blob=new Blob([rows.map(r=>r.join(";")).join("\n")],{type:"text/csv"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="campo_kpis.csv";a.click();
  };

  const alerts=[];
  if(kpis.gan.cargaAnimal>1.2) alerts.push({type:"red",msg:"Carga animal crítica: "+f1(kpis.gan.cargaAnimal,2)+" EV/ha"});
  if(kpis.gan.mortalidad>2)    alerts.push({type:"red",msg:"Mortalidad "+f1(kpis.gan.mortalidad,1)+"% — revisar sanidad"});
  if(kpis.past.avgEficiencia<55) alerts.push({type:"yellow",msg:"Eficiencia pasturas "+f1(kpis.past.avgEficiencia,0)+"%"});
  if(kpis.ag.pagosPendientes>0)  alerts.push({type:"yellow",msg:"Pago pendiente: USD "+f0(kpis.ag.pagosPendientes)});

  const navItems=[
    {id:"overview",icon:"⊞",label:"Overview"},
    {id:"ganadero",icon:"🐄",label:"Ganadero"},
    {id:"agricola",icon:"🌾",label:"Agrícola"},
    {id:"pasturas",icon:"🌿",label:"Pasturas"},
    {id:"historico",icon:"📈",label:"Histórico"},
    {id:"config",icon:"⚙",label:"Config"},
  ];
  const W=collapsed?52:196;

  return React.createElement("div",{style:{display:"flex",height:"100vh",background:T.bg,overflow:"hidden"}},
    // Sidebar
    React.createElement("div",{style:{width:W,background:T.sidebar,display:"flex",flexDirection:"column",flexShrink:0,transition:"width .2s ease",overflow:"hidden"}},
      React.createElement("div",{onClick:()=>setCollapsed(p=>!p),style:{padding:"15px 12px 12px",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",gap:9,cursor:"pointer",userSelect:"none",whiteSpace:"nowrap"}},
        React.createElement("span",{style:{fontSize:18,flexShrink:0}},"🌾"),
        !collapsed&&React.createElement("div",null,React.createElement("div",{style:{fontSize:12.5,fontWeight:800,color:T.accent,letterSpacing:0.5}},"CAMPO KPI"),React.createElement("div",{style:{fontSize:9,color:"#6B7280",letterSpacing:1.2,marginTop:1}},"ANALYTICS"))
      ),
      React.createElement("nav",{style:{flex:1,paddingTop:8}},
        navItems.map(n=>React.createElement("div",{key:n.id,onClick:()=>setPage(n.id),style:{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:7,cursor:"pointer",margin:"1px 6px",color:page===n.id?T.accent:"#9CA3AF",background:page===n.id?"#2D3A50":"transparent",fontSize:12.5,fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",transition:"all .15s"}},
          React.createElement("span",{style:{fontSize:13,width:18,textAlign:"center",flexShrink:0}},n.icon),
          !collapsed&&React.createElement("span",null,n.label)
        ))
      ),
      !collapsed&&React.createElement("div",{style:{padding:"12px 14px",borderTop:"1px solid rgba(255,255,255,.06)"}},
        React.createElement("div",{style:{fontSize:9,color:"#6B7280",letterSpacing:0.8,fontWeight:700}},"ESTABLECIMIENTO"),
        React.createElement("div",{style:{fontSize:12,color:"#D1D5DB",fontWeight:600,marginTop:3}},state.config.totalHa," ha · ",state.config.lots.length," lotes"),
        React.createElement("div",{style:{fontSize:10.5,color:"#6B7280",marginTop:1}},"Campo mixto · Argentina")
      )
    ),
    // Main
    React.createElement("div",{style:{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}},
      // Topbar
      React.createElement("div",{style:{background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"0 18px",height:50,display:"flex",alignItems:"center",gap:10,flexShrink:0}},
        React.createElement("div",{style:{fontSize:14,fontWeight:800,color:T.text,flex:1}},navItems.find(n=>n.id===page)?.label),
        React.createElement("div",{style:{display:"flex",gap:4}},
          [3,6,12].map(m=>React.createElement("button",{key:m,onClick:()=>setTimeRange(m),style:{padding:"5px 13px",borderRadius:5,fontSize:11,fontWeight:700,cursor:"pointer",border:`1px solid ${timeRange===m?T.accent:T.border}`,background:timeRange===m?T.accent:"white",color:timeRange===m?"white":T.textSub}},m,"M"))
        ),
        alerts.length>0&&React.createElement("button",{style:{padding:"6px 12px",fontSize:11,fontWeight:700,background:T.redLight,color:T.red,border:"none",borderRadius:6,cursor:"pointer"}},"⚠ ",alerts.length," alerta",alerts.length>1?"s":""),
        React.createElement("button",{onClick:exportCSV,style:{padding:"7px 14px",fontSize:11,fontWeight:600,background:T.bg,border:`1px solid ${T.border}`,borderRadius:6,cursor:"pointer",color:T.textSub}},"↓ CSV")
      ),
      // Page
      React.createElement("div",{style:{flex:1,overflow:"auto",padding:18}},
        page==="overview" &&React.createElement(Overview,  {kpis,hist,state,alerts}),
        page==="ganadero" &&React.createElement(GanaderoPage,{kpis:kpis.gan,hist,state,setState,update}),
        page==="agricola" &&React.createElement(AgricolaPage,{kpis:kpis.ag,hist,state,setState,update}),
        page==="pasturas" &&React.createElement(PasturasPage,{kpis:kpis.past,hist,state,setState}),
        page==="historico"&&React.createElement(HistoricoPage,{hist}),
        page==="config"   &&React.createElement(ConfigPage,  {state,setState,update})
      )
    )
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
</script>
</body>
</html>
