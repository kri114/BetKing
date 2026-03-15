// ==================== PROFILE ====================
let profEdit={emoji:null,color:null};

function renderProfile(){
  const u=G.user;
  profEdit.emoji=u.emoji;profEdit.color=u.color;
  const totalWagered=G.hist.reduce((a,h)=>a+h.stake,0);
  const biggestWin=G.hist.filter(h=>h.result==='win').reduce((a,h)=>Math.max(a,h.payout),0);
  const earnedBadges=BADGES.filter(b=>b.cond());

  const statsHtml=`<div class="stat-grid2">
    <div class="stat2"><div class="stat2-v" style="color:var(--gold)">${fmt(G.bal)}</div><div class="stat2-l">Balance</div></div>
    <div class="stat2"><div class="stat2-v" style="color:var(--grn)">${G.wins}</div><div class="stat2-l">Wins</div></div>
    <div class="stat2"><div class="stat2-v" style="color:var(--red)">${G.losses}</div><div class="stat2-l">Losses</div></div>
    <div class="stat2"><div class="stat2-v" style="color:var(--blu)">${G.wins+G.losses>0?Math.round(G.wins/(G.wins+G.losses)*100)+'%':'—'}</div><div class="stat2-l">Win Rate</div></div>
    <div class="stat2"><div class="stat2-v" style="color:var(--pur)">${fmtD(totalWagered)}</div><div class="stat2-l">Wagered</div></div>
    <div class="stat2"><div class="stat2-v" style="color:var(--grn)">${fmtD(biggestWin)}</div><div class="stat2-l">Biggest Win</div></div>
  </div>`;

  const avGridHtml=`<div class="av-grid" id="avGrid">
    ${AV_EMOJIS.map(em=>`<div class="av-opt${profEdit.emoji===em?' sel':''}" onclick="selEmoji('${em}')">${em}</div>`).join('')}
  </div>`;
  const colGridHtml=`<div class="color-grid" id="colGrid">
    ${AV_COLORS.map(c=>`<div class="col-opt${profEdit.color===c?' sel':''}" style="background:${c}" onclick="selColor('${c}')"></div>`).join('')}
  </div>`;

  // Title options
  const titles=['Rookie','Sharp','Grinder','High Roller','Degenerate','The Prophet','Whale','Underdog Hero','The Oracle','Legend','The Shark','Diamond Hands','Iron Bettor','The Don','Maverick','Ghost','Phantom','Elite','GOAT','Overlord'];

  document.getElementById('profileCon').innerHTML=`
    <div class="profile-card">
      <div style="text-align:center;margin-bottom:16px">
        <div class="profile-av-big" id="bigAv" style="background:${u.color}22;color:${u.color};font-size:36px;border-color:${u.color}">
          ${u.emoji||'🎯'}
          <div class="av-edit-hint">✏️</div>
        </div>
        <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700">${u.name||'Player'}</div>
        <div style="font-size:11px;color:var(--txt3)">${u.title||'Rookie'}</div>
      </div>
      <div class="inp-row"><div class="inp-lbl">Display Name</div><input class="pinp" id="pName" value="${u.name||''}" placeholder="Enter name..." maxlength="20"></div>
      <div class="inp-row"><div class="inp-lbl">Bio</div><input class="pinp" id="pBio" value="${u.bio||''}" placeholder="Tell other players about yourself..." maxlength="80"></div>
      <div class="inp-row"><div class="inp-lbl">Title</div>
        <select class="pinp" id="pTitle" style="cursor:pointer">${titles.map(t=>`<option value="${t}"${u.title===t?' selected':''}>${t}</option>`).join('')}</select>
      </div>
      <div class="inp-row"><div class="inp-lbl">Avatar Emoji</div>${avGridHtml}</div>
      <div class="inp-row"><div class="inp-lbl">Avatar Color</div>${colGridHtml}</div>
      <button class="save-btn" onclick="saveProfile()">💾 Save Profile</button>
    </div>

    <div class="profile-card">
      <div class="secti" style="font-size:14px;margin-bottom:10px">My Stats</div>
      ${statsHtml}
    </div>

    <div class="profile-card">
      <div class="secti" style="font-size:14px;margin-bottom:10px">Badges <span style="font-size:10px">${earnedBadges.length}/${BADGES.length} earned</span></div>
      <div class="badge-grid">
        ${BADGES.map(b=>{
          const earned=b.cond();
          return `<div class="badge${earned?' earned':''}">
            <div class="badge-icon" style="${!earned?'filter:grayscale(1);opacity:.4':''}">${b.icon}</div>
            <div class="badge-name">${b.name}</div>
            <div class="badge-req">${b.req}</div>
            ${earned?'<div style="font-size:8px;color:var(--gold);margin-top:2px">✓ EARNED</div>':''}
          </div>`;
        }).join('')}
      </div>
    </div>

    <div class="profile-card">
      <div class="secti" style="font-size:14px;margin-bottom:10px">Danger Zone</div>
      <button onclick="resetGame()" style="background:rgba(255,48,80,.1);border:1px solid rgba(255,48,80,.3);color:var(--red);font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;padding:9px 20px;border-radius:8px;cursor:pointer;letter-spacing:1px">🗑️ RESET GAME</button>
      <div style="font-size:9px;color:var(--txt3);margin-top:5px">Resets balance to $100 and clears history</div>
    </div>

    <div class="profile-card" id="adminPanel" style="display:none">
      <div class="secti" style="font-size:14px;margin-bottom:10px">⚙️ Admin Panel</div>
      <div class="inp-row"><div class="inp-lbl">Fund Balance ($)</div>
        <div style="display:flex;gap:6px">
          <input class="pinp" id="adminFund" type="number" placeholder="Amount..." min="0" style="flex:1">
          <button onclick="adminAddFunds()" style="background:rgba(0,212,122,.15);border:1px solid rgba(0,212,122,.4);color:var(--grn);font-family:'Rajdhani',sans-serif;font-size:12px;font-weight:700;padding:6px 14px;border-radius:6px;cursor:pointer">ADD</button>
          <button onclick="adminSetFunds()" style="background:rgba(240,180,41,.12);border:1px solid rgba(240,180,41,.35);color:var(--gold);font-family:'Rajdhani',sans-serif;font-size:12px;font-weight:700;padding:6px 14px;border-radius:6px;cursor:pointer">SET</button>
        </div>
      </div>
      <div class="inp-row"><div class="inp-lbl">Custom Title</div>
        <div style="display:flex;gap:6px">
          <input class="pinp" id="adminTitle" placeholder="Any title text..." maxlength="30" style="flex:1">
          <button onclick="adminSetTitle()" style="background:rgba(26,144,240,.15);border:1px solid rgba(26,144,240,.4);color:var(--blu);font-family:'Rajdhani',sans-serif;font-size:12px;font-weight:700;padding:6px 14px;border-radius:6px;cursor:pointer">SET</button>
        </div>
      </div>
      <div class="inp-row"><div class="inp-lbl">Custom Avatar Emoji</div>
        <div style="display:flex;gap:6px">
          <input class="pinp" id="adminEmoji" placeholder="Paste any emoji..." maxlength="8" style="flex:1">
          <button onclick="adminSetEmoji()" style="background:rgba(26,144,240,.15);border:1px solid rgba(26,144,240,.4);color:var(--blu);font-family:'Rajdhani',sans-serif;font-size:12px;font-weight:700;padding:6px 14px;border-radius:6px;cursor:pointer">SET</button>
        </div>
      </div>
      <div class="inp-row" style="margin-top:4px">
        <div style="font-size:9px;color:var(--txt3)">Current balance: <span id="adminBalDisp" style="color:var(--gold)"></span></div>
      </div>
    </div>
  `;
}

function selEmoji(em){
  profEdit.emoji=em;
  document.querySelectorAll('.av-opt').forEach(el=>{el.classList.toggle('sel',el.textContent===em);});
  document.getElementById('bigAv').innerHTML=em+'<div class="av-edit-hint">✏️</div>';
}
function selColor(c){
  profEdit.color=c;
  document.querySelectorAll('.col-opt').forEach(el=>{el.classList.toggle('sel',el.style.background===c||el.style.backgroundColor===c);});
  const av=document.getElementById('bigAv');
  av.style.background=c+'22';av.style.color=c;av.style.borderColor=c;
}
function saveProfile(){
  G.user.name=document.getElementById('pName').value||'Player';
  G.user.bio=document.getElementById('pBio').value||'';
  G.user.title=document.getElementById('pTitle').value||'Rookie';
  G.user.emoji=profEdit.emoji;
  G.user.color=profEdit.color;
  // Update header avatar
  const hav=document.getElementById('hdrAv');
  hav.textContent=G.user.emoji||'ME';
  hav.style.background=G.user.color+'22';
  hav.style.color=G.user.color;
  hav.style.borderColor=G.user.color;
  notify('Profile Saved!','Your profile has been updated','win');
  renderProfile();save();
}

function resetGame(){
  if(!confirm('Reset everything? Your balance will go back to $100.'))return;
  G.bal=100;G.wins=0;G.losses=0;G.hist=[];G.debt=0;G.daily=false;G.activeBets=[];
  document.getElementById('dlyBtn').disabled=false;document.getElementById('dlyBtn').textContent='+ DAILY $50';
  updateUI();renderProfile();notify('Game Reset','Starting fresh with $100','win');save();
}

function renderLive(){
  const con=document.getElementById('liveCon');
  const all=[...G.evts.football,...G.evts.basketball,...G.evts.horses,...G.evts.dogs,...G.evts.mma,...(G.evts.f1||[]),...(G.evts.tennis||[]),...(G.evts.cricket||[])].filter(e=>e.isLive);
  if(!all.length){con.innerHTML='<div style="text-align:center;padding:40px;color:var(--txt3)">No live events right now</div>';return;}
  const icons={football:'⚽',basketball:'🏀',horses:'🐎',dogs:'🐕',mma:'🥊',tennis:'🎾',cricket:'🏏',f1:'🏎️'};
  con.innerHTML=`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:9px">${all.map(e=>{
    const nm=e.home?`${e.home} vs ${e.away}`:e.f1?`${e.f1} vs ${e.f2}`:e.title;
    const sc=e.hScore!==undefined?`${e.hScore} – ${e.aScore}`:e.round?`Round ${e.round}`:'Live';
    return `<div style="background:var(--bg2);border:1px solid rgba(255,48,80,.35);border-radius:9px;padding:11px;cursor:pointer" onclick="openViewer('${e.id}',event)">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="font-size:18px">${icons[e.sport]}</span><span class="lbdg">LIVE</span></div>
      <div style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;margin-bottom:3px">${nm}</div>
      <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:var(--gold)">${sc}</div>
      <div style="font-size:10px;color:var(--blu);margin-top:5px">▶ Watch live</div>
    </div>`;
  }).join('')}</div>`;
}

function notify(ti,bd,type){
  const el=document.getElementById('nfEl');
  document.getElementById('nfTi').textContent=ti;document.getElementById('nfBd').textContent=bd;
  el.className='notif '+type+' show';setTimeout(()=>el.classList.remove('show'),4200);
}
function updateUI(){
  document.getElementById('balDisp').textContent=fmt(G.bal);
  document.getElementById('stNW').textContent=fmt(G.bal);
  document.getElementById('stW').textContent=G.wins;
  document.getElementById('stL').textContent=G.losses;
  const t=G.wins+G.losses;
  document.getElementById('stWR').textContent=t?Math.round(G.wins/t*100)+'%':'—';
  // Update header avatar
  const hav=document.getElementById('hdrAv');
  if(G.user.emoji){hav.textContent=G.user.emoji;hav.style.color=G.user.color;hav.style.borderColor=G.user.color+'66';}
}

// ==================== ADMIN PANEL ====================
let adminTaps = 0, adminTimer = null;

function tryUnlockAdmin() {
  // Tap the balance display 7 times quickly to unlock admin panel
  adminTaps++;
  clearTimeout(adminTimer);
  adminTimer = setTimeout(() => { adminTaps = 0; }, 1500);
  if (adminTaps >= 7) {
    adminTaps = 0;
    const panel = document.getElementById('adminPanel');
    if (panel) {
      const showing = panel.style.display !== 'none';
      panel.style.display = showing ? 'none' : 'block';
      const bal = document.getElementById('adminBalDisp');
      if (bal) bal.textContent = fmt(G.bal);
      if (!showing) notify('Admin Unlocked', 'Admin panel is now visible', 'win');
    }
  }
}

function adminAddFunds() {
  const amt = parseFloat(document.getElementById('adminFund').value);
  if (isNaN(amt) || amt <= 0) { notify('Invalid Amount', 'Enter a positive number', 'loss'); return; }
  G.bal += amt;
  const bal = document.getElementById('adminBalDisp');
  if (bal) bal.textContent = fmt(G.bal);
  updateUI(); save();
  notify('Funds Added', '+' + fmt(amt) + ' added to balance', 'win');
}

function adminSetFunds() {
  const amt = parseFloat(document.getElementById('adminFund').value);
  if (isNaN(amt) || amt < 0) { notify('Invalid Amount', 'Enter a valid number', 'loss'); return; }
  G.bal = amt;
  const bal = document.getElementById('adminBalDisp');
  if (bal) bal.textContent = fmt(G.bal);
  updateUI(); save();
  notify('Balance Set', 'Balance set to ' + fmt(amt), 'win');
}

function adminSetTitle() {
  const t = document.getElementById('adminTitle').value.trim();
  if (!t) { notify('Empty Title', 'Type a title first', 'loss'); return; }
  G.user.title = t;
  renderProfile(); save();
  notify('Title Set', '"' + t + '" applied', 'win');
}

function adminSetEmoji() {
  const em = document.getElementById('adminEmoji').value.trim();
  if (!em) { notify('Empty Emoji', 'Paste an emoji first', 'loss'); return; }
  G.user.emoji = em;
  profEdit.emoji = em;
  renderProfile(); save();
  notify('Avatar Set', 'New avatar applied', 'win');
}
