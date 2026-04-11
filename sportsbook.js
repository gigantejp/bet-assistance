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
  if(k==='mlb')return{cols:['Run Line','Total','Moneyline'],soc:false};
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
let currentSport='nba',currentEvents=[],selectedEvent=null,isLoading=false,serverOnline=false;
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
      try{const r=await fetch(`/api/scoreboard/${s.key}`,{signal:AbortSignal.timeout(3000)});d=await safeJson(r);}
      catch{const r=await fetch(ESPN_DIRECT[s.key],{cache:'no-store',signal:AbortSignal.timeout(3000)});d=await r.json();}
      tabCounts[s.key]=(d.events||[]).length;
    }catch{tabCounts[s.key]=0;}
    renderTabs();
  }));
}

// EVENTS
async function loadSport(sport){
  evPanel.innerHTML='<div class="state-msg loading">Loading events…</div>';
  try{
    let d;
    try{const r=await fetch(`/api/scoreboard/${sport}`,{signal:AbortSignal.timeout(4000)});d=await safeJson(r);}
    catch{const r=await fetch(ESPN_DIRECT[sport],{cache:'no-store'});d=await r.json();}
    currentEvents=d.events||[];
    renderEvents(currentEvents,sport,d.leagues?.[0]?.name||'');
  }catch(e){evPanel.innerHTML=`<div class="state-msg">Could not load events: ${esc(e.message)}</div>`;}
}

function renderEvents(events,sport,leagueName){
  if(!events.length){evPanel.innerHTML='<div class="state-msg">No events available right now.</div>';return;}
  const sm=SPORTS.find(s=>s.key===sport)||{icon:'🏟️',label:sport.toUpperCase()};
  const{cols,soc}=getMarkets(sport);
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
  const o=getDemoOdds(sport,idx);
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
  evPanel.querySelectorAll('.ev-row').forEach((r,i)=>r.classList.toggle('sel',i===idx));
  updateCtx();
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
  const events=currentEvents.map(ev=>{
    const comp=ev.competitions?.[0];
    return{
      date:ev.date,
      competitions:[{
        competitors:(comp?.competitors||[]).map(c=>({
          homeAway:c.homeAway,score:c.score,
          team:{displayName:c.team?.displayName}
        })),
        status:{type:{
          description:comp?.status?.type?.description,
          shortDetail:comp?.status?.type?.shortDetail
        }}
      }]
    };
  });
  const model=document.getElementById('model-select')?.value||'claude-opus-4-6';
  try{
    const r=await fetch('/api/assistant/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({userQuery:q,events,model})});
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
    const m=document.createElement('div');m.className='msg-meta';m.textContent=`AI · ${data.log?.latency_ms||'—'}ms · ${(data.log?.model||model).replace('claude-','')}`;
    loadEl.appendChild(m);cmMsgs.scrollTop=cmMsgs.scrollHeight;
    if(data.debug?.sections)updatePrompt(data.debug.sections,data.debug.version);
    if(data.log)updateMetrics(data.log);
    // Show which model actually responded
    const hint=document.getElementById('model-hint');
    if(hint)hint.textContent=data.log?.model?`✓ ${data.log.model.replace('claude-','').replace('-2025','')}`:'';
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
  if(r.decision){
    return `<div class="bet-sum"><strong>Decision:</strong> ${esc(r.decision.toUpperCase())}</div>
      <div class="bet-cards">
        <div class="bet-card">
          <div class="bt-mkt">${esc(r.market||'Best Value')}</div>
          <div class="bt-sel">▶ ${esc(r.best_bet||'N/A')} ${r.odds?`(${esc(r.odds)})`:''}</div>
          <div class="bt-meta">${r.confidence?`<span class="cbadge ${esc((r.confidence||'low').toLowerCase())}">${esc(r.confidence)}</span>`:''}</div>
          <div class="bt-reason">${esc(r.reason||'')}</div>
        </div>
      </div>`;
  }
  if(r.best_match){
    return `<div class="bet-sum"><strong>Best match:</strong> ${esc(r.best_match)}</div>
      <div class="bet-cards">
        <div class="bet-card">
          <div class="bt-mkt">Recommended Bet</div>
          <div class="bt-sel">▶ ${esc(r.recommended_bet||'N/A')}</div>
          <div class="bt-meta">${r.confidence?`<span class="cbadge ${esc((r.confidence||'low').toLowerCase())}">${esc(r.confidence)}</span>`:''}</div>
          <div class="bt-reason">${esc(r.reason||'')}</div>
        </div>
      </div>`;
  }
  if(r.explanation){
    return `<div class="bet-sum">${esc(r.explanation)}</div>
      <div class="bet-cards">
        <div class="bet-card"><div class="bt-mkt">Example</div><div class="bt-reason">${esc(r.example||'')}</div></div>
        <div class="bet-card"><div class="bt-mkt">Tip</div><div class="bt-reason">${esc(r.tip||'')}</div></div>
      </div>`;
  }
  let h=`<div class="bet-sum">${esc(r.summary)}</div>`;
  if(r.bets?.length){
    h+='<div class="bet-cards">';
    r.bets.forEach(b=>{
      const c=(b.confidence||'').toLowerCase();
      const badge=c?`<span class="cbadge ${c}">${c}</span>`:'';
      const ip=b.implied_probability?`<span class="impl">implied: ${esc(b.implied_probability)}</span>`:'';
      const ev=Array.isArray(b.evidence)&&b.evidence.length?`<ul class="bt-ev">${b.evidence.map(e=>`<li>${esc(e)}</li>`).join('')}</ul>`:'';
      h+=`<div class="bet-card"><div class="bt-mkt">${esc(b.market)}</div><div class="bt-sel">▶ ${esc(b.selection)}</div><div class="bt-meta">${badge}${ip}</div><div class="bt-reason">${esc(b.reason)}</div>${ev}</div>`;
    });
    h+='</div>';
  }
  return h;
}

// DEBUG PANEL
document.querySelectorAll('.dbg-tab').forEach(t=>t.addEventListener('click',()=>{
  document.querySelectorAll('.dbg-tab').forEach(x=>x.classList.remove('active'));t.classList.add('active');
  const tab=t.dataset.tab;
  document.getElementById('tab-prompt').style.display=tab==='prompt'?'':'none';
  document.getElementById('tab-metrics').style.display=tab==='metrics'?'':'none';
}));

function updatePrompt(secs,ver){
  document.getElementById('prompt-ph').style.display='none';
  document.getElementById('prompt-secs').style.display='';
  document.getElementById('vtag').textContent=ver||'v2';
  setCode('s-sys',secs.systemPrompt);setCode('s-int',secs.intentDecision||secs.detectedIntent);
  setCode('s-ctx',secs.contextData);
  setCode('s-usr',secs.userInput);setCode('s-out',secs.outputFormat);
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
  document.getElementById('log-box').innerHTML=Object.entries(log).map(([k,v])=>`<span class="lk">${k}</span>: <span class="lv">${JSON.stringify(v)}</span>`).join('\n');
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

  renderTabs();
  await loadSport(currentSport);
  fetchCounts();
}
init();
