// ═══════════════════════════════════════════════════════════════
// LEDGE 360° — v3.3 CURRENT · 2026-03-19
// ═══════════════════════════════════════════════════════════════
// ⚠ EZ AZ AKTUÁLIS MASTER VERZIÓ — minden fejlesztés ebből induljon
// ═══════════════════════════════════════════════════════════════
// Design:  Nordic Clarity (light theme)
// Fonts:   Instrument Serif (headings) + DM Sans (body)
// Storage: window.storage (claude.ai sandbox)
//
// ── VERZIÓ TÖRTÉNET ───────────────────────────────────────────
// v1.0  2026-03    Stoic Pulse 360° — MVP, sötét téma, Fraunces serif
// v1.1  2026-03    Leader dashboard átdolgozás, csoportok, lenyitható riport
// v2.0  2026-03-15 LEDGE 360° rebrand, multi-self, AI builder, ShareModal,
//                  LibraryManager (▲▼), CSV export, kommentek bekötése
// v2.1  2026-03-17 Drag-and-drop szerkesztő, inline edit, Excel export/import,
//                  saját sablonok (tpl:), CopyCode SVG, window.print,
//                  NewProjectView azonos sablon választó
// v2.2  2026-03-18 Nordic Clarity redesign (világos téma, Instrument Serif)
// v3.0  2026-03-18 Auth rendszer (login, session, role-based access),
//                  PaywallView (29 EUR/hó), SuperAdmin panel (users, audit),
//                  Tanácsadó meghívók, Projekt kollaboráció,
//                  Audit log, Trend fül "Hamarosan", LibraryManager mentés sablonként
// v3.1  2026-03-18 Survey progress auto-save (draft: kulcs, debounced 800ms),
//                  GroupModal: saját sablonok (tpl:) is megjelennek a dropdown-ban,
//                  Értékelők bulk import (CSV/TSV feltöltés a RatersView-ban),
//                  Sablon duplikálás (⧉ Másolás gomb a CustomTemplateSection-ben),
//                  Kompetencia szín választó (LibraryManagerView, kattintható paletta)
// v3.2  2026-03-19 Végleges kompetencia szövegek (4 preset, 78 behavioral anchor),
//                  resolvePreset() helper, 7 bugfix, cross-dimension DnD
// v3.3  2026-03-19 BUG: szöveges visszajelzés most már mentődik és megjelenik,
//                  Tab átnevezés: "Visszajelzés" → "Szöveges visszajelzés",
//                  Szerkeszthető Likert-skála (7 preset: 4/5/6/7/10-fokú, gyakoriság, egyetértés),
//                  Klasszikus tesztek: EQ, Growth Mindset, Stressz, Kommunikáció,
//                    DISC, Pszichológiai tőke (PsyCap), Szolgáló vezetés, Változásvezetés,
//                  Excel feltöltés AI feldolgozással (SheetJS + Claude API → kompetencia struktúra),
//                  Szöveges visszajelzés két mező: fejlődési terület + erősségek,
//                  Preset kategorizálás: leadership vs classic, SelfPickView 2×2 eszköz grid,
//                  Dinamikus skála: scoreColor(), getScaleConfig(), radar/bar/heatmap sMax
//
// ── KÉSZ FUNKCIÓK (v3.3) ─────────────────────────────────────
// ✅ Két track: Személyes tükör (B2C) + Szervezeti 360° (B2B)
// ✅ 4 preset kompetencia könyvtár — VÉGLEGES szövegek (8/30 + 3×4/16)
// ✅ Multi-self önértékelés (átnevezés, törlés, kártya nézet)
// ✅ Értékelő csoportok (5 preset, szabad szerkesztés, kérdőív-választó)
// ✅ Survey: 1-5 skála, dimenzió navigáció, szöveges visszajelzés
// ✅ Survey progress auto-save (draft mentés libraryId-nként egyedi)
// ✅ ReportView: Radar + Bar + Hőtérkép + Kiemelések + Visszajelzések
// ✅ Csoportonkénti lenyitható bontás, vak folt / rejtett erősség
// ✅ Drag-and-drop kérdőív szerkesztő + inline szerkesztés + szín választó
// ✅ CSV és Excel export / import (LibraryManager + RatersView bulk)
// ✅ AI Kérdőív-tervező (Anthropic API) + 💾 sablon mentés + 📁 projekt mentés
// ✅ Saját sablonok rendszer (tpl:, CustomTemplateSection, duplikálás)
// ✅ Sablon megosztás (ShareModal, 8 jegyű kód)
// ✅ CopyCode SVG komponens + Riport nyomtatás (window.print)
// ✅ Auth: login, session, role (leader/consultant/super_admin), logout
// ✅ Paywall (Szervezeti 360° = fizető), SuperAdmin panel
// ✅ Tanácsadó meghívók, Projekt kollaboráció, Audit log
// ✅ Értékelők bulk import (CSV/TSV/XLSX feltöltés — SheetJS)
// ✅ Projekt név/ügyfél szerkesztés utólag + archiválás
// ✅ LeaderCompare: önértékelés választó (ha több van)
// ✅ Csoporttag válaszának megnézése (modal, dimenzió bontás)
// ✅ resolvePreset: egyedi sablonok dims mentése + helyes riport megjelenítés
// ✅ Szöveges visszajelzés bug fix + tab átnevezés
// ✅ Szerkeszthető Likert-skála (7 preset skála-típus, ⚙ gomb a survey-ben)
// ✅ Klasszikus önismereti tesztek (EQ, Growth Mindset, Stressz, Kommunikáció)
// ✅ Excel feltöltés AI feldolgozással (drag-and-drop, SheetJS + Claude API)
// ✅ Dinamikus skála kezelés (scoreColor, radar/bar/heatmap sMax)
//
// ── BACKLOG ──────────────────────────────────────────────────
// 🔵 Vercel deploy (Next.js + Supabase + Resend + PDF)
// 🔵 PULSE fázis-integráció, AI debrief, Multi-tenant
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback, useRef } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, Legend
} from "recharts";
// INTEGRATION: Módosítsd ezt az importot a projekt struktúrájához:
// Pages Router: import { db } from '../lib/supabase-360';
// App Router:   import { db } from '@/lib/supabase-360';
// Ha van meglévő supabase lib: import { db } from '@/lib/supabase-360';
import { db } from '../lib/supabase-360';
import * as XLSX from 'xlsx';

// ─── TOKENS ────────────────────────────────────────────────────
const BG    = '#0A0A09';
const SURF  = '#161614';
const S2    = '#1E1E1C';
const S3    = '#EDEAE4';
const BORD  = '#2C2C29';
const BORD2 = '#3A3A36';
const GOLD  = '#C49A52';
const GDIM  = '#C4AD78';
const TEXT  = '#EDECEA';
const MUTED = '#7A7870';
const DIM   = '#4A4945';
const BLUE  = '#5E90B8';
const GREEN = '#6EA07C';
const PURP  = '#9B78C0';
const ORAN  = '#C07E58';
const RED   = '#D06860';

const SCALE = ['','Gyenge','Megfelelő','Jó','Nagyon jó','Kiváló'];
const SCOL  = ['', '#B85548', '#A06A48', '#A68542', '#5B8A6A', '#4A7A9E'];

const SCALE_PRESETS = [
  { id:'5pt',  name:'5 fokú (alap)',     labels:['','Gyenge','Megfelelő','Jó','Nagyon jó','Kiváló'],                              colors:['','#B85548','#A06A48','#A68542','#5B8A6A','#4A7A9E'] },
  { id:'4pt',  name:'4 fokú',            labels:['','Fejlesztendő','Megfelelő','Jó','Kiváló'],                                   colors:['','#B85548','#A06A48','#5B8A6A','#4A7A9E'] },
  { id:'6pt',  name:'6 fokú',            labels:['','Nagyon gyenge','Gyenge','Közepes','Jó','Nagyon jó','Kiváló'],                 colors:['','#B85548','#C44','#A06A48','#A68542','#5B8A6A','#4A7A9E'] },
  { id:'7pt',  name:'7 fokú (Likert)',   labels:['','Egyáltalán nem','Nagyon kevéssé','Kevéssé','Közepesen','Inkább igen','Nagyrészt','Teljesen'], colors:['','#B85548','#C44','#A06A48','#A68542','#7A8A3A','#5B8A6A','#4A7A9E'] },
  { id:'10pt', name:'10 fokú (NPS)',     labels:['','1','2','3','4','5','6','7','8','9','10'],                                    colors:['','#B85548','#B85548','#C44','#A06A48','#A06A48','#A68542','#A68542','#5B8A6A','#5B8A6A','#4A7A9E'] },
  { id:'freq', name:'Gyakoriság',        labels:['','Soha','Ritkán','Néha','Gyakran','Mindig'],                                   colors:['','#B85548','#A06A48','#A68542','#5B8A6A','#4A7A9E'] },
  { id:'agree',name:'Egyetértés',        labels:['','Egyáltalán nem','Inkább nem','Semleges','Inkább igen','Teljesen'],            colors:['','#B85548','#A06A48','#A68542','#5B8A6A','#4A7A9E'] },
];
const DEFAULT_SCALE = SCALE_PRESETS[0];
function getScaleConfig(scaleId) {
  return SCALE_PRESETS.find(s => s.id === scaleId) || DEFAULT_SCALE;
}
function getScaleMax(scaleId) {
  const sc = getScaleConfig(scaleId);
  return sc.labels.length - 1;
}
function scoreColor(val, max) {
  if (!val || val <= 0) return MUTED;
  const pct = val / (max || 5);
  if (pct <= 0.25) return '#B85548';
  if (pct <= 0.45) return '#A06A48';
  if (pct <= 0.65) return '#A68542';
  if (pct <= 0.85) return '#5B8A6A';
  return '#4A7A9E';
}

const GROUP_PRESETS = [
  { emoji:'🏢', name:'Munkatársaim',  color: BLUE  },
  { emoji:'🤝', name:'Barátaim',      color: GREEN },
  { emoji:'🏠', name:'Családom',      color: PURP  },
  { emoji:'🎯', name:'Mentoraim',     color: GOLD  },
  { emoji:'👥', name:'Saját csapatom',color: ORAN  },
];

// ─── COMPETENCY LIBRARIES ──────────────────────────────────────
const DEFAULT_DIMS = [
  { id:'PC', name:'Purpose Champion',  label:'Célvezérelt vezető',          color:GOLD,      items:[
    {id:'PC1',text:'Világos, mérhető célokat tűz ki és kommunikál a csapat számára'},
    {id:'PC2',text:'A szervezeti küldetést napi döntéseiben következetesen érvényesíti'},
    {id:'PC3',text:'Prioritásokat a változó üzleti környezethez igazítva felülvizsgál'},
    {id:'PC4',text:'A csapat munkáját közvetlenül az értékteremtéshez kapcsolja'},
  ]},
  { id:'LS', name:'Leading Self',      label:'Önvezetés és tudatosság',     color:BLUE,      items:[
    {id:'LS1',text:'Saját erősségeit és fejlesztendő területeit reálisan azonosítja'},
    {id:'LS2',text:'Visszajelzést proaktívan kér, és beépíti a viselkedésébe'},
    {id:'LS3',text:'Nyomás alatt is kiegyensúlyozottan és átláthatóan kommunikál'},
    {id:'LS4',text:'Tudatosan fejleszti kompetenciáit új ismeretek elsajátításával'},
  ]},
  { id:'ES', name:'Enabling Strategy', label:'Stratégiai gondolkodás',      color:PURP,      items:[
    {id:'ES1',text:'Összetett üzleti helyzeteket rendszerszinten értelmez és elemez'},
    {id:'ES2',text:'Döntéseit adatokra és megalapozott elemzésekre alapozza'},
    {id:'ES3',text:'Piaci trendeket és kockázatokat időben felismeri és értékeli'},
    {id:'ES4',text:'Stratégiai lehetőségeket azonosít és cselekvésre fordítja'},
  ]},
  { id:'DS', name:'Driving Systems',   label:'Szisztematikus végrehajtás',  color:ORAN,      items:[
    {id:'DS1',text:'Munkafolyamatokat átláthatóan strukturálja és egyszerűsíti'},
    {id:'DS2',text:'Erőforrásokat a stratégiai célokhoz igazítva osztja el'},
    {id:'DS3',text:'Kulcsmutatókkal méri és rendszeresen nyomon követi a haladást'},
  ]},
  { id:'EO', name:'Engaging Others',   label:'Emberek mozgósítása',         color:GREEN,     items:[
    {id:'EO1',text:'Bizalomra épülő, stabil munkakapcsolatokat épít csapatában'},
    {id:'EO2',text:'Elkötelezettséget és motivációt erősítő légkört teremt'},
    {id:'EO3',text:'Feladatokat és döntési jogköröket hatékonyan delegál'},
    {id:'EO4',text:'Nézeteltéréseket konstruktívan, időben felszínre hozza és kezeli'},
  ]},
  { id:'TM', name:'Team Mastery',      label:'Csapatfejlesztés',            color:'#D4AA78', items:[
    {id:'TM1',text:'Egyéni tehetségeket felismeri és célzottan fejleszti a csapatban'},
    {id:'TM2',text:'Rendszeres, konkrét és fejlesztő visszajelzést ad csapatának'},
    {id:'TM3',text:'Sokszínű csapatot épít, ahol mindenki érdemi hozzájárulhat'},
  ]},
  { id:'AI', name:'AI Leadership',     label:'AI-vezető kompetencia',       color:'#7AAED0', items:[
    {id:'AI1',text:'AI eszközöket beépíti saját és csapata munkavégzésébe'},
    {id:'AI2',text:'Csapatát felkészíti és támogatja az AI-alapú munkamódszerekben'},
    {id:'AI3',text:'AI-támogatott döntéshozást alkalmaz és ösztönöz a csapatban'},
    {id:'AI4',text:'AI etikai kockázatokat felismeri és kezelésükre keretet biztosít'},
  ]},
  { id:'IN', name:'Innovation',        label:'Innováció és változásvezetés', color:'#B89BC9', items:[
    {id:'IN1',text:'Kísérletezésre bátorító, hibákat tanulásként kezelő kultúrát épít'},
    {id:'IN2',text:'Változásokhoz rugalmasan alkalmazkodik és csapatát is átvezeti'},
    {id:'IN3',text:'Új megoldásokat szisztematikusan keres és bevezetésüket támogatja'},
    {id:'IN4',text:'Tanulságokat rögzíti és beépíti a csapat folyamataiba'},
  ]},
];
const AGILE_DIMS = [
  { id:'AG', name:'Agilis gondolkodás',  label:'Agilis gondolkodás',          color:GREEN, items:[
    {id:'AG1',text:'Iteratív munkaciklusokat vezet be és következetesen alkalmaz'},
    {id:'AG2',text:'Visszacsatolási hurkokat aktívan rövidíti és kiértékeli'},
    {id:'AG3',text:'Minimum viable megközelítést alkalmaz új kezdeményezéseknél'},
    {id:'AG4',text:'Kudarcokból szisztematikusan von le és oszt meg tanulságokat'},
  ]},
  { id:'CO', name:'Együttműködés',       label:'Csapatmunka és együttműködés',color:BLUE, items:[
    {id:'CO1',text:'Keresztfunkcionális csapatokban hatékonyan együttműködik és vezet'},
    {id:'CO2',text:'Pszichológiai biztonságot teremt, ahol mindenki megszólalhat'},
    {id:'CO3',text:'Önszervező csapatokat fejleszt és valódi autonómiát biztosít'},
    {id:'CO4',text:'Akadályokat proaktívan feltárja és elhárítja csapata számára'},
  ]},
  { id:'DL', name:'Digitális leadership',label:'Digitális vezetés',           color:PURP, items:[
    {id:'DL1',text:'Digitális eszközöket magabiztosan választ ki és alkalmaz'},
    {id:'DL2',text:'Adatvezérelt gondolkodást és kultúrát épít a csapatban'},
    {id:'DL3',text:'Technológiai változásokat érthetően kommunikálja és vezeti'},
    {id:'DL4',text:'Remote és hibrid csapatot eredményesen koordinálja'},
  ]},
  { id:'RS', name:'Eredmény',            label:'Eredményorientáltság',        color:ORAN, items:[
    {id:'RS1',text:'Mérhető, konkrét célokat tűz ki és rendszeresen értékeli azokat'},
    {id:'RS2',text:'Célkitűzési módszertant (OKR/SMART) következetesen alkalmaz'},
    {id:'RS3',text:'Csapat teljesítményét nyomon követi és javító lépéseket tesz'},
    {id:'RS4',text:'Eredményekért személyes felelősséget vállal és elszámoltatható'},
  ]},
];
const PEOPLE_DIMS = [
  { id:'EM',  name:'Empátia',      label:'Empátia és érzelmi intelligencia',color:GREEN, items:[
    {id:'EM1',text:'Mások érzelmi állapotát érzékenyen és pontosan felismeri'},
    {id:'EM2',text:'Aktívan, teljes figyelemmel hallgatja meg beszélgetőpartnereit'},
    {id:'EM3',text:'Érzelmileg biztonságos teret teremt nyílt kommunikációhoz'},
    {id:'EM4',text:'Vezetési stílusát az egyéni igényekhez rugalmasan igazítja'},
  ]},
  { id:'WB',  name:'Wellbeing',    label:'Jólét és fenntarthatóság',       color:BLUE, items:[
    {id:'WB1',text:'A csapat terhelését figyeli és fenntartható szinten tartja'},
    {id:'WB2',text:'Munka és magánélet egyensúlyát értékként kezeli és erősíti'},
    {id:'WB3',text:'Mentális egészség témáját nyíltan, tabu nélkül kezeli'},
    {id:'WB4',text:'Kiégés jeleit korán felismeri és megelőző lépéseket tesz'},
  ]},
  { id:'GR',  name:'Fejlesztés',   label:'Emberek fejlesztése és coaching',color:GOLD, items:[
    {id:'GR1',text:'Egyéni fejlesztési terveket készít és következetesen követ'},
    {id:'GR2',text:'Coaching szemléletet alkalmaz a mindennapi vezetési helyzetekben'},
    {id:'GR3',text:'Karrierutat és növekedési lehetőséget kínál a csapattagoknak'},
    {id:'GR4',text:'Erősségalapú, konkrét visszajelzést rendszeresen ad'},
  ]},
  { id:'INC', name:'Inkluzivitás', label:'Befogadás és sokszínűség',       color:PURP, items:[
    {id:'INC1',text:'Minden vélemény és nézőpont meghallgatását aktívan biztosítja'},
    {id:'INC2',text:'Kulturális és személyes különbségeket erőforrásként értékeli'},
    {id:'INC3',text:'Tudattalan előítéleteit felismeri és tudatosan kezeli'},
    {id:'INC4',text:'Átlátható, igazságos döntéshozatali gyakorlatot alkalmaz'},
  ]},
];
const STRATEGIC_DIMS = [
  { id:'SV', name:'Stratégiai vízió',   label:'Vízió és iránymutatás',     color:GOLD, items:[
    {id:'SV1',text:'3–5 éves üzleti víziót épít és határozottan képvisel'},
    {id:'SV2',text:'Szervezeti stratégiát a piaci változásokhoz igazítja'},
    {id:'SV3',text:'Stratégiát minden szinten meggyőzően és érthetően kommunikálja'},
    {id:'SV4',text:'Hosszú távú értékteremtést priorizálja rövid távú nyomás alatt'},
  ]},
  { id:'ST', name:'Stakeholder',        label:'Stakeholder menedzsment',   color:BLUE, items:[
    {id:'ST1',text:'Kulcs érintettekkel stratégiai partnerséget épít és ápol'},
    {id:'ST2',text:'Döntéshozókat és befektetőket magabiztosan tájékoztat és vezet'},
    {id:'ST3',text:'Érintetti elvárásokat proaktívan feltérképezi és kezeli'},
    {id:'ST4',text:'Szervezeti dinamikákat és politikát hatékonyan navigálja'},
  ]},
  { id:'OP', name:'Operatív kiválóság', label:'Operatív kiválóság',         color:ORAN, items:[
    {id:'OP1',text:'Szervezeti felépítést a stratégiai célokhoz igazítja'},
    {id:'OP2',text:'Kulcs teljesítménymutatókat (KPI) definiálja és rendszeresen méri'},
    {id:'OP3',text:'Hatékony, gyors döntéshozatali mechanizmusokat működtet'},
    {id:'OP4',text:'Erőforrás-elosztást a stratégiai prioritásokhoz rendeli'},
  ]},
  { id:'TR', name:'Transzformáció',     label:'Szervezeti transzformáció', color:PURP, items:[
    {id:'TR1',text:'Nagyszabású változási programokat sikeresen tervez és vezet'},
    {id:'TR2',text:'Szervezeti kultúrát tudatos beavatkozásokkal formálja'},
    {id:'TR3',text:'Digitális átalakulást stratégiai szinten irányítja és méri'},
    {id:'TR4',text:'Alkalmazkodóképességet és rezilienciát épít a szervezetbe'},
  ]},
];

// ─── CLASSIC SELF-ASSESSMENT PRESETS ─────────────────────────
const EQ_DIMS = [
  { id:'SA', name:'Önismeret',           label:'Érzelmi önismeret',           color:GOLD, items:[
    {id:'SA1',text:'Érzelmeimet pontosan felismerem és meg tudom nevezni'},
    {id:'SA2',text:'Tisztában vagyok vele, hogyan hatnak rám érzelmeim a döntéseimben'},
    {id:'SA3',text:'Ismerem az erősségeimet és korlátaimat'},
    {id:'SA4',text:'Nyitott vagyok az őszinte visszajelzésre önmagamról'},
  ]},
  { id:'SM', name:'Önszabályozás',       label:'Érzelmi önszabályozás',       color:BLUE, items:[
    {id:'SM1',text:'Stresszes helyzetben is meg tudom őrizni a nyugalmamat'},
    {id:'SM2',text:'Képes vagyok visszafogni a hirtelen érzelmi reakcióimat'},
    {id:'SM3',text:'Alkalmazkodom a váratlan változásokhoz megoldásfókuszúan'},
    {id:'SM4',text:'Felelősséget vállalok a hibáimért, nem másokat okolok'},
  ]},
  { id:'MO', name:'Motiváció',           label:'Belső motiváció és elköteleződés', color:GREEN, items:[
    {id:'MO1',text:'Belső motiváció hajt, nem csupán külső jutalmak'},
    {id:'MO2',text:'Nehézségek esetén is kitartóan törekszem a céljaim felé'},
    {id:'MO3',text:'Optimistán közelítek a kihívásokhoz és új feladatokhoz'},
    {id:'MO4',text:'Folyamatosan keresem a fejlődési lehetőségeket'},
  ]},
  { id:'EP', name:'Empátia',             label:'Mások megértése és empátia',  color:PURP, items:[
    {id:'EP1',text:'Figyelmesen hallgatom meg mások nézőpontját ítélkezés nélkül'},
    {id:'EP2',text:'Érzékenyen reagálok mások érzelmi állapotára'},
    {id:'EP3',text:'Képes vagyok más kultúrák és háttérrel rendelkezők megértésére'},
    {id:'EP4',text:'Felismerem a kimondatlan érzéseket és szükségleteket'},
  ]},
  { id:'SS', name:'Társas készségek',    label:'Kapcsolatkezelés és befolyás',color:ORAN, items:[
    {id:'SS1',text:'Hatékonyan kezelek konfliktusokat és nézeteltéréseket'},
    {id:'SS2',text:'Könnyen építek és tartok fenn bizalmi kapcsolatokat'},
    {id:'SS3',text:'Meggyőzően kommunikálom az ötleteimet és javaslataimat'},
    {id:'SS4',text:'Jó csapatjátékos vagyok és elősegítem az együttműködést'},
  ]},
];
const GROWTH_DIMS = [
  { id:'CH', name:'Kihívás-keresés',     label:'Kihívásokhoz való viszonyulás', color:GREEN, items:[
    {id:'CH1',text:'Szívesen vállalok olyan feladatokat, amelyek kihívást jelentenek'},
    {id:'CH2',text:'A komfortzónám elhagyását fejlődési lehetőségnek tekintem'},
    {id:'CH3',text:'Új készségek elsajátítását aktívan keresem'},
    {id:'CH4',text:'A nehéz feladatokat lehetőségnek, nem fenyegetésnek látom'},
  ]},
  { id:'EF', name:'Erőfeszítés',         label:'Erőfeszítés és kitartás',     color:GOLD, items:[
    {id:'EF1',text:'Hiszem, hogy a kitartó munka fontosabb a veleszületett tehetségnél'},
    {id:'EF2',text:'Ha valami elsőre nem sikerül, más stratégiákat próbálok'},
    {id:'EF3',text:'Tudatosan gyakorlok a fejlődés érdekében, nem csak rutinból'},
    {id:'EF4',text:'A hosszú távú fejlődést előnyben részesítem a gyors sikerrel szemben'},
  ]},
  { id:'FB', name:'Visszajelzés',        label:'Visszajelzéshez való viszony', color:BLUE, items:[
    {id:'FB1',text:'A kritikát hasznos információnak tekintem, nem támadásnak'},
    {id:'FB2',text:'Aktívan kérem mások véleményét a teljesítményemről'},
    {id:'FB3',text:'A visszajelzés alapján konkrétan változtatok a viselkedésemen'},
    {id:'FB4',text:'Mások sikereit inspirációnak, nem fenyegetésnek érzem'},
  ]},
  { id:'LF', name:'Tanulás kudarcból',   label:'Hibákból tanulás',            color:PURP, items:[
    {id:'LF1',text:'A hibáimat nyíltan elismerem és tanulok belőlük'},
    {id:'LF2',text:'Kudarc után elemzem, hogy mit csinálhattam volna másképp'},
    {id:'LF3',text:'Nem adom fel könnyen, ha akadályba ütközöm'},
    {id:'LF4',text:'A kudarcot a tanulási folyamat természetes részének tekintem'},
  ]},
];
const STRESS_DIMS = [
  { id:'AW', name:'Stressztudatosság',   label:'Stressz felismerés és tudatosság', color:ORAN, items:[
    {id:'AW1',text:'Felismerem a testemben a stressz korai jeleit'},
    {id:'AW2',text:'Tisztában vagyok a stresszforrásaimmal az életemben'},
    {id:'AW3',text:'Megkülönböztetem a produktív nyomást a destruktív stressztől'},
    {id:'AW4',text:'Rendszeresen reflektálok az energiaszintemre és hangulataimra'},
  ]},
  { id:'CP', name:'Megküzdés',           label:'Megküzdési stratégiák',       color:GREEN, items:[
    {id:'CP1',text:'Hatékony módszereim vannak a stressz kezelésére'},
    {id:'CP2',text:'Képes vagyok a nehéz helyzetekből pozitívumot kihozni'},
    {id:'CP3',text:'Nyomás alatt is meg tudom tartani a fókuszomat'},
    {id:'CP4',text:'Tudatosan pihenek és töltődöm a megterhelő időszakok után'},
  ]},
  { id:'BC', name:'Határok',             label:'Határok és egyensúly',        color:BLUE, items:[
    {id:'BC1',text:'Meghúzom a határaimat, ha túl sok terhet veszek magamra'},
    {id:'BC2',text:'Fenntartom a munka és magánélet egészséges egyensúlyát'},
    {id:'BC3',text:'Képes vagyok nemet mondani, amikor szükséges'},
    {id:'BC4',text:'Rendszeresen szakítok időt a regenerálódásra és pihenésre'},
  ]},
  { id:'SC', name:'Társas támasz',       label:'Társas erőforrások',          color:PURP, items:[
    {id:'SC1',text:'Nehéz helyzetben bátran kérek segítséget másoktól'},
    {id:'SC2',text:'Vannak megbízható emberek, akikkel megbeszélhetem a gondjaimat'},
    {id:'SC3',text:'Érzelmeimet meg tudom osztani a számomra fontos emberekkel'},
    {id:'SC4',text:'Támogató közösség(ek)hez tartozom, ahová fordulhatok'},
  ]},
];
const COMM_DIMS = [
  { id:'CL', name:'Tiszta kommunikáció', label:'Érthetőség és világosság',    color:GOLD, items:[
    {id:'CL1',text:'Gondolataimat tömören és érthetően fejezem ki szóban'},
    {id:'CL2',text:'Írásbeli kommunikációm átlátható és jól strukturált'},
    {id:'CL3',text:'Mondanivalómat a hallgatóság szintjéhez igazítom'},
    {id:'CL4',text:'Bonyolult dolgokat egyszerűen és szemléletesen magyarázom el'},
  ]},
  { id:'LI', name:'Aktív hallgatás',     label:'Meghallgatás és figyelem',    color:BLUE, items:[
    {id:'LI1',text:'Teljes figyelmemmel hallgatom meg a beszélgetőpartneremet'},
    {id:'LI2',text:'Visszakérdezéssel ellenőrzöm, hogy jól értettem-e a másikat'},
    {id:'LI3',text:'Meghallgatás közben nem gondolok a saját válaszomra'},
    {id:'LI4',text:'Felismerem a szavak mögötti érzéseket és szándékokat'},
  ]},
  { id:'AS', name:'Asszertivitás',       label:'Önérvényesítés és határozottság', color:ORAN, items:[
    {id:'AS1',text:'Határozottan képviselem az álláspontomat tisztelettel'},
    {id:'AS2',text:'Ki tudom fejezni az egyet nem értésemet konstruktívan'},
    {id:'AS3',text:'Bátran felszólalok, ha valami fontosat kell elmondanom'},
    {id:'AS4',text:'Visszajelzést adékvát időben és módon adok másoknak'},
  ]},
  { id:'NV', name:'Nonverbális',         label:'Testbeszéd és jelenlét',      color:PURP, items:[
    {id:'NV1',text:'Tudatosan figyelek a testbeszédemre kommunikáció közben'},
    {id:'NV2',text:'Szemkontaktust tartok és nyitott testtartást alkalmazok'},
    {id:'NV3',text:'Felismerem mások nonverbális jelzéseit és reagálok rájuk'},
    {id:'NV4',text:'Hanghordozásomat a helyzethez és közléshez igazítom'},
  ]},
];
const DISC_DIMS = [
  { id:'DD', name:'Dominancia',           label:'Határozottság és eredményorientáció', color:'#C44D38', items:[
    {id:'DD1',text:'Határozott döntéseket hozok, amikor szükséges'},
    {id:'DD2',text:'Irányítom a beszélgetések és projektek menetét'},
    {id:'DD3',text:'Magabiztosan vállalom a kihívásokat és konfrontációkat'},
    {id:'DD4',text:'Eredményekre fókuszálok és várom el ezt másoktól is'},
  ]},
  { id:'DI', name:'Befolyásolás',         label:'Kommunikáció és lelkesítés',  color:ORAN, items:[
    {id:'DI1',text:'Lelkesítően kommunikálom az ötleteimet és terveimet'},
    {id:'DI2',text:'Könnyen és gyorsan építek kapcsolatot új emberekkel'},
    {id:'DI3',text:'Pozitív energiámmal motiválom a környezetemet'},
    {id:'DI4',text:'Meggyőzően képviselem az álláspontomat csoportban'},
  ]},
  { id:'DS', name:'Stabilitás',           label:'Együttműködés és megbízhatóság', color:GREEN, items:[
    {id:'DS1',text:'Türelmes és megértő vagyok az emberekkel szemben'},
    {id:'DS2',text:'Megbízhatóan, következetesen végzem a munkámat'},
    {id:'DS3',text:'Harmonikus légkört igyekszem teremteni a csapatban'},
    {id:'DS4',text:'Figyelmesen meghallgatom és támogatom a kollégáimat'},
  ]},
  { id:'DC', name:'Lelkiismeretesség',    label:'Pontosság és minőségfókusz',  color:BLUE, items:[
    {id:'DC1',text:'A részletekre odafigyelek, a minőséget helyezem előtérbe'},
    {id:'DC2',text:'Alapos elemzés után hozom meg a döntéseimet'},
    {id:'DC3',text:'Szabályokat és eljárásrendeket következetesen betartom'},
    {id:'DC4',text:'Precízen és szervezetten végzem a feladataimat'},
  ]},
];
const PSYCAP_DIMS = [
  { id:'HO', name:'Remény',               label:'Célokhoz vezető utak és akarat', color:GREEN, items:[
    {id:'HO1',text:'Tiszta céljaim vannak és eltökélt vagyok az elérésükben'},
    {id:'HO2',text:'Ha egy út nem járható, alternatív megoldásokat keresek'},
    {id:'HO3',text:'Optimistán tekintek a jövőbeli lehetőségeimre'},
    {id:'HO4',text:'Kitartóan törekszem céljaim felé akadályok ellenére is'},
  ]},
  { id:'SE', name:'Énhatékonyság',        label:'Hit a saját képességeimben',  color:GOLD, items:[
    {id:'SE1',text:'Bízom benne, hogy képes vagyok a kihívások leküzdésére'},
    {id:'SE2',text:'Magabiztosan képviselem a véleményemet megbeszéléseken'},
    {id:'SE3',text:'Nehéz feladatokat is vállalok, mert tudom, hogy megbirkózom'},
    {id:'SE4',text:'Részt veszek a csapat stratégiai döntéseinek formálásában'},
  ]},
  { id:'RE', name:'Reziliencia',           label:'Visszapattanás nehézségek után', color:BLUE, items:[
    {id:'RE1',text:'Kudarcok után képes vagyok talpra állni és továbblépni'},
    {id:'RE2',text:'Stresszes időszakokban is meg tudom tartani a hatékonyságom'},
    {id:'RE3',text:'Nehézségeket tanulási lehetőségnek tekintem'},
    {id:'RE4',text:'Váratlan változásokhoz rugalmasan és gyorsan alkalmazkodom'},
  ]},
  { id:'OP', name:'Optimizmus',            label:'Pozitív szemlélet és jövőkép', color:PURP, items:[
    {id:'OP1',text:'A jelen kihívásaiban is meglátom a jövő lehetőségeit'},
    {id:'OP2',text:'Hiszek abban, hogy a dolgok a legjobb irányba alakulnak'},
    {id:'OP3',text:'Pozitív eredményeket tulajdonítok a saját erőfeszítéseimnek'},
    {id:'OP4',text:'A sikert nem a véletlennek, hanem a munkámnak köszönöm'},
  ]},
];
const SERVANT_DIMS = [
  { id:'SL', name:'Meghallgatás',         label:'Mély figyelem és megértés',   color:GREEN, items:[
    {id:'SL1',text:'Mélyen odafigyelek arra, amit mások mondanak és éreznek'},
    {id:'SL2',text:'Rendszeresen kérdezem meg a csapatom igényeit és véleményét'},
    {id:'SL3',text:'A csapat szükségleteit a sajátjaim elé helyezem'},
    {id:'SL4',text:'Bizalmat építek azzal, hogy valóban meghallgatom az embereket'},
  ]},
  { id:'GW', name:'Fejlesztés',           label:'Mások növekedésének támogatása', color:GOLD, items:[
    {id:'GW1',text:'Aktívan segítem a csapattagok szakmai és személyes fejlődését'},
    {id:'GW2',text:'Lehetőségeket teremtek, ahol mások tanulhatnak és nőhetnek'},
    {id:'GW3',text:'Mentorálom a fiatalabb vagy kevésbé tapasztalt kollégákat'},
    {id:'GW4',text:'Őszinte, fejlesztő visszajelzést adok rendszeresen'},
  ]},
  { id:'CM', name:'Közösségépítés',        label:'Közösség és összetartozás',   color:BLUE, items:[
    {id:'CM1',text:'Erős közösségi szellemet és összetartozást építek'},
    {id:'CM2',text:'Döntéseimnél figyelembe veszem a tágabb közösség érdekeit'},
    {id:'CM3',text:'Bizalomra és kölcsönös tiszteletre épülő kultúrát teremtek'},
    {id:'CM4',text:'Minden csapattag hozzájárulását értékelem és elismerem'},
  ]},
  { id:'ET', name:'Etika és alázat',      label:'Etikus működés és szolgálat', color:PURP, items:[
    {id:'ET1',text:'Következetesen etikus döntéseket hozok nehéz helyzetekben is'},
    {id:'ET2',text:'Felelősséget vállalok a hibáimért és tanulok belőlük'},
    {id:'ET3',text:'Átláthatóan és őszintén kommunikálok a csapatommal'},
    {id:'ET4',text:'Alázattal fogadom a kritikát és nyitott vagyok a tanulásra'},
  ]},
];
const CHANGE_DIMS = [
  { id:'VS', name:'Változásvízió',        label:'Változás szükségességének kommunikálása', color:GOLD, items:[
    {id:'VS1',text:'Világos és meggyőző víziót fogalmazok meg a változásról'},
    {id:'VS2',text:'A változás szükségességét konkrét tényekkel támasztom alá'},
    {id:'VS3',text:'A csapat számára érthetővé teszem a változás értelmét és célját'},
    {id:'VS4',text:'Sürgősség érzetet teremtek anélkül, hogy pánikot keltenék'},
  ]},
  { id:'EN', name:'Bevonás',              label:'Változásba való bevonás és mozgósítás', color:GREEN, items:[
    {id:'EN1',text:'Változási koalíciót építek a kulcsemberek bevonásával'},
    {id:'EN2',text:'Bevonok másokat a változás tervezésébe és döntéseibe'},
    {id:'EN3',text:'A változásban rejlő lehetőségeket hangsúlyozom a félelmek mellett'},
    {id:'EN4',text:'Kis győzelmeket tervezek és ünneplek a lendület fenntartásáért'},
  ]},
  { id:'AD', name:'Adaptáció',            label:'Rugalmas végrehajtás',        color:BLUE, items:[
    {id:'AD1',text:'Menet közben is módosítom a tervet, ha a helyzet úgy kívánja'},
    {id:'AD2',text:'Akadályokra gyorsan reagálok és alternatívákat keresek'},
    {id:'AD3',text:'A változás tempóját a csapat befogadóképességéhez igazítom'},
    {id:'AD4',text:'Kísérletezésre és tanulásra bátorítom a csapatot'},
  ]},
  { id:'SU', name:'Fenntartás',           label:'Változás beágyazása és fenntartása', color:PURP, items:[
    {id:'SU1',text:'Rendszereket és folyamatokat alakítok a változás támogatásához'},
    {id:'SU2',text:'Nyomon követem a változás hatásait és szükség szerint korrigálok'},
    {id:'SU3',text:'Az új működésmódot beágyazom a szervezeti kultúrába'},
    {id:'SU4',text:'A változásból tanultakat dokumentálom és megosztom másokkal'},
  ]},
];

const PRESETS = [
  { id:'ledge-ai-aug',   name:'AI-augmentált vezető', subtitle:'LEDGE — általános alap', icon:'◈', dims:DEFAULT_DIMS,    itemCount:30, category:'leadership' },
  { id:'agile-leader',   name:'Agilis vezető',         subtitle:'Tech, startup, scrum',  icon:'⚡', dims:AGILE_DIMS,    itemCount:16, category:'leadership' },
  { id:'people-leader',  name:'Emberközpontú vezető',  subtitle:'HR, coaching',           icon:'❤', dims:PEOPLE_DIMS,   itemCount:16, category:'leadership' },
  { id:'strategic-exec', name:'Stratégiai vezető',     subtitle:'C-szint, board',         icon:'◎', dims:STRATEGIC_DIMS,itemCount:16, category:'leadership' },
  { id:'eq-assessment',  name:'Érzelmi intelligencia',  subtitle:'EQ — Daniel Goleman alapján', icon:'🧠', dims:EQ_DIMS,   itemCount:20, category:'classic' },
  { id:'growth-mindset', name:'Fejlődési szemlélet',    subtitle:'Growth mindset — Dweck alapján', icon:'🌱', dims:GROWTH_DIMS, itemCount:16, category:'classic' },
  { id:'stress-resilience', name:'Stressz és reziliencia', subtitle:'Megküzdés, egyensúly',   icon:'🛡', dims:STRESS_DIMS, itemCount:16, category:'classic' },
  { id:'communication',  name:'Kommunikációs készségek', subtitle:'Hallgatás, asszertivitás', icon:'💬', dims:COMM_DIMS,  itemCount:16, category:'classic' },
  { id:'disc-styles',    name:'DISC viselkedési stílusok', subtitle:'Marston — D/I/S/C profil', icon:'🎯', dims:DISC_DIMS,  itemCount:16, category:'classic' },
  { id:'psycap',         name:'Pszichológiai tőke',      subtitle:'Luthans — HERO modell',    icon:'⭐', dims:PSYCAP_DIMS, itemCount:16, category:'classic' },
  { id:'servant-leader', name:'Szolgáló vezetés',        subtitle:'Greenleaf — servant leadership', icon:'🤲', dims:SERVANT_DIMS, itemCount:16, category:'classic' },
  { id:'change-leader',  name:'Változásvezetés',         subtitle:'Kotter-inspirált',          icon:'🔄', dims:CHANGE_DIMS, itemCount:16, category:'classic' },
];

const DEFAULT_ROLES = [
  { id:'manager', label:'Felettes',  color:BLUE  },
  { id:'peer',    label:'Kolléga',   color:GREEN },
  { id:'direct',  label:'Beosztott', color:PURP  },
  { id:'other',   label:'Egyéb',     color:ORAN  },
];

// ─── STORAGE ───────────────────────────────────────────────────
// db is imported from ../lib/supabase (kv_store bridge)

// ─── UTILS ─────────────────────────────────────────────────────
function uid(n) {
  n = n || 12;
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < n; i++) s += c[Math.floor(Math.random() * c.length)];
  return s;
}
const getPreset  = (id) => PRESETS.find(p => p.id === id) || PRESETS[0];
// resolvePreset: returns { id, name, dims } — checks PRESETS first, then falls back to storedDims
function resolvePreset(libraryId, storedDims) {
  const preset = PRESETS.find(p => p.id === libraryId);
  if (preset) return preset;
  if (storedDims && storedDims.length > 0) {
    const totalItems = storedDims.reduce((s,d) => s + d.items.length, 0);
    return { id: libraryId || 'custom', name: 'Egyedi kérdőív', subtitle: 'Saját sablon', icon: '📝', dims: storedDims, itemCount: totalItems };
  }
  return PRESETS[0];
}
// ─── AUTH + AUDIT ──────────────────────────────────────────────
const auth = {
  async getSession() { return db.get('auth:session'); },
  async login(email, role) {
    const users = await db.get('auth:users') || [];
    let user = users.find(u => u.email === email);
    if (!user) {
      user = { id:'usr_'+uid(8), email, role:role||'leader', displayName:email.split('@')[0], created:Date.now(), lastLogin:Date.now() };
      users.push(user);
    } else { user.lastLogin = Date.now(); }
    await db.set('auth:users', users);
    await db.set('auth:session', user);
    await audit('login', user.id);
    return user;
  },
  async logout() { await db.del('auth:session'); },
  async getUsers() { return (await db.get('auth:users')) || []; },
  async updateRole(userId, newRole) {
    const users = await db.get('auth:users') || [];
    const u = users.find(x => x.id === userId);
    if (u) { const old = u.role; u.role = newRole; await db.set('auth:users', users); await audit('role_change', userId, {from:old,to:newRole}); }
  },
  async toggleBan(userId) {
    const users = await db.get('auth:users') || [];
    const u = users.find(x => x.id === userId);
    if (u) { u.banned = !u.banned; await db.set('auth:users', users); await audit(u.banned?'ban':'unban', userId); }
  },
};
async function audit(action, userId, details) {
  const log = await db.get('audit:log') || [];
  log.push({ action, userId, details:details||null, timestamp:Date.now() });
  if (log.length > 500) log.splice(0, log.length - 500);
  await db.set('audit:log', log);
}

const allIds     = (dims) => dims.flatMap(d => d.items.map(i => i.id));

// ─── CUSTOM TEMPLATE HELPERS ──────────────────────────────────
async function loadCustomTemplates() {
  const keys = await db.list('tpl:');
  const tpls = await Promise.all(keys.map(k => db.get(k)));
  return tpls.filter(Boolean).sort((a,b) => (b.created||0)-(a.created||0));
}
async function saveCustomTemplate(name, dims) {
  const id = 'tpl:' + uid(8);
  const totalItems = dims.reduce((s,d) => s + d.items.length, 0);
  const tpl = { id, name, dims, itemCount:totalItems, dimCount:dims.length, created:Date.now() };
  await db.set(id, tpl);
  return tpl;
}
async function deleteCustomTemplate(id) {
  await db.del(id);
}
const dimAvg     = (scores, dim) => { const v = dim.items.map(i => scores && scores[i.id]).filter(x => x > 0); return v.length ? +(v.reduce((a,b)=>a+b,0)/v.length).toFixed(2) : 0; };
const countFilled= (scores, dims) => allIds(dims).filter(id => (scores && scores[id] || 0) > 0).length;
const overallAvg = (scores, dims) => { const v = allIds(dims).map(id => scores && scores[id]).filter(x => x > 0); return v.length ? +(v.reduce((a,b)=>a+b,0)/v.length).toFixed(2) : 0; };
const mergeScoresets = (sets) => {
  if (!sets || !sets.length) return {};
  const all = {};
  sets.forEach(s => { if (!s) return; Object.keys(s).forEach(k => { if (!all[k]) all[k] = []; if (s[k] > 0) all[k].push(s[k]); }); });
  const out = {};
  Object.keys(all).forEach(k => { out[k] = all[k].length ? +(all[k].reduce((a,b)=>a+b,0)/all[k].length).toFixed(2) : 0; });
  return out;
};

// ─── SHARED UI ─────────────────────────────────────────────────
// FIX: disabled ? 0.45 : 1  (was: disabled?.45 which is ambiguous)
function Btn(props) {
  const { children, onClick, variant, size, disabled, style } = props;
  const v = variant || 'primary';
  const sz = size || 'md';
  const st = style || {};
  const base = {
    display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6,
    fontFamily:"'DM Sans',sans-serif", fontWeight:500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    border:'none', transition:'all .18s', letterSpacing:'.01em', whiteSpace:'nowrap',
  };
  const sizes = {
    sm:{ padding:'5px 12px',  fontSize:12, borderRadius:6 },
    md:{ padding:'9px 18px',  fontSize:13, borderRadius:8 },
    lg:{ padding:'13px 28px', fontSize:15, borderRadius:10 },
  };
  const variants = {
    primary:      { background:GOLD, color:'#FFFFFF', boxShadow:'0 1px 3px rgba(0,0,0,.4)' },
    ghost:        { background:'transparent', border:`1px solid ${BORD}`, color:TEXT },
    danger:       { background:`${RED}10`, border:`1px solid ${RED}30`, color:RED },
    subtle:       { background:'transparent', color:MUTED },
    outline_gold: { background:'transparent', border:`1px solid ${GDIM}`, color:GOLD },
  };
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={Object.assign({}, base, sizes[sz], variants[v], st)}
    >
      {children}
    </button>
  );
}

function Input({ label, value, onChange, placeholder, type, style }) {
  const t = type || 'text';
  const st = style || {};
  return (
    <div style={{marginBottom:14}}>
      {label && <div style={{fontSize:11,color:MUTED,marginBottom:5,textTransform:'uppercase',letterSpacing:'.08em'}}>{label}</div>}
      <input
        type={t} value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={Object.assign({width:'100%',background:S2,border:`1px solid ${BORD}`,borderRadius:10,padding:'11px 16px',color:TEXT,fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:'none',boxSizing:'border-box',transition:'border-color .2s'}, st)}
      />
    </div>
  );
}

function Badge({ children, color, style }) {
  const c = color || GOLD;
  const st = style || {};
  return (
    <span style={Object.assign({display:'inline-block',background:`${c}14`,color:c,border:`1px solid ${c}28`,borderRadius:20,padding:'3px 12px',fontSize:11,fontWeight:600,letterSpacing:'.04em'}, st)}>
      {children}
    </span>
  );
}

function Card({ children, style, onClick }) {
  const st = style || {};
  return (
    <div onClick={onClick} style={Object.assign({background:SURF,border:`1px solid ${BORD}`,borderRadius:14,padding:22,boxShadow:'0 1px 3px rgba(0,0,0,.3)'}, st)}>
      {children}
    </div>
  );
}

function TopBar({ title, subtitle, back, onBack, right }) {
  return (
    <div style={{background:'#111110',borderBottom:`1px solid ${BORD}`,padding:'0 28px',height:60,display:'flex',alignItems:'center',gap:16,position:'sticky',top:0,zIndex:100,boxShadow:'0 1px 3px rgba(0,0,0,.03)'}}>
      {back && (
        <button onClick={onBack} style={{background:S2,border:`1px solid ${BORD}`,color:TEXT,cursor:'pointer',fontSize:16,width:34,height:34,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all .15s'}}>
          {'←'}
        </button>
      )}
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontFamily:"'Instrument Serif',serif",fontSize:16,color:TEXT,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{title}</div>
        {subtitle && <div style={{fontSize:11,color:MUTED,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{subtitle}</div>}
      </div>
      {right && <div style={{flexShrink:0}}>{right}</div>}
      <div style={{display:'flex',alignItems:'center',gap:3,flexShrink:0,marginLeft:8}}>
        <div style={{width:28,height:28,borderRadius:8,background:TEXT,display:'flex',alignItems:'center',justifyContent:'center',color:BG,fontFamily:"'Instrument Serif',serif",fontSize:14}}>L</div>
        <span style={{fontFamily:"'Instrument Serif',serif",fontSize:13,color:MUTED,marginLeft:4}}>360°</span>
      </div>
    </div>
  );
}

function StatusDot({ status }) {
  const col = status === 'done' ? GREEN : status === 'in_progress' ? GOLD : MUTED;
  const lbl = status === 'done' ? 'Kész' : status === 'in_progress' ? 'Folyamatban' : 'Vár';
  return (
    <span style={{display:'inline-flex',alignItems:'center',gap:4,fontSize:11,color:col,flexShrink:0}}>
      <span style={{width:6,height:6,borderRadius:'50%',background:col,display:'inline-block'}}/>
      {lbl}
    </span>
  );
}

function MiniBar({ val, max, color }) {
  const m = max || 5;
  const c = color || GOLD;
  const pct = Math.min(100, Math.max(0, (val / m) * 100));
  return (
    <div style={{flex:1,height:4,background:'#E8E6E0',borderRadius:3,overflow:'hidden'}}>
      <div style={{width:`${pct}%`,height:'100%',background:c,borderRadius:3,transition:'width .4s ease'}}/>
    </div>
  );
}

function CopyCode({ code, size }) {
  const [copied, setCopied] = useState(false);
  const sz = size || 'md';
  const fontSize = sz === 'lg' ? 18 : 13;
  const pad = sz === 'lg' ? '12px 16px' : '5px 12px';
  function handleCopy() {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div style={{display:'inline-flex',alignItems:'center',gap:6}}>
      <div style={{fontFamily:'monospace',fontSize,color:GOLD,letterSpacing:'.1em',fontWeight:700,background:`${GOLD}11`,border:`1px solid ${GDIM}`,borderRadius:8,padding:pad,cursor:'pointer',display:'inline-flex',alignItems:'center',gap:8}} onClick={handleCopy}>
        <span>{code}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={copied?GREEN:MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
          {copied ? (
            <polyline points="20 6 9 17 4 12"/>
          ) : (
            <>
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </>
          )}
        </svg>
      </div>
      {copied && <span style={{fontSize:10,color:GREEN}}>Másolva</span>}
    </div>
  );
}

// FIX: ConfirmModal extracted as a simple standalone component — no hooks inside
function ConfirmModal({ title, message, confirmLabel, onConfirm, onCancel }) {
  const lbl = confirmLabel || 'Igen';
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.25)',backdropFilter:'blur(4px)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:SURF,border:`1px solid ${BORD}`,borderRadius:18,padding:30,boxShadow:'0 8px 30px rgba(0,0,0,.5)',width:'100%',maxWidth:380}}>
        <div style={{fontFamily:"'Instrument Serif',serif",fontSize:18,color:TEXT,marginBottom:10}}>{title}</div>
        <div style={{fontSize:14,color:MUTED,lineHeight:1.6,marginBottom:24}}>{message}</div>
        <div style={{display:'flex',gap:10}}>
          <Btn variant="danger" onClick={onConfirm}>{lbl}</Btn>
          <Btn variant="ghost"  onClick={onCancel}>Mégse</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── REPORT VIEW ───────────────────────────────────────────────
function ReportView({ dims, selfScores, groups, comments, scaleMax: propScaleMax }) {
  const sMax = propScaleMax || 5;
  const ss = selfScores || {};
  const gs = groups || [];
  const allComments = comments || [];
  const [tab,      setTab]      = useState('overview');
  const [expanded, setExpanded] = useState({});

  const allOtherSets = gs.flatMap(g => g.scores || []);
  const othersAvg    = mergeScoresets(allOtherSets);
  const hasOthers    = allOtherSets.length > 0;
  const hasSelf      = Object.keys(ss).length > 0;
  const groupAvgs    = gs.map(g => ({ ...g, avg: mergeScoresets(g.scores || []) }));

  const radarData = dims.map(d => {
    const row = { dim:d.id, 'Önértékelés':dimAvg(ss,d) };
    if (hasOthers) row['Mások átlaga'] = dimAvg(othersAvg, d);
    return row;
  });
  const barData = dims.map(d => ({
    name:d.id, label:d.label, color:d.color,
    'Önértékelés': dimAvg(ss, d),
    ...(hasOthers ? {'Mások átlaga': dimAvg(othersAvg, d)} : {}),
  }));

  const allItems   = dims.flatMap(d => d.items.map(i => ({...i, dimLabel:d.label})));
  const selfArr    = allItems.map(i => ({...i, self:ss[i.id]||0, others:othersAvg[i.id]||0})).filter(i => i.self > 0);
  const top5       = [...selfArr].sort((a,b) => b.self - a.self).slice(0, 5);
  const bot5       = [...selfArr].sort((a,b) => a.self - b.self).slice(0, 5);
  const blindSpots = selfArr.filter(i => i.others > 0 && i.self - i.others >= 1.0);
  const hiddenStr  = selfArr.filter(i => i.others > 0 && i.others - i.self >= 1.0);

  function CT({ active, payload }) {
    if (!active || !payload || !payload.length) return null;
    return (
      <div style={{background:SURF,border:`1px solid ${BORD}`,borderRadius:10,padding:'10px 14px',fontSize:12,boxShadow:'0 4px 12px rgba(0,0,0,.4)'}}>
        {payload.map((p, i) => (
          <div key={i} style={{color:p.color||TEXT}}>{p.name}: <b>{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</b></div>
        ))}
      </div>
    );
  }

  const TABS = [
    {id:'overview',   label:'Áttekintés'},
    {id:'heatmap',    label:'Hőtérkép'},
    {id:'highlights', label:'Kiemelések'},
    {id:'feedback',   label:'Szöveges visszajelzés'},
    {id:'trend',      label:'Trend'},
  ];

  return (
    <div style={{background:SURF,border:`1px solid ${BORD}`,borderRadius:14,overflow:'hidden'}}>
      {/* Tab bar */}
      <div style={{display:'flex',borderBottom:`1px solid ${BORD}`,background:S2}}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{flex:1,padding:'13px 6px',border:'none',background:'none',cursor:'pointer',fontSize:13,fontFamily:"'DM Sans',sans-serif",color:tab===t.id?GOLD:MUTED,borderBottom:tab===t.id?`2px solid ${GOLD}`:'2px solid transparent',fontWeight:tab===t.id?600:400,transition:'all .15s'}}>
            {t.label}
          </button>
        ))}
        <button onClick={() => window.print()}
          style={{padding:'13px 14px',border:'none',background:'none',cursor:'pointer',color:MUTED,fontSize:13,display:'flex',alignItems:'center',gap:5,flexShrink:0,fontFamily:"'DM Sans',sans-serif"}}
          title="Nyomtatás / PDF mentés">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"/>
            <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8"/>
          </svg>
          Nyomtatás
        </button>
      </div>

      <div style={{padding:24}}>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,marginBottom:20}}>
              <div>
                <div style={{fontSize:11,color:MUTED,marginBottom:10,textTransform:'uppercase',letterSpacing:'.08em'}}>Radar</div>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData} margin={{top:10,right:30,bottom:10,left:30}}>
                    <PolarGrid stroke={BORD}/>
                    <PolarAngleAxis dataKey="dim" tick={{fill:MUTED,fontSize:11}}/>
                    <PolarRadiusAxis domain={[0,sMax]} tickCount={sMax+1} tick={false} axisLine={false}/>
                    <Radar name="Önértékelés" dataKey="Önértékelés" stroke={GOLD} fill={GOLD} fillOpacity={0.15} strokeWidth={2} dot={{fill:GOLD,r:3}}/>
                    {hasOthers && <Radar name="Mások átlaga" dataKey="Mások átlaga" stroke={BLUE} fill={BLUE} fillOpacity={0.1} strokeWidth={2} strokeDasharray="4 2" dot={{fill:BLUE,r:3}}/>}
                    {hasOthers && <Legend wrapperStyle={{fontSize:12,color:MUTED}}/>}
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <div style={{fontSize:11,color:MUTED,marginBottom:10,textTransform:'uppercase',letterSpacing:'.08em'}}>Dimenzió átlagok</div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={barData} layout="vertical" margin={{left:55}}>
                    <XAxis type="number" domain={[0,sMax]} tick={{fill:MUTED,fontSize:10}} axisLine={false} tickLine={false}/>
                    <YAxis type="category" dataKey="name" tick={{fill:MUTED,fontSize:11}} axisLine={false} tickLine={false} width={48}/>
                    <Tooltip content={<CT/>}/>
                    <Bar dataKey="Önértékelés" radius={4}>
                      {barData.map((b,i) => <Cell key={i} fill={b.color} fillOpacity={0.85}/>)}
                    </Bar>
                    {hasOthers && <Bar dataKey="Mások átlaga" fill={BLUE} fillOpacity={0.45} radius={4}/>}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Collapsible group breakdown */}
            {groupAvgs.length > 0 && (
              <div style={{marginTop:4}}>
                <div style={{fontSize:11,color:MUTED,marginBottom:10,textTransform:'uppercase',letterSpacing:'.08em'}}>Csoportonkénti bontás</div>
                {groupAvgs.map(g => {
                  const done  = (g.scores || []).length;
                  const gOv   = done > 0 ? overallAvg(g.avg, dims) : null;
                  const isOpen = !!expanded[g.id];
                  return (
                    <div key={g.id} style={{background:S2,border:`1px solid ${BORD}`,borderRadius:10,marginBottom:8,overflow:'hidden'}}>
                      <button
                        onClick={() => setExpanded(prev => ({ ...prev, [g.id]: !prev[g.id] }))}
                        style={{width:'100%',background:'none',border:'none',cursor:'pointer',padding:'12px 16px',display:'flex',alignItems:'center',gap:12,textAlign:'left'}}>
                        <span style={{fontSize:20}}>{g.emoji}</span>
                        <span style={{fontSize:14,color:TEXT,flex:1,fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>{g.name}</span>
                        {done === 0
                          ? <span style={{fontSize:12,color:MUTED}}>Még nincs adat</span>
                          : (
                            <span style={{display:'flex',alignItems:'center',gap:8}}>
                              <span style={{fontSize:12,color:MUTED}}>{done} értékelő</span>
                              <span style={{fontFamily:"'Instrument Serif',serif",fontSize:18,color:g.color||GOLD,fontWeight:600}}>{gOv !== null ? gOv.toFixed(1) : '—'}</span>
                            </span>
                          )
                        }
                        <span style={{fontSize:13,color:MUTED,marginLeft:6}}>{isOpen ? '▲' : '▼'}</span>
                      </button>
                      {isOpen && done > 0 && (
                        <div style={{padding:'0 16px 14px',borderTop:`1px solid ${BORD}`}}>
                          {dims.map(d => {
                            const gv   = dimAvg(g.avg, d);
                            const sv   = dimAvg(ss, d);
                            const diff = (sv > 0 && gv > 0) ? +(sv - gv).toFixed(2) : null;
                            return (
                              <div key={d.id} style={{display:'flex',alignItems:'center',gap:10,padding:'7px 0',borderBottom:`1px solid ${BORD}`}}>
                                <span style={{fontSize:11,color:d.color,fontWeight:700,width:28,flexShrink:0}}>{d.id}</span>
                                <span style={{fontSize:12,color:MUTED,flex:1}}>{d.label}</span>
                                <MiniBar val={gv} color={g.color || GOLD}/>
                                <span style={{fontSize:13,color:TEXT,width:28,textAlign:'right',fontWeight:600}}>{gv > 0 ? gv.toFixed(1) : '—'}</span>
                                {diff !== null && (
                                  <span style={{fontSize:11,width:36,textAlign:'right',color:diff>0?RED:GREEN}}>
                                    {diff > 0 ? '+' + diff.toFixed(1) : diff.toFixed(1)}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Score tiles */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(108px,1fr))',gap:8,marginTop:18}}>
              {dims.map(d => {
                const s    = dimAvg(ss, d);
                const o    = hasOthers ? dimAvg(othersAvg, d) : null;
                const diff = (o !== null && s > 0 && o > 0) ? +(s - o).toFixed(2) : null;
                return (
                  <div key={d.id} style={{background:S3,borderRadius:10,padding:'12px 14px',border:`1px solid ${BORD}`}}>
                    <div style={{fontSize:10,color:d.color,fontWeight:700,letterSpacing:'.06em',marginBottom:3}}>{d.id}</div>
                    <div style={{fontSize:22,fontFamily:"'Instrument Serif',serif",color:TEXT,fontWeight:600}}>{s > 0 ? s.toFixed(1) : '—'}</div>
                    {diff !== null && (
                      <div style={{fontSize:11,color:diff>0?RED:GREEN,marginTop:1}}>
                        {diff > 0 ? '▲' : '▼'} {Math.abs(diff).toFixed(1)}
                      </div>
                    )}
                    <div style={{fontSize:10,color:MUTED,marginTop:3,lineHeight:1.3}}>{d.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* HEATMAP */}
        {tab === 'heatmap' && (
          <div style={{overflowX:'auto'}}>
            {dims.map(d => (
              <div key={d.id} style={{marginBottom:24}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                  <span style={{fontSize:11,fontWeight:700,color:d.color,letterSpacing:'.06em'}}>{d.id}</span>
                  <span style={{fontSize:13,color:TEXT}}>{d.label}</span>
                </div>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                  <thead>
                    <tr>
                      <th style={{textAlign:'left',padding:'6px 10px',color:MUTED,fontSize:11,background:S2}}>Kompetencia</th>
                      <th style={{textAlign:'center',padding:'6px 10px',color:GOLD,fontSize:11,background:S2,width:70}}>Én</th>
                      {hasOthers && <th style={{textAlign:'center',padding:'6px 10px',color:BLUE,fontSize:11,background:S2,width:80}}>Mások</th>}
                      {groupAvgs.map(g => (
                        <th key={g.id} style={{textAlign:'center',padding:'6px 10px',color:g.color||GOLD,fontSize:11,background:S2,width:80}}>
                          {g.emoji} {g.name}
                        </th>
                      ))}
                      {hasOthers && <th style={{textAlign:'center',padding:'6px 10px',color:MUTED,fontSize:11,background:S2,width:55}}>{'Δ'}</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {d.items.map((item, idx) => {
                      const sv      = ss[item.id] || 0;
                      const ov      = othersAvg[item.id] || 0;
                      const diff    = ov > 0 ? +(sv - ov).toFixed(2) : null;
                      const isBlind = diff !== null && diff >= 1.0;
                      const isHid   = diff !== null && diff <= -1.0;
                      return (
                        <tr key={item.id} style={{background: idx%2===0 ? 'transparent' : S2+'88'}}>
                          <td style={{padding:'8px 10px',color:TEXT}}>
                            {item.text}
                            {isBlind && <span style={{marginLeft:8,color:RED,fontSize:11}}> ▲ Vak folt</span>}
                            {isHid   && <span style={{marginLeft:8,color:GREEN,fontSize:11}}> ▼ Rejtett erősség</span>}
                          </td>
                          <td style={{textAlign:'center',padding:'8px 10px'}}>
                            {sv > 0
                              ? <span style={{background:`${scoreColor(sv,sMax)}33`,color:scoreColor(sv,sMax),borderRadius:6,padding:'2px 8px',fontSize:12,fontWeight:700}}>{sv}</span>
                              : '—'}
                          </td>
                          {hasOthers && (
                            <td style={{textAlign:'center',padding:'8px 10px'}}>
                              {ov > 0
                                ? <span style={{background:`${scoreColor(ov,sMax)}33`,color:scoreColor(ov,sMax),borderRadius:6,padding:'2px 8px',fontSize:12,fontWeight:700}}>{ov.toFixed(1)}</span>
                                : '—'}
                            </td>
                          )}
                          {groupAvgs.map(g => {
                            const gv = (g.avg && g.avg[item.id]) || 0;
                            return (
                              <td key={g.id} style={{textAlign:'center',padding:'8px 10px'}}>
                                {gv > 0
                                  ? <span style={{background:`${g.color||GOLD}22`,color:g.color||GOLD,borderRadius:6,padding:'2px 8px',fontSize:12,fontWeight:600}}>{gv.toFixed(1)}</span>
                                  : '—'}
                              </td>
                            );
                          })}
                          {hasOthers && (
                            <td style={{textAlign:'center',padding:'8px 10px',fontSize:12,fontWeight:600,color:diff===null?MUTED:diff>0?RED:GREEN}}>
                              {diff !== null ? (diff > 0 ? '+' + diff.toFixed(1) : diff.toFixed(1)) : '—'}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}

        {/* HIGHLIGHTS */}
        {tab === 'highlights' && (
          <div>
            {!hasSelf && (
              <div style={{textAlign:'center',padding:'40px 0',color:MUTED}}>
                <div style={{fontSize:28,marginBottom:10}}>📊</div>
                <div>Az önértékelés beküldése után jelennek meg a kiemelések.</div>
              </div>
            )}
            {hasSelf && (
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
                <div>
                  <div style={{fontSize:12,color:GREEN,fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:12}}>Top 5 erősség</div>
                  {top5.map((item, idx) => (
                    <div key={item.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 0',borderBottom:`1px solid ${BORD}`}}>
                      <span style={{fontSize:16,fontFamily:"'Instrument Serif',serif",color:GREEN,width:22,flexShrink:0}}>{idx+1}</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,color:TEXT}}>{item.text}</div>
                        <div style={{fontSize:11,color:MUTED,marginTop:2}}>{item.dimLabel}</div>
                      </div>
                      <span style={{background:`${GREEN}22`,color:GREEN,borderRadius:6,padding:'2px 10px',fontSize:13,fontWeight:700}}>{item.self}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{fontSize:12,color:ORAN,fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:12}}>Top 5 fejlesztési terület</div>
                  {bot5.map((item, idx) => (
                    <div key={item.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 0',borderBottom:`1px solid ${BORD}`}}>
                      <span style={{fontSize:16,fontFamily:"'Instrument Serif',serif",color:ORAN,width:22,flexShrink:0}}>{idx+1}</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,color:TEXT}}>{item.text}</div>
                        <div style={{fontSize:11,color:MUTED,marginTop:2}}>{item.dimLabel}</div>
                      </div>
                      <span style={{background:`${ORAN}22`,color:ORAN,borderRadius:6,padding:'2px 10px',fontSize:13,fontWeight:700}}>{item.self}</span>
                    </div>
                  ))}
                </div>
                {hasOthers && (
                  <div>
                    <div style={{fontSize:12,color:RED,fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:8}}>
                      ▲ Vak foltok <span style={{fontSize:11,color:MUTED,fontWeight:400}}>(én {'≥'}1 {'>'} mások)</span>
                    </div>
                    {blindSpots.length === 0
                      ? <div style={{color:MUTED,fontSize:13}}>Nincs detektált vak folt.</div>
                      : blindSpots.map(item => (
                          <div key={item.id} style={{padding:'8px 0',borderBottom:`1px solid ${BORD}`}}>
                            <div style={{fontSize:13,color:TEXT}}>{item.text}</div>
                            <div style={{fontSize:11,color:MUTED,marginTop:2}}>
                              Én: <b style={{color:RED}}>{item.self}</b> · Mások: <b>{item.others.toFixed(1)}</b>
                            </div>
                          </div>
                        ))
                    }
                  </div>
                )}
                {hasOthers && (
                  <div>
                    <div style={{fontSize:12,color:GREEN,fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:8}}>
                      ▼ Rejtett erősségek <span style={{fontSize:11,color:MUTED,fontWeight:400}}>(mások {'≥'}1 {'>'} én)</span>
                    </div>
                    {hiddenStr.length === 0
                      ? <div style={{color:MUTED,fontSize:13}}>Nincs detektált rejtett erősség.</div>
                      : hiddenStr.map(item => (
                          <div key={item.id} style={{padding:'8px 0',borderBottom:`1px solid ${BORD}`}}>
                            <div style={{fontSize:13,color:TEXT}}>{item.text}</div>
                            <div style={{fontSize:11,color:MUTED,marginTop:2}}>
                              Én: <b>{item.self}</b> · Mások: <b style={{color:GREEN}}>{item.others.toFixed(1)}</b>
                            </div>
                          </div>
                        ))
                    }
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'feedback' && (
          <div>
            {allComments.length === 0 ? (
              <div style={{color:MUTED,fontSize:14,padding:'40px 0',textAlign:'center'}}>
                <div style={{fontSize:32,marginBottom:12}}>💬</div>
                <div>Még nincs szöveges visszajelzés.</div>
                <div style={{fontSize:12,marginTop:6}}>A kitöltők az értékelés végén opcionálisan megjegyzést fűzhetnek.</div>
              </div>
            ) : (
              <div>
                <div style={{fontSize:11,color:MUTED,marginBottom:16,textTransform:'uppercase',letterSpacing:'.08em'}}>{allComments.length} visszajelzés</div>
                {allComments.map((c, i) => {
                  const isObj = c.text && typeof c.text === 'object';
                  const hasGrowth   = isObj && c.text.growth;
                  const hasStrength = isObj && c.text.strength;
                  const plainText   = !isObj ? c.text : null;
                  return (
                    <div key={i} style={{background:S2,border:`1px solid ${BORD}`,borderRadius:12,padding:'16px 18px',marginBottom:10}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                        {c.emoji && <span style={{fontSize:16}}>{c.emoji}</span>}
                        <span style={{fontSize:12,color:c.color||MUTED,fontWeight:600}}>{c.groupName || c.roleName || 'Értékelő'}</span>
                        {c.timestamp && <span style={{fontSize:11,color:DIM,marginLeft:'auto'}}>{new Date(c.timestamp).toLocaleDateString('hu-HU')}</span>}
                      </div>
                      {plainText && (
                        <div style={{fontSize:14,color:TEXT,lineHeight:1.6,fontStyle:'italic'}}>"{plainText}"</div>
                      )}
                      {hasGrowth && (
                        <div style={{marginBottom:hasStrength?10:0}}>
                          <div style={{fontSize:11,color:ORAN,fontWeight:700,marginBottom:4}}>🌱 Fejlődési lehetőségek</div>
                          <div style={{fontSize:14,color:TEXT,lineHeight:1.6,fontStyle:'italic',paddingLeft:8,borderLeft:`2px solid ${ORAN}44`}}>"{c.text.growth}"</div>
                        </div>
                      )}
                      {hasStrength && (
                        <div>
                          <div style={{fontSize:11,color:GREEN,fontWeight:700,marginBottom:4}}>💪 Erősségek</div>
                          <div style={{fontSize:14,color:TEXT,lineHeight:1.6,fontStyle:'italic',paddingLeft:8,borderLeft:`2px solid ${GREEN}44`}}>"{c.text.strength}"</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {tab === 'trend' && (
          <div style={{padding:'48px 20px',textAlign:'center'}}>
            <div style={{width:64,height:64,borderRadius:16,background:`${GOLD}12`,border:`1px solid ${GOLD}28`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:30,margin:'0 auto 16px'}}>📈</div>
            <div style={{fontFamily:"'Instrument Serif',serif",fontSize:20,color:TEXT,marginBottom:8}}>Trend elemzés</div>
            <div style={{fontSize:14,color:MUTED,maxWidth:380,margin:'0 auto',lineHeight:1.6,marginBottom:20}}>
              Az ismételt mérések időbeli változásait itt fogod látni. Töltsd ki újra az önértékelést egy későbbi időpontban, és a rendszer automatikusan összehasonlítja az eredményeket.
            </div>
            <Badge color={GOLD}>Hamarosan elérhető</Badge>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SURVEY VIEW ───────────────────────────────────────────────
function SurveyView({ nav, goBack, ctx }) {
  const mode        = ctx.mode;
  const dims        = ctx.dims;
  const surveyTitle = ctx.surveyTitle;
  const raterCode   = ctx.raterCode;
  const raterId     = ctx.raterId;
  const groupId     = ctx.groupId;
  const libraryId   = ctx.libraryId;
  const scaleId     = ctx.scaleId || '5pt';
  const [activeScale, setActiveScale] = useState(scaleId);
  const [showScaleSettings, setShowScaleSettings] = useState(false);
  const scaleCfg    = getScaleConfig(activeScale);
  const scaleMax    = scaleCfg.labels.length - 1;

  const [scores,    setScores]    = useState({});
  const [activeDim, setActiveDim] = useState(0);
  const [saving,    setSaving]    = useState(false);
  const [commentGrowth,   setCommentGrowth]   = useState('');
  const [commentStrength, setCommentStrength] = useState('');
  const [draftLoaded, setDraftLoaded] = useState(false);

  // Draft key for auto-save — unique per libraryId to avoid collisions
  const draftKey = mode === 'self' ? 'draft:self:' + (libraryId || 'default') : raterCode ? 'draft:'+raterCode : null;

  // Load saved draft on mount
  useEffect(() => {
    if (!draftKey) { setDraftLoaded(true); return; }
    (async () => {
      const draft = await db.get(draftKey);
      if (draft) {
        if (draft.scores) setScores(draft.scores);
        if (draft.commentGrowth) setCommentGrowth(draft.commentGrowth);
        if (draft.commentStrength) setCommentStrength(draft.commentStrength);
        // backward compat: old single comment field
        if (draft.comment && typeof draft.comment === 'string' && !draft.commentGrowth) setCommentGrowth(draft.comment);
        if (typeof draft.activeDim === 'number') setActiveDim(draft.activeDim);
      }
      setDraftLoaded(true);
    })();
  }, [draftKey]);

  // Auto-save draft on score/comment/dim change (debounced)
  const saveTimer = useRef(null);
  useEffect(() => {
    if (!draftKey || !draftLoaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      db.set(draftKey, { scores, commentGrowth, commentStrength, activeDim, timestamp: Date.now() });
    }, 800);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [scores, commentGrowth, commentStrength, activeDim, draftKey, draftLoaded]);

  const safeDims   = dims || [];
  const totalItems = allIds(safeDims).length;
  const filled     = countFilled(scores, safeDims);
  const pct        = totalItems > 0 ? Math.round(filled / totalItems * 100) : 0;

  function dimDone(d) { return d.items.every(i => (scores[i.id] || 0) > 0); }

  async function handleSubmit() {
    if (filled < totalItems) return;
    setSaving(true);
    if (mode === 'self') {
      const selfId = uid(8);
      const commentObj = (commentGrowth.trim() || commentStrength.trim()) ? { growth: commentGrowth.trim(), strength: commentStrength.trim() } : null;
      const selfEntry = { libraryId: libraryId, scores: scores, dims: dims, comment: commentObj, scaleId: activeScale, timestamp: Date.now(), customName: ctx.customName || null };
      await db.set('self:' + selfId, selfEntry);
      // Also update leader_self for backward compat
      await db.set('leader_self', selfEntry);
      // Add to multi-self index
      const idx = await db.get('leader_selves') || [];
      idx.push({ id: selfId, customName: ctx.customName || null });
      await db.set('leader_selves', idx);
      if (draftKey) await db.del(draftKey);
      nav('self_report', { selfId: selfId });
    } else {
      if (raterCode) {
        const commentObj = (commentGrowth.trim() || commentStrength.trim()) ? { growth: commentGrowth.trim(), strength: commentStrength.trim() } : null;
        await db.set('resp:' + raterCode, { scores: scores, comment: commentObj, raterCode: raterCode, groupId: groupId || null, completed: true, timestamp: Date.now() });
        if (groupId) {
          const grps = await db.get('leader_groups');
          if (grps) {
            const updated = grps.map(g =>
              g.id === groupId
                ? { ...g, members: g.members.map(m => m.code === raterCode ? { ...m, status:'done' } : m) }
                : g
            );
            await db.set('leader_groups', updated);
          }
        }
        if (raterId) {
          const rat = await db.get(raterId);
          if (rat) await db.set(raterId, { ...rat, status:'done' });
        }
      }
      if (groupId && !raterId) {
        if (draftKey) await db.del(draftKey);
        nav('survey_done', { returnTo:'group_manage', returnGroupId:groupId });
      } else {
        if (draftKey) await db.del(draftKey);
        nav('survey_done', { returnTo:null, returnGroupId:null });
      }
    }
    setSaving(false);
  }

  if (!safeDims.length) {
    return (
      <div style={{padding:60,textAlign:'center',color:MUTED,background:BG,minHeight:'100vh'}}>
        <div style={{fontSize:32,marginBottom:12}}>⚠</div>
        <div>Hiányzó konfiguráció — kérjük indulj a főoldalról.</div>
        <div style={{marginTop:20}}>
          <Btn variant="ghost" onClick={() => nav('home')}>Főoldal</Btn>
        </div>
      </div>
    );
  }

  const curDim = safeDims[activeDim];

  return (
    <div style={{background:BG,minHeight:'100vh'}}>
      <div style={{position:'sticky',top:0,zIndex:100,background:'#111110',borderBottom:`1px solid ${BORD}`}}>
        <div style={{padding:'0 20px',height:52,display:'flex',alignItems:'center',gap:12}}>
          <button onClick={goBack} style={{background:'none',border:'none',color:MUTED,cursor:'pointer',fontSize:18,padding:'0 4px',display:'flex',alignItems:'center',flexShrink:0}}>{'‹'}</button>
          <div style={{flex:1,fontSize:13,color:TEXT,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
            {surveyTitle || 'Értékelés'}
          </div>
          <span style={{fontSize:12,color:MUTED,flexShrink:0}}>{filled}/{totalItems}</span>
          <span style={{background:`${GOLD}22`,color:GOLD,borderRadius:20,padding:'3px 12px',fontSize:12,fontWeight:700,flexShrink:0}}>{pct}%</span>
          {draftLoaded && Object.keys(scores).length > 0 && pct < 100 && <span style={{fontSize:10,color:GREEN,flexShrink:0}}>💾</span>}
          <button onClick={() => setShowScaleSettings(p => !p)} title="Skála beállítások"
            style={{background:showScaleSettings?`${GOLD}22`:'none',border:`1px solid ${showScaleSettings?GOLD:BORD}`,borderRadius:6,cursor:'pointer',width:24,height:24,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:13,color:showScaleSettings?GOLD:MUTED,transition:'all .15s'}}>⚙</button>
          <div style={{width:22,height:22,borderRadius:6,background:TEXT,display:'flex',alignItems:'center',justifyContent:'center',color:BG,fontFamily:"'Instrument Serif',serif",fontSize:10,flexShrink:0}}>L</div>
        </div>
        <div style={{height:3,background:BORD}}>
          <div style={{height:'100%',width:`${pct}%`,background:GOLD,transition:'width .3s',borderRadius:2}}/>
        </div>
        <div style={{display:'flex',overflowX:'auto',padding:'0 20px',gap:2,background:S2,borderTop:`1px solid ${BORD}`}}>
          {safeDims.map((d, i) => (
            <button key={d.id} onClick={() => setActiveDim(i)}
              style={{padding:'8px 12px',border:'none',background:'none',cursor:'pointer',fontSize:12,fontFamily:"'DM Sans',sans-serif",color:activeDim===i?d.color:MUTED,borderBottom:activeDim===i?`2px solid ${d.color}`:'2px solid transparent',whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:4,fontWeight:activeDim===i?600:400}}>
              {dimDone(d) && <span style={{color:GREEN,fontSize:9}}>✓</span>}
              {d.id}
            </button>
          ))}
        </div>
      </div>

      {/* Scale settings panel */}
      {showScaleSettings && (
        <div style={{maxWidth:700,margin:'0 auto',padding:'16px 20px 0'}}>
          <div style={{background:SURF,border:`1px solid ${GDIM}`,borderRadius:12,padding:'14px 18px'}}>
            <div style={{fontSize:11,color:GOLD,fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:10}}>Értékelési skála</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:10}}>
              {SCALE_PRESETS.map(sp => (
                <button key={sp.id} onClick={() => { if (filled === 0) { setActiveScale(sp.id); } }}
                  style={{padding:'6px 12px',border:`1px solid ${activeScale===sp.id?GOLD:BORD}`,borderRadius:8,background:activeScale===sp.id?`${GOLD}14`:'transparent',color:activeScale===sp.id?GOLD:TEXT,fontSize:12,cursor:filled>0?'not-allowed':'pointer',opacity:filled>0&&activeScale!==sp.id?0.4:1,fontFamily:"'DM Sans',sans-serif",fontWeight:activeScale===sp.id?600:400,transition:'all .15s'}}>
                  {sp.name}
                </button>
              ))}
            </div>
            <div style={{display:'flex',gap:4,alignItems:'center',flexWrap:'wrap'}}>
              {Array.from({length:scaleCfg.labels.length-1},(_,i)=>i+1).map(v => (
                <span key={v} style={{background:`${scaleCfg.colors[v]||GOLD}22`,color:scaleCfg.colors[v]||GOLD,borderRadius:6,padding:'3px 8px',fontSize:10,fontWeight:600}}>
                  {v}: {scaleCfg.labels[v]}
                </span>
              ))}
            </div>
            {filled > 0 && <div style={{fontSize:11,color:ORAN,marginTop:8}}>⚠ Skála csak üres kérdőívnél módosítható. Töröld a válaszokat az újrakezdéshez.</div>}
          </div>
        </div>
      )}

      <div style={{maxWidth:700,margin:'0 auto',padding:'24px 20px'}}>
        <div style={{marginBottom:20}}>
          <span style={{fontSize:11,fontWeight:700,color:curDim.color,letterSpacing:'.08em',textTransform:'uppercase'}}>{curDim.id} — {curDim.name}</span>
          <h2 style={{fontFamily:"'Instrument Serif',serif",fontSize:22,color:TEXT,margin:'6px 0 0',fontWeight:400}}>{curDim.label}</h2>
        </div>

        {curDim.items.map((item, idx) => (
          <div key={item.id}
            style={{background:SURF,border:`1px solid ${scores[item.id] ? curDim.color + '55' : BORD}`,borderRadius:12,padding:'16px 18px',marginBottom:10,transition:'border-color .2s'}}>
            <div style={{fontSize:14,color:TEXT,marginBottom:12,lineHeight:1.5}}>
              <span style={{color:MUTED,fontSize:12,marginRight:8}}>{idx+1}.</span>
              {item.text}
            </div>
            <div style={{display:'flex',gap:scaleMax > 7 ? 3 : 6}}>
              {Array.from({length:scaleMax},(_,i)=>i+1).map(v => (
                <button key={v}
                  onClick={() => setScores(prev => ({ ...prev, [item.id]: v }))}
                  style={{flex:'1 1 0',padding:scaleMax > 7 ? '6px 2px' : '8px 4px',border:`1px solid ${scores[item.id]===v ? (scaleCfg.colors[v]||GOLD) : BORD2}`,borderRadius:8,background:scores[item.id]===v ? `${scaleCfg.colors[v]||GOLD}22` : 'transparent',color:scores[item.id]===v ? (scaleCfg.colors[v]||GOLD) : MUTED,fontSize:scaleMax > 7 ? 10 : 11,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontWeight:scores[item.id]===v?700:400,transition:'all .15s',textAlign:'center',minWidth:0}}>
                  <div style={{fontSize:scaleMax > 7 ? 12 : 15,marginBottom:2}}>{v}</div>
                  <div style={{fontSize:scaleMax > 7 ? 7 : 9,lineHeight:1.2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{scaleCfg.labels[v]||''}</div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Comment fields: only on last dimension */}
        {activeDim === safeDims.length - 1 && (
          <div style={{marginTop:24,display:'flex',flexDirection:'column',gap:14}}>
            <div style={{background:SURF,border:`1px solid ${BORD}`,borderRadius:12,padding:'16px 18px'}}>
              <div style={{fontSize:13,color:ORAN,fontWeight:600,marginBottom:8}}>🌱 Fejlődési lehetőségek <span style={{fontSize:11,color:MUTED,fontWeight:400}}>(opcionális)</span></div>
              <div style={{fontSize:12,color:MUTED,lineHeight:1.5,marginBottom:10}}>Kérlek, írd le, milyen területeken látod az értékelt vezető fejlődési lehetőségeit, milyen viselkedéseken, készségeken érdemes dolgoznia a jövőben.</div>
              <textarea
                value={commentGrowth}
                onChange={e => setCommentGrowth(e.target.value)}
                placeholder="Fejlesztendő területek, javaslatok..."
                rows={3}
                style={{width:'100%',background:S2,border:`1px solid ${BORD}`,borderRadius:10,padding:'11px 16px',color:TEXT,fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:'none',resize:'vertical',boxSizing:'border-box',lineHeight:1.5}}
              />
            </div>
            <div style={{background:SURF,border:`1px solid ${BORD}`,borderRadius:12,padding:'16px 18px'}}>
              <div style={{fontSize:13,color:GREEN,fontWeight:600,marginBottom:8}}>💪 Erősségek <span style={{fontSize:11,color:MUTED,fontWeight:400}}>(opcionális)</span></div>
              <div style={{fontSize:12,color:MUTED,lineHeight:1.5,marginBottom:10}}>Miért szeretsz vele együtt dolgozni? Milyen erősségei, hozzáállása, szakmai vagy emberi tulajdonságai segítik a közös munkát?</div>
              <textarea
                value={commentStrength}
                onChange={e => setCommentStrength(e.target.value)}
                placeholder="Erősségek, pozitív tulajdonságok..."
                rows={3}
                style={{width:'100%',background:S2,border:`1px solid ${BORD}`,borderRadius:10,padding:'11px 16px',color:TEXT,fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:'none',resize:'vertical',boxSizing:'border-box',lineHeight:1.5}}
              />
            </div>
          </div>
        )}

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:20}}>
          <Btn variant="ghost" onClick={() => setActiveDim(prev => Math.max(0, prev-1))} disabled={activeDim === 0}>
            {'← Előző'}
          </Btn>
          {activeDim < safeDims.length - 1
            ? <Btn variant="ghost" onClick={() => setActiveDim(prev => prev+1)}>{'Következő →'}</Btn>
            : <Btn onClick={handleSubmit} disabled={filled < totalItems || saving} size="lg">
                {saving ? 'Mentés...' : filled < totalItems ? `Még ${totalItems - filled} kérdés` : 'Beküldés ✓'}
              </Btn>
          }
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN VIEW ─────────────────────────────────────────────
function LoginView({ onLogin }) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  async function handleLogin() {
    if (!email.trim() || !email.includes('@')) return;
    setSending(true);
    const isSA = email.endsWith('@zelgroup.hu');
    const user = await auth.login(email.trim(), isSA ? 'super_admin' : 'leader');
    setSending(false); setSent(true);
    setTimeout(() => onLogin(user), 600);
  }
  return (
    <div style={{minHeight:'100vh',background:BG,display:'flex',flexDirection:'column'}}>
      <div style={{padding:'18px 40px',display:'flex',alignItems:'center',borderBottom:`1px solid ${BORD}`}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:34,height:34,borderRadius:10,background:TEXT,display:'flex',alignItems:'center',justifyContent:'center',color:BG,fontFamily:"'Instrument Serif',serif",fontSize:18}}>L</div>
          <span style={{fontFamily:"'Instrument Serif',serif",fontSize:22}}>Ledge 360°</span>
        </div>
      </div>
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'40px'}}>
        <div style={{width:'100%',maxWidth:400,textAlign:'center'}}>
          <div style={{fontSize:11,color:MUTED,letterSpacing:'.12em',textTransform:'uppercase',marginBottom:12}}>Bejelentkezés</div>
          <h1 style={{fontFamily:"'Instrument Serif',serif",fontSize:32,color:TEXT,fontWeight:400,margin:'0 0 8px'}}>
            Üdvözöljük a <span style={{color:GOLD}}>Ledge 360°</span>-ban
          </h1>
          <p style={{color:MUTED,fontSize:14,lineHeight:1.6,marginBottom:28}}>Add meg az email címedet. Nincs jelszó, nincs regisztráció.</p>
          {sent ? (
            <div style={{background:`${GREEN}12`,border:`1px solid ${GREEN}30`,borderRadius:14,padding:'20px 24px'}}>
              <div style={{fontSize:15,color:GREEN,fontWeight:600}}>✓ Bejelentkezve!</div>
              <div style={{fontSize:13,color:MUTED,marginTop:4}}>Átirányítás...</div>
            </div>
          ) : (
            <div style={{background:SURF,border:`1px solid ${BORD}`,borderRadius:16,padding:'24px',boxShadow:'0 2px 8px rgba(0,0,0,.3)'}}>
              <Input label="Email cím" value={email} onChange={setEmail} placeholder="nev@ceg.hu" type="email"/>
              <Btn onClick={handleLogin} disabled={!email.trim()||sending} size="lg" style={{width:'100%',marginTop:4}}>
                {sending ? 'Küldés...' : 'Bejelentkezési link küldése'}
              </Btn>
              <div style={{marginTop:16,fontSize:12,color:MUTED}}><b>Demo:</b> @zelgroup.hu = SuperAdmin, más = Vezető</div>
            </div>
          )}
          <div style={{marginTop:24}}>
            <button onClick={() => onLogin(null)} style={{background:'none',border:'none',color:MUTED,fontSize:13,cursor:'pointer',fontFamily:"'Instrument Serif',serif",textDecoration:'underline',textDecorationStyle:'dashed',textUnderlineOffset:'4px'}}>
              Van azonosítóm → Értékelés kitöltése
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PAYWALL VIEW ───────────────────────────────────────────
function PaywallView({ nav, goBack, onUpgrade }) {
  const [processing, setProcessing] = useState(false);
  async function handleUpgrade() {
    setProcessing(true);
    const session = await auth.getSession();
    if (session) {
      await auth.updateRole(session.id, 'consultant');
      const updated = { ...session, role: 'consultant' };
      await db.set('auth:session', updated);
      onUpgrade(updated);
    }
    setProcessing(false);
  }
  return (
    <div style={{background:BG,minHeight:'100vh'}}>
      <TopBar title="Tanácsadói hozzáférés" back onBack={goBack}/>
      <div style={{maxWidth:480,margin:'0 auto',padding:'48px 24px',textAlign:'center'}}>
        <div style={{fontSize:40,marginBottom:16}}>◈</div>
        <h2 style={{fontFamily:"'Instrument Serif',serif",fontSize:28,color:TEXT,fontWeight:400,marginBottom:8}}>Szervezett 360°</h2>
        <p style={{color:MUTED,fontSize:15,lineHeight:1.6,marginBottom:28}}>Projektek, résztvevők, értékelők kezelése — professzionális tanácsadói eszköztár.</p>
        <div style={{background:SURF,border:`1px solid ${BORD}`,borderRadius:18,padding:'28px',boxShadow:'0 2px 8px rgba(0,0,0,.3)',marginBottom:24}}>
          <div style={{fontSize:11,color:MUTED,textTransform:'uppercase',letterSpacing:'.1em',marginBottom:8}}>Tanácsadói csomag</div>
          <div style={{fontFamily:"'Instrument Serif',serif",fontSize:42,color:GOLD,marginBottom:4}}>29<span style={{fontSize:18,color:MUTED}}> EUR/hó</span></div>
          <div style={{fontSize:13,color:MUTED,marginBottom:20}}>Korlátlan projekt és értékelő</div>
          <div style={{textAlign:'left',marginBottom:20}}>
            {['Korlátlan 360° projektek','Résztvevők és értékelők kezelése','Riportok és exportok','AI kérdőív-tervező','Tanácsadó meghívás a projektbe','Email értesítések','PDF riport'].map((f,i) => (
              <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 0',borderBottom:`1px solid ${BORD}`}}>
                <span style={{color:GREEN,fontSize:14}}>✓</span>
                <span style={{fontSize:13,color:TEXT}}>{f}</span>
              </div>
            ))}
          </div>
          <Btn onClick={handleUpgrade} disabled={processing} size="lg" style={{width:'100%'}}>
            {processing ? 'Feldolgozás...' : 'Előfizetés →'}
          </Btn>
          <div style={{fontSize:11,color:MUTED,marginTop:10}}>Demo: azonnali aktiváció</div>
        </div>
      </div>
    </div>
  );
}

// ─── SUPER ADMIN PANEL ───────────────────────────────────────
function SuperAdminPanel({ nav, goBack }) {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      setUsers(await auth.getUsers());
      setAuditLog((await db.get('audit:log')) || []);
      setInvites((await db.get('consultant_invites')) || []);
      setLoading(false);
    })();
  }, []);
  async function changeRole(userId, role) { await auth.updateRole(userId, role); setUsers(await auth.getUsers()); }
  async function toggleBan(userId) { await auth.toggleBan(userId); setUsers(await auth.getUsers()); }
  const stats = { total:users.length, consultants:users.filter(u=>u.role==='consultant').length, leaders:users.filter(u=>u.role==='leader').length, banned:users.filter(u=>u.banned).length };
  const TABS = [{id:'users',label:'Felhasználók'},{id:'stats',label:'Statisztikák'},{id:'invites',label:'Meghívók'},{id:'audit',label:'Audit log'}];
  if (loading) return <div style={{padding:60,color:MUTED,textAlign:'center',background:BG,minHeight:'100vh'}}>Betöltés...</div>;
  return (
    <div style={{background:BG,minHeight:'100vh'}}>
      <TopBar title="SuperAdmin" subtitle="Platform kezelés" back onBack={goBack}/>
      <div style={{maxWidth:960,margin:'0 auto',padding:'24px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:24}}>
          {[{label:'Felhasználók',val:stats.total,color:GOLD},{label:'Tanácsadók',val:stats.consultants,color:PURP},{label:'Vezetők',val:stats.leaders,color:BLUE},{label:'Tiltott',val:stats.banned,color:RED}].map(s => (
            <div key={s.label} style={{background:SURF,border:`1px solid ${BORD}`,borderRadius:14,padding:'16px 20px',boxShadow:'0 1px 3px rgba(0,0,0,.3)'}}>
              <div style={{fontSize:28,fontFamily:"'Instrument Serif',serif",color:s.color}}>{s.val}</div>
              <div style={{fontSize:11,color:MUTED,marginTop:4}}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:2,marginBottom:20,background:S2,borderRadius:12,padding:3,border:`1px solid ${BORD}`}}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{flex:1,padding:'10px 8px',border:'none',borderRadius:10,background:tab===t.id?S2:'transparent',cursor:'pointer',fontSize:13,fontFamily:"'DM Sans',sans-serif",color:tab===t.id?GOLD:MUTED,fontWeight:tab===t.id?600:400,transition:'all .15s',boxShadow:tab===t.id?'0 1px 2px rgba(0,0,0,.04)':'none'}}>{t.label}</button>
          ))}
        </div>
        {tab === 'users' && users.map(u => (
          <div key={u.id} style={{background:SURF,border:`1px solid ${BORD}`,borderRadius:12,padding:'14px 18px',marginBottom:8,display:'flex',alignItems:'center',gap:12,boxShadow:'0 1px 2px rgba(0,0,0,.25)'}}>
            <div style={{width:36,height:36,borderRadius:'50%',background:`${GOLD}14`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:GOLD,flexShrink:0}}>{(u.displayName||u.email||'?')[0].toUpperCase()}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:14,color:TEXT,fontWeight:600}}>{u.displayName||u.email}{u.banned?' — TILTVA':''}</div>
              <div style={{fontSize:12,color:MUTED}}>{u.email}</div>
            </div>
            <select value={u.role} onChange={e => changeRole(u.id, e.target.value)} style={{background:S2,border:`1px solid ${BORD}`,borderRadius:8,padding:'6px 10px',fontSize:12,color:TEXT,cursor:'pointer'}}>
              <option value="leader">Vezető</option><option value="consultant">Tanácsadó</option><option value="super_admin">SuperAdmin</option>
            </select>
            <Btn variant={u.banned?"ghost":"danger"} size="sm" onClick={() => toggleBan(u.id)}>{u.banned?'Feloldás':'Tiltás'}</Btn>
          </div>
        ))}
        {tab === 'stats' && (
          <Card>
            <div style={{fontSize:13,color:GOLD,fontWeight:600,marginBottom:16}}>Platform áttekintés</div>
            {[{l:'Összes felhasználó',v:stats.total},{l:'Tanácsadók (fizető)',v:stats.consultants},{l:'Vezetők (ingyenes)',v:stats.leaders},{l:'Kiadott meghívók',v:invites.length},{l:'Elfogadott',v:invites.filter(i=>i.status==='accepted').length},{l:'Audit log',v:auditLog.length}].map((s,i) => (
              <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:`1px solid ${BORD}`}}>
                <span style={{fontSize:14,color:TEXT}}>{s.l}</span>
                <span style={{fontSize:14,fontWeight:700,color:GOLD}}>{s.v}</span>
              </div>
            ))}
          </Card>
        )}
        {tab === 'invites' && (invites.length === 0
          ? <div style={{textAlign:'center',color:MUTED,padding:40}}>Nincs kiadott meghívó.</div>
          : invites.map((inv,i) => (
              <div key={i} style={{background:SURF,border:`1px solid ${BORD}`,borderRadius:12,padding:'12px 16px',marginBottom:6,display:'flex',alignItems:'center',gap:12}}>
                <Badge color={inv.status==='accepted'?GREEN:inv.status==='expired'?RED:GOLD}>{inv.status}</Badge>
                <div style={{flex:1,fontSize:13,color:TEXT}}>{inv.email}</div>
                <div style={{fontSize:11,color:MUTED}}>{new Date(inv.created).toLocaleDateString('hu-HU')}</div>
              </div>
            ))
        )}
        {tab === 'audit' && (
          <div>
            {[...auditLog].reverse().slice(0,50).map((e,i) => (
              <div key={i} style={{display:'flex',gap:12,padding:'8px 0',borderBottom:`1px solid ${BORD}`,fontSize:12}}>
                <span style={{color:MUTED,flexShrink:0,width:130}}>{new Date(e.timestamp).toLocaleString('hu-HU')}</span>
                <Badge color={e.action==='login'?BLUE:e.action.includes('ban')?RED:GOLD}>{e.action}</Badge>
                <span style={{color:TEXT,flex:1}}>{e.userId}</span>
                {e.details && <span style={{color:MUTED}}>{JSON.stringify(e.details)}</span>}
              </div>
            ))}
            {auditLog.length === 0 && <div style={{textAlign:'center',color:MUTED,padding:40}}>Nincs audit bejegyzés.</div>}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CONSULTANT INVITE VIEW ──────────────────────────────────
function ConsultantInviteView({ nav, goBack }) {
  const [email, setEmail] = useState('');
  const [invites, setInvites] = useState([]);
  const [sending, setSending] = useState(false);
  useEffect(() => { db.get('consultant_invites').then(inv => setInvites(inv || [])); }, []);
  async function sendInvite() {
    if (!email.trim()) return;
    setSending(true);
    const session = await auth.getSession();
    const inv = { id:'cinv_'+uid(8), inviterId:session?.id, email:email.trim(), code:uid(8), status:'pending', created:Date.now() };
    const all = [...invites, inv];
    await db.set('consultant_invites', all);
    setInvites(all); setEmail(''); setSending(false);
    await audit('invite_send', session?.id, {email:inv.email});
  }
  return (
    <div style={{background:BG,minHeight:'100vh'}}>
      <TopBar title="Csapat meghívók" subtitle="Tanácsadó kolléga behívása" back onBack={goBack}/>
      <div style={{maxWidth:600,margin:'0 auto',padding:'32px 24px'}}>
        <p style={{color:MUTED,fontSize:14,lineHeight:1.6,marginBottom:24}}>Hívd meg kollégáidat. A meghívott Stripe fizetés nélkül is tanácsadó lesz.</p>
        <Card style={{marginBottom:24}}>
          <div style={{fontSize:13,color:GOLD,fontWeight:600,marginBottom:12}}>Új meghívó</div>
          <div style={{display:'flex',gap:10}}>
            <div style={{flex:1}}><Input label="Email" value={email} onChange={setEmail} placeholder="kollega@ceg.hu" type="email"/></div>
            <div style={{paddingTop:22}}><Btn onClick={sendInvite} disabled={!email.trim()||sending}>{sending?'Küldés...':'Meghívó küldése'}</Btn></div>
          </div>
        </Card>
        <div style={{display:'flex',gap:10,marginBottom:16}}>
          <Badge color={GOLD}>{invites.filter(i=>i.status==='pending').length} függőben</Badge>
          <Badge color={GREEN}>{invites.filter(i=>i.status==='accepted').length} elfogadva</Badge>
        </div>
        {invites.map((inv,i) => (
          <div key={i} style={{background:SURF,border:`1px solid ${BORD}`,borderRadius:12,padding:'12px 16px',marginBottom:8,display:'flex',alignItems:'center',gap:12}}>
            <Badge color={inv.status==='accepted'?GREEN:GOLD}>{inv.status==='accepted'?'Elfogadva':'Függőben'}</Badge>
            <div style={{flex:1}}>
              <div style={{fontSize:14,color:TEXT}}>{inv.email}</div>
              <div style={{fontSize:11,color:MUTED}}>Kód: {inv.code}</div>
            </div>
            <CopyCode code={inv.code}/>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── HOME VIEW ─────────────────────────────────────────────────
function HomeView({ nav, goBack, ctx, onLogout }) {
  return (
    <div style={{minHeight:'100vh',background:BG,display:'flex',flexDirection:'column'}}>
      <div style={{padding:'18px 40px',display:'flex',alignItems:'center',borderBottom:`1px solid ${BORD}`}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:34,height:34,borderRadius:10,background:TEXT,display:'flex',alignItems:'center',justifyContent:'center',color:BG,fontFamily:"'Instrument Serif',serif",fontSize:18}}>L</div>
          <span style={{fontFamily:"'Instrument Serif',serif",fontSize:22}}>Ledge 360°</span>
        </div>
        <span style={{marginLeft:14,fontSize:11,color:MUTED,letterSpacing:'.1em',textTransform:'uppercase'}}>by ZEL Group</span>
        <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:10}}>
          {ctx.user && ctx.user.role === 'super_admin' && <Btn variant="ghost" size="sm" onClick={() => nav('super_admin')}>⚙ Admin</Btn>}
          {ctx.user && ctx.user.role === 'consultant' && <Btn variant="ghost" size="sm" onClick={() => nav('consultant_invites')}>👥 Csapat</Btn>}
          {ctx.user && (
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:30,height:30,borderRadius:'50%',background:`${GOLD}14`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:GOLD}}>
                {(ctx.user.displayName||ctx.user.email||'?')[0].toUpperCase()}
              </div>
              <div style={{fontSize:12,color:MUTED}}>
                <div style={{fontWeight:600,color:TEXT}}>{ctx.user.displayName}</div>
                <div>{ctx.user.role === 'super_admin' ? 'SuperAdmin' : ctx.user.role === 'consultant' ? 'Tanácsadó' : 'Vezető'}</div>
              </div>
            </div>
          )}
          {ctx.user && onLogout && (
            <Btn variant="subtle" size="sm" onClick={onLogout}>Kilépés</Btn>
          )}
        </div>
      </div>
      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'20px 40px 60px'}}>
        <div style={{textAlign:'center',marginBottom:14}}>
          <div style={{fontSize:11,color:GDIM,letterSpacing:'.18em',textTransform:'uppercase',marginBottom:14}}>Következő generációs 360° értékelési platform</div>
          <h1 style={{fontFamily:"'Instrument Serif',serif",fontSize:50,color:TEXT,fontWeight:300,lineHeight:1.1,margin:'0 0 14px'}}>
            Ismerd meg,<br/><span style={{color:GOLD}}>hogyan látnak mások</span>
          </h1>
          <p style={{fontSize:16,color:MUTED,maxWidth:460,margin:'0 auto',lineHeight:1.7}}>
            Értékeld önmagad, hívd meg barátaidat, kollégáidat — és lásd, miben egyezik és miben tér el a kép.
          </p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,maxWidth:660,width:'100%',marginTop:40}}>
          {[
            { icon:'◉', title:'Személyes tükör',  desc:'Önértékelés + saját csoportjaid. Barátok, kollégák, família — privát és szabad.', color:GOLD, target:'leader_dashboard' },
            { icon:'◈', title:'Szervezeti 360°',   desc:'Tanácsadói projektek, HR folyamatok, csapatmérések szervezett kezelése.',         color:BLUE, target: ctx.user && (ctx.user.role === 'consultant' || ctx.user.role === 'super_admin') ? 'admin' : 'paywall' },
          ].map(c => (
            <div key={c.target} onClick={() => nav(c.target)}
              style={{background:SURF,border:`1px solid ${BORD}`,borderRadius:16,padding:32,cursor:'pointer',transition:'all .2s',position:'relative',overflow:'hidden'}}
              onMouseEnter={e => { e.currentTarget.style.borderColor = c.color+'55'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.07)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = BORD; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{fontSize:34,marginBottom:14,color:c.color}}>{c.icon}</div>
              <h2 style={{fontFamily:"'Instrument Serif',serif",fontSize:22,color:TEXT,margin:'0 0 8px',fontWeight:400}}>{c.title}</h2>
              <p style={{fontSize:14,color:MUTED,lineHeight:1.6,margin:0}}>{c.desc}</p>
              <div style={{marginTop:18,fontSize:12,color:c.color+'99'}}>Belépés →</div>
              <div style={{position:'absolute',top:-20,right:-20,width:120,height:120,borderRadius:'50%',background:c.color+'07'}}/>
            </div>
          ))}
        </div>
        <div style={{marginTop:24,textAlign:'center'}}>
          <button onClick={() => nav('survey_enter')} style={{background:'none',border:'none',color:TEXT,fontSize:14,cursor:'pointer',textDecoration:'underline',textDecorationStyle:'dashed',textUnderlineOffset:'3px',fontFamily:"'Instrument Serif',serif",letterSpacing:'.02em'}}>
            Van azonosítóm → Értékelés kitöltése
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── LEADER DASHBOARD ──────────────────────────────────────────
function LeaderDashboard({ nav, goBack }) {
  const [selves,     setSelves]     = useState([]);
  const [groups,     setGroups]     = useState([]);
  const [richGroups, setRichGroups] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showGrpModal, setShowGrpModal] = useState(false);
  const [showPreset,   setShowPreset]   = useState(false);
  const [renamingId,   setRenamingId]   = useState(null);
  const [renameVal,    setRenameVal]    = useState('');
  const [deletingId,   setDeletingId]   = useState(null);

  const load = useCallback(async () => {
    // Load multi-self index
    const idx = await db.get('leader_selves') || [];
    const loaded = [];
    for (const entry of idx) {
      const d = await db.get('self:' + entry.id);
      if (d) loaded.push({ ...d, selfId: entry.id, customName: entry.customName || d.customName });
    }
    // Backward compat: also check old leader_self
    if (loaded.length === 0) {
      const old = await db.get('leader_self');
      if (old) {
        const id = uid(8);
        const entry = { id, customName: null };
        await db.set('self:' + id, old);
        await db.set('leader_selves', [entry]);
        loaded.push({ ...old, selfId: id, customName: null });
      }
    }
    setSelves(loaded);
    const grps = await db.get('leader_groups') || [];
    setGroups(grps);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!groups.length) { setRichGroups([]); return; }
    (async () => {
      const result = await Promise.all(groups.map(async g => {
        const done  = (g.members || []).filter(m => m.status === 'done');
        const resps = await Promise.all(done.map(m => db.get('resp:' + m.code)));
        return { ...g, scores: resps.filter(Boolean).map(r => r.scores || {}), resps: resps.filter(Boolean) };
      }));
      setRichGroups(result);
    })();
  }, [groups]);

  // Use last self as "active" for groups/comparison
  const activeSelf   = selves.length > 0 ? selves[selves.length - 1] : null;
  const preset       = activeSelf ? resolvePreset(activeSelf.libraryId, activeSelf.dims) : null;
  const allOtherSets = richGroups.flatMap(g => g.scores || []);
  const hasComparison= activeSelf && allOtherSets.length > 0;
  const totalMembers = groups.reduce((s, g) => s + (g.members || []).length, 0);
  const totalDone    = groups.reduce((s, g) => s + (g.members || []).filter(m => m.status === 'done').length, 0);

  async function renameSelf(selfId, newName) {
    const idx = await db.get('leader_selves') || [];
    const updated = idx.map(e => e.id === selfId ? { ...e, customName: newName } : e);
    await db.set('leader_selves', updated);
    setRenamingId(null);
    load();
  }

  async function deleteSelf(selfId) {
    const idx = await db.get('leader_selves') || [];
    const updated = idx.filter(e => e.id !== selfId);
    await db.set('leader_selves', updated);
    await db.del('self:' + selfId);
    // If was also leader_self, clear it
    if (updated.length > 0) {
      const last = await db.get('self:' + updated[updated.length-1].id);
      if (last) await db.set('leader_self', last);
    } else {
      await db.del('leader_self');
    }
    setDeletingId(null);
    load();
  }

  if (loading) return <div style={{padding:60,color:MUTED,textAlign:'center',background:BG,minHeight:'100vh'}}>Betöltés...</div>;

  return (
    <div style={{background:BG,minHeight:'100vh'}}>
      <TopBar title="Személyes tükör" back onBack={goBack}
        right={hasComparison ? <Btn size="sm" onClick={() => nav('leader_compare')}>Teljes elemzés →</Btn> : null}/>

      <div style={{maxWidth:900,margin:'0 auto',padding:'24px'}}>

        {/* Self assessments section */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <div style={{fontSize:11,color:MUTED,textTransform:'uppercase',letterSpacing:'.08em'}}>Önértékelések</div>
          <Btn variant="ghost" size="sm" onClick={() => nav('self_pick')}>+ Új önértékelés</Btn>
        </div>

        {selves.length === 0 && (
          <div style={{background:SURF,border:`2px dashed ${BORD2}`,borderRadius:14,padding:'28px 32px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:20,marginBottom:22}}>
            <div>
              <div style={{fontFamily:"'Instrument Serif',serif",fontSize:20,color:TEXT,marginBottom:6}}>Kezdd önmagaddal</div>
              <div style={{fontSize:14,color:MUTED,lineHeight:1.6}}>Válassz sablont és töltsd ki az önértékelést azonosító nélkül, rögtön.</div>
            </div>
            <Btn size="lg" onClick={() => nav('self_pick')}>Önértékelés →</Btn>
          </div>
        )}

        <div style={{display:'grid',gap:10,marginBottom:22}}>
          {selves.map(s => {
            const p = resolvePreset(s.libraryId, s.dims);
            const avg = overallAvg(s.scores, p.dims);
            const displayName = s.customName || p.name;
            return (
              <div key={s.selfId} style={{background:SURF,border:`1px solid ${BORD}`,borderRadius:14,padding:'16px 20px'}}>
                <div style={{display:'flex',alignItems:'center',gap:14}}>
                  <div style={{flex:1}}>
                    {renamingId === s.selfId ? (
                      <div style={{display:'flex',gap:8,alignItems:'center'}}>
                        <input value={renameVal} onChange={e => setRenameVal(e.target.value)} autoFocus
                          onKeyDown={e => { if (e.key==='Enter') renameSelf(s.selfId, renameVal); if (e.key==='Escape') setRenamingId(null); }}
                          style={{background:S2,border:`1px solid ${BORD}`,borderRadius:6,padding:'4px 10px',color:TEXT,fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:'none',flex:1}}/>
                        <Btn size="sm" onClick={() => renameSelf(s.selfId, renameVal)}>✓</Btn>
                        <Btn size="sm" variant="ghost" onClick={() => setRenamingId(null)}>✕</Btn>
                      </div>
                    ) : (
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <Badge color={GOLD}>{displayName}</Badge>
                        <span style={{fontSize:12,color:MUTED}}>{new Date(s.timestamp).toLocaleDateString('hu-HU')}</span>
                      </div>
                    )}
                    <div style={{fontFamily:"'Instrument Serif',serif",fontSize:28,color:TEXT,fontWeight:600,marginTop:6}}>
                      {avg.toFixed(1)}
                      <span style={{fontSize:14,color:MUTED,fontWeight:400,marginLeft:8}}>/ {getScaleMax(s.scaleId || '5pt')}.0</span>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:6,flexShrink:0}}>
                    <Btn variant="ghost" size="sm" onClick={() => nav('self_report', { selfId: s.selfId })}>Részletek</Btn>
                    <Btn variant="ghost" size="sm" onClick={() => { setRenamingId(s.selfId); setRenameVal(s.customName || p.name); }}>✎</Btn>
                    <Btn variant="ghost" size="sm" onClick={() => setDeletingId(s.selfId)} style={{color:RED}}>🗑</Btn>
                  </div>
                </div>
                {/* Mini dimension bars */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginTop:12}}>
                  {p.dims.slice(0,8).map(d => {
                    const v = dimAvg(s.scores, d);
                    return (
                      <div key={d.id} style={{background:S2,borderRadius:8,padding:'6px 10px'}}>
                        <div style={{fontSize:10,color:d.color,fontWeight:700,marginBottom:3}}>{d.id}</div>
                        <div style={{display:'flex',alignItems:'center',gap:6}}>
                          <MiniBar val={v} color={d.color}/>
                          <span style={{fontSize:11,color:TEXT,fontWeight:600,width:24,textAlign:'right'}}>{v>0?v.toFixed(1):'—'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Groups header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <div>
            <div style={{fontSize:11,color:MUTED,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:2}}>Értékelő csoportjaid</div>
            {totalMembers > 0 && <div style={{fontSize:12,color:MUTED}}>{totalMembers} meghívott · {totalDone} beküldött</div>}
          </div>
          <Btn variant="ghost" size="sm" onClick={() => setShowGrpModal(true)}>+ Új csoport</Btn>
        </div>

        {groups.length === 0 && (
          <div style={{background:SURF,border:`2px dashed ${BORD2}`,borderRadius:14,padding:28,textAlign:'center'}}>
            <div style={{fontSize:28,marginBottom:10}}>👥</div>
            <div style={{fontSize:15,color:TEXT,marginBottom:6}}>Hívj meg másokat</div>
            <div style={{fontSize:13,color:MUTED,marginBottom:18}}>Hozz létre csoportokat — barátaid, munkatársaid, családod — és küld el nekik az azonosítót.</div>
            <Btn onClick={() => setShowGrpModal(true)}>+ Első csoport létrehozása</Btn>
          </div>
        )}

        <div style={{display:'grid',gap:10}}>
          {richGroups.map(g => {
            const done  = (g.members||[]).filter(m => m.status === 'done').length;
            const total = (g.members||[]).length;
            const gAvg  = (done > 0 && preset) ? overallAvg(mergeScoresets(g.scores), preset.dims) : null;
            const pct   = total > 0 ? Math.round(done / total * 100) : 0;
            return (
              <div key={g.id} style={{background:SURF,border:`1px solid ${BORD}`,borderRadius:12,overflow:'hidden'}}>
                <div style={{padding:'14px 18px',display:'flex',alignItems:'center',gap:14}}>
                  <div style={{width:44,height:44,borderRadius:10,background:`${g.color||GOLD}18`,border:`1px solid ${g.color||GOLD}44`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{g.emoji}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:15,color:TEXT,fontWeight:600,marginBottom:4}}>{g.name}</div>
                    <div style={{display:'flex',alignItems:'center',gap:12}}>
                      <div style={{flex:1,height:4,background:BORD,borderRadius:2,overflow:'hidden',maxWidth:140}}>
                        <div style={{width:`${pct}%`,height:'100%',background:g.color||GOLD,borderRadius:2,transition:'width .4s'}}/>
                      </div>
                      <span style={{fontSize:12,color:MUTED}}>{done}/{total} kitöltött</span>
                    </div>
                  </div>
                  {gAvg !== null && (
                    <div style={{textAlign:'center',marginRight:4}}>
                      <div style={{fontFamily:"'Instrument Serif',serif",fontSize:24,color:g.color||GOLD,fontWeight:600}}>{gAvg.toFixed(1)}</div>
                      <div style={{fontSize:10,color:MUTED}}>átlag</div>
                    </div>
                  )}
                  <Btn variant="ghost" size="sm" onClick={() => nav('group_manage', { groupId:g.id })}>Kezelés</Btn>
                </div>
                {(g.members||[]).length > 0 && (
                  <div style={{padding:'0 18px 12px',display:'flex',gap:6,flexWrap:'wrap'}}>
                    {(g.members||[]).map(m => (
                      <div key={m.id} style={{display:'flex',alignItems:'center',gap:5,background:S2,borderRadius:20,padding:'3px 10px',border:`1px solid ${BORD}`}}>
                        <span style={{width:6,height:6,borderRadius:'50%',background:m.status==='done'?GREEN:m.status==='in_progress'?GOLD:MUTED,flexShrink:0}}/>
                        <span style={{fontSize:11,color:TEXT}}>{m.firstName}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {hasComparison && (
          <div style={{marginTop:20,background:`${GOLD}0A`,border:`1px solid ${GDIM}`,borderRadius:14,padding:'18px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:16}}>
            <div>
              <div style={{fontFamily:"'Instrument Serif',serif",fontSize:18,color:TEXT,marginBottom:4}}>Összehasonlítás elérhető</div>
              <div style={{fontSize:13,color:MUTED}}>{totalDone} értékelő · {richGroups.filter(g => (g.scores||[]).length > 0).length} csoport</div>
            </div>
            <Btn size="lg" onClick={() => nav('leader_compare')}>Teljes elemzés →</Btn>
          </div>
        )}
      </div>

      {showGrpModal && (
        <GroupModal
          selves={selves}
          onSave={async (g) => {
            const grps = await db.get('leader_groups') || [];
            await db.set('leader_groups', [...grps, g]);
            setShowGrpModal(false);
            load();
          }}
          onClose={() => setShowGrpModal(false)}
        />
      )}

      {showPreset && (
        <PresetPickerModal
          hasExisting={selves.length > 0}
          onClose={() => setShowPreset(false)}
          onPick={(p) => {
            setShowPreset(false);
            nav('survey', { mode:'self', libraryId:p.id, dims:p.dims, surveyTitle:'Önértékelés — '+p.name });
          }}
        />
      )}

      {deletingId && (
        <ConfirmModal
          title="Önértékelés törlése"
          message="Ez a művelet véglegesen törli ezt az önértékelést. Biztosan folytatod?"
          confirmLabel="Igen, törlés"
          onConfirm={() => deleteSelf(deletingId)}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </div>
  );
}

// ─── GROUP MODAL ───────────────────────────────────────────────
function GroupModal({ onClose, onSave, selves }) {
  const [name,  setName]  = useState('');
  const [emoji, setEmoji] = useState('🤝');
  const [color, setColor] = useState(GREEN);
  const [libChoice, setLibChoice] = useState('auto');
  const [customTpls, setCustomTpls] = useState([]);
  const EMOJIS = ['🏢','🤝','🏠','🎯','👥','🌟','💡','🔥','⚡','🎓'];
  const COLORS = [BLUE, GREEN, PURP, ORAN, GOLD, RED];

  useEffect(() => { loadCustomTemplates().then(setCustomTpls); }, []);

  // Determine available questionnaire options
  const selfOptions = (selves || []).map(s => {
    const p = resolvePreset(s.libraryId, s.dims);
    return { id: s.libraryId, label: s.customName || p.name, dims: s.dims || p.dims };
  });
  const allOptions = [
    { id:'auto', label:'Automatikus (utolsó önértékelés sablona)' },
    ...PRESETS.map(p => ({ id:p.id, label:'📋 '+p.name, dims:p.dims })),
    ...customTpls.map(t => ({ id:t.id, label:'⭐ '+t.name, dims:t.dims })),
  ];

  function handleSave() {
    if (!name.trim()) return;
    let selectedLib = libChoice;
    let selectedDims = null;
    if (libChoice === 'auto') {
      selectedLib = null;
    } else {
      const preset = PRESETS.find(p => p.id === libChoice);
      if (preset) selectedDims = preset.dims;
      const selfOpt = selfOptions.find(s => s.id === libChoice);
      if (selfOpt) selectedDims = selfOpt.dims;
      const tplOpt = customTpls.find(t => t.id === libChoice);
      if (tplOpt) selectedDims = tplOpt.dims;
    }
    onSave({ id:'grp_'+uid(8), name:name.trim(), emoji, color, libraryId:selectedLib, customDims:selectedDims, members:[], created:Date.now() });
  }

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.25)',backdropFilter:'blur(4px)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:SURF,border:`1px solid ${BORD}`,borderRadius:18,padding:30,boxShadow:'0 8px 30px rgba(0,0,0,.5)',width:'100%',maxWidth:480}}>
        <div style={{fontFamily:"'Instrument Serif',serif",fontSize:20,color:TEXT,marginBottom:18}}>Új csoport</div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:MUTED,marginBottom:8,textTransform:'uppercase',letterSpacing:'.08em'}}>Javaslatok</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {GROUP_PRESETS.map(p => (
              <button key={p.name}
                onClick={() => { setName(p.name); setEmoji(p.emoji); setColor(p.color); }}
                style={{background:name===p.name?`${p.color}22`:S3,border:`1px solid ${name===p.name?p.color:BORD}`,borderRadius:20,padding:'5px 12px',cursor:'pointer',fontSize:13,color:name===p.name?p.color:TEXT,transition:'all .15s'}}>
                {p.emoji} {p.name}
              </button>
            ))}
          </div>
        </div>
        <Input label="Csoport neve" value={name} onChange={setName} placeholder="pl. Régi csapat"/>
        {/* Questionnaire selector */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,color:MUTED,marginBottom:8,textTransform:'uppercase',letterSpacing:'.08em'}}>Kérdőív</div>
          <select value={libChoice} onChange={e => setLibChoice(e.target.value)}
            style={{width:'100%',background:S3,border:`1px solid ${BORD}`,borderRadius:8,padding:'10px 14px',color:TEXT,fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:'none',boxSizing:'border-box'}}>
            {allOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
          <div style={{fontSize:11,color:MUTED,marginTop:4}}>A csoport tagjai ezt a kérdőívet fogják kitölteni</div>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,color:MUTED,marginBottom:8,textTransform:'uppercase',letterSpacing:'.08em'}}>Emoji</div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {EMOJIS.map(e => (
              <button key={e} onClick={() => setEmoji(e)}
                style={{width:36,height:36,borderRadius:8,border:`2px solid ${emoji===e?GOLD:BORD}`,background:emoji===e?`${GOLD}22`:S3,fontSize:20,cursor:'pointer'}}>
                {e}
              </button>
            ))}
          </div>
        </div>
        <div style={{marginBottom:22}}>
          <div style={{fontSize:11,color:MUTED,marginBottom:8,textTransform:'uppercase',letterSpacing:'.08em'}}>Szín</div>
          <div style={{display:'flex',gap:8}}>
            {COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)}
                style={{width:28,height:28,borderRadius:'50%',background:c,border:`3px solid ${color===c?TEXT:BORD}`,cursor:'pointer',transition:'border .15s'}}/>
            ))}
          </div>
        </div>
        <div style={{display:'flex',gap:10}}>
          <Btn onClick={handleSave} disabled={!name.trim()}>Létrehozás</Btn>
          <Btn variant="ghost" onClick={onClose}>Mégse</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── PRESET PICKER MODAL ───────────────────────────────────────
// FIX: confirmation is now handled with a simple boolean state before the main render
function PresetPickerModal({ onClose, onPick, hasExisting }) {
  const [pendingPreset, setPendingPreset] = useState(null);

  // Confirmation sub-state — avoids conditional hook issue
  if (pendingPreset) {
    return (
      <ConfirmModal
        title="Felülírja a meglévő önértékelést"
        message="Az új sablon kiválasztásával az eddigi önértékelési adatok elvesznek. Biztosan folytatod?"
        confirmLabel="Igen, új önértékelés"
        onConfirm={() => onPick(pendingPreset)}
        onCancel={() => setPendingPreset(null)}
      />
    );
  }

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.25)',backdropFilter:'blur(4px)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:SURF,border:`1px solid ${BORD}`,borderRadius:18,padding:30,boxShadow:'0 8px 30px rgba(0,0,0,.5)',width:'100%',maxWidth:520}}>
        <div style={{fontFamily:"'Instrument Serif',serif",fontSize:20,color:TEXT,marginBottom:hasExisting?8:20}}>Sablon választás</div>
        {hasExisting && (
          <div style={{background:`${ORAN}18`,border:`1px solid ${ORAN}44`,borderRadius:8,padding:'8px 14px',marginBottom:16,fontSize:13,color:ORAN}}>
            ⚠ Meglévő önértékelés van. Új sablon választásakor az adatok elvesznek.
          </div>
        )}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          {PRESETS.map(p => (
            <div key={p.id}
              onClick={() => hasExisting ? setPendingPreset(p) : onPick(p)}
              style={{background:S3,border:`1px solid ${BORD}`,borderRadius:12,padding:18,cursor:'pointer',transition:'all .2s'}}
              onMouseEnter={e => { e.currentTarget.style.borderColor = GDIM; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = BORD; }}>
              <div style={{fontSize:28,marginBottom:10}}>{p.icon}</div>
              <div style={{fontSize:14,color:TEXT,fontWeight:600,marginBottom:3}}>{p.name}</div>
              <div style={{fontSize:12,color:MUTED}}>{p.subtitle}</div>
              <div style={{marginTop:8,display:'flex',gap:6}}>
                <Badge color={GOLD}>{p.dims.length} dim</Badge>
                <Badge color={MUTED}>{p.itemCount} item</Badge>
              </div>
            </div>
          ))}
        </div>
        <div style={{marginTop:16}}><Btn variant="ghost" onClick={onClose}>Mégse</Btn></div>
      </div>
    </div>
  );
}

// ─── CUSTOM TEMPLATE SECTION (reusable) ───────────────────────
function CustomTemplateSection({ templates, onPick, onEdit, onDelete, onDuplicate }) {
  const [deletingId, setDeletingId] = useState(null);
  if (!templates || templates.length === 0) return null;
  return (
    <>
      <div style={{display:'flex',alignItems:'center',gap:16,margin:'28px 0 14px'}}>
        <div style={{flex:1,height:1,background:BORD}}/>
        <span style={{fontSize:12,color:GOLD,textTransform:'uppercase',letterSpacing:'.1em',flexShrink:0}}>Saját sablonok</span>
        <div style={{flex:1,height:1,background:BORD}}/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        {templates.map(t => (
          <div key={t.id}
            style={{background:SURF,border:`1px solid ${GDIM}44`,borderRadius:14,padding:22,position:'relative',transition:'all .2s'}}
            onMouseEnter={e => { e.currentTarget.style.borderColor=GDIM; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor=GDIM+'44'; }}>
            <div style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:10}}>
              <div style={{fontSize:24,flexShrink:0}}>📝</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:15,color:TEXT,fontWeight:600,marginBottom:3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.name}</div>
                <div style={{fontSize:12,color:MUTED}}>{new Date(t.created).toLocaleDateString('hu-HU')}</div>
              </div>
            </div>
            <div style={{display:'flex',gap:8,marginBottom:14}}>
              <Badge color={GOLD}>{t.dimCount} dim</Badge>
              <Badge color={MUTED}>{t.itemCount} item</Badge>
            </div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <Btn size="sm" onClick={() => onPick(t)}>Használat →</Btn>
              {onEdit && <Btn variant="ghost" size="sm" onClick={() => onEdit(t)}>✎</Btn>}
              {onDuplicate && <Btn variant="ghost" size="sm" onClick={() => onDuplicate(t)}>⧉ Másolás</Btn>}
              <Btn variant="ghost" size="sm" onClick={() => setDeletingId(t.id)} style={{color:RED+'88'}}>🗑</Btn>
            </div>
          </div>
        ))}
      </div>
      {deletingId && (
        <ConfirmModal
          title="Sablon törlése"
          message="Ez véglegesen törli ezt a sablont. Biztosan folytatod?"
          confirmLabel="Igen, törlés"
          onConfirm={() => { onDelete(deletingId); setDeletingId(null); }}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </>
  );
}

// ─── EXCEL UPLOAD MODAL ──────────────────────────────────────
function ExcelUploadModal({ onClose, onResult }) {
  const [step, setStep] = useState('upload'); // upload | preview | processing | done
  const [rawData, setRawData] = useState(null);
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(0);
  const [parsedDims, setParsedDims] = useState(null);
  const [parsedName, setParsedName] = useState('');
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const fileRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setError('');
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type:'array' });
      setSheetNames(wb.SheetNames);
      const allSheets = wb.SheetNames.map(name => {
        const ws = wb.Sheets[name];
        return XLSX.utils.sheet_to_json(ws, { header:1, defval:'' });
      });
      setRawData(allSheets);
      setStep('preview');
    } catch(err) {
      setError('Nem sikerült beolvasni a fájlt. Ellenőrizd a formátumot (.xlsx, .xls, .csv).');
    }
  }

  async function handleAIParse() {
    if (!rawData) return;
    setStep('processing');
    setError('');
    const sheetData = rawData[selectedSheet] || rawData[0];
    const preview = sheetData.slice(0, 60).map(row => row.slice(0, 10).join(' | ')).join('\n');
    try {
      const resp = await fetch('/api/messages', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          model:'claude-sonnet-4-20250514',
          max_tokens:3000,
          system: `Te egy kompetencia-struktúra felismerő AI vagy. A felhasználó Excel adatokat ad neked.
A feladatod: azonosítsd a kompetencia dimenziókat és az alkompetenciákat (behavioral anchors/items).
Válaszolj KIZÁRÓLAG JSON formátumban, semmi más szöveg ne legyen a válaszban:
{"name":"A kérdőív neve","dims":[{"id":"XX","name":"Dimenzió neve","label":"Rövid leírás","color":"#hexszín","items":[{"id":"XX1","text":"Alkompetencia szövege (max 66 karakter)"}]}]}
Szabályok:
- Dimenzió ID: 2-3 betűs nagybetűs kód (pl. PC, LS, AG)
- Item ID: dimenzió ID + sorszám (pl. PC1, PC2)
- Item text: max 66 karakter, magyar nyelvű
- 4-8 dimenzió ideális, 3-5 item per dimenzió
- Színek: válassz ezekből: #A68542, #4A7A9E, #5B8A6A, #7E5EA0, #A06A48, #B85548, #D4AA78, #7AAED0, #B89BC9
- Ha nem egyértelmű a struktúra, tedd a legjobb becslésed
- Ha a szövegek túl hosszúak, rövidítsd 66 karakterre megtartva az értelmét`,
          messages: [{ role:'user', content:'Excel tartalom (soronkénti formátum):\n\n' + preview }],
        }),
      });
      const data = await resp.json();
      const text = (data.content || []).map(c => c.text || '').join('');
      const jsonMatch = text.match(/\{[\s\S]*"dims"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.dims && parsed.dims.length > 0) {
          setParsedDims(parsed.dims);
          setParsedName(parsed.name || fileName.replace(/\.[^.]+$/,''));
          setStep('done');
          return;
        }
      }
      setError('Az AI nem tudta felismerni a kompetencia-struktúrát. Próbáld átrendezni az Excel-t úgy, hogy a dimenziók és itemek jól elkülönüljenek.');
      setStep('preview');
    } catch(err) {
      setError('Hiba történt az AI feldolgozás során. Próbáld újra.');
      setStep('preview');
    }
  }

  const sheetData = rawData ? (rawData[selectedSheet] || []) : [];
  const previewRows = sheetData.slice(0, 20);

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.25)',backdropFilter:'blur(4px)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:SURF,border:`1px solid ${BORD}`,borderRadius:18,padding:30,boxShadow:'0 8px 30px rgba(0,0,0,.5)',width:'100%',maxWidth:640,maxHeight:'85vh',overflow:'auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
          <div style={{fontFamily:"'Instrument Serif',serif",fontSize:20,color:TEXT}}>📊 Excel importálás</div>
          <Btn variant="ghost" size="sm" onClick={onClose}>✕</Btn>
        </div>

        {step === 'upload' && (
          <div>
            <p style={{color:MUTED,fontSize:14,lineHeight:1.6,marginBottom:20}}>
              Töltsd fel az Excel fájlodat (.xlsx, .xls, .csv). Az AI automatikusan felismeri a kompetencia-struktúrát — dimenziókat és alkompetenciákat.
            </p>
            <div style={{background:S2,border:`2px dashed ${BORD2}`,borderRadius:14,padding:'40px 24px',textAlign:'center',cursor:'pointer',transition:'all .2s'}}
              onClick={() => fileRef.current && fileRef.current.click()}
              onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = GOLD; }}
              onDragLeave={e => { e.currentTarget.style.borderColor = BORD2; }}
              onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = BORD2; const f = e.dataTransfer.files[0]; if (f) handleFile({target:{files:[f]}}); }}>
              <div style={{fontSize:36,marginBottom:12}}>📂</div>
              <div style={{fontSize:15,color:TEXT,fontWeight:600,marginBottom:6}}>Húzd ide a fájlt vagy kattints a tallózáshoz</div>
              <div style={{fontSize:12,color:MUTED}}>.xlsx · .xls · .csv</div>
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv,.tsv" onChange={handleFile} style={{display:'none'}}/>
            </div>
            <div style={{marginTop:16,background:`${BLUE}08`,border:`1px solid ${BLUE}22`,borderRadius:10,padding:'12px 16px'}}>
              <div style={{fontSize:12,color:BLUE,fontWeight:600,marginBottom:6}}>Tipp — milyen Excel formátum működik jól?</div>
              <div style={{fontSize:12,color:MUTED,lineHeight:1.6}}>
                Akár egyszerű lista (A oszlop: dimenzió név, B oszlop: item szöveg), akár strukturált táblázat. Az AI rugalmasan kezeli a legtöbb formátumot.
              </div>
            </div>
            {error && <div style={{color:RED,fontSize:13,marginTop:12}}>{error}</div>}
          </div>
        )}

        {step === 'preview' && (
          <div>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
              <Badge color={GREEN}>✓ {fileName}</Badge>
              <span style={{fontSize:12,color:MUTED}}>{sheetData.length} sor · {sheetNames.length} munkalap</span>
            </div>
            {sheetNames.length > 1 && (
              <div style={{marginBottom:12}}>
                <div style={{fontSize:11,color:MUTED,marginBottom:6,textTransform:'uppercase',letterSpacing:'.08em'}}>Munkalap kiválasztása</div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {sheetNames.map((n, i) => (
                    <button key={i} onClick={() => setSelectedSheet(i)}
                      style={{padding:'5px 12px',border:`1px solid ${i===selectedSheet?GOLD:BORD}`,borderRadius:8,background:i===selectedSheet?`${GOLD}14`:'transparent',color:i===selectedSheet?GOLD:TEXT,fontSize:12,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div style={{fontSize:11,color:MUTED,marginBottom:8,textTransform:'uppercase',letterSpacing:'.08em'}}>Előnézet (első 20 sor)</div>
            <div style={{overflowX:'auto',marginBottom:16,border:`1px solid ${BORD}`,borderRadius:10}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
                <tbody>
                  {previewRows.map((row, ri) => (
                    <tr key={ri} style={{background:ri===0?S3:ri%2===0?'transparent':S2+'66'}}>
                      {(row||[]).slice(0,8).map((cell, ci) => (
                        <td key={ci} style={{padding:'5px 8px',color:ri===0?GOLD:TEXT,fontWeight:ri===0?700:400,borderBottom:`1px solid ${BORD}`,whiteSpace:'nowrap',maxWidth:160,overflow:'hidden',textOverflow:'ellipsis'}}>
                          {String(cell||'')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{display:'flex',gap:10,alignItems:'center'}}>
              <Btn onClick={handleAIParse}>✦ AI feldolgozás indítása</Btn>
              <Btn variant="ghost" onClick={() => { setStep('upload'); setRawData(null); }}>← Másik fájl</Btn>
            </div>
            {error && <div style={{color:RED,fontSize:13,marginTop:12}}>{error}</div>}
          </div>
        )}

        {step === 'processing' && (
          <div style={{textAlign:'center',padding:'40px 0'}}>
            <div style={{fontSize:36,marginBottom:16,animation:'pulse 1.5s ease-in-out infinite'}}>✦</div>
            <div style={{fontFamily:"'Instrument Serif',serif",fontSize:18,color:TEXT,marginBottom:8}}>AI feldolgozás</div>
            <div style={{fontSize:14,color:MUTED}}>A mesterséges intelligencia elemzi az Excel-t és kiolvassa a kompetencia-struktúrát...</div>
            <style>{`@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }`}</style>
          </div>
        )}

        {step === 'done' && parsedDims && (
          <div>
            <div style={{background:`${GREEN}08`,border:`1px solid ${GREEN}30`,borderRadius:12,padding:'14px 18px',marginBottom:18}}>
              <div style={{fontSize:14,color:GREEN,fontWeight:600,marginBottom:6}}>✓ Struktúra felismerve!</div>
              <div style={{fontSize:13,color:TEXT}}>{parsedName}</div>
            </div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:14}}>
              {parsedDims.map(d => <Badge key={d.id} color={d.color||GOLD}>{d.id} — {d.name} ({d.items.length})</Badge>)}
            </div>
            <div style={{fontSize:12,color:MUTED,marginBottom:6}}>
              {parsedDims.length} dimenzió · {parsedDims.reduce((s,d)=>s+d.items.length,0)} alkompetencia
            </div>
            <div style={{maxHeight:200,overflowY:'auto',background:S2,borderRadius:10,padding:'10px 14px',marginBottom:18,border:`1px solid ${BORD}`}}>
              {parsedDims.map(d => (
                <div key={d.id} style={{marginBottom:10}}>
                  <div style={{fontSize:12,color:d.color||GOLD,fontWeight:700}}>{d.id} — {d.name}</div>
                  {d.items.map(it => (
                    <div key={it.id} style={{fontSize:11,color:TEXT,padding:'2px 0 2px 16px'}}>• {it.text}</div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
              <Btn onClick={() => onResult(parsedDims, parsedName)}>Tovább a szerkesztőbe →</Btn>
              <Btn variant="ghost" onClick={() => { setStep('preview'); setParsedDims(null); }}>← Újra feldolgozás</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SELF PICK VIEW ────────────────────────────────────────────
function SelfPickView({ nav, goBack }) {
  const [showShare, setShowShare] = useState(false);
  const [showExcelUpload, setShowExcelUpload] = useState(false);
  const [customTpls, setCustomTpls] = useState([]);

  useEffect(() => { loadCustomTemplates().then(setCustomTpls); }, []);

  function handleShareClose(data) {
    if (data && data.dims) {
      nav('survey', { mode:'self', libraryId:data.libraryId||'custom_shared', dims:data.dims, surveyTitle:'Önértékelés — '+(data.customName||'Megosztott sablon'), customName:data.customName });
    }
    setShowShare(false);
  }

  function pickCustom(t) {
    nav('survey', { mode:'self', libraryId:t.id, dims:t.dims, surveyTitle:'Önértékelés — '+t.name, customName:t.name });
  }
  function editCustom(t) {
    nav('library_manager', { editTemplateId:t.id });
  }
  async function deleteCustom(id) {
    await deleteCustomTemplate(id);
    setCustomTpls(prev => prev.filter(t => t.id !== id));
  }
  async function duplicateCustom(t) {
    const newName = t.name + ' (másolat)';
    await saveCustomTemplate(newName, JSON.parse(JSON.stringify(t.dims)));
    const refreshed = await loadCustomTemplates();
    setCustomTpls(refreshed);
  }

  return (
    <div style={{background:BG,minHeight:'100vh'}}>
      <TopBar title="Sablon választás" back onBack={goBack}/>
      <div style={{maxWidth:740,margin:'0 auto',padding:'36px 24px'}}>
        <h2 style={{fontFamily:"'Instrument Serif',serif",fontSize:26,color:TEXT,fontWeight:300,marginBottom:8}}>Melyik területen értékelődsz?</h2>
        <p style={{color:MUTED,marginBottom:28}}>Válassz előre elkészített sablont, vagy készítsd el a sajátodat.</p>

        {/* ── Egyedi kérdőív készítő eszközök ── */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          <div onClick={() => nav('library_manager', { sourcePresetId:'ledge-ai-aug' })}
            style={{background:SURF,border:`1px solid ${GDIM}`,borderRadius:12,padding:'18px 16px',cursor:'pointer',textAlign:'center',transition:'all .2s'}}
            onMouseEnter={e => { e.currentTarget.style.borderColor=GOLD; e.currentTarget.style.background=S2; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor=GDIM; e.currentTarget.style.background=SURF; }}>
            <div style={{fontSize:22,marginBottom:8}}>📋</div>
            <div style={{fontSize:14,color:TEXT,fontWeight:600,marginBottom:6}}>Kérdőív szerkesztő</div>
            <div style={{fontSize:12,color:MUTED,lineHeight:1.5}}>Írd be a kompetenciákat és alkompetenciákat kézzel, rendezd drag-and-droppal</div>
          </div>
          <div onClick={() => nav('ai_builder')}
            style={{background:SURF,border:`1px solid ${BORD}`,borderRadius:12,padding:'18px 16px',cursor:'pointer',textAlign:'center',transition:'all .2s'}}
            onMouseEnter={e => { e.currentTarget.style.borderColor=GOLD+'55'; e.currentTarget.style.background=S2; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor=BORD; e.currentTarget.style.background=SURF; }}>
            <div style={{fontSize:22,marginBottom:8}}>✦</div>
            <div style={{fontSize:14,color:TEXT,fontWeight:600,marginBottom:6}}>AI Kérdőív-tervező</div>
            <div style={{fontSize:12,color:MUTED,lineHeight:1.5}}>Írd le a kontextust és az AI összeállít egy kompetencia-struktúrát neked</div>
          </div>
          <div onClick={() => setShowExcelUpload(true)}
            style={{background:SURF,border:`1px solid ${BORD}`,borderRadius:12,padding:'18px 16px',cursor:'pointer',textAlign:'center',transition:'all .2s'}}
            onMouseEnter={e => { e.currentTarget.style.borderColor=GREEN+'88'; e.currentTarget.style.background=S2; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor=BORD; e.currentTarget.style.background=SURF; }}>
            <div style={{fontSize:22,marginBottom:8}}>📊</div>
            <div style={{fontSize:14,color:TEXT,fontWeight:600,marginBottom:6}}>Excel feltöltés</div>
            <div style={{fontSize:12,color:MUTED,lineHeight:1.5}}>Töltsd fel az Excel file-odat és az AI kiolvassa a kompetencia-struktúrát</div>
          </div>
          <div onClick={() => setShowShare(true)}
            style={{background:SURF,border:`1px solid ${BORD}`,borderRadius:12,padding:'18px 16px',cursor:'pointer',textAlign:'center',transition:'all .2s'}}
            onMouseEnter={e => { e.currentTarget.style.borderColor=GOLD+'55'; e.currentTarget.style.background=S2; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor=BORD; e.currentTarget.style.background=SURF; }}>
            <div style={{fontSize:22,marginBottom:8}}>🔗</div>
            <div style={{fontSize:14,color:TEXT,fontWeight:600,marginBottom:6}}>Sablon betöltése kóddal</div>
            <div style={{fontSize:12,color:MUTED,lineHeight:1.5}}>Töltsd be valaki más által megosztott kérdőív sablont egy kód megadásával</div>
          </div>
        </div>

        {/* ── Saját sablonok ── */}
        <CustomTemplateSection templates={customTpls} onPick={pickCustom} onEdit={editCustom} onDelete={deleteCustom} onDuplicate={duplicateCustom}/>

        {/* ── Elválasztó: vezetői sablonok ── */}
        <div style={{display:'flex',alignItems:'center',gap:16,margin:'32px 0 18px'}}>
          <div style={{flex:1,height:1,background:BORD}}/>
          <span style={{fontSize:12,color:MUTED,textTransform:'uppercase',letterSpacing:'.1em',flexShrink:0}}>Vezetői kompetencia sablonok</span>
          <div style={{flex:1,height:1,background:BORD}}/>
        </div>

        {/* ── Leadership Preset sablonok ── */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          {PRESETS.filter(p => p.category === 'leadership').map(p => (
            <div key={p.id}
              onClick={() => nav('survey', { mode:'self', libraryId:p.id, dims:p.dims, surveyTitle:'Önértékelés — '+p.name })}
              style={{background:SURF,border:`1px solid ${BORD}`,borderRadius:14,padding:22,cursor:'pointer',transition:'all .2s'}}
              onMouseEnter={e => { e.currentTarget.style.borderColor = GDIM; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = BORD; }}>
              <div style={{fontSize:30,marginBottom:10}}>{p.icon}</div>
              <div style={{fontSize:15,color:TEXT,fontWeight:600,marginBottom:3}}>{p.name}</div>
              <div style={{fontSize:12,color:MUTED,marginBottom:10}}>{p.subtitle}</div>
              <div style={{display:'flex',gap:8}}>
                <Badge color={GOLD}>{p.dims.length} dim</Badge>
                <Badge color={MUTED}>{p.itemCount} item</Badge>
              </div>
            </div>
          ))}
        </div>

        {/* ── Elválasztó: klasszikus tesztek ── */}
        <div style={{display:'flex',alignItems:'center',gap:16,margin:'32px 0 18px'}}>
          <div style={{flex:1,height:1,background:BORD}}/>
          <span style={{fontSize:12,color:MUTED,textTransform:'uppercase',letterSpacing:'.1em',flexShrink:0}}>Klasszikus önismereti tesztek</span>
          <div style={{flex:1,height:1,background:BORD}}/>
        </div>

        {/* ── Classic test presets ── */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          {PRESETS.filter(p => p.category === 'classic').map(p => (
            <div key={p.id}
              onClick={() => nav('survey', { mode:'self', libraryId:p.id, dims:p.dims, surveyTitle:'Önértékelés — '+p.name })}
              style={{background:SURF,border:`1px solid ${BORD}`,borderRadius:14,padding:22,cursor:'pointer',transition:'all .2s'}}
              onMouseEnter={e => { e.currentTarget.style.borderColor = GDIM; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = BORD; }}>
              <div style={{fontSize:30,marginBottom:10}}>{p.icon}</div>
              <div style={{fontSize:15,color:TEXT,fontWeight:600,marginBottom:3}}>{p.name}</div>
              <div style={{fontSize:12,color:MUTED,marginBottom:10}}>{p.subtitle}</div>
              <div style={{display:'flex',gap:8}}>
                <Badge color={GOLD}>{p.dims.length} dim</Badge>
                <Badge color={MUTED}>{p.itemCount} item</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
      {showShare && <ShareModal onClose={handleShareClose}/>}
      {showExcelUpload && (
        <ExcelUploadModal
          onClose={() => setShowExcelUpload(false)}
          onResult={(dims, name) => {
            setShowExcelUpload(false);
            nav('library_manager', { importedDims: dims, importedName: name || 'Excel import' });
          }}
        />
      )}
    </div>
  );
}

// ─── SELF REPORT VIEW ──────────────────────────────────────────
function SelfReportView({ nav, goBack, ctx }) {
  const selfId = ctx.selfId;
  const [data, setData] = useState(null);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    (async () => {
      let d = null;
      if (selfId) {
        d = await db.get('self:' + selfId);
      }
      if (!d) {
        d = await db.get('leader_self');
      }
      setData(d);
    })();
  }, [selfId]);

  if (!data) return <div style={{padding:40,color:MUTED,textAlign:'center',background:BG,minHeight:'100vh'}}>Nincs önértékelés adat.</div>;
  const preset = resolvePreset(data.libraryId, data.dims);
  const selfComments = data.comment ? [{ text: data.comment, groupName: 'Saját megjegyzés', emoji: '🪞', color: GOLD, timestamp: data.timestamp }] : [];

  function handleShareClose(imported) {
    setShowShare(false);
  }

  return (
    <div style={{background:BG,minHeight:'100vh'}}>
      <TopBar title={data.customName || 'Önértékelés részletei'} back onBack={goBack}
        right={<Btn variant="ghost" size="sm" onClick={() => setShowShare(true)}>🔗 Megosztás</Btn>}/>
      <div style={{maxWidth:900,margin:'0 auto',padding:'24px'}}>
        <div style={{display:'flex',gap:10,marginBottom:18,alignItems:'center',flexWrap:'wrap'}}>
          <Badge color={GOLD}>{preset.name}</Badge>
          <span style={{fontSize:12,color:MUTED}}>{new Date(data.timestamp).toLocaleDateString('hu-HU')}</span>
        </div>
        <ReportView dims={preset.dims} selfScores={data.scores} groups={[]} comments={selfComments} scaleMax={getScaleMax(data.scaleId || '5pt')}/>
      </div>
      {showShare && <ShareModal onClose={handleShareClose} libraryId={data.libraryId} dims={preset.dims} customName={data.customName}/>}
    </div>
  );
}

// ─── LEADER COMPARE VIEW ───────────────────────────────────────
function LeaderCompareView({ nav, goBack }) {
  const [allSelves,   setAllSelves]   = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [richGroups,  setRichGroups]  = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    (async () => {
      const idx = await db.get('leader_selves') || [];
      const loaded = [];
      for (const entry of idx) {
        const d = await db.get('self:'+entry.id);
        if (d) loaded.push({ ...d, selfId: entry.id, customName: entry.customName || d.customName });
      }
      if (loaded.length === 0) {
        const sd = await db.get('leader_self');
        if (sd) loaded.push(sd);
      }
      setAllSelves(loaded);
      const grps = await db.get('leader_groups');
      if (grps) {
        const result = await Promise.all((grps||[]).map(async g => {
          const done  = (g.members||[]).filter(m => m.status === 'done');
          const resps = await Promise.all(done.map(m => db.get('resp:'+m.code)));
          return { ...g, scores: resps.filter(Boolean).map(r => r.scores||{}), resps: resps.filter(Boolean) };
        }));
        setRichGroups(result);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <div style={{padding:60,color:MUTED,textAlign:'center',background:BG,minHeight:'100vh'}}>Betöltés...</div>;
  if (allSelves.length === 0) return <div style={{padding:40,color:MUTED,textAlign:'center',background:BG,minHeight:'100vh'}}>Nincs önértékelés.</div>;

  const selfData  = allSelves[selectedIdx];
  const preset    = resolvePreset(selfData.libraryId, selfData.dims);
  const totalDone = richGroups.reduce((s,g) => s+(g.scores||[]).length, 0);

  const allComments = richGroups.flatMap(g =>
    (g.resps || []).filter(r => r.comment).map(r => ({
      text: r.comment,
      groupName: g.name,
      emoji: g.emoji,
      color: g.color,
      timestamp: r.timestamp,
    }))
  );

  return (
    <div style={{background:BG,minHeight:'100vh'}}>
      <TopBar title="Összehasonlító elemzés" back onBack={goBack}/>
      <div style={{maxWidth:960,margin:'0 auto',padding:'24px'}}>
        {allSelves.length > 1 && (
          <div style={{marginBottom:18}}>
            <div style={{fontSize:11,color:MUTED,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:8}}>Önértékelés kiválasztása</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {allSelves.map((s, i) => {
                const p = resolvePreset(s.libraryId, s.dims);
                const label = s.customName || p.name;
                return (
                  <button key={i} onClick={() => setSelectedIdx(i)}
                    style={{background:i===selectedIdx?`${GOLD}14`:SURF,border:`1px solid ${i===selectedIdx?GOLD:BORD}`,borderRadius:10,padding:'8px 16px',cursor:'pointer',transition:'all .15s'}}>
                    <div style={{fontSize:13,color:i===selectedIdx?GOLD:TEXT,fontWeight:i===selectedIdx?600:400}}>{label}</div>
                    <div style={{fontSize:11,color:MUTED}}>{new Date(s.timestamp).toLocaleDateString('hu-HU')}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'center',marginBottom:20}}>
          <Badge color={GOLD}>{preset.name}</Badge>
          {totalDone > 0 && <Badge color={BLUE}>{totalDone} értékelő visszajelzése</Badge>}
          {richGroups.filter(g => (g.scores||[]).length > 0).map(g => (
            <Badge key={g.id} color={g.color||GOLD}>{g.emoji} {g.name}: {g.scores.length} fő</Badge>
          ))}
        </div>
        <ReportView dims={preset.dims} selfScores={selfData.scores} groups={richGroups} comments={allComments} scaleMax={getScaleMax(selfData.scaleId || '5pt')}/>
      </div>
    </div>
  );
}

// ─── GROUP MANAGE VIEW ─────────────────────────────────────────
function GroupManageView({ nav, goBack, ctx }) {
  const groupId = ctx.groupId;
  const [groups,  setGroups]  = useState([]);
  const [group,   setGroup]   = useState(null);
  const [fn, setFn] = useState('');
  const [ln, setLn] = useState('');
  const [em, setEm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [viewingMember, setViewingMember] = useState(null);
  const [viewingResp,   setViewingResp]   = useState(null);

  const load = useCallback(async () => {
    const grps = await db.get('leader_groups') || [];
    setGroups(grps);
    setGroup(grps.find(x => x.id === groupId) || null);
    setLoading(false);
  }, [groupId]);

  useEffect(() => { load(); }, [load]);

  async function save(updated) {
    const ng = groups.map(g => g.id === groupId ? updated : g);
    await db.set('leader_groups', ng);
    setGroups(ng);
    setGroup(updated);
  }

  async function addMember() {
    if (!fn.trim() || !group) return;
    const m = { id:'mbr_'+uid(8), firstName:fn.trim(), lastName:ln.trim(), email:em.trim(), code:uid(12), status:'pending' };
    await save({ ...group, members: [...(group.members||[]), m] });
    setFn(''); setLn(''); setEm('');
  }

  async function removeMember(id) {
    await save({ ...group, members: (group.members||[]).filter(m => m.id !== id) });
  }

  async function deleteGroup() {
    const ng = groups.filter(g => g.id !== groupId);
    await db.set('leader_groups', ng);
    nav('leader_dashboard');
  }

  async function viewResponse(m) {
    const r = await db.get('resp:'+m.code);
    setViewingMember(m);
    setViewingResp(r);
  }

  async function startSurvey(code) {
    // Use group's stored library if set, otherwise fall back to leader_self
    let preset;
    if (group.customDims || group.libraryId) {
      preset = resolvePreset(group.libraryId || 'custom', group.customDims);
    } else {
      const sd = await db.get('leader_self');
      preset = resolvePreset(sd ? sd.libraryId : null, sd ? sd.dims : null);
    }
    nav('survey', { mode:'peer', raterCode:code, groupId:groupId, dims:preset.dims, libraryId:preset.id, surveyTitle:group.emoji+' '+group.name+' — értékelés' });
  }

  if (loading) return <div style={{padding:40,color:MUTED,textAlign:'center',background:BG,minHeight:'100vh'}}>Betöltés...</div>;
  if (!group)  return <div style={{padding:40,color:MUTED,textAlign:'center',background:BG,minHeight:'100vh'}}>Csoport nem található.</div>;

  return (
    <div style={{background:BG,minHeight:'100vh'}}>
      <TopBar
        title={group.emoji+' '+group.name}
        subtitle={(group.members||[]).length+' tag'}
        back onBack={goBack}
        right={<Btn variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>Csoport törlése</Btn>}
      />
      <div style={{maxWidth:700,margin:'0 auto',padding:'24px'}}>
        <Card style={{marginBottom:22}}>
          <div style={{fontSize:13,color:GOLD,fontWeight:600,marginBottom:12}}>Tag hozzáadása</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <Input label="Keresztnév" value={fn} onChange={setFn} placeholder="Péter"/>
            <Input label="Vezetéknév" value={ln} onChange={setLn} placeholder="Nagy"/>
          </div>
          <Input label="Email (opcionális)" value={em} onChange={setEm} placeholder="peter@ceg.hu" type="email"/>
          <Btn onClick={addMember} disabled={!fn.trim()}>+ Azonosító generálása</Btn>
        </Card>

        {(group.members||[]).length === 0 && (
          <div style={{textAlign:'center',padding:'28px 0',color:MUTED,fontSize:14}}>
            Még nincs tag ebben a csoportban. Add hozzá az első személyt.
          </div>
        )}

        <div style={{fontSize:12,color:MUTED,marginBottom:10,textTransform:'uppercase',letterSpacing:'.08em'}}>
          {(group.members||[]).length} tag
        </div>

        {(group.members||[]).map(m => (
          <div key={m.id} style={{background:SURF,border:`1px solid ${BORD}`,borderRadius:12,padding:'14px 18px',marginBottom:10,display:'flex',alignItems:'center',gap:12}}>
            <div style={{flex:1}}>
              <div style={{fontSize:14,color:TEXT,fontWeight:500}}>{m.firstName} {m.lastName}</div>
              {m.email && <div style={{fontSize:12,color:MUTED}}>{m.email}</div>}
            </div>
            <div style={{textAlign:'center'}}>
              <CopyCode code={m.code}/>
            </div>
            <StatusDot status={m.status==='done'?'done':m.status==='in_progress'?'in_progress':'pending'}/>
            {m.status === 'done'
              ? <Btn variant="ghost" size="sm" onClick={() => viewResponse(m)} style={{fontSize:11,color:GREEN}}>Válasz 📊</Btn>
              : <Btn variant="ghost" size="sm" onClick={() => startSurvey(m.code)} style={{fontSize:11}}>Kitöltés ✎</Btn>
            }
            <button onClick={() => removeMember(m.id)} style={{background:'none',border:'none',color:DIM,cursor:'pointer',fontSize:16,padding:4}}>✕</button>
          </div>
        ))}
      </div>

      {viewingMember && viewingResp && (() => {
        const preset = resolvePreset(group.libraryId || null, group.customDims);
        const dims = preset.dims;
        return (
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.25)',backdropFilter:'blur(4px)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
            <div style={{background:SURF,border:`1px solid ${BORD}`,borderRadius:18,padding:30,width:'100%',maxWidth:560,maxHeight:'80vh',overflow:'auto',boxShadow:'0 8px 30px rgba(0,0,0,.5)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
                <div>
                  <div style={{fontFamily:"'Instrument Serif',serif",fontSize:20,color:TEXT}}>{viewingMember.firstName} {viewingMember.lastName}</div>
                  <div style={{fontSize:12,color:MUTED}}>Beérkezett válasz</div>
                </div>
                <Btn variant="ghost" size="sm" onClick={() => { setViewingMember(null); setViewingResp(null); }}>✕</Btn>
              </div>
              {dims.map(d => {
                const items = d.items || [];
                const scores = viewingResp.scores || {};
                return (
                  <div key={d.id} style={{marginBottom:16}}>
                    <div style={{fontSize:13,color:d.color||GOLD,fontWeight:700,marginBottom:6}}>{d.name}</div>
                    {items.map(it => {
                      const v = scores[it.id];
                      return (
                        <div key={it.id} style={{display:'flex',alignItems:'center',gap:10,padding:'4px 0',borderBottom:`1px solid ${BORD}`}}>
                          <div style={{flex:1,fontSize:12,color:TEXT}}>{it.text}</div>
                          <div style={{width:36,textAlign:'center',fontSize:14,fontWeight:700,color:v?scoreColor(v,5):MUTED}}>{v||'—'}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              {viewingResp.comment && (
                <div style={{marginTop:12}}>
                  {typeof viewingResp.comment === 'string' ? (
                    <div style={{background:`${GOLD}08`,border:`1px solid ${GOLD}22`,borderRadius:10,padding:'12px 16px'}}>
                      <div style={{fontSize:11,color:GOLD,fontWeight:700,marginBottom:6}}>Szöveges visszajelzés</div>
                      <div style={{fontSize:13,color:TEXT,lineHeight:1.5}}>{viewingResp.comment}</div>
                    </div>
                  ) : (
                    <div style={{display:'flex',flexDirection:'column',gap:10}}>
                      {viewingResp.comment.growth && (
                        <div style={{background:`${ORAN}08`,border:`1px solid ${ORAN}22`,borderRadius:10,padding:'12px 16px'}}>
                          <div style={{fontSize:11,color:ORAN,fontWeight:700,marginBottom:6}}>🌱 Fejlődési lehetőségek</div>
                          <div style={{fontSize:13,color:TEXT,lineHeight:1.5}}>{viewingResp.comment.growth}</div>
                        </div>
                      )}
                      {viewingResp.comment.strength && (
                        <div style={{background:`${GREEN}08`,border:`1px solid ${GREEN}22`,borderRadius:10,padding:'12px 16px'}}>
                          <div style={{fontSize:11,color:GREEN,fontWeight:700,marginBottom:6}}>💪 Erősségek</div>
                          <div style={{fontSize:13,color:TEXT,lineHeight:1.5}}>{viewingResp.comment.strength}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {showDeleteConfirm && (
        <ConfirmModal
          title={'Csoport törlése: '+group.emoji+' '+group.name}
          message="A csoport és az összes tag törlésre kerül. A beérkezett válaszok adatai megmaradnak az elemzésben. Ez a művelet nem vonható vissza."
          confirmLabel="Igen, törlés"
          onConfirm={deleteGroup}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}

// ─── SURVEY ENTER VIEW ─────────────────────────────────────────
function SurveyEnterView({ nav, goBack, ctx }) {
  const inviteCode = ctx && ctx.inviteCode ? ctx.inviteCode : '';
  const [code,    setCode]    = useState(inviteCode);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const autoTriggered = useRef(false);

  // Auto-submit if inviteCode came from URL ?code=XXX
  useEffect(() => {
    if (inviteCode && !autoTriggered.current) {
      autoTriggered.current = true;
      handle();
    }
  }, [inviteCode]);

  async function handle() {
    const t = code.trim().toUpperCase();
    if (t.length < 6) { setError('Az azonosító legalább 6 karakter.'); return; }
    setLoading(true); setError('');

    // 1. Search leader groups
    const grps = await db.get('leader_groups') || [];
    for (const g of grps) {
      const m = (g.members||[]).find(x => x.code === t);
      if (m) {
        // Use group's own library if set, fallback to leader_self
        let preset;
        if (g.customDims) {
          preset = resolvePreset(g.libraryId || 'custom', g.customDims);
        } else if (g.libraryId) {
          preset = getPreset(g.libraryId);
        } else {
          const sd = await db.get('leader_self');
          preset = resolvePreset(sd ? sd.libraryId : null, sd ? sd.dims : null);
        }
        const updated = grps.map(gr =>
          gr.id === g.id
            ? { ...gr, members: gr.members.map(x => (x.code===t && x.status!=='done') ? {...x,status:'in_progress'} : x) }
            : gr
        );
        await db.set('leader_groups', updated);
        nav('survey', { mode:'peer', raterCode:t, groupId:g.id, dims:preset.dims, libraryId:preset.id, surveyTitle:g.emoji+' '+g.name+' — értékelés' });
        setLoading(false); return;
      }
    }

    // 2. Search consultant projects — FIX: list rats once outside loop
    const projKeys  = await db.list('proj:');
    const ratKeys   = await db.list('rat:');
    const allRats   = await Promise.all(ratKeys.map(k => db.get(k)));

    for (const pk of projKeys) {
      const proj = await db.get(pk);
      if (!proj) continue;
      const ratIdx = allRats.findIndex(r => r && r.projectId === proj.id && r.code === t);
      if (ratIdx >= 0) {
        const rat    = allRats[ratIdx];
        const ratKey = ratKeys[ratIdx];
        const preset = resolvePreset(proj.libraryId, proj.customDims);
        const part   = await db.get(rat.participantId);
        await db.set(ratKey, { ...rat, status: rat.status==='done' ? 'done' : 'in_progress' });
        nav('survey', {
          mode:'peer', raterCode:t, raterId:ratKey,
          participantId:rat.participantId, projectId:proj.id,
          dims:preset.dims, libraryId:proj.libraryId,
          surveyTitle:'Értékelés — '+(part ? part.firstName+' '+part.lastName : 'Résztvevő'),
        });
        setLoading(false); return;
      }
    }

    setError('Érvénytelen azonosító. Ellenőrizd a kapott kódot.');
    setLoading(false);
  }

  return (
    <div style={{background:BG,minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{width:'100%',maxWidth:400}}>
        <div style={{textAlign:'center',marginBottom:28}}>
          <div style={{fontFamily:"'Instrument Serif',serif",fontSize:16,color:GOLD,letterSpacing:'.06em',marginBottom:8}}>LEDGE ◈ 360°</div>
          <h2 style={{fontFamily:"'Instrument Serif',serif",fontSize:26,color:TEXT,fontWeight:300,margin:'0 0 8px'}}>Értékelés kitöltése</h2>
          <p style={{color:MUTED,fontSize:14}}>Add meg a kapott egyedi azonosítót.</p>
        </div>
        <Card>
          <div style={{marginBottom:20}}>
            <div style={{fontSize:11,color:MUTED,marginBottom:6,textTransform:'uppercase',letterSpacing:'.08em'}}>Azonosítód</div>
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              onKeyDown={e => { if (e.key === 'Enter') handle(); }}
              placeholder="pl. ABC123DEF456"
              maxLength={16}
              style={{width:'100%',background:S2,border:`1px solid ${error?RED:BORD}`,borderRadius:10,padding:'14px 16px',color:TEXT,fontSize:20,fontFamily:'monospace',letterSpacing:'.18em',outline:'none',boxSizing:'border-box',textAlign:'center',fontWeight:700}}
            />
            {error && <div style={{color:RED,fontSize:12,marginTop:6}}>{error}</div>}
          </div>
          <Btn onClick={handle} disabled={loading || code.trim().length < 4} size="lg" style={{width:'100%'}}>
            {loading ? 'Keresés...' : 'Tovább →'}
          </Btn>
        </Card>
        <div style={{textAlign:'center',marginTop:16}}>
          <button onClick={goBack} style={{background:'none',border:'none',color:MUTED,fontSize:13,cursor:'pointer'}}>
            {'← Vissza'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SURVEY DONE VIEW ──────────────────────────────────────────
function SurveyDoneView({ nav, goBack, ctx }) {
  const returnTo      = ctx.returnTo;
  const returnGroupId = ctx.returnGroupId;
  return (
    <div style={{background:BG,minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24,textAlign:'center'}}>
      <div style={{width:64,height:64,borderRadius:'50%',background:`${GREEN}22`,border:`2px solid ${GREEN}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,marginBottom:20}}>✓</div>
      <h2 style={{fontFamily:"'Instrument Serif',serif",fontSize:28,color:TEXT,fontWeight:300,margin:'0 0 10px'}}>Köszönjük!</h2>
      <p style={{color:MUTED,fontSize:14,maxWidth:380,lineHeight:1.7}}>
        Az értékelés sikeresen beküldve. A visszajelzésedet névtelenül, aggregált formában dolgozzuk fel.
      </p>
      <div style={{marginTop:6,fontSize:12,color:DIM}}>LEDGE 360° — ZEL Group</div>
      <div style={{marginTop:24,display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
        {returnTo === 'group_manage' && returnGroupId && (
          <Btn onClick={() => nav('group_manage', { groupId:returnGroupId })}>{'← Vissza a csoporthoz'}</Btn>
        )}
        <Btn variant="ghost" onClick={() => nav('home')}>Főoldal</Btn>
      </div>
    </div>
  );
}

// ─── ADMIN VIEW ────────────────────────────────────────────────
function AdminView({ nav, goBack }) {
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    db.list('proj:').then(async keys => {
      const ps = await Promise.all(keys.map(k => db.get(k)));
      setProjects(ps.filter(Boolean).sort((a,b) => (b.created||0)-(a.created||0)));
      setLoading(false);
    });
  }, []);

  return (
    <div style={{background:BG,minHeight:'100vh'}}>
      <TopBar title="Szervezeti 360° projektek" back onBack={goBack}
        right={<Btn size="sm" onClick={() => nav('new_project')}>+ Új projekt</Btn>}/>
      <div style={{maxWidth:840,margin:'0 auto',padding:'24px'}}>
        <div style={{marginBottom:20}}>
          <h2 style={{fontFamily:"'Instrument Serif',serif",fontSize:26,color:TEXT,fontWeight:300,margin:0}}>Projektek</h2>
          <p style={{color:MUTED,marginTop:6}}>{projects.length > 0 ? projects.length+' projekt' : 'Még nincs projekt.'}</p>
        </div>
        {loading && <div style={{color:MUTED,textAlign:'center',padding:40}}>Betöltés...</div>}
        {!loading && projects.length === 0 && (
          <div style={{textAlign:'center',padding:60,color:MUTED}}>
            <div style={{fontSize:48,marginBottom:16}}>◈</div>
            <div style={{marginBottom:16}}>Hozd létre az első projektedet</div>
            <Btn onClick={() => nav('new_project')}>+ Új projekt</Btn>
          </div>
        )}
        <div style={{display:'grid',gap:10}}>
          {projects.map(p => {
            const preset = resolvePreset(p.libraryId, p.customDims);
            return (
              <div key={p.id}
                onClick={() => nav('project', { projectId:p.id })}
                style={{background:SURF,border:`1px solid ${BORD}`,borderRadius:12,padding:'14px 18px',cursor:'pointer',display:'flex',alignItems:'center',gap:14,transition:'border-color .2s'}}
                onMouseEnter={e => { e.currentTarget.style.borderColor = GDIM; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = BORD; }}>
                <div style={{width:42,height:42,borderRadius:10,background:`${GOLD}22`,border:`1px solid ${GDIM}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,color:GOLD,flexShrink:0}}>{preset.icon}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:15,color:TEXT,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</div>
                  <div style={{fontSize:12,color:MUTED,marginTop:2}}>
                    {p.client && <span style={{marginRight:10}}>{'📋'} {p.client}</span>}
                    {preset.name}
                  </div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <Badge color={p.status==='active'?GREEN:MUTED}>{p.status==='active'?'Aktív':p.status==='draft'?'Piszkozat':'Lezárt'}</Badge>
                  <div style={{fontSize:11,color:MUTED,marginTop:4}}>{new Date(p.created).toLocaleDateString('hu-HU')}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── NEW PROJECT VIEW ──────────────────────────────────────────
function NewProjectView({ nav, goBack }) {
  const [name,   setName]   = useState('');
  const [client, setClient] = useState('');
  const [saving, setSaving] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [customTpls, setCustomTpls] = useState([]);

  useEffect(() => { loadCustomTemplates().then(setCustomTpls); }, []);

  async function createWithLib(libraryId, customDims) {
    if (!name.trim()) return;
    setSaving(true);
    const id = 'proj:'+uid(10);
    const projData = { id, name:name.trim(), client:client.trim(), libraryId, status:'draft', roles:DEFAULT_ROLES, created:Date.now() };
    if (customDims) projData.customDims = customDims;
    await db.set(id, projData);
    setSaving(false);
    return id;
  }

  async function pickPreset(preset) {
    const id = await createWithLib(preset.id);
    if (id) nav('project', { projectId: id });
  }

  async function goToEditor() {
    if (!name.trim()) return;
    const id = await createWithLib('ledge-ai-aug');
    if (id) nav('library_manager', { projectId: id });
  }

  async function goToAIBuilder() {
    if (!name.trim()) return;
    const id = await createWithLib('ledge-ai-aug');
    if (id) nav('ai_builder', { projectId: id });
  }

  function handleShareClose(data) {
    if (data && data.dims) {
      (async () => {
        const id = await createWithLib(data.libraryId || 'custom_shared', data.dims);
        if (id) nav('project', { projectId: id });
      })();
    }
    setShowShare(false);
  }

  const ready = name.trim().length > 0;

  return (
    <div style={{background:BG,minHeight:'100vh'}}>
      <TopBar title="Új projekt" back onBack={goBack}/>
      <div style={{maxWidth:740,margin:'0 auto',padding:'36px 24px'}}>
        <h2 style={{fontFamily:"'Instrument Serif',serif",fontSize:24,color:TEXT,fontWeight:300,marginBottom:22}}>Projekt létrehozása</h2>

        {/* Name + Client */}
        <Card style={{marginBottom:28}}>
          <Input label="Projekt neve"       value={name}   onChange={setName}   placeholder="pl. Q1 Vezetői 360° — Marketing"/>
          <Input label="Ügyfél / Szervezet" value={client} onChange={setClient} placeholder="pl. Acme Kft."/>
        </Card>

        {!ready && (
          <div style={{textAlign:'center',padding:'20px 0',color:MUTED,fontSize:14}}>Add meg a projekt nevét a kérdőív kiválasztásához.</div>
        )}

        {ready && (
          <>
            <div style={{fontSize:13,color:TEXT,fontWeight:600,marginBottom:18}}>Kérdőív kiválasztása</div>

            {/* ── Egyedi kérdőív eszközök ── */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14,opacity:saving?0.5:1,pointerEvents:saving?'none':'auto'}}>
              <div onClick={goToEditor}
                style={{background:SURF,border:`1px solid ${GDIM}`,borderRadius:12,padding:'18px 16px',cursor:'pointer',textAlign:'center',transition:'all .2s'}}
                onMouseEnter={e => { e.currentTarget.style.borderColor=GOLD; e.currentTarget.style.background=S2; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=GDIM; e.currentTarget.style.background=SURF; }}>
                <div style={{fontSize:22,marginBottom:8}}>📋</div>
                <div style={{fontSize:14,color:TEXT,fontWeight:600,marginBottom:6}}>Kérdőív szerkesztő</div>
                <div style={{fontSize:12,color:MUTED,lineHeight:1.5}}>Írd be a kompetenciákat és alkompetenciákat kézzel, rendezd drag-and-droppal</div>
              </div>
              <div onClick={goToAIBuilder}
                style={{background:SURF,border:`1px solid ${BORD}`,borderRadius:12,padding:'18px 16px',cursor:'pointer',textAlign:'center',transition:'all .2s'}}
                onMouseEnter={e => { e.currentTarget.style.borderColor=GOLD+'55'; e.currentTarget.style.background=S2; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=BORD; e.currentTarget.style.background=SURF; }}>
                <div style={{fontSize:22,marginBottom:8}}>✦</div>
                <div style={{fontSize:14,color:TEXT,fontWeight:600,marginBottom:6}}>AI Kérdőív-tervező</div>
                <div style={{fontSize:12,color:MUTED,lineHeight:1.5}}>Írd le a kontextust és az AI összeállít egy kompetencia-struktúrát neked</div>
              </div>
              <div onClick={() => setShowShare(true)}
                style={{background:SURF,border:`1px solid ${BORD}`,borderRadius:12,padding:'18px 16px',cursor:'pointer',textAlign:'center',transition:'all .2s'}}
                onMouseEnter={e => { e.currentTarget.style.borderColor=GOLD+'55'; e.currentTarget.style.background=S2; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=BORD; e.currentTarget.style.background=SURF; }}>
                <div style={{fontSize:22,marginBottom:8}}>🔗</div>
                <div style={{fontSize:14,color:TEXT,fontWeight:600,marginBottom:6}}>Sablon betöltése kóddal</div>
                <div style={{fontSize:12,color:MUTED,lineHeight:1.5}}>Töltsd be valaki más által megosztott kérdőív sablont egy kód megadásával</div>
              </div>
            </div>

            {/* ── Saját sablonok ── */}
            <CustomTemplateSection
              templates={customTpls}
              onPick={async (t) => { const id = await createWithLib(t.id, t.dims); if (id) nav('project', { projectId:id }); }}
              onEdit={(t) => { (async () => { const id = await createWithLib(t.id, t.dims); if (id) nav('library_manager', { projectId:id }); })(); }}
              onDelete={async (id) => { await deleteCustomTemplate(id); setCustomTpls(prev => prev.filter(t => t.id !== id)); }}
              onDuplicate={async (t) => { await saveCustomTemplate(t.name+' (másolat)', JSON.parse(JSON.stringify(t.dims))); setCustomTpls(await loadCustomTemplates()); }}
            />

            {/* ── Elválasztó ── */}
            <div style={{display:'flex',alignItems:'center',gap:16,margin:'28px 0 18px'}}>
              <div style={{flex:1,height:1,background:BORD}}/>
              <span style={{fontSize:12,color:MUTED,textTransform:'uppercase',letterSpacing:'.1em',flexShrink:0}}>Előre elkészített sablonok</span>
              <div style={{flex:1,height:1,background:BORD}}/>
            </div>

            {/* ── Preset sablonok ── */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,opacity:saving?0.5:1,pointerEvents:saving?'none':'auto'}}>
              {PRESETS.map(p => (
                <div key={p.id}
                  onClick={() => pickPreset(p)}
                  style={{background:SURF,border:`1px solid ${BORD}`,borderRadius:14,padding:22,cursor:'pointer',transition:'all .2s'}}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = GDIM; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = BORD; }}>
                  <div style={{fontSize:30,marginBottom:10}}>{p.icon}</div>
                  <div style={{fontSize:15,color:TEXT,fontWeight:600,marginBottom:3}}>{p.name}</div>
                  <div style={{fontSize:12,color:MUTED,marginBottom:10}}>{p.subtitle}</div>
                  <div style={{display:'flex',gap:8}}>
                    <Badge color={GOLD}>{p.dims.length} dim</Badge>
                    <Badge color={MUTED}>{p.itemCount} item</Badge>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      {showShare && <ShareModal onClose={handleShareClose}/>}
    </div>
  );
}

// ─── PROJECT VIEW ──────────────────────────────────────────────
function ProjectView({ nav, goBack, ctx }) {
  const projectId = ctx.projectId;
  const [proj,    setProj]    = useState(null);
  const [parts,   setParts]   = useState([]);
  const [raters,  setRaters]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingP, setAddingP] = useState(false);
  const [fn, setFn] = useState('');
  const [ln, setLn] = useState('');
  const [em, setEm] = useState('');
  const [activatedMsg, setActivatedMsg] = useState(false);
  const [showDeleteProj, setShowDeleteProj] = useState(false);
  const [editingProj, setEditingProj] = useState(false);
  const [editName,    setEditName]    = useState('');
  const [editClient,  setEditClient]  = useState('');
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [deletingPartId, setDeletingPartId] = useState(null);
  const [collabs, setCollabs] = useState([]);
  const [collabEmail, setCollabEmail] = useState('');
  const [collabPerm, setCollabPerm] = useState('view');

  const load = useCallback(async () => {
    if (!projectId) return;
    const p   = await db.get(projectId);
    setProj(p);
    const pks = await db.list('part:');
    const ps  = await Promise.all(pks.map(k => db.get(k)));
    setParts(ps.filter(p => p && p.projectId === projectId));
    const rks = await db.list('rat:');
    const rs  = await Promise.all(rks.map(k => db.get(k)));
    setRaters(rs.filter(r => r && r.projectId === projectId));
    const cs = await db.get('collab:'+projectId) || [];
    setCollabs(cs);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  async function addPart() {
    if (!fn.trim()) return;
    const id  = 'part:'+uid(10);
    await db.set(id, { id, projectId, firstName:fn.trim(), lastName:ln.trim(), email:em.trim(), created:Date.now() });
    const sc  = uid(12);
    const rid = 'rat:'+uid(10);
    await db.set(rid, { id:rid, participantId:id, projectId, firstName:fn.trim(), lastName:ln.trim(), email:em.trim(), role:'self', code:sc, status:'pending' });
    setFn(''); setLn(''); setEm('');
    setAddingP(false);
    load();
  }

  async function activate() {
    const updated = { ...proj, status:'active' };
    await db.set(projectId, updated);
    setProj(updated);
    setActivatedMsg(true);
    setTimeout(() => setActivatedMsg(false), 3000);
  }

  async function saveEdit() {
    const updated = { ...proj, name: editName.trim() || proj.name, client: editClient.trim() };
    await db.set(projectId, updated);
    setProj(updated);
    setEditingProj(false);
  }

  async function archiveProject() {
    const updated = { ...proj, status: proj.status === 'archived' ? 'draft' : 'archived' };
    await db.set(projectId, updated);
    setProj(updated);
    setShowArchiveConfirm(false);
  }

  async function deleteProject() {
    // Delete all raters
    const rks = await db.list('rat:');
    const allR = await Promise.all(rks.map(k => db.get(k)));
    for (let i = 0; i < allR.length; i++) {
      if (allR[i] && allR[i].projectId === projectId) await db.del(rks[i]);
    }
    // Delete all participants
    const pks = await db.list('part:');
    const allP = await Promise.all(pks.map(k => db.get(k)));
    for (let i = 0; i < allP.length; i++) {
      if (allP[i] && allP[i].projectId === projectId) await db.del(pks[i]);
    }
    // Delete project
    await db.del(projectId);
    nav('admin');
  }

  async function deletePart(partId) {
    // Delete participant's raters
    const rks = await db.list('rat:');
    const allR = await Promise.all(rks.map(k => db.get(k)));
    for (let i = 0; i < allR.length; i++) {
      if (allR[i] && allR[i].participantId === partId) await db.del(rks[i]);
    }
    // Delete participant
    await db.del(partId);
    setDeletingPartId(null);
    load();
  }

  async function addCollab() {
    if (!collabEmail.trim()) return;
    const session = await auth.getSession();
    const c = { id:'col_'+uid(8), email:collabEmail.trim(), permission:collabPerm, addedBy:session?.id, status:'active', created:Date.now() };
    const all = [...collabs, c];
    await db.set('collab:'+projectId, all);
    setCollabs(all); setCollabEmail('');
    await audit('collab_add', session?.id, {projectId, email:c.email});
  }

  async function removeCollab(cid) {
    const all = collabs.filter(c => c.id !== cid);
    await db.set('collab:'+projectId, all);
    setCollabs(all);
  }

  if (loading) return <div style={{padding:40,color:MUTED,textAlign:'center',background:BG,minHeight:'100vh'}}>Betöltés...</div>;
  if (!proj)   return <div style={{padding:40,color:MUTED,textAlign:'center',background:BG,minHeight:'100vh'}}>Projekt nem található.</div>;

  const done = raters.filter(r => r.status === 'done').length;

  return (
    <div style={{background:BG,minHeight:'100vh'}}>
      <TopBar title={proj.name} subtitle={proj.client} back onBack={goBack}
        right={<div style={{display:'flex',gap:8,alignItems:'center'}}>
          <Btn variant="ghost" size="sm" onClick={() => { setEditingProj(true); setEditName(proj.name); setEditClient(proj.client||''); }}>✎</Btn>
          {proj.status === 'archived'
            ? <><Badge color={MUTED}>Archivált</Badge><Btn variant="ghost" size="sm" onClick={() => setShowArchiveConfirm(true)}>Visszaállítás</Btn></>
            : proj.status === 'active'
              ? <><Badge color={GREEN}>Aktív</Badge><Btn variant="ghost" size="sm" onClick={() => setShowArchiveConfirm(true)} style={{color:MUTED,fontSize:11}}>Archiválás</Btn></>
              : <><Btn size="sm" onClick={activate}>Aktiválás</Btn><Btn variant="ghost" size="sm" onClick={() => setShowArchiveConfirm(true)} style={{color:MUTED,fontSize:11}}>Archiválás</Btn></>}
          <Btn variant="danger" size="sm" onClick={() => setShowDeleteProj(true)}>🗑</Btn>
        </div>}
      />
      <div style={{maxWidth:860,margin:'0 auto',padding:'22px 24px'}}>
        {activatedMsg && (
          <div style={{background:`${GREEN}22`,border:`1px solid ${GREEN}44`,borderRadius:10,padding:'12px 16px',marginBottom:16,fontSize:13,color:GREEN}}>
            ✓ A projekt sikeresen aktiválva. Az értékelők most már kitölthetik a kérdőívet.
          </div>
        )}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:22}}>
          {[
            {label:'Résztvevők',val:parts.length, color:GOLD},
            {label:'Értékelők', val:raters.length,color:BLUE},
            {label:'Beküldött', val:done,          color:GREEN},
            {label:'Arány',     val:raters.length>0?Math.round(done/raters.length*100)+'%':'—',color:PURP},
          ].map(s => (
            <div key={s.label} style={{background:SURF,border:`1px solid ${BORD}`,borderRadius:10,padding:'12px 16px'}}>
              <div style={{fontSize:22,fontFamily:"'Instrument Serif',serif",color:s.color}}>{s.val}</div>
              <div style={{fontSize:11,color:MUTED,marginTop:3}}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{display:'flex',gap:10,marginBottom:18}}>
          <Btn variant="ghost" size="sm" onClick={() => nav('library_manager', { projectId })}>📚 Könyvtár kezelése</Btn>
        </div>

        {/* Tanácsadók a projektben */}
        <div style={{background:SURF,border:`1px solid ${BORD}`,borderRadius:14,padding:'18px 22px',marginBottom:22,boxShadow:'0 1px 3px rgba(0,0,0,.3)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <div style={{fontSize:13,color:GOLD,fontWeight:700}}>Tanácsadók a projektben</div>
            <Badge color={MUTED}>{collabs.length} fő</Badge>
          </div>
          <div style={{display:'flex',gap:8,marginBottom:10}}>
            <div style={{flex:1}}><input value={collabEmail} onChange={e=>setCollabEmail(e.target.value)} placeholder="kollega@ceg.hu"
              style={{width:'100%',background:SURF,border:`1px solid ${BORD}`,borderRadius:10,padding:'9px 14px',fontSize:13,color:TEXT,fontFamily:"'DM Sans',sans-serif",outline:'none',boxSizing:'border-box'}}/></div>
            <select value={collabPerm} onChange={e=>setCollabPerm(e.target.value)}
              style={{background:SURF,border:`1px solid ${BORD}`,borderRadius:10,padding:'9px 14px',fontSize:12,color:TEXT,cursor:'pointer'}}>
              <option value="view">Olvasás</option>
              <option value="edit">Szerkesztés</option>
            </select>
            <Btn size="sm" onClick={addCollab} disabled={!collabEmail.trim()}>+ Tanácsadó meghívása</Btn>
          </div>
          {collabs.map(c => (
            <div key={c.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:`1px solid ${BORD}`}}>
              <div style={{flex:1,fontSize:13,color:TEXT}}>{c.email}</div>
              <Badge color={c.permission==='edit'?GOLD:BLUE}>{c.permission==='edit'?'Szerkesztés':'Olvasás'}</Badge>
              <button onClick={() => removeCollab(c.id)} style={{background:'none',border:'none',color:RED,cursor:'pointer',fontSize:14,padding:4}}>✕</button>
            </div>
          ))}
          {collabs.length === 0 && <div style={{fontSize:12,color:MUTED,textAlign:'center',padding:'8px 0'}}>Hívj meg egy tanácsadó kollégát a projekthez.</div>}
        </div>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <div style={{fontSize:12,color:MUTED,textTransform:'uppercase',letterSpacing:'.08em'}}>Résztvevők</div>
          <Btn variant="ghost" size="sm" onClick={() => setAddingP(!addingP)}>+ Résztvevő</Btn>
        </div>

        {addingP && (
          <Card style={{marginBottom:12}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
              <Input label="Keresztnév" value={fn} onChange={setFn} placeholder="Péter"/>
              <Input label="Vezetéknév" value={ln} onChange={setLn} placeholder="Nagy"/>
              <Input label="Email"      value={em} onChange={setEm} placeholder="email@ceg.hu"/>
            </div>
            <div style={{display:'flex',gap:8}}>
              <Btn onClick={addPart} disabled={!fn.trim()}>Hozzáadás</Btn>
              <Btn variant="ghost" onClick={() => setAddingP(false)}>Mégse</Btn>
            </div>
          </Card>
        )}

        {parts.length === 0 && !addingP && (
          <Card style={{textAlign:'center',padding:28,color:MUTED}}>Adj hozzá résztvevőket a projekt indításához.</Card>
        )}

        {parts.map(part => {
          const pr = raters.filter(r => r.participantId === part.id);
          const pd = pr.filter(r => r.status === 'done').length;
          return (
            <Card key={part.id} style={{marginBottom:10}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8,gap:12}}>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:14,color:TEXT,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{part.firstName} {part.lastName}</div>
                  {part.email && <div style={{fontSize:12,color:MUTED}}>{part.email}</div>}
                </div>
                <div style={{display:'flex',gap:8,alignItems:'center',flexShrink:0}}>
                  <span style={{fontSize:12,color:MUTED}}>{pd}/{pr.length} kész</span>
                  <Btn variant="ghost" size="sm" onClick={() => nav('raters', {projectId, participantId:part.id})}>Értékelők</Btn>
                  {pd >= 1 && <Btn size="sm" onClick={() => nav('report', {projectId, participantId:part.id})}>Riport →</Btn>}
                  <button onClick={() => setDeletingPartId(part.id)} style={{background:'none',border:'none',color:DIM,cursor:'pointer',fontSize:14,padding:4}} title="Résztvevő törlése">✕</button>
                </div>
              </div>
              {pr.length > 0 && (
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {pr.map(r => {
                    const ri = (proj.roles||DEFAULT_ROLES).find(d => d.id === r.role) || DEFAULT_ROLES[0];
                    return (
                      <div key={r.id} style={{display:'flex',alignItems:'center',gap:5,background:S2,borderRadius:20,padding:'3px 10px',border:`1px solid ${BORD}`}}>
                        <span style={{width:6,height:6,borderRadius:'50%',background:ri.color||MUTED,flexShrink:0}}/>
                        <span style={{fontSize:11,color:TEXT}}>{r.firstName}</span>
                        <StatusDot status={r.status}/>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {showDeleteProj && (
        <ConfirmModal
          title="Projekt törlése"
          message={'A projekt és az összes résztvevő, értékelő és válasz törlésre kerül. Ez a művelet nem vonható vissza.'}
          confirmLabel="Igen, törlés"
          onConfirm={deleteProject}
          onCancel={() => setShowDeleteProj(false)}
        />
      )}

      {deletingPartId && (
        <ConfirmModal
          title="Résztvevő törlése"
          message="A résztvevő és az összes hozzá tartozó értékelő törlésre kerül. Ez a művelet nem vonható vissza."
          confirmLabel="Igen, törlés"
          onConfirm={() => deletePart(deletingPartId)}
          onCancel={() => setDeletingPartId(null)}
        />
      )}

      {editingProj && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.25)',backdropFilter:'blur(4px)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:SURF,border:`1px solid ${BORD}`,borderRadius:18,padding:30,width:'100%',maxWidth:420,boxShadow:'0 8px 30px rgba(0,0,0,.5)'}}>
            <div style={{fontFamily:"'Instrument Serif',serif",fontSize:20,color:TEXT,marginBottom:18}}>Projekt szerkesztése</div>
            <Input label="Projekt neve" value={editName} onChange={setEditName} placeholder="Projekt neve"/>
            <Input label="Ügyfél / Szervezet" value={editClient} onChange={setEditClient} placeholder="Ügyfél neve"/>
            <div style={{display:'flex',gap:10,marginTop:8}}>
              <Btn onClick={saveEdit} disabled={!editName.trim()}>Mentés</Btn>
              <Btn variant="ghost" onClick={() => setEditingProj(false)}>Mégse</Btn>
            </div>
          </div>
        </div>
      )}

      {showArchiveConfirm && (
        <ConfirmModal
          title={proj.status === 'archived' ? 'Projekt visszaállítása' : 'Projekt archiválása'}
          message={proj.status === 'archived'
            ? 'A projekt visszakerül az aktív projektek közé. Folytatod?'
            : 'Az archivált projekt nem módosítható, de az adatok megmaradnak. Folytatod?'}
          confirmLabel={proj.status === 'archived' ? 'Visszaállítás' : 'Archiválás'}
          onConfirm={archiveProject}
          onCancel={() => setShowArchiveConfirm(false)}
        />
      )}
    </div>
  );
}

// ─── RATERS VIEW ───────────────────────────────────────────────
function RatersView({ nav, goBack, ctx }) {
  const projectId     = ctx.projectId;
  const participantId = ctx.participantId;
  const [proj,    setProj]    = useState(null);
  const [part,    setPart]    = useState(null);
  const [raters,  setRaters]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [fn, setFn] = useState('');
  const [ln, setLn] = useState('');
  const [em, setEm] = useState('');
  const [role,   setRole]   = useState('peer');
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkError, setBulkError] = useState('');
  const bulkRef = useRef(null);
  const [editingId,   setEditingId]   = useState(null);
  const [editFn,      setEditFn]      = useState('');
  const [editLn,      setEditLn]      = useState('');
  const [editEm,      setEditEm]      = useState('');
  const [editRole,    setEditRole]    = useState('peer');
  const [sendingId,   setSendingId]   = useState(null);

  const load = useCallback(async () => {
    const p  = await db.get(projectId);
    const pa = await db.get(participantId);
    setProj(p); setPart(pa);
    const ks = await db.list('rat:');
    const rs = await Promise.all(ks.map(k => db.get(k)));
    setRaters(rs.filter(r => r && r.participantId === participantId));
    setLoading(false);
  }, [projectId, participantId]);

  useEffect(() => { load(); }, [load]);

  async function add() {
    if (!fn.trim()) return;
    const id = 'rat:'+uid(10);
    await db.set(id, { id, participantId, projectId, firstName:fn.trim(), lastName:ln.trim(), email:em.trim(), role, code:uid(12), status:'pending' });
    setFn(''); setLn(''); setEm('');
    load();
  }

  function startEdit(r) {
    setEditingId(r.id);
    setEditFn(r.firstName || '');
    setEditLn(r.lastName  || '');
    setEditEm(r.email     || '');
    setEditRole(r.role    || 'peer');
  }

  async function saveEdit(r) {
    const updated = { ...r, firstName:editFn.trim(), lastName:editLn.trim(), email:editEm.trim(), role:editRole };
    await db.set(r.id, updated);
    setEditingId(null);
    load();
  }

  function cancelEdit() { setEditingId(null); }

  async function rem(id) { await db.del(id); load(); }

  async function sendRaterEmail(r, isReminder = false) {
    if (!r.email) return;
    setSendingId(r.id);
    try {
      const raterName     = r.firstName + (r.lastName ? ' ' + r.lastName : '');
      const participantName = part ? part.firstName + ' ' + part.lastName : '';
      const surveyTitle   = proj?.name || 'LEDGE 360° értékelés';
      const baseUrl       = window.location.origin;
      const appPath       = window.location.pathname.replace(/\/$/, '') || '';
      const surveyUrl     = `${baseUrl}${appPath}?code=${r.code}`;
      const subject       = isReminder
        ? `Emlékeztető: ${surveyTitle} — kérjük, töltsd ki`
        : `${surveyTitle} — kérjük, töltsd ki`;
      const bodyText      = isReminder
        ? `Kedves ${raterName}!\n\nEmlékeztetünk, hogy még nem töltötted ki a(z) ${participantName} értékeléséhez kapcsolódó kérdőívet.\n\nAzonosítód: ${r.code}\nLink: ${surveyUrl}\n\nKöszönjük!\nLEDGE 360°`
        : `Kedves ${raterName}!\n\nMeghívást kaptál, hogy értékeld ${participantName} vezető kollégádat egy 360 fokos értékelésben.\n\nAzonosítód: ${r.code}\nLink: ${surveyUrl}\n\nA kitöltés kb. 5-10 percet vesz igénybe.\n\nKöszönjük!\nLEDGE 360°`;
      const resp = await fetch('/api/send-360-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: r.email, subject, bodyText }),
      });
      if (resp.ok) {
        const now = Date.now();
        const updated = isReminder
          ? { ...r, lastReminderSent: now }
          : { ...r, emailSent: true, emailSentAt: now };
        await db.set(r.id, updated);
        load();
      } else {
        const err = await resp.json().catch(() => ({}));
        alert('Email küldési hiba: ' + (err.error || resp.status));
      }
    } catch (e) {
      alert('Email küldési hiba: ' + e.message);
    }
    setSendingId(null);
  }

  async function handleBulkImport(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setBulkImporting(true); setBulkError('');
    try {
      const isXlsx = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
      let rows = [];

      if (isXlsx) {
        // Handle Excel files via SheetJS
        const buffer = await new Promise((res, rej) => {
          const r = new FileReader();
          r.onload = () => res(r.result);
          r.onerror = () => rej(new Error('Fájl olvasási hiba'));
          r.readAsArrayBuffer(file);
        });
        
        
        const wb = XLSX.read(buffer, { type:'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const sheetRows = XLSX.utils.sheet_to_json(ws, { header:1 });
        if (sheetRows.length < 1) { setBulkError('Üres fájl.'); setBulkImporting(false); if (bulkRef.current) bulkRef.current.value=''; return; }
        // Detect header
        const firstRow = (sheetRows[0] || []).map(c => String(c||'').toLowerCase());
        const startIdx = (firstRow.some(c => c.includes('név') || c.includes('name') || c.includes('email') || c.includes('szerep'))) ? 1 : 0;
        rows = sheetRows.slice(startIdx).map(r => r.map(c => String(c||'').trim()));
      } else {
        // Handle CSV/TSV
        const text = await file.text();
        const sep = text.includes('\t') ? '\t' : text.includes(';') ? ';' : ',';
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        const first = lines[0].toLowerCase();
        const startIdx = (first.includes('név') || first.includes('name') || first.includes('email') || first.includes('szerep')) ? 1 : 0;
        rows = lines.slice(startIdx).map(l => l.split(sep).map(c => c.trim().replace(/^["']|["']$/g, '')));
      }

      let count = 0;
      for (const cols of rows) {
        if (cols.length < 1 || !cols[0]) continue;
        // Expected: Keresztnév ; Vezetéknév ; Email ; Szerep
        const firstName = cols[0] || '';
        const lastName  = cols[1] || '';
        const email     = cols[2] || '';
        const rRole     = (cols[3] || 'peer').toLowerCase();
        const validRole = DEFAULT_ROLES.find(r => r.id === rRole || r.label.toLowerCase() === rRole);
        if (!firstName) continue;
        const id = 'rat:'+uid(10);
        await db.set(id, { id, participantId, projectId, firstName, lastName, email, role: validRole ? validRole.id : 'peer', code:uid(12), status:'pending' });
        count++;
      }
      setBulkImporting(false);
      if (count === 0) { setBulkError('Nem találtam importálható sort. Formátum: Keresztnév;Vezetéknév;Email;Szerep'); }
      else { setBulkError(''); }
      load();
    } catch(err) {
      setBulkError('Hiba az importálás során: '+err.message);
      setBulkImporting(false);
    }
    if (bulkRef.current) bulkRef.current.value = '';
  }

  if (loading) return <div style={{padding:40,color:MUTED,textAlign:'center',background:BG,minHeight:'100vh'}}>Betöltés...</div>;

  const roles = (proj && proj.roles) || DEFAULT_ROLES;

  return (
    <div style={{background:BG,minHeight:'100vh'}}>
      <TopBar title={(part ? part.firstName+' '+part.lastName : '') + ' — értékelők'} back onBack={goBack}/>
      <div style={{maxWidth:680,margin:'0 auto',padding:'22px 24px'}}>
        <Card style={{marginBottom:18}}>
          <div style={{fontSize:13,color:GOLD,fontWeight:600,marginBottom:12}}>Értékelő hozzáadása</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <Input label="Keresztnév" value={fn} onChange={setFn} placeholder="Péter"/>
            <Input label="Vezetéknév" value={ln} onChange={setLn} placeholder="Nagy"/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <Input label="Email" value={em} onChange={setEm} placeholder="email@ceg.hu"/>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,color:MUTED,marginBottom:5,textTransform:'uppercase',letterSpacing:'.08em'}}>Szerep</div>
              <select value={role} onChange={e => setRole(e.target.value)}
                style={{width:'100%',background:S2,border:`1px solid ${BORD}`,borderRadius:8,padding:'10px 14px',color:TEXT,fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:'none',boxSizing:'border-box'}}>
                {roles.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </div>
          </div>
          <Btn onClick={add} disabled={!fn.trim()}>+ Azonosító generálása</Btn>
          <div style={{display:'flex',gap:8,alignItems:'center',marginTop:10,paddingTop:10,borderTop:`1px solid ${BORD}`}}>
            <Btn variant="ghost" size="sm" onClick={() => bulkRef.current && bulkRef.current.click()} disabled={bulkImporting}>
              {bulkImporting ? 'Importálás...' : '⬆ Bulk import (CSV/Excel)'}
            </Btn>
            <input ref={bulkRef} type="file" accept=".csv,.tsv,.xlsx,.xls,.txt" onChange={handleBulkImport} style={{display:'none'}}/>
            <span style={{fontSize:11,color:MUTED}}>Keresztnév;Vezetéknév;Email;Szerep</span>
          </div>
          {bulkError && <div style={{fontSize:12,color:RED,marginTop:6}}>{bulkError}</div>}
        </Card>

        {raters.length === 0 && (
          <div style={{textAlign:'center',padding:'24px 0',color:MUTED,fontSize:14}}>Még nincs értékelő hozzáadva.</div>
        )}

        {raters.map(r => {
          const ri = roles.find(d => d.id === r.role) || roles[0];
          const isEditing = editingId === r.id;
          if (isEditing) {
            return (
              <div key={r.id} style={{background:SURF,border:`1.5px solid ${GOLD}`,borderRadius:12,padding:'14px 16px',marginBottom:10}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                  <Input label="Keresztnév" value={editFn} onChange={setEditFn} placeholder="Péter"/>
                  <Input label="Vezetéknév" value={editLn} onChange={setEditLn} placeholder="Nagy"/>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
                  <Input label="Email" value={editEm} onChange={setEditEm} placeholder="email@ceg.hu"/>
                  <div>
                    <div style={{fontSize:11,color:MUTED,marginBottom:5,textTransform:'uppercase',letterSpacing:'.08em'}}>Szerep</div>
                    <select value={editRole} onChange={e => setEditRole(e.target.value)}
                      style={{width:'100%',background:S2,border:`1px solid ${BORD}`,borderRadius:8,padding:'10px 14px',color:TEXT,fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:'none',boxSizing:'border-box'}}>
                      {roles.map(ro => <option key={ro.id} value={ro.id}>{ro.label}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <Btn size="sm" onClick={() => saveEdit(r)} disabled={!editFn.trim()}>✓ Mentés</Btn>
                  <Btn size="sm" variant="ghost" onClick={cancelEdit}>Mégse</Btn>
                </div>
              </div>
            );
          }
          const isSending = sendingId === r.id;
          const sentTs = r.emailSentAt ? new Date(r.emailSentAt) : null;
          const reminderTs = r.lastReminderSent ? new Date(r.lastReminderSent) : null;
          const fmtDate = (d) => d ? `${d.getMonth()+1 < 10 ? '0'+(d.getMonth()+1) : d.getMonth()+1}. ${d.getDate()}. ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}` : '';
          return (
            <div key={r.id} style={{background:SURF,border:`1px solid ${BORD}`,borderRadius:12,padding:'12px 16px',marginBottom:10,display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
              <div style={{flex:1,minWidth:180}}>
                <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                  <span style={{fontSize:14,color:TEXT,fontWeight:500}}>{r.firstName} {r.lastName}</span>
                  <Badge color={ri.color||MUTED}>{ri.label}</Badge>
                </div>
                {r.email ? (
                  <div style={{display:'flex',alignItems:'center',gap:6,marginTop:3,flexWrap:'wrap'}}>
                    <span style={{fontSize:12,color:MUTED}}>{r.email}</span>
                    {r.emailSent
                      ? <span style={{fontSize:11,color:GREEN}}>✉✓ elküldve{sentTs ? ` · ${fmtDate(sentTs)}` : ''}</span>
                      : <span style={{fontSize:11,color:MUTED}}>✉ nem elküldve</span>
                    }
                    {reminderTs && <span style={{fontSize:11,color:MUTED}}>· emlékeztető: {fmtDate(reminderTs)}</span>}
                  </div>
                ) : (
                  <div style={{fontSize:12,color:ORAN,marginTop:2,fontStyle:'italic'}}>Nincs email cím — szerkesztéssel adható hozzá</div>
                )}
              </div>
              <div style={{textAlign:'center',flexShrink:0}}>
                <CopyCode code={r.code}/>
              </div>
              <StatusDot status={r.status}/>
              {r.email && (
                r.emailSent
                  ? <button
                      onClick={() => sendRaterEmail(r, true)}
                      disabled={isSending}
                      style={{background:'none',border:`1px solid ${BORD}`,borderRadius:6,color:MUTED,cursor:'pointer',fontSize:12,padding:'4px 8px',flexShrink:0,transition:'all .15s',opacity:isSending?0.5:1}}
                      onMouseEnter={e => { e.currentTarget.style.borderColor=BLUE; e.currentTarget.style.color=BLUE; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor=BORD; e.currentTarget.style.color=MUTED; }}
                    >{isSending ? '...' : '↺ Emlékeztető'}</button>
                  : <button
                      onClick={() => sendRaterEmail(r, false)}
                      disabled={isSending}
                      style={{background:GOLD,border:'none',borderRadius:6,color:'#fff',cursor:'pointer',fontSize:12,padding:'5px 10px',flexShrink:0,fontWeight:600,opacity:isSending?0.5:1}}
                    >{isSending ? 'Küldés...' : '✉ Meghívó küldése'}</button>
              )}
              <button
                onClick={() => startEdit(r)}
                title="Szerkesztés"
                style={{background:'none',border:`1px solid ${BORD}`,borderRadius:6,color:MUTED,cursor:'pointer',fontSize:13,padding:'4px 8px',flexShrink:0,lineHeight:1,transition:'all .15s'}}
                onMouseEnter={e => { e.currentTarget.style.borderColor=GOLD; e.currentTarget.style.color=GOLD; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=BORD; e.currentTarget.style.color=MUTED; }}
              >✎</button>
              <button onClick={() => rem(r.id)} style={{background:'none',border:'none',color:DIM,cursor:'pointer',fontSize:16,padding:4,flexShrink:0}}>✕</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── REPORT PAGE VIEW ──────────────────────────────────────────
function ReportPageView({ nav, goBack, ctx }) {
  const projectId     = ctx.projectId;
  const participantId = ctx.participantId;
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const proj = await db.get(projectId);
      const part = await db.get(participantId);
      const rks  = await db.list('rat:');
      const rats = await Promise.all(rks.map(k => db.get(k)));
      const pr   = rats.filter(r => r && r.participantId === participantId);
      const selfR  = pr.find(r => r.role === 'self');
      const otherR = pr.filter(r => r.role !== 'self' && r.status === 'done');
      const selfResp = selfR ? await db.get('resp:'+selfR.code) : null;
      const otherResps = await Promise.all(otherR.map(r => db.get('resp:'+r.code)));
      const preset = resolvePreset(proj ? proj.libraryId : null, proj ? proj.customDims : null);
      const roleGroups = {};
      otherR.forEach((r, i) => {
        const k = r.role;
        if (!roleGroups[k]) {
          const ri = DEFAULT_ROLES.find(d => d.id === k);
          roleGroups[k] = { id:k, name:ri?ri.label:k, emoji:'👤', color:ri?ri.color:MUTED, scores:[] };
        }
        if (otherResps[i]) roleGroups[k].scores.push(otherResps[i].scores || {});
      });
      // Collect comments from all rater responses
      const allResps = [selfResp, ...otherResps].filter(Boolean);
      const collectedComments = allResps.filter(r => r.comment).map(r => ({
        text: r.comment,
        groupName: r.raterCode === (selfR && selfR.code) ? 'Önértékelés' : 'Értékelő',
        emoji: r.raterCode === (selfR && selfR.code) ? '🪞' : '👤',
        color: r.raterCode === (selfR && selfR.code) ? GOLD : BLUE,
        timestamp: r.timestamp,
      }));
      setData({ proj, part, preset, selfScores:selfResp?selfResp.scores:{}, groups:Object.values(roleGroups), raters:pr, comments:collectedComments });
      setLoading(false);
    })();
  }, [projectId, participantId]);

  if (loading) return <div style={{padding:40,color:MUTED,textAlign:'center',background:BG,minHeight:'100vh'}}>Betöltés...</div>;
  if (!data)   return <div style={{padding:40,color:MUTED,background:BG,minHeight:'100vh'}}>Nincs adat.</div>;

  const { proj, part, preset, selfScores, groups, raters, comments } = data;
  const totalDone = raters.filter(r => r.status === 'done').length;

  return (
    <div style={{background:BG,minHeight:'100vh'}}>
      <TopBar
        title={(part?part.firstName+' '+part.lastName:'') + ' — riport'}
        subtitle={proj?proj.name:''}
        back onBack={goBack}
      />
      <div style={{maxWidth:960,margin:'0 auto',padding:'22px 24px'}}>
        <div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'center',marginBottom:18}}>
          <Badge color={GOLD}>{preset.name}</Badge>
          <Badge color={BLUE}>{totalDone}/{raters.length} beküldött</Badge>
          {groups.length === 0 && <span style={{fontSize:13,color:ORAN}}>⚠ Még nincs peer visszajelzés</span>}
        </div>
        <ReportView dims={preset.dims} selfScores={selfScores} groups={groups} comments={comments} scaleMax={getScaleMax((data.proj && data.proj.scaleId) || '5pt')}/>
      </div>
    </div>
  );
}

// ─── SHARE MODAL ──────────────────────────────────────────────
function ShareModal({ onClose, libraryId, dims, customName }) {
  const [code, setCode] = useState('');
  const [importing, setImporting] = useState(false);
  const [importCode, setImportCode] = useState('');
  const [importErr, setImportErr] = useState('');

  useEffect(() => {
    if (!libraryId) return;
    (async () => {
      const shareId = 'share_' + uid(8);
      const shareData = { libraryId, dims, customName: customName || null, created: Date.now() };
      await db.set('share:' + shareId, shareData);
      setCode(shareId);
    })();
  }, [libraryId, dims, customName]);

  async function handleImport() {
    const t = importCode.trim();
    if (t.length < 4) { setImportErr('Túl rövid kód.'); return; }
    setImporting(true); setImportErr('');
    const data = await db.get('share:' + t);
    if (!data) { setImportErr('Érvénytelen megosztási kód.'); setImporting(false); return; }
    onClose(data);
  }

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.25)',backdropFilter:'blur(4px)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:SURF,border:`1px solid ${BORD}`,borderRadius:18,padding:30,boxShadow:'0 8px 30px rgba(0,0,0,.5)',width:'100%',maxWidth:420}}>
        <div style={{fontFamily:"'Instrument Serif',serif",fontSize:20,color:TEXT,marginBottom:18}}>🔗 Megosztás</div>
        {code ? (
          <div style={{marginBottom:24}}>
            <div style={{fontSize:12,color:MUTED,marginBottom:8}}>Megosztási kód:</div>
            <div style={{display:'flex',justifyContent:'center'}}><CopyCode code={code} size="lg"/></div>
            <div style={{fontSize:12,color:MUTED,marginTop:10,lineHeight:1.5}}>
              Küldd el ezt a kódot annak, akinek át szeretnéd adni a kérdőív sablonját. A másik fél a Sablon választás képernyőn tudja beolvasni.
            </div>
          </div>
        ) : (
          <div style={{color:MUTED,padding:16,textAlign:'center'}}>Kód generálása...</div>
        )}
        <div style={{borderTop:`1px solid ${BORD}`,paddingTop:18,marginTop:8}}>
          <div style={{fontSize:13,color:TEXT,fontWeight:600,marginBottom:10}}>Sablon importálás kóddal</div>
          <div style={{display:'flex',gap:8}}>
            <input value={importCode} onChange={e => setImportCode(e.target.value.trim())}
              placeholder="Beillesztés..."
              style={{flex:1,background:S3,border:`1px solid ${importErr?RED:BORD}`,borderRadius:8,padding:'8px 12px',color:TEXT,fontSize:14,fontFamily:'monospace',outline:'none',boxSizing:'border-box'}}/>
            <Btn size="sm" onClick={handleImport} disabled={importing || !importCode.trim()}>Betöltés</Btn>
          </div>
          {importErr && <div style={{fontSize:12,color:RED,marginTop:4}}>{importErr}</div>}
        </div>
        <div style={{marginTop:18}}><Btn variant="ghost" onClick={() => onClose(null)}>Bezárás</Btn></div>
      </div>
    </div>
  );
}

// ─── AI BUILDER VIEW ──────────────────────────────────────────
function AIBuilderView({ nav, goBack, ctx }) {
  const [messages, setMessages] = useState([
    { role:'assistant', content:'Üdv! Segítek megtervezni az egyedi kérdőívedet. Milyen területen szeretnéd értékelni a vezetőt? Írd le röviden a kontextust (iparág, pozíció, cél) — és összeállítok egy kompetencia-struktúrát.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = { role:'user', content:input.trim() };
    setInput('');
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const apiMessages = [...messages.filter(m => m.role !== 'system'), userMsg].map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    }));

    try {
      const resp = await fetch('/api/messages', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          model:'claude-sonnet-4-20250514',
          max_tokens:2000,
          system: `Te egy vezetői kompetencia kérdőív tervező AI vagy. A felhasználóval közösen tervezel egyedi 360 fokos értékelési kérdőívet.
A kimeneti formátum JSON kell legyen, ha a felhasználó véglegesíteni akarja a kérdőívet. Ebben az esetben KIZÁRÓLAG ilyen JSON-t adj vissza, semmi mást:
{"type":"questionnaire","name":"...","dims":[{"id":"XX","name":"...","label":"...","color":"#hexcolor","items":[{"id":"XX1","text":"..."}]}]}
Addig amíg nem véglegesítés a cél, beszélgess természetesen magyarul és segíts finomítani a kérdőívet. 4-8 dimenzió, dimenziónként 3-5 item az ideális.`,
          messages: apiMessages,
        }),
      });
      const data = await resp.json();
      const text = (data.content || []).map(c => c.text || '').join('');

      // Try to detect JSON questionnaire
      try {
        const jsonMatch = text.match(/\{[\s\S]*"type"\s*:\s*"questionnaire"[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.dims && parsed.dims.length > 0) {
            setGenerated(parsed);
            setMessages(prev => [...prev, { role:'assistant', content:'✅ Kérdőív összeállítva! Nézd meg az előnézetet alul, és ha tetszik, mentsd el.' }]);
            setLoading(false);
            return;
          }
        }
      } catch(e) {}

      setMessages(prev => [...prev, { role:'assistant', content: text }]);
    } catch(e) {
      setMessages(prev => [...prev, { role:'assistant', content:'⚠ Hiba történt a kommunikáció során. Próbáld újra.' }]);
    }
    setLoading(false);
  }

  const [savedMsg, setSavedMsg] = useState(false);
  const projectId = ctx.projectId;

  function getColoredDims() {
    if (!generated) return [];
    return generated.dims.map((d, i) => ({
      ...d,
      color: d.color || [GOLD, BLUE, PURP, ORAN, GREEN, RED, '#D4AA78', '#7AAED0'][i % 8],
    }));
  }

  function handleUse() {
    if (!generated) return;
    const dims = getColoredDims();
    const customId = 'custom_' + uid(8);
    nav('survey', {
      mode:'self', libraryId:customId, dims,
      surveyTitle:'Önértékelés — '+(generated.name||'Egyedi kérdőív'),
      customName: generated.name || 'Egyedi kérdőív',
    });
  }

  async function handleSaveTemplate() {
    if (!generated) return;
    const dims = getColoredDims();
    const name = generated.name || 'AI kérdőív';
    // Save as reusable template
    await saveCustomTemplate(name, dims);
    // Also save to project if we're in project context
    if (projectId) {
      const proj = await db.get(projectId);
      if (proj) {
        const customLibId = 'custom_proj_' + proj.id;
        await db.set('lib:' + customLibId, { dims });
        await db.set(projectId, { ...proj, libraryId: customLibId, customDims: dims });
      }
    }
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  }

  async function handleSaveToProject() {
    if (!generated || !projectId) return;
    const dims = getColoredDims();
    const proj = await db.get(projectId);
    if (proj) {
      const customLibId = 'custom_proj_' + proj.id;
      await db.set('lib:' + customLibId, { dims });
      await db.set(projectId, { ...proj, libraryId: customLibId, customDims: dims });
    }
    nav('project', { projectId });
  }

  function handleEditInManager() {
    if (!generated) return;
    const dims = getColoredDims();
    nav('library_manager', { importedDims: dims, importedName: generated.name || 'AI kérdőív', projectId: projectId || null });
  }

  return (
    <div style={{background:BG,minHeight:'100vh',display:'flex',flexDirection:'column'}}>
      <TopBar title="✦ AI Kérdőív-tervező" subtitle="Egyedi kompetencia kérdőív készítése" back onBack={goBack}/>
      <div ref={scrollRef} style={{flex:1,overflow:'auto',padding:'16px 24px',maxWidth:700,margin:'0 auto',width:'100%',boxSizing:'border-box'}}>
        {messages.map((m, i) => (
          <div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start',marginBottom:12}}>
            <div style={{
              maxWidth:'80%',padding:'12px 16px',borderRadius:14,fontSize:14,lineHeight:1.6,
              background:m.role==='user'?`${GOLD}22`:S2,
              border:`1px solid ${m.role==='user'?GDIM:BORD}`,
              color:TEXT,whiteSpace:'pre-wrap',
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{display:'flex',justifyContent:'flex-start',marginBottom:12}}>
            <div style={{background:S2,border:`1px solid ${BORD}`,borderRadius:14,padding:'12px 16px',fontSize:14,color:MUTED}}>
              Gondolkodom...
            </div>
          </div>
        )}
        {generated && (
          <div style={{background:SURF,border:`1px solid ${GDIM}`,borderRadius:14,padding:20,marginTop:8}}>
            <div style={{fontSize:15,color:GOLD,fontWeight:600,marginBottom:10}}>📋 {generated.name || 'Egyedi kérdőív'}</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:14}}>
              {generated.dims.map(d => <Badge key={d.id} color={d.color||GOLD}>{d.id} — {d.name} ({d.items.length})</Badge>)}
            </div>
            <div style={{fontSize:12,color:MUTED,marginBottom:14}}>
              {generated.dims.length} dimenzió · {generated.dims.reduce((s,d)=>s+d.items.length,0)} item
            </div>
            <div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'center'}}>
              <Btn onClick={handleSaveTemplate}>💾 Mentés sablonként</Btn>
              {projectId && <Btn onClick={handleSaveToProject}>📁 Mentés projektre</Btn>}
              <Btn variant="ghost" onClick={handleEditInManager}>✎ Szerkesztés tovább</Btn>
              {!projectId && <Btn variant="outline_gold" onClick={handleUse}>Kipróbálom →</Btn>}
              {savedMsg && <span style={{fontSize:12,color:GREEN}}>✓ Mentve</span>}
            </div>
          </div>
        )}
      </div>
      <div style={{borderTop:`1px solid ${BORD}`,padding:'12px 24px',background:SURF}}>
        <div style={{maxWidth:700,margin:'0 auto',display:'flex',gap:10}}>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Írd le, milyen kérdőívet szeretnél..."
            style={{flex:1,background:S2,border:`1px solid ${BORD}`,borderRadius:10,padding:'12px 16px',color:TEXT,fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:'none',boxSizing:'border-box'}}/>
          <Btn onClick={send} disabled={loading || !input.trim()}>Küldés</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── LIBRARY MANAGER VIEW ─────────────────────────────────────
function LibraryManagerView({ nav, goBack, ctx }) {
  const projectId = ctx.projectId;
  const sourcePresetId = ctx.sourcePresetId; // from SelfPickView
  const editTemplateId = ctx.editTemplateId; // editing existing template
  const importedDims = ctx.importedDims;     // from AI Builder
  const importedName = ctx.importedName;     // from AI Builder
  const [proj, setProj] = useState(null);
  const [dims, setDims] = useState(null);
  const [templateName, setTemplateName] = useState(importedName || '');
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState(null);
  const [editVal, setEditVal] = useState('');
  const [newDimName, setNewDimName] = useState('');
  const [newDimLabel, setNewDimLabel] = useState('');
  const [newItemTexts, setNewItemTexts] = useState({});
  const [dragDim, setDragDim] = useState(null);
  const [dragOverDim, setDragOverDim] = useState(null);
  const [dragItem, setDragItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  const [importErr, setImportErr] = useState('');
  const [saved, setSaved] = useState(false);
  const [savedAsTemplate, setSavedAsTemplate] = useState(false);
  const [colorPickerDim, setColorPickerDim] = useState(null);
  const fileRef = useRef(null);

  const DIM_COLORS = [GOLD, BLUE, PURP, ORAN, GREEN, RED, '#D4AA78', '#7AAED0', '#B89BC9', '#C4685A'];

  useEffect(() => {
    (async () => {
      if (projectId) {
        const p = await db.get(projectId);
        setProj(p);
        if (p && p.customDims) {
          setDims(JSON.parse(JSON.stringify(p.customDims)));
        } else {
          const preset = getPreset(p ? p.libraryId : null);
          setDims(JSON.parse(JSON.stringify(preset.dims)));
        }
      } else if (editTemplateId) {
        const tpl = await db.get(editTemplateId);
        if (tpl) { setDims(JSON.parse(JSON.stringify(tpl.dims))); setTemplateName(tpl.name || ''); }
        else setDims([]);
      } else if (importedDims) {
        setDims(JSON.parse(JSON.stringify(importedDims)));
      } else if (sourcePresetId) {
        const preset = getPreset(sourcePresetId);
        setDims(JSON.parse(JSON.stringify(preset.dims)));
      } else {
        setDims([]);
      }
      setLoading(false);
    })();
  }, [projectId, sourcePresetId, editTemplateId, importedDims]);

  async function persist(newDims) {
    setDims(newDims);
    if (proj && projectId) {
      const customLibId = 'custom_proj_' + proj.id;
      await db.set('lib:' + customLibId, { dims: newDims });
      await db.set(projectId, { ...proj, libraryId: customLibId, customDims: newDims });
    }
    setSaved(true); setTimeout(() => setSaved(false), 1500);
  }

  // ── Inline editing ──
  function startEdit(type, dimIdx, itemIdx, field, currentVal) {
    setEditingField({ type, dimIdx, itemIdx, field });
    setEditVal(currentVal);
  }
  function commitEdit() {
    if (!editingField || !dims) return;
    const { type, dimIdx, itemIdx, field } = editingField;
    const arr = dims.map((d, di) => {
      if (di !== dimIdx) return d;
      if (type === 'dim') return { ...d, [field]: editVal.trim() || d[field] };
      if (type === 'item') {
        const items = d.items.map((it, ii) => ii === itemIdx ? { ...it, [field]: editVal.trim() || it[field] } : it);
        return { ...d, items };
      }
      return d;
    });
    persist(arr);
    setEditingField(null);
  }

  // ── Dimension DnD ──
  function onDimDragStart(e, idx) { setDragDim(idx); e.dataTransfer.effectAllowed='move'; }
  function onDimDragOver(e, idx) { e.preventDefault(); setDragOverDim(idx); }
  function onDimDrop(e, idx) {
    e.preventDefault();
    if (dragDim === null || dragDim === idx) { setDragDim(null); setDragOverDim(null); return; }
    const arr = [...dims];
    const [moved] = arr.splice(dragDim, 1);
    arr.splice(idx, 0, moved);
    persist(arr);
    setDragDim(null); setDragOverDim(null);
  }
  function onDimDragEnd() { setDragDim(null); setDragOverDim(null); }

  // ── Item DnD (within same dimension) ──
  function onItemDragStart(e, dimIdx, itemIdx) {
    setDragItem({ dimIdx, itemIdx }); e.dataTransfer.effectAllowed='move'; e.stopPropagation();
  }
  function onItemDragOver(e, dimIdx, itemIdx) {
    e.preventDefault(); e.stopPropagation();
    if (dragItem && dragItem.dimIdx === dimIdx) setDragOverItem({ dimIdx, itemIdx });
  }
  function onItemDrop(e, dimIdx, itemIdx) {
    e.preventDefault(); e.stopPropagation();
    if (!dragItem || dragItem.dimIdx !== dimIdx || dragItem.itemIdx === itemIdx) { setDragItem(null); setDragOverItem(null); return; }
    const arr = [...dims];
    const dim = { ...arr[dimIdx] };
    const items = [...dim.items];
    const [moved] = items.splice(dragItem.itemIdx, 1);
    items.splice(itemIdx, 0, moved);
    dim.items = items;
    arr[dimIdx] = dim;
    persist(arr);
    setDragItem(null); setDragOverItem(null);
  }
  function onItemDragEnd() { setDragItem(null); setDragOverItem(null); }

  // ── Add / Remove ──
  function addDim() {
    if (!newDimName.trim()) return;
    const id = newDimName.trim().replace(/\s+/g,'').substring(0,3).toUpperCase();
    const color = DIM_COLORS[(dims||[]).length % DIM_COLORS.length];
    const nd = { id, name:newDimName.trim(), label:newDimLabel.trim()||newDimName.trim(), color, items:[] };
    persist([...(dims||[]), nd]);
    setNewDimName(''); setNewDimLabel('');
  }
  function removeDim(idx) {
    persist(dims.filter((_, i) => i !== idx));
  }
  function updateDimProp(idx, prop, value) {
    const arr = [...dims];
    arr[idx] = { ...arr[idx], [prop]: value };
    persist(arr);
  }
  function addItem(dimIdx) {
    const text = (newItemTexts[dimIdx] || '').trim();
    if (!text) return;
    const arr = [...dims];
    const dim = { ...arr[dimIdx] };
    const itemId = dim.id + (dim.items.length + 1);
    dim.items = [...dim.items, { id:itemId, text }];
    arr[dimIdx] = dim;
    persist(arr);
    setNewItemTexts(prev => ({ ...prev, [dimIdx]: '' }));
  }
  function removeItem(dimIdx, itemIdx) {
    const arr = [...dims];
    const dim = { ...arr[dimIdx] };
    dim.items = dim.items.filter((_, i) => i !== itemIdx);
    arr[dimIdx] = dim;
    persist(arr);
  }

  // ── CSV Export ──
  function exportCSV() {
    if (!dims) return;
    let csv = 'Kompetencia;Rövid kód;Label;Alkompetencia ID;Értékelendő mondat\n';
    dims.forEach(d => {
      if (d.items.length === 0) csv += `${d.name};${d.id};${d.label};;\n`;
      d.items.forEach(i => { csv += `${d.name};${d.id};${d.label};${i.id};${i.text}\n`; });
    });
    downloadFile('\uFEFF' + csv, 'kompetencia-sablon.csv', 'text/csv;charset=utf-8;');
  }

  // ── XLSX Export ──
  function exportXLSX() {
    if (!dims) return;
    try {
      
      
      const rows = [];
      dims.forEach(d => {
        if (d.items.length === 0) rows.push({ 'Kompetencia': d.name, 'Rövid kód': d.id, 'Label': d.label, 'Alkompetencia ID': '', 'Értékelendő mondat': '' });
        d.items.forEach(i => rows.push({ 'Kompetencia': d.name, 'Rövid kód': d.id, 'Label': d.label, 'Alkompetencia ID': i.id, 'Értékelendő mondat': i.text }));
      });
      const ws = XLSX.utils.json_to_sheet(rows);
      ws['!cols'] = [{ wch:25 },{ wch:10 },{ wch:30 },{ wch:15 },{ wch:60 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Kompetenciák');
      XLSX.writeFile(wb, 'kompetencia-sablon.xlsx');
    } catch(e) { exportCSV(); }
  }

  function downloadFile(content, name, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  }

  // ── Import (CSV or XLSX) ──
  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImportErr('');
    const reader = new FileReader();
    if (file.name.endsWith('.csv') || file.name.endsWith('.tsv')) {
      reader.onload = (ev) => { parseCSV(ev.target.result); };
      reader.readAsText(file, 'UTF-8');
    } else {
      reader.onload = (ev) => { parseXLSX(ev.target.result); };
      reader.readAsArrayBuffer(file);
    }
    if (fileRef.current) fileRef.current.value = '';
  }

  function parseCSV(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) { setImportErr('Üres fájl.'); return; }
    const sep = lines[0].includes(';') ? ';' : lines[0].includes('\t') ? '\t' : ',';
    const rows = lines.slice(1).map(l => l.split(sep));
    importRows(rows);
  }

  function parseXLSX(buffer) {
    try {
      
      
      const wb = XLSX.read(buffer, { type:'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header:1 });
      if (rows.length < 2) { setImportErr('Üres fájl.'); return; }
      importRows(rows.slice(1));
    } catch(e) { setImportErr('Hiba az Excel feldolgozásakor: ' + e.message); }
  }

  function importRows(rows) {
    // Expected columns: Kompetencia | Rövid kód | Label | Alkompetencia ID | Értékelendő mondat
    const dimMap = {};
    const dimOrder = [];
    rows.forEach(r => {
      const name = (r[0] || '').toString().trim();
      const id   = (r[1] || '').toString().trim();
      const label= (r[2] || '').toString().trim();
      const iid  = (r[3] || '').toString().trim();
      const text = (r[4] || '').toString().trim();
      if (!name) return;
      const key = id || name.replace(/\s+/g,'').substring(0,3).toUpperCase();
      if (!dimMap[key]) {
        dimMap[key] = { id:key, name, label:label||name, color:DIM_COLORS[dimOrder.length % DIM_COLORS.length], items:[] };
        dimOrder.push(key);
      }
      if (text) {
        dimMap[key].items.push({ id:iid || (key + (dimMap[key].items.length+1)), text });
      }
    });
    if (dimOrder.length === 0) { setImportErr('Nem találtam kompetenciákat a fájlban.'); return; }
    const imported = dimOrder.map(k => dimMap[k]);
    persist(imported);
    setImportErr('');
  }

  // ── Use this questionnaire (from SelfPickView) ──
  function handleUseForSurvey() {
    if (!dims || dims.length === 0) return;
    const customId = 'custom_' + uid(8);
    const totalItems = dims.reduce((s,d) => s + d.items.length, 0);
    nav('survey', {
      mode:'self', libraryId:customId, dims,
      surveyTitle:'Önértékelés — Egyedi kérdőív',
      customName:'Egyedi kérdőív (' + dims.length + ' dimenzió, ' + totalItems + ' item)',
    });
  }

  async function handleSaveAsTemplate() {
    if (!dims || dims.length === 0) return;
    const name = templateName.trim() || 'Egyedi sablon';
    if (editTemplateId) {
      // Update existing template
      const totalItems = dims.reduce((s,d) => s + d.items.length, 0);
      await db.set(editTemplateId, { id:editTemplateId, name, dims, itemCount:totalItems, dimCount:dims.length, created:Date.now() });
    } else {
      await saveCustomTemplate(name, dims);
    }
    setSavedAsTemplate(true);
    setTimeout(() => setSavedAsTemplate(false), 3000);
  }

  if (loading) return <div style={{padding:40,color:MUTED,textAlign:'center',background:BG,minHeight:'100vh'}}>Betöltés...</div>;
  if (!dims) return <div style={{padding:40,color:MUTED,textAlign:'center',background:BG,minHeight:'100vh'}}>Hiba.</div>;

  const totalItems = dims.reduce((s, d) => s + d.items.length, 0);
  const isEditing = (type, dimIdx, itemIdx, field) =>
    editingField && editingField.type===type && editingField.dimIdx===dimIdx && editingField.itemIdx===itemIdx && editingField.field===field;

  const GRIP = { cursor:'grab', fontSize:14, color:MUTED, padding:'2px 4px', userSelect:'none', touchAction:'none' };

  return (
    <div style={{background:BG,minHeight:'100vh'}}>
      <TopBar title="📋 Kérdőív szerkesztő" subtitle={proj ? proj.name : 'Egyedi sablon'} back onBack={goBack}/>
      <div style={{maxWidth:800,margin:'0 auto',padding:'22px 24px'}}>

        {/* Header stats + actions */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10,marginBottom:18}}>
          <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
            <Badge color={GOLD}>{dims.length} kompetencia</Badge>
            <Badge color={BLUE}>{totalItems} alkompetencia</Badge>
            {saved && <span style={{fontSize:12,color:GREEN}}>✓ Mentve</span>}
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            <Btn variant="ghost" size="sm" onClick={exportCSV}>⬇ CSV</Btn>
            <Btn variant="ghost" size="sm" onClick={exportXLSX}>⬇ Excel</Btn>
            <Btn variant="ghost" size="sm" onClick={() => fileRef.current && fileRef.current.click()}>⬆ Import</Btn>
            <input ref={fileRef} type="file" accept=".csv,.tsv,.xlsx,.xls" onChange={handleFileUpload} style={{display:'none'}}/>
          </div>
        </div>
        {importErr && <div style={{background:`${RED}18`,border:`1px solid ${RED}44`,borderRadius:8,padding:'8px 14px',marginBottom:14,fontSize:13,color:RED}}>{importErr}</div>}

        {/* Info box */}
        <div style={{background:S2,border:`1px solid ${BORD}`,borderRadius:10,padding:'12px 16px',marginBottom:20,fontSize:13,color:MUTED,lineHeight:1.6}}>
          <b style={{color:TEXT}}>Tipp:</b> Húzd az ☰ ikont a kompetenciák vagy alkompetenciák átrendezéséhez. Kattints bármelyik szövegre a szerkesztéshez. Az Excel/CSV sablont letöltheted, módosíthatod, és visszatöltheted.
        </div>

        {/* Dimension list with DnD */}
        {dims.map((d, di) => {
          const isDragOver = dragOverDim === di && dragDim !== null && dragDim !== di;
          return (
            <div key={d.id + '_' + di}
              draggable
              onDragStart={e => onDimDragStart(e, di)}
              onDragOver={e => onDimDragOver(e, di)}
              onDrop={e => onDimDrop(e, di)}
              onDragEnd={onDimDragEnd}
              style={{
                background:SURF,
                border:`1px solid ${isDragOver ? GOLD : BORD}`,
                borderRadius:12, marginBottom:10,
                opacity: dragDim === di ? 0.5 : 1,
                transition:'border-color .15s, opacity .15s',
              }}>
              {/* Dimension header */}
              <div style={{padding:'12px 16px',display:'flex',alignItems:'center',gap:10,background:S2,borderBottom:`1px solid ${BORD}`,position:'relative'}}>
                <span style={GRIP} title="Húzd az átrendezéshez">☰</span>
                <span onClick={() => setColorPickerDim(colorPickerDim === di ? null : di)}
                  style={{width:14,height:14,borderRadius:'50%',background:d.color,flexShrink:0,cursor:'pointer',border:`2px solid ${colorPickerDim===di?TEXT:d.color}`,transition:'border .15s'}} title="Szín módosítása"/>
                {colorPickerDim === di && (
                  <div style={{position:'absolute',top:42,left:40,zIndex:50,background:SURF,border:`1px solid ${BORD}`,borderRadius:10,padding:8,display:'flex',gap:6,flexWrap:'wrap',boxShadow:'0 4px 16px rgba(0,0,0,.1)',width:170}}>
                    {DIM_COLORS.map(c => (
                      <button key={c} onClick={() => { updateDimProp(di, 'color', c); setColorPickerDim(null); }}
                        style={{width:22,height:22,borderRadius:'50%',background:c,border:`2px solid ${d.color===c?TEXT:BORD}`,cursor:'pointer',transition:'border .15s',padding:0}}/>
                    ))}
                  </div>
                )}
                {isEditing('dim', di, undefined, 'name') ? (
                  <input value={editVal} onChange={e => setEditVal(e.target.value)} autoFocus
                    onBlur={commitEdit} onKeyDown={e => { if (e.key==='Enter') commitEdit(); if (e.key==='Escape') setEditingField(null); }}
                    style={{background:S3,border:`1px solid ${GOLD}`,borderRadius:6,padding:'3px 8px',color:TEXT,fontSize:14,fontWeight:600,fontFamily:"'DM Sans',sans-serif",outline:'none',flex:1,boxSizing:'border-box'}}/>
                ) : (
                  <span onClick={() => startEdit('dim', di, undefined, 'name', d.name)}
                    style={{fontSize:14,color:TEXT,fontWeight:600,flex:1,cursor:'text'}} title="Kattints a szerkesztéshez">
                    <span style={{color:d.color,fontSize:11,fontWeight:700,marginRight:8}}>{d.id}</span>
                    {d.name}
                    {d.label !== d.name && <span style={{color:MUTED,fontSize:12,marginLeft:8}}>({d.label})</span>}
                  </span>
                )}
                <span style={{fontSize:12,color:MUTED,flexShrink:0}}>{d.items.length}</span>
                <button onClick={() => removeDim(di)} style={{background:'none',border:'none',color:RED+'88',cursor:'pointer',fontSize:14,padding:4,flexShrink:0}} title="Kompetencia törlése">✕</button>
              </div>

              {/* Items with DnD */}
              <div style={{padding:'6px 16px 10px'}}>
                {d.items.map((item, ii) => {
                  const isItemDragOver = dragOverItem && dragOverItem.dimIdx === di && dragOverItem.itemIdx === ii && dragItem && dragItem.dimIdx === di && dragItem.itemIdx !== ii;
                  return (
                    <div key={item.id + '_' + ii}
                      draggable
                      onDragStart={e => onItemDragStart(e, di, ii)}
                      onDragOver={e => onItemDragOver(e, di, ii)}
                      onDrop={e => onItemDrop(e, di, ii)}
                      onDragEnd={onItemDragEnd}
                      style={{
                        display:'flex', alignItems:'flex-start', gap:8, padding:'7px 4px',
                        borderBottom: ii < d.items.length - 1 ? `1px solid ${BORD}` : 'none',
                        borderTop: isItemDragOver ? `2px solid ${GOLD}` : '2px solid transparent',
                        opacity: dragItem && dragItem.dimIdx === di && dragItem.itemIdx === ii ? 0.4 : 1,
                        transition:'opacity .15s',
                      }}>
                      <span style={{...GRIP, fontSize:11, marginTop:2}} title="Húzd az átrendezéshez">☰</span>
                      <span style={{fontSize:11,color:MUTED,flexShrink:0,marginTop:3,width:18,textAlign:'right'}}>{ii+1}.</span>
                      {isEditing('item', di, ii, 'text') ? (
                        <textarea value={editVal} onChange={e => setEditVal(e.target.value)} autoFocus rows={2}
                          onBlur={commitEdit} onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); commitEdit(); } if (e.key==='Escape') setEditingField(null); }}
                          style={{flex:1,background:S3,border:`1px solid ${GOLD}`,borderRadius:6,padding:'4px 8px',color:TEXT,fontSize:13,fontFamily:"'DM Sans',sans-serif",outline:'none',resize:'vertical',boxSizing:'border-box',lineHeight:1.5}}/>
                      ) : (
                        <span onClick={() => startEdit('item', di, ii, 'text', item.text)}
                          style={{fontSize:13,color:TEXT,lineHeight:1.5,flex:1,cursor:'text'}} title="Kattints a szerkesztéshez">
                          {item.text}
                        </span>
                      )}
                      <button onClick={() => removeItem(di, ii)} style={{background:'none',border:'none',color:RED+'66',cursor:'pointer',fontSize:11,padding:'2px 4px',flexShrink:0,marginTop:2}} title="Törlés">✕</button>
                    </div>
                  );
                })}

                {/* Add item inline */}
                <div style={{display:'flex',gap:8,marginTop:8,alignItems:'center'}}>
                  <span style={{width:18}}/>
                  <input value={newItemTexts[di] || ''} onChange={e => setNewItemTexts(prev => ({ ...prev, [di]: e.target.value }))}
                    onKeyDown={e => { if (e.key==='Enter') addItem(di); }}
                    placeholder="+ Új alkompetencia hozzáadása..."
                    style={{flex:1,background:S3,border:`1px solid ${BORD}`,borderRadius:6,padding:'7px 10px',color:TEXT,fontSize:13,fontFamily:"'DM Sans',sans-serif",outline:'none',boxSizing:'border-box'}}/>
                  <Btn size="sm" onClick={() => addItem(di)} disabled={!(newItemTexts[di] || '').trim()}>+</Btn>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add new dimension */}
        <div style={{background:SURF,border:`2px dashed ${BORD2}`,borderRadius:12,padding:20,marginTop:14}}>
          <div style={{fontSize:14,color:GOLD,fontWeight:600,marginBottom:14}}>+ Új kompetencia hozzáadása</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <Input label="Kompetencia neve" value={newDimName} onChange={setNewDimName} placeholder="pl. Kommunikáció"/>
            <Input label="Rövid leírás / label" value={newDimLabel} onChange={setNewDimLabel} placeholder="pl. Kommunikáció és prezentáció"/>
          </div>
          <Btn size="sm" onClick={addDim} disabled={!newDimName.trim()}>Kompetencia hozzáadása</Btn>
        </div>

        {/* Bottom action: use for survey (when coming from SelfPickView) */}
        {!projectId && dims.length > 0 && totalItems > 0 && (
          <div style={{marginTop:24,background:`${GOLD}0A`,border:`1px solid ${GDIM}`,borderRadius:14,padding:'18px 24px'}}>
            {/* Template name */}
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,color:MUTED,marginBottom:5,textTransform:'uppercase',letterSpacing:'.08em'}}>Sablon neve</div>
              <input value={templateName} onChange={e => setTemplateName(e.target.value)}
                placeholder="pl. Értékesítési vezető kérdőív"
                style={{width:'100%',background:S2,border:`1px solid ${BORD}`,borderRadius:8,padding:'10px 14px',color:TEXT,fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:'none',boxSizing:'border-box'}}/>
            </div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}>
              <div style={{fontSize:13,color:MUTED}}>{dims.length} kompetencia · {totalItems} alkompetencia</div>
              <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
                <Btn onClick={handleSaveAsTemplate}>💾 Mentés sablonként</Btn>
                <Btn variant="outline_gold" onClick={handleUseForSurvey}>Önértékelés indítása →</Btn>
                {savedAsTemplate && <span style={{fontSize:12,color:GREEN}}>✓ Sablon mentve</span>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── APP ───────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState('loading');
  const [ctx,  setCtx]  = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const historyRef = useRef([]);

  useEffect(() => {
    // Check for ?code=XXX from email invite link
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const inviteCode = params ? params.get('code') : null;

    auth.getSession().then(session => {
      if (inviteCode) {
        // Direct survey entry from email link — skip login
        setCtx({ inviteCode });
        setView('survey_enter');
      } else if (session) {
        setCurrentUser(session); setCtx({user:session}); setView('home');
      } else {
        setView('login');
      }
    });
  }, []);

  function handleLogin(user) {
    if (!user) { setView('survey_enter'); return; }
    setCurrentUser(user); setCtx({user}); setView('home');
  }
  async function handleLogout() { await auth.logout(); setCurrentUser(null); setCtx({}); setView('login'); }
  function handleUpgrade(user) { setCurrentUser(user); setCtx(prev=>({...prev,user})); setView('admin'); }

  useEffect(() => {
    const link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Instrument+Serif&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const nav = useCallback((v, extra) => {
    const e = extra || {};
    // Push current state to history before navigating
    historyRef.current.push({ view, ctx });
    if (v === 'survey') {
      setCtx({...e, user: currentUser});
    } else {
      setCtx(prev => Object.assign({}, prev, e, {user: currentUser}));
    }
    setView(v);
    if (typeof window !== 'undefined' && window.scrollTo) window.scrollTo(0, 0);
  }, [view, ctx]);

  const goBack = useCallback(() => {
    const stack = historyRef.current;
    if (stack.length === 0) { setView('home'); return; }
    const prev = stack.pop();
    setView(prev.view);
    setCtx(prev.ctx);
    if (typeof window !== 'undefined' && window.scrollTo) window.scrollTo(0, 0);
  }, []);

  if (view === 'loading') return <div style={{background:BG,minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:MUTED}}>Betöltés...</div>;
  if (view === 'login') return <LoginView onLogin={handleLogin}/>;

  const views = {
    home:             <HomeView          nav={nav} goBack={goBack} ctx={ctx} onLogout={handleLogout}/>,
    paywall:          <PaywallView       nav={nav} goBack={goBack} onUpgrade={handleUpgrade}/>,
    super_admin:      <SuperAdminPanel   nav={nav} goBack={goBack} ctx={ctx}/>,
    consultant_invites: <ConsultantInviteView nav={nav} goBack={goBack} ctx={ctx}/>,
    leader_dashboard: <LeaderDashboard   nav={nav} goBack={goBack} ctx={ctx}/>,
    self_pick:        <SelfPickView      nav={nav} goBack={goBack} ctx={ctx}/>,
    ai_builder:       <AIBuilderView     nav={nav} goBack={goBack} ctx={ctx}/>,
    survey:           <SurveyView        nav={nav} goBack={goBack} ctx={ctx}/>,
    self_report:      <SelfReportView    nav={nav} goBack={goBack} ctx={ctx}/>,
    leader_compare:   <LeaderCompareView nav={nav} goBack={goBack} ctx={ctx}/>,
    group_manage:     <GroupManageView   nav={nav} goBack={goBack} ctx={ctx}/>,
    survey_enter:     <SurveyEnterView   nav={nav} goBack={goBack} ctx={ctx}/>,
    survey_done:      <SurveyDoneView    nav={nav} goBack={goBack} ctx={ctx}/>,
    admin:            <AdminView         nav={nav} goBack={goBack} ctx={ctx}/>,
    new_project:      <NewProjectView    nav={nav} goBack={goBack} ctx={ctx}/>,
    project:          <ProjectView       nav={nav} goBack={goBack} ctx={ctx}/>,
    raters:           <RatersView        nav={nav} goBack={goBack} ctx={ctx}/>,
    report:           <ReportPageView    nav={nav} goBack={goBack} ctx={ctx}/>,
    library_manager:  <LibraryManagerView nav={nav} goBack={goBack} ctx={ctx}/>,
  };

  return (
    <div style={{background:BG,minHeight:'100vh',color:TEXT,fontFamily:"'DM Sans',-apple-system,sans-serif",WebkitFontSmoothing:'antialiased'}}>
      {views[view] || views['home']}
    </div>
  );
}
