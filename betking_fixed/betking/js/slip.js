// ==================== SLIP ====================
function tog(eid,evNm,sel,o,sp,mkt){
  const idx=G.slip.findIndex(s=>s.eid===eid&&s.mkt===mkt);
  if(idx>=0)G.slip.splice(idx,1);
  else G.slip.push({eid,evNm,sel,odds:o,sport:sp,mkt});
  renderSlip();renderEvents();updateSlipCount()
}
function clearSlip(){G.slip=[];G.stake=0;renderSlip();renderEvents();}
function goSlipMode(m,btn){G.mode=m;document.querySelectorAll('.slbt').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderSlip();}

function renderSlip(){
  const con=document.getElementById('slipCon'),sa=document.getElementById('stakeArea');
  const icons={football:'⚽',basketball:'🏀',horses:'🐎',dogs:'🐕',mma:'🥊',tennis:'🎾',cricket:'🏏',f1:'🏎️'};
  if(G.mode==='active'){showActiveBets();return;}
  if(!G.slip.length){con.innerHTML=`<div class="esl"><div style="font-size:26px;margin-bottom:6px">🎯</div><div style="font-size:11px;color:var(--txt3)">Pick odds to add to slip</div></div>`;sa.classList.add('hidden');return;}
  const tot=G.mode==='acca'||G.slip.length===1?G.slip.reduce((a,s)=>a*s.odds,1):G.slip.reduce((a,s)=>a*s.odds,1);
  if(G.mode==='acca'&&G.slip.length>1){
    const ao=G.slip.reduce((a,s)=>a*s.odds,1);
    con.innerHTML=`<div class="si"><div class="si-sp">ACCUMULATOR · ${G.slip.length} legs</div>
    ${G.slip.map(s=>`<div style="padding:2px 0;border-bottom:1px solid var(--brd);display:flex;justify-content:space-between;font-size:10px"><span>${s.sel.substring(0,30)}</span><span style="font-family:'Rajdhani',sans-serif;color:var(--gold)">${s.odds}x</span></div>`).join('')}
    <div style="margin-top:5px;display:flex;justify-content:space-between;align-items:center"><span style="font-size:10px;color:var(--txt2)">Combined odds</span><span class="si-od">${ao.toFixed(2)}x</span></div></div>`;
  } else {
    con.innerHTML=G.slip.map(s=>`<div class="si"><button class="si-rm" onclick="rmSlip('${s.eid}','${s.mkt}')">×</button><div class="si-sp">${icons[s.sport]||''} ${s.sport}</div><div class="si-sel">${s.sel.substring(0,36)}</div><div class="si-ev">${s.evNm.substring(0,38)}</div><div class="si-od">${s.odds}x</div></div>`).join('');
  }
  document.getElementById('slipOdds').textContent=tot.toFixed(2)+'x';
  sa.classList.remove('hidden');updPay();
}
function rmSlip(eid,mkt){G.slip=G.slip.filter(s=>!(s.eid===eid&&s.mkt===mkt));renderSlip();renderEvents();}

function setStk(amt){
  const v=amt===-1?G.bal:amt;G.stake=v;
  document.getElementById('stkInp').value=v;
  document.querySelectorAll('.sp-btn').forEach(b=>{b.classList.remove('active');if((b.textContent==='ALL IN'&&amt===-1)||(parseInt(b.textContent.replace('$',''))===v))b.classList.add('active');});
  updPay();
}
function updPay(){
  const stk=parseFloat(document.getElementById('stkInp').value)||0;G.stake=stk;
  const tot=G.slip.length?G.slip.reduce((a,s)=>a*s.odds,1):1;
  document.getElementById('payAmt').textContent=fmtD(stk*tot);
  document.getElementById('profAmt').textContent=fmtD(stk*tot-stk);
}

// ==================== CASH OUT ====================
function getCashoutVal(bet){
  const frac=rnd(0.4,0.8);
  return parseFloat((bet.stake*bet.odds*frac).toFixed(2));
}

function cashOutBet(idx){
  const bet=G.activeBets[idx];if(!bet)return;
  if(bet.intervalId)clearInterval(bet.intervalId);
  const val=getCashoutVal(bet);
  G.bal+=val;
  G.activeBets.splice(idx,1);
  G.hist.unshift({sport:bet.sport||'football',match:bet.evNm,sel:bet.sel,stake:bet.stake,odds:bet.odds,payout:val,result:'cashout',time:new Date().toLocaleTimeString()});
  notify('💸 Cashed Out!',`Received ${fmtD(val)} · bet settled early`,'cashout');
  updateUI();showActiveBets();renderHistory();
  checkBadges();
}

function showActiveBets(){
  G.mode='active';
  document.querySelectorAll('.slbt').forEach(b=>b.classList.remove('active'));
  const con=document.getElementById('slipCon');
  document.getElementById('stakeArea').classList.add('hidden');
  if(!G.activeBets.length){
    con.innerHTML=`<div class="esl"><div style="font-size:26px;margin-bottom:6px">⏳</div><div style="font-size:11px;color:var(--txt3)">No active bets</div></div>`;
    return;
  }
  con.innerHTML=G.activeBets.map((bet,i)=>{
    const allSports=Object.values(G.evts).flat();
    const ev=allSports.find(e=>e.id===bet.eid);
    const isFinished=ev&&(ev.finished===true||(ev.startTime==='FT'&&!ev.isLive));
    const statusLabel=!ev?'⏳ Waiting':ev.finished?'✅ Match finished':ev.isLive?'🔴 LIVE':'⏳ Waiting for match to start';
    const coVal=getCashoutVal(bet);
    return `<div class="abt">
      <div class="abt-ev">${bet.evNm.substring(0,36)}</div>
      <div class="abt-sel">${bet.sel.substring(0,40)}</div>
      <div style="font-size:9px;margin:3px 0;color:var(--txt3)">${statusLabel}</div>
      <div class="abt-row">
        <div><div class="abt-od">${bet.odds}x · Staked ${fmtD(bet.stake)}</div><div style="font-size:9px;color:var(--txt3)">To return: ${fmtD(bet.stake*bet.odds)}</div></div>
        ${isFinished?`<button class="abt-co" onclick="cashOutBet(${i})">CASH OUT<br><small>${fmtD(coVal)}</small></button>`:`<div style="font-size:9px;color:var(--txt3);text-align:center">Cash out<br>available<br>at FT</div>`}
      </div>
    </div>`;
  }).join('');
}

function placeBet(){
  const stk=G.stake;
  if(!stk||stk<=0){notify('Invalid stake','Enter an amount','lose');return;}
  if(stk>G.bal){notify('Insufficient funds','Visit Bank for a virtual loan','lose');return;}
  if(!G.slip.length){notify('Empty slip','Add selections first','lose');return;}
  G.bal-=stk;
  const slip=[...G.slip],mode=G.mode;
  const allIn=stk===G.bal+stk;
  clearSlip();updateUI();
  if(mode==='acca'||slip.length===1){
    const totOdds=slip.reduce((a,s)=>a*s.odds,1);
    const betId='bet_'+Date.now();
    const betRecord={id:betId,eid:slip[0].eid,evNm:slip[0].evNm,sel:slip.map(s=>s.sel).join(' + '),stake:stk,odds:parseFloat(totOdds.toFixed(2)),sport:slip[0].sport,legs:slip.length};
    G.activeBets.push(betRecord);
    betRecord.intervalId=simBet(slip,stk,totOdds,betId,allIn,slip.length);
  } else {
    const s1=stk/slip.length;
    slip.forEach(s=>{
      const betId='bet_'+Date.now()+'_'+Math.random();
      const betRecord={id:betId,eid:s.eid,evNm:s.evNm,sel:s.sel,stake:s1,odds:s.odds,sport:s.sport,legs:1};
      G.activeBets.push(betRecord);
      betRecord.intervalId=simBet([s],s1,s.odds,betId,false,1);
    });
  }
}

function simBet(sels,stk,o,betId,allIn,legs){
  const intervalId=setInterval(()=>{
    const allSports=Object.values(G.evts).flat();
    const allDone=sels.every(s=>{
      const ev=allSports.find(e=>e.id===s.eid);
      // If event hasn't started yet, wait for it
      if(!ev)return false;
      // Resolve if finished, or if it was never started after 30s (bet placed before start)
      return ev.finished===true||(ev.startTime==='FT'&&!ev.isLive);
    });
    if(!allDone)return;
    clearInterval(intervalId);
    const betRec=G.activeBets.find(b=>b.id===betId);
    if(betRec)betRec.intervalId=null;
    const win=Math.random()<Math.min(.9,1/o*.92);
    const pay=win?stk*o:0;
    G.activeBets=G.activeBets.filter(b=>b.id!==betId);
    if(win){G.bal+=pay;G.wins++;}else G.losses++;
    notify(win?'🎉 BET WON!':'Bet Lost',(win?'+':'-')+fmtD(win?pay:stk)+' · '+sels.map(s=>s.sel.substring(0,20)).join(' + '),win?'win':'lose');
    G.hist.unshift({sport:sels[0].sport,match:sels.map(s=>s.evNm).join(' / '),sel:sels.map(s=>s.sel).join(' + '),stake:stk,odds:o,payout:pay,result:win?'win':'lose',time:new Date().toLocaleTimeString(),allIn,legs});
    updateUI();renderHistory();checkBadges();
    if(G.mode==='active')showActiveBets();
  },1500);
  return intervalId;
}
function claimDaily(){
  if(G.daily)return;G.bal+=50;G.daily=true;
  document.getElementById('dlyBtn').disabled=true;document.getElementById('dlyBtn').textContent='✓ CLAIMED';
  notify('Daily Bonus!','+$50 added to your balance','win');updateUI();
}

// ==================== BADGES ====================
function checkBadges(){
  if(G.tab==='profile')renderProfile();
}

// ==================== TABS / SPORT ====================
function goTab(t,btn){
  G.tab=t;
  document.querySelectorAll('.nb').forEach(b=>b.classList.remove('active'));if(btn)btn.classList.add('active');
  ['sportsbook','live','leaderboard','history','loans','profile'].forEach(x=>document.getElementById('tab-'+x).classList.toggle('hidden',x!==t));
  if(t==='leaderboard')renderLB();
  if(t==='history')renderHistory();
  if(t==='live')renderLive();
  if(t==='loans')renderBank();
  if(t==='profile')renderProfile();
}
function goSport(sp,btn){
  G.sport=sp;G.lg='All';
  document.querySelectorAll('.stab').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
  const nrc=document.getElementById('newRoundCon');if(nrc)nrc.innerHTML='';
  renderAll();
}

function renderLB(){
  const all=[...AIPLAYERS.map((p,i)=>({...p,bal:aiBal[i],you:false})),{name:G.user.name||'You',av:G.user.emoji||'ME',c:G.user.color||'#F0B429',t:G.user.title||'Rookie',bal:G.bal,you:true}].sort((a,b)=>b.bal-a.bal);
  const rows=all.slice(0,15).map((p,i)=>{
    const rc=i===0?'t1':i===1?'t2':i===2?'t3':'';
    const avContent=p.you&&G.user.emoji?`<span style="font-size:16px">${G.user.emoji}</span>`:p.av;
    return `<div class="lrow${p.you?' you':''}"><div class="lrk ${rc}">${i+1}</div><div class="lav" style="background:${p.c}22;color:${p.c}">${avContent}</div><div style="flex:1"><div class="lnm">${p.name}${p.you?' (You)':''}</div><div class="ltg">${p.t}</div></div><div class="lbal">${fmt(p.bal)}</div></div>`;
  }).join('');
  document.getElementById('lbCon').innerHTML=`<div class="lbhdr"><div class="lbti">RANKINGS</div><div style="font-size:10px;color:var(--txt3)">${all.length} players</div></div>${rows}`;
  document.getElementById('rnkDisp').textContent='#'+(all.findIndex(p=>p.you)+1);
}

function renderHistory(){
  const con=document.getElementById('histCon');
  document.getElementById('histCnt').textContent=G.hist.length+' bets';
  if(!G.hist.length){con.innerHTML='<div style="text-align:center;padding:40px;color:var(--txt3)">No bets yet</div>';return;}
  const icons={football:'⚽',basketball:'🏀',horses:'🐎',dogs:'🐕',mma:'🥊',tennis:'🎾',cricket:'🏏',f1:'🏎️'};
  con.innerHTML=G.hist.slice(0,60).map(h=>`<div class="hi"><div class="hic">${icons[h.sport]||'🎯'}</div><div class="hinf"><div class="hm">${h.match.substring(0,38)}</div><div class="hsel">${h.sel.substring(0,42)} · ${h.odds.toFixed(2)}x</div><div class="htm">${h.time}</div></div><div class="hr"><div class="rbdg ${h.result}">${h.result.toUpperCase()}</div><div class="ham ${h.result}">${h.result==='win'?'+':h.result==='cashout'?'💸':'-'}${fmtD(h.result==='win'?h.payout:h.result==='cashout'?h.payout:h.stake)}</div><div style="font-size:9px;color:var(--txt3)">Staked: ${fmtD(h.stake)}</div></div></div>`).join('');
}

function renderBank(){
  const debt=G.debt>0?`<div class="debt-bar"><div><div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:var(--red)">Outstanding Debt</div><div style="font-size:10px;color:var(--txt2);margin-top:2px">Interest accruing daily</div></div><div style="display:flex;align-items:center;gap:10px"><div style="font-family:'Rajdhani',sans-serif;font-size:22px;font-weight:700;color:var(--red)">${fmtD(G.debt)}</div><button onclick="repay()" style="background:var(--red);border:none;color:#fff;font-family:'Rajdhani',sans-serif;font-size:12px;padding:6px 12px;border-radius:6px;cursor:pointer">Repay</button></div></div>`:'';
  const loans=[{a:200,r:10,l:'Starter'},{a:500,r:12,l:'Quick Cash'},{a:2000,r:15,l:'Standard'},{a:5000,r:20,l:'Mid Roller'},{a:15000,r:28,l:'High Roller'},{a:50000,r:40,l:'VIP Vault'}];
  document.getElementById('bankCon').innerHTML=`${debt}<div class="loan-grid">${loans.map(l=>`<div class="lopt"><div style="font-size:9px;color:var(--txt3);text-transform:uppercase;letter-spacing:1px;margin-bottom:3px">${l.l}</div><div style="font-family:'Rajdhani',sans-serif;font-size:22px;font-weight:700;color:var(--gold)">$${l.a.toLocaleString()}</div><div style="font-size:10px;color:var(--txt2);margin:3px 0 9px">${l.r}% interest</div><button onclick="takeLoan(${l.a},${l.r})" style="width:100%;background:var(--bg4);border:1px solid var(--brd2);border-radius:6px;color:var(--txt);font-family:'Rajdhani',sans-serif;font-size:12px;padding:6px;cursor:pointer">Take Loan</button></div>`).join('')}</div>`;
}
function takeLoan(a,r){G.bal+=a;G.debt+=a*(1+r/100);notify('Loan Approved!',fmt(a)+' added. Total owed: '+fmtD(G.debt),'win');updateUI();renderBank();}
function repay(){if(G.bal<G.debt){notify('Insufficient balance','Win more bets first!','lose');return;}G.bal-=G.debt;G.debt=0;notify('Debt Cleared!','Loan fully repaid','win');updateUI();renderBank();}
function toggleSlip(){
  const sbar=document.getElementById('sbar');
  sbar.classList.toggle('open');
}

function updateSlipCount(){
  const cnt=document.getElementById('slipCount');
  if(cnt)cnt.textContent=G.slip.length;
  const btn=document.getElementById('slipToggle');
  if(btn)btn.style.display=G.slip.length>0||window.innerWidth<=768?'flex':'none';
}
