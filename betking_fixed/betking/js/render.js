// ==================== RENDER ====================
function renderAll(){renderLeagueFilter();renderEvents();}

function renderLeagueFilter(){
  const el=document.getElementById('lgFilter');
  const sp=G.sport;
  const raceLbl=sp==='f1'||sp==='horses'||sp==='dogs'?'Races':'Matches';
  const startBtn=`<button class="start-all-btn" onclick="startAll('${sp}')">▶ Start All ${raceLbl}</button>`;
  if(sp!=='football'){el.innerHTML=`<div class="lf-row">${startBtn}</div>`;return;}
  const lgs=['All',...Object.keys(LEAGUES)];
  el.innerHTML=`<div class="lf-row">${lgs.map(l=>`<button class="lfb${G.lg===l?' active':''}" onclick="setLg('${l}')">${l==='All'?'🌍 All':(LEAGUES[l]?.flag||'')+' '+l}</button>`).join('')}${startBtn}</div>`;
}

function renderEvents(){
  const con=document.getElementById('evtsCon');
  let evts=G.evts[G.sport]||[];
  if(G.sport==='football'&&G.lg!=='All')evts=evts.filter(e=>e.league===G.lg);
  if(!evts.length){con.innerHTML='<div style="text-align:center;padding:40px;color:var(--txt3)">No events available</div>';return;}
  try{
    if(G.sport==='football')con.innerHTML=`<div class="egrid">${evts.map(rFB).join('')}</div>`;
    else if(G.sport==='basketball')con.innerHTML=`<div class="egrid">${evts.map(rBB).join('')}</div>`;
    else if(G.sport==='horses'||G.sport==='dogs')con.innerHTML=evts.map(rRace).join('');
    else if(G.sport==='mma')con.innerHTML=`<div class="egrid">${evts.map(rMMA).join('')}</div>`;
    else if(G.sport==='tennis')con.innerHTML=`<div class="egrid">${evts.map(rTennis).join('')}</div>`;
    else if(G.sport==='cricket')con.innerHTML=`<div class="egrid">${evts.map(rCricket).join('')}</div>`;
    else if(G.sport==='f1')con.innerHTML=evts.map(rF1).join('');
  }catch(err){
    console.error('renderEvents error:',err);
    con.innerHTML=`<div style="text-align:center;padding:40px;color:var(--red)">Render error — try switching sport tabs</div>`;
  }
}
function setLg(l){G.lg=l;renderLeagueFilter();renderEvents();}

// Odds button helper
function ob(eid,evNm,sel,o,sp,mkt,lbl){
  const safe=sel.replace(/'/g,"\\'").replace(/"/g,'\\"');
  const evSafe=evNm.replace(/'/g,"\\'").replace(/"/g,'\\"');
  return `<button class="ob ${selC(eid,mkt)}" onclick="tog('${eid}','${evSafe}','${safe}',${o},'${sp}','${mkt}')"><span class="ob-l">${lbl}</span><span class="ob-v">${o}</span></button>`;
}
function os(t,h){return `<div class="os"><div class="ost">${t}</div><div class="or">${h}</div></div>`;}
function ovrBdg(o){return `<span class="ovr-b ${oc(o)}">OVR ${o}</span>`;}

function rFB(e){
  const lid=e.id+'lu',pid=e.id+'pp';
  const evNm=`${e.home} vs ${e.away}`;
  const ws=e.isLive?`<button class="wbtn" onclick="openViewer('${e.id}',event)">▶ Watch</button>`:'';
  const badge=e.isLive?`<span class="lbdg">LIVE</span>`:`<span class="tbdg">${e.startTime}</span>`;
  const sc=e.isLive?`${e.hScore} – ${e.aScore}`:'vs';
  const hc=SQ[e.home]?.c||'#4FC3F7',ac=SQ[e.away]?.c||'#EF9A9A';

  const lu=G.showLU[lid]?`<div class="lu-wrap">
    <div class="lu-hdr"><span>Starting Lineups</span><span>${e.hLU.f} / ${e.aLU.f}</span></div>
    <div class="lu-cols">
      <div>
        <div class="lu-th" style="color:${hc}">${e.home}</div>
        ${e.hLU.players.map(p=>`<div class="lu-row"><span class="lu-pos">${p.pos}</span><span class="lu-nm">${p.name}</span><span class="lu-num">#${p.num}</span><span class="lu-ovr-dot" style="background:${p.ovr>=85?'var(--grn)':p.ovr>=75?'var(--gold)':'var(--red)'}"></span></div>`).join('')}
      </div>
      <div>
        <div class="lu-th" style="color:${ac};text-align:right">${e.away}</div>
        ${e.aLU.players.map(p=>`<div class="lu-row"><span class="lu-pos">${p.pos}</span><span class="lu-nm">${p.name}</span><span class="lu-num">#${p.num}</span><span class="lu-ovr-dot" style="background:${p.ovr>=85?'var(--grn)':p.ovr>=75?'var(--gold)':'var(--red)'}"></span></div>`).join('')}
      </div>
    </div>
  </div>`:'';

  // Player props
  const pp = G.showLU[pid] ? `<div class="props-section">
    <div class="lu-hdr" style="margin-bottom:5px">Player Props</div>
    ${[...(e.hProps||[]),...(e.aProps||[])].map(p=>`
    <div class="props-player">
      <div class="props-pname">${p.name} <span class="props-pos">${p.pos}</span></div>
      <div class="or" style="flex-wrap:wrap;gap:3px">
        ${ob(e.id,evNm,p.name+' Anytime Scorer',p.anytime,'football','pp_anytime_'+p.name.replace(/ /g,'_'),'Anytime Goal')}
        ${ob(e.id,evNm,p.name+' 1st Scorer',p.first,'football','pp_first_'+p.name.replace(/ /g,'_'),'1st Goal')}
        ${ob(e.id,evNm,p.name+' Assist',p.assist,'football','pp_assist_'+p.name.replace(/ /g,'_'),'Assist')}
        ${ob(e.id,evNm,p.name+' 2+ Shots',p.shots2,'football','pp_sh2_'+p.name.replace(/ /g,'_'),'2+ Shots')}
        ${ob(e.id,evNm,p.name+' Card',p.card,'football','pp_card_'+p.name.replace(/ /g,'_'),'Card')}
      </div>
    </div>`).join('')}
  </div>` : '';

  const hn=e.home.split(' ')[0],an=e.away.split(' ')[0];
  return `<div class="ecard${e.isLive?' live':''}">
    ${ws}
    <div class="ehdr"><span class="elg">${LEAGUES[e.league]?.flag||''} ${e.league}</span>${badge}</div>
    <div class="ebody">
      <div class="eovr">${ovrBdg(e.homeOvr)} &nbsp; ${ovrBdg(e.awayOvr)}</div>
      <div class="ematch">
        <div class="eteam" style="color:${hc}">${e.home}</div>
        <div class="escore">${sc}${e.isLive?`<small>${e.minute}'</small>`:''}</div>
        <div class="eteam r" style="color:${ac}">${e.away}</div>
      </div>
      <div style="display:flex;gap:5px;margin-bottom:5px;flex-wrap:wrap">
        <button class="lu-btn" onclick="toggleLU('${lid}')">${G.showLU[lid]?'▲ Lineups':'▼ Lineups'}</button>
        <button class="lu-btn" onclick="toggleLU('${pid}')" style="color:var(--grn)">${G.showLU[pid]?'▲ Player Props':'▼ Player Props'}</button>
      </div>
      ${lu}${pp}
      ${os('Match Result',ob(e.id,evNm,e.home+' Win',e.odds.home,'football','h1',hn+' Win')+ob(e.id,evNm,'Draw',e.odds.draw,'football','dr','Draw')+ob(e.id,evNm,e.away+' Win',e.odds.away,'football','a1',an+' Win'))}
      ${os('Half-Time',ob(e.id,evNm,'HT '+e.home,e.odds.hth,'football','hth','HT '+hn)+ob(e.id,evNm,'HT Draw',e.odds.htd,'football','htd','HT Draw')+ob(e.id,evNm,'HT '+e.away,e.odds.hta,'football','hta','HT '+an))}
      ${os('Asian Handicap',ob(e.id,evNm,hn+' -0.5',e.odds.ah05h,'football','ah05h',hn+' -0.5')+ob(e.id,evNm,an+' -0.5',e.odds.ah05a,'football','ah05a',an+' -0.5')+ob(e.id,evNm,hn+' -1.5',e.odds.ah15h,'football','ah15h',hn+' -1.5')+ob(e.id,evNm,an+' -1.5',e.odds.ah15a,'football','ah15a',an+' -1.5'))}
      ${os('Goals Over/Under',ob(e.id,evNm,'Over 2.5',e.odds.o25,'football','o25','O 2.5')+ob(e.id,evNm,'Under 2.5',e.odds.u25,'football','u25','U 2.5')+ob(e.id,evNm,'Over 3.5',e.odds.o35,'football','o35','O 3.5')+ob(e.id,evNm,'Under 3.5',e.odds.u35,'football','u35','U 3.5')+ob(e.id,evNm,'Over 4.5',e.odds.o45,'football','o45','O 4.5')+ob(e.id,evNm,'Under 4.5',e.odds.u45,'football','u45','U 4.5'))}
      ${os('Both Teams To Score',ob(e.id,evNm,'BTTS Yes',e.odds.bttsY,'football','bttsY','Yes')+ob(e.id,evNm,'BTTS No',e.odds.bttsN,'football','bttsN','No'))}
      ${os('First Team To Score',ob(e.id,evNm,e.home+' 1st',e.odds.hfg,'football','hfg',hn+' 1st')+ob(e.id,evNm,e.away+' 1st',e.odds.afg,'football','afg',an+' 1st')+ob(e.id,evNm,'No Goal',e.odds.nfg,'football','nfg','No Goal'))}
      ${os('Correct Score',ob(e.id,evNm,'1-0',e.odds.cs10,'football','cs10','1-0')+ob(e.id,evNm,'2-0',e.odds.cs20,'football','cs20','2-0')+ob(e.id,evNm,'0-1',e.odds.cs01,'football','cs01','0-1')+ob(e.id,evNm,'1-1',e.odds.cs11,'football','cs11','1-1')+ob(e.id,evNm,'2-1',e.odds.cs21,'football','cs21','2-1')+ob(e.id,evNm,'1-2',e.odds.cs12,'football','cs12','1-2')+ob(e.id,evNm,'2-2',e.odds.cs22,'football','cs22','2-2')+ob(e.id,evNm,'3-1',e.odds.cs31,'football','cs31','3-1')+ob(e.id,evNm,'0-0',e.odds.cs00,'football','cs00','0-0'))}
      ${os('HT/FT Double',ob(e.id,evNm,'Home/Home',e.odds.htfthh,'football','htfthh','H/H')+ob(e.id,evNm,'Home/Draw',e.odds.htfthd,'football','htfthd','H/D')+ob(e.id,evNm,'Draw/Home',e.odds.htftdh,'football','htftdh','D/H')+ob(e.id,evNm,'Draw/Draw',e.odds.htftdd,'football','htftdd','D/D')+ob(e.id,evNm,'Away/Home',e.odds.htftah,'football','htftah','A/H')+ob(e.id,evNm,'Away/Away',e.odds.htftaa,'football','htftaa','A/A'))}
      ${os('Win To Nil',ob(e.id,evNm,e.home+' Win Nil',e.odds.hw0,'football','hw0',hn+' Nil')+ob(e.id,evNm,e.away+' Win Nil',e.odds.aw0,'football','aw0',an+' Nil'))}
      ${os('Cards & Corners',ob(e.id,evNm,hn+' More Cards',e.odds.hcard,'football','hcard',hn+' Cards')+ob(e.id,evNm,an+' More Cards',e.odds.acard,'football','acard',an+' Cards')+ob(e.id,evNm,'O 3.5 Cards',e.odds.c35,'football','c35','O 3.5 Cards')+ob(e.id,evNm,hn+' More Corners',e.odds.hcorn,'football','hcorn',hn+' Corners')+ob(e.id,evNm,an+' More Corners',e.odds.acorn,'football','acorn',an+' Corners'))}
      ${os('Specials',ob(e.id,evNm,e.home+' Pen',e.odds.hpen,'football','hpen',hn+' Penalty')+ob(e.id,evNm,e.away+' Pen',e.odds.apen,'football','apen',an+' Penalty')+ob(e.id,evNm,'Extra Time',e.odds.et,'football','et','Extra Time'))}
    </div>
  </div>`;
}
function toggleLU(id){G.showLU[id]=!G.showLU[id];renderEvents();}

function rBB(e){
  const lid=e.id+'lu';
  const evNm=`${e.home} vs ${e.away}`;
  const ws=e.isLive?`<button class="wbtn" onclick="openViewer('${e.id}',event)">▶ Watch</button>`:'';
  const badge=e.isLive?`<span class="lbdg">LIVE</span>`:`<span class="tbdg">${e.startTime}</span>`;
  const sc=e.isLive?`${e.hScore} – ${e.aScore}`:'vs';
  const lu=G.showLU[lid]?`<div class="lu-wrap">
    <div class="lu-hdr"><span>Starting 5</span></div>
    <div class="lu-cols">
      <div>
        <div class="lu-th" style="color:var(--org)">${e.home}</div>
        ${e.hLU.map(p=>`<div class="lu-row"><span class="lu-pos">${p.pos}</span><span class="lu-nm">${p.name}</span><span class="lu-num">#${p.num}</span><span class="lu-ovr-dot" style="background:${p.ovr>=85?'var(--grn)':p.ovr>=75?'var(--gold)':'var(--red)'}"></span></div>`).join('')}
      </div>
      <div>
        <div class="lu-th" style="color:var(--pur);text-align:right">${e.away}</div>
        ${e.aLU.map(p=>`<div class="lu-row"><span class="lu-pos">${p.pos}</span><span class="lu-nm">${p.name}</span><span class="lu-num">#${p.num}</span><span class="lu-ovr-dot" style="background:${p.ovr>=85?'var(--grn)':p.ovr>=75?'var(--gold)':'var(--red)'}"></span></div>`).join('')}
      </div>
    </div>
  </div>`:'';

  // Player props for basketball
  const ppid=e.id+'pp';
  const ppHtml = G.showLU[ppid] ? `<div class="props-section">
    <div class="lu-hdr" style="margin-bottom:5px">Player Props</div>
    ${[...(e.hProps||[]).slice(0,3),...(e.aProps||[]).slice(0,3)].map(p=>`
    <div class="props-player">
      <div class="props-pname">${p.name} <span class="props-pos">${p.pos}</span></div>
      <div class="or" style="flex-wrap:wrap;gap:3px">
        ${ob(e.id,evNm,p.name+' 20+ Pts',p.pts20,'basketball','pp_p20_'+p.name.replace(/ /g,'_'),'20+ Pts')}
        ${ob(e.id,evNm,p.name+' 25+ Pts',p.pts25,'basketball','pp_p25_'+p.name.replace(/ /g,'_'),'25+ Pts')}
        ${ob(e.id,evNm,p.name+' 8+ Reb',p.reb8,'basketball','pp_r8_'+p.name.replace(/ /g,'_'),'8+ Reb')}
        ${ob(e.id,evNm,p.name+' 6+ Ast',p.ast6,'basketball','pp_a6_'+p.name.replace(/ /g,'_'),'6+ Ast')}
        ${ob(e.id,evNm,p.name+' Dbl-Dbl',p.dbl,'basketball','pp_dd_'+p.name.replace(/ /g,'_'),'Dbl-Dbl')}
      </div>
    </div>`).join('')}
  </div>` : '';

  const hn=e.home.split(' ').pop(),an=e.away.split(' ').pop();
  return `<div class="ecard${e.isLive?' live':''}">
    ${ws}
    <div class="ehdr"><span class="elg">${e.league}</span>${badge}</div>
    <div class="ebody">
      <div class="eovr">${ovrBdg(e.homeOvr)} &nbsp; ${ovrBdg(e.awayOvr)}</div>
      <div class="ematch"><div class="eteam">${e.home}</div><div class="escore">${sc}${e.isLive?`<small>Q${e.quarter}</small>`:''}</div><div class="eteam r">${e.away}</div></div>
      <div style="display:flex;gap:5px;margin-bottom:5px">
        <button class="lu-btn" onclick="toggleLU('${lid}')">${G.showLU[lid]?'▲ Roster':'▼ Roster'}</button>
        <button class="lu-btn" onclick="toggleLU('${ppid}')" style="color:var(--grn)">${G.showLU[ppid]?'▲ Props':'▼ Player Props'}</button>
      </div>
      ${lu}${ppHtml}
      ${os('Moneyline',ob(e.id,evNm,e.home+' Win',e.odds.home,'basketball','hml',hn+' Win')+ob(e.id,evNm,e.away+' Win',e.odds.away,'basketball','aml',an+' Win'))}
      ${os('Point Spread ±'+e.spread,ob(e.id,evNm,e.home+' -'+e.spread,e.odds.hSpr,e.sport,'hsp',hn+' -'+e.spread)+ob(e.id,evNm,e.away+' +'+e.spread,e.odds.aSpr,e.sport,'asp',an+' +'+e.spread))}
      ${os('Total Points',ob(e.id,evNm,'O 215.5',e.odds.o215,'basketball','o215','O 215.5')+ob(e.id,evNm,'U 215.5',e.odds.u215,'basketball','u215','U 215.5')+ob(e.id,evNm,'O 225.5',e.odds.o225,'basketball','o225','O 225.5')+ob(e.id,evNm,'U 225.5',e.odds.u225,'basketball','u225','U 225.5')+ob(e.id,evNm,'O 235.5',e.odds.o235,'basketball','o235','O 235.5')+ob(e.id,evNm,'U 235.5',e.odds.u235,'basketball','u235','U 235.5'))}
      ${os('Quarter Markets',ob(e.id,evNm,e.home+' Q1',e.odds.hQ1,'basketball','hQ1','Home Q1')+ob(e.id,evNm,e.away+' Q1',e.odds.aQ1,'basketball','aQ1','Away Q1'))}
      ${os('Half-Time',ob(e.id,evNm,e.home+' HT',e.odds.hHT,'basketball','hHT','Home HT')+ob(e.id,evNm,e.away+' HT',e.odds.aHT,'basketball','aHT','Away HT'))}
      ${os('Winning Margin',ob(e.id,evNm,'1-5 pts',e.odds.m5,'basketball','m5','1-5 pts')+ob(e.id,evNm,'6-10 pts',e.odds.m10,'basketball','m10','6-10 pts')+ob(e.id,evNm,'11-15 pts',e.odds.m15,'basketball','m15','11-15 pts'))}
      ${os('Specials',ob(e.id,evNm,'Goes to OT',e.odds.ot,'basketball','ot','Goes OT')+ob(e.id,evNm,'No OT',e.odds.noOt,'basketball','noOt','No OT'))}
    </div>
  </div>`;
}

let raceView={};
function rRace(e){
  const rv=raceView[e.id]||'win';
  const badge=e.isLive?`<span class="lbdg">LIVE</span>`:`<span class="tbdg">${e.startTime}</span>`;
  const ws=e.isLive?`<button style="background:rgba(26,144,240,.12);border:1px solid rgba(26,144,240,.4);border-radius:4px;color:var(--blu);font-size:9px;padding:2px 6px;cursor:pointer" onclick="openViewer('${e.id}',event)">▶</button>`:'';
  const rows=e.runners.map((r,i)=>`<div class="rrow"><div class="rnum" style="background:${RCOLS[i]}">${i+1}</div><div class="rname">${r.name}</div><span class="rovr-b" style="background:${r.ovr>=85?'rgba(0,212,122,.12)':r.ovr>=75?'rgba(240,180,41,.12)':'rgba(255,48,80,.12)'};color:${r.ovr>=85?'var(--grn)':r.ovr>=75?'var(--gold)':'var(--red)'}">${r.ovr}</span></div>`).join('');
  const btabs=['win','place','each-way','exacta','forecast'].map(t=>`<button class="rbt${rv===t?' active':''}" onclick="setRV('${e.id}','${t}')">${t.toUpperCase()}</button>`).join('');
  const ok=rv==='win'?'winOdds':rv==='place'?'placeOdds':rv==='each-way'?'ew':'exacta';
  const grid=`<div class="rbgrid">${e.runners.map((r,i)=>`<button class="rob${isSel(e.id,rv+'_'+i)?' sel':''}" onclick="tog('${e.id}','${e.title}','${r.name} (${rv.toUpperCase()})',${r[ok]},'${e.sport}','${rv}_${i}')"><span class="rob-l">#${i+1}</span><span class="rob-n">${r.name}</span><span class="rob-v">${r[ok]}</span></button>`).join('')}</div>`;
  return `<div class="rcard"><div class="rchdr"><div><div class="rc-ti">${e.title}</div><div class="rc-in">${e.info}</div></div><div style="display:flex;gap:5px;align-items:center">${ws}${badge}</div></div><div>${rows}</div><div class="rbt-wrap">${btabs}</div>${grid}</div>`;
}
function setRV(id,v){raceView[id]=v;renderEvents();}

function rMMA(e){
  const evNm=`${e.f1} vs ${e.f2}`;
  const ws=e.isLive?`<button class="wbtn" onclick="openViewer('${e.id}',event)">▶ Watch</button>`:'';
  const badge=e.isLive?`<span class="lbdg">LIVE</span>`:`<span class="tbdg">${e.startTime}</span>`;
  const f1s=e.f1.split(' ').pop(),f2s=e.f2.split(' ').pop();
  return `<div class="ecard${e.isLive?' live':''}">
    ${ws}
    <div class="ehdr"><span class="elg">${e.event}</span>${badge}</div>
    <div class="ebody">
      <div class="eovr">${ovrBdg(e.f1ovr)} &nbsp; ${ovrBdg(e.f2ovr)}</div>
      <div class="ematch"><div class="eteam">${e.f1}</div><div class="escore" style="font-size:13px;color:var(--red)">vs${e.isLive?`<small>R${e.round}</small>`:''}</div><div class="eteam r">${e.f2}</div></div>
      ${os('Fight Winner',ob(e.id,evNm,e.f1+' Win',e.odds.f1,'mma','f1w',f1s+' Win')+ob(e.id,evNm,e.f2+' Win',e.odds.f2,'mma','f2w',f2s+' Win'))}
      ${os(f1s+' Method',ob(e.id,evNm,e.f1+' KO',e.odds.f1ko,'mma','f1ko','KO/TKO')+ob(e.id,evNm,e.f1+' Sub',e.odds.f1sub,'mma','f1sub','Submission')+ob(e.id,evNm,e.f1+' Dec',e.odds.f1dec,'mma','f1dec','Decision'))}
      ${os(f2s+' Method',ob(e.id,evNm,e.f2+' KO',e.odds.f2ko,'mma','f2ko','KO/TKO')+ob(e.id,evNm,e.f2+' Sub',e.odds.f2sub,'mma','f2sub','Submission')+ob(e.id,evNm,e.f2+' Dec',e.odds.f2dec,'mma','f2dec','Decision'))}
      ${os('Round Betting',ob(e.id,evNm,'R1 Finish',e.odds.r1fin,'mma','r1fin','R1 Finish')+ob(e.id,evNm,'R2 Finish',e.odds.r2fin,'mma','r2fin','R2 Finish')+ob(e.id,evNm,'R3 Finish',e.odds.r3fin,'mma','r3fin','R3 Finish'))}
      ${os('Total Rounds',ob(e.id,evNm,'U 1.5 Rds',e.odds.u15,'mma','u15','U 1.5')+ob(e.id,evNm,'O 2.5 Rds',e.odds.o25r,'mma','o25r','O 2.5')+ob(e.id,evNm,'U 2.5 Rds',e.odds.u25r,'mma','u25r','U 2.5'))}
      ${os('Goes the Distance',ob(e.id,evNm,'Yes (Decision)',e.odds.gdec,'mma','gdec','Yes')+ob(e.id,evNm,'No (Finish)',e.odds.ndec,'mma','ndec','No'))}
    </div>
  </div>`;
}

function rTennis(e){
  const evNm=`${e.p1} vs ${e.p2}`;
  const badge=e.isLive?`<span class="lbdg">LIVE</span>`:`<span class="tbdg">${e.startTime}</span>`;
  const sc=e.isLive?`${e.p1Sets}-${e.p2Sets}`:'vs';
  const ws=e.isLive?`<button class="wbtn" onclick="openViewer('${e.id}',event)">▶ Watch</button>`:'';
  return `<div class="ecard${e.isLive?' live':''}">
    ${ws}
    <div class="ehdr"><span class="elg">🎾 ${e.tournament}</span>${badge}</div>
    <div class="ebody">
      <div class="eovr">${ovrBdg(e.p1ovr)} &nbsp; ${ovrBdg(e.p2ovr)}</div>
      <div class="ematch">
        <div class="eteam">${e.p1} <small style="color:var(--txt3);font-size:9px">${e.p1country}</small></div>
        <div class="escore">${sc}${e.isLive?'<small>Sets</small>':''}</div>
        <div class="eteam r">${e.p2} <small style="color:var(--txt3);font-size:9px">${e.p2country}</small></div>
      </div>
      ${os('Match Winner',ob(e.id,evNm,e.p1+' Win',e.odds.p1,'tennis','p1win',e.p1.split(' ').pop())+ob(e.id,evNm,e.p2+' Win',e.odds.p2,'tennis','p2win',e.p2.split(' ').pop()))}
      ${os('Set Winner',ob(e.id,evNm,e.p1+' 1st Set',e.odds.p1s1,'tennis','p1s1','P1 Set 1')+ob(e.id,evNm,e.p2+' 1st Set',e.odds.p2s1,'tennis','p2s1','P2 Set 1')+ob(e.id,evNm,e.p1+' 2nd Set',e.odds.p1s2,'tennis','p1s2','P1 Set 2')+ob(e.id,evNm,e.p2+' 2nd Set',e.odds.p2s2,'tennis','p2s2','P2 Set 2'))}
      ${os('Total Games',ob(e.id,evNm,'O 22.5 Games',e.odds.o225g,'tennis','o225g','O 22.5')+ob(e.id,evNm,'U 22.5 Games',e.odds.u225g,'tennis','u225g','U 22.5'))}
      ${os('Tiebreak in Match',ob(e.id,evNm,'Tiebreak Yes',e.odds.tb,'tennis','tb','Yes')+ob(e.id,evNm,'Tiebreak No',e.odds.notb,'tennis','notb','No'))}
      ${os('Match Length (sets)',ob(e.id,evNm,'Straight Sets',e.odds.str3,'tennis','str3','Straight')+ob(e.id,evNm,'4 Sets',e.odds.str4,'tennis','str4','4 Sets')+ob(e.id,evNm,'5 Sets',e.odds.str5,'tennis','str5','5 Sets'))}
    </div>
  </div>`;
}

function rCricket(e){
  const evNm=`${e.home} vs ${e.away}`;
  const badge=e.isLive?`<span class="lbdg">LIVE</span>`:`<span class="tbdg">${e.startTime}</span>`;
  const sc=e.isLive?`${e.hRuns}/${e.hWkts}`:'vs';
  const ws=e.isLive?`<button class="wbtn" onclick="openViewer('${e.id}',event)">▶ Watch</button>`:'';
  return `<div class="ecard${e.isLive?' live':''}">
    ${ws}
    <div class="ehdr"><span class="elg">🏏 ${e.format}</span>${badge}</div>
    <div class="ebody">
      <div class="eovr">${ovrBdg(e.homeOvr)} &nbsp; ${ovrBdg(e.awayOvr)}</div>
      <div class="ematch">
        <div class="eteam">${e.home}</div>
        <div class="escore">${sc}${e.isLive?`<small>${e.overs} ov</small>`:''}</div>
        <div class="eteam r">${e.away}</div>
      </div>
      ${os('Match Winner',ob(e.id,evNm,e.home+' Win',e.odds.home,'cricket','hw',e.home)+ob(e.id,evNm,e.away+' Win',e.odds.away,'cricket','aw',e.away)+(e.odds.draw?ob(e.id,evNm,'Draw',e.odds.draw,'cricket','dr','Draw'):''))}
      ${os('1st Innings Lead',ob(e.id,evNm,e.home+' Lead 1st',e.odds.hInns,'cricket','hInns',e.home+' Lead')+ob(e.id,evNm,e.away+' Lead 1st',e.odds.aInns,'cricket','aInns',e.away+' Lead'))}
      ${os('Total Runs',ob(e.id,evNm,'Over 300',e.odds.o300,'cricket','o300','O 300')+ob(e.id,evNm,'Under 300',e.odds.u300,'cricket','u300','U 300')+ob(e.id,evNm,'Over 350',e.odds.o350,'cricket','o350','O 350')+ob(e.id,evNm,'Under 350',e.odds.u350,'cricket','u350','U 350'))}
      ${os('Top Batsman',ob(e.id,evNm,e.home+' Top Bat',e.odds.topHb,'cricket','topHb',e.home+' Top')+ob(e.id,evNm,e.away+' Top Bat',e.odds.topAb,'cricket','topAb',e.away+' Top'))}
    </div>
  </div>`;
}

// ==================== F1 RENDER ====================
const F1_TEAM_COLORS={
  'Red Bull':'#1E41FF','McLaren':'#FF8000','Ferrari':'#E8002D','Mercedes':'#27F4D2',
  'Aston Martin':'#229971','Alpine':'#0093CC','Williams':'#64C4FF','Racing Bulls':'#6692FF',
  'Haas':'#B6BABD','Sauber':'#52E252'
};
function rF1(e){
  const badge=e.isLive?`<span class="lbdg">LIVE</span>`:`<span class="tbdg">${e.startTime}</span>`;
  const driverRows=e.drivers.map((d,i)=>{
    const tc=F1_TEAM_COLORS[d.team]||'#888';
    const pos=i+1;
    const medal=pos===1?'🥇':pos===2?'🥈':pos===3?'🥉':'';
    return `<div style="display:flex;align-items:center;gap:7px;padding:4px 10px;border-bottom:1px solid var(--brd)">
      <div style="width:20px;text-align:center;font-family:'Rajdhani',sans-serif;font-size:11px;font-weight:700;color:var(--txt3)">${medal||pos}</div>
      <div style="width:3px;height:28px;border-radius:2px;background:${tc};flex-shrink:0"></div>
      <div style="flex:1">
        <div style="font-size:11px;font-weight:600">${d.n}</div>
        <div style="font-size:9px;color:var(--txt3)">${d.team} · #${d.num} · ${d.country}</div>
      </div>
    </div>`;
  }).join('');

  const winBtns=e.drivers.slice(0,6).map(d=>ob(e.id,e.circuit,d.n+' Race Win',d.raceWin,'f1','win_'+d.num,d.n.split(' ').pop())).join('');
  const podBtns=e.drivers.slice(0,6).map(d=>ob(e.id,e.circuit,d.n+' Podium',d.podium,'f1','pod_'+d.num,d.n.split(' ').pop())).join('');
  const poleBtns=e.drivers.slice(0,6).map(d=>ob(e.id,e.circuit,d.n+' Pole',d.pole,'f1','pole_'+d.num,d.n.split(' ').pop())).join('');
  const flBtns=e.drivers.slice(0,6).map(d=>ob(e.id,e.circuit,d.n+' Fastest Lap',d.fastLap,'f1','fl_'+d.num,d.n.split(' ').pop())).join('');
  const h2hHtml=e.h2h.map(h=>`<div class="os"><div class="ost">${h.team} H2H</div><div class="or">${ob(e.id,e.circuit,h.d1+' beats '+h.d2,h.h1,'f1','h2h_'+h.d1.replace(/ /g,'_'),h.d1.split(' ').pop())+ob(e.id,e.circuit,h.d2+' beats '+h.d1,h.h2,'f1','h2h_'+h.d2.replace(/ /g,'_'),h.d2.split(' ').pop())}</div></div>`).join('');

  const showLid=e.id+'grid';
  const driversHtml=G.showLU[showLid]?`<div style="background:var(--bg3);border-radius:6px;margin-bottom:8px;overflow:hidden">${driverRows}</div>`:'';

  return `<div class="rcard">
    <div class="rchdr">
      <div>
        <div class="rc-ti">🏎️ ${e.circuit}</div>
        <div class="rc-in">${e.drivers.length} drivers${e.isLive?' · Lap '+e.lap+'/'+e.totalLaps:''}</div>
      </div>
      <div style="display:flex;gap:5px;align-items:center">
        <button class="wbtn" onclick="openViewer('${e.id}',event)">▶ Watch</button>
        ${badge}
      </div>
    </div>
    ${e.isLive?`<div style="padding:6px 10px;background:rgba(225,6,0,.08);border-bottom:1px solid rgba(225,6,0,.2);display:flex;gap:10px;align-items:center"><span class="lbdg">LAP ${e.lap}/${e.totalLaps}</span><span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700">P1: ${e.leader}</span></div>`:''}
    <div style="padding:6px 10px 4px">
      <button class="lu-btn" onclick="toggleLU('${showLid}')">${G.showLU[showLid]?'▲ Hide grid':'▼ Starting grid'}</button>
    </div>
    ${driversHtml}
    <div style="padding:4px 10px 10px">
      ${os('Race Winner',winBtns)}
      ${os('Podium Finish (Top 3)',podBtns)}
      ${os('Pole Position',poleBtns)}
      ${os('Fastest Lap',flBtns)}
      ${h2hHtml}
      ${os('Safety Car',ob(e.id,e.circuit,'Safety Car Yes',e.safetyCarO,'f1','sc_y','Yes')+ob(e.id,e.circuit,'No Safety Car',e.noSCO,'f1','sc_n','No'))}
      ${os('Race Incidents',ob(e.id,e.circuit,'DNF Occurs',e.dnfO,'f1','dnf','DNF')+ob(e.id,e.circuit,'Red Flag',e.redFlagO,'f1','redflag','Red Flag'))}
    </div>
  </div>`;
}

  // Odds sections
  const winBtns=e.drivers.slice(0,6).map(d=>ob(e.id,e.circuit,d.n+' Race Win',d.raceWin,'f1','win_'+d.num,d.n.split(' ').pop())).join('');
  const podBtns=e.drivers.slice(0,6).map(d=>ob(e.id,e.circuit,d.n+' Podium',d.podium,'f1','pod_'+d.num,d.n.split(' ').pop())).join('');
  const poleBtns=e.drivers.slice(0,6).map(d=>ob(e.id,e.circuit,d.n+' Pole',d.pole,'f1','pole_'+d.num,d.n.split(' ').pop())).join('');
  const flBtns=e.drivers.slice(0,6).map(d=>ob(e.id,e.circuit,d.n+' Fastest Lap',d.fastLap,'f1','fl_'+d.num,d.n.split(' ').pop())).join('');
  const h2hHtml=e.h2h.map(h=>`<div class="os"><div class="ost">${h.team} H2H</div><div class="or">${ob(e.id,e.circuit,h.d1+' beats '+h.d2,h.h1,'f1','h2h_'+h.d1.replace(/ /g,'_'),h.d1.split(' ').pop())+ob(e.id,e.circuit,h.d2+' beats '+h.d1,h.h2,'f1','h2h_'+h.d2.replace(/ /g,'_'),h.d2.split(' ').pop())}</div></div>`).join('');

  const showLid=e.id+'grid';
  const driversHtml=G.showLU[showLid]?`<div style="background:var(--bg3);border-radius:6px;margin-bottom:8px;overflow:hidden">${driverRows}</div>`:'';

  return `<div class="rcard">
    <div class="rchdr">
      <div>
        <div class="rc-ti">🏎️ ${e.circuit}</div>
        <div class="rc-in">${e.drivers.length} drivers${e.isLive?' · Lap '+e.lap+'/'+e.totalLaps:''}</div>
      </div>
      <div style="display:flex;gap:5px;align-items:center">
        ${e.isLive?`<button class="wbtn" onclick="openViewer('${e.id}',event)">▶ Watch</button>`:''}
        ${badge}
      </div>
    </div>
    ${e.isLive?`<div style="padding:6px 10px;background:rgba(225,6,0,.08);border-bottom:1px solid rgba(225,6,0,.2);display:flex;gap:10px;align-items:center"><span class="lbdg">LAP ${e.lap}/${e.totalLaps}</span><span style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700">P1: ${e.leader}</span></div>`:''}
    <div style="padding:6px 10px 4px">
      <button class="lu-btn" onclick="toggleLU('${showLid}')">${G.showLU[showLid]?'▲ Hide grid':'▼ Starting grid'}</button>
    </div>
    ${driversHtml}
    <div style="padding:4px 10px 10px">
      ${os('Race Winner',winBtns)}
      ${os('Podium Finish (Top 3)',podBtns)}
      ${os('Pole Position',poleBtns)}
      ${os('Fastest Lap',flBtns)}
      ${h2hHtml}
      ${os('Safety Car',ob(e.id,e.circuit,'Safety Car Yes',e.safetyCarO,'f1','sc_y','Yes')+ob(e.id,e.circuit,'No Safety Car',e.noSCO,'f1','sc_n','No'))}
      ${os('Race Incidents',ob(e.id,e.circuit,'DNF Occurs',e.dnfO,'f1','dnf','DNF')+ob(e.id,e.circuit,'Red Flag',e.redFlagO,'f1','redflag','Red Flag'))}
    </div>
  </div>`;
}
