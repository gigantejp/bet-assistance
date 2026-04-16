const SPORTS=[
  {key:'nba',icon:'🏀',label:'NBA'},{key:'wnba',icon:'🏀',label:'WNBA'},{key:'ncaam',icon:'🏀',label:'NCAA Bball'},
  {key:'nfl',icon:'🏈',label:'NFL'},{key:'ncaaf',icon:'🏈',label:'CFB'},
  {key:'mlb',icon:'⚾',label:'MLB'},{key:'nhl',icon:'🏒',label:'NHL'},
  {key:'epl',icon:'⚽',label:'EPL'},{key:'laliga',icon:'⚽',label:'La Liga'},
  {key:'bundesliga',icon:'⚽',label:'Bundesliga'},{key:'seriea',icon:'⚽',label:'Serie A'},
  {key:'ligue1',icon:'⚽',label:'Ligue 1'},{key:'ucl',icon:'⚽',label:'UCL'},
  {key:'uel',icon:'⚽',label:'UEL'},{key:'mls',icon:'⚽',label:'MLS'},
  {key:'ufc',icon:'🥊',label:'UFC'},{key:'bellator',icon:'🥊',label:'Bellator'},
  {key:'atp',icon:'🎾',label:'ATP'},{key:'wta',icon:'🎾',label:'WTA'},
  {key:'pga',icon:'⛳',label:'PGA'},{key:'lpga',icon:'⛳',label:'LPGA'},{key:'liv',icon:'⛳',label:'LIV Golf'},
  {key:'f1',icon:'🏎️',label:'F1'},{key:'nascar',icon:'🏎️',label:'NASCAR'},{key:'indycar',icon:'🏎️',label:'IndyCar'},
  {key:'ipl',icon:'🏏',label:'IPL'},{key:'icct20',icon:'🏏',label:'ICC T20'},
  {key:'pll',icon:'🥍',label:'PLL'},{key:'nll',icon:'🥍',label:'NLL'},
];

const ESPN_DIRECT={
  nba:'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
  wnba:'https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/scoreboard',
  ncaam:'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard',
  nfl:'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
  ncaaf:'https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?groups=80',
  mlb:'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard',
  nhl:'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard',
  ucl:'https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard',
  epl:'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard',
  laliga:'https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard',
  bundesliga:'https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1/scoreboard',
  seriea:'https://site.api.espn.com/apis/site/v2/sports/soccer/ita.1/scoreboard',
  ligue1:'https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1/scoreboard',
  mls:'https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/scoreboard',
  uel:'https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.europa/scoreboard',
  ufc:'https://site.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard',
  bellator:'https://site.api.espn.com/apis/site/v2/sports/mma/bellator/scoreboard',
  atp:'https://site.api.espn.com/apis/site/v2/sports/tennis/atp/scoreboard',
  wta:'https://site.api.espn.com/apis/site/v2/sports/tennis/wta/scoreboard',
  pga:'https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard',
  lpga:'https://site.api.espn.com/apis/site/v2/sports/golf/lpga/scoreboard',
  liv:'https://site.api.espn.com/apis/site/v2/sports/golf/liv/scoreboard',
  f1:'https://site.api.espn.com/apis/site/v2/sports/racing/f1/scoreboard',
  nascar:'https://site.api.espn.com/apis/site/v2/sports/racing/nascar-premier/scoreboard',
  indycar:'https://site.api.espn.com/apis/site/v2/sports/racing/irl/scoreboard',
  ipl:'https://site.api.espn.com/apis/site/v2/sports/cricket/ipl/scoreboard',
  icct20:'https://site.api.espn.com/apis/site/v2/sports/cricket/icc.t20/scoreboard',
  pll:'https://site.api.espn.com/apis/site/v2/sports/lacrosse/pll/scoreboard',
  nll:'https://site.api.espn.com/apis/site/v2/sports/lacrosse/nll/scoreboard',
};

const SOCCER=new Set(['epl','laliga','bundesliga','seriea','ligue1','ucl','uel','mls']);
function getMarkets(k){
  if(SOCCER.has(k))return{cols:['1X2','Total Goals','Both Score'],soc:true};
  if(k==='mlb')return{cols:['2-Way Markets'],soc:false,mlb:true};
  if(k==='nhl')return{cols:['Puck Line','Total','Moneyline'],soc:false};
  if(k==='ufc'||k==='bellator')return{cols:['Winner','Method','Round'],soc:false};
  if(k==='atp'||k==='wta')return{cols:['Match Winner','Set Hdcp','Total Sets'],soc:false};
  if(['pga','lpga','liv'].includes(k))return{cols:['Win','Top 5','Top 10'],soc:false};
  if(['f1','nascar','indycar'].includes(k))return{cols:['Win','Podium','Top 10'],soc:false};
  if(['ipl','icct20'].includes(k))return{cols:['Match Winner','Top Batsman','Runs O/U'],soc:false};
  return{cols:['Spread','Total','Moneyline'],soc:false};
}

const OB=[
  [+130,-150,1.5,-115,+100,+290],[- 105,-115,3.5,-110,-110,+310],
  [+175,-210,1.5,+120,-140,+265],[+110,-130,4.5,-110,-110,+295],
  [-120,+100,1.5,-130,+110,+280],[+155,-185,6.5,+130,-150,+320],
  [-115,-105,2.5,-110,-110,+285],[+200,-240,1.5,+145,-165,+260],
];
const TOTALS={nba:[224.5,228,218.5,231,235,221,226.5,220],nfl:[44.5,47.5,42,51.5,49,45,48.5,43],
  mlb:[8.5,9,9.5,7.5,10,8,8.5,9],nhl:[5.5,6,6.5,5,5.5,6,5.5,6],
  ncaaf:[47.5,54,44,51.5,57,42,49.5,55],ncaam:[147.5,144,151,139.5,148,152,145,149],
  soccer:[2.5,3,2.5,3.5,2,2.5,3,2.5],default:[2.5,3,3.5,2,2.5,3,2.5,3]};

function getDemoOdds(sport,idx){
  const o=OB[idx%OB.length];
  const tk=SOCCER.has(sport)?'soccer':(TOTALS[sport]?sport:'default');
  return{away_ml:o[0],home_ml:o[1],spread:o[2],aspj:o[3],hspj:o[4],draw:o[5],total:TOTALS[tk][idx%8]};
}
function fo(n){return n>0?`+${n}`:`${n}`}
function pc(n){return n>0?'pos':'neg'}

// STATE
let currentSport='nba',currentProvider='espn',currentEvents=[],selectedEvent=null,currentEventIndex=null,currentView='league',currentLeagueName='',isLoading=false,serverOnline=false;
let latestSportRequestId=0;
const tabCounts={};

// DOM
const tabsEl=document.getElementById('sport-tabs');
const evPanel=document.getElementById('events-panel');
const chatFab=document.getElementById('chat-fab');
const chatModal=document.getElementById('chat-modal');
const cmClose=document.getElementById('cm-close');
const ctxStrip=document.getElementById('ctx-strip');
const cmMsgs=document.getElementById('cm-msgs');
const cmInput=document.getElementById('cm-input');
const cmSend=document.getElementById('cm-send');
const srvDot=document.getElementById('srv-dot');

// SERVER
async function checkServer(){
  try{const r=await fetch('/api/scoreboard/nba',{signal:AbortSignal.timeout(2000)});return r.ok||r.status<500;}catch{return false;}
}
async function safeJson(r){
  const ct=r.headers.get('content-type')||'';
  if(!ct.includes('application/json'))throw new Error('Server offline. Run: node server.js');
  return r.json();
}

// TABS
function renderTabs(){
  tabsEl.innerHTML=SPORTS.map(s=>{
    const c=tabCounts[s.key];
    const cnt=c!==undefined?c:'…';
    return`<button class="sport-tab${s.key===currentSport?' active':''}" data-sport="${s.key}">${s.icon} ${s.label} <span class="tab-cnt">${cnt}</span></button>`;
  }).join('');
  tabsEl.querySelectorAll('.sport-tab').forEach(b=>b.addEventListener('click',()=>{
    if(b.dataset.sport===currentSport)return;
    currentSport=b.dataset.sport;selectedEvent=null;updateCtx();
    renderTabs();b.scrollIntoView({inline:'nearest',block:'nearest'});loadSport(currentSport);
  }));
}

async function fetchCounts(){
  await Promise.allSettled(SPORTS.map(async s=>{
    try{
      let d;
      try{const r=await fetch(`/api/scoreboard/${s.key}?provider=${currentProvider}`,{signal:AbortSignal.timeout(3000)});d=await safeJson(r);}
      catch{const r=await fetch(ESPN_DIRECT[s.key],{cache:'no-store',signal:AbortSignal.timeout(3000)});d=await r.json();}
      tabCounts[s.key]=(d.events||[]).length;
    }catch{tabCounts[s.key]=0;}
    renderTabs();
  }));
}

// EVENTS
async function loadSport(sport){
  const requestId=++latestSportRequestId;
  currentEvents=[];
  currentLeagueName=(SPORTS.find(s=>s.key===sport)||{}).label||sport.toUpperCase();
  selectedEvent=null;
  currentEventIndex=null;
  updateCtx();
  evPanel.innerHTML='<div class="state-msg loading">Loading events…</div>';
  try{
    let d;
    try{const r=await fetch(`/api/scoreboard/${sport}?provider=${currentProvider}`,{signal:AbortSignal.timeout(4000)});d=await safeJson(r);}
    catch{const r=await fetch(ESPN_DIRECT[sport],{cache:'no-store'});d=await r.json();}
    if(requestId!==latestSportRequestId||sport!==currentSport)return;
    currentEvents=d.events||[];
    currentLeagueName=d.leagues?.[0]?.name||currentLeagueName;
    renderEvents(currentEvents,sport,currentLeagueName);
  }catch(e){evPanel.innerHTML=`<div class="state-msg">Could not load events: ${esc(e.message)}</div>`;}
}

function renderEvents(events,sport,leagueName){
  if(!events.length){evPanel.innerHTML='<div class="state-msg">No events available right now.</div>';return;}
  currentView='league';
  const sm=SPORTS.find(s=>s.key===sport)||{icon:'🏟️',label:sport.toUpperCase()};
  const{cols,soc,mlb}=getMarkets(sport);
  if(mlb){renderBaseballLeague(events,leagueName,sm);return;}
  const gc=soc?'sg':'';
  let html=`<div class="league-label">${sm.icon} ${esc(leagueName||sm.label)}</div>`;
  html+=`<div class="tbl-header ${gc}"><div class="th">Event</div><div class="th">${esc(cols[0])}</div><div class="th">${esc(cols[1])}</div><div class="th">${esc(cols[2])}</div></div>`;
  events.forEach((ev,i)=>{html+=makeRow(ev,i,sport,soc,gc);});
  evPanel.innerHTML=html;
  evPanel.querySelectorAll('.ev-row').forEach(row=>{
    row.addEventListener('click',e=>{if(e.target.classList.contains('odd-btn'))return;selectEv(+row.dataset.idx);});
  });
  evPanel.querySelectorAll('.odd-btn').forEach(btn=>{
    btn.addEventListener('click',e=>{
      e.stopPropagation();
      const row=btn.closest('.ev-row');if(row)selectEv(+row.dataset.idx);
      evPanel.querySelectorAll('.odd-btn.sel').forEach(b=>b.classList.remove('sel'));
      btn.classList.add('sel');
    });
  });
}

function renderBaseballLeague(events,leagueName,sm){
  let html=`<div class="league-label">${sm.icon} ${esc(leagueName||sm.label)} · ALL 2-WAY MARKETS</div>`;
  html+=`<div class="tbl-header mlb-league"><div class="th">Event</div><div class="th">Markets</div></div>`;
  events.forEach((ev,i)=>{html+=makeBaseballLeagueRow(ev,i);});
  evPanel.innerHTML=html;
  evPanel.querySelectorAll('.ev-row').forEach(row=>{
    row.addEventListener('click',()=>openEventPage(+row.dataset.idx));
  });
}

function makeBaseballLeagueRow(ev,idx){
  const comp=ev.competitions?.[0];const cs=comp?.competitors||[];
  const aw=cs.find(c=>c.homeAway==='away')||cs[0]||{};
  const hm=cs.find(c=>c.homeAway==='home')||cs[1]||{};
  const aN=aw.team?.displayName||'Away',hN=hm.team?.displayName||'Home';
  const aAb=aw.team?.abbreviation||(aN.slice(0,3).toUpperCase());
  const hAb=hm.team?.abbreviation||(hN.slice(0,3).toUpperCase());
  const state=comp?.status?.type?.state||'pre';
  const detail=comp?.status?.type?.shortDetail||comp?.status?.type?.description||'Scheduled';
  const isLive=state==='in';
  const aS=aw.score??null,hS=hm.score??null;
  const timeHtml=isLive
    ?`<div class="ev-time live"><span class="ldot"></span>LIVE — ${esc(detail)}</div>`
    :`<div class="ev-time">${esc(fmtDate(ev.date))}</div>`;
  const asc=aS!==null?`<span class="sc">${aS}</span>`:'';
  const hsc=hS!==null?`<span class="sc">${hS}</span>`:'';
  const info=`<div class="ev-cell">${timeHtml}<div class="ev-team away"><span class="t-abbr">${esc(aAb)}</span>${esc(aN)}${asc}</div><div class="ev-team home"><span class="t-abbr">${esc(hAb)}</span>${esc(hN)}${hsc}</div></div>`;
  const mks=getBaseballMarkets(idx,aAb,hAb,true);
  const mkHtml=mks.map(m=>`<div class="mlb-market-mini"><div class="mlb-market-name">${esc(m.name)}</div><div class="mlb-market-opts">${m.options.map(o=>`<button class="odd-btn"><span class="odd-line">${esc(o.label)}</span><span class="odd-price ${pc(o.price)}">${fo(o.price)}</span></button>`).join('')}</div></div>`).join('');
  return`<div class="ev-row mlb-league" data-idx="${idx}">${info}<div class="mkt-cell mlb-market-cell">${mkHtml}</div></div>`;
}

function makeRow(ev,idx,sport,soc,gc){
  const comp=ev.competitions?.[0];const cs=comp?.competitors||[];
  const aw=cs.find(c=>c.homeAway==='away')||cs[0]||{};
  const hm=cs.find(c=>c.homeAway==='home')||cs[1]||{};
  const aN=aw.team?.displayName||'Away',hN=hm.team?.displayName||'Home';
  const aAb=aw.team?.abbreviation||(aN.slice(0,3).toUpperCase());
  const hAb=hm.team?.abbreviation||(hN.slice(0,3).toUpperCase());
  const state=comp?.status?.type?.state||'pre';
  const detail=comp?.status?.type?.shortDetail||comp?.status?.type?.description||'Scheduled';
  const isLive=state==='in';
  const aS=aw.score??null,hS=hm.score??null;
  const realOdds=comp?.realOdds;
  const hasReal=realOdds&&(realOdds.away_ml!=null||realOdds.home_ml!=null);
  const demoO=getDemoOdds(sport,idx);
  const o=hasReal?{
    away_ml:realOdds.away_ml??demoO.away_ml,
    home_ml:realOdds.home_ml??demoO.home_ml,
    spread:Math.abs(realOdds.spread??demoO.spread),
    aspj:realOdds.away_spread_juice??demoO.aspj,
    hspj:realOdds.home_spread_juice??demoO.hspj,
    draw:realOdds.draw??demoO.draw,
    total:realOdds.total??demoO.total,
  }:demoO;
  const selCls=selectedEvent===ev?' sel':'';
  const timeHtml=isLive
    ?`<div class="ev-time live"><span class="ldot"></span>LIVE — ${esc(detail)}</div>`
    :`<div class="ev-time">${esc(fmtDate(ev.date))}</div>`;
  const asc=aS!==null?`<span class="sc">${aS}</span>`:'';
  const hsc=hS!==null?`<span class="sc">${hS}</span>`:'';
  const info=`<div class="ev-cell">${timeHtml}<div class="ev-team away"><span class="t-abbr">${esc(aAb)}</span>${esc(aN)}${asc}</div><div class="ev-team home"><span class="t-abbr">${esc(hAb)}</span>${esc(hN)}${hsc}</div></div>`;
  return`<div class="ev-row ${gc}${selCls}" data-idx="${idx}">${info}${mkt(sport,soc,1,o,aAb,hAb)}${mkt(sport,soc,2,o,aAb,hAb)}${mkt(sport,soc,3,o,aAb,hAb)}</div>`;
}

function mkt(sport,soc,col,o,aAb,hAb){
  if(soc){
    if(col===1)return`<div class="mkt-cell tw"><button class="odd-btn"><span class="olbl">1</span><span class="odd-price ${pc(o.away_ml)}">${fo(o.away_ml)}</span></button><button class="odd-btn"><span class="olbl">X</span><span class="odd-price pos">${fo(o.draw)}</span></button><button class="odd-btn"><span class="olbl">2</span><span class="odd-price ${pc(o.home_ml)}">${fo(o.home_ml)}</span></button></div>`;
    if(col===2)return`<div class="mkt-cell"><button class="odd-btn"><span class="odd-line">O ${o.total}</span><span class="odd-price neg">-110</span></button><button class="odd-btn"><span class="odd-line">U ${o.total}</span><span class="odd-price neg">-110</span></button></div>`;
    return`<div class="mkt-cell"><button class="odd-btn"><span class="odd-line">Yes</span><span class="odd-price neg">-115</span></button><button class="odd-btn"><span class="odd-line">No</span><span class="odd-price neg">-105</span></button></div>`;
  }
  const fav=o.away_ml<0;
  if(col===1){
    const aL=fav?`-${o.spread}`:`+${o.spread}`,hL=fav?`+${o.spread}`:`-${o.spread}`;
    return`<div class="mkt-cell"><button class="odd-btn"><span class="odd-line">${aL}</span><span class="odd-price ${pc(o.aspj)}">${fo(o.aspj)}</span></button><button class="odd-btn"><span class="odd-line">${hL}</span><span class="odd-price ${pc(o.hspj)}">${fo(o.hspj)}</span></button></div>`;
  }
  if(col===2)return`<div class="mkt-cell"><button class="odd-btn"><span class="odd-line">O ${o.total}</span><span class="odd-price neg">-110</span></button><button class="odd-btn"><span class="odd-line">U ${o.total}</span><span class="odd-price neg">-110</span></button></div>`;
  return`<div class="mkt-cell"><button class="odd-btn"><span class="odd-price ${pc(o.away_ml)}">${fo(o.away_ml)}</span></button><button class="odd-btn"><span class="odd-price ${pc(o.home_ml)}">${fo(o.home_ml)}</span></button></div>`;
}

function selectEv(idx){
  selectedEvent=currentEvents[idx]||null;
  currentEventIndex=idx;
  evPanel.querySelectorAll('.ev-row').forEach((r,i)=>r.classList.toggle('sel',i===idx));
  updateCtx();
}

function openEventPage(idx){
  selectEv(idx);
  const ev=currentEvents[idx];
  if(!ev)return;
  currentView='event';
  renderEventPage(ev,idx,currentSport);
}

function renderEventPage(ev,idx,sport){
  const comp=ev.competitions?.[0];const cs=comp?.competitors||[];
  const aw=cs.find(c=>c.homeAway==='away')||cs[0]||{};
  const hm=cs.find(c=>c.homeAway==='home')||cs[1]||{};
  const aN=aw.team?.displayName||'Away',hN=hm.team?.displayName||'Home';
  const aAb=aw.team?.abbreviation||(aN.slice(0,3).toUpperCase());
  const hAb=hm.team?.abbreviation||(hN.slice(0,3).toUpperCase());
  const status=comp?.status?.type?.shortDetail||comp?.status?.type?.description||'Scheduled';
  const markets=getBaseballMarkets(idx,aAb,hAb,false);
  const cards=markets.map(m=>`<article class="event-market-card"><h4>${esc(m.name)}</h4><div class="event-market-grid">${m.options.map(o=>`<button class="odd-btn"><span class="odd-line">${esc(o.label)}</span><span class="odd-price ${pc(o.price)}">${fo(o.price)}</span></button>`).join('')}</div></article>`).join('');
  evPanel.innerHTML=`<div class="event-page">
    <button class="h-btn event-back" id="event-back">← Back to ${esc((SPORTS.find(s=>s.key===sport)?.label)||sport.toUpperCase())}</button>
    <div class="event-hero">
      <div class="event-title">${esc(aN)} @ ${esc(hN)}</div>
      <div class="event-sub">${esc(fmtDate(ev.date))} · ${esc(status)}</div>
    </div>
    <div class="event-markets-wrap">
      <div class="league-label">All markets for this event</div>
      <div class="event-market-list">${cards}</div>
    </div>
  </div>`;
  document.getElementById('event-back')?.addEventListener('click',()=>renderEvents(currentEvents,sport,currentLeagueName));
}

function getBaseballMarkets(idx,aAb,hAb,leagueOnly=false){
  const o=getDemoOdds('mlb',idx);
  const fav=o.away_ml<0;
  const awayRl=fav?`-${o.spread}`:`+${o.spread}`;
  const homeRl=fav?`+${o.spread}`:`-${o.spread}`;
  const base=[
    {name:'Run Line',options:[{label:`${aAb} ${awayRl}`,price:o.aspj},{label:`${hAb} ${homeRl}`,price:o.hspj}]},
    {name:'Total Runs',options:[{label:`Over ${o.total}`,price:-110},{label:`Under ${o.total}`,price:-110}]},
    {name:'Moneyline',options:[{label:aAb,price:o.away_ml},{label:hAb,price:o.home_ml}]},
    {name:'First 5 Innings ML',options:[{label:aAb,price:o.away_ml+25},{label:hAb,price:o.home_ml+20}]},
    {name:'First 5 Innings Total',options:[{label:`Over ${(o.total/2).toFixed(1)}`,price:-112},{label:`Under ${(o.total/2).toFixed(1)}`,price:-108}]},
    {name:`${aAb} Team Total`,options:[{label:`Over ${(o.total/2+0.5).toFixed(1)}`,price:-118},{label:`Under ${(o.total/2+0.5).toFixed(1)}`,price:-102}]},
    {name:`${hAb} Team Total`,options:[{label:`Over ${(o.total/2-0.5).toFixed(1)}`,price:-104},{label:`Under ${(o.total/2-0.5).toFixed(1)}`,price:-116}]},
  ];
  if(leagueOnly)return base;
  return[
    ...base,
    {name:'Alternative Run Line (+2.5)',options:[{label:`${aAb} +2.5`,price:-230},{label:`${hAb} -2.5`,price:+180}]},
    {name:'Alternative Total Runs',options:[{label:`Over ${o.total+1}`,price:+108},{label:`Under ${o.total+1}`,price:-128}]},
    {name:'Will game go extra innings?',options:[{label:'Yes',price:+700},{label:'No',price:-1200}]},
    {name:'Both teams to score 3+ runs',options:[{label:'Yes',price:-120},{label:'No',price:+100}]},
  ];
}

function updateCtx(){
  if(!selectedEvent){ctxStrip.innerHTML='Select a game from the board to give the AI context.';return;}
  const comp=selectedEvent.competitions?.[0];const cs=comp?.competitors||[];
  const aw=cs.find(c=>c.homeAway==='away')||cs[0]||{};
  const hm=cs.find(c=>c.homeAway==='home')||cs[1]||{};
  ctxStrip.innerHTML=`<strong>Selected:</strong> ${esc(aw.team?.displayName||'Away')} vs ${esc(hm.team?.displayName||'Home')} <em>${esc(comp?.status?.type?.description||'')}</em>`;
}

function fmtDate(iso){
  if(!iso)return'TBD';
  return new Date(iso).toLocaleString('en-US',{weekday:'short',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',timeZone:'America/New_York'});
}

// CHAT
chatFab.addEventListener('click',()=>{chatModal.classList.toggle('open');if(chatModal.classList.contains('open'))cmInput.focus();});
cmClose.addEventListener('click',()=>chatModal.classList.remove('open'));
document.addEventListener('keydown',e=>{if(e.key==='Escape')chatModal.classList.remove('open');});
cmSend.addEventListener('click',sendChat);
cmInput.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendChat();}});

function addMsg(role,html,meta=''){
  const d=document.createElement('div');d.className=`msg ${role}`;
  d.innerHTML=`<div class="msg-bubble">${html}</div>${meta?`<div class="msg-meta">${meta}</div>`:''}`;
  cmMsgs.appendChild(d);cmMsgs.scrollTop=cmMsgs.scrollHeight;return d;
}

async function sendChat(){
  const q=cmInput.value.trim();if(!q||isLoading)return;

  // Re-verify server before sending (state may have changed)
  if(!serverOnline) serverOnline=await checkServer();

  if(!serverOnline){
    addMsg('assistant',
      `<strong style="color:var(--warn)">⚠ AI server required</strong><br><br>
      The AI assistant needs the Node.js backend to call Claude.<br><br>
      <strong>Run locally:</strong><br>
      <code style="background:#060f1a;padding:2px 6px;border-radius:4px;font-size:.8rem">npm install && node server.js</code><br><br>
      Then open <code style="background:#060f1a;padding:2px 6px;border-radius:4px;font-size:.8rem">http://localhost:3000</code><br><br>
      Or deploy to Render with your <code style="background:#060f1a;padding:2px 6px;border-radius:4px;font-size:.8rem">ANTHROPIC_API_KEY</code>.`,
      'System'
    );
    return;
  }
  isLoading=true;cmSend.disabled=true;cmInput.value='';
  addMsg('user',esc(q),'You');

  // Elapsed timer shown while waiting
  const t0=Date.now();
  const loadEl=addMsg('assistant','<span class="spinner">Thinking… <span class="elapsed-s">0s</span></span>');
  const elapsedEl=loadEl.querySelector('.elapsed-s');
  const timer=setInterval(()=>{if(elapsedEl)elapsedEl.textContent=`${Math.round((Date.now()-t0)/1000)}s`;},500);

  // Trim events to only the fields formatContext needs — avoids 413 from large ESPN payloads
  const useSelectedEventOnly = currentView==='event' || /\bthis game\b|\bthis match\b|\bthis event\b|\bthis one\b|\bhere\b|\bvalue here\b/i.test(q);
  const sourceEvents = useSelectedEventOnly && selectedEvent ? [selectedEvent] : currentEvents;
  const events=sourceEvents.map(ev=>{
    const comp=ev.competitions?.[0];
    return{
      id:ev.id,
      uid:ev.uid,
      date:ev.date,
      competitions:[{
        competitors:(comp?.competitors||[]).map(c=>({
          homeAway:c.homeAway,score:c.score,
          team:{displayName:c.team?.displayName}
        })),
        status:{type:{
          state:comp?.status?.type?.state,
          completed:comp?.status?.type?.completed,
          description:comp?.status?.type?.description,
          shortDetail:comp?.status?.type?.shortDetail
        }},
        realOdds:comp?.realOdds||null
      }]
    };
  });
  const model=document.getElementById('model-select')?.value||'claude-opus-4-6';
  const intentModel=document.getElementById('gate-model-select')?.value||'claude-haiku-4-5-20251001';
  try{
    const r=await fetch('/api/assistant/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      userQuery:q,
      events,
      model,
      intentModel,
      activeSport:currentSport,
      activeLeague:currentLeagueName,
      selectedEventId:selectedEvent?.id||selectedEvent?.uid||null,
      currentView,
      provider:currentProvider,
    })});
    if(!r.ok && !r.headers.get('content-type')?.includes('text/event-stream')){
      throw new Error(`Server error (HTTP ${r.status}). Please try again.`);
    }

    // Read SSE stream — server sends :keepalive comments then a final "data:" line
    const reader=r.body.getReader();
    const dec=new TextDecoder();
    let buf='',finalData=null;
    while(true){
      const{done,value}=await reader.read();
      if(done)break;
      buf+=dec.decode(value,{stream:true});
      const lines=buf.split('\n');
      buf=lines.pop(); // keep incomplete trailing line
      for(const line of lines){
        if(line.startsWith('data: ')){
          try{finalData=JSON.parse(line.slice(6));}catch{}
        }
      }
    }
    // Flush any remaining buffered data
    if(buf.startsWith('data: ')){try{finalData=JSON.parse(buf.slice(6));}catch{}}

    if(!finalData) throw new Error('No response received. Please try again.');
    const data=finalData;
    if(data.error) throw new Error(`Server error: ${data.error}`);

    loadEl.querySelector('.msg-bubble').innerHTML=renderResult(data.result);
    const m=document.createElement('div');m.className='msg-meta';m.textContent=`AI · ${data.log?.latency_ms||'—'}ms · ${formatModelHint(data.log?.model||model)}`;
    loadEl.appendChild(m);
    // Feedback buttons — each response gets a 👍/👎 row
    if(!data.log?.short_circuit&&!data.log?.blocked){
      const fbEl=document.createElement('div');fbEl.className='fb-row';
      fbEl.innerHTML=`<span class="fb-lbl">¿Fue útil esta respuesta?</span><button class="fb-btn" data-r="up">👍</button><button class="fb-btn" data-r="down">👎</button>`;
      fbEl.querySelectorAll('.fb-btn').forEach(btn=>btn.addEventListener('click',async()=>{
        fbEl.querySelectorAll('.fb-btn').forEach(b=>b.classList.remove('selected-up','selected-down'));
        btn.classList.add(btn.dataset.r==='up'?'selected-up':'selected-down');
        fbEl.querySelector('.fb-lbl').innerHTML='<span class="fb-sent">Gracias ✓</span>';
        await fetch('/api/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
          rating:btn.dataset.r,
          query:q,
          intent:data.log?.intent,
          decision:data.result?.decision,
          summary:data.result?.summary,
          model:data.log?.model,
          intent_model:data.log?.intent_model,
          prompt_version:data.log?.prompt_version,
          latency_ms:data.log?.latency_ms,
        })});
      }));
      loadEl.appendChild(fbEl);
    }
    cmMsgs.scrollTop=cmMsgs.scrollHeight;
    if(data.debug?.analysis?.sections){
      const secs={...data.debug.analysis.sections,rawResponse:data.debug.analysis.rawResponse,parseError:data.debug.analysis.parseError};
      updatePrompt(secs,data.debug.analysis.version);
    }else if(data.debug?.sections)updatePrompt(data.debug.sections,data.debug.version);
    if(data.debug?.gate)updateGate(data.debug.gate);
    if(data.log)updateMetrics(data.log);
    // Show which model actually responded
    const hint=document.getElementById('model-hint');
    if(hint)hint.textContent=data.log?.model?`✓ ${formatModelHint(data.log.model)}`:'';
  }catch(e){
    // Re-check real server status so the badge stays accurate
    serverOnline=await checkServer();
    const srvLbl=document.getElementById('srv-lbl');
    if(srvLbl)srvLbl.textContent=serverOnline?'AI online':'AI offline';
    srvDot.className=serverOnline?'on':'off';
    loadEl.querySelector('.msg-bubble').innerHTML=`<span class="no-data">⚠ ${esc(e.message)}</span>`;
  }
  finally{clearInterval(timer);isLoading=false;cmSend.disabled=false;cmInput.focus();}
}

function renderResult(r){
  if(!r)return'<span class="no-data">No result</span>';
  let h=`<div class="bet-sum">${esc(r.summary||'No summary')}</div>`;
  h+=`<div class="bt-meta">${r.confidence?`<span class="cbadge ${esc((r.confidence||'low').toLowerCase())}">${esc(r.confidence)}</span>`:''}${r.decision?`<span class="impl">decision: ${esc(r.decision)}</span>`:''}</div>`;
  if(r.insight||r.next_action){
    h+=`<div class="bet-cards">
      ${r.insight?`<div class="bet-card"><div class="bt-mkt">Insight</div><div class="bt-reason">${esc(r.insight)}</div></div>`:''}
      ${r.next_action?`<div class="bet-card"><div class="bt-mkt">Next Action</div><div class="bt-reason">${esc(r.next_action)}</div></div>`:''}
    </div>`;
  }
  if(r.bets?.length){
    h+='<div class="bet-cards">';
    r.bets.forEach(b=>{
      const odds=b.odds?`<span class="impl">${esc(b.odds)}</span>`:'';
      h+=`<div class="bet-card"><div class="bt-mkt">${esc(b.market)}</div><div class="bt-sel">▶ ${esc(b.selection)}</div><div class="bt-meta">${odds}</div><div class="bt-reason">${esc(b.reason)}</div></div>`;
    });
    h+='</div>';
  }
  return h;
}

// DEBUG PANEL
const DBG_TABS=['prompt','full','gate','metrics'];
document.querySelectorAll('.dbg-tab').forEach(t=>t.addEventListener('click',()=>{
  document.querySelectorAll('.dbg-tab').forEach(x=>x.classList.remove('active'));t.classList.add('active');
  const tab=t.dataset.tab;
  DBG_TABS.forEach(id=>{const el=document.getElementById(`tab-${id}`);if(el)el.style.display=tab===id?'':'none';});
  if(tab==='metrics')loadFeedbackStat();
}));

async function loadFeedbackStat(){
  try{
    const r=await fetch('/api/feedback');
    if(!r.ok)return;
    const d=await r.json();
    const el=document.getElementById('fb-stat');
    if(!el||!d.summary)return;
    const s=d.summary;
    const pct=s.total?Math.round(s.up/s.total*100):0;
    el.textContent=`feedback: ${s.total} total · ${s.up}👍 ${s.down}👎 · ${pct}% positive`;
  }catch{}
}

function updatePrompt(secs,ver){
  // Sections panel
  document.getElementById('prompt-ph').style.display='none';
  document.getElementById('prompt-secs').style.display='';
  document.getElementById('vtag').textContent=ver||'v2';
  setCode('s-sys',secs.systemPrompt);setCode('s-int',secs.intentDecision||secs.detectedIntent);
  setCode('s-ctx',secs.contextData);
  setCode('s-usr',secs.userInput);setCode('s-out',secs.outputFormat);
  // Full prompt panel — assemble exactly what the LLM received
  const fullSysTxt=secs.fullPromptSystem||secs.systemPrompt||'';
  const fullUsrTxt=secs.fullPromptUser||[secs.contextData,secs.userInput&&`\nUSER QUERY\n${secs.userInput}`,secs.outputFormat].filter(Boolean).join('\n\n');
  document.getElementById('full-ph').style.display='none';
  document.getElementById('full-secs').style.display='';
  setCode('s-full-sys',fullSysTxt);
  setCode('s-full-usr',fullUsrTxt);
  setCode('s-full-out',secs.rawResponse||'');
  const errTag=document.getElementById('parse-err-tag');
  if(errTag){
    if(secs.parseError){errTag.textContent='parse error: '+secs.parseError;errTag.style.display='';}
    else{errTag.style.display='none';}
  }
}
function updateGate(g){
  if(!g)return;
  document.getElementById('gate-ph').style.display='none';
  document.getElementById('gate-secs').style.display='';
  const tag=document.getElementById('gate-model-tag');
  if(tag)tag.textContent=formatModelHint(g.model);
  const r=g.rawResponse||'';
  let parsed=null;
  try{const m=r.match(/\{[\s\S]*\}/);parsed=JSON.parse(m?m[0]:r);}catch{}
  const intent=parsed?.intent||'—';
  const allowed=parsed?.allowed!==false;
  const blockReason=parsed?.block_reason||'';
  const ctxNeeded=parsed?.context_needed||'—';
  const resType=parsed?.response_type||'—';
  const lat=g.latency_ms||'—';
  const gdr=document.getElementById('gate-decision-row');
  if(gdr)gdr.innerHTML=[
    ['Intent',intent],['Allowed',allowed?(g.fallback?'fallback ✓':'✓'):'✗ blocked'],['Latency',lat+'ms'],
    ['Context',ctxNeeded],['Response',resType],
  ].map(([l,v])=>`<div class="gd-item"><div class="gd-lbl">${l}</div><div class="gd-val ${l==='Allowed'?(allowed?'ok':'blocked'):''}">${esc(String(v))}</div></div>`
  ).join('')+(blockReason?`<div class="gd-item" style="width:100%"><div class="gd-lbl">Block Reason</div><div class="gd-val blocked">${esc(blockReason)}</div></div>`:'');
  setCode('s-gate-sys',g.systemPrompt);
  setCode('s-gate-usr',g.userMessage);
  setCode('s-gate-out',r);
}
function setCode(id,txt){
  const el=document.getElementById(id);if(!el)return;
  if(txt){el.textContent=txt;el.classList.remove('empty');}else{el.textContent='(empty)';el.classList.add('empty');}
}
function updateMetrics(log){
  document.getElementById('metrics-ph').style.display='none';
  document.getElementById('metrics-c').style.display='';
  document.getElementById('m-in').textContent=log.prompt_size_tokens||'—';
  document.getElementById('m-out').textContent=log.response_size_tokens||'—';
  document.getElementById('m-cache').textContent=log.cache_read_tokens||'0';
  document.getElementById('m-lat').textContent=log.latency_ms||'—';
  // Cost section
  document.getElementById('m-cost-total').textContent=formatCost(log.total_cost_usd);
  document.getElementById('m-cost-gate').textContent=formatCost(log.gate_cost_usd);
  document.getElementById('m-cost-analysis').textContent=formatCost(log.cost_usd);
  document.getElementById('log-box').innerHTML=Object.entries(log).map(([k,v])=>`<span class="lk">${k}</span>: <span class="lv">${JSON.stringify(v)}</span>`).join('\n');
}

function formatCost(usd){
  if(usd===undefined||usd===null||usd==='')return'—';
  if(usd===0)return'$0.000';
  if(usd<0.0001)return'<$0.0001';
  if(usd<0.001)return'$'+usd.toFixed(5);
  if(usd<0.01)return'$'+usd.toFixed(4);
  if(usd<0.10)return'$'+usd.toFixed(3);
  return'$'+usd.toFixed(2);
}

function formatModelHint(model){
  const m=String(model||'');
  if(m.startsWith('claude-')) return m.replace('claude-','');
  if(m.startsWith('gpt-')) return m.replace(/^gpt-/,'GPT-').replace(/-mini$/,' Mini');
  return m;
}

function esc(s){return String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

// INIT
async function init(){
  serverOnline=await checkServer();
  srvDot.className=serverOnline?'on':'off';
  const srvLbl=document.getElementById('srv-lbl');
  if(srvLbl)srvLbl.textContent=serverOnline?'AI online':'AI offline';

  // Show offline notice in chat context strip
  if(!serverOnline){
    ctxStrip.innerHTML=
      '<span style="color:var(--warn)">⚠ AI offline — ESPN events load fine. Run <code>node server.js</code> for AI chat.</span>';
  }

  // Provider toggle
  document.querySelectorAll('.prov-btn').forEach(btn=>btn.addEventListener('click',()=>{
    if(btn.dataset.prov===currentProvider)return;
    currentProvider=btn.dataset.prov;
    document.querySelectorAll('.prov-btn').forEach(b=>b.classList.toggle('active',b.dataset.prov===currentProvider));
    selectedEvent=null;updateCtx();
    loadSport(currentSport);
    fetchCounts();
  }));

  renderTabs();
  await loadSport(currentSport);
  fetchCounts();
}
init();
