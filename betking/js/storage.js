// ==================== STORAGE ====================
// Uses localStorage for persistence when hosted on GitHub/Render
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
