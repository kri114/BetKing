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
    generateAll();
    renderAll();
    updateUI();
    renderHistory();
  }catch(e){
    console.error('Init error:',e);
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
          if (Math.random() < 0.06) {
            if (Math.random() < (ev.homeOvr / (ev.homeOvr + ev.awayOvr))) ev.hScore++;
            else ev.aScore++;
          }
        }
      } else if (sport === 'basketball') {
        ev.hScore = (ev.hScore || 0) + ri(0, 4);
        ev.aScore = (ev.aScore || 0) + ri(0, 4);
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
          if (Math.random() < 0.5) ev.p1Sets = (ev.p1Sets || 0) + 1;
          else ev.p2Sets = (ev.p2Sets || 0) + 1;
        }
      } else if (sport === 'cricket') {
        if (Math.random() < 0.08) {
          ev.hRuns = (ev.hRuns || 0) + pick([0, 1, 1, 2, 4, 6]);
          if (Math.random() < 0.1) ev.hWkts = (ev.hWkts || 0) + 1;
          ev.overs = (Math.round((parseFloat(ev.overs || 0) + 0.1) * 10) / 10).toFixed(1);
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
