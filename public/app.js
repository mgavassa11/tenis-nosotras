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

const TB_LABELS={pts:'Puntos',bal:'Diferencia de games',gg:'Games ganados',h2h:'Enfrentamiento directo'};
const CAT_LABELS={"1era":"1era","2da":"2da","3era":"3era"};

// ---- ESTADO GLOBAL (se llena leyendo de Supabase) ----
let grupos={"1era":[],"2da":[],"3era":[]};
let partidos=[];
let matchSchedule={};
let playoffData={"1era":null,"2da":null,"3era":null};
let playoffMode={"1era":"semis","2da":"cuartos","3era":"cuartos"};
let tiebreakOrder=["pts","bal","gg","h2h"];
let reglamentoText="";
// Modo de clasificación por categoría:
// "1ros"        -> solo todos los 1ros
// "1ros_2dos"   -> todos los 1ros y todos los 2dos
// "1ro_mejor1"  -> todos los 1ros + el mejor 2do de la totalidad de los grupos
// "1ro_mejor2"  -> todos los 1ros + los 2 mejores 2dos de la totalidad de los grupos
// "1ro_mejor3"  -> todos los 1ros + los 3 mejores 2dos de la totalidad de los grupos
let clasificacionMode={"1era":"1ro_mejor1","2da":"1ro_mejor1","3era":"1ro_mejor1"};

const CLASIF_LABELS={
  "1ros":"Todos los 1º",
  "1ros_2dos":"Todos los 1º y 2º",
  "1ro_mejor1":"Todos los 1º y el mejor 2º",
  "1ro_mejor2":"Todos los 1º y los 2 mejores 2º",
  "1ro_mejor3":"Todos los 1º y los 3 mejores 2º",
};

// Datos generales del torneo (editables por el admin)
let torneoInfo={
  emoji:"🎾",
  nombre:"Tenis y Nosotras × club24",
  subtitulo:"Torneo Americano de Damas — 26 de Junio · Los Cardales Country Club"
};
// Lista de imágenes de sponsors (URLs), agregadas por el admin.
let sponsors=[];

const state={
  mainView:"jugadoras",
  cat:"1era",adminCat:"1era",
  subTabJ:"grupos",
  liveCat:"1era",
  liveSubTab:"grupos",
  adminSection:"pairs",
  adminPairsGroup:{},
  adminUnlocked:false,
  schedSubTab:"grupos", // "grupos" | "playoff"
  proximosFilter:"horario", // "horario" | "buscar"
  proximosBuscarNombre:"",
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
    {clave:'tiebreak_order',valor:["pts","bal","gg","h2h"]},
    {clave:'clasificacion_mode',valor:{"1era":"1ro_mejor1","2da":"1ro_mejor1","3era":"1ro_mejor1"}}
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
    if(row.clave==='reglamento') reglamentoText=row.valor||'';
    if(row.clave==='clasificacion_mode') clasificacionMode={...clasificacionMode,...row.valor};
    if(row.clave==='torneo_info') torneoInfo={...torneoInfo,...row.valor};
    if(row.clave==='sponsors') sponsors=row.valor||[];
    if(row.clave==='grupos_vacios'){
      // Grupos creados por el admin que todavía no tienen parejas cargadas.
      // Los agregamos solo si no quedaron ya representados por alguna pareja.
      const vacios=row.valor||{};
      ["1era","2da","3era"].forEach(c=>{
        (vacios[c]||[]).forEach(gid=>{
          if(!grupos[c].some(g=>g.id===gid)){
            grupos[c].push({id:gid,parejas:[]});
          }
        });
      });
    }
  });

  Object.keys(grupos).forEach(cat=>{
    grupos[cat].sort((a,b)=>a.id.localeCompare(b.id));
  });

  ["1era","2da","3era"].forEach(c=>{
    if(grupos[c].length && !state.adminPairsGroup[c]) state.adminPairsGroup[c]=grupos[c][0].id;
  });
}
// Guarda en Supabase la lista de grupos que existen pero todavía no tienen
// ninguna pareja cargada, para que no se pierdan al recargar la página.
async function saveGruposVacios(){
  const vacios={};
  ["1era","2da","3era"].forEach(c=>{
    vacios[c]=grupos[c].filter(g=>g.parejas.length===0).map(g=>g.id);
  });
  await supabaseClient.from('configuracion').upsert({clave:'grupos_vacios',valor:vacios});
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
// Cuántas posiciones por grupo clasifican SIEMPRE (línea de corte fija):
// 1 para todos los modos salvo "1ros_2dos" donde clasifican los 2 primeros.
function getCutPos(cat){
  const mode=clasificacionMode[cat];
  if(mode==='1ros_2dos')return 2;
  return 1;
}
// Cuántos cupos de "mejor 2do" hay en total según el modo elegido.
// null significa "todos los segundos" (no hay ranking, todos clasifican).
function getCuposMejoresSegundos(cat){
  const mode=clasificacionMode[cat];
  if(mode==='1ros')return 0;
  if(mode==='1ros_2dos')return null; // todos los segundos clasifican, sin ranking
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
  let w1=0,w2=0;
  m.sets.forEach(s=>{if(s[0]>s[1])w1++;else w2++;});
  const aIsP1=m.p1===pairAId;
  const aWon=aIsP1?w1>w2:w2>w1;
  return aWon?1:-1;
}

// Sorteo estable: usamos el id de la pareja como semilla simple para que el
// resultado del sorteo no cambie en cada render (no es aleatorio en cada
// pantalla, pero tampoco sigue ningún criterio deportivo real).
function ordenSorteo(bloque){
  return[...bloque].sort((a,b)=>a.id.localeCompare(b.id));
}

// ====================================================
// DESEMPATE DENTRO DE UN GRUPO (orden fijo, no configurable):
// 1. Puntos
// 2. Si son exactamente 2 empatadas: cara a cara directo entre ellas
// 3. Si son 3 o más empatadas: diferencia de games considerando TODOS
//    los partidos del grupo (no solo entre las empatadas). Las que
//    sigan empatadas de a 2 en esa diferencia se resuelven por cara a
//    cara directo entre ellas. Si siguen empatadas de a 3 o más en esa
//    diferencia (ciclo perfecto), se define por sorteo.
// ====================================================
function ordenarGrupoConDesempate(stats,gId){
  // Agrupar por puntos (de mayor a menor)
  const porPuntos={};
  stats.forEach(p=>{
    if(!porPuntos[p.pts])porPuntos[p.pts]=[];
    porPuntos[p.pts].push(p);
  });
  const puntosOrdenados=Object.keys(porPuntos).map(Number).sort((a,b)=>b-a);

  let resultado=[];
  puntosOrdenados.forEach(pts=>{
    const grupo=porPuntos[pts];
    resultado=resultado.concat(desempatarBloque(grupo,gId));
  });
  return resultado;
}

// Desempata un bloque de parejas que están empatadas en puntos.
function desempatarBloque(bloque,gId){
  if(bloque.length===1)return bloque;

  if(bloque.length===2){
    const r=h2hResult(bloque[0].id,bloque[1].id,gId);
    if(r===1)return[bloque[0],bloque[1]];
    if(r===-1)return[bloque[1],bloque[0]];
    // Si no se jugó el partido entre sí todavía: queda indefinido por ahora
    return bloque;
  }

  // 3 o más empatadas en puntos: diferencia de games del GRUPO COMPLETO
  // (ya viene calculada en p.bal con todos los partidos jugados del grupo).
  const porBalance={};
  bloque.forEach(p=>{
    if(!porBalance[p.bal])porBalance[p.bal]=[];
    porBalance[p.bal].push(p);
  });
  const balOrdenados=Object.keys(porBalance).map(Number).sort((a,b)=>b-a);

  let resultado=[];
  balOrdenados.forEach(bal=>{
    const subBloque=porBalance[bal];
    if(subBloque.length===1){
      resultado=resultado.concat(subBloque);
    }else if(subBloque.length===2){
      // Dos parejas con la misma diferencia general: cara a cara entre ellas
      const r=h2hResult(subBloque[0].id,subBloque[1].id,gId);
      if(r===1)resultado=resultado.concat([subBloque[0],subBloque[1]]);
      else if(r===-1)resultado=resultado.concat([subBloque[1],subBloque[0]]);
      else resultado=resultado.concat(subBloque); // no jugaron entre sí: indefinido
    }else{
      // 3 o más con exactamente la misma diferencia general: ciclo
      // perfecto, no hay más criterios deportivos → sorteo.
      resultado=resultado.concat(ordenSorteo(subBloque));
    }
  });
  return resultado;
}

function getStats(gId,cat){
  const raw=getStatsRaw(gId,cat);
  return ordenarGrupoConDesempate(raw,gId);
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
// ====================================================
// DESEMPATE ENTRE MEJORES SEGUNDOS (orden fijo, no configurable):
// 1. Puntos
// 2. Diferencia de games (balance)
// 3. Games ganados
// 4. Games perdidos (menos es mejor)
// 5. Si los 4 criterios anteriores son exactamente iguales: sorteo
// ====================================================
function compararMejoresSegundos(a,b){
  if(a.pts!==b.pts)return b.pts-a.pts;
  if(a.bal!==b.bal)return b.bal-a.bal;
  if(a.gg!==b.gg)return b.gg-a.gg;
  if(a.gp!==b.gp)return a.gp-b.gp; // menos games perdidos es mejor
  return 0; // empate total en los 4 criterios: se resuelve después por sorteo
}
// Ordena una lista completa aplicando los 4 criterios y, para los bloques
// que terminen exactamente empatados en los 4, aplica sorteo (mismo criterio
// estable que usamos para el desempate dentro de los grupos).
function ordenarMejoresConSorteo(lista){
  const ordenada=[...lista].sort(compararMejoresSegundos);
  let resultado=[];
  let i=0;
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

  // Cuántos segundos clasifican según el modo elegido en "Clasificación":
  // 0 ("1ros"), null=todos ("1ros_2dos"), o 1/2/3 (mejor 2do, 2 mejores, 3 mejores).
  const cuposSegundos=getCuposMejoresSegundos(cat);

  let qF,qS;
  if(cuposSegundos===0){
    // Solo clasifican los primeros: tomamos tantos primeros como cupos
    // tenga el cuadro de playoff (cfg.total).
    qF=firstsOrdenados.slice(0,cfg.total);
    qS=[];
  }else if(cuposSegundos===null){
    // Todos los primeros y todos los segundos clasifican: el cuadro de
    // playoff necesita cfg.total parejas en total, repartidas entre todos
    // los primeros (hasta donde alcancen) y luego los segundos que falten.
    qF=firstsOrdenados.slice(0,cfg.total);
    const faltan=Math.max(0,cfg.total-qF.length);
    qS=secondsOrdenados.slice(0,faltan);
  }else{
    // Todos los primeros + una cantidad fija de mejores segundos (1, 2 o 3),
    // tal como se definió en la pestaña Clasificación — independiente del
    // total de cupos del cuadro de playoff.
    qF=firstsOrdenados.slice(0,firstsOrdenados.length);
    qS=secondsOrdenados.slice(0,cuposSegundos);
  }

  return{firsts:firstsOrdenados,seconds:secondsOrdenados,qualFirsts:qF,qualSeconds:qS,cfg};
}
function getChampion(cat){
  const po=playoffData[cat];
  if(!po||po.isPreview)return null;
  const fr=po.rounds[po.rounds.length-1];
  if(!fr||!fr.matches[0]?.winner)return null;
  return fr.matches[0].winner;
}

// ====================================================
// CLASIFICACIÓN VISUAL (líneas de corte y notas), independiente del
// armado del cuadro de playoff. Devuelve, para cada grupo, en qué
// posición termina la línea de corte de "clasificados directos" (1° o
// 1°+2°), y si hace falta el ranking de mejores segundos, devuelve
// también el set de ids que efectivamente clasifican ahí y si hay un
// empate sin resolver en el límite (para mostrar la nota de sorteo).
// ====================================================
function getClasificacionInfo(cat){
  const mode=clasificacionMode[cat];
  const cutPos=getCutPos(cat); // 1 o 2
  const cupos=getCuposMejoresSegundos(cat); // null=todos, o 0/1/2/3

  // Si el modo es "1ros" (cupos=0) o "1ros_2dos" (cupos=null, todos clasifican),
  // no hay ranking de mejores segundos que mostrar.
  const usaRankingSegundos = mode==='1ro_mejor1'||mode==='1ro_mejor2'||mode==='1ro_mejor3';

  let secondsIds=new Set();
  let empateEnLimite=false;
  if(usaRankingSegundos){
    const seconds=[];
    grupos[cat].forEach(g=>{
      const st=getStats(g.id,cat);
      if(st[1])seconds.push({...getAdj(st[1],g.id,cat),grupoId:g.id});
    });
    const ordenados=ordenarMejoresConSorteo(seconds);
    const tomados=ordenados.slice(0,cupos);
    tomados.forEach(s=>secondsIds.add(s.id));
    // Detectar si hay empate exacto sin resolver justo en el límite del corte
    // (comparamos la última que entra contra la primera que queda afuera).
    if(ordenados.length>cupos){
      const ultimaQueEntra=ordenados[cupos-1];
      const primeraQueQuedaAfuera=ordenados[cupos];
      if(ultimaQueEntra&&primeraQueQuedaAfuera&&compararMejoresSegundos(ultimaQueEntra,primeraQueQuedaAfuera)===0){
        empateEnLimite=true;
      }
    }
  }
  return{cutPos,cupos,usaRankingSegundos,secondsIds,empateEnLimite};
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
    <li>Puntos</li>
    <li>Si son 2 empatadas: resultado cara a cara entre ellas</li>
    <li>Si son 3 o más empatadas: diferencia de games de todo el grupo</li>
    <li>Las que sigan empatadas de a 2 en esa diferencia: cara a cara entre ellas</li>
    <li>Si sigue el empate entre 3 o más (ciclo perfecto): sorteo</li>
  </ol></div>`;
}

// ====================================================
// VISTA JUGADORAS / LIVE (compartida)
// ====================================================
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
  const el=document.getElementById(targetElId);
  if(!el)return;
  let html='';

  if(subTab==='reglamento'){
    html+=`<div class="phase-label">Reglamento del torneo</div>`;
    html+=`<div class="reglamento-card">${renderReglamentoHtml(reglamentoText)}</div>`;
    el.innerHTML=html;
    return;
  }

  if(subTab==='direcciones'){
    html+=`<div class="phase-label">Cómo llegar</div>`;
    html+=`<a href="https://maps.app.goo.gl/xM1vZvBGgTdRXCtk8" target="_blank" rel="noopener noreferrer" class="btn btn-pink btn-full" style="margin-bottom:1.2rem;text-decoration:none;">📍 Cómo llegar a Cardales</a>`;
    html+=`<div class="map-card">
      <img src="https://i.imgur.com/966dTmZ.jpeg" alt="Mapa de acceso a las canchas" class="map-img">
      <div class="map-caption"><span class="map-dash">- - - -</span> dirección a canchas 11-20 caminando</div>
      <div class="map-caption"><span class="map-line">━━━━━</span> dirección a canchas 11-20 en auto</div>
    </div>`;
    el.innerHTML=html;
    return;
  }

  if(subTab==='proximos'){
    const pendGrupos=partidos.filter(m=>m.cat===cat&&!m.played);
    const pendPlayoff=playoffData[cat]
      ? playoffData[cat].rounds.flatMap(r=>r.matches
          .filter(m=>m.p1&&m.p2&&(!m.sets||!m.sets.length))
          .map(m=>({...m,grupoId:r.name,isPlayoff:true})))
      : [];
    let pend=[...pendPlayoff,...pendGrupos];
    // Orden por horario: los que tienen hora fija van primero (de más
    // temprano a más tarde), los "a continuación de" después, y los que
    // todavía no tienen ningún dato cargado quedan al final.
    pend.sort((a,b)=>{
      const sa=getSched(a.id),sb=getSched(b.id);
      const rank=s=> s.hora ? 0 : (s.after ? 1 : 2);
      const ra=rank(sa),rb=rank(sb);
      if(ra!==rb)return ra-rb;
      if(ra===0)return sa.hora.localeCompare(sb.hora);
      return 0;
    });
    html+=`<div class="phase-label">Próximos partidos</div>`;
    html+=`<div class="toggle-group" style="margin-bottom:14px;">
      <button class="toggle-btn ${state.proximosFilter==='horario'?'active':''}" onclick="setProximosFilter('horario')">Por horario</button>
      <button class="toggle-btn ${state.proximosFilter==='buscar'?'active':''}" onclick="setProximosFilter('buscar')">Buscar jugadora</button>
    </div>`;

    if(state.proximosFilter==='buscar'){
      // Lista única de jugadoras de esta categoría (sin duplicar nombres
      // repetidos) para elegir en el selector.
      const nombresSet=new Set();
      grupos[cat].forEach(g=>g.parejas.forEach(p=>{nombresSet.add(p.j1);nombresSet.add(p.j2);}));
      const nombres=[...nombresSet].sort((a,b)=>a.localeCompare(b,'es',{sensitivity:'base'}));
      const selected=state.proximosBuscarNombre||'';
      html+=`<select id="proximosBuscarSelect" onchange="setProximosBuscarNombre(this.value)" style="margin-bottom:14px;">
        <option value="">— Elegí una jugadora —</option>
        ${nombres.map(n=>`<option value="${n}" ${n===selected?'selected':''}>${n}</option>`).join('')}
      </select>`;
    }

    if(!pend.length){
      html+='<div class="empty">No hay partidos pendientes.</div>';
    }else if(state.proximosFilter==='buscar'){
      const nombre=state.proximosBuscarNombre;
      if(!nombre){
        html+='<div class="empty">Elegí una jugadora para ver únicamente sus próximos partidos.</div>';
      }else{
        const propios=pend.filter(m=>{
          const p1=getP(m.p1),p2=getP(m.p2);
          return (p1&&(p1.j1===nombre||p1.j2===nombre))||(p2&&(p2.j1===nombre||p2.j2===nombre));
        });
        if(!propios.length){
          html+=`<div class="empty">${nombre} no tiene partidos pendientes.</div>`;
        }else{
          propios.forEach(m=>{html+=renderJugadoraEntry(nombre,m);});
        }
      }
    }else{
      pend.forEach(m=>{html+=renderPCard(m);});
    }
    el.innerHTML=html;
    return;
  }

  if(!grupos[cat]||!grupos[cat].length){
    el.innerHTML='<div class="empty">Todavía no hay parejas cargadas en esta categoría.</div>';
    return;
  }

  // SPONSORS: solo se muestran si el administrador cargó al menos uno.
  // Van justo entre los tabs/sub-tabs y el contenido de grupos.
  if(sponsors.length){
    html+=`<div class="sponsors-strip">`;
    sponsors.forEach(url=>{
      html+=`<img src="${url}" alt="Sponsor" class="sponsor-img">`;
    });
    html+=`</div>`;
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

  // PLAYOFF ARRIBA, si ya fue creado
  if(playoffData[cat]){
    html+=`<div class="phase-label">Playoff</div>`;
    if(playoffData[cat].isPreview){
      html+=`<div class="preview-banner">⚠️ Vista previa — el administrador todavía puede modificar este cuadro.</div>`;
    }
    html+=renderBracketTree(playoffData[cat],cat);
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

  // ZONA DE GRUPOS DEBAJO
  const clasifInfo=getClasificacionInfo(cat);
  html+=`<div class="phase-label" style="margin-top:${playoffData[cat]?'1.8rem':'0'};">Zona de grupos</div>`;
  grupos[cat].forEach(g=>{
    const stats=getStats(g.id,cat);
    if(!g.parejas.length){
      html+=`<div class="grupo"><div class="grupo-header">Grupo ${g.id} · sin parejas todavía</div></div>`;
      return;
    }
    let cutPos=clasifInfo.cutPos;
    // Si hay 2+ parejas empatadas exactamente en el límite del corte propio
    // del grupo (mismo Pts, Dif, GG y GP que la pareja en la posición de
    // corte), movemos la línea para abarcarlas a todas y avisamos que ese
    // tramo se define por sorteo dentro del grupo.
    let sorteoEnGrupo=false;
    if(stats.length>cutPos){
      const limite=stats[cutPos-1];
      let finBloque=cutPos;
      while(finBloque<stats.length &&
            stats[finBloque].pts===limite.pts &&
            stats[finBloque].bal===limite.bal &&
            stats[finBloque].gg===limite.gg &&
            stats[finBloque].gp===limite.gp){
        finBloque++;
      }
      if(finBloque>cutPos){
        cutPos=finBloque;
        sorteoEnGrupo=true;
      }
    }
    html+=`<div class="grupo">
      <div class="grupo-header">Grupo ${g.id} · ${g.parejas.length} parejas</div>
      <div class="table-scroll"><table class="grupo-table">
        <thead><tr><th style="width:26px">#</th><th class="thl">Pareja</th><th>Pts</th><th>G</th><th>P</th><th>GG</th><th>GP</th><th>Dif</th></tr></thead>
        <tbody>`;
    stats.forEach((p,i)=>{
      const shade=i%2===1,isCut=i===cutPos-1;
      // Además del corte de clasificación directa, marcamos también si esta
      // pareja (siendo 2da o peor) es una de las que efectivamente clasificó
      // como "mejor 2do" según el ranking general — útil cuando cutPos===1
      // pero hay más de un cupo de mejores segundos.
      html+=`<tr class="${shade?'shade':''} ${isCut?'cut-row':''}">
        <td><span class="pos-badge pos-${i+1}">${i+1}</span></td>
        <td class="tdl"><div class="pnames"><span>${p.j1}</span><span>${p.j2}</span></div></td>
        <td>${p.pts}</td><td>${p.gw}</td><td>${p.l}</td><td>${p.gg}</td><td>${p.gp}</td>
        <td>${p.bal>0?'+':''}${p.bal}</td>
      </tr>`;
    });
    html+=`</tbody></table></div>`;
    if(sorteoEnGrupo){
      html+=`<div class="cnote" style="color:#854d0e;background:#fffbeb;">⚠️ Empate exacto en el límite de clasificación de este grupo — se define por sorteo.</div>`;
    }
    const note=`🎾 ${CLASIF_LABELS[clasificacionMode[cat]]} clasifican${clasifInfo.usaRankingSegundos?` (2do compite por los mejores segundos para ${playoffMode[cat]})`:''}.`;
    html+=`<div class="cnote">${note}</div>
      <div class="legend-bar"><strong>Pts</strong>: puntos (3 x victoria) &nbsp;·&nbsp; <strong>G</strong>: ganados &nbsp;·&nbsp; <strong>P</strong>: perdidos &nbsp;·&nbsp; <strong>GG</strong>: games ganados &nbsp;·&nbsp; <strong>GP</strong>: games perdidos &nbsp;·&nbsp; <strong>Dif</strong>: diferencia de games (GG-GP)</div>
      ${tiebreakLegendHtml()}
    </div>`;
    html+=renderMatrixTable(g,cat);
  });

  if(clasifInfo.usaRankingSegundos&&seconds.length){
    const needed=clasifInfo.cupos;
    html+=`<div class="phase-label" style="margin-top:1.5rem;">Ranking mejores 2dos</div>`;
    html+=`<div class="grupo"><div class="grupo-header">Ranking 2dos puestos</div>
      <div class="table-scroll"><table class="grupo-table">
        <thead><tr><th>#</th><th class="thl">Pareja</th><th>Grupo</th><th>Pts</th><th>GG</th><th>GP</th><th>Dif</th></tr></thead><tbody>`;
    seconds.forEach((s,i)=>{
      const shade=i%2===1,cl=i<needed,isCut=i===needed-1&&needed<seconds.length;
      html+=`<tr class="${shade?'shade':''} ${isCut?'cut-row':''}">
        <td><span class="pos-badge ${cl?'pos-1':''}">${i+1}</span></td>
        <td class="tdl"><div class="pnames"><span>${s.j1}</span><span>${s.j2}</span></div></td>
        <td>${s.grupoId}</td><td>${s.pts}</td><td>${s.gg}</td><td>${s.gp}</td><td>${s.bal>0?'+':''}${s.bal}</td>
      </tr>`;
    });
    html+=`</tbody></table></div>`;
    if(clasifInfo.empateEnLimite){
      html+=`<div class="cnote" style="color:#854d0e;background:#fffbeb;">⚠️ Empate exacto en el límite de clasificación entre mejores segundos — se define por sorteo.</div>`;
    }
    html+=`<div class="cnote">${clasifInfo.cupos===1?'Clasifica el mejor segundo de la totalidad de los grupos.':`Clasifican los ${clasifInfo.cupos} mejores segundos de la totalidad de los grupos.`}</div>
      <div class="legend-bar">
        <strong>Cómo se rompe el empate entre segundos:</strong><br>
        1° criterio: más <strong>Pts</strong> (puntos obtenidos en su grupo).<br>
        2° criterio (si persiste el empate en puntos): mejor <strong>Dif</strong> (diferencia de games ganados menos perdidos).<br>
        3° criterio (si persiste el empate en diferencia): más <strong>GG</strong> (total de games ganados).<br>
        4° criterio (si persiste el empate en GG): menos <strong>GP</strong> (total de games perdidos).<br>
        5° criterio (si los 4 anteriores son exactamente iguales): sorteo.<br>
        En grupos de 5 parejas, las estadísticas del 2do se calculan excluyendo el partido contra la última pareja del grupo, para comparar en igualdad de partidos jugados con los segundos de grupos de 4.
      </div>
    </div>`;
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
  const labelText=m.isPlayoff?m.grupoId:`Grupo ${m.grupoId}`;
  return `<div class="partido">
    <div class="phdr"><span>${labelText}${stag}</span></div>
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

function setProximosFilter(f){
  state.proximosFilter=f;
  // Re-renderiza la vista correcta según dónde estemos parados
  // (vista pública de Jugadoras o Live dentro del panel de admin).
  if(state.mainView==='admin'&&state.adminSection==='live'){
    renderPublicView(state.liveCat,state.liveSubTab,'liveContent');
  }else{
    renderJContent();
  }
}
function setProximosBuscarNombre(nombre){
  state.proximosBuscarNombre=nombre;
  if(state.mainView==='admin'&&state.adminSection==='live'){
    renderPublicView(state.liveCat,state.liveSubTab,'liveContent');
  }else{
    renderJContent();
  }
}

// Tarjeta compacta para el filtro "Por jugadora (A-Z)": encabezada por el
// nombre de la jugadora individual, mostrando contra quién juega y los
// mismos datos de cancha/hora que la tarjeta de partido normal.
function renderJugadoraEntry(nombre,m){
  const rival1=getP(m.p1),rival2=getP(m.p2);
  const esP1=rival1&&(rival1.j1===nombre||rival1.j2===nombre);
  const companera=esP1?(rival1.j1===nombre?rival1.j2:rival1.j1):(rival2?.j1===nombre?rival2.j2:rival2?.j1);
  const rivalPareja=esP1?rival2:rival1;
  const rivalTxt=rivalPareja?`${rivalPareja.j1} / ${rivalPareja.j2}`:'Por definir';
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
  const labelText=m.isPlayoff?m.grupoId:`Grupo ${m.grupoId}`;
  return `<div class="partido">
    <div class="phdr"><span>${labelText}</span></div>
    <div class="pbody">
      <div class="pbody-teams">
        <div class="trow"><span class="tname win">${nombre}</span></div>
        <div class="trow" style="margin-top:2px;"><span class="tname" style="font-size:12px;color:var(--gray);">junto a ${companera||'?'}</span></div>
        <div class="trow" style="margin-top:6px;"><span class="tname" style="font-size:13px;color:var(--gray-light);">vs ${rivalTxt}</span></div>
      </div>
      ${schedHtml}
      <span class="pst spend">Pendiente</span>
    </div>
  </div>`;
}

function renderBracketTree(playoff,cat){
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
      // Buscar horario usando el slot fijo de playoff (po_1era_sf1, etc.)
      // en vez del ID del partido real (sf1), para que coincida con lo
      // cargado en Canchas y horarios → Playoff.
      const slotId=cat?`po_${cat}_${m.id}`:m.id;
      const sched=getSched(slotId)||getSched(m.id);
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
  html+=`</div>`; });
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
    <button class="pill-sm ${state.adminSection==='clasificacion'?'active':''}" onclick="switchAdminSection('clasificacion')">Clasificación</button>
    <button class="pill-sm ${state.adminSection==='playoff'?'active':''}" onclick="switchAdminSection('playoff')">Playoff</button>
    <button class="pill-sm ${state.adminSection==='tiebreak'?'active':''}" onclick="switchAdminSection('tiebreak')">Desempate</button>
    <button class="pill-sm ${state.adminSection==='reglamento'?'active':''}" onclick="switchAdminSection('reglamento')">Reglamento</button>
    <button class="pill-sm ${state.adminSection==='sponsors'?'active':''}" onclick="switchAdminSection('sponsors')">Sponsors</button>
    <button class="pill-sm ${state.adminSection==='torneoinfo'?'active':''}" onclick="switchAdminSection('torneoinfo')">Datos del torneo</button>
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
      <button class="pill-sm ${state.liveSubTab==='reglamento'?'active':''}" onclick="switchLiveSub('reglamento')">Reglamento</button>
      <button class="pill-sm ${state.liveSubTab==='direcciones'?'active':''}" onclick="switchLiveSub('direcciones')">Direcciones</button>
    `;
    renderPublicView(state.liveCat,state.liveSubTab,'liveContent');
    return;
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

// ====================================================
// CLASIFICACIÓN (qué parejas avanzan a playoff por categoría)
// ====================================================
function renderSectionClasificacion(cat){
  const mode=clasificacionMode[cat];
  let html=`<div class="ibar">Elegí cómo se define la clasificación a playoff para esta categoría. Esto determina cuántas parejas por grupo pasan directo y si hay ranking de mejores segundos.</div>`;
  html+=`<div class="tb-order-list">`;
  Object.keys(CLASIF_LABELS).forEach(key=>{
    const active=mode===key;
    html+=`<div class="tb-order-item" style="cursor:pointer;${active?'border-color:var(--pink);background:var(--pink-bg);':''}" onclick="setClasificacionMode('${cat}','${key}')">
      <div class="num" style="${active?'':'background:#e5e7eb;color:#555;'}">${active?'✓':''}</div>
      <div class="label">${CLASIF_LABELS[key]}</div>
    </div>`;
  });
  html+=`</div>`;
  html+=`<div class="legend-bar">
    <strong>Todos los 1º:</strong> solo clasifican los primeros de cada grupo.<br>
    <strong>Todos los 1º y 2º:</strong> clasifican primeros y segundos de todos los grupos, sin ranking entre segundos.<br>
    <strong>Todos los 1º y el mejor 2º:</strong> clasifican todos los primeros, y de los segundos, solo el mejor de la totalidad de los grupos.<br>
    <strong>Todos los 1º y los 2/3 mejores 2º:</strong> igual que el anterior, pero con 2 o 3 cupos de segundos en vez de 1.<br><br>
    Importante: el formato del cuadro de playoff (cuartos o semis, en la pestaña "Playoff") sigue siendo independiente de esta elección — esta pestaña define quién aparece marcado como clasificado en las tablas, mientras que el cuadro de playoff se sigue armando con la cantidad de cupos que necesite según el formato elegido ahí.
  </div>`;
  return html;
}
async function setClasificacionMode(cat,mode){
  clasificacionMode[cat]=mode;
  await supabaseClient.from('configuracion').upsert({clave:'clasificacion_mode',valor:clasificacionMode});
  // Refrescar tanto el panel de admin (la pestaña Clasificación en sí, y si
  // estamos en Live también esa vista) como la vista pública de Jugadoras.
  renderA();
  renderJContent();
  showToast('Modo de clasificación actualizado');
}

function renderSectionTiebreak(){
  let html=`<div class="ibar">Estos son los criterios de desempate fijos que aplica el sistema. No son editables porque siguen el reglamento oficial de la liga.</div>`;
  html+=`<div class="tb-order-list">
    <div class="tb-order-item"><div class="num">1</div><div class="label">Puntos</div></div>
    <div class="tb-order-item"><div class="num">2</div><div class="label">Si son 2 empatadas: cara a cara entre ellas</div></div>
    <div class="tb-order-item"><div class="num">3</div><div class="label">Si son 3+ empatadas: diferencia de games de todo el grupo</div></div>
    <div class="tb-order-item"><div class="num">4</div><div class="label">Las que sigan empatadas de a 2 en esa diferencia: cara a cara entre ellas</div></div>
    <div class="tb-order-item"><div class="num">5</div><div class="label">Si sigue el empate entre 3+ (ciclo perfecto): sorteo</div></div>
  </div>`;
  html+=`<div class="legend-bar">
    <strong>Puntos:</strong> total de puntos obtenidos en el grupo (3 por victoria).<br>
    <strong>Si son 2 empatadas:</strong> si ya jugaron entre sí, gana la posición quien ganó ese partido directo. Si todavía no jugaron entre sí, el empate queda indefinido hasta que se cargue ese resultado.<br>
    <strong>Si son 3 o más empatadas:</strong> se calcula la diferencia de games (games ganados menos perdidos) de cada una considerando TODOS los partidos jugados en el grupo, no solo los enfrentamientos entre las empatadas. La que tenga mejor diferencia general queda mejor posicionada.<br>
    <strong>Las que sigan empatadas de a 2</strong> en esa diferencia general se desempatan por el resultado directo entre ellas.<br>
    <strong>Sorteo:</strong> si 3 o más parejas tienen exactamente la misma diferencia de games general (por ejemplo un ciclo perfecto donde A le gana a B 4-0, B le gana a C 4-0 y C le gana a A 4-0), no queda ningún criterio deportivo para desempatar y se define por sorteo.
  </div>`;
  html+=`<div class="phase-label" style="margin-top:1.5rem;">Desempate entre mejores segundos (para clasificar a cuartos)</div>`;
  html+=`<div class="tb-order-list">
    <div class="tb-order-item"><div class="num">1</div><div class="label">Puntos</div></div>
    <div class="tb-order-item"><div class="num">2</div><div class="label">Diferencia de games</div></div>
    <div class="tb-order-item"><div class="num">3</div><div class="label">Games ganados</div></div>
    <div class="tb-order-item"><div class="num">4</div><div class="label">Games perdidos (menos es mejor)</div></div>
    <div class="tb-order-item"><div class="num">5</div><div class="label">Si los 4 anteriores son exactamente iguales: sorteo</div></div>
  </div>`;
  html+=`<div class="legend-bar">Se usa cuando hay que comparar los segundos puestos de distintos grupos entre sí. No incluye cara a cara porque esas parejas no se enfrentaron en la fase de grupos.</div>`;
  return html;
}

// ====================================================
// REGLAMENTO
// ====================================================
// ====================================================
// DATOS DEL TORNEO (nombre, fecha, lugar)
// ====================================================
function renderSectionTorneoInfo(){
  return `<div class="ibar">Estos datos aparecen en el encabezado de la app, visible para todas las jugadoras.</div>
    <label>Emoji / ícono</label>
    <input id="torneoEmojiInput" value="${torneoInfo.emoji}" maxlength="4" style="max-width:80px;">
    <label>Nombre del torneo</label>
    <input id="torneoNombreInput" value="${torneoInfo.nombre}">
    <label>Subtítulo (fecha, lugar, categoría, etc.)</label>
    <input id="torneoSubtituloInput" value="${torneoInfo.subtitulo}" placeholder="Ej: Torneo Americano de Damas — 26 de Junio · Los Cardales Country Club">
    <button class="btn btn-pink btn-sm" style="margin-top:10px;" onclick="saveTorneoInfo()">Guardar datos del torneo</button>`;
}
async function saveTorneoInfo(){
  torneoInfo={
    emoji:document.getElementById('torneoEmojiInput').value||'🎾',
    nombre:document.getElementById('torneoNombreInput').value||'Torneo',
    subtitulo:document.getElementById('torneoSubtituloInput').value||''
  };
  await supabaseClient.from('configuracion').upsert({clave:'torneo_info',valor:torneoInfo});
  renderMainTabs();
  if(state.mainView==='jugadoras')renderJ();
  else if(state.adminUnlocked)renderA();
  showToast('Datos del torneo guardados ✓');
}

// ====================================================
// SPONSORS (imágenes vía URL, mostradas solo si hay alguna cargada)
// ====================================================
function renderSectionSponsors(){
  let html=`<div class="ibar">Pegá el link directo de cada imagen (por ejemplo subiéndola primero a imgur.com/upload y copiando la dirección de la imagen — tiene que terminar en .png, .jpg o .jpeg). No se pueden subir archivos directamente desde acá, solo enlaces. Si no cargás ningún sponsor, esta sección no se muestra en la vista de las jugadoras.</div>`;
  html+=`<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;">
    <input id="newSponsorUrl" placeholder="https://i.imgur.com/ejemplo.png" style="flex:1;min-width:200px;">
    <button class="btn btn-pink btn-sm" onclick="addSponsor()">+ Agregar sponsor</button>
  </div>`;
  if(!sponsors.length){
    html+='<div class="empty">Todavía no hay sponsors cargados.</div>';
  }else{
    html+=`<div class="grupo" style="padding:10px 14px;">`;
    sponsors.forEach((url,i)=>{
      html+=`<div class="sponsor-admin-row">
        <img src="${url}" alt="Sponsor" onerror="this.style.opacity=0.3">
        <div class="surl">${url}</div>
        <button class="btn btn-red btn-sm" onclick="delSponsor(${i})">Borrar</button>
      </div>`;
    });
    html+=`</div>`;
  }
  return html;
}
async function addSponsor(){
  const input=document.getElementById('newSponsorUrl');
  const url=input.value.trim();
  if(!url){showToast('Pegá un link de imagen primero');return;}
  sponsors.push(url);
  await supabaseClient.from('configuracion').upsert({clave:'sponsors',valor:sponsors});
  renderA();
  if(state.mainView==='jugadoras')renderJContent();
  showToast('Sponsor agregado ✓');
}
async function delSponsor(i){
  sponsors.splice(i,1);
  await supabaseClient.from('configuracion').upsert({clave:'sponsors',valor:sponsors});
  renderA();
  if(state.mainView==='jugadoras')renderJContent();
  showToast('Sponsor eliminado');
}

function renderSectionReglamento(){
  return `<div class="ibar">Escribí acá el reglamento del torneo. Para hacer una lista con viñetas, empezá cada línea con un guión "-" o un asterisco "*". Los cambios se ven reflejados para todas las jugadoras apenas guardás.</div>
    <textarea id="reglamentoInput" rows="16" style="width:100%;padding:12px;border:1.5px solid #ccc;border-radius:10px;font-family:inherit;font-size:14px;line-height:1.6;resize:vertical;" placeholder="Ejemplo:
- Los partidos se juegan a 1 set / 4-5 games.
- En caso de empate se define con supertiebreak a 10 puntos.
- Las jugadoras deben presentarse 10 minutos antes del horario asignado.">${reglamentoText}</textarea>
    <button class="btn btn-pink btn-sm" style="margin-top:10px;" onclick="saveReglamento()">Guardar reglamento</button>`;
}
async function saveReglamento(){
  const val=document.getElementById('reglamentoInput').value;
  reglamentoText=val;
  await supabaseClient.from('configuracion').upsert({clave:'reglamento',valor:val});
  showToast('Reglamento guardado ✓');
}

// Convierte texto plano con líneas "- algo" o "* algo" en bullets prolijos,
// y deja las líneas normales como párrafos. Lo usamos tanto en la vista de
// jugadoras como en el panel de admin (modo solo lectura) para el reglamento.
function renderReglamentoHtml(text){
  if(!text||!text.trim()){
    return '<div class="empty">El administrador todavía no cargó el reglamento.</div>';
  }
  const lines=text.split('\n');
  let html='';
  let inList=false;
  lines.forEach(line=>{
    const trimmed=line.trim();
    const isBullet=/^[-*]\s+/.test(trimmed);
    if(isBullet){
      if(!inList){html+='<ul class="reglamento-list">';inList=true;}
      html+=`<li>${trimmed.replace(/^[-*]\s+/,'')}</li>`;
    }else{
      if(inList){html+='</ul>';inList=false;}
      if(trimmed){html+=`<p class="reglamento-p">${trimmed}</p>`;}
    }
  });
  if(inList)html+='</ul>';
  return html;
}

function renderSectionPairs(cat){
  let html=`<div class="ibar">Elegí un grupo para editar sus parejas. Podés cambiar nombres, agregar, quitar o mover una pareja a otro grupo (incluso de otra categoría). También podés agregar grupos nuevos o borrar grupos vacíos según la cantidad de parejas inscriptas.</div>`;

  if(!grupos[cat]||!grupos[cat].length){
    html+='<div class="empty" style="margin-bottom:1rem;">Todavía no hay grupos cargados en esta categoría.</div>';
    html+=`<button class="btn btn-pink btn-sm" onclick="addGroup('${cat}')">+ Agregar grupo</button>`;
    return html;
  }

  html+=`<div class="group-select-bar">`;
  grupos[cat].forEach(g=>{
    const active=state.adminPairsGroup[cat]===g.id;
    html+=`<button class="group-select-btn ${active?'active':''}" onclick="selectPairsGroup('${cat}','${g.id}')">Grupo ${g.id}</button>`;
  });
  html+=`<button class="group-select-btn" style="background:#fff;color:var(--pink);border:1.5px dashed var(--pink);" onclick="addGroup('${cat}')">+ Agregar grupo</button>`;
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
    <div class="grupo-header" style="display:flex;align-items:center;justify-content:space-between;padding-right:10px;">
      <span>Grupo ${selectedG.id} (${selectedG.parejas.length} parejas)</span>
      ${selectedG.parejas.length===0?`<button class="btn btn-red btn-sm" onclick="deleteGroup('${cat}','${selectedG.id}')">Borrar grupo</button>`:''}
    </div>
    <div style="padding:12px;">`;
  if(selectedG.parejas.length===0){
    html+=`<div class="empty" style="padding:1rem 0;">Este grupo está vacío. Agregá parejas o borralo si no lo vas a usar.</div>`;
  }
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
// Genera el siguiente ID de grupo disponible para la categoría, siguiendo
// el patrón existente (1A, 1B, 1C... / 2A, 2B... / 3A, 3B...).
function nextGroupId(cat){
  const prefix={"1era":"1","2da":"2","3era":"3"}[cat];
  const existentes=grupos[cat].map(g=>g.id);
  for(let i=0;i<26;i++){
    const letra=String.fromCharCode(65+i); // A, B, C...
    const candidato=prefix+letra;
    if(!existentes.includes(candidato))return candidato;
  }
  return prefix+'X'+Date.now(); // fallback extremo, no debería pasar
}
async function addGroup(cat){
  const newId=nextGroupId(cat);
  grupos[cat].push({id:newId,parejas:[]});
  grupos[cat].sort((a,b)=>a.id.localeCompare(b.id));
  state.adminPairsGroup[cat]=newId;
  await saveGruposVacios();
  renderA();
  showToast(`Grupo ${newId} agregado`);
}
async function deleteGroup(cat,gid){
  const g=grupos[cat].find(x=>x.id===gid);
  if(!g)return;
  if(g.parejas.length>0){
    showToast('Solo se pueden borrar grupos vacíos');
    return;
  }
  const ok=confirm(`¿Seguro que querés borrar el Grupo ${gid}? Esta acción no se puede deshacer.`);
  if(!ok)return;
  grupos[cat]=grupos[cat].filter(x=>x.id!==gid);
  // Borrar también cualquier partido/horario residual de ese grupo (no debería
  // haber, ya que el grupo está vacío, pero por seguridad lo limpiamos igual).
  await supabaseClient.from('partidos').delete().eq('grupo_id',gid).eq('categoria',cat);
  partidos=partidos.filter(m=>!(m.grupoId===gid&&m.cat===cat));
  state.adminPairsGroup[cat]=grupos[cat].length?grupos[cat][0].id:null;
  await saveGruposVacios();
  renderA();
  showToast(`Grupo ${gid} eliminado`);
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
  // Si el grupo quedó vacío después de borrar esta pareja, lo registramos
  // como "vacío" para que no se pierda al recargar la página.
  if(grupos[cat][gi].parejas.length===0) await saveGruposVacios();
  renderA();showToast('Eliminado');
}
async function addP(cat,gi){
  const id='p'+Date.now();
  const newPair={id,j1:'Jugadora 1',j2:'Jugadora 2'};
  const eraVacio=grupos[cat][gi].parejas.length===0;
  grupos[cat][gi].parejas.push(newPair);
  await supabaseClient.from('parejas').insert({
    id,categoria:cat,grupo_id:grupos[cat][gi].id,jugadora1:'Jugadora 1',jugadora2:'Jugadora 2',cardales:false
  });
  await regenerateMatchesForGroup(cat,grupos[cat][gi].id);
  // El grupo dejó de estar vacío: lo sacamos de la lista persistida de
  // grupos vacíos (ya queda representado naturalmente por sus parejas).
  if(eraVacio) await saveGruposVacios();
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

  // El grupo de origen puede haber quedado vacío, y el de destino puede
  // haber dejado de estarlo: actualizamos la lista persistida en ambos casos.
  await saveGruposVacios();

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
  // Sub-tabs internos: Grupos | Playoff
  let html=`<div class="toggle-group" style="margin-bottom:14px;">
    <button class="toggle-btn ${state.schedSubTab==='grupos'?'active':''}" onclick="switchSchedSubTab('grupos')">Grupos</button>
    <button class="toggle-btn ${state.schedSubTab==='playoff'?'active':''}" onclick="switchSchedSubTab('playoff')">Playoff</button>
  </div>`;

  if(state.schedSubTab==='grupos'){
    html+=renderSchedGrupos();
  }else{
    html+=renderSchedPlayoff();
  }
  return html;
}

function switchSchedSubTab(tab){
  state.schedSubTab=tab;
  renderAContent();
}

// ---- Sub-tab GRUPOS: solo partidos de la fase de grupos, todas las categorías ----
function renderSchedGrupos(){
  let groupMatches=[];
  ["1era","2da","3era"].forEach(cat=>{
    const ms=partidos
      .filter(m=>m.cat===cat&&!m.played)
      .map(m=>({...m,catLabel:CAT_LABELS[cat]}))
      .sort((a,b)=>a.grupoId.localeCompare(b.grupoId));
    groupMatches=groupMatches.concat(ms);
  });

  let html=`<div class="ibar">Asigná cancha y hora a los partidos de grupos de las 3 categorías, ordenados por categoría y grupo.</div>`;
  if(!groupMatches.length) return html+'<div class="empty">No hay partidos de grupos pendientes.</div>';

  // Para el selector "a continuación de" usamos todos los partidos (grupos + playoff)
  const allForRef=buildAllMatchOptions();
  const usedAsReference=buildUsedAsReference(allForRef.all);

  html+=`<div class="sched-grid">`;
  groupMatches.forEach(m=>{
    html+=renderSchedCard(m,allForRef.options,usedAsReference);
  });
  html+=`</div>`;
  return html;
}

// ---- Sub-tab PLAYOFF: partidos de playoff por categoría y ronda ----
// Definición fija de las rondas y cruces de playoff por modo.
// Usamos IDs fijos (po_1era_qf1, etc.) independientes del cuadro,
// así los horarios se pueden cargar antes de que las parejas estén definidas.
function getPlayoffSlots(cat){
  const mode=playoffMode[cat];
  const slots=[];
  if(mode==='cuartos'){
    slots.push({roundName:'Cuartos de final',matches:[
      {slotId:`po_${cat}_qf1`,label:'QF 1'},
      {slotId:`po_${cat}_qf2`,label:'QF 2'},
      {slotId:`po_${cat}_qf3`,label:'QF 3'},
      {slotId:`po_${cat}_qf4`,label:'QF 4'},
    ]});
  }
  slots.push({roundName:'Semifinales',matches:[
    {slotId:`po_${cat}_sf1`,label:'SF 1'},
    {slotId:`po_${cat}_sf2`,label:'SF 2'},
  ]});
  slots.push({roundName:'Final',matches:[
    {slotId:`po_${cat}_f1`,label:'Final'},
  ]});
  return slots;
}

// Intenta vincular un slot fijo con el partido real de playoff ya creado
// para mostrar los nombres de las parejas si ya están definidas.
function matchForSlot(cat,slotId){
  if(!playoffData[cat])return null;
  // El ID del partido real de playoff tiene la forma sf1, qf2, f1, etc.
  // El slotId tiene la forma po_1era_sf1 → extraemos la parte final.
  const key=slotId.replace(`po_${cat}_`,'');
  for(const r of playoffData[cat].rounds){
    const m=r.matches.find(x=>x.id===key);
    if(m)return m;
  }
  return null;
}

function renderSchedPlayoff(){
  const catLabels={"1era":"1º Categoría","2da":"2º Categoría","3era":"3º Categoría"};
  let html=`<div class="ibar">Asigná cancha y hora a los cruces de playoff. Los slots están disponibles desde el inicio — los nombres de las parejas aparecen automáticamente cuando se genera el cuadro.</div>`;

  const allForRef=buildAllMatchOptions();
  const usedAsReference=buildUsedAsReference(allForRef.all);

  ["1era","2da","3era"].forEach(cat=>{
    const catLabel=catLabels[cat];
    const slots=getPlayoffSlots(cat);
    html+=`<div style="margin-top:1.2rem;font-size:13px;font-weight:600;color:#111;padding-bottom:6px;border-bottom:2px solid #111;">${catLabel}</div>`;
    slots.forEach(round=>{
      html+=`<div class="phase-label" style="margin-top:.8rem;">${round.roundName}</div>`;
      html+=`<div class="sched-grid">`;
      round.matches.forEach(slot=>{
        const sched=getSched(slot.slotId);
        const realMatch=matchForSlot(cat,slot.slotId);
        let n1='Por definir',n2='Por definir';
        if(realMatch){
          if(realMatch.p1) n1=pJ1(realMatch.p1)+' / '+pJ2(realMatch.p1);
          if(realMatch.p2) n2=pJ1(realMatch.p2)+' / '+pJ2(realMatch.p2);
        }
        const otherOpts=allForRef.options
          .filter(o=>o.id!==slot.slotId)
          .filter(o=>!usedAsReference.has(o.id) || sched.afterMatchId===o.id)
          .map(o=>`<option value="${o.id}" ${sched.afterMatchId===o.id?'selected':''}>${o.label}</option>`).join('');
        html+=`<div class="sched-card">
          <div class="sched-card-hdr">${catLabel} — ${round.roundName} — ${slot.label}</div>
          <div class="sched-card-body">
            <div class="sched-card-vs" style="color:${realMatch?'#111':'var(--gray-light)'};">
              <strong>${n1}</strong><br><span style="color:var(--gray-light);">vs</span><br><strong>${n2}</strong>
            </div>
            <div class="sched-mini-row">
              <div><label style="margin-top:0;font-size:11px;">Cancha</label>
                <input type="number" min="1" max="20" placeholder="N°" id="cancha_${slot.slotId}" value="${sched.cancha}" onchange="saveSchedGeneric('${slot.slotId}')"></div>
              <div><label style="margin-top:0;font-size:11px;">Hora</label>
                <input type="time" id="hora_${slot.slotId}" value="${sched.hora}" ${sched.after?'disabled':''} onchange="saveSchedGeneric('${slot.slotId}')"></div>
            </div>
            <div class="acont-after-toggle">
              <input type="checkbox" id="after_${slot.slotId}" ${sched.after?'checked':''} onchange="toggleAfter('${slot.slotId}')">
              <label style="margin:0;" for="after_${slot.slotId}">A continuación de</label>
            </div>
            ${sched.after?`<div style="margin-top:8px;"><label style="margin-top:0;font-size:11px;">Partido que tiene que terminar antes</label>
              <select id="afterMatch_${slot.slotId}" onchange="saveAfterMatch('${slot.slotId}')">
                <option value="">— Elegí un partido —</option>
                ${otherOpts}
              </select>
            </div>`:''}
          </div>
        </div>`;
      });
      html+=`</div>`;
    });
  });

  return html;
}

// ---- Helpers compartidos ----
function buildAllMatchOptions(){
  const catLabels={"1era":"1º Categoría","2da":"2º Categoría","3era":"3º Categoría"};
  const all=[];
  ["1era","2da","3era"].forEach(cat=>{
    partidos.filter(m=>m.cat===cat&&!m.played).forEach(m=>all.push({...m,catLabel:CAT_LABELS[cat]}));
    if(playoffData[cat]){
      playoffData[cat].rounds.flatMap(r=>
        r.matches.filter(m=>m.p1&&m.p2&&(!m.sets||!m.sets.length))
          .map(m=>({...m,isPlayoff:true,roundName:r.name,cat,catLabel:CAT_LABELS[cat]}))
      ).forEach(m=>all.push(m));
    }
  });
  // Agregar slots fijos de playoff (sin cuadro) para que aparezcan en "A continuación de"
  ["1era","2da","3era"].forEach(cat=>{
    getPlayoffSlots(cat).forEach(round=>{
      round.matches.forEach(slot=>{
        const yaEsta=all.some(x=>(x.id||x.slotId)===slot.slotId);
        if(!yaEsta) all.push({id:slot.slotId,isPlayoffSlot:true,cat,catLabel:CAT_LABELS[cat],roundName:round.roundName,slotLabel:slot.label});
      });
    });
  });
  const options=all.map(m=>({
    id:m.id||m.slotId,
    label:m.isPlayoffSlot
      ?`${catLabels[m.cat]} — ${m.roundName} — ${m.slotLabel}`
      :m.isPlayoff
      ?`Cat. ${m.catLabel} — ${m.roundName}: ${m.p1?pJ1(m.p1):'?'} vs ${m.p2?pJ1(m.p2):'?'}`
      :`Cat. ${m.catLabel} — Grupo ${m.grupoId}: ${pJ1(m.p1)} vs ${pJ1(m.p2)}`
  }));
  return{all,options};
}
function buildUsedAsReference(allMatches){
  return new Set(
    allMatches
      .filter(m=>getSched(m.id).after && getSched(m.id).afterMatchId)
      .map(m=>getSched(m.id).afterMatchId)
  );
}
function renderSchedCard(m,allMatchOptions,usedAsReference){
  const sched=getSched(m.id);
  const label=m.isPlayoff?`Cat. ${m.catLabel} — ${m.roundName}`:`Cat. ${m.catLabel} — Grupo ${m.grupoId}`;
  const n1=m.p1?(pJ1(m.p1)+' / '+pJ2(m.p1)):'Por definir';
  const n2=m.p2?(pJ1(m.p2)+' / '+pJ2(m.p2)):'Por definir';
  const otherOpts=allMatchOptions
    .filter(o=>o.id!==m.id)
    .filter(o=>!usedAsReference.has(o.id) || sched.afterMatchId===o.id)
    .map(o=>`<option value="${o.id}" ${sched.afterMatchId===o.id?'selected':''}>${o.label}</option>`).join('');
  return `<div class="sched-card">
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
}
async function saveSchedToDB(mId){
  const s=getSched(mId);
  await supabaseClient.from('horarios').upsert({
    partido_id:mId,cancha:s.cancha,hora:s.hora,a_continuacion:s.after,a_continuacion_de:s.afterMatchId
  });
}

// Devuelve el partido (si existe) que ya tiene asignada la misma cancha + hora
// que se está por guardar, excluyendo al propio partido que se está editando.
// Solo compara contra partidos que también tengan cancha Y hora cargadas
// (si falta alguno de los dos datos, no se considera conflicto).
function findScheduleConflict(mId,cancha,hora){
  if(!cancha||!hora)return null; // sin ambos datos no hay forma de chocar
  const allMatchIds=Object.keys(matchSchedule);
  for(const otherId of allMatchIds){
    if(otherId===mId)continue;
    const other=matchSchedule[otherId];
    if(!other||other.after)continue; // "a continuación de" no tiene hora fija, no choca
    if(other.cancha===cancha && other.hora===hora){
      const m=findMatchById(otherId);
      return m||{id:otherId};
    }
  }
  return null;
}

async function saveSchedGeneric(mId){
  const c=document.getElementById(`cancha_${mId}`)?.value||'';
  const h=document.getElementById(`hora_${mId}`)?.value||'';

  const conflict=findScheduleConflict(mId,c,h);
  if(conflict){
    const n1=conflict.p1?pNombre(conflict.p1):'?',n2=conflict.p2?pNombre(conflict.p2):'?';
    showToast(`⚠️ Cancha ${c} a las ${h} ya está asignada a: ${n1} vs ${n2}`);
    // Revertimos los inputs al valor anterior guardado, para que no quede
    // una asignación duplicada cargada en pantalla sin haberse guardado.
    const prev=getSched(mId);
    const cInput=document.getElementById(`cancha_${mId}`);
    const hInput=document.getElementById(`hora_${mId}`);
    if(cInput)cInput.value=prev.cancha||'';
    if(hInput)hInput.value=prev.hora||'';
    return;
  }

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
  const byGroup=(a,b)=>a.grupoId.localeCompare(b.grupoId);
  const pend=partidos.filter(m=>m.cat===cat&&!m.played&&m.phase==='grupos').sort(byGroup);
  const done=partidos.filter(m=>m.cat===cat&&m.played&&m.phase==='grupos').sort(byGroup);
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
  const totalClasificados=qualFirsts.length+qualSeconds.length;

  html+=`<div class="ibar">Modo de clasificación elegido para esta categoría: <strong>${CLASIF_LABELS[clasificacionMode[cat]]}</strong> (se cambia desde la pestaña "Clasificación").</div>`;
  html+=`<div style="font-size:12px;font-weight:500;color:var(--pink);margin-bottom:8px;">Clasificados actuales (${totalClasificados}/${cfg.total})</div>`;
  html+=`<div class="grupo"><div class="table-scroll"><table class="grupo-table"><thead><tr><th>#</th><th class="thl">Pareja</th><th>Grupo</th><th>Vía</th></tr></thead><tbody>`;
  [...qualFirsts,...qualSeconds].slice(0,cfg.total).forEach((s,i)=>{
    const shade=i%2===1;
    html+=`<tr class="${shade?'shade':''}"><td><span class="pos-badge ${i<qualFirsts.length?'pos-1':'pos-2'}">${i+1}</span></td><td class="tdl"><div class="pnames"><span>${s.j1}</span><span>${s.j2}</span></div></td><td>${s.grupoId}</td><td>${i<qualFirsts.length?'1°':'Mejor 2°'}</td></tr>`;
  });
  html+=`</tbody></table></div></div>`;

  if(totalClasificados<cfg.total){
    html+=`<div class="ibar" style="margin-top:10px;">Todavía faltan resultados de grupos para completar los ${cfg.total} clasificados que necesita este formato de playoff.</div>`;
  }else if(totalClasificados>cfg.total){
    html+=`<div class="ibar" style="margin-top:10px;background:#fffbeb;border-color:#fde047;color:#854d0e;">⚠️ El modo de clasificación elegido (${CLASIF_LABELS[clasificacionMode[cat]]}) da ${totalClasificados} clasificados, pero el formato de playoff (${cfg.roundName}) solo tiene ${cfg.total} cupos. Para el cuadro solo se van a usar los primeros ${cfg.total} por orden de mérito (se ven resaltados arriba). Revisá si el formato de playoff y el modo de clasificación son coherentes entre sí.</div>`;
  }

  html+=`<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;">
    <button class="btn btn-out btn-sm" onclick="generarPreview('${cat}')">${isPreview?'Generar / actualizar':'Actualizar'} vista previa</button>
    ${po?`<button class="btn btn-blk btn-sm" onclick="confirmarPlayoff('${cat}')">Confirmar cuadro definitivo</button>`:''}
    ${po?`<button class="btn btn-red btn-sm" onclick="resetPlayoff('${cat}')">Resetear cuadro de playoff</button>`:''}
  </div>`;

  if(po){
    html+=`<div style="margin-top:1.2rem;">`;
    if(po.isPreview) html+=`<div class="preview-banner">⚠️ Vista previa — todavía podés cambiar parejas y formato antes de confirmar.</div>`;
    html+=renderBracketTree(po,cat);
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

    html+=`<div style="margin-top:1.5rem;font-size:12px;font-weight:500;color:var(--pink);">Editar cruces, cancha/hora y resultados</div>`;
    const allPs=grupos[cat].flatMap(g=>g.parejas);
    po.rounds.forEach((r,ri)=>{
      html+=`<div style="font-size:12px;font-weight:500;color:var(--gray);margin:10px 0 6px;">${r.name}</div>`;
      r.matches.forEach((m,mi)=>{
        const n1=m.p1?pNombre(m.p1):'Por definir',n2=m.p2?pNombre(m.p2):'Por definir';
        const opts=p=>allPs.map(x=>`<option value="${x.id}" ${m[p]===x.id?'selected':''}>${x.j1} / ${x.j2}</option>`).join('');
        const sched=getSched(m.id);
        html+=`<div style="padding:10px;background:#fafafa;border:1.5px solid #ddd;border-radius:10px;margin-bottom:8px;">
          <div style="font-size:11px;color:var(--gray-light);margin-bottom:6px;">${r.name} — Cruce ${mi+1}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
            <div><label style="margin-top:0;">Pareja A</label><select onchange="editPOT('${cat}',${ri},${mi},'p1',this.value)"><option value="">— Por definir —</option>${opts('p1')}</select></div>
            <div><label style="margin-top:0;">Pareja B</label><select onchange="editPOT('${cat}',${ri},${mi},'p2',this.value)"><option value="">— Por definir —</option>${opts('p2')}</select></div>
          </div>
          ${m.p1&&m.p2?`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
            <div><label style="margin-top:0;font-size:11px;">Cancha</label><input type="number" min="1" max="20" placeholder="N°" id="cancha_${m.id}" value="${sched.cancha}" onchange="saveSchedGeneric('${m.id}')"></div>
            <div><label style="margin-top:0;font-size:11px;">Hora</label><input type="time" id="hora_${m.id}" value="${sched.hora}" ${sched.after?'disabled':''} onchange="saveSchedGeneric('${m.id}')"></div>
          </div>`:''}`;
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
// Arma los cruces siempre 1ro vs 2do (nunca 1ro-vs-1ro ni 2do-vs-2do),
// emparejando el mejor 1ro con el mejor 2do disponible que NO sea de su mismo grupo,
// y así sucesivamente. Si el mejor 2do es del mismo grupo que el 1ro que le toca,
// se intercambia con el siguiente 2do disponible que sí sea válido.
function buildFirstVsSecondPairing(firsts, seconds){
  const usedSeconds=new Array(seconds.length).fill(false);
  const pairs=[]; // {first, second}
  firsts.forEach(f=>{
    // Buscar el mejor 2do disponible que no sea de su mismo grupo
    let chosenIdx=-1;
    for(let i=0;i<seconds.length;i++){
      if(usedSeconds[i])continue;
      if(seconds[i].grupoId===f.grupoId)continue; // evitar mismo grupo
      chosenIdx=i;
      break;
    }
    // Si todos los disponibles son del mismo grupo (caso límite), tomar el mejor disponible igual
    if(chosenIdx===-1){
      for(let i=0;i<seconds.length;i++){
        if(!usedSeconds[i]){chosenIdx=i;break;}
      }
    }
    if(chosenIdx!==-1){
      usedSeconds[chosenIdx]=true;
      pairs.push({first:f,second:seconds[chosenIdx]});
    }else{
      pairs.push({first:f,second:null});
    }
  });
  return pairs;
}

// Distribuye los cruces (1ro vs 2do) en el cuadro de playoff respetando el
// "seeding" clásico: el cruce del mejor 1ro va en una punta del cuadro, el del
// 2do mejor 1ro en la otra punta, etc. — para que los mejores se encuentren
// recién en semis/final, no en la primera ronda.
function seedPositionsForBracket(n){
  // n = cantidad de cruces de primera ronda (2 para semis, 4 para cuartos)
  // Devuelve el orden de posiciones estándar de un bracket de single elimination
  if(n===2) return [0,1];
  if(n===4) return [0,3,1,2]; // 1° arriba, 4° abajo del mismo lado, 2° y 3° del otro lado
  // fallback genérico (no debería usarse con los formatos actuales: 4 u 8)
  const arr=[0];
  let size=1;
  while(size<n){
    const next=[];
    for(const pos of arr){ next.push(pos); next.push(size*2-1-pos); }
    arr.length=0; arr.push(...next);
    size*=2;
  }
  return arr.slice(0,n);
}

function buildRoundsForMode(cat,seedsData){
  const cfg=getPlayoffConfig(cat);
  // Usamos las listas YA filtradas según el modo de clasificación elegido
  // en la pestaña "Clasificación" (todos los 1ros, o 1ros + N mejores 2dos),
  // en vez de recortar artificialmente a la mitad del cuadro de playoff.
  const qualFirsts=seedsData.qualFirsts||[];
  const qualSeconds=seedsData.qualSeconds||[];
  const slotsNeeded=cfg.total/2; // cantidad de cruces 1ro-vs-2do en la primera ronda

  const pairs=buildFirstVsSecondPairing(
    qualFirsts.slice(0,slotsNeeded),
    qualSeconds.slice(0,slotsNeeded)
  );

  const order=seedPositionsForBracket(slotsNeeded);
  const orderedPairs=order.map(i=>pairs[i]||{first:null,second:null});

  if(cfg.total===4){
    return[
      {name:'Semifinales',matches:[
        {id:'sf1',p1:orderedPairs[0]?.first?.id||null,p2:orderedPairs[0]?.second?.id||null,sets:[],winner:null},
        {id:'sf2',p1:orderedPairs[1]?.first?.id||null,p2:orderedPairs[1]?.second?.id||null,sets:[],winner:null},
      ]},
      {name:'Final',matches:[{id:'f1',p1:null,p2:null,sets:[],winner:null}]},
    ];
  }
  return[
    {name:'Cuartos de final',matches:[
      {id:'qf1',p1:orderedPairs[0]?.first?.id||null,p2:orderedPairs[0]?.second?.id||null,sets:[],winner:null},
      {id:'qf2',p1:orderedPairs[1]?.first?.id||null,p2:orderedPairs[1]?.second?.id||null,sets:[],winner:null},
      {id:'qf3',p1:orderedPairs[2]?.first?.id||null,p2:orderedPairs[2]?.second?.id||null,sets:[],winner:null},
      {id:'qf4',p1:orderedPairs[3]?.first?.id||null,p2:orderedPairs[3]?.second?.id||null,sets:[],winner:null},
    ]},
    {name:'Semifinales',matches:[
      {id:'sf1',p1:null,p2:null,sets:[],winner:null},
      {id:'sf2',p1:null,p2:null,sets:[],winner:null},
    ]},
    {name:'Final',matches:[{id:'f1',p1:null,p2:null,sets:[],winner:null}]},
  ];
}
async function generarPreview(cat){
  const seedsData=getSeeds(cat);
  const rounds=buildRoundsForMode(cat,seedsData);
  playoffData[cat]={rounds,isPreview:true};
  await supabaseClient.from('playoff').upsert({categoria:cat,datos:{rounds},es_vista_previa:true});
  renderA();renderJContent();showToast('Vista previa generada');
}
async function confirmarPlayoff(cat){
  if(playoffData[cat]) playoffData[cat].isPreview=false;
  await supabaseClient.from('playoff').upsert({categoria:cat,datos:{rounds:playoffData[cat].rounds},es_vista_previa:false});
  renderA();renderJContent();showToast('Cuadro confirmado ✓');
}
async function resetPlayoff(cat){
  const ok=confirm('¿Seguro que querés eliminar el cuadro de playoff de esta categoría? Se van a borrar las parejas asignadas a cada cruce y los resultados ya cargados en el playoff. Los resultados de la zona de grupos NO se van a tocar. Después vas a poder volver a generarlo desde cero.');
  if(!ok)return;
  playoffData[cat]=null;
  await supabaseClient.from('playoff').delete().eq('categoria',cat);
  renderA();renderJContent();showToast('Cuadro de playoff eliminado');
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
