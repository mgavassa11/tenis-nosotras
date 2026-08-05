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

// Nombres por defecto de las categorías (se pueden personalizar desde el admin)
const CAT_NAMES_DEFAULT={"1era":"1° Categoría","2da":"2° Categoría","3era":"3° Categoría"};
// Nombres personalizados (se cargan de Supabase). Empiezan como copia de los default.
let customCatNames={...CAT_NAMES_DEFAULT};

// Devuelve el nombre visible de una categoría (personalizado o default)
function catLabel(cat){
  return (customCatNames&&customCatNames[cat]&&customCatNames[cat].trim())
    ? customCatNames[cat].trim()
    : CAT_NAMES_DEFAULT[cat];
}

// Nombres personalizados de grupos: {grupo_id: "nombre visible"}
// La clave es el grupo_id interno (ej "1A"); el valor es lo que se muestra.
let customGroupNames={};

// Devuelve el nombre visible de un grupo.
// Si tiene nombre personalizado lo usa tal cual; si no, devuelve "Grupo X".
function groupLabel(gid){
  const custom=customGroupNames&&customGroupNames[gid]&&String(customGroupNames[gid]).trim();
  return custom?custom:`Grupo ${gid}`;
}
// Igual pero sin el prefijo "Grupo" para lugares compactos (devuelve el id o el nombre custom)
function groupLabelShort(gid){
  const custom=customGroupNames&&customGroupNames[gid]&&String(customGroupNames[gid]).trim();
  return custom?custom:gid;
}

// ---- CONFIGURACIÓN DE CLASIFICACIÓN (por posición, por categoría) ----
// Para cada categoría, un objeto {1:valor, 2:valor, 3:valor, ...} donde la clave
// es la posición en el grupo y el valor es cuántos de esa posición clasifican:
//   - un número N: los N mejores de esa posición (comparando entre todos los grupos)
//   - "todos": todos los de esa posición clasifican
//   - 0 o ausente: ninguno de esa posición
// Default: 1ro de cada grupo clasifica directo ("todos"), 2do compite (4 mejores).
const CLASIF_DEFAULT={"1era":{1:"todos"},"2da":{1:"todos",2:4},"3era":{1:"todos",2:2}};
let clasificacionConfig=JSON.parse(JSON.stringify(CLASIF_DEFAULT));

// Lista de sponsors del torneo: [{nombre, logo, link}]
// Se guarda en configuracion bajo la clave 'sponsors'.
let sponsorsList=[];

// Normaliza cualquier formato viejo de sponsors que pueda estar en la base:
// - array de strings → [{nombre}]
// - array de objetos con campos alternativos (name/img/imagen/url/href/web)
function parseSponsors(raw){
  if(!raw)return[];
  let arr=raw;
  if(typeof raw==='string'){
    try{arr=JSON.parse(raw);}catch(e){return[];}
  }
  if(!Array.isArray(arr))return[];
  return arr.map(s=>{
    if(typeof s==='string')return{nombre:s,logo:'',link:''};
    return{
      nombre:s.nombre||s.name||s.titulo||'',
      logo:s.logo||s.img||s.imagen||s.image||s.url_logo||'',
      link:s.link||s.href||s.web||s.url||''
    };
  }).filter(s=>s.nombre||s.logo);
}

// Prioridades de sorteo: {parejaId: número}. Cuando dos parejas del ranking
// cruzado quedan empatadas en TODO (Pts, Dif, GG y GP) y no jugaron entre sí,
// el orden lo define un sorteo que el administrador carga manualmente.
// Menor número = mejor posición.
let sorteoPrioridad={};

// Devuelve la config de clasificación de una categoría (o un default seguro)
function getClasifCat(cat){
  return clasificacionConfig[cat]||{1:"todos"};
}

// La cantidad máxima de posiciones que puede tener un grupo en esta categoría
// (= tamaño del grupo más grande). Sirve para saber cuántas filas mostrar.
function maxPosEnCategoria(cat){
  let max=0;
  grupos[cat].forEach(g=>{if(g.parejas.length>max)max=g.parejas.length;});
  return max;
}

// Calcula los clasificados de una categoría según su config por posición.
// Devuelve un array de objetos pareja, cada uno con:
//   .grupoId, .posEnGrupo (1,2,3...), .viaLabel ("1°", "Mejor 2°", etc), .directo (bool)
// True si la categoría tiene un solo grupo
function esUnicoGrupo(cat){ return grupos[cat] && grupos[cat].length===1; }

// Comparador del RANKING CRUZADO entre grupos (mejores 2dos, 3ros, etc):
// 1° Puntos · 2° Diferencia de games · 3° Games ganados · 4° Games perdidos (menos = mejor)
// 5° Si el empate es total: prioridad de sorteo cargada por el administrador.
function compareRankingCruzado(a,b){
  if(b.pts!==a.pts)return b.pts-a.pts;
  if(b.bal!==a.bal)return b.bal-a.bal;
  if(b.gg!==a.gg)return b.gg-a.gg;
  if(a.gp!==b.gp)return a.gp-b.gp; // menos games perdidos primero
  const pa=(sorteoPrioridad[a.id]!==undefined)?sorteoPrioridad[a.id]:9999;
  const pb=(sorteoPrioridad[b.id]!==undefined)?sorteoPrioridad[b.id]:9999;
  if(pa!==pb)return pa-pb;
  return 0;
}

// Todas las parejas que ocupan la posición `pos` en su grupo, de todos los
// grupos de la categoría, ordenadas por el ranking cruzado.
function rankingPorPosicion(cat,pos){
  const lista=[];
  grupos[cat].forEach(g=>{
    const tabla=getStats(g.id,cat);
    const p=tabla[pos-1];
    if(p){
      const aj=pos>=2?getAdj(p,g.id,cat):p;
      lista.push({...aj,grupoId:g.id,posEnGrupo:pos});
    }
  });
  lista.sort(compareRankingCruzado);
  return lista;
}

function getQualified(cat){
  const cfg=getClasifCat(cat);
  // 1. Para cada grupo, obtener su tabla ordenada
  const tablasPorGrupo={};
  grupos[cat].forEach(g=>{ tablasPorGrupo[g.id]=getStats(g.id,cat); });

  const clasificados=[];

  // CASO ESPECIAL: categoría de un solo grupo con clasificación "primeros X".
  // No hay "mejores 2dos entre grupos" — simplemente pasan los primeros X del grupo.
  if(esUnicoGrupo(cat) && cfg.single!==undefined && cfg.single!==0 && cfg.single!=='0'){
    const g=grupos[cat][0];
    const tabla=tablasPorGrupo[g.id];
    const n=(cfg.single==='todos')?tabla.length:Math.min(parseInt(cfg.single)||0,tabla.length);
    for(let i=0;i<n;i++){
      const p=tabla[i];
      if(p)clasificados.push({...p,grupoId:g.id,posEnGrupo:i+1,viaLabel:`${i+1}°`,directo:true});
    }
    return clasificados;
  }

  const maxPos=maxPosEnCategoria(cat);

  for(let pos=1;pos<=maxPos;pos++){
    const valor=cfg[pos];
    if(valor===undefined||valor===0||valor==='0')continue; // esta posición no clasifica

    // Reunir todas las parejas que ocupan ESTA posición en sus grupos
    let enEstaPos=[];
    grupos[cat].forEach(g=>{
      const tabla=tablasPorGrupo[g.id];
      const p=tabla[pos-1];
      if(p){
        // Para posiciones > 1 en grupos de 5, ajustar stats (excluir último) para
        // comparar en igualdad de partidos jugados (misma lógica que getAdj)
        const ajustada=pos>=2?getAdj(p,g.id,cat):p;
        enEstaPos.push({...ajustada,grupoId:g.id,posEnGrupo:pos});
      }
    });

    // Ordenar los de esta posición entre sí (ranking cruzado: pts, dif, gg, gp, sorteo)
    enEstaPos.sort(compareRankingCruzado);

    // ¿Cuántos entran?
    const cuantos=(valor==='todos')?enEstaPos.length:Math.min(parseInt(valor)||0,enEstaPos.length);
    const seleccionados=enEstaPos.slice(0,cuantos);

    // Etiqueta de vía de clasificación
    const ordinal=pos+'°';
    seleccionados.forEach((p,idx)=>{
      let viaLabel;
      if(valor==='todos'){
        viaLabel=ordinal; // "1°", "2°" — todos los de esa posición
      }else{
        viaLabel=`Mejor ${ordinal}`; // comodín: "Mejor 2°"
      }
      clasificados.push({...p,viaLabel,directo:valor==='todos'});
    });
  }
  return clasificados;
}

// Total de clasificados de una categoría (para saber el tamaño del cuadro)
function totalClasificados(cat){ return getQualified(cat).length; }

// Genera un texto legible que describe cómo clasifica una categoría
function descripcionClasificacion(cat){
  const cfg=getClasifCat(cat);
  const maxPos=maxPosEnCategoria(cat);
  const ordinales={1:'1ros',2:'2dos',3:'3ros',4:'4tos',5:'5tos',6:'6tos',7:'7mos',8:'8vos'};

  // Caso especial: un solo grupo con "primeros X"
  if(esUnicoGrupo(cat) && cfg.single!==undefined && cfg.single!==0 && cfg.single!=='0'){
    if(cfg.single==='todos')return 'Clasifican <strong>todas</strong> las parejas del grupo.';
    const n=parseInt(cfg.single)||0;
    return `Clasifican las <strong>primeras ${n}</strong> parejas del grupo.`;
  }

  const partes=[];
  for(let pos=1;pos<=maxPos;pos++){
    const v=cfg[pos];
    if(v===undefined||v===0||v==='0')continue;
    const nombrePos=ordinales[pos]||`${pos}°`;
    if(v==='todos'){
      partes.push(`todos los <strong>${nombrePos}</strong> de cada grupo`);
    }else{
      const n=parseInt(v)||0;
      if(n===1)partes.push(`el <strong>mejor ${pos}°</strong> de la categoría`);
      else partes.push(`los <strong>${n} mejores ${nombrePos}</strong> de la categoría`);
    }
  }
  if(!partes.length)return 'Todavía no hay posiciones configuradas para clasificar.';
  // Unir con comas y "y" al final
  let texto;
  if(partes.length===1)texto=partes[0];
  else texto=partes.slice(0,-1).join(', ')+' y '+partes[partes.length-1];
  return `Clasifican ${texto}.`;
}

// Devuelve hasta qué posición clasifica DIRECTO (posiciones con "todos") en un grupo.
// Sirve para dibujar la línea de corte en la tabla del grupo.
function corteDirectoEnGrupo(cat){
  const cfg=getClasifCat(cat);
  // Caso un solo grupo: el corte es después de la posición X (primeros X)
  if(esUnicoGrupo(cat) && cfg.single!==undefined && cfg.single!==0 && cfg.single!=='0'){
    if(cfg.single==='todos')return 0;
    return parseInt(cfg.single)||0;
  }
  let ultimaDirecta=0;
  const maxPos=maxPosEnCategoria(cat);
  for(let pos=1;pos<=maxPos;pos++){
    if(cfg[pos]==='todos')ultimaDirecta=pos;
  }
  return ultimaDirecta; // 0 = no hay corte directo
}

// ---- ESTADO GLOBAL (se llena leyendo de Supabase) ----
let grupos={"1era":[],"2da":[],"3era":[]};
let partidos=[];
let matchSchedule={};
let playoffData={"1era":null,"2da":null,"3era":null};
let playoffMode={"1era":"semis","2da":"cuartos","3era":"cuartos"};
let tiebreakOrder=["pts","bal","gg","h2h"];
let reglamentoText="";

const state={
  mainView:"jugadoras",
  cat:"1era",adminCat:"1era",
  subTabJ:"grupos",
  liveCat:"1era",
  liveSubTab:"grupos",
  adminSection:"pairs",
  adminPairsGroup:{},
  adminUnlocked:false,
  proximosFilter:"horario",
  proximosBuscarNombre:"",
  explicacionAbierta:{},
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
    if(row.clave==='reglamento') reglamentoText=row.valor||'';
    if(row.clave==='cat_names') customCatNames={...CAT_NAMES_DEFAULT,...row.valor};
    if(row.clave==='group_names') customGroupNames={...row.valor};
    if(row.clave==='clasif_config') clasificacionConfig={...JSON.parse(JSON.stringify(CLASIF_DEFAULT)),...row.valor};
    if(row.clave==='sorteo_prioridad') sorteoPrioridad={...row.valor};
    if(row.clave==='sponsors') sponsorsList=parseSponsors(row.valor);
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
  if(mode==='final') return{total:2,roundName:'final'};
  if(mode==='semis') return{total:4,roundName:'semis'};
  return{total:8,roundName:'cuartos'};
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
// Resultado del enfrentamiento directo entre DOS parejas: +1 si ganó A, -1 si ganó B, 0 si no jugaron
function h2hResult(pairAId,pairBId,gId){
  const m=partidos.find(mm=>mm.grupoId===gId&&mm.played&&((mm.p1===pairAId&&mm.p2===pairBId)||(mm.p1===pairBId&&mm.p2===pairAId)));
  if(!m)return 0;
  let w1=0,w2=0;
  m.sets.forEach(s=>{if(s[0]>s[1])w1++;else w2++;});
  const aIsP1=m.p1===pairAId;
  const aWon=aIsP1?w1>w2:w2>w1;
  return aWon?1:-1;
}

// Cuenta cuántas victorias tiene una pareja SOLO contra las otras del grupo empatado.
// Sirve para el desempate por enfrentamiento directo entre 3 o más parejas.
function h2hWinsDentroDe(pairId,idsEmpatados,gId){
  let wins=0;
  idsEmpatados.forEach(otroId=>{
    if(otroId===pairId)return;
    if(h2hResult(pairId,otroId,gId)===1)wins++;
  });
  return wins;
}

// Compara dos parejas por un criterio puntual (sin h2h). Devuelve <0, 0 o >0.
function compareCriterioSimple(a,b,crit){
  if(crit==='pts')return b.pts-a.pts;
  if(crit==='bal')return b.bal-a.bal;
  if(crit==='gg')return b.gg-a.gg;
  return 0;
}

// Ordena un conjunto de parejas aplicando los criterios de desempate en orden,
// manejando correctamente empates de 3 o más (reglamento estándar de tenis/pádel).
// - Para h2h con 3+ empatados: se arma la mini-tabla de victorias entre ellas.
//   Si alguna les ganó a todas (o perdió con todas), se separa; si es un triángulo
//   (nadie ganó a todos), el h2h no resuelve y se pasa al siguiente criterio.
// - Los demás criterios (pts, dif, games) se calculan con las stats del grupo completo.
// - Al aplicar un criterio, si el grupo se parte en subgrupos, se vuelve a desempatar
//   recursivamente dentro de cada subgrupo con los criterios restantes.
function ordenarConDesempate(parejas,gId,criterios){
  if(parejas.length<=1)return parejas.slice();
  // REGLA: cuando el empate queda entre exactamente 2 parejas, lo define
  // el resultado del partido entre ellas (si se jugó), sin importar qué
  // criterios quedaban en la lista.
  if(parejas.length===2){
    const r=h2hResult(parejas[0].id,parejas[1].id,gId);
    if(r===1)return [parejas[0],parejas[1]];
    if(r===-1)return [parejas[1],parejas[0]];
    // si todavía no jugaron entre sí, se sigue con los criterios configurados
  }
  if(!criterios.length)return parejas.slice(); // sin más criterios, se dejan como están

  const crit=criterios[0];
  const resto=criterios.slice(1);

  if(crit==='h2h'){
    // Mini-tabla: victorias de cada pareja contra las otras del grupo empatado
    const ids=parejas.map(p=>p.id);
    const conWins=parejas.map(p=>({p,wins:h2hWinsDentroDe(p.id,ids,gId)}));
    // Agrupar por cantidad de victorias
    const distintos=new Set(conWins.map(x=>x.wins));
    if(distintos.size===1){
      // Todos tienen las mismas victorias (triángulo o no jugaron): h2h no resuelve,
      // pasar al siguiente criterio con TODAS las parejas juntas
      return ordenarConDesempate(parejas,gId,resto);
    }
    // Ordenar por victorias (más primero) y, dentro de cada nivel, seguir desempatando
    conWins.sort((x,y)=>y.wins-x.wins);
    const resultado=[];
    let i=0;
    while(i<conWins.length){
      let j=i;
      while(j<conWins.length&&conWins[j].wins===conWins[i].wins)j++;
      const bloque=conWins.slice(i,j).map(x=>x.p);
      // Dentro del bloque con mismas victorias h2h, seguir con los criterios restantes
      resultado.push(...ordenarConDesempate(bloque,gId,resto));
      i=j;
    }
    return resultado;
  }

  // Criterio simple (pts, bal, gg): ordenar y agrupar por valor igual
  const ordenadas=parejas.slice().sort((a,b)=>compareCriterioSimple(a,b,crit));
  const resultado=[];
  let i=0;
  while(i<ordenadas.length){
    let j=i;
    while(j<ordenadas.length&&compareCriterioSimple(ordenadas[i],ordenadas[j],crit)===0)j++;
    const bloque=ordenadas.slice(i,j);
    if(bloque.length>1&&resto.length){
      // Sub-empate: seguir desempatando dentro del bloque con los criterios restantes
      resultado.push(...ordenarConDesempate(bloque,gId,resto));
    }else{
      resultado.push(...bloque);
    }
    i=j;
  }
  return resultado;
}

function getStats(gId,cat){
  const raw=getStatsRaw(gId,cat);
  // Aplicar el desempate completo (maneja empates de 2 y de 3+)
  return ordenarConDesempate(raw,gId,tiebreakOrder);
}

// Genera una explicación legible (solo para admin) de cómo se resolvió el orden
// de un grupo, detallando cada empate y qué criterio lo desempató.
// Genera una explicación paso a paso de por qué el grupo quedó ordenado así.
// Devuelve un array de "pasos" con texto legible. Espeja la lógica de
// ordenarConDesempate pero registrando cada decisión.
function explicarClasificacionGrupo(gId,cat){
  const raw=getStatsRaw(gId,cat);
  const nombreCrit={pts:'Puntos',bal:'Diferencia de games',gg:'Games ganados',h2h:'Enfrentamiento directo'};
  const pasos=[];
  const nom=p=>`${p.j1} / ${p.j2}`;
  // Une nombres con comas y "y" antes del último (ej: "A, B y C")
  const unir=arr=>arr.length<=1?arr.join(''):arr.slice(0,-1).join(', ')+' y '+arr[arr.length-1];

  // ¿Se jugaron todos los partidos del grupo?
  const g=grupos[cat].find(x=>x.id===gId);
  const totalPartidos=g?g.parejas.length*(g.parejas.length-1)/2:0;
  const jugados=partidos.filter(m=>m.grupoId===gId&&m.played).length;
  if(jugados<totalPartidos){
    pasos.push({tipo:'aviso',texto:`⚠️ Todavía faltan partidos por jugar en este grupo (${jugados} de ${totalPartidos}). El orden puede cambiar.`});
  }

  // Función recursiva que explica el ordenamiento de un bloque de parejas
  function explicar(parejas,criterios,nivel){
    if(parejas.length<=1)return;
    // Regla de 2 parejas: define el partido entre ellas
    if(parejas.length===2){
      const r=h2hResult(parejas[0].id,parejas[1].id,gId);
      if(r!==0){
        const ganador=r===1?parejas[0]:parejas[1];
        const perdedor=r===1?parejas[1]:parejas[0];
        pasos.push({tipo:'resuelve',nivel,crit:'Enfrentamiento directo',
          texto:`El empate queda entre 2 parejas: <strong>${nom(ganador)}</strong> termina por encima de ${nom(perdedor)} porque ganó el partido que jugaron entre sí.`});
        return;
      }
    }
    if(!criterios.length){
      pasos.push({tipo:'empate',nivel,texto:`Quedan empatadas ${unir(parejas.map(nom))} y no hay más criterios de desempate. Se dejan en el orden actual.`});
      return;
    }
    const crit=criterios[0];
    const resto=criterios.slice(1);

    if(crit==='h2h'){
      const ids=parejas.map(p=>p.id);
      const conWins=parejas.map(p=>({p,wins:h2hWinsDentroDe(p.id,ids,gId)}));
      const distintos=new Set(conWins.map(x=>x.wins));

      if(parejas.length===2){
        // Enfrentamiento directo simple entre 2
        const r=h2hResult(parejas[0].id,parejas[1].id,gId);
        if(r!==0){
          const ganador=r===1?parejas[0]:parejas[1];
          const perdedor=r===1?parejas[1]:parejas[0];
          pasos.push({tipo:'resuelve',nivel,crit:'Enfrentamiento directo',
            texto:`<strong>${nom(ganador)}</strong> queda por encima de ${nom(perdedor)} porque le ganó en el partido entre ellas.`});
          return;
        }else{
          pasos.push({tipo:'salta',nivel,crit:'Enfrentamiento directo',
            texto:`${unir(parejas.map(nom))} no jugaron entre sí (o no hay resultado). Se pasa al siguiente criterio.`});
          explicar(parejas,resto,nivel);
          return;
        }
      }

      // 3 o más empatadas
      if(distintos.size===1){
        pasos.push({tipo:'salta',nivel,crit:'Enfrentamiento directo',
          texto:`Entre ${unir(parejas.map(nom))} hay un empate circular (cada una ganó y perdió lo mismo dentro del grupo), así que el enfrentamiento directo no las separa. Se pasa al siguiente criterio.`});
        explicar(parejas,resto,nivel);
        return;
      }
      // Se separan por victorias internas
      conWins.sort((x,y)=>y.wins-x.wins);
      const detalle=conWins.map(x=>`${nom(x.p)} (${x.wins} ${x.wins===1?'victoria':'victorias'})`).join(', ');
      pasos.push({tipo:'resuelve',nivel,crit:'Enfrentamiento directo',
        texto:`Entre las ${parejas.length} empatadas se cuentan las victorias en los partidos entre ellas: ${detalle}. Se ordenan por esa cantidad.`});
      let i=0;
      while(i<conWins.length){
        let j=i;
        while(j<conWins.length&&conWins[j].wins===conWins[i].wins)j++;
        const bloque=conWins.slice(i,j).map(x=>x.p);
        if(bloque.length>1){
          pasos.push({tipo:'subempate',nivel,texto:`${unir(bloque.map(nom))} siguen empatadas con ${conWins[i].wins} ${conWins[i].wins===1?'victoria':'victorias'} entre ellas. Se desempata con el siguiente criterio:`});
          explicar(bloque,resto,nivel+1);
        }
        i=j;
      }
      return;
    }

    // Criterio simple
    const ordenadas=parejas.slice().sort((a,b)=>compareCriterioSimple(a,b,crit));
    const valorDe=p=>crit==='pts'?p.pts:crit==='bal'?(p.bal>0?'+':'')+p.bal:p.gg;
    const detalle=ordenadas.map(p=>`${nom(p)} (${valorDe(p)})`).join(', ');
    // ¿Este criterio separa a alguien?
    let separaAlgo=false;
    for(let k=0;k<ordenadas.length-1;k++){
      if(compareCriterioSimple(ordenadas[k],ordenadas[k+1],crit)!==0){separaAlgo=true;break;}
    }
    if(separaAlgo){
      pasos.push({tipo:'resuelve',nivel,crit:nombreCrit[crit],
        texto:`Se comparan por <strong>${nombreCrit[crit]}</strong>: ${detalle}.`});
    }else{
      pasos.push({tipo:'salta',nivel,crit:nombreCrit[crit],
        texto:`Todas tienen el mismo valor en <strong>${nombreCrit[crit]}</strong> (${detalle}). No se separan; se pasa al siguiente criterio.`});
    }
    let i=0;
    while(i<ordenadas.length){
      let j=i;
      while(j<ordenadas.length&&compareCriterioSimple(ordenadas[i],ordenadas[j],crit)===0)j++;
      const bloque=ordenadas.slice(i,j);
      if(bloque.length>1&&resto.length){
        if(separaAlgo){
          pasos.push({tipo:'subempate',nivel,texto:`${unir(bloque.map(nom))} siguen empatadas en ${nombreCrit[crit]}. Se desempata con el siguiente criterio:`});
        }
        explicar(bloque,resto,nivel+1);
      }
      i=j;
    }
  }

  // Primero, cómo se agrupan por puntos (el punto de partida)
  const ordenFinal=ordenarConDesempate(raw,gId,tiebreakOrder);
  explicar(raw,tiebreakOrder,0);

  return{pasos,ordenFinal};
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
  // Clasificados según la config por posición
  const clasificados=getQualified(cat);
  // "firsts" = los que entran directo (posición con "todos"), típicamente los 1ros.
  // "seconds" = el resto (comodines / mejores 2dos, 3ros...).
  const firsts=clasificados.filter(p=>p.directo);
  const seconds=clasificados.filter(p=>!p.directo);
  // Orden por rendimiento dentro de cada bloque
  firsts.sort(compareRankingCruzado);
  seconds.sort(compareRankingCruzado);
  const half=cfg.total/2;
  const qF=firsts.slice(0,half);
  const qS=seconds.slice(0,half);
  return{firsts,seconds,qualFirsts:qF,qualSeconds:qS,cfg,clasificados};
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
      <div class="header-credit">Cuadro del torneo<br>by @marcosgavassaa</div>
      <h1>🎾 Tenis y Nosotras × club24</h1>
      <p>Torneo Americano de Damas — 26 de Junio · Los Cardales Country Club</p>
    </div>
    <div class="pillbar" id="mainTabs"></div>
    <div id="view-jugadoras" style="display:${state.mainView==='jugadoras'?'block':'none'};">
      <div class="pillbar-sm" id="ctj"></div>
      <div class="pillbar-sm" id="stj"></div>
      <div id="sponsorsBar"></div>
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
  document.getElementById(elId).innerHTML=["1era","2da","3era"].map(c=>`<button class="pill-sm ${c===cur?'active':''}" onclick="${fn}('${c}')">${catLabel(c)}</button>`).join('');
}
function tiebreakLegendHtml(){
  const ol=tiebreakOrder.map(k=>`<li>${TB_LABELS[k]}</li>`).join('');
  return `<div class="tiebreak-bar"><strong>Orden de desempate en caso de igualdad:</strong><ol>${ol}</ol><div style="margin-top:4px;">Si el empate queda entre 2 parejas, lo define el resultado del partido jugado entre ellas.</div></div>`;
}

// ====================================================
// VISTA JUGADORAS
// ====================================================
function renderJ(){
  buildCatTabs('ctj',state.cat,'switchCatJ');
  document.getElementById('stj').innerHTML=`
    <button class="pill-sm ${state.subTabJ==='grupos'?'active':''}" onclick="switchSubJ('grupos')">Grupos</button>
    <button class="pill-sm ${state.subTabJ==='proximos'?'active':''}" onclick="switchSubJ('proximos')">Próximos partidos</button>
    <button class="pill-sm ${state.subTabJ==='reglamento'?'active':''}" onclick="switchSubJ('reglamento')">Reglamento</button>
    <button class="pill-sm ${state.subTabJ==='direcciones'?'active':''}" onclick="switchSubJ('direcciones')">Direcciones</button>
  `;
  const sb=document.getElementById('sponsorsBar');
  if(sb)sb.innerHTML=renderSponsorsStrip();
  renderJContent();
}
function switchCatJ(cat){state.cat=cat;renderJ();}
function switchSubJ(s){state.subTabJ=s;renderJ();}
function renderJContent(){renderPublicView(state.cat,state.subTabJ,'jcontent');}

function renderPublicView(cat,subTab,targetElId){
  const el=document.getElementById(targetElId);
  if(!el)return;
  // Solo el panel Live del admin usa el contenedor 'liveContent'.
  // Ahí mostramos explicaciones extra que las jugadoras no ven.
  const esVistaAdmin=(targetElId==='liveContent');
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

  const champion=getChampion(cat);

  if(champion){
    const p=getP(champion);
    html+=`<div class="champion-banner">
      <div class="crown">🏆</div>
      <div class="title">Campeonas ${catLabel(cat)}</div>
      <div class="names">${p?p.j1:''}<br>${p?p.j2:''}</div>
    </div>`;
  }

  if(playoffData[cat]){
    html+=`<div class="phase-label">Playoff</div>`;
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

  html+=`<div class="phase-label" style="margin-top:${playoffData[cat]?'1.8rem':'0'};">Zona de grupos</div>`;
  const corteDirecto=corteDirectoEnGrupo(cat); // hasta qué posición clasifica directo
  const descClasif=descripcionClasificacion(cat);
  grupos[cat].forEach(g=>{
    const stats=getStats(g.id,cat);
    html+=`<div class="grupo">
      <div class="grupo-header">${groupLabel(g.id)} · ${g.parejas.length} parejas</div>
      <div class="table-scroll"><table class="grupo-table">
        <thead><tr><th style="width:26px">#</th><th class="thl">Pareja</th><th>Pts</th><th>G</th><th>P</th><th>GG</th><th>GP</th><th>Dif</th></tr></thead>
        <tbody>`;
    stats.forEach((p,i)=>{
      const shade=i%2===1;
      // Línea de corte: después de la última posición que clasifica directo
      const isCut=corteDirecto>0 && i===corteDirecto-1 && i<stats.length-1;
      html+=`<tr class="${shade?'shade':''} ${isCut?'cut-row':''}">
        <td><span class="pos-badge pos-${i+1}">${i+1}</span></td>
        <td class="tdl"><div class="pnames"><span>${p.j1}</span><span>${p.j2}</span></div></td>
        <td>${p.pts}</td><td>${p.gw}</td><td>${p.l}</td><td>${p.gg}</td><td>${p.gp}</td>
        <td>${p.bal>0?'+':''}${p.bal}</td>
      </tr>`;
    });
    html+=`</tbody></table></div>`;
    html+=`<div class="cnote">🎾 ${descClasif}</div>
      <div class="legend-bar"><strong>Pts</strong>: puntos (3 x victoria) &nbsp;·&nbsp; <strong>G</strong>: ganados &nbsp;·&nbsp; <strong>P</strong>: perdidos &nbsp;·&nbsp; <strong>GG</strong>: games ganados &nbsp;·&nbsp; <strong>GP</strong>: games perdidos &nbsp;·&nbsp; <strong>Dif</strong>: diferencia de games (GG-GP)</div>
      ${tiebreakLegendHtml()}
    </div>`;
    html+=renderMatrixTable(g,cat);
    // Explicación del desempate — SOLO visible en el panel Live del admin
    if(esVistaAdmin){
      const abierta=!!state.explicacionAbierta[g.id];
      html+=`<div style="margin:-.4rem 0 1.2rem;">
        <button class="btn btn-blk btn-sm btn-full" onclick="toggleExplicacionLive('${g.id}')">${abierta?'▲ Ocultar':'▼ Ver'} por qué la clasificación quedó así</button>
        ${abierta?renderExplicacionGrupo(g.id,cat):''}
      </div>`;
    }
  });

  // Ranking cruzado por posición: se muestran TODOS los de esa posición
  // (2dos, 3ros, etc de cada grupo), con línea de corte en los que clasifican.
  {
    const cfgClasif=getClasifCat(cat);
    const maxPosCat=maxPosEnCategoria(cat);
    const ordinales={2:'2dos',3:'3ros',4:'4tos',5:'5tos',6:'6tos',7:'7mos'};
    for(let pos=1;pos<=maxPosCat;pos++){
      const v=cfgClasif[pos];
      if(v===undefined||v===0||v==='0'||v==='todos')continue; // solo posiciones con "mejores N"
      const cuantos=parseInt(v)||0;
      const lista=rankingPorPosicion(cat,pos);
      if(!lista.length)continue;
      const nombrePos=ordinales[pos]||`${pos}°`;
      const eqAll=(x,y)=>x&&y&&x.pts===y.pts&&x.bal===y.bal&&x.gg===y.gg&&x.gp===y.gp;
      html+=`<div class="phase-label" style="margin-top:1.5rem;">Ranking mejores ${nombrePos}</div>`;
      html+=`<div class="grupo"><div class="grupo-header">Ranking de ${nombrePos} — ${cuantos===1?'clasifica la mejor':'clasifican las '+cuantos+' mejores'}</div>
        <div class="table-scroll"><table class="grupo-table">
          <thead><tr><th>#</th><th class="thl">Pareja</th><th>Grupo</th><th>Pts</th><th>Dif</th><th>GG</th><th>GP</th>${esVistaAdmin?'<th></th>':''}</tr></thead><tbody>`;
      lista.forEach((s,i)=>{
        const shade=i%2===1;
        const clasifica=i<cuantos;
        const isCut=i===cuantos-1&&cuantos<lista.length;
        const tiedPrev=eqAll(s,lista[i-1]),tiedNext=eqAll(s,lista[i+1]);
        let arrows='';
        if(esVistaAdmin&&(tiedPrev||tiedNext)){
          arrows=`<div style="display:flex;gap:3px;justify-content:center;">
            <button class="tb-arrow-btn" style="width:24px;height:24px;font-size:12px;" ${tiedPrev?'':'disabled'} onclick="sorteoSwap('${cat}',${pos},${i},-1)">↑</button>
            <button class="tb-arrow-btn" style="width:24px;height:24px;font-size:12px;" ${tiedNext?'':'disabled'} onclick="sorteoSwap('${cat}',${pos},${i},1)">↓</button>
          </div>`;
        }
        html+=`<tr class="${shade?'shade':''} ${isCut?'cut-row':''}">
          <td><span class="pos-badge ${clasifica?'pos-1':''}">${i+1}</span></td>
          <td class="tdl"><div class="pnames"><span>${s.j1}</span><span>${s.j2}</span></div></td>
          <td>${groupLabelShort(s.grupoId)}</td><td>${s.pts}</td><td>${s.bal>0?'+':''}${s.bal}</td><td>${s.gg}</td><td>${s.gp}</td>
          ${esVistaAdmin?`<td>${arrows}</td>`:''}
        </tr>`;
      });
      html+=`</tbody></table></div>
        <div class="cnote">Se muestran todos los ${nombrePos} de cada grupo. ${cuantos===1?'Clasifica la mejor':'Clasifican las '+cuantos+' mejores'} (arriba de la línea punteada).</div>
        <div class="legend-bar">
          <strong>Cómo se ordenan:</strong> 1° <strong>Pts</strong> · 2° <strong>Dif</strong> de games · 3° <strong>GG</strong> (games ganados) · 4° <strong>GP</strong> (menos games perdidos).<br>
          Si persiste el empate total (no jugaron entre sí), se define por <strong>sorteo</strong> a cargo de la organización.${esVistaAdmin?'<br><strong>⚖️ Admin: usá las flechas ↑↓ (aparecen solo entre parejas empatadas en todo) para cargar el resultado del sorteo.</strong>':''}<br>
          En grupos de 5 parejas, las stats de posiciones 2° en adelante se calculan excluyendo el partido contra la última pareja del grupo, para comparar en igualdad de partidos jugados.
        </div>
      </div>`;
    }
  }

  el.innerHTML=html||'<div class="empty">No hay datos.</div>';
}

// Tira de sponsors que se muestra entre las pestañas y el contenido,
// visible en todas las pestañas de la vista de jugadoras.
function renderSponsorsStrip(){
  // Mostrar solo sponsors que tengan imagen cargada
  const conImagen=sponsorsList.filter(s=>s.logo);
  if(!conImagen.length)return'';
  let html=`<div style="padding:0 12px;margin-bottom:14px;">
    <div style="background:#fff;border:1.5px solid #eee;border-radius:12px;padding:12px 14px;display:flex;flex-wrap:wrap;gap:14px;justify-content:center;align-items:center;box-shadow:0 1px 3px rgba(0,0,0,.05);">`;
  conImagen.forEach(s=>{
    const img=`<img src="${s.logo}" alt="${s.nombre||'Sponsor'}" style="max-height:56px;max-width:130px;object-fit:contain;display:block;">`;
    if(s.link){
      html+=`<a href="${s.link}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;">${img}</a>`;
    }else{
      html+=`<div style="display:inline-flex;">${img}</div>`;
    }
  });
  html+=`</div></div>`;
  return html;
}

function renderMatrixTable(g,cat){
  const pairs=g.parejas;
  const fullLabel=p=>`<span class="pair-line">${p.j1}</span><span class="pair-line">${p.j2}</span>`;
  let html=`<div class="phase-label" style="margin-top:.6rem;margin-bottom:6px;">Resultados — ${groupLabel(g.id)}</div>
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
  const labelText=m.isPlayoff?m.grupoId:groupLabel(m.grupoId);
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
  const labelText=m.isPlayoff?m.grupoId:groupLabel(m.grupoId);
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
    <button class="pill-sm ${state.adminSection==='reglamento'?'active':''}" onclick="switchAdminSection('reglamento')">Reglamento</button>
    <button class="pill-sm ${state.adminSection==='ajustes'?'active':''}" onclick="switchAdminSection('ajustes')">⚙️ Ajustes</button>
    <button class="pill-sm ${state.adminSection==='export'?'active':''}" onclick="switchAdminSection('export')">Exportar</button>
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
      return `<button class="pill-sm ${c===state.liveCat?'active':''}" onclick="switchLiveCat('${c}')">${catLabel(c)}</button>`;
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
  else if(state.adminSection==='tiebreak') html=renderSectionTiebreak();
  else if(state.adminSection==='reglamento') html=renderSectionReglamento();
  else if(state.adminSection==='ajustes') html=renderSectionAjustes();
  else if(state.adminSection==='export') html=renderSectionExport();
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
    <strong>Diferencia de games:</strong> diferencia entre games ganados y perdidos.<br>
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

// ====================================================
// REGLAMENTO
// ====================================================
function renderSectionReglamento(){
  return `<div class="ibar">Escribí el reglamento del torneo. Formato disponible:<br>
    &bull; <strong>-</strong> al inicio de línea → bullet rosa<br>
    &bull; <strong>**texto**</strong> → <strong>negrita</strong><br>
    &bull; <strong>_texto_</strong> → <em>cursiva</em><br>
    &bull; <strong>__texto__</strong> → <u>subrayado</u><br>
    &bull; <strong>**_texto_**</strong> → <strong><em>negrita cursiva</em></strong> &nbsp;|&nbsp; <strong>**__texto__**</strong> → <strong><u>negrita subrayado</u></strong><br>
    &bull; <strong>**___texto___**</strong> → <strong><em><u>negrita cursiva subrayado</u></em></strong><br>
    &bull; 1 línea en blanco → espacio simple &nbsp;|&nbsp; 2+ líneas → espacio de sección</div>
    <textarea id="reglamentoInput" rows="16" style="width:100%;padding:12px;border:1.5px solid #ccc;border-radius:10px;font-family:inherit;font-size:14px;line-height:1.6;resize:vertical;" placeholder="Ejemplo:
- Los partidos se juegan a 1 set / 4-5 games.
- En caso de empate se define con supertiebreak a 10 puntos.

Las jugadoras deben presentarse 10 minutos antes.">${reglamentoText}</textarea>
    <button class="btn btn-pink btn-sm" style="margin-top:10px;" onclick="saveReglamento()">Guardar reglamento</button>`;
}

async function saveReglamento(){
  const val=document.getElementById('reglamentoInput').value;
  reglamentoText=val;
  await supabaseClient.from('configuracion').upsert({clave:'reglamento',valor:val});
  showToast('Reglamento guardado ✓');
}

// Convierte el texto del reglamento a HTML:
// - Líneas con "- " o "* " al inicio → bullets rosas
// - **texto** → negrita | _texto_ → cursiva | __texto__ → subrayado
// - Combinaciones: **__texto__** / **_texto_** / **___texto___**
// - 1 línea en blanco → espacio simple | 2+ líneas → espacio de sección
function renderReglamentoHtml(text){
  if(!text||!text.trim()){
    return '<div class="empty">El administrador todavía no cargó el reglamento.</div>';
  }

  function applyInline(str){
    // Negrita + cursiva + subrayado: **___texto___**
    str=str.replace(/\*\*___(.+?)___\*\*/g,'<strong><em><u>$1</u></em></strong>');
    str=str.replace(/___\*\*(.+?)\*\*___/g,'<strong><em><u>$1</u></em></strong>');
    // Negrita + subrayado: **__texto__**
    str=str.replace(/\*\*__(.+?)__\*\*/g,'<strong><u>$1</u></strong>');
    str=str.replace(/__\*\*(.+?)\*\*__/g,'<strong><u>$1</u></strong>');
    // Negrita + cursiva: **_texto_**
    str=str.replace(/\*\*_([^_]+?)_\*\*/g,'<strong><em>$1</em></strong>');
    str=str.replace(/_\*\*(.+?)\*\*_/g,'<strong><em>$1</em></strong>');
    // Cursiva + subrayado: ___texto___
    str=str.replace(/___(.+?)___/g,'<em><u>$1</u></em>');
    // Negrita sola: **texto**
    str=str.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
    // Subrayado solo: __texto__
    str=str.replace(/__(.+?)__/g,'<u>$1</u>');
    // Cursiva sola: _texto_
    str=str.replace(/(?<![_])_([^_]+?)_(?![_])/g,'<em>$1</em>');
    return str;
  }

  const lines=text.split('\n');
  let html='';
  let inList=false;
  let blankCount=0;
  let spacerAdded=false;

  lines.forEach(line=>{
    const trimmed=line.trim();
    const isBullet=/^[-*]\s+/.test(trimmed);

    if(trimmed===''){
      blankCount++;
      if(inList){html+='</ul>';inList=false;}
      if(blankCount===1){
        // 1 línea en blanco → espacio simple
        html+='<div style="margin-bottom:.5rem;"></div>';
      }else if(blankCount===2&&!spacerAdded){
        // 2+ líneas en blanco → espacio extra de sección
        html+='<div style="margin-bottom:.6rem;"></div>';
        spacerAdded=true;
      }
      return;
    }

    blankCount=0;
    spacerAdded=false;

    if(isBullet){
      if(!inList){html+='<ul class="reglamento-list">';inList=true;}
      html+=`<li>${applyInline(trimmed.replace(/^[-*]\s+/,''))}</li>`;
    }else{
      if(inList){html+='</ul>';inList=false;}
      html+=`<p class="reglamento-p" style="margin-bottom:0;">${applyInline(trimmed)}</p>`;
    }
  });

  if(inList)html+='</ul>';
  return html;
}

function renderSectionPairs(cat){
  let html=`<div class="ibar">Elegí un grupo para editar sus parejas. Podés crear grupos nuevos, eliminarlos, editar los nombres de las jugadoras, agregar, quitar o mover una pareja a otro grupo (incluso de otra categoría). Los nombres de categorías/grupos y la clasificación se editan en <strong>⚙️ Ajustes</strong>.</div>`;
  html+=`<div style="margin-bottom:12px;display:flex;gap:8px;flex-wrap:wrap;">
    <button class="btn btn-blk btn-sm" onclick="descargarParejasXLSX()">⬇ Parejas actuales (.xlsx)</button>
    <button class="btn btn-out btn-sm" onclick="descargarPlantilla()">📋 Descargar plantilla</button>
    <button class="btn btn-grn btn-sm" onclick="document.getElementById('importFileInput').click()">📤 Importar parejas</button>
    <input type="file" id="importFileInput" accept=".xlsx,.xls" style="display:none;" onchange="importarParejas(this)">
  </div>
  <div class="ibar" style="background:#fffbeb;border-color:#fde047;color:#854d0e;">⚠️ <strong>Importar reemplaza TODO:</strong> borra las parejas, resultados y playoffs actuales, y carga las del archivo. Descargá primero un respaldo con "Parejas actuales".</div>`;
  html+=`<div class="group-select-bar">`;
  grupos[cat].forEach(g=>{
    const active=state.adminPairsGroup[cat]===g.id;
    html+=`<button class="group-select-btn ${active?'active':''}" onclick="selectPairsGroup('${cat}','${g.id}')">${groupLabel(g.id)}</button>`;
  });
  html+=`<button class="group-select-btn" style="border-color:#16a34a;color:#16a34a;" onclick="agregarGrupo('${cat}')">+ Grupo nuevo</button>`;
  html+=`</div>`;

  if(!grupos[cat].length){
    return html+'<div class="empty">Esta categoría no tiene grupos. Creá uno con "+ Grupo nuevo".</div>';
  }

  const selectedG=grupos[cat].find(g=>g.id===state.adminPairsGroup[cat])||grupos[cat][0];
  const gi=grupos[cat].indexOf(selectedG);

  const allGroupOptions=[];
  ["1era","2da","3era"].forEach(c=>{
    grupos[c].forEach(g=>{
      allGroupOptions.push({cat:c,gid:g.id,label:`${catLabel(c)} - ${groupLabel(g.id)}`});
    });
  });

  html+=`<div class="grupo" style="margin-bottom:1.2rem;">
    <div class="grupo-header">${groupLabel(selectedG.id)} (${selectedG.parejas.length} parejas)</div>
    <div style="padding:12px;">
      <div style="display:flex;justify-content:flex-end;margin-bottom:10px;">
        <button class="btn btn-red btn-sm" onclick="eliminarGrupo('${cat}','${selectedG.id}')">🗑 Eliminar este grupo</button>
      </div>`;
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

function toggleExplicacionLive(gid){
  state.explicacionAbierta[gid]=!state.explicacionAbierta[gid];
  renderPublicView(state.liveCat,state.liveSubTab,'liveContent');
}

// Sorteo: el admin intercambia dos parejas EMPATADAS EN TODO en el ranking
// cruzado. dir=-1 sube, dir=1 baja. Guarda las prioridades resultantes.
async function sorteoSwap(cat,pos,i,dir){
  const lista=rankingPorPosicion(cat,pos);
  const j=i+dir;
  if(j<0||j>=lista.length)return;
  const a=lista[i],b=lista[j];
  // Solo permitido entre parejas empatadas en los 4 criterios
  if(a.pts!==b.pts||a.bal!==b.bal||a.gg!==b.gg||a.gp!==b.gp){
    showToast('Solo se puede reordenar entre parejas empatadas en todo');
    return;
  }
  // Intercambiar y registrar el nuevo orden completo como prioridades de sorteo.
  // Las prioridades solo pesan cuando el empate es total, así que asignarlas a
  // toda la lista no afecta a las que ya están separadas por stats.
  [lista[i],lista[j]]=[lista[j],lista[i]];
  lista.forEach((p,idx)=>{sorteoPrioridad[p.id]=idx;});
  await supabaseClient.from('configuracion').upsert({clave:'sorteo_prioridad',valor:sorteoPrioridad});
  renderPublicView(state.liveCat,state.liveSubTab,'liveContent');
  showToast('Resultado del sorteo guardado ✓');
}

// Arma el HTML de la explicación paso a paso del desempate de un grupo
function renderExplicacionGrupo(gId,cat){
  const{pasos,ordenFinal}=explicarClasificacionGrupo(gId,cat);
  const nombreCrit={pts:'Puntos',bal:'Diferencia de games',gg:'Games ganados',h2h:'Enfrentamiento directo'};

  let html=`<div style="border:1.5px solid #ddd;border-top:none;border-radius:0 0 10px 10px;padding:14px;background:#fff;">`;

  // Orden de criterios configurado
  html+=`<div style="font-size:11px;color:var(--gray);margin-bottom:12px;background:#fafafa;border-radius:8px;padding:8px 10px;">
    <strong>Orden de desempate configurado:</strong> ${tiebreakOrder.map((c,i)=>`${i+1}) ${nombreCrit[c]}`).join(' → ')}
  </div>`;

  // Resultado final
  html+=`<div style="font-size:12px;font-weight:600;color:var(--pink);margin-bottom:6px;">Cómo quedó el grupo</div>`;
  html+=`<div style="margin-bottom:14px;">`;
  ordenFinal.forEach((p,i)=>{
    html+=`<div style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:13px;">
      <span class="pos-badge pos-${i+1}" style="flex-shrink:0;">${i+1}</span>
      <span style="flex:1;">${p.j1} / ${p.j2}</span>
      <span style="font-size:11px;color:var(--gray-light);">Pts ${p.pts} · Dif ${p.bal>0?'+':''}${p.bal} · GG ${p.gg}</span>
    </div>`;
  });
  html+=`</div>`;

  // Pasos del razonamiento
  html+=`<div style="font-size:12px;font-weight:600;color:var(--pink);margin-bottom:6px;">Paso a paso</div>`;
  if(!pasos.length){
    html+=`<div style="font-size:12px;color:var(--gray-light);">No hay empates: el orden sale directo por puntos.</div>`;
  }else{
    html+=`<div style="display:flex;flex-direction:column;gap:8px;">`;
    pasos.forEach(s=>{
      const margin=(s.nivel||0)*16;
      let icon='',color='#555',bg='#fafafa',border='#eee';
      if(s.tipo==='resuelve'){icon='✓';color='#166534';bg='#f0fdf4';border='#bbf7d0';}
      else if(s.tipo==='salta'){icon='→';color='#854d0e';bg='#fffbeb';border='#fde047';}
      else if(s.tipo==='subempate'){icon='⚖️';color='#831843';bg='var(--pink-bg)';border='#f3c8de';}
      else if(s.tipo==='empate'){icon='=';color='#555';bg='#f3f4f6';border='#e5e7eb';}
      else if(s.tipo==='aviso'){icon='';color='#854d0e';bg='#fffbeb';border='#fde047';}
      html+=`<div style="margin-left:${margin}px;background:${bg};border:1px solid ${border};border-radius:8px;padding:8px 10px;font-size:12px;color:${color};line-height:1.5;">
        ${icon?`<strong>${icon}</strong> `:''}${s.texto}
      </div>`;
    });
    html+=`</div>`;
  }

  html+=`</div>`;
  return html;
}
function selectPairsGroup(cat,gid){state.adminPairsGroup[cat]=gid;renderA();}

// Genera un id de grupo único que no exista en NINGUNA categoría.
// Empieza con el prefijo numérico de la categoría (1/2/3) + letra correlativa.
function generarGrupoId(cat){
  const prefijo=cat==='1era'?'1':cat==='2da'?'2':'3';
  // Reunir todos los ids existentes en todas las categorías
  const existentes=new Set();
  ["1era","2da","3era"].forEach(c=>grupos[c].forEach(g=>existentes.add(g.id)));
  // Probar 1A, 1B, ... 1Z, luego 1A1, 1A2... (por si se llenan las letras)
  for(let i=0;i<26;i++){
    const cand=`${prefijo}${String.fromCharCode(65+i)}`;
    if(!existentes.has(cand))return cand;
  }
  // fallback: prefijo + número incremental
  let n=1;
  while(existentes.has(`${prefijo}G${n}`))n++;
  return `${prefijo}G${n}`;
}

// Crea un grupo nuevo (vacío) en la categoría indicada
async function agregarGrupo(cat){
  const gid=generarGrupoId(cat);
  const nuevoGrupo={id:gid,parejas:[]};
  grupos[cat].push(nuevoGrupo);
  grupos[cat].sort((a,b)=>a.id.localeCompare(b.id));
  state.adminPairsGroup[cat]=gid;
  // No hace falta insertar en Supabase todavía: el grupo "existe" cuando
  // tiene al menos una pareja. Agregamos una pareja placeholder para que
  // el grupo persista y se pueda empezar a editar.
  const pid='p'+Date.now();
  nuevoGrupo.parejas.push({id:pid,j1:'Jugadora 1',j2:'Jugadora 2'});
  await supabaseClient.from('parejas').insert({
    id:pid,categoria:cat,grupo_id:gid,jugadora1:'Jugadora 1',jugadora2:'Jugadora 2',cardales:false
  });
  renderA();showToast(`Grupo ${gid} creado`);
}

// Elimina un grupo entero: sus parejas, sus partidos y su nombre personalizado
async function eliminarGrupo(cat,gid){
  const g=grupos[cat].find(x=>x.id===gid);
  if(!g)return;
  const cantParejas=g.parejas.length;
  const nombre=groupLabel(gid);
  if(!confirm(`¿Eliminar "${nombre}" completo?\n\nSe van a borrar sus ${cantParejas} parejas y todos sus partidos. Esta acción no se puede deshacer.\n\n(Los otros grupos y el playoff no se tocan.)`)){
    return;
  }
  // Borrar partidos del grupo
  const pids=g.parejas.map(p=>p.id);
  partidos=partidos.filter(m=>m.grupoId!==gid);
  await supabaseClient.from('partidos').delete().eq('grupo_id',gid);
  // Borrar parejas del grupo
  if(pids.length){
    await supabaseClient.from('parejas').delete().eq('grupo_id',gid);
  }
  // Sacar el grupo del estado
  grupos[cat]=grupos[cat].filter(x=>x.id!==gid);
  // Borrar nombre personalizado si tenía
  if(customGroupNames[gid]){
    delete customGroupNames[gid];
    await supabaseClient.from('configuracion').upsert({clave:'group_names',valor:customGroupNames});
  }
  // Reposicionar la selección
  state.adminPairsGroup[cat]=grupos[cat].length?grupos[cat][0].id:null;
  renderA();renderJContent();showToast(`Grupo eliminado`);
}

// Guarda el nombre personalizado de un grupo
async function guardarNombreGrupo(cat,gid){
  const val=(document.getElementById(`groupNameInput_${gid}`)?.value||'').trim();
  if(val){
    customGroupNames[gid]=val;
  }else{
    delete customGroupNames[gid]; // vacío = volver al default "Grupo X"
  }
  await supabaseClient.from('configuracion').upsert({clave:'group_names',valor:customGroupNames});
  renderA();renderJContent();showToast('Nombre del grupo guardado ✓');
}

// Guarda los nombres personalizados de las categorías en Supabase
async function guardarNombresCategorias(){
  const n1=document.getElementById('catName_1era')?.value.trim()||'';
  const n2=document.getElementById('catName_2da')?.value.trim()||'';
  const n3=document.getElementById('catName_3era')?.value.trim()||'';
  // Si un campo queda vacío, usamos el default para esa categoría
  customCatNames={
    "1era":n1||CAT_NAMES_DEFAULT["1era"],
    "2da":n2||CAT_NAMES_DEFAULT["2da"],
    "3era":n3||CAT_NAMES_DEFAULT["3era"]
  };
  await supabaseClient.from('configuracion').upsert({clave:'cat_names',valor:customCatNames});
  renderA();
  showToast('Nombres de categorías guardados ✓');
}
async function resetNombresCategorias(){
  customCatNames={...CAT_NAMES_DEFAULT};
  await supabaseClient.from('configuracion').upsert({clave:'cat_names',valor:customCatNames});
  renderA();
  showToast('Nombres restablecidos');
}

// ====================================================
// AJUSTES (nombres de categorías, grupos y clasificación)
// ====================================================
function renderSectionAjustes(){
  let html=`<div class="ibar">Configurá acá los nombres de las categorías y grupos, y cómo se define la clasificación al playoff de cada categoría.</div>`;

  // ---- 1. NOMBRES DE CATEGORÍAS ----
  html+=`<div class="grupo" style="margin-bottom:1.2rem;">
    <div class="grupo-header">🏷️ Nombres de las categorías</div>
    <div style="padding:12px;">
      <div style="font-size:11px;color:var(--gray);margin-bottom:10px;">Cómo se muestra cada categoría en toda la app (ej: "1° Categoría", "Categoría A", "Damas A"). No cambia los datos.</div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <span style="font-size:12px;color:var(--gray-light);min-width:80px;">Categoría 1:</span>
          <input id="catName_1era" value="${catLabel('1era').replace(/"/g,'&quot;')}" placeholder="1° Categoría" style="flex:1;min-width:150px;">
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <span style="font-size:12px;color:var(--gray-light);min-width:80px;">Categoría 2:</span>
          <input id="catName_2da" value="${catLabel('2da').replace(/"/g,'&quot;')}" placeholder="2° Categoría" style="flex:1;min-width:150px;">
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <span style="font-size:12px;color:var(--gray-light);min-width:80px;">Categoría 3:</span>
          <input id="catName_3era" value="${catLabel('3era').replace(/"/g,'&quot;')}" placeholder="3° Categoría" style="flex:1;min-width:150px;">
        </div>
      </div>
      <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
        <button class="btn btn-pink btn-sm" onclick="guardarNombresCategorias()">Guardar nombres</button>
        <button class="btn btn-out btn-sm" onclick="resetNombresCategorias()">Volver a los nombres por defecto</button>
      </div>
    </div>
  </div>`;

  // ---- 2. NOMBRES DE GRUPOS ----
  html+=`<div class="grupo" style="margin-bottom:1.2rem;">
    <div class="grupo-header">📛 Nombres de los grupos</div>
    <div style="padding:12px;">
      <div style="font-size:11px;color:var(--gray);margin-bottom:10px;">Poné un nombre personalizado a cada grupo (ej: "Zona Norte"). Dejalo vacío para usar el nombre por defecto ("Grupo 1A").</div>`;
  ["1era","2da","3era"].forEach(cat=>{
    if(!grupos[cat].length)return;
    html+=`<div style="font-size:12px;font-weight:600;color:var(--pink);margin:10px 0 6px;">${catLabel(cat)}</div>`;
    grupos[cat].forEach(g=>{
      html+=`<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px;">
        <span style="font-size:12px;color:var(--gray-light);min-width:70px;">Grupo ${g.id}:</span>
        <input id="ajGroupName_${g.id}" value="${(customGroupNames[g.id]||'').replace(/"/g,'&quot;')}" placeholder="Grupo ${g.id}" style="flex:1;min-width:140px;">
      </div>`;
    });
  });
  html+=`<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
      <button class="btn btn-pink btn-sm" onclick="guardarTodosNombresGrupos()">Guardar nombres de grupos</button>
      <button class="btn btn-out btn-sm" onclick="resetNombresGrupos()">Borrar todos los nombres personalizados</button>
    </div>
    </div>
  </div>`;

  // ---- SPONSORS ----
  html+=`<div class="grupo" style="margin-bottom:1.2rem;">
    <div class="grupo-header">🤝 Sponsors del torneo</div>
    <div style="padding:12px;">
      <div style="font-size:11px;color:var(--gray);margin-bottom:10px;">Subí la imagen del logo de cada sponsor desde tu dispositivo. Aparecen entre las pestañas y los grupos, en todas las pantallas que ven las jugadoras. El nombre y el link son opcionales (el link hace que el logo sea clickeable).</div>
      <div id="sponsorsEditor">`;
  sponsorsList.forEach((s,i)=>{
    const preview=s.logo
      ?`<img src="${s.logo}" alt="logo" style="max-height:50px;max-width:90px;object-fit:contain;border:1px solid #eee;border-radius:6px;background:#fff;padding:2px;">`
      :`<div style="width:90px;height:50px;border:1.5px dashed #ccc;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:10px;color:var(--gray-light);text-align:center;">Sin imagen</div>`;
    html+=`<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px;padding:8px;background:#fafafa;border:1px solid #eee;border-radius:8px;">
      ${preview}
      <div style="flex:1;min-width:180px;display:flex;flex-direction:column;gap:6px;">
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <input id="spNombre_${i}" value="${(s.nombre||'').replace(/"/g,'&quot;')}" placeholder="Nombre (opcional)" style="flex:1;min-width:120px;">
          <input id="spLink_${i}" value="${(s.link||'').replace(/"/g,'&quot;')}" placeholder="Link (opcional)" style="flex:1;min-width:120px;">
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
          <button class="btn btn-out btn-sm" onclick="document.getElementById('spFile_${i}').click()">${s.logo?'Cambiar imagen':'Subir imagen'}</button>
          <input type="file" id="spFile_${i}" accept="image/*" style="display:none;" onchange="subirImagenSponsor(${i},this)">
          <button class="btn btn-red btn-sm" onclick="eliminarSponsor(${i})">Quitar sponsor</button>
        </div>
      </div>
    </div>`;
  });
  if(!sponsorsList.length){
    html+=`<div style="font-size:12px;color:var(--gray-light);margin-bottom:8px;">Todavía no hay sponsors cargados.</div>`;
  }
  html+=`</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;">
        <button class="btn btn-out btn-sm" onclick="agregarSponsor()">+ Agregar sponsor</button>
        <button class="btn btn-pink btn-sm" onclick="guardarSponsors()">Guardar sponsors</button>
      </div>
      <div style="font-size:10px;color:var(--gray-light);margin-top:8px;">Las imágenes se optimizan automáticamente al subirlas para que carguen rápido. No te olvides de tocar "Guardar sponsors" al terminar.</div>
    </div>
  </div>`;

  // ---- 3. CLASIFICACIÓN POR CATEGORÍA ----
  html+=`<div class="grupo" style="margin-bottom:1.2rem;">
    <div class="grupo-header">🏆 Clasificación al playoff</div>
    <div style="padding:12px;">
      <div style="font-size:11px;color:var(--gray);margin-bottom:4px;">Para cada categoría, definí por cada posición del grupo cuántas parejas clasifican:</div>
      <div style="font-size:11px;color:var(--gray-light);margin-bottom:12px;line-height:1.6;">
        &bull; <strong>Todos</strong>: todos los de esa posición pasan (ej: todos los 1ros).<br>
        &bull; <strong>Un número</strong>: los N mejores de esa posición entre todos los grupos (comodines).<br>
        &bull; <strong>0 / Ninguno</strong>: esa posición no clasifica.
      </div>`;

  ["1era","2da","3era"].forEach(cat=>{
    if(!grupos[cat].length)return;
    const cfg=getClasifCat(cat);
    const maxPos=maxPosEnCategoria(cat);
    const totalClas=totalClasificados(cat);
    const unico=esUnicoGrupo(cat);
    html+=`<div style="background:#fafafa;border:1.5px solid #eee;border-radius:10px;padding:12px;margin-bottom:12px;">
      <div style="font-size:13px;font-weight:600;color:var(--pink);margin-bottom:8px;">${catLabel(cat)} <span style="font-size:11px;font-weight:400;color:var(--gray-light);">— ${totalClas} clasificados en total</span></div>`;

    if(unico){
      // Un solo grupo: clasifican las primeras X parejas del grupo
      const g=grupos[cat][0];
      const total=g.parejas.length;
      const val=(cfg.single===undefined)?'0':String(cfg.single);
      html+=`<div style="font-size:11px;color:var(--gray);margin-bottom:8px;">Esta categoría tiene un <strong>único grupo</strong> (${total} parejas). Elegí cuántas de las primeras clasifican:</div>`;
      html+=`<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px;">
        <span style="font-size:12px;color:var(--gray);min-width:130px;">Primeras parejas que clasifican:</span>
        <select id="clasifSingle_${cat}" onchange="onClasifSingleChange('${cat}')" style="width:auto;min-width:130px;">
          <option value="0" ${val==='0'?'selected':''}>Ninguna</option>`;
      for(let n=1;n<=total;n++){
        html+=`<option value="${n}" ${val===String(n)?'selected':''}>Primeras ${n}</option>`;
      }
      html+=`<option value="todos" ${val==='todos'?'selected':''}>Todas</option>
        </select>
      </div>`;
    }else{
      for(let pos=1;pos<=maxPos;pos++){
        const val=cfg[pos];
        const valStr=(val===undefined)?'0':String(val);
        const ordinales={1:'1ros',2:'2dos',3:'3ros',4:'4tos',5:'5tos',6:'6tos',7:'7mos'};
        html+=`<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px;">
          <span style="font-size:12px;color:var(--gray);min-width:100px;">Posición ${pos} (${ordinales[pos]||pos+'°'}):</span>
          <select id="clasif_${cat}_${pos}" onchange="onClasifSelectChange('${cat}',${pos})" style="width:auto;min-width:130px;">
            <option value="0" ${valStr==='0'?'selected':''}>No clasifica</option>
            <option value="todos" ${valStr==='todos'?'selected':''}>Todos</option>
            <option value="1" ${valStr==='1'?'selected':''}>1 mejor</option>
            <option value="2" ${valStr==='2'?'selected':''}>2 mejores</option>
            <option value="3" ${valStr==='3'?'selected':''}>3 mejores</option>
            <option value="4" ${valStr==='4'?'selected':''}>4 mejores</option>
            <option value="5" ${valStr==='5'?'selected':''}>5 mejores</option>
            <option value="6" ${valStr==='6'?'selected':''}>6 mejores</option>
            <option value="8" ${valStr==='8'?'selected':''}>8 mejores</option>
          </select>
        </div>`;
      }
    }
    html+=`<div style="font-size:11px;color:#831843;background:var(--pink-bg);border-radius:8px;padding:8px;margin-top:8px;">${descripcionClasificacion(cat)}</div>`;
    html+=`</div>`;
  });
  html+=`<button class="btn btn-pink btn-sm" onclick="guardarClasificacion()">Guardar clasificación</button>
    <button class="btn btn-out btn-sm" style="margin-left:8px;" onclick="resetClasificacion()">Volver a la config por defecto</button>
    </div>
  </div>`;

  return html;
}

// Guarda todos los nombres de grupos de una vez
async function guardarTodosNombresGrupos(){
  ["1era","2da","3era"].forEach(cat=>{
    grupos[cat].forEach(g=>{
      const val=(document.getElementById(`ajGroupName_${g.id}`)?.value||'').trim();
      if(val)customGroupNames[g.id]=val;
      else delete customGroupNames[g.id];
    });
  });
  await supabaseClient.from('configuracion').upsert({clave:'group_names',valor:customGroupNames});
  renderA();renderJContent();showToast('Nombres de grupos guardados ✓');
}
// ---- SPONSORS: alta, baja, subida de imagen y guardado ----
// Lee nombre y link de los inputs (conserva el logo ya cargado en memoria)
function leerSponsorsDelForm(){
  return sponsorsList.map((s,i)=>({
    nombre:(document.getElementById(`spNombre_${i}`)?.value||'').trim(),
    logo:s.logo||'', // el logo vive en memoria (base64), no en un input de texto
    link:(document.getElementById(`spLink_${i}`)?.value||'').trim(),
  }));
}
function agregarSponsor(){
  sponsorsList=leerSponsorsDelForm();
  sponsorsList.push({nombre:'',logo:'',link:''});
  renderAContent();
}
function eliminarSponsor(i){
  sponsorsList=leerSponsorsDelForm();
  sponsorsList.splice(i,1);
  renderAContent();
}

// Comprime y redimensiona una imagen a base64 para que ocupe poco.
// Máximo 400px de lado mayor; devuelve un data URL (JPEG o PNG si tiene transparencia).
function comprimirImagen(file,maxLado=400){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onerror=()=>reject(new Error('No se pudo leer el archivo'));
    reader.onload=e=>{
      const img=new Image();
      img.onerror=()=>reject(new Error('El archivo no es una imagen válida'));
      img.onload=()=>{
        let{width,height}=img;
        if(width>height){ if(width>maxLado){height=Math.round(height*maxLado/width);width=maxLado;} }
        else{ if(height>maxLado){width=Math.round(width*maxLado/height);height=maxLado;} }
        const canvas=document.createElement('canvas');
        canvas.width=width;canvas.height=height;
        const ctx=canvas.getContext('2d');
        ctx.drawImage(img,0,0,width,height);
        // Si el nombre sugiere PNG, conservar transparencia; si no, JPEG (más liviano)
        const esPng=/\.png$/i.test(file.name);
        const dataUrl=esPng?canvas.toDataURL('image/png'):canvas.toDataURL('image/jpeg',0.82);
        resolve(dataUrl);
      };
      img.src=e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

async function subirImagenSponsor(i,inputEl){
  const file=inputEl.files&&inputEl.files[0];
  inputEl.value='';
  if(!file)return;
  if(!file.type.startsWith('image/')){showToast('Elegí un archivo de imagen');return;}
  try{
    showToast('Optimizando imagen...');
    const dataUrl=await comprimirImagen(file,400);
    // Guardar nombre/link tipeados y setear el logo de esta fila
    sponsorsList=leerSponsorsDelForm();
    sponsorsList[i].logo=dataUrl;
    renderAContent();
    showToast('Imagen lista ✓ — acordate de Guardar sponsors');
  }catch(e){
    console.error('Error con la imagen:',e);
    showToast('No se pudo procesar la imagen');
  }
}

async function guardarSponsors(){
  sponsorsList=leerSponsorsDelForm().filter(s=>s.logo||s.nombre);
  try{
    await supabaseClient.from('configuracion').upsert({clave:'sponsors',valor:sponsorsList});
    renderAContent();renderJContent();
    showToast('Sponsors guardados ✓');
  }catch(e){
    console.error('Error guardando sponsors:',e);
    // El error más común es que las imágenes sean muy pesadas para una fila
    showToast('No se pudieron guardar. Probá con imágenes más chicas o menos sponsors.');
  }
}

async function resetNombresGrupos(){
  if(!confirm('¿Borrar todos los nombres personalizados de grupos? Van a volver a "Grupo 1A", "Grupo 2B", etc.'))return;
  customGroupNames={};
  await supabaseClient.from('configuracion').upsert({clave:'group_names',valor:customGroupNames});
  renderA();renderJContent();showToast('Nombres de grupos restablecidos');
}

// Cuando cambia un select de clasificación, actualiza la vista para reflejar
// la nueva descripción y el total (sin guardar todavía).
function onClasifSelectChange(cat,pos){
  const val=document.getElementById(`clasif_${cat}_${pos}`)?.value;
  if(val==='0'){ delete clasificacionConfig[cat][pos]; }
  else{ if(!clasificacionConfig[cat])clasificacionConfig[cat]={}; clasificacionConfig[cat][pos]=(val==='todos')?'todos':parseInt(val); }
  // Re-render solo la sección de ajustes para actualizar descripción y total
  renderAContent();
}
// Cambio del selector de "primeras X" para categorías de un solo grupo
function onClasifSingleChange(cat){
  const val=document.getElementById(`clasifSingle_${cat}`)?.value;
  if(!clasificacionConfig[cat])clasificacionConfig[cat]={};
  if(val==='0'){ delete clasificacionConfig[cat].single; }
  else{ clasificacionConfig[cat].single=(val==='todos')?'todos':parseInt(val); }
  renderAContent();
}
async function guardarClasificacion(){
  await supabaseClient.from('configuracion').upsert({clave:'clasif_config',valor:clasificacionConfig});
  renderA();renderJContent();showToast('Clasificación guardada ✓');
}
async function resetClasificacion(){
  if(!confirm('¿Volver a la configuración de clasificación por defecto?'))return;
  clasificacionConfig=JSON.parse(JSON.stringify(CLASIF_DEFAULT));
  await supabaseClient.from('configuracion').upsert({clave:'clasif_config',valor:clasificacionConfig});
  renderA();renderJContent();showToast('Clasificación restablecida');
}
async function editP(cat,gi,pi,f,v){
  const pair=grupos[cat][gi].parejas[pi];
  pair[f]=v;
  const col=f==='j1'?'jugadora1':'jugadora2';
  await supabaseClient.from('parejas').update({[col]:v}).eq('id',pair.id);
  showToast('Guardado');
}
async function delP(cat,gi,pi){
  const grupo=grupos[cat][gi];
  // Si es la última pareja del grupo, avisar que el grupo va a quedar vacío
  if(grupo.parejas.length===1){
    if(!confirm(`Esta es la única pareja de "${groupLabel(grupo.id)}". Si la borrás, el grupo queda vacío y desaparece.\n\nSi querés eliminar el grupo entero usá el botón "🗑 Eliminar grupo". ¿Borrar igual?`)){
      return;
    }
  }
  const pid=grupo.parejas[pi].id;
  grupo.parejas.splice(pi,1);
  partidos=partidos.filter(m=>m.p1!==pid&&m.p2!==pid);
  await supabaseClient.from('partidos').delete().or(`pareja1_id.eq.${pid},pareja2_id.eq.${pid}`);
  await supabaseClient.from('parejas').delete().eq('id',pid);
  // Si el grupo quedó vacío, sacarlo del estado y limpiar su nombre
  if(grupo.parejas.length===0){
    grupos[cat]=grupos[cat].filter(x=>x.id!==grupo.id);
    if(customGroupNames[grupo.id]){
      delete customGroupNames[grupo.id];
      await supabaseClient.from('configuracion').upsert({clave:'group_names',valor:customGroupNames});
    }
    state.adminPairsGroup[cat]=grupos[cat].length?grupos[cat][0].id:null;
  }else{
    await regenerateMatchesForGroup(cat,grupo.id);
  }
  renderA();renderJContent();showToast('Eliminado');
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
  showToast(`Pareja movida a ${catLabel(targetCat)} - ${groupLabel(targetGid)}`);
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
// CANCHAS Y HORARIOS
// ====================================================
function renderSectionSched(){
  let allMatches=[];
  ["1era","2da","3era"].forEach(cat=>{
    const groupMatches=partidos
      .filter(m=>m.cat===cat&&!m.played)
      .map(m=>({...m,catLabel:CAT_LABELS[cat]}))
      .sort((a,b)=>a.grupoId.localeCompare(b.grupoId));
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
      : `Cat. ${m.catLabel} — ${groupLabel(m.grupoId)}: ${pJ1(m.p1)} vs ${pJ1(m.p2)}`;
    return{id:m.id,label};
  });

  html+=`<div class="sched-grid">`;
  allMatches.forEach(m=>{
    const sched=getSched(m.id);
    const label=m.isPlayoff?`Cat. ${m.catLabel} — ${m.roundName}`:`Cat. ${m.catLabel} — ${groupLabel(m.grupoId)}`;
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

function findScheduleConflict(mId,cancha,hora){
  // Normaliza a string para comparar sin importar si Supabase devolvió número o string
  if(!cancha||!hora)return null;
  const cStr=String(cancha).trim();
  const hStr=String(hora).trim();
  const allMatchIds=Object.keys(matchSchedule);
  for(const otherId of allMatchIds){
    if(otherId===mId)continue;
    const other=matchSchedule[otherId];
    // Si el otro no existe, es "a continuación" o no tiene cancha+hora completos → salteamos
    if(!other||other.after)continue;
    const otherC=String(other.cancha||'').trim();
    const otherH=String(other.hora||'').trim();
    if(!otherC||!otherH)continue;
    if(otherC===cStr&&otherH===hStr){
      // Solo reportar conflicto si el partido que ocupa ese slot todavía existe
      // y todavía está pendiente (no fue jugado ni eliminado)
      const m=findMatchById(otherId);
      if(!m)continue; // el partido ya no existe, ignoramos el slot
      const isStillPending=partidos.find(p=>p.id===otherId&&!p.played)||
        ["1era","2da","3era"].some(cat=>playoffData[cat]&&
          playoffData[cat].rounds.some(r=>r.matches.some(pm=>pm.id===otherId)));
      if(!isStillPending)continue; // el partido ya fue jugado, el slot está libre
      return m;
    }
  }
  return null;
}

async function saveSchedGeneric(mId){
  // Leemos AMBOS campos del DOM juntos para tener el estado actual completo
  const c=document.getElementById(`cancha_${mId}`)?.value||'';
  const h=document.getElementById(`hora_${mId}`)?.value||'';

  // Actualizamos en memoria PRIMERO (así el partido que se está editando
  // ya tiene su nuevo valor antes de que findScheduleConflict lo excluya)
  const cur=getSched(mId);
  matchSchedule[mId]={...cur,cancha:c,hora:h};

  const conflict=findScheduleConflict(mId,c,h);
  if(conflict){
    const n1=conflict.p1?pNombre(conflict.p1):'?',n2=conflict.p2?pNombre(conflict.p2):'?';
    showToast(`⚠️ Cancha ${c} a las ${h} ya está asignada a: ${n1} vs ${n2}`);
    // Revertimos en memoria al valor anterior
    matchSchedule[mId]={...cur};
    const cInput=document.getElementById(`cancha_${mId}`);
    const hInput=document.getElementById(`hora_${mId}`);
    if(cInput)cInput.value=cur.cancha||'';
    if(hInput)hInput.value=cur.hora||'';
    return;
  }

  await saveSchedToDB(mId);
  renderJContent();showToast('Horario guardado');
}
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
    <div class="sched-card-hdr">${groupLabel(m.grupoId)}</div>
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
    <div class="sched-card-hdr">${groupLabel(m.grupoId)}${stag}</div>
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
    <button class="toggle-btn ${mode==='cuartos'?'active':''}" onclick="setPlayoffMode('${cat}','cuartos')">Cuartos (8)</button>
    <button class="toggle-btn ${mode==='semis'?'active':''}" onclick="setPlayoffMode('${cat}','semis')">Semis (4)</button>
    <button class="toggle-btn ${mode==='final'?'active':''}" onclick="setPlayoffMode('${cat}','final')">Final directa (2)</button>
  </div>`;

  const{cfg}=getSeeds(cat);
  const clasificados=getQualified(cat);
  const po=playoffData[cat];
  const isPreview=!po||po.isPreview;

  html+=`<div style="font-size:12px;font-weight:500;color:var(--pink);margin-bottom:4px;">Clasificados actuales según la config (${clasificados.length})</div>`;
  html+=`<div style="font-size:11px;color:var(--gray-light);margin-bottom:8px;">${descripcionClasificacion(cat)} <a onclick="switchAdminSection('ajustes')" style="color:var(--pink);cursor:pointer;text-decoration:underline;">Cambiar en Ajustes</a></div>`;
  if(!clasificados.length){
    html+=`<div class="empty">Todavía no hay clasificados. Cargá resultados de grupos o configurá la clasificación en Ajustes.</div>`;
  }else{
    html+=`<div class="grupo"><div class="table-scroll"><table class="grupo-table"><thead><tr><th>#</th><th class="thl">Pareja</th><th>Grupo</th><th>Vía</th></tr></thead><tbody>`;
    clasificados.forEach((s,i)=>{
      const shade=i%2===1;
      html+=`<tr class="${shade?'shade':''}"><td><span class="pos-badge ${s.directo?'pos-1':'pos-2'}">${i+1}</span></td><td class="tdl"><div class="pnames"><span>${s.j1}</span><span>${s.j2}</span></div></td><td>${groupLabelShort(s.grupoId)}</td><td>${s.viaLabel}</td></tr>`;
    });
    html+=`</tbody></table></div></div>`;
  }

  // Aviso si el cuadro elegido (semis/cuartos) no coincide con la cantidad de clasificados
  if(clasificados.length!==cfg.total){
    html+=`<div class="ibar" style="margin-top:10px;background:#fffbeb;border-color:#fde047;color:#854d0e;">⚠️ La clasificación da <strong>${clasificados.length}</strong> parejas pero el cuadro de <strong>${cfg.roundName}</strong> necesita <strong>${cfg.total}</strong>. Ajustá la clasificación o el formato del cuadro para que coincidan.</div>`;
  }

  html+=`<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;">
    <button class="btn btn-out btn-sm" onclick="generarPreview('${cat}')">${isPreview?'Generar / actualizar':'Actualizar'} vista previa</button>
    ${po?`<button class="btn btn-blk btn-sm" onclick="confirmarPlayoff('${cat}')">Confirmar cuadro definitivo</button>`:''}
    ${po?`<button class="btn btn-red btn-sm" onclick="resetPlayoff('${cat}')">Resetear cuadro de playoff</button>`:''}
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
function seedPositionsForBracket(n){
  if(n===2) return [0,1];
  if(n===4) return [0,3,1,2];
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

// Empareja a TODOS los clasificados en cruces por siembra estándar:
// 1° vs último, 2° vs anteúltimo, etc. Evita, cuando puede, que dos parejas
// del mismo grupo se crucen en la primera ronda (las intercambia con otro cruce).
// Recibe la lista completa de clasificados ya ordenada por ranking (mejor primero).
function armarCruces(clasificados,totalSlots){
  // Rellenar con null si faltan (por si aún no hay suficientes clasificados)
  const seeds=clasificados.slice(0,totalSlots);
  while(seeds.length<totalSlots)seeds.push(null);

  const nCruces=totalSlots/2;
  // Emparejamiento por siembra: seed i (0-index) vs seed (totalSlots-1-i)
  let cruces=[];
  for(let i=0;i<nCruces;i++){
    cruces.push({a:seeds[i],b:seeds[totalSlots-1-i]});
  }

  // Intento de evitar choques del mismo grupo en primera ronda:
  // si a y b son del mismo grupo, buscar otro cruce con el que intercambiar
  // el segundo (b) sin crear un nuevo choque.
  const mismoGrupo=(x,y)=>x&&y&&x.grupoId&&y.grupoId&&x.grupoId===y.grupoId;
  for(let i=0;i<cruces.length;i++){
    if(mismoGrupo(cruces[i].a,cruces[i].b)){
      for(let j=0;j<cruces.length;j++){
        if(j===i)continue;
        // probar intercambiar los "b"
        const nuevoIB=cruces[j].b, nuevoJB=cruces[i].b;
        if(!mismoGrupo(cruces[i].a,nuevoIB)&&!mismoGrupo(cruces[j].a,nuevoJB)){
          [cruces[i].b,cruces[j].b]=[cruces[j].b,cruces[i].b];
          break;
        }
      }
    }
  }
  return cruces;
}

function buildRoundsForMode(cat,seedsData){
  const cfg=getPlayoffConfig(cat);
  // Lista completa de clasificados ordenada por ranking (directos primero,
  // luego comodines, cada bloque ya ordenado por rendimiento en getSeeds).
  const clasificados=[...seedsData.firsts,...seedsData.seconds];

  if(cfg.total===2){
    // Final directa: los 2 mejores clasificados juegan la final.
    return[
      {name:'Final',matches:[
        {id:'f1',p1:clasificados[0]?.id||null,p2:clasificados[1]?.id||null,sets:[],winner:null}
      ]},
    ];
  }

  // Armar los cruces de primera ronda con TODOS los clasificados
  const cruces=armarCruces(clasificados,cfg.total);
  // Reordenar los cruces según la posición en el bracket (para que el árbol
  // visual quede bien balanceado: 1ro arriba, 2do abajo, etc.)
  const orden=seedPositionsForBracket(cfg.total/2);
  const crucesOrdenados=orden.map(i=>cruces[i]||{a:null,b:null});

  if(cfg.total===4){
    return[
      {name:'Semifinales',matches:[
        {id:'sf1',p1:crucesOrdenados[0]?.a?.id||null,p2:crucesOrdenados[0]?.b?.id||null,sets:[],winner:null},
        {id:'sf2',p1:crucesOrdenados[1]?.a?.id||null,p2:crucesOrdenados[1]?.b?.id||null,sets:[],winner:null},
      ]},
      {name:'Final',matches:[{id:'f1',p1:null,p2:null,sets:[],winner:null}]},
    ];
  }
  return[
    {name:'Cuartos de final',matches:[
      {id:'qf1',p1:crucesOrdenados[0]?.a?.id||null,p2:crucesOrdenados[0]?.b?.id||null,sets:[],winner:null},
      {id:'qf2',p1:crucesOrdenados[1]?.a?.id||null,p2:crucesOrdenados[1]?.b?.id||null,sets:[],winner:null},
      {id:'qf3',p1:crucesOrdenados[2]?.a?.id||null,p2:crucesOrdenados[2]?.b?.id||null,sets:[],winner:null},
      {id:'qf4',p1:crucesOrdenados[3]?.a?.id||null,p2:crucesOrdenados[3]?.b?.id||null,sets:[],winner:null},
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

// Importa parejas desde un archivo Excel y reemplaza TODO el torneo
async function importarParejas(inputEl){
  const file=inputEl.files&&inputEl.files[0];
  inputEl.value=''; // reset para poder re-subir el mismo archivo
  if(!file)return;
  if(typeof XLSX==='undefined'){showToast('Error: librería Excel no cargada');return;}

  // Mapeo de etiquetas de categoría del Excel a las claves internas
  const catKeyFromLabel=(raw)=>{
    const t=String(raw||'').toLowerCase().trim();
    if(t.includes('1')||t.startsWith('primera')||t.startsWith('1ra')||t.startsWith('1era'))return '1era';
    if(t.includes('2')||t.startsWith('segunda')||t.startsWith('2da'))return '2da';
    if(t.includes('3')||t.startsWith('tercera')||t.startsWith('3ra')||t.startsWith('3era'))return '3era';
    return null;
  };
  // Normaliza el id de grupo: "Grupo 1A" → "1A", "1a" → "1A"
  const normGrupo=(raw)=>{
    let t=String(raw||'').trim();
    t=t.replace(/grupo/i,'').trim();
    return t.toUpperCase();
  };

  try{
    const data=await file.arrayBuffer();
    const wb=XLSX.read(data,{type:'array'});
    // Buscar la hoja "Plantilla" o "Parejas", si no la primera
    let sheetName=wb.SheetNames.find(n=>/plantilla|parejas/i.test(n))||wb.SheetNames[0];
    const ws=wb.Sheets[sheetName];
    const rows=XLSX.utils.sheet_to_json(ws,{header:1,blankrows:false});
    if(!rows.length){showToast('El archivo está vacío');return;}

    // Detectar fila de encabezado (la primera que tenga "categor" en alguna celda)
    let startIdx=0;
    for(let i=0;i<Math.min(rows.length,5);i++){
      if(rows[i].some(c=>/categor/i.test(String(c)))){startIdx=i+1;break;}
    }

    // Parsear filas → estructura de grupos
    const nuevos={"1era":{},"2da":{},"3era":{}}; // {cat: {gid: [{j1,j2}]}}
    let validCount=0, errorRows=[];
    for(let i=startIdx;i<rows.length;i++){
      const r=rows[i];
      if(!r||r.every(c=>String(c||'').trim()===''))continue; // fila vacía
      const cat=catKeyFromLabel(r[0]);
      const gid=normGrupo(r[1]);
      const j1=String(r[2]||'').trim();
      const j2=String(r[3]||'').trim();
      if(!cat||!gid||!j1||!j2){errorRows.push(i+1);continue;}
      if(!nuevos[cat][gid])nuevos[cat][gid]=[];
      nuevos[cat][gid].push({j1,j2});
      validCount++;
    }

    if(validCount===0){
      showToast('No se encontraron parejas válidas. Revisá el formato del archivo.');
      return;
    }

    // Resumen para confirmar
    let resumen=[];
    ["1era","2da","3era"].forEach(cat=>{
      const grupos_c=Object.keys(nuevos[cat]);
      if(grupos_c.length){
        const total=grupos_c.reduce((a,g)=>a+nuevos[cat][g].length,0);
        const label=cat==='1era'?'1°':cat==='2da'?'2°':'3°';
        resumen.push(`${label} Cat: ${total} parejas en ${grupos_c.length} grupos`);
      }
    });
    let msg=`Se van a importar ${validCount} parejas:\n\n${resumen.join('\n')}`;
    if(errorRows.length)msg+=`\n\n(Se ignoraron ${errorRows.length} filas incompletas: ${errorRows.slice(0,10).join(', ')}${errorRows.length>10?'...':''})`;
    msg+=`\n\n⚠️ Esto BORRA todas las parejas, resultados y playoffs actuales. ¿Continuar?`;
    if(!confirm(msg))return;

    showToast('Importando... no cierres la página');

    // 1. Borrar todo lo existente en la base
    await supabaseClient.from('playoff').delete().neq('categoria','');
    await supabaseClient.from('horarios').delete().neq('partido_id','');
    await supabaseClient.from('partidos').delete().neq('id','');
    await supabaseClient.from('parejas').delete().neq('id','');

    // 2. Construir parejas nuevas con ids frescos
    let pid=0;
    const pairsToInsert=[];
    const tempGrupos={"1era":[],"2da":[],"3era":[]};
    ["1era","2da","3era"].forEach(cat=>{
      Object.keys(nuevos[cat]).sort().forEach(gid=>{
        const parejasObj=[];
        nuevos[cat][gid].forEach(p=>{
          const id=`p${pid++}`;
          pairsToInsert.push({id,categoria:cat,grupo_id:gid,jugadora1:p.j1,jugadora2:p.j2,cardales:false});
          parejasObj.push({id,j1:p.j1,j2:p.j2});
        });
        tempGrupos[cat].push({id:gid,parejas:parejasObj});
      });
    });
    await supabaseClient.from('parejas').insert(pairsToInsert);

    // 3. Generar partidos de grupo (todos contra todos)
    const matchesToInsert=[];
    ["1era","2da","3era"].forEach(cat=>{
      tempGrupos[cat].forEach(g=>{
        g.parejas.forEach((p1,i)=>{
          g.parejas.forEach((p2,j)=>{
            if(j<=i)return;
            matchesToInsert.push({
              id:`m_${g.id}_${p1.id}_${p2.id}`,
              categoria:cat,grupo_id:g.id,pareja1_id:p1.id,pareja2_id:p2.id,
              sets:[],jugado:false,simulado:false
            });
          });
        });
      });
    });
    if(matchesToInsert.length){
      await supabaseClient.from('partidos').insert(matchesToInsert);
    }

    // 4. Recargar todo desde la base y re-renderizar
    playoffData={"1era":null,"2da":null,"3era":null};
    matchSchedule={};
    await loadAllData();
    ["1era","2da","3era"].forEach(c=>{ state.adminPairsGroup[c]=grupos[c].length?grupos[c][0].id:null; });
    renderA();renderJContent();
    showToast(`✓ Importadas ${validCount} parejas`);
  }catch(e){
    console.error('Error importando:',e);
    showToast('Error al leer el archivo. Verificá que sea un Excel válido.');
  }
}

// Descarga las parejas actuales en formato Excel (.xlsx)
function descargarParejasXLSX(){
  if(typeof XLSX==='undefined'){showToast('Error: librería Excel no cargada');return;}
  const catLabels={"1era":catLabel("1era"),"2da":catLabel("2da"),"3era":catLabel("3era")};
  const rows=[["Categoría","Grupo","Jugadora 1","Jugadora 2"]];
  ["1era","2da","3era"].forEach(cat=>{
    grupos[cat].forEach(g=>{
      g.parejas.forEach(p=>{
        rows.push([catLabels[cat],groupLabel(g.id),p.j1,p.j2]);
      });
    });
  });
  const ws=XLSX.utils.aoa_to_sheet(rows);
  // Ancho de columnas
  ws['!cols']=[{wch:18},{wch:12},{wch:28},{wch:28}];
  // Estilo de cabecera (negrita)
  const range=XLSX.utils.decode_range(ws['!ref']);
  for(let c=range.s.c;c<=range.e.c;c++){
    const cell=ws[XLSX.utils.encode_cell({r:0,c})];
    if(cell) cell.s={font:{bold:true}};
  }
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,"Parejas");
  XLSX.writeFile(wb,"parejas_torneo.xlsx");
  showToast("Excel descargado ✓");
}

// Descarga una plantilla de ejemplo vacía para cargar nuevas parejas
function descargarPlantilla(){
  if(typeof XLSX==='undefined'){showToast('Error: librería Excel no cargada');return;}
  const rows=[
    ["Categoría","Grupo","Jugadora 1","Jugadora 2"],
    ["1° Categoría","Grupo 1A","Nombre Apellido","Nombre Apellido"],
    ["1° Categoría","Grupo 1A","Nombre Apellido","Nombre Apellido"],
    ["1° Categoría","Grupo 1B","Nombre Apellido","Nombre Apellido"],
    ["2° Categoría","Grupo 2A","Nombre Apellido","Nombre Apellido"],
    ["3° Categoría","Grupo 3A","Nombre Apellido","Nombre Apellido"],
  ];
  const ws=XLSX.utils.aoa_to_sheet(rows);
  ws['!cols']=[{wch:18},{wch:12},{wch:28},{wch:28}];
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,"Plantilla");
  // Segunda hoja con instrucciones
  const instrRows=[
    ["INSTRUCCIONES"],
    [""],
    ["1. Completá la hoja 'Plantilla' con los datos de las parejas."],
    ["2. Categoría: usá exactamente '1° Categoría', '2° Categoría' o '3° Categoría'."],
    ["3. Grupo: usá el formato 'Grupo 1A', 'Grupo 2B', etc."],
    ["4. Cada fila es una pareja (Jugadora 1 y Jugadora 2)."],
    ["5. No modifiques la fila de encabezados (fila 1)."],
  ];
  const wsI=XLSX.utils.aoa_to_sheet(instrRows);
  wsI['!cols']=[{wch:60}];
  XLSX.utils.book_append_sheet(wb,wsI,"Instrucciones");
  XLSX.writeFile(wb,"plantilla_parejas.xlsx");
  showToast("Plantilla descargada ✓");
}

// ====================================================
// EXPORTAR TORNEO COMPLETO (Excel + PDF)
// ====================================================
function renderSectionExport(){
  return `<div class="ibar">Descargá el torneo completo — parejas, tablas de posiciones, resultados de grupos y cruces de playoff de las 3 categorías — en el formato que prefieras.</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px;">
      <button class="btn btn-blk" onclick="exportarTorneoExcel()">📊 Descargar Excel completo</button>
      <button class="btn btn-pink" onclick="exportarTorneoPDF()">📄 Descargar PDF completo</button>
    </div>
    <div class="legend-bar" style="margin-top:14px;border:1px solid #eee;border-radius:8px;">
      <strong>El Excel</strong> incluye una hoja por categoría con posiciones, más hojas de parejas, resultados y playoff.<br>
      <strong>El PDF</strong> arma un documento imprimible con todas las tablas ordenadas por categoría.
    </div>`;
}

// Recolecta toda la data del torneo en una estructura reutilizable para ambos formatos
function recolectarDatosTorneo(){
  const catLabels={"1era":catLabel("1era"),"2da":catLabel("2da"),"3era":catLabel("3era")};
  const out={parejas:[],posiciones:{},resultados:[],playoff:[]};
  ["1era","2da","3era"].forEach(cat=>{
    out.posiciones[cat]=[];
    grupos[cat].forEach(g=>{
      // Parejas
      g.parejas.forEach(p=>{
        out.parejas.push([catLabels[cat],groupLabel(g.id),p.j1,p.j2]);
      });
      // Posiciones (tabla ordenada)
      const stats=getStats(g.id,cat);
      stats.forEach((p,i)=>{
        out.posiciones[cat].push({
          grupo:groupLabel(g.id),pos:i+1,pareja:`${p.j1} / ${p.j2}`,
          pts:p.pts,pj:p.gw+p.l,g:p.gw,pp:p.l,gg:p.gg,gp:p.gp,dif:(p.bal>0?'+':'')+p.bal
        });
      });
      // Resultados de partidos jugados
      partidos.filter(m=>m.grupoId===g.id&&m.played).forEach(m=>{
        const score=m.sets.map(s=>`${s[0]}-${s[1]}`).join(' ');
        out.resultados.push([catLabels[cat],groupLabel(g.id),pNombre(m.p1),pNombre(m.p2),score,m.simulated?'Simulado':'Jugado']);
      });
    });
    // Playoff
    if(playoffData[cat]){
      playoffData[cat].rounds.forEach(r=>{
        r.matches.forEach((m,mi)=>{
          const n1=m.p1?pNombre(m.p1):'Por definir';
          const n2=m.p2?pNombre(m.p2):'Por definir';
          const score=(m.sets&&m.sets.length)?m.sets.map(s=>`${s[0]}-${s[1]}`).join(' '):'—';
          const ganador=m.winner?pNombre(m.winner):'—';
          out.playoff.push([catLabels[cat],r.name,`Cruce ${mi+1}`,n1,n2,score,ganador]);
        });
      });
    }
  });
  return out;
}

function exportarTorneoExcel(){
  if(typeof XLSX==='undefined'){showToast('Error: librería Excel no cargada');return;}
  const catLabels={"1era":catLabel("1era"),"2da":catLabel("2da"),"3era":catLabel("3era")};
  const d=recolectarDatosTorneo();
  const wb=XLSX.utils.book_new();

  // Hoja 1: Parejas
  const wsP=XLSX.utils.aoa_to_sheet([["Categoría","Grupo","Jugadora 1","Jugadora 2"],...d.parejas]);
  wsP['!cols']=[{wch:16},{wch:12},{wch:26},{wch:26}];
  XLSX.utils.book_append_sheet(wb,wsP,"Parejas");

  // Una hoja de posiciones por categoría
  ["1era","2da","3era"].forEach(cat=>{
    if(!d.posiciones[cat].length)return;
    const rows=[["Grupo","Pos","Pareja","Pts","PJ","G","P","GG","GP","Dif"]];
    let lastGroup=null;
    d.posiciones[cat].forEach(r=>{
      if(lastGroup!==null&&r.grupo!==lastGroup)rows.push([]); // línea en blanco entre grupos
      rows.push([r.grupo,r.pos,r.pareja,r.pts,r.pj,r.g,r.pp,r.gg,r.gp,r.dif]);
      lastGroup=r.grupo;
    });
    const ws=XLSX.utils.aoa_to_sheet(rows);
    ws['!cols']=[{wch:12},{wch:5},{wch:30},{wch:6},{wch:5},{wch:5},{wch:5},{wch:6},{wch:6},{wch:6}];
    let cn=catLabel(cat); if(cn.length>20)cn=cat==='1era'?'1°':cat==='2da'?'2°':'3°';
    const label=`Posic ${cn}`.slice(0,31);
    XLSX.utils.book_append_sheet(wb,ws,label);
  });

  // Hoja: Resultados de grupos
  if(d.resultados.length){
    const wsR=XLSX.utils.aoa_to_sheet([["Categoría","Grupo","Pareja 1","Pareja 2","Resultado","Estado"],...d.resultados]);
    wsR['!cols']=[{wch:16},{wch:10},{wch:26},{wch:26},{wch:14},{wch:10}];
    XLSX.utils.book_append_sheet(wb,wsR,"Resultados grupos");
  }

  // Hoja: Playoff
  if(d.playoff.length){
    const wsPO=XLSX.utils.aoa_to_sheet([["Categoría","Ronda","Cruce","Pareja A","Pareja B","Resultado","Ganador"],...d.playoff]);
    wsPO['!cols']=[{wch:16},{wch:16},{wch:8},{wch:26},{wch:26},{wch:12},{wch:26}];
    XLSX.utils.book_append_sheet(wb,wsPO,"Playoff");
  }

  // Campeonas (si hay)
  const campRows=[["Categoría","Campeonas"]];
  ["1era","2da","3era"].forEach(cat=>{
    const champ=getChampion(cat);
    if(champ)campRows.push([catLabels[cat],pNombre(champ)]);
  });
  if(campRows.length>1){
    const wsC=XLSX.utils.aoa_to_sheet(campRows);
    wsC['!cols']=[{wch:16},{wch:30}];
    XLSX.utils.book_append_sheet(wb,wsC,"Campeonas");
  }

  const fecha=new Date().toISOString().slice(0,10);
  XLSX.writeFile(wb,`torneo_tenis_${fecha}.xlsx`);
  showToast("Excel completo descargado ✓");
}

function exportarTorneoPDF(){
  const jsPDFRef=(window.jspdf&&window.jspdf.jsPDF)||window.jsPDF;
  if(!jsPDFRef){showToast('Error: librería PDF no cargada');return;}
  const catLabels={"1era":catLabel("1era"),"2da":catLabel("2da"),"3era":catLabel("3era")};
  const d=recolectarDatosTorneo();
  const doc=new jsPDFRef({orientation:'portrait',unit:'mm',format:'a4'});
  const pink=[232,49,138];
  let y=16;

  // Título
  doc.setFontSize(18);doc.setTextColor(...pink);
  doc.text("Tenis y Nosotras x club24",14,y);
  y+=6;
  doc.setFontSize(10);doc.setTextColor(90);
  doc.text("Torneo Americano de Damas - Los Cardales Country Club",14,y);
  y+=4;
  doc.setFontSize(8);doc.setTextColor(150);
  doc.text(`Generado el ${new Date().toLocaleDateString('es-AR')}`,14,y);
  y+=6;

  const afterTable=()=>{ y=doc.lastAutoTable.finalY+8; };
  const ensureSpace=(need)=>{ if(y+need>280){doc.addPage();y=16;} };

  // Campeonas
  const camps=[];
  ["1era","2da","3era"].forEach(cat=>{const c=getChampion(cat);if(c)camps.push([catLabels[cat],pNombre(c)]);});
  if(camps.length){
    ensureSpace(20);
    doc.setFontSize(13);doc.setTextColor(...pink);doc.text("Campeonas",14,y);y+=2;
    doc.autoTable({startY:y+2,head:[["Categoría","Campeonas"]],body:camps,
      theme:'grid',headStyles:{fillColor:pink,fontSize:9},bodyStyles:{fontSize:9},margin:{left:14,right:14}});
    afterTable();
  }

  // Por categoría: posiciones
  ["1era","2da","3era"].forEach(cat=>{
    if(!d.posiciones[cat].length)return;
    ensureSpace(30);
    doc.setFontSize(13);doc.setTextColor(...pink);
    doc.text(`${catLabels[cat]} — Posiciones`,14,y);y+=2;
    const body=d.posiciones[cat].map(r=>[r.grupo,r.pos,r.pareja,r.pts,r.pj,r.g,r.pp,r.gg,r.gp,r.dif]);
    doc.autoTable({startY:y+2,
      head:[["Grupo","#","Pareja","Pts","PJ","G","P","GG","GP","Dif"]],body,
      theme:'striped',headStyles:{fillColor:pink,fontSize:8},bodyStyles:{fontSize:7.5},
      columnStyles:{2:{cellWidth:50}},margin:{left:14,right:14}});
    afterTable();
  });

  // Resultados de grupos
  if(d.resultados.length){
    ensureSpace(30);
    doc.setFontSize(13);doc.setTextColor(...pink);doc.text("Resultados de grupos",14,y);y+=2;
    doc.autoTable({startY:y+2,
      head:[["Cat.","Grupo","Pareja 1","Pareja 2","Result.","Estado"]],
      body:d.resultados.map(r=>[r[0].replace(' Categoría',''),r[1],r[2],r[3],r[4],r[5]]),
      theme:'grid',headStyles:{fillColor:pink,fontSize:8},bodyStyles:{fontSize:7},
      columnStyles:{2:{cellWidth:42},3:{cellWidth:42}},margin:{left:14,right:14}});
    afterTable();
  }

  // Playoff
  if(d.playoff.length){
    ensureSpace(30);
    doc.setFontSize(13);doc.setTextColor(...pink);doc.text("Playoff",14,y);y+=2;
    doc.autoTable({startY:y+2,
      head:[["Cat.","Ronda","Cruce","Pareja A","Pareja B","Result.","Ganador"]],
      body:d.playoff.map(r=>[r[0].replace(' Categoría',''),r[1],r[2],r[3],r[4],r[5],r[6]]),
      theme:'grid',headStyles:{fillColor:pink,fontSize:8},bodyStyles:{fontSize:7},
      columnStyles:{3:{cellWidth:32},4:{cellWidth:32},6:{cellWidth:32}},margin:{left:14,right:14}});
    afterTable();
  }

  const fecha=new Date().toISOString().slice(0,10);
  doc.save(`torneo_tenis_${fecha}.pdf`);
  showToast("PDF completo descargado ✓");
}

function showToast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200);}

// ====================================================
// ARRANCAR LA APP
// ====================================================
initApp();
