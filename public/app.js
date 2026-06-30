// ====================================================
// TENIS Y NOSOTRAS x CLUB24 — Lógica de la app
// ====================================================

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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

const TB_LABELS={pts:'Puntos',bal:'Diferencia de games',gg:'Games ganados',h2h:'Enfrentamiento directo'};
const CAT_LABELS={"1era":"1era","2da":"2da","3era":"3era"};

let grupos={"1era":[],"2da":[],"3era":[]};
let partidos=[];
let matchSchedule={};
let playoffData={"1era":null,"2da":null,"3era":null};
let playoffMode={"1era":"semis","2da":"cuartos","3era":"cuartos"};
let tiebreakOrder=["pts","bal","gg","h2h"];
let reglamentoText="";
let clasificacionMode={"1era":"1ro_mejor1","2da":"1ro_mejor1","3era":"1ro_mejor1"};
const CLASIF_LABELS={"1ros":"Todos los 1º","1ros_2dos":"Todos los 1º y 2º","1ro_mejor1":"Todos los 1º y el mejor 2º","1ro_mejor2":"Todos los 1º y los 2 mejores 2º","1ro_mejor3":"Todos los 1º y los 3 mejores 2º"};
let torneoInfo={emoji:"🎾",nombre:"Tenis y Nosotras × club24",subtitulo:"Torneo Americano de Damas — 26 de Junio · Los Cardales Country Club"};
let sponsors=[];

const state={mainView:"jugadoras",cat:"1era",adminCat:"1era",subTabJ:"grupos",liveCat:"1era",liveSubTab:"grupos",adminSection:"pairs",adminPairsGroup:{},adminUnlocked:false,schedSubTab:"grupos",proximosFilter:"horario",proximosBuscarNombre:""};
["1era","2da","3era"].forEach(c=>{state.adminPairsGroup[c]=null;});

async function initApp(){
  try{
    const {data:existingPairs,error:checkErr}=await supabaseClient.from('parejas').select('id').limit(1);
    if(checkErr){ showFatalError("No se pudo conectar con la base de datos."); return; }
    if(!existingPairs||existingPairs.length===0){ await seedInitialData(); }
    await loadAllData();
    renderMainTabs();
    renderJ();
  }catch(e){
    console.error(e);
    showFatalError("Hubo un error cargando la app.");
  }
}

function showFatalError(msg){ document.getElementById('app').innerHTML=`<div class="loading" style="color:#dc2626;padding:2rem 1.2rem;">${msg}</div>`; }

async function seedInitialData(){
  let pid=0; const pairsToInsert=[];
  ["1era","2da","3era"].forEach(cat=>{
    GRUPOS_INICIALES[cat].forEach(g=>{
      g.parejas.forEach(p=>{
        pairsToInsert.push({id:`p${pid++}`,categoria:cat,grupo_id:g.id,jugadora1:p[0],jugadora2:p[1],cardales:p[2]===1});
      });
    });
  });
  await supabaseClient.from('parejas').insert(pairsToInsert);

  let pid2=0; const tempGrupos={"1era":[],"2da":[],"3era":[]};
  ["1era","2da","3era"].forEach(cat=>{
    tempGrupos[cat]=GRUPOS_INICIALES[cat].map(g=>({id:g.id,parejas:g.parejas.map(p=>({id:`p${pid2++}`,j1:p[0],j2:p[1]}))}));
  });
  const matchesToInsert=[];
  ["1era","2da","3era"].forEach(cat=>{
    tempGrupos[cat].forEach(g=>{
      g.parejas.forEach((p1,i)=>{
        g.parejas.forEach((p2,j)=>{
          if(j<=i)return;
          matchesToInsert.push({id:`m_${g.id}_${p1.id}_${p2.id}`,categoria:cat,grupo_id:g.id,pareja1_id:p1.id,pareja2_id:p2.id,sets:[],jugado:false,simulado:false});
        });
      });
    });
  });
  await supabaseClient.from('partidos').insert(matchesToInsert);
  await supabaseClient.from('configuracion').insert([{clave:'playoff_mode',valor:{"1era":"semis","2da":"cuartos","3era":"cuartos"}},{clave:'tiebreak_order',valor:["pts","bal","gg","h2h"]},{clave:'clasificacion_mode',valor:{"1era":"1ro_mejor1","2da":"1ro_mejor1","3era":"1ro_mejor1"}}]);
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
    if(!groupMap[key]){ groupMap[key]={id:p.grupo_id,parejas:[]}; grupos[p.categoria].push(groupMap[key]); }
    groupMap[key].parejas.push({id:p.id,j1:p.jugadora1,j2:p.jugadora2,cardales:p.cardales});
  });
  partidos=(matchesData||[]).map(m=>({id:m.id,cat:m.categoria,grupoId:m.grupo_id,p1:m.pareja1_id,p2:m.pareja2_id,sets:m.sets||[],played:m.jugado,simulated:m.simulado,phase:'grupos'}));
  matchSchedule={};
  (schedData||[]).forEach(s=>{ matchSchedule[s.partido_id]={cancha:s.cancha||'',hora:s.hora||'',after:s.a_continuacion||false,afterMatchId:s.a_continuacion_de||''}; });
  playoffData={"1era":null,"2da":null,"3era":null};
  (playoffRows||[]).forEach(row=>{ playoffData[row.categoria]={...row.datos,isPreview:row.es_vista_previa}; });
  (configRows||[]).forEach(row=>{
    if(row.clave==='playoff_mode') playoffMode={...playoffMode,...row.valor};
    if(row.clave==='tiebreak_order') tiebreakOrder=row.valor;
    if(row.clave==='reglamento') reglamentoText=row.valor||'';
    if(row.clave==='clasificacion_mode') clasificacionMode={...clasificacionMode,...row.valor};
    if(row.clave==='torneo_info') torneoInfo={...torneoInfo,...row.valor};
    if(row.clave==='sponsors') sponsors=row.valor||[];
    if(row.clave==='grupos_vacios'){
      const vacios=row.valor||{};
      ["1era","2da","3era"].forEach(c=>{ (vacios[c]||[]).forEach(gid=>{ if(!grupos[c].some(g=>g.id===gid)){ grupos[c].push({id:gid,parejas:[]}); } }); });
    }
  });
  Object.keys(grupos).forEach(cat=>{ grupos[cat].sort((a,b)=>a.id.localeCompare(b.id)); });
  ["1era","2da","3era"].forEach(c=>{ if(grupos[c].length && !state.adminPairsGroup[c]) state.adminPairsGroup[c]=grupos[c][0].id; });
}

async function saveGruposVacios(){
  const vacios={};
  ["1era","2da","3era"].forEach(c=>{ vacios[c]=grupos[c].filter(g=>g.parejas.length===0).map(g=>g.id); });
  await supabaseClient.from('configuracion').upsert({clave:'grupos_vacios',valor:vacios});
}

function getP(id){for(const cat of["1era","2da","3era"])for(const g of grupos[cat]){const p=g.parejas.find(x=>x.id===id);if(p)return p;}return null;}
function pJ1(id){const p=getP(id);return p?p.j1:'?';}
function pJ2(id){const p=getP(id);return p?p.j2:'?';}
function pNombre(id){const p=getP(id);return p?`${p.j1} / ${p.j2}`:id;}

function getPlayoffConfig(cat){
  const mode=playoffMode[cat];
  if(mode==='semis') return{total:4,roundName:'semis'};
  return{total:8,roundName:'cuartos'};
}
function getCutPos(cat){ return clasificacionMode[cat]==='1ros_2dos'?2:1; }
function getCuposMejoresSegundos(cat){
  const mode=clasificacionMode[cat];
  if(mode==='1ros')return 0;
  if(mode==='1ros_2dos')return null; 
  if(mode==='1ro_mejor1')return 1;
  if(mode==='1ro_mejor2')return 2;
  if(mode==='1ro_mejor3')return 3;
  return 1;
}

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
  let w1=0,w2=0; m.sets.forEach(s=>{if(s[0]>s[1])w1++;else w2++;});
  const aIsP1=m.p1===pairAId;
  const aWon=aIsP1?w1>w2:w2>w1;
  return aWon?1:-1;
}
function ordenSorteo(bloque){ return[...bloque].sort((a,b)=>a.id.localeCompare(b.id)); }
function ordenarGrupoConDesempate(stats,gId){
  const porPuntos={};
  stats.forEach(p=>{ if(!porPuntos[p.pts])porPuntos[p.pts]=[]; porPuntos[p.pts].push(p); });
  const puntosOrdenados=Object.keys(porPuntos).map(Number).sort((a,b)=>b-a);
  let resultado=[];
  puntosOrdenados.forEach(pts=>{ resultado=resultado.concat(desempatarBloque(porPuntos[pts],gId)); });
  return resultado;
}
function desempatarBloque(bloque,gId){
  if(bloque.length===1)return bloque;
  if(bloque.length===2){
    const r=h2hResult(bloque[0].id,bloque[1].id,gId);
    if(r===1)return[bloque[0],bloque[1]];
    if(r===-1)return[bloque[1],bloque[0]];
    return bloque;
  }
  const porBalance={};
  bloque.forEach(p=>{ if(!porBalance[p.bal])porBalance[p.bal]=[]; porBalance[p.bal].push(p); });
  const balOrdenados=Object.keys(porBalance).map(Number).sort((a,b)=>b-a);
  let resultado=[];
  balOrdenados.forEach(bal=>{
    const subBloque=porBalance[bal];
    if(subBloque.length===1){ resultado=resultado.concat(subBloque); }
    else if(subBloque.length===2){
      const r=h2hResult(subBloque[0].id,subBloque[1].id,gId);
      if(r===1)resultado=resultado.concat([subBloque[0],subBloque[1]]);
      else if(r===-1)resultado=resultado.concat([subBloque[1],subBloque[0]]);
      else resultado=resultado.concat(subBloque); 
    }else{
      resultado=resultado.concat(ordenSorteo(subBloque));
    }
  });
  return resultado;
}
function getStats(gId,cat){ return ordenarGrupoConDesempate(getStatsRaw(gId,cat),gId); }
function getAdj(p,gId,cat){
  const g=grupos[cat].find(g=>g.id===gId);
  if(!g||g.parejas.length<=4)return p;
  const st=getStats(gId,cat); const lastId=st[st.length-1].id;
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
function compararMejoresSegundos(a,b){
  if(a.pts!==b.pts)return b.pts-a.pts;
  if(a.bal!==b.bal)return b.bal-a.bal;
  if(a.gg!==b.gg)return b.gg-a.gg;
  if(a.gp!==b.gp)return a.gp-b.gp; 
  return 0; 
}
function ordenarMejoresConSorteo(lista){
  const ordenada=[...lista].sort(compararMejoresSegundos);
  let resultado=[]; let i=0;
  while(i<ordenada.length){
    let j=i+1;
    while(j<ordenada.length&&compararMejoresSegundos(ordenada[i],ordenada[j])===0)j++;
    const bloque=ordenada.slice(i,j);
    resultado=resultado.concat(bloque.length>1?ordenSorteo(bloque):bloque);
    i=j;
  }
  return resultado;
}
function getSeeds(cat){
  const cfg=getPlayoffConfig(cat);
  const firsts=[],seconds=[];
  grupos[cat].forEach(g=>{
    const st=getStats(g.id,cat);
    if(st[0])firsts.push({...st[0],rank:1,grupoId:g.id});
    if(st[1])seconds.push({...getAdj(st[1],g.id,cat),rank:2,grupoId:g.id});
  });
  const firstsOrdenados=ordenarMejoresConSorteo(firsts);
  const secondsOrdenados=ordenarMejoresConSorteo(seconds);
  const cuposSegundos=getCuposMejoresSegundos(cat);
  let qF,qS;
  if(cuposSegundos===0){ qF=firstsOrdenados.slice(0,cfg.total); qS=[]; }
  else if(cuposSegundos===null){
    qF=firstsOrdenados.slice(0,cfg.total);
    qS=secondsOrdenados.slice(0,Math.max(0,cfg.total-qF.length));
  }else{
    qF=firstsOrdenados.slice(0,firstsOrdenados.length);
    qS=secondsOrdenados.slice(0,cuposSegundos);
  }
  return{firsts:firstsOrdenados,seconds:secondsOrdenados,qualFirsts:qF,qualSeconds:qS,cfg};
}
function getChampion(cat){
  const po=playoffData[cat]; if(!po||po.isPreview)return null;
  const fr=po.rounds[po.rounds.length-1];
  return fr&&fr.matches[0]?.winner ? fr.matches[0].winner : null;
}
function getClasificacionInfo(cat){
  const mode=clasificacionMode[cat], cutPos=getCutPos(cat), cupos=getCuposMejoresSegundos(cat);
  const usaRankingSegundos = mode==='1ro_mejor1'||mode==='1ro_mejor2'||mode==='1ro_mejor3';
  let secondsIds=new Set(), empateEnLimite=false;
  if(usaRankingSegundos){
    const seconds=[];
    grupos[cat].forEach(g=>{ const st=getStats(g.id,cat); if(st[1])seconds.push({...getAdj(st[1],g.id,cat),grupoId:g.id}); });
    const ordenados=ordenarMejoresConSorteo(seconds);
    ordenados.slice(0,cupos).forEach(s=>secondsIds.add(s.id));
    if(ordenados.length>cupos && compararMejoresSegundos(ordenados[cupos-1],ordenados[cupos])===0) empateEnLimite=true;
  }
  return{cutPos,cupos,usaRankingSegundos,secondsIds,empateEnLimite};
}
function getSched(matchId){return matchSchedule[matchId]||{cancha:'',hora:'',after:false,afterMatchId:''};}

function switchMain(v){
  state.mainView=v; renderMainTabs();
  document.getElementById('view-jugadoras').style.display=v==='jugadoras'?'block':'none';
  document.getElementById('view-admin').style.display=v==='admin'?'block':'none';
  if(v==='jugadoras')renderJ();
  if(v==='admin'&&state.adminUnlocked)renderA();
}
function renderMainTabs(){
  document.getElementById('app').innerHTML=`
    <div class="header">
      <div class="header-credit">Cuadro del torneo<br>by @marcosgavassaa</div>
      <h1>${torneoInfo.emoji} ${torneoInfo.nombre}</h1>
      <p>${torneoInfo.subtitulo}</p>
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
  return `<div class="tiebreak-bar"><strong>Orden de desempate en caso de igualdad:</strong><ol>
    <li>Puntos</li><li>Si son 2 empatadas: resultado cara a cara entre ellas</li>
    <li>Si son 3 o más empatadas: diferencia de games de todo el grupo</li>
    <li>Las que sigan empatadas de a 2 en esa diferencia: cara a cara entre ellas</li>
    <li>Si sigue el empate entre 3 o más (ciclo perfecto): sorteo</li></ol></div>`;
}

function renderJ(){
  buildCatTabs('ctj',state.cat,'switchCatJ');
  document.getElementById('stj').innerHTML=`
    <button class="pill-sm ${state.subTabJ==='grupos'?'active':''}" onclick="switchSubJ('grupos')">Grupos</button>
    <button class="pill-sm ${state.subTabJ==='proximos'?'active':''}" onclick="switchSubJ('proximos')">Próximos partidos</button>
    <button class="pill-sm ${state.subTabJ==='reglamento'?'active':''}" onclick="switchSubJ('reglamento')">Reglamento</button>
    <button class="pill-sm ${state.subTabJ==='direcciones'?'active':''}" onclick="switchSubJ('direcciones')">Direcciones</button>
  `;
  renderJContent();
}
function switchCatJ(cat){state.cat=cat;renderJ();}
function switchSubJ(s){state.subTabJ=s;renderJ();}
function renderJContent(){renderPublicView(state.cat,state.subTabJ,'jcontent');}

function renderPublicView(cat,subTab,targetElId){
  const el=document.getElementById(targetElId); if(!el)return;
  let html='';

  if(subTab==='reglamento'){
    html+=`<div class="phase-label">Reglamento del torneo</div><div class="reglamento-card">${renderReglamentoHtml(reglamentoText)}</div>`;
    el.innerHTML=html; return;
  }
  if(subTab==='direcciones'){
    html+=`<div class="phase-label">Cómo llegar</div><a href="https://maps.app.goo.gl/xM1vZvBGgTdRXCtk8" target="_blank" rel="noopener noreferrer" class="btn btn-pink btn-full" style="margin-bottom:1.2rem;text-decoration:none;">📍 Cómo llegar a Cardales</a>`;
    html+=`<div class="map-card"><img src="https://i.imgur.com/966dTmZ.jpeg" alt="Mapa de acceso a las canchas" class="map-img"><div class="map-caption"><span class="map-dash">- - - -</span> dirección a canchas 11-20 caminando</div><div class="map-caption"><span class="map-line">━━━━━</span> dirección a canchas 11-20 en auto</div></div>`;
    el.innerHTML=html; return;
  }
  if(subTab==='proximos'){
    const pendGrupos=partidos.filter(m=>m.cat===cat&&!m.played);
    const pendPlayoff=playoffData[cat] ? playoffData[cat].rounds.flatMap(r=>r.matches.filter(m=>m.p1&&m.p2&&(!m.sets||!m.sets.length)).map(m=>({...m,grupoId:r.name,isPlayoff:true}))) : [];
    let pend=[...pendPlayoff,...pendGrupos];
    pend.sort((a,b)=>{
      const sa=getSched(a.id),sb=getSched(b.id);
      const rank=s=> s.hora ? 0 : (s.after ? 1 : 2);
      const ra=rank(sa),rb=rank(sb);
      if(ra!==rb)return ra-rb;
      if(ra===0)return sa.hora.localeCompare(sb.hora);
      return 0;
    });
    html+=`<div class="phase-label">Próximos partidos</div><div class="toggle-group" style="margin-bottom:14px;"><button class="toggle-btn ${state.proximosFilter==='horario'?'active':''}" onclick="setProximosFilter('horario')">Por horario</button><button class="toggle-btn ${state.proximosFilter==='buscar'?'active':''}" onclick="setProximosFilter('buscar')">Buscar jugadora</button></div>`;
    if(state.proximosFilter==='buscar'){
      const nombresSet=new Set(); grupos[cat].forEach(g=>g.parejas.forEach(p=>{nombresSet.add(p.j1);nombresSet.add(p.j2);}));
      const nombres=[...nombresSet].sort((a,b)=>a.localeCompare(b,'es',{sensitivity:'base'}));
      html+=`<select id="proximosBuscarSelect" onchange="setProximosBuscarNombre(this.value)" style="margin-bottom:14px;"><option value="">— Elegí una jugadora —</option>${nombres.map(n=>`<option value="${n}" ${n===state.proximosBuscarNombre?'selected':''}>${n}</option>`).join('')}</select>`;
    }
    if(!pend.length){ html+='<div class="empty">No hay partidos pendientes.</div>'; }
    else if(state.proximosFilter==='buscar'){
      if(!state.proximosBuscarNombre){ html+='<div class="empty">Elegí una jugadora para ver sus próximos partidos.</div>'; }
      else{
        const propios=pend.filter(m=>{
          const p1=getP(m.p1),p2=getP(m.p2);
          return (p1&&(p1.j1===state.proximosBuscarNombre||p1.j2===state.proximosBuscarNombre))||(p2&&(p2.j1===state.proximosBuscarNombre||p2.j2===state.proximosBuscarNombre));
        });
        if(!propios.length){ html+=`<div class="empty">${state.proximosBuscarNombre} no tiene partidos pendientes.</div>`; }
        else{ propios.forEach(m=>{html+=renderJugadoraEntry(state.proximosBuscarNombre,m);}); }
      }
    }else{ pend.forEach(m=>{html+=renderPCard(m);}); }
    el.innerHTML=html; return;
  }
  if(!grupos[cat]||!grupos[cat].length){ el.innerHTML='<div class="empty">Todavía no hay parejas cargadas.</div>'; return; }

  if(sponsors.length){
    html+=`<div class="sponsors-strip">${sponsors.map(url=>`<img src="${url}" alt="Sponsor" class="sponsor-img">`).join('')}</div>`;
  }

  const champion=getChampion(cat);
  if(champion){
    const p=getP(champion);
    html+=`<div class="champion-banner"><div class="crown">🏆</div><div class="title">Campeonas ${cat==='1era'?'1º Categoría':cat==='2da'?'2º Categoría':'3º Categoría'}</div><div class="names">${p?p.j1:''}<br>${p?p.j2:''}</div></div>`;
  }

  if(playoffData[cat]){
    html+=`<div class="phase-label">Playoff</div>`;
    if(playoffData[cat].isPreview){ html+=`<div class="preview-banner">⚠️ Vista previa — el administrador todavía puede modificar este cuadro.</div>`; }
    html+=renderBracketTree(playoffData[cat],cat);
    const champ=getChampion(cat);
    if(champ){
      const p=getP(champ);
      html+=`<div class="champion-card"><div class="medal">🥇</div><div class="ctext"><div class="clabel">Campeón</div><div class="cnames">${p?p.j1:''} / ${p?p.j2:''}</div></div></div>`;
    }
  }

  const clasifInfo=getClasificacionInfo(cat);
  html+=`<div class="phase-label" style="margin-top:${playoffData[cat]?'1.8rem':'0'};">Zona de grupos</div>`;
  grupos[cat].forEach(g=>{
    const stats=getStats(g.id,cat);
    if(!g.parejas.length){ html+=`<div class="grupo"><div class="grupo-header">Grupo ${g.id} · sin parejas todavía</div></div>`; return; }
    let cutPos=clasifInfo.cutPos, sorteoEnGrupo=false;
    if(stats.length>cutPos){
      const limite=stats[cutPos-1]; let finBloque=cutPos;
      while(finBloque<stats.length && stats[finBloque].pts===limite.pts && stats[finBloque].bal===limite.bal && stats[finBloque].gg===limite.gg && stats[finBloque].gp===limite.gp){ finBloque++; }
      if(finBloque>cutPos){ cutPos=finBloque; sorteoEnGrupo=true; }
    }
    html+=`<div class="grupo"><div class="grupo-header">Grupo ${g.id} · ${g.parejas.length} parejas</div><div class="table-scroll"><table class="grupo-table"><thead><tr><th style="width:26px">#</th><th class="thl">Pareja</th><th>Pts</th><th>G</th><th>P</th><th>GG</th><th>GP</th><th>Dif</th></tr></thead><tbody>`;
    stats.forEach((p,i)=>{
      const shade=i%2===1,isCut=i===cutPos-1;
      html+=`<tr class="${shade?'shade':''} ${isCut?'cut-row':''}"><td><span class="pos-badge pos-${i+1}">${i+1}</span></td><td class="tdl"><div class="pnames"><span>${p.j1}</span><span>${p.j2}</span></div></td><td>${p.pts}</td><td>${p.gw}</td><td>${p.l}</td><td>${p.gg}</td><td>${p.gp}</td><td>${p.bal>0?'+':''}${p.bal}</td></tr>`;
    });
    html+=`</tbody></table></div>`;
    if(sorteoEnGrupo) html+=`<div class="cnote" style="color:#854d0e;background:#fffbeb;">⚠️ Empate exacto en el límite de clasificación — se define por sorteo.</div>`;
    html+=`<div class="cnote">🎾 ${CLASIF_LABELS[clasificacionMode[cat]]} clasifican${clasifInfo.usaRankingSegundos?` (2do compite por los mejores segundos para ${playoffMode[cat]})`:''}.</div><div class="legend-bar"><strong>Pts</strong>: puntos  ·  <strong>G</strong>: ganados  ·  <strong>P</strong>: perdidos  ·  <strong>GG</strong>: games ganados  ·  <strong>GP</strong>: games perdidos  ·  <strong>Dif</strong>: diferencia</div>${tiebreakLegendHtml()}</div>`;
    html+=renderMatrixTable(g,cat);
  });

  const{seconds}=getSeeds(cat);
  if(clasifInfo.usaRankingSegundos&&seconds.length){
    const needed=clasifInfo.cupos;
    html+=`<div class="phase-label" style="margin-top:1.5rem;">Ranking mejores 2dos</div><div class="grupo"><div class="grupo-header">Ranking 2dos puestos</div><div class="table-scroll"><table class="grupo-table"><thead><tr><th>#</th><th class="thl">Pareja</th><th>Grupo</th><th>Pts</th><th>GG</th><th>GP</th><th>Dif</th></tr></thead><tbody>`;
    seconds.forEach((s,i)=>{
      const shade=i%2===1,cl=i<needed,isCut=i===needed-1&&needed<seconds.length;
      html+=`<tr class="${shade?'shade':''} ${isCut?'cut-row':''}"><td><span class="pos-badge ${cl?'pos-1':''}">${i+1}</span></td><td class="tdl"><div class="pnames"><span>${s.j1}</span><span>${s.j2}</span></div></td><td>${s.grupoId}</td><td>${s.pts}</td><td>${s.gg}</td><td>${s.gp}</td><td>${s.bal>0?'+':''}${s.bal}</td></tr>`;
    });
    html+=`</tbody></table></div>`;
    if(clasifInfo.empateEnLimite) html+=`<div class="cnote" style="color:#854d0e;background:#fffbeb;">⚠️ Empate exacto en el límite — se define por sorteo.</div>`;
    html+=`<div class="cnote">${clasifInfo.cupos===1?'Clasifica el mejor segundo.':`Clasifican los ${clasifInfo.cupos} mejores segundos.`}</div><div class="legend-bar">1°: Pts, 2°: Dif, 3°: GG, 4°: GP (menos), 5°: sorteo.</div></div>`;
  }
  el.innerHTML=html;
}

function renderMatrixTable(g,cat){
  const pairs=g.parejas; const fullLabel=p=>`<span class="pair-line">${p.j1}</span><span class="pair-line">${p.j2}</span>`;
  let html=`<div class="phase-label" style="margin-top:.6rem;margin-bottom:6px;">Resultados — Grupo ${g.id}</div><div class="grupo" style="border:none;margin-bottom:1.2rem;background:none;"><div class="matrix-wrap"><table class="matrix-table"><thead><tr><th class="corner">Parejas</th>${pairs.map(p=>`<th>${fullLabel(p)}</th>`).join('')}</tr></thead><tbody>`;
  pairs.forEach((rowP,ri)=>{
    html+=`<tr><td class="row-label">${fullLabel(rowP)}</td>`;
    pairs.forEach((colP,ci)=>{
      if(ri===ci){html+=`<td class="diag"></td>`;return;}
      const m=partidos.find(mm=>mm.grupoId===g.id&&((mm.p1===rowP.id&&mm.p2===colP.id)||(mm.p1===colP.id&&mm.p2===rowP.id)));
      if(!m||!m.played){html+=`<td class="empty-cell">—</td>`;return;}
      const isP1=m.p1===rowP.id; const scoreStr=m.sets.map(s=>isP1?`${s[0]}-${s[1]}`:`${s[1]}-${s[0]}`).join(' ');
      html+=`<td class="played">${scoreStr}</td>`;
    });
    html+=`</tr>`;
  });
  html+=`</tbody></table></div><div class="cnote">El marcador se lee en la fila de la pareja (sus games primero).</div></div>`;
  return html;
}

function findMatchById(mid){
  const gm=partidos.find(x=>x.id===mid); if(gm)return gm;
  for(const cat of["1era","2da","3era"]) if(playoffData[cat]) for(const r of playoffData[cat].rounds){ const fm=r.matches.find(x=>x.id===mid); if(fm)return fm; }
  return null;
}
function getSchedDisplay(sched){
  if(sched.after){
    if(sched.afterMatchId){
      const am=findMatchById(sched.afterMatchId);
      if(am) return{timeText:`A continuación de`,waitNames:`${am.p1?pNombre(am.p1):'?'} vs ${am.p2?pNombre(am.p2):'?'}`,short:'A cont.'};
    }
    return{timeText:'A continuación',waitNames:'',short:'A cont.'};
  }
  return{timeText:sched.hora||'—',waitNames:'',short:sched.hora||'—'};
}
function renderPCard(m){
  const n1=pJ1(m.p1),nn1=pJ2(m.p1),n2=pJ1(m.p2),nn2=pJ2(m.p2);
  let w1=0,w2=0;m.sets.forEach(s=>{if(s[0]>s[1])w1++;else w2++;});
  const win=m.played?(w1>w2?m.p1:m.p2):null;
  let s1='',s2=''; m.sets.forEach(s=>{s1+=`<span class="sbox ${s[0]>s[1]?'won':''}">${s[0]}</span>`;s2+=`<span class="sbox ${s[1]>s[0]?'won':''}">${s[1]}</span>`;});
  const sched=getSched(m.id); let schedHtml='';
  if(sched.after||sched.cancha||sched.hora){
    const disp=getSchedDisplay(sched); let canchaText=sched.cancha?`C${sched.cancha}`:'—';
    schedHtml=`<div class="cancha-block"><div class="cnum">${canchaText}</div><div class="clabel">Cancha</div><div class="ctime" style="font-size:${sched.after?'11px':'14px'};">${disp.short}</div>${sched.after&&disp.waitNames?`<div class="after-note">${disp.waitNames}</div>`:''}</div>`;
  }
  return `<div class="partido"><div class="phdr"><span>${m.isPlayoff?m.grupoId:`Grupo ${m.grupoId}`}${m.simulated?`<span class="sim-badge">simulado</span>`:''}</span></div><div class="pbody"><div class="pbody-teams"><div class="trow"><span class="tname ${win===m.p1?'win':''}">${n1} / ${nn1}</span><div class="srow">${s1}</div></div><div class="trow" style="margin-top:4px;"><span class="tname ${win===m.p2?'win':''}">${n2} / ${nn2}</span><div class="srow">${s2}</div></div></div>${schedHtml}<span class="pst ${m.played?'splay':'spend'}">${m.played?'Jugado':'Pendiente'}</span></div></div>`;
}

function setProximosFilter(f){ state.proximosFilter=f; if(state.mainView==='admin'&&state.adminSection==='live') renderPublicView(state.liveCat,state.liveSubTab,'liveContent'); else renderJContent(); }
function setProximosBuscarNombre(nombre){ state.proximosBuscarNombre=nombre; if(state.mainView==='admin'&&state.adminSection==='live') renderPublicView(state.liveCat,state.liveSubTab,'liveContent'); else renderJContent(); }

function renderJugadoraEntry(nombre,m){
  const rival1=getP(m.p1),rival2=getP(m.p2);
  const esP1=rival1&&(rival1.j1===nombre||rival1.j2===nombre);
  const companera=esP1?(rival1.j1===nombre?rival1.j2:rival1.j1):(rival2?.j1===nombre?rival2.j2:rival2?.j1);
  const rivalPareja=esP1?rival2:rival1; const rivalTxt=rivalPareja?`${rivalPareja.j1} / ${rivalPareja.j2}`:'Por definir';
  const sched=getSched(m.id); let schedHtml='';
  if(sched.after||sched.cancha||sched.hora){
    const disp=getSchedDisplay(sched); let canchaText=sched.cancha?`C${sched.cancha}`:'—';
    schedHtml=`<div class="cancha-block"><div class="cnum">${canchaText}</div><div class="clabel">Cancha</div><div class="ctime" style="font-size:${sched.after?'11px':'14px'};">${disp.short}</div>${sched.after&&disp.waitNames?`<div class="after-note">${disp.waitNames}</div>`:''}</div>`;
  }
  return `<div class="partido"><div class="phdr"><span>${m.isPlayoff?m.grupoId:`Grupo ${m.grupoId}`}</span></div><div class="pbody"><div class="pbody-teams"><div class="trow"><span class="tname win">${nombre}</span></div><div class="trow" style="margin-top:2px;"><span class="tname" style="font-size:12px;color:var(--gray);">junto a ${companera||'?'}</span></div><div class="trow" style="margin-top:6px;"><span class="tname" style="font-size:13px;color:var(--gray-light);">vs ${rivalTxt}</span></div></div>${schedHtml}<span class="pst spend">Pendiente</span></div></div>`;
}

function renderBracketTree(playoff,cat){
  const MATCH_W=210,COL_GAP=48,COL_W=MATCH_W+COL_GAP,MATCH_H=44*2+20+2,VPAD=20;
  const rounds=playoff.rounds; const r0n=rounds[0].matches.length; const SLOT=MATCH_H+VPAD;
  const totalH=r0n*SLOT+60; const totalW=rounds.length*COL_W+MATCH_W;
  let svgLines='';
  rounds.forEach((r,ri)=>{
    if(ri===0)return; const prev=rounds[ri-1];
    r.matches.forEach((m,mi)=>{
      const srcA=mi*2,srcB=mi*2+1; if(srcA>=prev.matches.length)return;
      function mY(rIdx,mIdx){const span=Math.pow(2,rIdx);return mIdx*span*SLOT+40+(span*SLOT-MATCH_H)/2+MATCH_H/2;}
      const yA=mY(ri-1,srcA),yB=srcB<prev.matches.length?mY(ri-1,srcB):yA; const yM=mY(ri,mi);
      const xL=(ri-1)*COL_W+MATCH_W,xMid=xL+COL_GAP/2,xR=ri*COL_W;
      svgLines+=`<path d="M${xL},${yA} H${xMid}" fill="none" stroke="#f9a8d4" stroke-width="2"/><path d="M${xMid},${yA} V${yB}" fill="none" stroke="#f9a8d4" stroke-width="2"/><path d="M${xMid},${yM} H${xR}" fill="none" stroke="#f9a8d4" stroke-width="2"/>`;
    });
  });
  let html=`<div class="bracket-section"><div style="position:relative;min-width:${totalW}px;height:${totalH}px;"><svg style="position:absolute;top:0;left:0;width:${totalW}px;height:${totalH}px;pointer-events:none;" xmlns="http://www.w3.org/2000/svg">${svgLines}</svg>`;
  rounds.forEach((r,ri)=>{
    html+=`<div style="position:absolute;left:${ri*COL_W}px;top:0;width:${MATCH_W}px;"><div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--pink);font-weight:500;text-align:center;padding-bottom:12px;">${r.name}</div>`;
    r.matches.forEach((m,mi)=>{
      const span=Math.pow(2,ri); const topPx=mi*span*SLOT+40+(span*SLOT-MATCH_H)/2;
      const p1=getP(m.p1),p2=getP(m.p2);
      const n1a=p1?p1.j1:'Por definir',n1b=p1?p1.j2:'',n2a=p2?p2.j1:'Por definir',n2b=p2?p2.j2:'';
      let s1='',s2=''; if(m.sets&&m.sets.length){m.sets.forEach(s=>{s1+=`<span class="sbox ${s[0]>s[1]?'won':''}">${s[0]}</span>`;s2+=`<span class="sbox ${s[1]>s[0]?'won':''}">${s[1]}</span>`;});}
      const slotId=cat?`po_${cat}_${m.id}`:m.id; const sched=getSched(slotId)||getSched(m.id);
      let footerText='';
      if(sched.after){const disp=getSchedDisplay(sched);footerText=`A continuación${disp.waitNames?' de '+disp.waitNames:''}${sched.cancha?' · Cancha '+sched.cancha:''}`;}
      else if(sched.cancha||sched.hora) footerText=`${sched.cancha?'Cancha '+sched.cancha:''}${sched.cancha&&sched.hora?' · ':''}${sched.hora||''}`;
      html+=`<div class="bmatch ${playoff.isPreview?'preview':''}" style="position:absolute;top:${topPx}px;left:0;width:${MATCH_W}px;"><div class="bteam ${m.winner===m.p1&&m.p1?'win':''} ${!m.p1?'tbd':''}"><div class="bteam-inner"><div class="bteam-name">${n1a}</div>${n1b?`<div class="bteam-name2">${n1b}</div>`:''}</div><div class="bteam-sets">${s1}</div></div><div class="bteam ${m.winner===m.p2&&m.p2?'win':''} ${!m.p2?'tbd':''}"><div class="bteam-inner"><div class="bteam-name">${n2a}</div>${n2b?`<div class="bteam-name2">${n2b}</div>`:''}</div><div class="bteam-sets">${s2}</div></div>${footerText?`<div class="bmatch-footer">📍 ${footerText}</div>`:''}</div>`;
    });
    html+=`</div>`; });
  html+=`</div></div>`; return html;
}

function renderA(){
  buildCatTabs('cta',state.adminCat,'switchCatA');
  document.getElementById('acatbar').innerHTML=`<button class="pill-sm ${state.adminSection==='live'?'active':''}" onclick="switchAdminSection('live')"><span class="live-badge"><span class="live-dot"></span> Live</span></button><button class="pill-sm ${state.adminSection==='pairs'?'active':''}" onclick="switchAdminSection('pairs')">Parejas y grupos</button><button class="pill-sm ${state.adminSection==='sched'?'active':''}" onclick="switchAdminSection('sched')">Canchas y horarios</button><button class="pill-sm ${state.adminSection==='results'?'active':''}" onclick="switchAdminSection('results')">Resultados</button><button class="pill-sm ${state.adminSection==='clasificacion'?'active':''}" onclick="switchAdminSection('clasificacion')">Clasificación</button><button class="pill-sm ${state.adminSection==='playoff'?'active':''}" onclick="switchAdminSection('playoff')">Playoff</button><button class="pill-sm ${state.adminSection==='tiebreak'?'active':''}" onclick="switchAdminSection('tiebreak')">Desempate</button><button class="pill-sm ${state.adminSection==='reglamento'?'active':''}" onclick="switchAdminSection('reglamento')">Reglamento</button><button class="pill-sm ${state.adminSection==='sponsors'?'active':''}" onclick="switchAdminSection('sponsors')">Sponsors</button><button class="pill-sm ${state.adminSection==='torneoinfo'?'active':''}" onclick="switchAdminSection('torneoinfo')">Datos del torneo</button>`;
  renderAContent();
}
function switchCatA(cat){state.adminCat=cat;renderA();}
function switchAdminSection(s){state.adminSection=s;renderA();}

function renderAContent(){
  const cat=state.adminCat; let html='';
  if(state.adminSection==='live'){
    html=`<div class="pillbar-sm" id="liveCatBar" style="padding:0 0 10px;"></div><div class="pillbar-sm" id="liveSubBar" style="padding:0 0 10px;"></div><div id="liveContent"></div>`;
    document.getElementById('acontent').innerHTML=html;
    document.getElementById('liveCatBar').innerHTML=["1era","2da","3era"].map(c=>`<button class="pill-sm ${c===state.liveCat?'active':''}" onclick="switchLiveCat('${c}')">${{"1era":"1º Categoría","2da":"2º Categoría","3era":"3º Categoría"}[c]}</button>`).join('');
    document.getElementById('liveSubBar').innerHTML=`<button class="pill-sm ${state.liveSubTab==='grupos'?'active':''}" onclick="switchLiveSub('grupos')">Grupos</button><button class="pill-sm ${state.liveSubTab==='proximos'?'active':''}" onclick="switchLiveSub('proximos')">Próximos partidos</button><button class="pill-sm ${state.liveSubTab==='reglamento'?'active':''}" onclick="switchLiveSub('reglamento')">Reglamento</button><button class="pill-sm ${state.liveSubTab==='direcciones'?'active':''}" onclick="switchLiveSub('direcciones')">Direcciones</button>`;
    renderPublicView(state.liveCat,state.liveSubTab,'liveContent'); return;
  }
  if(state.adminSection==='pairs') html=renderSectionPairs(cat);
  else if(state.adminSection==='sched') html=renderSectionSched();
  else if(state.adminSection==='results') html=renderSectionResults(cat);
  else if(state.adminSection==='playoff') html=renderSectionPlayoff(cat);
  else if(state.adminSection==='clasificacion') html=renderSectionClasificacion(cat);
  else if(state.adminSection==='tiebreak') html=renderSectionTiebreak();
  else if(state.adminSection==='reglamento') html=renderSectionReglamento();
  else if(state.adminSection==='sponsors') html=renderSectionSponsors();
  else if(state.adminSection==='torneoinfo') html=renderSectionTorneoInfo();
  document.getElementById('acontent').innerHTML=html;
}
function switchLiveCat(c){state.liveCat=c;renderA();}
function switchLiveSub(s){state.liveSubTab=s;renderA();}

function renderSectionClasificacion(cat){
  let html=`<div class="ibar">Elegí cómo se define la clasificación a playoff para esta categoría.</div><div class="tb-order-list">`;
  Object.keys(CLASIF_LABELS).forEach(key=>{
    const active=clasificacionMode[cat]===key;
    html+=`<div class="tb-order-item" style="cursor:pointer;${active?'border-color:var(--pink);background:var(--pink-bg);':''}" onclick="setClasificacionMode('${cat}','${key}')"><div class="num" style="${active?'':'background:#e5e7eb;color:#555;'}">${active?'✓':''}</div><div class="label">${CLASIF_LABELS[key]}</div></div>`;
  });
  return html+`</div><div class="legend-bar">Importante: el formato del cuadro (cuartos/semis) es independiente de esta elección.</div>`;
}
async function setClasificacionMode(cat,mode){
  clasificacionMode[cat]=mode;
  await supabaseClient.from('configuracion').upsert({clave:'clasificacion_mode',valor:clasificacionMode});
  renderA(); renderJContent(); showToast('Modo de clasificación actualizado');
}

function renderSectionTiebreak(){
  return `<div class="ibar">Estos son los criterios de desempate fijos que aplica el sistema.</div><div class="tb-order-list">
    <div class="tb-order-item"><div class="num">1</div><div class="label">Puntos</div></div>
    <div class="tb-order-item"><div class="num">2</div><div class="label">Si son 2 empatadas: cara a cara entre ellas</div></div>
    <div class="tb-order-item"><div class="num">3</div><div class="label">Si son 3+ empatadas: diferencia de games de todo el grupo</div></div>
    <div class="tb-order-item"><div class="num">4</div><div class="label">Las que sigan empatadas de a 2 en esa diferencia: cara a cara entre ellas</div></div>
    <div class="tb-order-item"><div class="num">5</div><div class="label">Si sigue el empate entre 3+ (ciclo perfecto): sorteo</div></div>
  </div>
  <div class="phase-label" style="margin-top:1.5rem;">Desempate entre mejores segundos</div>
  <div class="tb-order-list">
    <div class="tb-order-item"><div class="num">1</div><div class="label">Puntos</div></div>
    <div class="tb-order-item"><div class="num">2</div><div class="label">Diferencia de games</div></div>
    <div class="tb-order-item"><div class="num">3</div><div class="label">Games ganados</div></div>
    <div class="tb-order-item"><div class="num">4</div><div class="label">Games perdidos (menos es mejor)</div></div>
    <div class="tb-order-item"><div class="num">5</div><div class="label">Sorteo</div></div>
  </div>`;
}

function renderSectionTorneoInfo(){
  return `<div class="ibar">Datos del torneo</div>
    <label>Emoji</label><input id="torneoEmojiInput" value="${torneoInfo.emoji}" maxlength="4" style="max-width:80px;">
    <label>Nombre del torneo</label><input id="torneoNombreInput" value="${torneoInfo.nombre}">
    <label>Subtítulo</label><input id="torneoSubtituloInput" value="${torneoInfo.subtitulo}">
    <button class="btn btn-pink btn-sm" style="margin-top:10px;" onclick="saveTorneoInfo()">Guardar</button>`;
}
async function saveTorneoInfo(){
  torneoInfo={emoji:document.getElementById('torneoEmojiInput').value||'🎾',nombre:document.getElementById('torneoNombreInput').value||'Torneo',subtitulo:document.getElementById('torneoSubtituloInput').value||''};
  await supabaseClient.from('configuracion').upsert({clave:'torneo_info',valor:torneoInfo});
  renderMainTabs(); if(state.mainView==='jugadoras')renderJ(); else if(state.adminUnlocked)renderA();
  showToast('Datos guardados');
}

function renderSectionSponsors(){
  let html=`<div class="ibar">Pegá el link directo de cada imagen de sponsor.</div><div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;"><input id="newSponsorUrl" placeholder="https://i.imgur.com/ejemplo.png" style="flex:1;min-width:200px;"><button class="btn btn-pink btn-sm" onclick="addSponsor()">+ Agregar sponsor</button></div>`;
  if(!sponsors.length){ html+='<div class="empty">No hay sponsors.</div>'; }
  else{
    html+=`<div class="grupo" style="padding:10px 14px;">`;
    sponsors.forEach((url,i)=>{ html+=`<div class="sponsor-admin-row"><img src="${url}" alt="Sponsor" onerror="this.style.opacity=0.3"><div class="surl">${url}</div><button class="btn btn-red btn-sm" onclick="delSponsor(${i})">Borrar</button></div>`; });
    html+=`</div>`;
  }
  return html;
}
async function addSponsor(){
  const url=document.getElementById('newSponsorUrl').value.trim(); if(!url)return;
  sponsors.push(url); await supabaseClient.from('configuracion').upsert({clave:'sponsors',valor:sponsors});
  renderA(); if(state.mainView==='jugadoras')renderJContent(); showToast('Agregado');
}
async function delSponsor(i){
  sponsors.splice(i,1); await supabaseClient.from('configuracion').upsert({clave:'sponsors',valor:sponsors});
  renderA(); if(state.mainView==='jugadoras')renderJContent(); showToast('Eliminado');
}

function renderSectionReglamento(){
  return `<div class="ibar">Escribí acá el reglamento del torneo.</div>
    <textarea id="reglamentoInput" rows="16" style="width:100%;padding:12px;border:1.5px solid #ccc;border-radius:10px;font-family:inherit;font-size:14px;line-height:1.6;resize:vertical;">${reglamentoText}</textarea>
    <button class="btn btn-pink btn-sm" style="margin-top:10px;" onclick="saveReglamento()">Guardar</button>`;
}
async function saveReglamento(){
  reglamentoText=document.getElementById('reglamentoInput').value;
  await supabaseClient.from('configuracion').upsert({clave:'reglamento',valor:reglamentoText});
  showToast('Reglamento guardado');
}
function renderReglamentoHtml(text){
  if(!text||!text.trim()) return '<div class="empty">Sin reglamento.</div>';
  let html='', inList=false;
  text.split('\n').forEach(line=>{
    const trimmed=line.trim();
    if(/^[-*]\s+/.test(trimmed)){
      if(!inList){html+='<ul class="reglamento-list">';inList=true;}
      html+=`<li>${trimmed.replace(/^[-*]\s+/,'')}</li>`;
    }else{
      if(inList){html+='</ul>';inList=false;}
      if(trimmed)html+=`<p class="reglamento-p">${trimmed}</p>`;
    }
  });
  if(inList)html+='</ul>'; return html;
}

function renderSectionPairs(cat){
  let html=`<div class="ibar">Administrar grupos y parejas.</div>`;
  if(!grupos[cat]||!grupos[cat].length){
    return html+`<div class="empty">No hay grupos.</div><button class="btn btn-pink btn-sm" onclick="addGroup('${cat}')">+ Agregar grupo</button>`;
  }
  html+=`<div class="group-select-bar">`;
  grupos[cat].forEach(g=>{ html+=`<button class="group-select-btn ${state.adminPairsGroup[cat]===g.id?'active':''}" onclick="selectPairsGroup('${cat}','${g.id}')">Grupo ${g.id}</button>`; });
  html+=`<button class="group-select-btn" style="background:#fff;color:var(--pink);border:1.5px dashed var(--pink);" onclick="addGroup('${cat}')">+ Agregar grupo</button></div>`;
  const selectedG=grupos[cat].find(g=>g.id===state.adminPairsGroup[cat])||grupos[cat][0]; const gi=grupos[cat].indexOf(selectedG);
  const allGroupOptions=[]; ["1era","2da","3era"].forEach(c=>{ grupos[c].forEach(g=>{ allGroupOptions.push({cat:c,gid:g.id,label:`${c} - G${g.id}`}); }); });
  html+=`<div class="grupo" style="margin-bottom:1.2rem;"><div class="grupo-header" style="display:flex;align-items:center;justify-content:space-between;"><span>Grupo ${selectedG.id} (${selectedG.parejas.length} parejas)</span>${selectedG.parejas.length===0?`<button class="btn btn-red btn-sm" onclick="deleteGroup('${cat}','${selectedG.id}')">Borrar</button>`:''}</div><div style="padding:12px;">`;
  selectedG.parejas.forEach((p,pi)=>{
    const moveOpts=allGroupOptions.map(o=>`<option value="${o.cat}|${o.gid}" ${o.cat===cat&&o.gid===selectedG.id?'selected':''}>${o.label}</option>`).join('');
    html+=`<div class="prow"><div class="prow-inputs"><input value="${p.j1}" onchange="editP('${cat}',${gi},${pi},'j1',this.value)"><input value="${p.j2}" onchange="editP('${cat}',${gi},${pi},'j2',this.value)"></div><select class="move-select" onchange="movePair('${cat}',${gi},${pi},this.value)">${moveOpts}</select><button class="btn btn-red btn-sm" onclick="delP('${cat}',${gi},${pi})">Borrar</button></div>`;
  });
  return html+`<button class="btn btn-out btn-sm" style="margin-top:8px;" onclick="addP('${cat}',${gi})">+ Agregar pareja</button></div></div>`;
}
function nextGroupId(cat){
  const prefix={"1era":"1","2da":"2","3era":"3"}[cat], ex=grupos[cat].map(g=>g.id);
  for(let i=0;i<26;i++){ const c=prefix+String.fromCharCode(65+i); if(!ex.includes(c))return c; }
  return prefix+'X'+Date.now();
}
async function addGroup(cat){
  const newId=nextGroupId(cat); grupos[cat].push({id:newId,parejas:[]}); grupos[cat].sort((a,b)=>a.id.localeCompare(b.id)); state.adminPairsGroup[cat]=newId;
  await saveGruposVacios(); renderA(); showToast('Grupo agregado');
}
async function deleteGroup(cat,gid){
  const g=grupos[cat].find(x=>x.id===gid); if(!g||g.parejas.length>0)return;
  grupos[cat]=grupos[cat].filter(x=>x.id!==gid);
  await supabaseClient.from('partidos').delete().eq('grupo_id',gid).eq('categoria',cat); partidos=partidos.filter(m=>!(m.grupoId===gid&&m.cat===cat));
  state.adminPairsGroup[cat]=grupos[cat].length?grupos[cat][0].id:null; await saveGruposVacios(); renderA(); showToast('Borrado');
}
function selectPairsGroup(cat,gid){state.adminPairsGroup[cat]=gid;renderA();}
async function editP(cat,gi,pi,f,v){
  const pair=grupos[cat][gi].parejas[pi]; pair[f]=v;
  await supabaseClient.from('parejas').update({[f==='j1'?'jugadora1':'jugadora2']:v}).eq('id',pair.id); showToast('Guardado');
}
async function delP(cat,gi,pi){
  const pid=grupos[cat][gi].parejas[pi].id; grupos[cat][gi].parejas.splice(pi,1); partidos=partidos.filter(m=>m.p1!==pid&&m.p2!==pid);
  await supabaseClient.from('partidos').delete().or(`pareja1_id.eq.${pid},pareja2_id.eq.${pid}`);
  await supabaseClient.from('parejas').delete().eq('id',pid); await regenerateMatchesForGroup(cat,grupos[cat][gi].id);
  if(grupos[cat][gi].parejas.length===0) await saveGruposVacios(); renderA(); showToast('Eliminada');
}
async function addP(cat,gi){
  const id='p'+Date.now(), eraVacio=grupos[cat][gi].parejas.length===0; grupos[cat][gi].parejas.push({id,j1:'J1',j2:'J2'});
  await supabaseClient.from('parejas').insert({id,categoria:cat,grupo_id:grupos[cat][gi].id,jugadora1:'J1',jugadora2:'J2',cardales:false});
  await regenerateMatchesForGroup(cat,grupos[cat][gi].id); if(eraVacio) await saveGruposVacios(); renderA(); showToast('Agregada');
}
async function movePair(cat,gi,pi,target){
  const[tCat,tGid]=target.split('|'); if(tCat===cat&&grupos[cat][gi].id===tGid)return;
  const pair=grupos[cat][gi].parejas[pi], oldGid=grupos[cat][gi].id; grupos[cat][gi].parejas.splice(pi,1);
  grupos[tCat].find(g=>g.id===tGid).parejas.push(pair);
  await supabaseClient.from('parejas').update({categoria:tCat,grupo_id:tGid}).eq('id',pair.id);
  await supabaseClient.from('partidos').delete().or(`pareja1_id.eq.${pair.id},pareja2_id.eq.${pair.id}`); partidos=partidos.filter(m=>m.p1!==pair.id&&m.p2!==pair.id);
  await regenerateMatchesForGroup(cat,oldGid); await regenerateMatchesForGroup(tCat,tGid); await saveGruposVacios();
  state.adminPairsGroup[cat]=grupos[cat][gi].id; renderA(); showToast('Movida');
}
async function regenerateMatchesForGroup(cat,gid){
  const g=grupos[cat].find(x=>x.id===gid); if(!g)return; const newMs=[];
  g.parejas.forEach((p1,i)=>{
    g.parejas.forEach((p2,j)=>{
      if(j<=i)return; const exists=partidos.find(m=>m.grupoId===gid&&((m.p1===p1.id&&m.p2===p2.id)||(m.p1===p2.id&&m.p2===p1.id)));
      if(!exists){ const nM={id:`m_${gid}_${p1.id}_${p2.id}`,cat,grupoId:gid,p1:p1.id,p2:p2.id,sets:[],played:false,simulated:false,phase:'grupos'}; partidos.push(nM); newMs.push({id:nM.id,categoria:cat,grupo_id:gid,pareja1_id:p1.id,pareja2_id:p2.id,sets:[],jugado:false,simulado:false}); }
    });
  });
  if(newMs.length) await supabaseClient.from('partidos').insert(newMs);
}

function renderSectionSched(){
  let html=`<div class="toggle-group" style="margin-bottom:14px;"><button class="toggle-btn ${state.schedSubTab==='grupos'?'active':''}" onclick="switchSchedSubTab('grupos')">Grupos</button><button class="toggle-btn ${state.schedSubTab==='playoff'?'active':''}" onclick="switchSchedSubTab('playoff')">Playoff</button></div>`;
  return html+(state.schedSubTab==='grupos'?renderSchedGrupos():renderSchedPlayoff());
}
function switchSchedSubTab(tab){state.schedSubTab=tab;renderAContent();}

function renderSchedGrupos(){
  let ms=[]; ["1era","2da","3era"].forEach(cat=>{ ms=ms.concat(partidos.filter(m=>m.cat===cat&&!m.played).map(m=>({...m,catLabel:cat})).sort((a,b)=>a.grupoId.localeCompare(b.grupoId))); });
  let html=`<div class="ibar">Asigná cancha y hora a los partidos de grupos.</div>`;
  if(!ms.length) return html+'<div class="empty">No hay partidos.</div>';
  const aFR=buildAllMatchOptions(), used=buildUsedAsReference(aFR.all);
  html+=`<div class="sched-grid">`; ms.forEach(m=>{ html+=renderSchedCard(m,aFR.options,used); });
  return html+`</div>`;
}

function getPlayoffSlots(cat){
  const slots=[];
  if(playoffMode[cat]==='cuartos') slots.push({roundName:'Cuartos de final',matches:[{slotId:`po_${cat}_qf1`,label:'QF 1'},{slotId:`po_${cat}_qf2`,label:'QF 2'},{slotId:`po_${cat}_qf3`,label:'QF 3'},{slotId:`po_${cat}_qf4`,label:'QF 4'}]});
  slots.push({roundName:'Semifinales',matches:[{slotId:`po_${cat}_sf1`,label:'SF 1'},{slotId:`po_${cat}_sf2`,label:'SF 2'}]},{roundName:'Final',matches:[{slotId:`po_${cat}_f1`,label:'Final'}]});
  return slots;
}
function matchForSlot(cat,slotId){
  if(!playoffData[cat])return null; const key=slotId.replace(`po_${cat}_`,'');
  for(const r of playoffData[cat].rounds){ const m=r.matches.find(x=>x.id===key); if(m)return m; } return null;
}
function renderSchedPlayoff(){
  let html=`<div class="ibar">Asigná cancha y hora a los cruces de playoff.</div>`;
  const aFR=buildAllMatchOptions(), used=buildUsedAsReference(aFR.all);
  ["1era","2da","3era"].forEach(cat=>{
    html+=`<div style="margin-top:1.2rem;font-size:13px;font-weight:600;color:#111;padding-bottom:6px;border-bottom:2px solid #111;">${cat}</div>`;
    getPlayoffSlots(cat).forEach(round=>{
      html+=`<div class="phase-label" style="margin-top:.8rem;">${round.roundName}</div><div class="sched-grid">`;
      round.matches.forEach(slot=>{
        const sched=getSched(slot.slotId), rM=matchForSlot(cat,slot.slotId);
        let n1='Por definir',n2='Por definir'; if(rM){ if(rM.p1) n1=pNombre(rM.p1); if(rM.p2) n2=pNombre(rM.p2); }
        const otherOpts=aFR.options.filter(o=>o.id!==slot.slotId&&(!used.has(o.id)||sched.afterMatchId===o.id)).map(o=>`<option value="${o.id}" ${sched.afterMatchId===o.id?'selected':''}>${o.label}</option>`).join('');
        html+=`<div class="sched-card"><div class="sched-card-hdr">${cat} — ${round.roundName} — ${slot.label}</div><div class="sched-card-body"><div class="sched-card-vs" style="color:${rM?'#111':'var(--gray-light)'};"><strong>${n1}</strong><br><span style="color:var(--gray-light);">vs</span><br><strong>${n2}</strong></div><div class="sched-mini-row"><div><label style="margin-top:0;font-size:11px;">Cancha</label><input type="number" id="cancha_${slot.slotId}" value="${sched.cancha}" onchange="saveSchedGeneric('${slot.slotId}')"></div><div><label style="margin-top:0;font-size:11px;">Hora</label><input type="time" id="hora_${slot.slotId}" value="${sched.hora}" ${sched.after?'disabled':''} onchange="saveSchedGeneric('${slot.slotId}')"></div></div><div class="acont-after-toggle"><input type="checkbox" id="after_${slot.slotId}" ${sched.after?'checked':''} onchange="toggleAfter('${slot.slotId}')"><label style="margin:0;" for="after_${slot.slotId}">A continuación de</label></div>${sched.after?`<div style="margin-top:8px;"><select id="afterMatch_${slot.slotId}" onchange="saveAfterMatch('${slot.slotId}')"><option value="">— Elegí un partido —</option>${otherOpts}</select></div>`:''}</div></div>`;
      });
      html+=`</div>`;
    });
  });
  return html;
}
function buildAllMatchOptions(){
  const all=[];
  ["1era","2da","3era"].forEach(cat=>{
    partidos.filter(m=>m.cat===cat&&!m.played).forEach(m=>all.push({...m,catLabel:cat}));
    if(playoffData[cat]) playoffData[cat].rounds.flatMap(r=>r.matches.filter(m=>m.p1&&m.p2&&(!m.sets||!m.sets.length)).map(m=>({...m,isPlayoff:true,roundName:r.name,catLabel:cat}))).forEach(m=>all.push(m));
    getPlayoffSlots(cat).forEach(round=>{ round.matches.forEach(slot=>{ if(!all.some(x=>(x.id||x.slotId)===slot.slotId)) all.push({id:slot.slotId,isPlayoffSlot:true,catLabel:cat,roundName:round.roundName,slotLabel:slot.label}); }); });
  });
  return{all,options:all.map(m=>({id:m.id||m.slotId,label:m.isPlayoffSlot?`${m.catLabel} — ${m.roundName} — ${m.slotLabel}`:m.isPlayoff?`${m.catLabel} — ${m.roundName}: ${m.p1?pJ1(m.p1):'?'} vs ${m.p2?pJ1(m.p2):'?'}`:`${m.catLabel} — Grupo ${m.grupoId}: ${pJ1(m.p1)} vs ${pJ1(m.p2)}`}))};
}
function buildUsedAsReference(all){ return new Set(all.filter(m=>getSched(m.id).after && getSched(m.id).afterMatchId).map(m=>getSched(m.id).afterMatchId)); }
function renderSchedCard(m,opts,used){
  const sched=getSched(m.id), n1=m.p1?pNombre(m.p1):'?', n2=m.p2?pNombre(m.p2):'?';
  const otherOpts=opts.filter(o=>o.id!==m.id&&(!used.has(o.id)||sched.afterMatchId===o.id)).map(o=>`<option value="${o.id}" ${sched.afterMatchId===o.id?'selected':''}>${o.label}</option>`).join('');
  return `<div class="sched-card"><div class="sched-card-hdr">Cat. ${m.catLabel} — Grupo ${m.grupoId}</div><div class="sched-card-body"><div class="sched-card-vs"><strong>${n1}</strong><br><span style="color:var(--gray-light);">vs</span><br><strong>${n2}</strong></div><div class="sched-mini-row"><div><label style="margin-top:0;font-size:11px;">Cancha</label><input type="number" id="cancha_${m.id}" value="${sched.cancha}" onchange="saveSchedGeneric('${m.id}')"></div><div><label style="margin-top:0;font-size:11px;">Hora</label><input type="time" id="hora_${m.id}" value="${sched.hora}" ${sched.after?'disabled':''} onchange="saveSchedGeneric('${m.id}')"></div></div><div class="acont-after-toggle"><input type="checkbox" id="after_${m.id}" ${sched.after?'checked':''} onchange="toggleAfter('${m.id}')"><label style="margin:0;" for="after_${m.id}">A continuación</label></div>${sched.after?`<div style="margin-top:8px;"><select id="afterMatch_${m.id}" onchange="saveAfterMatch('${m.id}')"><option value="">— Elegí un partido —</option>${otherOpts}</select></div>`:''}</div></div>`;
}

async function saveSchedToDB(mId){ const s=getSched(mId); await supabaseClient.from('horarios').upsert({partido_id:mId,cancha:s.cancha,hora:s.hora,a_continuacion:s.after,a_continuacion_de:s.afterMatchId}); }
async function saveSchedGeneric(mId){
  const c=document.getElementById(`cancha_${mId}`)?.value||'', h=document.getElementById(`hora_${mId}`)?.value||'';
  const cur=getSched(mId); matchSchedule[mId]={...cur,cancha:c,hora:h}; await saveSchedToDB(mId); renderJContent(); showToast('Guardado');
}
async function toggleAfter(mId){
  const checked=document.getElementById(`after_${mId}`).checked, cur=getSched(mId);
  matchSchedule[mId]={...cur,after:checked,hora:checked?'':cur.hora,afterMatchId:checked?cur.afterMatchId:''};
  await saveSchedToDB(mId); renderA(); renderJContent();
}
async function saveAfterMatch(mId){
  matchSchedule[mId]={...getSched(mId),afterMatchId:document.getElementById(`afterMatch_${mId}`).value};
  await saveSchedToDB(mId); renderA(); renderJContent(); showToast('Vinculado');
}

function renderSectionResults(cat){
  const pend=partidos.filter(m=>m.cat===cat&&!m.played&&m.phase==='grupos').sort((a,b)=>a.grupoId.localeCompare(b.grupoId));
  const done=partidos.filter(m=>m.cat===cat&&m.played&&m.phase==='grupos').sort((a,b)=>a.grupoId.localeCompare(b.grupoId));
  let html=`<div class="ibar">Anotá el resultado del set único (ej: 6-4).</div>`;
  if(!pend.length&&!done.length)return html+'<div class="empty">No hay partidos.</div>';
  if(pend.length){ html+=`<div class="sched-grid">`; pend.forEach(m=>{html+=renderResInput(m);}); html+=`</div>`; }
  if(done.length){ html+=`<div style="margin:14px 0 8px;">Cargados</div><div class="sched-grid">`; done.forEach(m=>{html+=renderResDone(m);}); html+=`</div>`; }
  return html;
}

function renderResInput(m){
  const n1=pJ1(m.p1), n2=pJ1(m.p2), n1b=pJ2(m.p1), n2b=pJ2(m.p2);
  return `<div class="sched-card">
    <div class="sched-card-hdr">Grupo ${m.grupoId}</div>
    <div class="sched-card-body">
      <div class="res-grid">
        <div class="res-row">
          <div class="res-label">SET 1</div>
          <div class="res-col">
            <div class="res-name">${n1}<br><span style="font-size:11px;color:var(--gray);">${n1b}</span></div>
            <div class="res-input-cell"><input type="number" id="s1a_${m.id}" min="0" max="9" placeholder=""></div>
          </div>
          <div class="res-divider">|</div>
          <div class="res-col">
            <div class="res-name">${n2}<br><span style="font-size:11px;color:var(--gray);">${n2b}</span></div>
            <div class="res-input-cell"><input type="number" id="s1b_${m.id}" min="0" max="9" placeholder=""></div>
          </div>
        </div>
      </div>
      <button class="btn btn-pink btn-sm btn-full" style="margin-top:12px;" onclick="saveRes('${m.id}')">Confirmar</button>
    </div>
  </div>`;
}

function renderResDone(m){
  let w1=0,w2=0; m.sets.forEach(s=>{if(s[0]>s[1])w1++;else w2++;});
  return `<div class="sched-card"><div class="sched-card-hdr">Grupo ${m.grupoId}${m.simulated?` <span class="sim-badge">simulado</span>`:''}</div><div class="sched-card-body"><div class="sched-card-vs" style="margin-bottom:6px;"><strong style="color:${w1>w2?'var(--pink)':'inherit'}">${pNombre(m.p1)}</strong><br><span style="color:var(--gray-light);">vs</span><br><strong style="color:${w2>w1?'var(--pink)':'inherit'}">${pNombre(m.p2)}</strong></div><div style="text-align:center;font-size:13px;font-weight:500;color:var(--pink);margin-bottom:8px;">${m.sets.map(s=>s[0]+'-'+s[1]).join(' ')}</div><button class="btn btn-red btn-sm btn-full" onclick="delRes('${m.id}')">Borrar</button></div></div>`;
}

async function saveRes(mId){
  const m=partidos.find(p=>p.id===mId); if(!m)return; const sets=[];
  const a=document.getElementById(`s1a_${mId}`)?.value, b=document.getElementById(`s1b_${mId}`)?.value;
  if(a!==''&&b!==''&&a!==undefined)sets.push([parseInt(a)||0,parseInt(b)||0]);
  if(!sets.length){showToast('Ingresá resultado');return;}
  let w1=0,w2=0;sets.forEach(s=>{if(s[0]>s[1])w1++;else w2++;}); if(w1===w2){showToast('Debe haber ganador');return;}
  m.sets=sets; m.played=true; m.simulated=false;
  await supabaseClient.from('partidos').update({sets,jugado:true,simulado:false}).eq('id',mId);
  renderA(); renderJContent(); showToast('Guardado');
}
async function delRes(mId){
  const m=partidos.find(p=>p.id===mId); if(!m)return; m.sets=[]; m.played=false; m.simulated=false;
  await supabaseClient.from('partidos').update({sets:[],jugado:false,simulado:false}).eq('id',mId); renderA(); showToast('Borrado');
}

function renderSectionPlayoff(cat){
  const mode=playoffMode[cat];
  let html=`<div class="ibar">Elegí el formato de playoff.</div><div class="toggle-group"><button class="toggle-btn ${mode==='cuartos'?'active':''}" onclick="setPlayoffMode('${cat}','cuartos')">Cuartos (8)</button><button class="toggle-btn ${mode==='semis'?'active':''}" onclick="setPlayoffMode('${cat}','semis')">Semis (4)</button></div>`;
  const{qualFirsts,qualSeconds,cfg}=getSeeds(cat);
  const po=playoffData[cat];

  let displayedQualifiers = [];
  if (po && po.rounds && po.rounds[0]) {
    const idsInBracket = [];
    po.rounds[0].matches.forEach(m => { if(m.p1) idsInBracket.push(m.p1); if(m.p2) idsInBracket.push(m.p2); });
    const allStats = [];
    grupos[cat].forEach(g => { getStats(g.id, cat).forEach((p, i) => allStats.push({...p, grupoId: g.id, rank: i+1})); });
    displayedQualifiers = idsInBracket.map(id => {
       const found = allStats.find(x => x.id === id); if(found) return found;
       const p = getP(id); return p ? {...p, grupoId: '?', rank: '?'} : {id, j1: '?', j2: '?', grupoId: '?', rank: '?'};
    });
  } else {
    displayedQualifiers = [...qualFirsts,...qualSeconds].slice(0,cfg.total);
  }

  const baseTotal=qualFirsts.length+qualSeconds.length;
  html+=`<div class="ibar">Modo clasificación: <strong>${CLASIF_LABELS[clasificacionMode[cat]]}</strong></div>`;
  html+=`<div style="font-size:12px;font-weight:500;color:var(--pink);margin-bottom:8px;">Clasificados actuales (${displayedQualifiers.length}/${cfg.total})</div><div class="grupo"><div class="table-scroll"><table class="grupo-table"><thead><tr><th>#</th><th class="thl">Pareja</th><th>Grupo</th><th>Vía</th></tr></thead><tbody>`;
  
  displayedQualifiers.forEach((s,i)=>{
    const shade=i%2===1;
    let viaStr = s.rank === 1 ? '1°' : (s.rank === 2 ? 'Mejor 2°' : 'Elección manual');
    if(!po && i < qualFirsts.length) viaStr = '1°'; 
    if(!po && i >= qualFirsts.length) viaStr = 'Mejor 2°';
    html+=`<tr class="${shade?'shade':''}"><td><span class="pos-badge ${viaStr==='1°'?'pos-1':'pos-2'}">${i+1}</span></td><td class="tdl"><div class="pnames"><span>${s.j1}</span><span>${s.j2}</span></div></td><td>${s.grupoId}</td><td>${viaStr}</td></tr>`;
  });
  
  html+=`</tbody></table></div></div>`;
  if(baseTotal<cfg.total && !po) html+=`<div class="ibar" style="margin-top:10px;">Faltan resultados para los ${cfg.total} cupos.</div>`;
  else if(baseTotal>cfg.total && !po) html+=`<div class="ibar" style="margin-top:10px;background:#fffbeb;border-color:#fde047;color:#854d0e;">⚠️ El modo de clasificación da ${baseTotal} clasificados, pero el formato solo tiene ${cfg.total} cupos.</div>`;

  html+=`<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;"><button class="btn btn-out btn-sm" onclick="generarPreview('${cat}')">${!po||po.isPreview?'Generar / actualizar':'Actualizar'} vista previa</button>${po?`<button class="btn btn-blk btn-sm" onclick="confirmarPlayoff('${cat}')">Confirmar cuadro</button><button class="btn btn-red btn-sm" onclick="resetPlayoff('${cat}')">Resetear cuadro</button>`:''}</div>`;

  if(po){
    html+=`<div style="margin-top:1.2rem;">${po.isPreview?`<div class="preview-banner">⚠️ Vista previa.</div>`:''}${renderBracketTree(po,cat)}</div>`;
    html+=`<div style="margin-top:1.5rem;font-size:12px;font-weight:500;color:var(--pink);">Editar cruces y resultados</div>`;
    const allPs=grupos[cat].flatMap(g=>g.parejas);
    po.rounds.forEach((r,ri)=>{
      html+=`<div style="font-size:12px;font-weight:500;color:var(--gray);margin:10px 0 6px;">${r.name}</div>`;
      r.matches.forEach((m,mi)=>{
        const opts=p=>allPs.map(x=>`<option value="${x.id}" ${m[p]===x.id?'selected':''}>${x.j1} / ${x.j2}</option>`).join('');
        html+=`<div style="padding:10px;background:#fafafa;border:1.5px solid #ddd;border-radius:10px;margin-bottom:8px;"><div style="font-size:11px;color:var(--gray-light);margin-bottom:6px;">${r.name} — Cruce ${mi+1}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;"><div><label style="margin-top:0;">Pareja A</label><select onchange="editPOT('${cat}',${ri},${mi},'p1',this.value)"><option value="">— Por definir —</option>${opts('p1')}</select></div><div><label style="margin-top:0;">Pareja B</label><select onchange="editPOT('${cat}',${ri},${mi},'p2',this.value)"><option value="">— Por definir —</option>${opts('p2')}</select></div></div>`;
        if(m.sets&&m.sets.length){
          let w1=0,w2=0;m.sets.forEach(s=>{if(s[0]>s[1])w1++;else w2++;});
          html+=`<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 8px;background:#fff;border:1px solid #eee;border-radius:8px;font-size:12px;flex-wrap:wrap;gap:6px;"><span><span style="color:var(--pink);font-weight:500;">${w1>w2?pNombre(m.p1):pNombre(m.p2)}</span> — ${m.sets.map(s=>s[0]+'-'+s[1]).join(' ')}</span><button class="btn btn-red btn-sm" onclick="delPO('${cat}',${ri},${mi})">Borrar</button></div>`;
        }else{
          const n1=m.p1?pNombre(m.p1):'Pareja A', n2=m.p2?pNombre(m.p2):'Pareja B';
          html+=`<div class="res-grid" style="margin-top:12px;">
            <div class="res-row">
              <div class="res-label">SET 1</div>
              <div class="res-col">
                <div class="res-name" style="font-size:13px;">${n1}</div>
                <div class="res-input-cell"><input type="number" id="po_s1a_${ri}_${mi}" min="0" max="9" placeholder=""></div>
              </div>
              <div class="res-divider">|</div>
              <div class="res-col">
                <div class="res-name" style="font-size:13px;">${n2}</div>
                <div class="res-input-cell"><input type="number" id="po_s1b_${ri}_${mi}" min="0" max="9" placeholder=""></div>
              </div>
            </div>
          </div>
          <button class="btn btn-pink btn-sm btn-full" style="margin-top:14px;" onclick="savePO('${cat}',${ri},${mi})">Confirmar</button>`;
        }
        html+=`</div>`;
      });
    });
  }
  return html;
}

async function setPlayoffMode(cat,mode){ playoffMode[cat]=mode; await supabaseClient.from('configuracion').upsert({clave:'playoff_mode',valor:playoffMode}); renderA(); }
function buildFirstVsSecondPairing(firsts, seconds){
  const usedSeconds=new Array(seconds.length).fill(false), pairs=[];
  firsts.forEach(f=>{
    let chosenIdx=-1;
    for(let i=0;i<seconds.length;i++){ if(!usedSeconds[i] && seconds[i].grupoId!==f.grupoId){chosenIdx=i;break;} }
    if(chosenIdx===-1) for(let i=0;i<seconds.length;i++) if(!usedSeconds[i]){chosenIdx=i;break;}
    if(chosenIdx!==-1){ usedSeconds[chosenIdx]=true; pairs.push({first:f,second:seconds[chosenIdx]}); }else{ pairs.push({first:f,second:null}); }
  }); return pairs;
}
function seedPositionsForBracket(n){ if(n===2) return [0,1]; if(n===4) return [0,3,1,2]; return [0,1,2,3]; }
function buildRoundsForMode(cat,seedsData){
  const cfg=getPlayoffConfig(cat), qualFirsts=seedsData.qualFirsts||[], qualSeconds=seedsData.qualSeconds||[], slots=cfg.total/2;
  const pairs=buildFirstVsSecondPairing(qualFirsts.slice(0,slots),qualSeconds.slice(0,slots));
  const order=seedPositionsForBracket(slots), orderedPairs=order.map(i=>pairs[i]||{first:null,second:null});
  if(cfg.total===4) return[{name:'Semifinales',matches:[{id:'sf1',p1:orderedPairs[0]?.first?.id||null,p2:orderedPairs[0]?.second?.id||null,sets:[],winner:null},{id:'sf2',p1:orderedPairs[1]?.first?.id||null,p2:orderedPairs[1]?.second?.id||null,sets:[],winner:null}]},{name:'Final',matches:[{id:'f1',p1:null,p2:null,sets:[],winner:null}]}];
  return[{name:'Cuartos de final',matches:[{id:'qf1',p1:orderedPairs[0]?.first?.id||null,p2:orderedPairs[0]?.second?.id||null,sets:[],winner:null},{id:'qf2',p1:orderedPairs[1]?.first?.id||null,p2:orderedPairs[1]?.second?.id||null,sets:[],winner:null},{id:'qf3',p1:orderedPairs[2]?.first?.id||null,p2:orderedPairs[2]?.second?.id||null,sets:[],winner:null},{id:'qf4',p1:orderedPairs[3]?.first?.id||null,p2:orderedPairs[3]?.second?.id||null,sets:[],winner:null}]},{name:'Semifinales',matches:[{id:'sf1',p1:null,p2:null,sets:[],winner:null},{id:'sf2',p1:null,p2:null,sets:[],winner:null}]},{name:'Final',matches:[{id:'f1',p1:null,p2:null,sets:[],winner:null}]}];
}

async function generarPreview(cat){
  playoffData[cat]={rounds:buildRoundsForMode(cat,getSeeds(cat)),isPreview:true};
  await supabaseClient.from('playoff').upsert({categoria:cat,datos:{rounds:playoffData[cat].rounds},es_vista_previa:true});
  renderA(); renderJContent(); showToast('Vista previa generada');
}
async function confirmarPlayoff(cat){
  if(playoffData[cat]) playoffData[cat].isPreview=false;
  await supabaseClient.from('playoff').upsert({categoria:cat,datos:{rounds:playoffData[cat].rounds},es_vista_previa:false});
  renderA(); renderJContent(); showToast('Confirmado');
}
async function resetPlayoff(cat){
  if(!confirm('¿Seguro?'))return; playoffData[cat]=null;
  await supabaseClient.from('playoff').delete().eq('categoria',cat); renderA(); renderJContent(); showToast('Eliminado');
}
async function editPOT(cat,ri,mi,f,v){ playoffData[cat].rounds[ri].matches[mi][f]=v||null; await supabaseClient.from('playoff').upsert({categoria:cat,datos:{rounds:playoffData[cat].rounds},es_vista_previa:playoffData[cat].isPreview}); renderA(); renderJContent(); showToast('Guardado'); }

async function savePO(cat,ri,mi){
  const m=playoffData[cat].rounds[ri].matches[mi];const sets=[];
  const a=document.getElementById(`po_s1a_${ri}_${mi}`)?.value, b=document.getElementById(`po_s1b_${ri}_${mi}`)?.value;
  if(a!==''&&b!==''&&a!==undefined)sets.push([parseInt(a)||0,parseInt(b)||0]);
  if(!sets.length){showToast('Ingresá resultado');return;}
  let w1=0,w2=0;sets.forEach(s=>{if(s[0]>s[1])w1++;else w2++;}); if(w1===w2){showToast('Debe haber ganador');return;}
  m.sets=sets;m.winner=w1>w2?m.p1:m.p2;
  const nr=playoffData[cat].rounds[ri+1];
  if(nr){const nm=nr.matches[Math.floor(mi/2)];if(nm){if(mi%2===0)nm.p1=m.winner;else nm.p2=m.winner;}}
  await supabaseClient.from('playoff').upsert({categoria:cat,datos:{rounds:playoffData[cat].rounds},es_vista_previa:playoffData[cat].isPreview}); renderA(); renderJContent(); showToast('Guardado');
}
async function delPO(cat,ri,mi){
  const m=playoffData[cat].rounds[ri].matches[mi];m.sets=[];m.winner=null;
  await supabaseClient.from('playoff').upsert({categoria:cat,datos:{rounds:playoffData[cat].rounds},es_vista_previa:playoffData[cat].isPreview}); renderA(); renderJContent(); showToast('Borrado');
}

function showToast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200);}

initApp();
