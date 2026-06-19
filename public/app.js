// ====================================================
// TENIS Y NOSOTRAS x CLUB24 — Lógica de la app
// No hace falta tocar este archivo.
// ====================================================

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Datos iniciales de parejas (se cargan en Supabase la primera vez que se abre la app)
const GRUPOS_INICIALES = {
"1era":[
  {"id":"1A","parejas":[["Gabriela Scalise","Raquel Gabriel",1],["Lusiana Angelo","Alicia Allegue",1],["Angeles Tagliaferri","Carolina Cavenago",0],["Andrea Agosta","Natalia Zerzer",0]]},
  {"id":"1B","parejas":[["Coni Cababie","Jorgelina Alonso",1],["Pamela Goldszer","Michelle Furman",1],["Fabiana Salgas","Constanza Estevez",0],["Tamara Fuks","Gabriela Galanternik",0]]},
  {"id":"1C","parejas":[["María Galindez","Verónica Valero",1],["Ile Berman","Marisa Muñiz",1],["Soledad Neme","María Elena Aldave",0],["Flavia Antonini","Daniela Conterjnic",0]]},
  {"id":"1D","parejas":[["Carolina Schuster","Romina Leiva",1],["Romina Mendez Castelli","Chediak",0],["De Mont Sabrina","Julieta Leon",0],["Andrea Menne","Carolina Crivelini",0]]}
],
"2da":[
  {"id":"2A","parejas":[["Mariela Natalia Bobba","Maria Vanesa Ali",1],["Mariela Romero Palacios","Leticia Perez Nava",0],["Luciana Jagodnik","Magali Janosi",0],["María Laphitzondo","María Giovannangelo",0]]},
  {"id":"2B","parejas":[["Monica Nogueira","Andrea Cantero",1],["Mariana Viglione","Carola Fernandez Delpech",0],["Viviana Vergili","Cristina Mengide",0],["Joy Flexer","Carolina Menger",0]]},
  {"id":"2C","parejas":[["Verónica Lamas","Adriana Sibaja",1],["Agostina Tuchscherer","Agustina Móndelo",0],["María Eugenia Deslous","Queirolo Mariana",0],["María Alejandra Campi","Nadia Davidovich",0]]},
  {"id":"2D","parejas":[["Jessica Taubas","Natalia Rauchberger",1],["Geraldine Canteros","Vanina Del Giudice",0],["María Fabiana Zavaglia","María Laura Roude",0],["Tatiana Guindi","Magali Guindi",0]]},
  {"id":"2E","parejas":[["Karin Dubiansky","Laura Sziward",1],["Maria Noel Heine","Alexia Musolino",0],["Sabrina Franco","Maria Laura Elgue",0],["Maria Teresa Di Santo","Florencia Wainfeld",0]]},
  {"id":"2F","parejas":[["Silvina Baldracco","Melanie Uriarte",0],["Daniela Mastronardi","Jesica Stoppel",0],["Patricia Suarez","Dora Castro",0],["Mariela Marangoni","Lorena Llaberia",0]]}
],
"3era":[
  {"id":"3A","parejas":[["Micaela Goldenberg","Sabrina Fiscman",1],["Maria Elena Olivares","Adriana Monica Llaver",1],["Andrea Braña","Natalia Garcia",0],["Valeria Salandari","Mariana Padrón",0]]},
  {"id":"3B","parejas":[["Georgina Cababie","Jacqueline Goldszer",1],["Ivana Chuliver","Romina",0],["Soledad Moreno","Rosario Ceballos",0],["Eliana Lanza","Carolina Rodríguez",0]]},
  {"id":"3C","parejas":[["Maria Sol Pinto","Carolina Wainfeld",1],["Maria Fernanda Milli","Maria Lorena Litvinoff",0],["Lucía Anderica","Daniela Fanti",0],["Raimondo Noelia Paola","Liliana Cejas",0]]},
  {"id":"3D","parejas":[["Claudia Aizen","Teresa Torres",1],["María Soledad Gómez Paz","Carolina Paola Hientz",0],["Natalia Plano","Belén Gorosito",0],["Diana Siburu","Fabiana Finkelstein",0]]},
  {"id":"3E","parejas":[["Julieta Jadgonik","Carlina Stroliar",1],["Marina Kornzaft","Mercedes Kildal",0],["Mariela Piñeyro","Paola Delpozo",0],["Tamara Sol Bassi","Jazmin Fisher",0]]},
  {"id":"3F","parejas":[["Noe Brozzoni","Cinthia Burgos",1],["Natalia Cordoba","Andrea Medins",0],["Coqui Todesco","Caro Paviglianiti",0],["Rosana Stinga","Carolina Lera",0]]},
  {"id":"3G","parejas":[["Perla Dabah","Vivian Tessadro",1],["María Laura Cachau","Luciana Ganem",0],["Silvia Peressini","Silvana Gyldenfeldt",0],["Deborah Gottlieb","Melisa Gottlieb",0]]}
]
};

const TB_LABELS={pts:'Puntos',bal:'Balance de games',gg:'Games ganados',h2h:'Enfrentamiento directo'};
const CAT_LABELS={"1era":"1era","2da":"2da","3era":"3era"};

// ---- ESTADO GLOBAL (se llena leyendo de Supabase) ----
let grupos={"1era":[],"2da":[],"3era":[]};
let partidos=[];
let matchSchedule={};
let playoffData={"1era":null,"2da":null,"3era":null};
let playoffMode={"1era":"semis","2da":"cuartos","3era":"cuartos"};
let tiebreakOrder=["pts","bal","gg","h2h"];

const state={
  mainView:"jugadoras",
  cat:"1era",adminCat:"1era",
  subTabJ:"grupos",
  liveCat:"1era",
  liveSubTab:"grupos",
  adminSection:"pairs",
  adminPairsGroup:{},
  adminUnlocked:false,
};
["1era","2da","3era"].forEach(c=>{state.adminPairsGroup[c]=null;});

// ====================================================
// CARGA INICIAL DE DATOS DESDE SUPABASE
// ====================================================
async function initApp(){
  try{
    const {data:existingPairs,error:checkErr}=await supabaseClient.from('parejas').select('id').limit(1);
    if(checkErr){
      showFatalError("No se pudo conectar con la base de datos. Revisá que copiaste bien la URL y la clave en config.js.");
      return;
    }
    if(!existingPairs||existingPairs.length===0){
      await seedInitialData();
    }
    await loadAllData();
    renderMainTabs();
    renderJ();
  }catch(e){
    console.error(e);
    showFatalError("Hubo un error cargando la app. Revisá tu conexión a internet y volvé a intentar.");
  }
}

function showFatalError(msg){
  document.getElementById('app').innerHTML=`<div class="loading" style="color:#dc2626;padding:2rem 1.2rem;">${msg}</div>`;
}

async function seedInitialData(){
  let pid=0;
  const pairsToInsert=[];
  ["1era","2da","3era"].forEach(cat=>{
    GRUPOS_INICIALES[cat].forEach(g=>{
      g.parejas.forEach(p=>{
        pairsToInsert.push({
          id:`p${pid++}`,
          categoria:cat,
          grupo_id:g.id,
          jugadora1:p[0],
          jugadora2:p[1],
          cardales:p[2]===1
        });
      });
    });
  });
  await supabaseClient.from('parejas').insert(pairsToInsert);

  let pid2=0;
  const tempGrupos={"1era":[],"2da":[],"3era":[]};
  ["1era","2da","3era"].forEach(cat=>{
    tempGrupos[cat]=GRUPOS_INICIALES[cat].map(g=>({
      id:g.id,
      parejas:g.parejas.map(p=>({id:`p${pid2++}`,j1:p[0],j2:p[1]}))
    }));
  });
  const matchesToInsert=[];
  ["1era","2da","3era"].forEach(cat=>{
    tempGrupos[cat].forEach(g=>{
      g.parejas.forEach((p1,i)=>{
        g.parejas.forEach((p2,j)=>{
          if(j<=i)return;
          matchesToInsert.push({
            id:`m_${g.id}_${p1.id}_${p2.id}`,
            categoria:cat,
            grupo_id:g.id,
            pareja1_id:p1.id,
            pareja2_id:p2.id,
            sets:[],
            jugado:false,
            simulado:false
          });
        });
      });
    });
  });
  await supabaseClient.from('partidos').insert(matchesToInsert);

  await supabaseClient.from('configuracion').insert([
    {clave:'playoff_mode',valor:{"1era":"semis","2da":"cuartos","3era":"cuartos"}},
    {clave:'tiebreak_order',valor:["pts","bal","gg","h2h"]}
  ]);
}

async function loadAllData(){
  const [{data:pairsData},{data:matchesData},{data:schedData},{data:playoffRows},{data:configRows}]=await Promise.all([
    supabaseClient.from('parejas').select('*'),
    supabaseClient.from('partidos').select('*'),
    supabaseClient.from('horarios').select('*'),
    supabaseClient.from('playoff').select('*'),
    supabaseClient.from('configuracion').select('*'),
  ]);

  grupos={"1era":[],"2da":[],"3era":[]};
  const groupMap={};
  (pairsData||[]).forEach(p=>{
    const key=p.categoria+'|'+p.grupo_id;
    if(!groupMap[key]){
      groupMap[key]={id:p.grupo_id,parejas:[]};
      grupos[p.categoria].push(groupMap[key]);
    }
    groupMap[key].parejas.push({id:p.id,j1:p.jugadora1,j2:p.jugadora2,cardales:p.cardales});
  });
  Object.keys(grupos).forEach(cat=>{
    grupos[cat].sort((a,b)=>a.id.localeCompare(b.id));
  });

  partidos=(matchesData||[]).map(m=>({
    id:m.id,cat:m.categoria,grupoId:m.grupo_id,p1:m.pareja1_id,p2:m.pareja2_id,
    sets:m.sets||[],played:m.jugado,simulated:m.simulado,phase:'grupos'
  }));

  matchSchedule={};
  (schedData||[]).forEach(s=>{
    matchSchedule[s.partido_id]={cancha:s.cancha||'',hora:s.hora||'',after:s.a_continuacion||false,afterMatchId:s.a_continuacion_de||''};
  });

  playoffData={"1era":null,"2da":null,"3era":null};
  (playoffRows||[]).forEach(row=>{
    playoffData[row.categoria]={...row.datos,isPreview:row.es_vista_previa};
  });

  (configRows||[]).forEach(row=>{
    if(row.clave==='playoff_mode') playoffMode={...playoffMode,...row.valor};
    if(row.clave==='tiebreak_order') tiebreakOrder=row.valor;
  });

  ["1era","2da","3era"].forEach(c=>{
    if(grupos[c].length && !state.adminPairsGroup[c]) state.adminPairsGroup[c]=grupos[c][0].id;
  });
}

// ====================================================
// HELPERS DE DATOS
// ====================================================
function getP(id){for(const cat of["1era","2da","3era"])for(const g of grupos[cat]){const p=g.parejas.find(x=>x.id===id);if(p)return p;}return null;}
function pJ1(id){const p=getP(id);return p?p.j1:'?';}
function pJ2(id){const p=getP(id);return p?p.j2:'?';}
function pNombre(id){const p=getP(id);return p?`${p.j1} / ${p.j2}`:id;}

function getPlayoffConfig(cat){
  const mode=playoffMode[cat];
  if(mode==='semis') return{total:4,roundName:'semis'};
  return{total:8,roundName:'cuartos'};
}
function getCutPos(){return 1;}

function getStatsRaw(gId,cat){
  const g=grupos[cat].find(g=>g.id===gId);if(!g)return[];
  return g.parejas.map(p=>{
    const ms=partidos.filter(m=>m.grupoId===gId&&m.played&&(m.p1===p.id||m.p2===p.id));
    let pts=0,gw=0,l=0,gg=0,gp=0;
    ms.forEach(m=>{
      const ip=m.p1===p.id;let mw=0,ow=0;
      m.sets.forEach(s=>{if(ip){mw+=(s[0]>s[1]?1:0);ow+=(s[1]>s[0]?1:0);gg+=s[0];gp+=s[1];}else{mw+=(s[1]>s[0]?1:0);ow+=(s[0]>s[1]?1:0);gg+=s[1];gp+=s[0];}});
      if(mw>ow){pts+=3;gw++;}else l++;
    });
    return{...p,pts,gw,l,gg,gp,bal:gg-gp,grupoId:gId,cat};
  });
}
function h2hResult(pairAId,pairBId,gId){
  const m=partidos.find(mm=>mm.grupoId===gId&&mm.played&&((mm.p1===pairAId&&mm.p2===pairBId)||(mm.p1===pairBId&&mm.p2===pairAId)));
  if(!m)return 0;
  let w1=0,w2=0;
  m.sets.forEach(s=>{if(s[0]>s[1])w1++;else w2++;});
  const aIsP1=m.p1===pairAId;
  const aWon=aIsP1?w1>w2:w2>w1;
  return aWon?1:-1;
}
function compareByTiebreak(a,b,gId){
  for(const crit of tiebreakOrder){
    if(crit==='pts'&&a.pts!==b.pts)return b.pts-a.pts;
    if(crit==='bal'&&a.bal!==b.bal)return b.bal-a.bal;
    if(crit==='gg'&&a.gg!==b.gg)return b.gg-a.gg;
    if(crit==='h2h'){
      const r=h2hResult(a.id,b.id,gId);
      if(r!==0)return -r;
    }
  }
  return 0;
}
function getStats(gId,cat){
  const raw=getStatsRaw(gId,cat);
  return raw.sort((a,b)=>compareByTiebreak(a,b,gId));
}
function getAdj(p,gId,cat){
  const g=grupos[cat].find(g=>g.id===gId);
  if(!g||g.parejas.length<=4)return p;
  const st=getStats(gId,cat);
  const lastId=st[st.length-1].id;
  if(p.id===lastId)return p;
  const ms=partidos.filter(m=>m.grupoId===gId&&m.played&&(m.p1===p.id||m.p2===p.id)&&m.p1!==lastId&&m.p2!==lastId);
  let pts=0,gw=0,l=0,gg=0,gp=0;
  ms.forEach(m=>{
    const ip=m.p1===p.id;let mw=0,ow=0;
    m.sets.forEach(s=>{if(ip){mw+=(s[0]>s[1]?1:0);ow+=(s[1]>s[0]?1:0);gg+=s[0];gp+=s[1];}else{mw+=(s[1]>s[0]?1:0);ow+=(s[0]>s[1]?1:0);gg+=s[1];gp+=s[0];}});
    if(mw>ow){pts+=3;gw++;}else l++;
  });
  return{...p,pts,gw,l,gg,gp,bal:gg-gp,adjusted:true};
}
function getSeeds(cat){
  const cfg=getPlayoffConfig(cat);
  const firsts=[],seconds=[];
  grupos[cat].forEach(g=>{
    const st=getStats(g.id,cat);
    if(st[0])firsts.push({...st[0],rank:1,grupoId:g.id});
    if(st[1])seconds.push({...getAdj(st[1],g.id,cat),rank:2,grupoId:g.id});
  });
  firsts.sort((a,b)=>b.pts-a.pts||b.bal-a.bal||b.gg-a.gg);
  seconds.sort((a,b)=>b.pts-a.pts||b.bal-a.bal||b.gg-a.gg);
  const needTotal=cfg.total;
  let qF=firsts.slice(0,needTotal);
  let qS=[];
  if(qF.length<needTotal){
    qS=seconds.slice(0,needTotal-qF.length);
  }
  return{firsts,seconds,qualFirsts:qF,qualSeconds:qS,cfg};
}
function getChampion(cat){
  const po=playoffData[cat];
  if(!po||po.isPreview)return null;
  const fr=po.rounds[po.rounds.length-1];
  if(!fr||!fr.matches[0]?.winner)return null;
  return fr.matches[0].winner;
}
function getSched(matchId){return matchSchedule[matchId]||{cancha:'',hora:'',after:false,afterMatchId:''};}

// ====================================================
// NAVEGACIÓN PRINCIPAL
// ====================================================
function switchMain(v){
  state.mainView=v;
  renderMainTabs();
  document.getElementById('view-jugadoras').style.display=v==='jugadoras'?'block':'none';
  document.getElementById('view-admin').style.display=v==='admin'?'block':'none';
  if(v==='jugadoras')renderJ();
  if(v==='admin'&&state.adminUnlocked)renderA();
}
function renderMainTabs(){
  document.getElementById('app').innerHTML=`
    <div class="header">
      <h1>🎾 Tenis y Nosotras × club24</h1>
      <p>Torneo Americano de Damas — 26 de Junio · Los Cardales Country Club</p>
    </div>
    <div class="pillbar" id="mainTabs"></div>
    <div id="view-jugadoras" style="display:${state.mainView==='jugadoras'?'block':'none'};">
      <div class="pillbar-sm" id="ctj"></div>
      <div class="pillbar-sm" id="stj"></div>
      <div class="content-pad" id="jcontent"></div>
    </div>
    <div id="view-admin" style="display:${state.mainView==='admin'?'block':'none'};">
      <div id="pin-wall" class="admin-pin-card" style="display:${state.adminUnlocked?'none':'block'};">
        <div style="font-size:28px;margin-bottom:.5rem;">🔐</div>
        <p style="font-size:13px;color:var(--gray);margin-bottom:12px;">Contraseña de administrador</p>
        <input type="password" id="pin-input" placeholder="Contraseña..." style="text-align:center;margin-bottom:10px;" onkeydown="if(event.key==='Enter')checkPin()">
        <button class="btn btn-pink btn-full" onclick="checkPin()">Ingresar</button>
        <p id="pin-err" style="color:#dc2626;font-size:12px;display:none;margin-top:8px;">Contraseña incorrecta</p>
      </div>
      <div id="admin-panel" style="display:${state.adminUnlocked?'block':'none'};">
        <div class="pillbar-sm" id="cta"></div>
        <div class="pillbar-sm" id="acatbar"></div>
        <div class="content-pad" id="acontent"></div>
      </div>
    </div>
  `;
  document.getElementById('mainTabs').innerHTML=`
    <button class="pill ${state.mainView==='jugadoras'?'active':''}" onclick="switchMain('jugadoras')">Jugadoras</button>
    <button class="pill ${state.mainView==='admin'?'active':''}" onclick="switchMain('admin')">Administrador</button>
  `;
}
function checkPin(){
  if(document.getElementById('pin-input').value===ADMIN_PASSWORD){
    state.adminUnlocked=true;
    document.getElementById('pin-wall').style.display='none';
    document.getElementById('admin-panel').style.display='block';
    renderA();
  }else{document.getElementById('pin-err').style.display='block';}
}
function buildCatTabs(elId,cur,fn){
  const labels={"1era":"1º Categoría","2da":"2º Categoría","3era":"3º Categoría"};
  document.getElementById(elId).innerHTML=["1era","2da","3era"].map(c=>`<button class="pill-sm ${c===cur?'active':''}" onclick="${fn}('${c}')">${labels[c]}</button>`).join('');
}
function tiebreakLegendHtml(){
  const ol=tiebreakOrder.map(k=>`<li>${TB_LABELS[k]}</li>`).join('');
  return `<div class="tiebreak-bar"><strong>Orden de desempate en caso de igualdad:</strong><ol>${ol}</ol></div>`;
}

// ====================================================
// VISTA JUGADORAS / LIVE (compartida)
// ====================================================
function renderJ(){
  buildCatTabs('ctj',state.cat,'switchCatJ');
  document.getElementById('stj').innerHTML=`
    <button class="pill-sm ${state.subTabJ==='grupos'?'active':''}" onclick="switchSubJ('grupos')">Grupos</button>
    <button class="pill-sm ${state.subTabJ==='proximos'?'active':''}" onclick="switchSubJ('proximos')">Próximos partidos</button>
  `;
  renderJContent();
}
function switchCatJ(cat){state.cat=cat;renderJ();}
function switchSubJ(s){state.subTabJ=s;renderJ();}
function renderJContent(){renderPublicView(state.cat,state.subTabJ,'jcontent');}

function renderPublicView(cat,subTab,targetElId){
  const el=document.getElementById(targetElId);
  if(!el)return;
  let html='';
  if(subTab==='proximos'){
    const pend=partidos.filter(m=>m.cat===cat&&!m.played);
    html+=`<div class="phase-label">Próximos partidos</div>`;
    if(!pend.length){html+='<div class="empty">No hay partidos pendientes.</div>';}
    else{pend.forEach(m=>{html+=renderPCard(m);});}
    el.innerHTML=html;
    return;
  }

  if(!grupos[cat]||!grupos[cat].length){
    el.innerHTML='<div class="empty">Todavía no hay parejas cargadas en esta categoría.</div>';
    return;
  }

  const{firsts,seconds,qualSeconds,cfg}=getSeeds(cat);
  const champion=getChampion(cat);

  if(champion){
    const p=getP(champion);
    html+=`<div class="champion-banner">
      <div class="crown">🏆</div>
      <div class="title">Campeonas ${cat==='1era'?'1º Categoría':cat==='2da'?'2º Categoría':'3º Categoría'}</div>
      <div class="names">${p?p.j1:''}<br>${p?p.j2:''}</div>
    </div>`;
  }

  html+=`<div class="phase-label">Zona de grupos</div>`;
  grupos[cat].forEach(g=>{
    const stats=getStats(g.id,cat);
    const cut=getCutPos();
    html+=`<div class="grupo">
      <div class="grupo-header">Grupo ${g.id} · ${g.parejas.length} parejas</div>
      <div class="table-scroll"><table class="grupo-table">
        <thead><tr><th style="width:26px">#</th><th class="thl">Pareja</th><th>Pts</th><th>G</th><th>P</th><th>GG</th><th>GP</th><th>Bal</th></tr></thead>
        <tbody>`;
    stats.forEach((p,i)=>{
      const shade=i%2===1,isCut=i===cut-1;
      html+=`<tr class="${shade?'shade':''} ${isCut?'cut-row':''}">
        <td><span class="pos-badge pos-${i+1}">${i+1}</span></td>
        <td class="tdl"><div class="pnames"><span>${p.j1}</span><span>${p.j2}</span></div></td>
        <td>${p.pts}</td><td>${p.gw}</td><td>${p.l}</td><td>${p.gg}</td><td>${p.gp}</td>
        <td>${p.bal>0?'+':''}${p.bal}</td>
      </tr>`;
    });
    html+=`</tbody></table></div>`;
    let note=`🎾 1ro clasifica directo a semifinales.`;
    if(cat==="1era"){
      note+=` Los segundos clasificarán a cuartos de final únicamente si el formato del playoff se amplía a esa instancia, según los mejores resultados de la fase de grupos.`;
    }else{
      note=`🎾 1ro clasifica directo. 2do compite por los mejores segundos para ${playoffMode[cat]}.`;
    }
    html+=`<div class="cnote">${note}</div>
      <div class="legend-bar"><strong>Pts</strong>: puntos (3 x victoria) &nbsp;·&nbsp; <strong>G</strong>: ganados &nbsp;·&nbsp; <strong>P</strong>: perdidos &nbsp;·&nbsp; <strong>GG</strong>: games ganados &nbsp;·&nbsp; <strong>GP</strong>: games perdidos &nbsp;·&nbsp; <strong>Bal</strong>: diferencia de games (GG-GP)</div>
      ${tiebreakLegendHtml()}
    </div>`;
    html+=renderMatrixTable(g,cat);
  });

  if(seconds.length&&cat!=="1era"){
    const needed=cfg.total-firsts.length;
    if(needed>0){
      html+=`<div class="phase-label" style="margin-top:1.5rem;">Ranking mejores 2dos</div>`;
      html+=`<div class="grupo"><div class="grupo-header">Ranking 2dos puestos</div>
        <div class="table-scroll"><table class="grupo-table">
          <thead><tr><th>#</th><th class="thl">Pareja</th><th>Grupo</th><th>Pts</th><th>GG</th><th>GP</th><th>Bal</th></tr></thead><tbody>`;
      seconds.forEach((s,i)=>{
        const shade=i%2===1,cl=i<needed,isCut=i===needed-1&&needed<seconds.length;
        html+=`<tr class="${shade?'shade':''} ${isCut?'cut-row':''}">
          <td><span class="pos-badge ${cl?'pos-1':''}">${i+1}</span></td>
          <td class="tdl"><div class="pnames"><span>${s.j1}</span><span>${s.j2}</span></div></td>
          <td>${s.grupoId}</td><td>${s.pts}</td><td>${s.gg}</td><td>${s.gp}</td><td>${s.bal>0?'+':''}${s.bal}</td>
        </tr>`;
      });
      html+=`</tbody></table></div>
        <div class="cnote">Todos los segundos clasifican si el número de grupos lo permite. En grupos de 4, las stats se comparan directo.</div>
        <div class="legend-bar">
          <strong>Cómo se rompe el empate entre segundos:</strong><br>
          1° criterio: más <strong>Pts</strong> (puntos obtenidos en su grupo).<br>
          2° criterio (si persiste el empate en puntos): mejor <strong>Bal</strong> (diferencia de games ganados menos perdidos).<br>
          3° criterio (si persiste el empate en balance): más <strong>GG</strong> (total de games ganados).<br>
          En grupos de 5 parejas, las estadísticas del 2do se calculan excluyendo el partido contra la última pareja del grupo, para comparar en igualdad de partidos jugados con los segundos de grupos de 4.
        </div>
      </div>`;
    }
  }

  if(playoffData[cat]){
    html+=`<div class="phase-label" style="margin-top:1.5rem;">Playoff</div>`;
    if(playoffData[cat].isPreview){
      html+=`<div class="preview-banner">⚠️ Vista previa — el administrador todavía puede modificar este cuadro.</div>`;
    }
    html+=renderBracketTree(playoffData[cat]);
    const champ=getChampion(cat);
    if(champ){
      const p=getP(champ);
      html+=`<div class="champion-card">
        <div class="medal">🥇</div>
        <div class="ctext">
          <div class="clabel">Campeón</div>
          <div class="cnames">${p?p.j1:''} / ${p?p.j2:''}</div>
        </div>
      </div>`;
    }
  }
  el.innerHTML=html||'<div class="empty">No hay datos.</div>';
}

function renderMatrixTable(g,cat){
  const pairs=g.parejas;
  const fullLabel=p=>`<span class="pair-line">${p.j1}</span><span class="pair-line">${p.j2}</span>`;
  let html=`<div class="phase-label" style="margin-top:.6rem;margin-bottom:6px;">Resultados — Grupo ${g.id}</div>
    <div class="grupo" style="border:none;margin-bottom:1.2rem;background:none;">
    <div class="matrix-wrap"><table class="matrix-table">
      <thead><tr><th class="corner">Parejas</th>${pairs.map(p=>`<th>${fullLabel(p)}</th>`).join('')}</tr></thead>
      <tbody>`;
  pairs.forEach((rowP,ri)=>{
    html+=`<tr><td class="row-label">${fullLabel(rowP)}</td>`;
    pairs.forEach((colP,ci)=>{
      if(ri===ci){html+=`<td class="diag"></td>`;return;}
      const m=partidos.find(mm=>mm.grupoId===g.id&&((mm.p1===rowP.id&&mm.p2===colP.id)||(mm.p1===colP.id&&mm.p2===rowP.id)));
      if(!m||!m.played){html+=`<td class="empty-cell">—</td>`;return;}
      const isP1=m.p1===rowP.id;
      const scoreStr=m.sets.map(s=>isP1?`${s[0]}-${s[1]}`:`${s[1]}-${s[0]}`).join(' ');
      html+=`<td class="played">${scoreStr}</td>`;
    });
    html+=`</tr>`;
  });
  html+=`</tbody></table></div>
    <div class="cnote">El marcador se lee en la fila de la pareja (sus games primero).</div>
    </div>`;
  return html;
}

function findMatchById(mid){
  const gm=partidos.find(x=>x.id===mid);
  if(gm)return gm;
  for(const cat of["1era","2da","3era"]){
    if(playoffData[cat]){
      for(const r of playoffData[cat].rounds){
        const fm=r.matches.find(x=>x.id===mid);
        if(fm)return fm;
      }
    }
  }
  return null;
}
function getSchedDisplay(sched){
  if(sched.after){
    if(sched.afterMatchId){
      const am=findMatchById(sched.afterMatchId);
      if(am){
        const n1=am.p1?pNombre(am.p1):'Por definir',n2=am.p2?pNombre(am.p2):'Por definir';
        return{timeText:`A continuación de`,waitNames:`${n1} vs ${n2}`,short:'A cont.'};
      }
    }
    return{timeText:'A continuación',waitNames:'',short:'A cont.'};
  }
  return{timeText:sched.hora||'—',waitNames:'',short:sched.hora||'—'};
}
function renderPCard(m){
  const n1=pJ1(m.p1),nn1=pJ2(m.p1),n2=pJ1(m.p2),nn2=pJ2(m.p2);
  let w1=0,w2=0;m.sets.forEach(s=>{if(s[0]>s[1])w1++;else w2++;});
  const win=m.played?(w1>w2?m.p1:m.p2):null;
  let s1='',s2='';
  m.sets.forEach(s=>{s1+=`<span class="sbox ${s[0]>s[1]?'won':''}">${s[0]}</span>`;s2+=`<span class="sbox ${s[1]>s[0]?'won':''}">${s[1]}</span>`;});
  const stag=m.simulated?`<span class="sim-badge">simulado</span>`:'';
  const sched=getSched(m.id);
  let schedHtml='';
  if(sched.after||sched.cancha||sched.hora){
    const disp=getSchedDisplay(sched);
    let canchaText=sched.cancha?`C${sched.cancha}`:'—';
    schedHtml=`<div class="cancha-block">
      <div class="cnum">${canchaText}</div>
      <div class="clabel">Cancha</div>
      <div class="ctime" style="font-size:${sched.after?'11px':'14px'};">${disp.short}</div>
      ${sched.after&&disp.waitNames?`<div class="after-note">${disp.waitNames}</div>`:''}
    </div>`;
  }
  return `<div class="partido">
    <div class="phdr"><span>Grupo ${m.grupoId}${stag}</span></div>
    <div class="pbody">
      <div class="pbody-teams">
        <div class="trow"><span class="tname ${win===m.p1?'win':''}">${n1} / ${nn1}</span><div class="srow">${s1}</div></div>
        <div class="trow" style="margin-top:4px;"><span class="tname ${win===m.p2?'win':''}">${n2} / ${nn2}</span><div class="srow">${s2}</div></div>
      </div>
      ${schedHtml}
      <span class="pst ${m.played?'splay':'spend'}">${m.played?'Jugado':'Pendiente'}</span>
    </div>
  </div>`;
}

function renderBracketTree(playoff){
  const MATCH_W=210,COL_GAP=48,COL_W=MATCH_W+COL_GAP,FOOTER_H=20,MATCH_H=44*2+FOOTER_H+2,VPAD=20;
  const rounds=playoff.rounds;
  const r0n=rounds[0].matches.length;
  const SLOT=MATCH_H+VPAD;
  const totalH=r0n*SLOT+60;
  const totalW=rounds.length*COL_W+MATCH_W;
  const previewClass=playoff.isPreview?'preview':'';
  let svgLines='';
  rounds.forEach((r,ri)=>{
    if(ri===0)return;
    const prev=rounds[ri-1];
    r.matches.forEach((m,mi)=>{
      const srcA=mi*2,srcB=mi*2+1;
      if(srcA>=prev.matches.length)return;
      function mY(rIdx,mIdx){const span=Math.pow(2,rIdx);return mIdx*span*SLOT+40+(span*SLOT-MATCH_H)/2+MATCH_H/2;}
      const yA=mY(ri-1,srcA),yB=srcB<prev.matches.length?mY(ri-1,srcB):yA;
      const yM=mY(ri,mi);
      const xL=(ri-1)*COL_W+MATCH_W,xMid=xL+COL_GAP/2,xR=ri*COL_W;
      svgLines+=`<path d="M${xL},${yA} H${xMid}" fill="none" stroke="#f9a8d4" stroke-width="2"/>`;
      svgLines+=`<path d="M${xMid},${yA} V${yB}" fill="none" stroke="#f9a8d4" stroke-width="2"/>`;
      svgLines+=`<path d="M${xMid},${yM} H${xR}" fill="none" stroke="#f9a8d4" stroke-width="2"/>`;
    });
  });
  let html=`<div class="bracket-section"><div style="position:relative;min-width:${totalW}px;height:${totalH}px;">`;
  html+=`<svg style="position:absolute;top:0;left:0;width:${totalW}px;height:${totalH}px;pointer-events:none;" xmlns="http://www.w3.org/2000/svg">${svgLines}</svg>`;
  rounds.forEach((r,ri)=>{
    html+=`<div style="position:absolute;left:${ri*COL_W}px;top:0;width:${MATCH_W}px;">`;
    html+=`<div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--pink);font-weight:500;text-align:center;padding-bottom:12px;">${r.name}</div>`;
    r.matches.forEach((m,mi)=>{
      const span=Math.pow(2,ri);
      const topPx=mi*span*SLOT+40+(span*SLOT-MATCH_H)/2;
      const p1=getP(m.p1),p2=getP(m.p2);
      const n1a=p1?p1.j1:'Por definir',n1b=p1?p1.j2:'';
      const n2a=p2?p2.j1:'Por definir',n2b=p2?p2.j2:'';
      let s1='',s2='';
      if(m.sets&&m.sets.length){m.sets.forEach(s=>{s1+=`<span class="sbox ${s[0]>s[1]?'won':''}">${s[0]}</span>`;s2+=`<span class="sbox ${s[1]>s[0]?'won':''}">${s[1]}</span>`;});}
      const sched=getSched(m.id);
      let footerText='';
      if(sched.after){const disp=getSchedDisplay(sched);footerText=`A continuación${disp.waitNames?' de '+disp.waitNames:''}${sched.cancha?' · Cancha '+sched.cancha:''}`;}
      else if(sched.cancha||sched.hora) footerText=`${sched.cancha?'Cancha '+sched.cancha:''}${sched.cancha&&sched.hora?' · ':''}${sched.hora||''}`;
      const footerContent=footerText?`📍 ${footerText}`:'';
      const tbd1=!m.p1,tbd2=!m.p2;
      html+=`<div class="bmatch ${previewClass}" style="position:absolute;top:${topPx}px;left:0;width:${MATCH_W}px;">
        <div class="bteam ${m.winner===m.p1&&m.p1?'win':''} ${tbd1?'tbd':''}">
          <div class="bteam-inner"><div class="bteam-name">${n1a}</div>${n1b?`<div class="bteam-name2">${n1b}</div>`:''}</div>
          <div class="bteam-sets">${s1}</div>
        </div>
        <div class="bteam ${m.winner===m.p2&&m.p2?'win':''} ${tbd2?'tbd':''}">
          <div class="bteam-inner"><div class="bteam-name">${n2a}</div>${n2b?`<div class="bteam-name2">${n2b}</div>`:''}</div>
          <div class="bteam-sets">${s2}</div>
        </div>
        ${footerContent?`<div class="bmatch-footer">${footerContent}</div>`:''}
      </div>`;
    });
    html+=`</div>`;
  });
  html+=`</div></div>`;
  return html;
}

// ====================================================
// ADMIN
// ====================================================
function renderA(){
  buildCatTabs('cta',state.adminCat,'switchCatA');
  document.getElementById('acatbar').innerHTML=`
    <button class="pill-sm ${state.adminSection==='live'?'active':''}" onclick="switchAdminSection('live')"><span class="live-badge"><span class="live-dot"></span> Live</span></button>
    <button class="pill-sm ${state.adminSection==='pairs'?'active':''}" onclick="switchAdminSection('pairs')">Parejas y grupos</button>
    <button class="pill-sm ${state.adminSection==='sched'?'active':''}" onclick="switchAdminSection('sched')">Canchas y horarios</button>
    <button class="pill-sm ${state.adminSection==='results'?'active':''}" onclick="switchAdminSection('results')">Resultados</button>
    <button class="pill-sm ${state.adminSection==='playoff'?'active':''}" onclick="switchAdminSection('playoff')">Playoff</button>
    <button class="pill-sm ${state.adminSection==='tiebreak'?'active':''}" onclick="switchAdminSection('tiebreak')">Desempate</button>
  `;
  renderAContent();
}
function switchCatA(cat){state.adminCat=cat;renderA();}
function switchAdminSection(s){state.adminSection=s;renderA();}

function renderAContent(){
  const cat=state.adminCat;
  let html='';
  if(state.adminSection==='live'){
    html=`<div class="pillbar-sm" id="liveCatBar" style="padding:0 0 10px;"></div>
      <div class="pillbar-sm" id="liveSubBar" style="padding:0 0 10px;"></div>
      <div id="liveContent"></div>`;
    document.getElementById('acontent').innerHTML=html;
    document.getElementById('liveCatBar').innerHTML=["1era","2da","3era"].map(c=>{
      const labels={"1era":"1º Categoría","2da":"2º Categoría","3era":"3º Categoría"};
      return `<button class="pill-sm ${c===state.liveCat?'active':''}" onclick="switchLiveCat('${c}')">${labels[c]}</button>`;
    }).join('');
    document.getElementById('liveSubBar').innerHTML=`
      <button class="pill-sm ${state.liveSubTab==='grupos'?'active':''}" onclick="switchLiveSub('grupos')">Grupos</button>
      <button class="pill-sm ${state.liveSubTab==='proximos'?'active':''}" onclick="switchLiveSub('proximos')">Próximos partidos</button>
    `;
    renderPublicView(state.liveCat,state.liveSubTab,'liveContent');
    return;
  }
  if(state.adminSection==='pairs') html=renderSectionPairs(cat);
  else if(state.adminSection==='sched') html=renderSectionSched();
  else if(state.adminSection==='results') html=renderSectionResults(cat);
  else if(state.adminSection==='playoff') html=renderSectionPlayoff(cat);
  else if(state.adminSection==='tiebreak') html=renderSectionTiebreak();
  document.getElementById('acontent').innerHTML=html;
}
function switchLiveCat(c){state.liveCat=c;renderA();}
function switchLiveSub(s){state.liveSubTab=s;renderA();}

function renderSectionTiebreak(){
  let html=`<div class="ibar">Definí el orden de los criterios de desempate cuando dos o más parejas terminan empatadas en puntos dentro de un mismo grupo.</div>`;
  html+=`<div class="tb-order-list">`;
  tiebreakOrder.forEach((crit,i)=>{
    html+=`<div class="tb-order-item">
      <div class="num">${i+1}</div>
      <div class="label">${TB_LABELS[crit]}</div>
      <div class="arrows">
        <button class="tb-arrow-btn" onclick="moveTiebreak(${i},-1)" ${i===0?'disabled':''}>↑</button>
        <button class="tb-arrow-btn" onclick="moveTiebreak(${i},1)" ${i===tiebreakOrder.length-1?'disabled':''}>↓</button>
      </div>
    </div>`;
  });
  html+=`</div>`;
  html+=`<div class="legend-bar">
    <strong>Puntos:</strong> total de puntos obtenidos en el grupo (3 por victoria).<br>
    <strong>Balance de games:</strong> diferencia entre games ganados y perdidos.<br>
    <strong>Games ganados:</strong> total de games ganados en el grupo.<br>
    <strong>Enfrentamiento directo:</strong> resultado del partido jugado entre las parejas empatadas.
  </div>`;
  return html;
}
async function moveTiebreak(idx,dir){
  const newIdx=idx+dir;
  if(newIdx<0||newIdx>=tiebreakOrder.length)return;
  [tiebreakOrder[idx],tiebreakOrder[newIdx]]=[tiebreakOrder[newIdx],tiebreakOrder[idx]];
  await supabaseClient.from('configuracion').upsert({clave:'tiebreak_order',valor:tiebreakOrder});
  renderA();renderJContent();showToast('Orden de desempate actualizado');
}

function renderSectionPairs(cat){
  if(!grupos[cat]||!grupos[cat].length){
    return '<div class="empty">Todavía no hay parejas cargadas en esta categoría.</div>';
  }
  let html=`<div class="ibar">Elegí un grupo para editar sus parejas. Podés cambiar nombres, agregar, quitar o mover una pareja a otro grupo (incluso de otra categoría).</div>`;
  html+=`<div class="group-select-bar">`;
  grupos[cat].forEach(g=>{
    const active=state.adminPairsGroup[cat]===g.id;
    html+=`<button class="group-select-btn ${active?'active':''}" onclick="selectPairsGroup('${cat}','${g.id}')">Grupo ${g.id}</button>`;
  });
  html+=`</div>`;

  const selectedG=grupos[cat].find(g=>g.id===state.adminPairsGroup[cat])||grupos[cat][0];
  const gi=grupos[cat].indexOf(selectedG);

  const allGroupOptions=[];
  ["1era","2da","3era"].forEach(c=>{
    grupos[c].forEach(g=>{
      allGroupOptions.push({cat:c,gid:g.id,label:`${c==='1era'?'1ra':c==='2da'?'2da':'3ra'} - Grupo ${g.id}`});
    });
  });

  html+=`<div class="grupo" style="margin-bottom:1.2rem;">
    <div class="grupo-header">Grupo ${selectedG.id} (${selectedG.parejas.length} parejas)</div>
    <div style="padding:12px;">`;
  selectedG.parejas.forEach((p,pi)=>{
    const moveOpts=allGroupOptions.map(o=>`<option value="${o.cat}|${o.gid}" ${o.cat===cat&&o.gid===selectedG.id?'selected':''}>${o.label}</option>`).join('');
    html+=`<div class="prow">
      <div class="prow-inputs">
        <input value="${p.j1}" onchange="editP('${cat}',${gi},${pi},'j1',this.value)">
        <input value="${p.j2}" onchange="editP('${cat}',${gi},${pi},'j2',this.value)">
      </div>
      <select class="move-select" onchange="movePair('${cat}',${gi},${pi},this.value)">${moveOpts}</select>
      <button class="btn btn-red btn-sm" onclick="delP('${cat}',${gi},${pi})">Borrar</button>
    </div>`;
  });
  html+=`<button class="btn btn-out btn-sm" style="margin-top:8px;" onclick="addP('${cat}',${gi})">+ Agregar pareja</button>
    </div></div>`;
  return html;
}
function selectPairsGroup(cat,gid){state.adminPairsGroup[cat]=gid;renderA();}
async function editP(cat,gi,pi,f,v){
  const pair=grupos[cat][gi].parejas[pi];
  pair[f]=v;
  const col=f==='j1'?'jugadora1':'jugadora2';
  await supabaseClient.from('parejas').update({[col]:v}).eq('id',pair.id);
  showToast('Guardado');
}
async function delP(cat,gi,pi){
  const pid=grupos[cat][gi].parejas[pi].id;
  grupos[cat][gi].parejas.splice(pi,1);
  partidos=partidos.filter(m=>m.p1!==pid&&m.p2!==pid);
  await supabaseClient.from('partidos').delete().or(`pareja1_id.eq.${pid},pareja2_id.eq.${pid}`);
  await supabaseClient.from('parejas').delete().eq('id',pid);
  await regenerateMatchesForGroup(cat,grupos[cat][gi].id);
  renderA();showToast('Eliminado');
}
async function addP(cat,gi){
  const id='p'+Date.now();
  const newPair={id,j1:'Jugadora 1',j2:'Jugadora 2'};
  grupos[cat][gi].parejas.push(newPair);
  await supabaseClient.from('parejas').insert({
    id,categoria:cat,grupo_id:grupos[cat][gi].id,jugadora1:'Jugadora 1',jugadora2:'Jugadora 2',cardales:false
  });
  await regenerateMatchesForGroup(cat,grupos[cat][gi].id);
  renderA();showToast('Pareja agregada');
}
async function movePair(cat,gi,pi,target){
  const[targetCat,targetGid]=target.split('|');
  if(targetCat===cat&&grupos[cat][gi].id===targetGid)return;
  const pair=grupos[cat][gi].parejas[pi];
  const oldGid=grupos[cat][gi].id;
  grupos[cat][gi].parejas.splice(pi,1);
  const targetGroup=grupos[targetCat].find(g=>g.id===targetGid);
  targetGroup.parejas.push(pair);

  await supabaseClient.from('parejas').update({categoria:targetCat,grupo_id:targetGid}).eq('id',pair.id);
  await supabaseClient.from('partidos').delete().or(`pareja1_id.eq.${pair.id},pareja2_id.eq.${pair.id}`);
  partidos=partidos.filter(m=>m.p1!==pair.id&&m.p2!==pair.id);

  await regenerateMatchesForGroup(cat,oldGid);
  await regenerateMatchesForGroup(targetCat,targetGid);

  state.adminPairsGroup[cat]=grupos[cat][gi].id;
  renderA();
  showToast(`Pareja movida a ${targetCat==='1era'?'1ra':targetCat==='2da'?'2da':'3ra'} - Grupo ${targetGid}`);
}
async function regenerateMatchesForGroup(cat,gid){
  const g=grupos[cat].find(x=>x.id===gid);
  if(!g)return;
  const newMatches=[];
  g.parejas.forEach((p1,i)=>{
    g.parejas.forEach((p2,j)=>{
      if(j<=i)return;
      const exists=partidos.find(m=>m.grupoId===gid&&((m.p1===p1.id&&m.p2===p2.id)||(m.p1===p2.id&&m.p2===p1.id)));
      if(!exists){
        const newM={id:`m_${gid}_${p1.id}_${p2.id}`,cat,grupoId:gid,p1:p1.id,p2:p2.id,sets:[],played:false,simulated:false,phase:'grupos'};
        partidos.push(newM);
        newMatches.push({
          id:newM.id,categoria:cat,grupo_id:gid,pareja1_id:p1.id,pareja2_id:p2.id,sets:[],jugado:false,simulado:false
        });
      }
    });
  });
  if(newMatches.length){
    await supabaseClient.from('partidos').insert(newMatches);
  }
}

// ====================================================
// CANCHAS Y HORARIOS — ahora muestra TODAS las categorías juntas
// ====================================================
function renderSectionSched(){
  // Reunir partidos pendientes de grupos de las 3 categorías
  let allMatches=[];
  ["1era","2da","3era"].forEach(cat=>{
    const groupMatches=partidos.filter(m=>m.cat===cat&&!m.played).map(m=>({...m,catLabel:CAT_LABELS[cat]}));
    allMatches=allMatches.concat(groupMatches);
    if(playoffData[cat]){
      const poMatches=playoffData[cat].rounds.flatMap(r=>
        r.matches.filter(m=>!m.sets||!m.sets.length).map(m=>({...m,isPlayoff:true,roundName:r.name,cat,catLabel:CAT_LABELS[cat]}))
      );
      allMatches=allMatches.concat(poMatches);
    }
  });

  let html=`<div class="ibar">Asigná cancha y hora a los partidos de las 3 categorías. Si todavía no sabés la hora, elegí "A continuación de" y seleccioná qué partido tiene que terminar antes.</div>`;
  if(!allMatches.length) return html+'<div class="empty">No hay partidos pendientes de programar.</div>';

  const usedAsReference=new Set(
    allMatches
      .filter(m=>getSched(m.id).after && getSched(m.id).afterMatchId)
      .map(m=>getSched(m.id).afterMatchId)
  );
  const allMatchOptions=allMatches.map(m=>{
    const label=m.isPlayoff
      ? `Cat. ${m.catLabel} — ${m.roundName}: ${m.p1?pJ1(m.p1):'?'} vs ${m.p2?pJ1(m.p2):'?'}`
      : `Cat. ${m.catLabel} — Grupo ${m.grupoId}: ${pJ1(m.p1)} vs ${pJ1(m.p2)}`;
    return{id:m.id,label};
  });

  html+=`<div class="sched-grid">`;
  allMatches.forEach(m=>{
    const sched=getSched(m.id);
    const label=m.isPlayoff?`Cat. ${m.catLabel} — ${m.roundName}`:`Cat. ${m.catLabel} — Grupo ${m.grupoId}`;
    const n1=m.p1?(pJ1(m.p1)+' / '+pJ2(m.p1)):'Por definir';
    const n2=m.p2?(pJ1(m.p2)+' / '+pJ2(m.p2)):'Por definir';
    const otherOpts=allMatchOptions
      .filter(o=>o.id!==m.id)
      .filter(o=>!usedAsReference.has(o.id) || sched.afterMatchId===o.id)
      .map(o=>`<option value="${o.id}" ${sched.afterMatchId===o.id?'selected':''}>${o.label}</option>`).join('');
    html+=`<div class="sched-card">
      <div class="sched-card-hdr">${label}</div>
      <div class="sched-card-body">
        <div class="sched-card-vs"><strong>${n1}</strong><br><span style="color:var(--gray-light);">vs</span><br><strong>${n2}</strong></div>
        <div class="sched-mini-row">
          <div><label style="margin-top:0;font-size:11px;">Cancha</label>
            <input type="number" min="1" max="20" placeholder="N°" id="cancha_${m.id}" value="${sched.cancha}" onchange="saveSchedGeneric('${m.id}')"></div>
          <div><label style="margin-top:0;font-size:11px;">Hora</label>
            <input type="time" id="hora_${m.id}" value="${sched.hora}" ${sched.after?'disabled':''} onchange="saveSchedGeneric('${m.id}')"></div>
        </div>
        <div class="acont-after-toggle">
          <input type="checkbox" id="after_${m.id}" ${sched.after?'checked':''} onchange="toggleAfter('${m.id}')">
          <label style="margin:0;" for="after_${m.id}">A continuación de</label>
        </div>
        ${sched.after?`<div style="margin-top:8px;"><label style="margin-top:0;font-size:11px;">Partido que tiene que terminar antes</label>
          <select id="afterMatch_${m.id}" onchange="saveAfterMatch('${m.id}')">
            <option value="">— Elegí un partido —</option>
            ${otherOpts}
          </select>
        </div>`:''}
      </div>
    </div>`;
  });
  html+=`</div>`;
  return html;
}
async function saveSchedToDB(mId){
  const s=getSched(mId);
  await supabaseClient.from('horarios').upsert({
    partido_id:mId,cancha:s.cancha,hora:s.hora,a_continuacion:s.after,a_continuacion_de:s.afterMatchId
  });
}
async function saveSchedGeneric(mId){
  const c=document.getElementById(`cancha_${mId}`)?.value||'';
  const h=document.getElementById(`hora_${mId}`)?.value||'';
  const cur=getSched(mId);
  matchSchedule[mId]={...cur,cancha:c,hora:h};
  await saveSchedToDB(mId);
  renderJContent();showToast('Horario guardado');
}
// El checkbox queda tildado al instante (estado del DOM tras el click del usuario).
// Guardamos en memoria y en la base, y si algo falla avisamos por toast en vez
// de fallar en silencio (lo cual antes podía dejar el checkbox desincronizado
// al volver a renderizar).
async function toggleAfter(mId){
  const checkboxEl=document.getElementById(`after_${mId}`);
  const checked=checkboxEl.checked;
  const cur=getSched(mId);
  matchSchedule[mId]={...cur,after:checked,hora:checked?'':cur.hora,afterMatchId:checked?cur.afterMatchId:''};
  try{
    await saveSchedToDB(mId);
  }catch(e){
    console.error('Error guardando en Supabase:',e);
    showToast('No se pudo guardar — revisá tu conexión');
  }
  renderA();
  renderJContent();
}
async function saveAfterMatch(mId){
  const cur=getSched(mId);
  const val=document.getElementById(`afterMatch_${mId}`).value;
  matchSchedule[mId]={...cur,afterMatchId:val};
  await saveSchedToDB(mId);
  renderA();renderJContent();showToast('Vinculado al partido anterior');
}

function renderSectionResults(cat){
  const pend=partidos.filter(m=>m.cat===cat&&!m.played&&m.phase==='grupos');
  const done=partidos.filter(m=>m.cat===cat&&m.played&&m.phase==='grupos');
  const hasSim=partidos.some(m=>m.cat===cat&&m.simulated);
  let html=`<div class="ibar">Anotá el resultado del set único (o games, ej: 6-4, 4-2). Supertiebreak: 1-0.</div>`;
  html+=`<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:14px;">
    ${pend.length>0?`<button class="btn btn-grn btn-sm" onclick="simularPartidos('${cat}')">Simular ${pend.length} pendientes</button>`:''}
    ${hasSim?`<button class="btn btn-red btn-sm" onclick="limpiarSim('${cat}')">Limpiar simulación</button>`:''}
  </div>`;
  if(!pend.length&&!done.length)return html+'<div class="empty">No hay partidos.</div>';
  if(pend.length){
    html+=`<div style="font-size:12px;font-weight:500;color:var(--pink);margin-bottom:8px;">Pendientes</div><div class="sched-grid">`;
    pend.forEach(m=>{html+=renderResInput(m);});
    html+=`</div>`;
  }
  if(done.length){
    html+=`<div style="font-size:12px;font-weight:500;color:var(--gray);margin:14px 0 8px;">Cargados</div><div class="sched-grid">`;
    done.forEach(m=>{html+=renderResDone(m);});
    html+=`</div>`;
  }
  return html;
}
function renderResInput(m){
  const n1=pJ1(m.p1)+' / '+pJ2(m.p1),n2=pJ1(m.p2)+' / '+pJ2(m.p2);
  return `<div class="sched-card">
    <div class="sched-card-hdr">Grupo ${m.grupoId}</div>
    <div class="sched-card-body">
      <div class="sched-card-vs"><strong>${n1}</strong><br><span style="color:var(--gray-light);">vs</span><br><strong>${n2}</strong></div>
      <div class="sched-mini-row" style="margin-bottom:8px;">
        <div><label style="margin-top:0;font-size:11px;">Games/Set</label><div style="display:flex;gap:4px;align-items:center;"><input type="number" id="s1a_${m.id}" min="0" max="7" placeholder="0" style="text-align:center;"><span style="color:var(--gray);">-</span><input type="number" id="s1b_${m.id}" min="0" max="7" placeholder="0" style="text-align:center;"></div></div>
        <div><label style="margin-top:0;font-size:11px;">STB</label><div style="display:flex;gap:4px;align-items:center;"><input type="number" id="s3a_${m.id}" min="0" max="1" placeholder="-" style="text-align:center;"><span style="color:var(--gray);">-</span><input type="number" id="s3b_${m.id}" min="0" max="1" placeholder="-" style="text-align:center;"></div></div>
      </div>
      <button class="btn btn-pink btn-sm btn-full" onclick="saveRes('${m.id}')">Confirmar</button>
    </div>
  </div>`;
}
function renderResDone(m){
  const n1=pJ1(m.p1)+' / '+pJ2(m.p1),n2=pJ1(m.p2)+' / '+pJ2(m.p2);
  let w1=0,w2=0;m.sets.forEach(s=>{if(s[0]>s[1])w1++;else w2++;});
  const stag=m.simulated?` <span class="sim-badge">simulado</span>`:'';
  return `<div class="sched-card">
    <div class="sched-card-hdr">Grupo ${m.grupoId}${stag}</div>
    <div class="sched-card-body">
      <div class="sched-card-vs" style="margin-bottom:6px;"><strong style="color:${w1>w2?'var(--pink)':'inherit'}">${n1}</strong><br><span style="color:var(--gray-light);">vs</span><br><strong style="color:${w2>w1?'var(--pink)':'inherit'}">${n2}</strong></div>
      <div style="text-align:center;font-size:13px;font-weight:500;color:var(--pink);margin-bottom:8px;">${m.sets.map(s=>s[0]+'-'+s[1]).join(' ')}</div>
      <button class="btn btn-red btn-sm btn-full" onclick="delRes('${m.id}')">Borrar</button>
    </div>
  </div>`;
}
async function saveRes(mId){
  const m=partidos.find(p=>p.id===mId);if(!m)return;
  const sets=[];
  const a=document.getElementById(`s1a_${mId}`)?.value;
  const b=document.getElementById(`s1b_${mId}`)?.value;
  if(a!==''&&b!==''&&a!==undefined&&b!==undefined){
    sets.push([parseInt(a)||0,parseInt(b)||0]);
  }
  const sa=document.getElementById(`s3a_${mId}`)?.value;
  const sb=document.getElementById(`s3b_${mId}`)?.value;
  if(sa!==''&&sb!==''&&sa!==undefined&&(sa||sb)){
    const na=parseInt(sa)||0,nb=parseInt(sb)||0;
    if(na+nb>0)sets.push([na>nb?1:0,na>nb?0:1]);
  }
  if(!sets.length){showToast('Ingresá un resultado');return;}
  let w1=0,w2=0;sets.forEach(s=>{if(s[0]>s[1])w1++;else w2++;});
  if(w1===w2){showToast('Debe haber un ganador');return;}
  m.sets=sets;m.played=true;m.simulated=false;
  await supabaseClient.from('partidos').update({sets,jugado:true,simulado:false}).eq('id',mId);
  renderA();renderJContent();showToast('Resultado guardado ✓');
}
async function delRes(mId){
  const m=partidos.find(p=>p.id===mId);if(!m)return;
  m.sets=[];m.played=false;m.simulated=false;
  await supabaseClient.from('partidos').update({sets:[],jugado:false,simulado:false}).eq('id',mId);
  renderA();showToast('Borrado');
}
async function simularPartidos(cat){
  const pending=partidos.filter(m=>m.cat===cat&&!m.played&&m.phase==="grupos");
  const scores=[[6,2],[6,3],[6,4],[5,4],[4,2],[5,3]];
  const r=()=>scores[Math.floor(Math.random()*scores.length)];
  const updates=[];
  pending.forEach(m=>{
    const s1=r(),f=()=>Math.random()>.5;
    let sets=[f()?s1:[s1[1],s1[0]]];
    m.sets=sets;m.played=true;m.simulated=true;
    updates.push({id:m.id,sets,jugado:true,simulado:true});
  });
  for(const u of updates){
    await supabaseClient.from('partidos').update({sets:u.sets,jugado:true,simulado:true}).eq('id',u.id);
  }
  renderA();renderJContent();showToast(`Simulados ${pending.length} partidos ✓`);
}
async function limpiarSim(cat){
  const sims=partidos.filter(m=>m.cat===cat&&m.simulated);
  sims.forEach(m=>{m.sets=[];m.played=false;m.simulated=false;});
  for(const m of sims){
    await supabaseClient.from('partidos').update({sets:[],jugado:false,simulado:false}).eq('id',m.id);
  }
  renderA();renderJContent();showToast('Simulación limpiada');
}

function renderSectionPlayoff(cat){
  const mode=playoffMode[cat];
  let html=`<div class="ibar">Elegí el formato de playoff. Se ajustan automáticamente los clasificados hasta completar el cuadro, evitando que dos parejas del mismo grupo se enfrenten en cuartos.</div>`;
  html+=`<div class="toggle-group">
    <button class="toggle-btn ${mode==='cuartos'?'active':''}" onclick="setPlayoffMode('${cat}','cuartos')">Cuartos de final (8)</button>
    <button class="toggle-btn ${mode==='semis'?'active':''}" onclick="setPlayoffMode('${cat}','semis')">Semifinales (4)</button>
  </div>`;

  const{qualFirsts,qualSeconds,cfg}=getSeeds(cat);
  const po=playoffData[cat];
  const isPreview=!po||po.isPreview;

  html+=`<div style="font-size:12px;font-weight:500;color:var(--pink);margin-bottom:8px;">Clasificados actuales (${qualFirsts.length+qualSeconds.length}/${cfg.total})</div>`;
  html+=`<div class="grupo"><div class="table-scroll"><table class="grupo-table"><thead><tr><th>#</th><th class="thl">Pareja</th><th>Grupo</th><th>Vía</th></tr></thead><tbody>`;
  [...qualFirsts,...qualSeconds].forEach((s,i)=>{
    const shade=i%2===1;
    html+=`<tr class="${shade?'shade':''}"><td><span class="pos-badge ${i<qualFirsts.length?'pos-1':'pos-2'}">${i+1}</span></td><td class="tdl"><div class="pnames"><span>${s.j1}</span><span>${s.j2}</span></div></td><td>${s.grupoId}</td><td>${i<qualFirsts.length?'1°':'Mejor 2°'}</td></tr>`;
  });
  html+=`</tbody></table></div></div>`;

  if(qualFirsts.length+qualSeconds.length<cfg.total){
    html+=`<div class="ibar" style="margin-top:10px;">Todavía faltan resultados de grupos para completar los ${cfg.total} clasificados.</div>`;
  }

  html+=`<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;">
    <button class="btn btn-out btn-sm" onclick="generarPreview('${cat}')">${isPreview?'Generar / actualizar':'Actualizar'} vista previa</button>
    ${po?`<button class="btn btn-blk btn-sm" onclick="confirmarPlayoff('${cat}')">Confirmar cuadro definitivo</button>`:''}
  </div>`;

  if(po){
    html+=`<div style="margin-top:1.2rem;">`;
    if(po.isPreview) html+=`<div class="preview-banner">⚠️ Vista previa — todavía podés cambiar parejas y formato antes de confirmar.</div>`;
    html+=renderBracketTree(po);
    const champ=getChampion(cat);
    if(champ){
      const p=getP(champ);
      html+=`<div class="champion-card">
        <div class="medal">🥇</div>
        <div class="ctext">
          <div class="clabel">Campeón</div>
          <div class="cnames">${p?p.j1:''} / ${p?p.j2:''}</div>
        </div>
      </div>`;
    }
    html+=`</div>`;

    html+=`<div style="margin-top:1.5rem;font-size:12px;font-weight:500;color:var(--pink);">Editar cruces y resultados</div>`;
    const allPs=grupos[cat].flatMap(g=>g.parejas);
    po.rounds.forEach((r,ri)=>{
      html+=`<div style="font-size:12px;font-weight:500;color:var(--gray);margin:10px 0 6px;">${r.name}</div>`;
      r.matches.forEach((m,mi)=>{
        const n1=m.p1?pNombre(m.p1):'Por definir',n2=m.p2?pNombre(m.p2):'Por definir';
        const opts=p=>allPs.map(x=>`<option value="${x.id}" ${m[p]===x.id?'selected':''}>${x.j1} / ${x.j2}</option>`).join('');
        html+=`<div style="padding:10px;background:#fafafa;border:1.5px solid #ddd;border-radius:10px;margin-bottom:8px;">
          <div style="font-size:11px;color:var(--gray-light);margin-bottom:6px;">${r.name} — Cruce ${mi+1}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
            <div><label style="margin-top:0;">Pareja A</label><select onchange="editPOT('${cat}',${ri},${mi},'p1',this.value)"><option value="">— Por definir —</option>${opts('p1')}</select></div>
            <div><label style="margin-top:0;">Pareja B</label><select onchange="editPOT('${cat}',${ri},${mi},'p2',this.value)"><option value="">— Por definir —</option>${opts('p2')}</select></div>
          </div>`;
        if(m.sets&&m.sets.length){
          let w1=0,w2=0;m.sets.forEach(s=>{if(s[0]>s[1])w1++;else w2++;});
          html+=`<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 8px;background:#fff;border:1px solid #eee;border-radius:8px;font-size:12px;flex-wrap:wrap;gap:6px;">
            <span><span style="color:var(--pink);font-weight:500;">${w1>w2?n1:n2}</span> — ${m.sets.map(s=>s[0]+'-'+s[1]).join(' ')}</span>
            <button class="btn btn-red btn-sm" onclick="delPO('${cat}',${ri},${mi})">Borrar</button>
          </div>`;
        }else{
          html+=`<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
            <div style="display:flex;gap:4px;align-items:center;"><input type="number" id="po_s1a_${ri}_${mi}" min="0" max="7" placeholder="0" style="width:50px;text-align:center;"><span style="color:var(--gray);">-</span><input type="number" id="po_s1b_${ri}_${mi}" min="0" max="7" placeholder="0" style="width:50px;text-align:center;"></div>
            <div style="display:flex;gap:4px;align-items:center;font-size:11px;"><span style="color:var(--gray);">STB</span><input type="number" id="po_s3a_${ri}_${mi}" min="0" max="1" placeholder="-" style="width:50px;text-align:center;"><span style="color:var(--gray);">-</span><input type="number" id="po_s3b_${ri}_${mi}" min="0" max="1" placeholder="-" style="width:50px;text-align:center;"></div>
            <button class="btn btn-pink btn-sm" onclick="savePO('${cat}',${ri},${mi})">Confirmar</button>
          </div>`;
        }
        html+=`</div>`;
      });
    });
  }
  return html;
}
async function setPlayoffMode(cat,mode){
  playoffMode[cat]=mode;
  await supabaseClient.from('configuracion').upsert({clave:'playoff_mode',valor:playoffMode});
  renderA();
}
function buildSeedingNoGroupClash(seeds, slotsCount){
  const template = slotsCount===8 ? [[0,7],[3,4],[1,6],[2,5]] : [[0,3],[1,2]];
  let arr=[...seeds];
  function hasClash(a){
    return template.some(([i,j])=> a[i] && a[j] && a[i].grupoId===a[j].grupoId);
  }
  if(!hasClash(arr)) return arr;
  for(let attempt=0; attempt<50 && hasClash(arr); attempt++){
    for(const [i,j] of template){
      if(arr[i]&&arr[j]&&arr[i].grupoId===arr[j].grupoId){
        let swapped=false;
        for(let k=0;k<arr.length;k++){
          if(k===i||k===j)continue;
          const kPair=template.find(p=>p.includes(k));
          const kPartner=kPair[0]===k?kPair[1]:kPair[0];
          if(arr[k] && arr[kPartner] && arr[i].grupoId!==arr[k].grupoId && (!arr[kPartner]||arr[kPartner].grupoId!==arr[j].grupoId)){
            const tmp=arr[j];arr[j]=arr[k];arr[k]=tmp;
            swapped=true;
            break;
          }
        }
        if(swapped)break;
      }
    }
  }
  return arr;
}
function buildRoundsForMode(cat,seeds){
  const cfg=getPlayoffConfig(cat);
  const seeded=buildSeedingNoGroupClash(seeds, cfg.total);
  const fill=i=>seeded[i]?.id||null;
  if(cfg.total===4){
    return[
      {name:'Semifinales',matches:[
        {id:'sf1',p1:fill(0),p2:fill(3),sets:[],winner:null},
        {id:'sf2',p1:fill(1),p2:fill(2),sets:[],winner:null},
      ]},
      {name:'Final',matches:[{id:'f1',p1:null,p2:null,sets:[],winner:null}]},
    ];
  }
  return[
    {name:'Cuartos de final',matches:[
      {id:'qf1',p1:fill(0),p2:fill(7),sets:[],winner:null},
      {id:'qf2',p1:fill(3),p2:fill(4),sets:[],winner:null},
      {id:'qf3',p1:fill(1),p2:fill(6),sets:[],winner:null},
      {id:'qf4',p1:fill(2),p2:fill(5),sets:[],winner:null},
    ]},
    {name:'Semifinales',matches:[
      {id:'sf1',p1:null,p2:null,sets:[],winner:null},
      {id:'sf2',p1:null,p2:null,sets:[],winner:null},
    ]},
    {name:'Final',matches:[{id:'f1',p1:null,p2:null,sets:[],winner:null}]},
  ];
}
async function generarPreview(cat){
  const{qualFirsts,qualSeconds}=getSeeds(cat);
  const seeds=[...qualFirsts,...qualSeconds];
  const rounds=buildRoundsForMode(cat,seeds);
  playoffData[cat]={rounds,isPreview:true};
  await supabaseClient.from('playoff').upsert({categoria:cat,datos:{rounds},es_vista_previa:true});
  renderA();renderJContent();showToast('Vista previa generada');
}
async function confirmarPlayoff(cat){
  if(playoffData[cat]) playoffData[cat].isPreview=false;
  await supabaseClient.from('playoff').upsert({categoria:cat,datos:{rounds:playoffData[cat].rounds},es_vista_previa:false});
  renderA();renderJContent();showToast('Cuadro confirmado ✓');
}
async function editPOT(cat,ri,mi,f,v){
  playoffData[cat].rounds[ri].matches[mi][f]=v||null;
  await savePlayoffToDB(cat);
  renderA();renderJContent();showToast('Guardado');
}
async function savePlayoffToDB(cat){
  await supabaseClient.from('playoff').upsert({categoria:cat,datos:{rounds:playoffData[cat].rounds},es_vista_previa:playoffData[cat].isPreview});
}
async function savePO(cat,ri,mi){
  const m=playoffData[cat].rounds[ri].matches[mi];const sets=[];
  const a=document.getElementById(`po_s1a_${ri}_${mi}`)?.value;
  const b=document.getElementById(`po_s1b_${ri}_${mi}`)?.value;
  if(a!==''&&b!==''&&a!==undefined)sets.push([parseInt(a)||0,parseInt(b)||0]);
  const sa=document.getElementById(`po_s3a_${ri}_${mi}`)?.value;
  const sb=document.getElementById(`po_s3b_${ri}_${mi}`)?.value;
  if(sa!==''&&sb!==''&&sa!==undefined&&(sa||sb)){
    const na=parseInt(sa)||0,nb=parseInt(sb)||0;
    if(na+nb>0)sets.push([na>nb?1:0,na>nb?0:1]);
  }
  if(!sets.length){showToast('Ingresá un resultado');return;}
  let w1=0,w2=0;sets.forEach(s=>{if(s[0]>s[1])w1++;else w2++;});
  if(w1===w2){showToast('Debe haber ganador');return;}
  m.sets=sets;m.winner=w1>w2?m.p1:m.p2;
  const nr=playoffData[cat].rounds[ri+1];
  if(nr){const nm=nr.matches[Math.floor(mi/2)];if(nm){if(mi%2===0)nm.p1=m.winner;else nm.p2=m.winner;}}
  await savePlayoffToDB(cat);
  renderA();renderJContent();showToast('Resultado guardado ✓');
}
async function delPO(cat,ri,mi){
  const m=playoffData[cat].rounds[ri].matches[mi];m.sets=[];m.winner=null;
  await savePlayoffToDB(cat);
  renderA();renderJContent();showToast('Borrado');
}

function showToast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200);}

// ====================================================
// ARRANCAR LA APP
// ====================================================
initApp();
