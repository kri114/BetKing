// ==================== STORAGE ====================
function save(){
  try{
    localStorage.setItem('bk6',JSON.stringify({
      bal:G.bal,wins:G.wins,losses:G.losses,
      hist:G.hist.slice(0,80),debt:G.debt,
      daily:G.daily,user:G.user
    }));
  }catch(e){}
}

async function load(){
  try{
    const raw=localStorage.getItem('bk6');
    if(raw){
      const d=JSON.parse(raw);
      G.bal=d.bal??100;G.wins=d.wins||0;G.losses=d.losses||0;
      G.hist=d.hist||[];G.debt=d.debt||0;G.daily=d.daily||false;
      if(d.user)G.user={...G.user,...d.user};
      if(G.daily){
        document.getElementById('dlyBtn').disabled=true;
        document.getElementById('dlyBtn').textContent='✓ CLAIMED';
      }
    }
  }catch(e){}
}

setInterval(()=>{aiBal=aiBal.map(b=>Math.max(200,b+ri(-250,350)));},8000);
setInterval(save,15000);

// ==================== INIT ====================
(async()=>{
  try{ await load(); }catch(e){ console.warn('Load failed',e); }
  try{
    console.log('[BetKing] Generating events...');
    generateAll();
    console.log('[BetKing] Football events:', G.evts.football.length);
    console.log('[BetKing] Basketball events:', G.evts.basketball.length);
    console.log('[BetKing] Rendering...');
    renderAll();
    updateUI();
    renderHistory();
    console.log('[BetKing] Init complete.');
  }catch(e){
    console.error('[BetKing] Init error:',e);
  }
})();

// ==================== BACKGROUND GAME TICKER ====================
setInterval(() => {
  let anyLive = false;
  Object.keys(G.evts).forEach(sport => {
    (G.evts[sport] || []).filter(e => e.isLive && !e.finished).forEach(ev => {
      anyLive = true;
      if (sport === 'football') {
        if (ev.minute < 90) {
          ev.minute = Math.min(90, ev.minute + 3);
          const hStr = ev.homeOvr / (ev.homeOvr + ev.awayOvr);
          const aStr = 1 - hStr;
          if (!ev.hShots) { ev.hShots=0; ev.aShots=0; ev.hCorners=0; ev.aCorners=0; ev.hFouls=0; ev.aFouls=0; ev.hPoss=Math.round(hStr*100); ev.aPoss=Math.round(aStr*100); }
          if (Math.random() < 0.18) { if (Math.random() < hStr) ev.hShots++; else ev.aShots++; }
          if (Math.random() < 0.10) { if (Math.random() < hStr) ev.hCorners++; else ev.aCorners++; }
          if (Math.random() < 0.12) { if (Math.random() < aStr) ev.hFouls++; else ev.aFouls++; }
          ev.hPoss = Math.round(Math.max(30, Math.min(70, (ev.hPoss||50) + (Math.random()-0.5)*4)));
          ev.aPoss = 100 - ev.hPoss;
          const goalChance = 0.04 + (hStr - 0.5) * 0.02;
          if (Math.random() < goalChance) {
            if (Math.random() < hStr) { ev.hScore++; ev.hShots++; }
            else { ev.aScore++; ev.aShots++; }
          }
        }
      } else if (sport === 'basketball') {
        const hStr = ev.homeOvr / (ev.homeOvr + ev.awayOvr);
        const hPts = Math.random() < hStr ? ri(2,5) : ri(0,3);
        const aPts = Math.random() < (1-hStr) ? ri(2,5) : ri(0,3);
        ev.hScore = (ev.hScore || 0) + hPts;
        ev.aScore = (ev.aScore || 0) + aPts;
        if (Math.random() < 0.04) ev.quarter = Math.min(4, (ev.quarter || 1) + 1);
      } else if (sport === 'horses' || sport === 'dogs') {
        if (!rProg[ev.id]) rProg[ev.id] = ev.runners.map(() => rnd(0, 5));
        rProg[ev.id].forEach((_, i) => {
          rProg[ev.id][i] = Math.min(100, rProg[ev.id][i] + rnd(1, 4) * (0.7 + ev.runners[i].ovr / 200));
        });
      } else if (sport === 'mma') {
        if (Math.random() < 0.03) ev.round = Math.min(5, (ev.round || 1) + 1);
      } else if (sport === 'tennis') {
        if (Math.random() < 0.06) {
          if (Math.random() < 0.5) ev.p1Games = (ev.p1Games || 0) + 1;
          else ev.p2Games = (ev.p2Games || 0) + 1;
          if ((ev.p1Games || 0) >= 6 && (ev.p1Games || 0) - (ev.p2Games || 0) >= 2) {
            ev.p1Sets = (ev.p1Sets || 0) + 1; ev.p1Games = 0; ev.p2Games = 0;
          } else if ((ev.p2Games || 0) >= 6 && (ev.p2Games || 0) - (ev.p1Games || 0) >= 2) {
            ev.p2Sets = (ev.p2Sets || 0) + 1; ev.p1Games = 0; ev.p2Games = 0;
          }
        }
      } else if (sport === 'cricket') {
        if (Math.random() < 0.08) {
          ev.hRuns = (ev.hRuns || 0) + pick([0, 1, 1, 2, 4, 6]);
          if (Math.random() < 0.15) ev.hWkts = (ev.hWkts || 0) + 1;
          ev.overs = (Math.round((parseFloat(ev.overs || 0) + 0.2) * 10) / 10).toFixed(1);
        }
      } else if (sport === 'f1') {
        if (ev.lap < ev.totalLaps) ev.lap = Math.min(ev.totalLaps, ev.lap + 0.5);
        if (!rProg[ev.id]) rProg[ev.id] = (ev.drivers || []).map((_, i) => i * 2.5);
        rProg[ev.id].forEach((_, i) => {
          rProg[ev.id][i] = Math.min(100, (rProg[ev.id][i] || 0) + rnd(0.05, 0.15) * (1 - i * 0.012));
        });
        const leader = [...(rProg[ev.id].keys())].sort((a, b) => rProg[ev.id][b] - rProg[ev.id][a])[0];
        if (ev.drivers && ev.drivers[leader]) ev.leader = ev.drivers[leader].n;
      }
      if (typeof checkRoundEnd === 'function') checkRoundEnd(sport);
    });
  });
  if (anyLive && Math.random() < 0.4) {
    try { renderEvents(); updateUI(); } catch(e) {}
  }
}, 2000);
