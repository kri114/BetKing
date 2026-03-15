// ==================== LIVE VIEWER ====================
let vInt=null,vSt={shots:[0,0],fouls:[0,0],corners:[0,0],poss:[50,50]};
let cLog=[],rProg={};
let vP=[],vBall={x:.5,y:.5},goalFlash=false,goalT=null;

// F1 team colours (also in render.js — kept in sync)
const F1_TEAM_COLORS_V={'Red Bull':'#1E41FF','McLaren':'#FF8000','Ferrari':'#E8002D','Mercedes':'#27F4D2','Aston Martin':'#229971','Alpine':'#0093CC','Williams':'#64C4FF','Racing Bulls':'#6692FF','Haas':'#B6BABD','Sauber':'#52E252'};

const FCOMM=['Salah with the run — cross comes in!','Van Dijk clears his lines','Bellingham drops deep','Mbappé leaves the defender!','Vinicius — goal attempt wide!','Kane heads over from the corner','Free kick — wall forms','Keeper comes for the cross','VAR reviewing for offside','Shot saved — corner kick!','Penalty appeal — waved away!','Great skill through midfield','Pick-pocket tackle wins possession back'];
const BCOMM=['SGA to the rim — and-one!','Curry hits from the logo!','Dončić — step-back three!','LeBron with the alley-oop!','Jokić finds the open man!','Edwards hammers the dunk!','Tatum — mid-range is good!'];
const RCOMM=['Leader pulling away!','Jostling on the inside rail','Dark horse making a move!','Tight finish developing','Final furlong — all out!','Favourite in trouble!'];
const MCOMM=['Jab lands clean!','Takedown stuffed!','Body shot hurts!','Clinch — knee to body','Head kick attempt!','Ground and pound!','Choke attempt!','Counter right hook!'];

function addC(min,text){cLog.unshift({min,text});if(cLog.length>10)cLog.pop();}

function initVP(ev){
  vP=[];
  if(ev.sport==='football'){
    ev.hLU.players.forEach(p=>{const x=p.x*.46+.04,y=p.y;vP.push({x,y,tx:x,ty:y,c:SQ[ev.home]?.c||'#4FC3F7',team:0,name:p.name.split(' ').pop(),num:p.num,pos:p.pos});});
    ev.aLU.players.forEach(p=>{const x=(1-p.x)*.46+.5,y=p.y;vP.push({x,y,tx:x,ty:y,c:SQ[ev.away]?.c||'#EF9A9A',team:1,name:p.name.split(' ').pop(),num:p.num,pos:p.pos});});
  } else if(ev.sport==='basketball'){
    const bpos=[[.15,.5],[.25,.28],[.25,.72],[.42,.18],[.42,.82]];
    ev.hLU.forEach((p,i)=>{const pos=bpos[i]||[.25,.5];vP.push({x:pos[0],y:pos[1],tx:pos[0],ty:pos[1],c:'#FFA726',team:0,name:p.name.split(' ').pop()});});
    ev.aLU.forEach((p,i)=>{const pos=bpos[i]||[.75,.5];vP.push({x:1-pos[0],y:pos[1],tx:1-pos[0],ty:pos[1],c:'#CE93D8',team:1,name:p.name.split(' ').pop()});});
  } else if(ev.sport==='mma'){
    vP=[{x:.3,y:.5,tx:.3,ty:.5,c:'#4FC3F7',name:ev.f1.split(' ').pop()},{x:.7,y:.5,tx:.7,ty:.5,c:'#EF9A9A',name:ev.f2.split(' ').pop()}];
  } else if(ev.sport==='tennis'){
    vP=[{x:.25,y:.5,tx:.25,ty:.5,c:'#4FC3F7',name:ev.p1.split(' ').pop()},{x:.75,y:.5,tx:.75,ty:.5,c:'#EF9A9A',name:ev.p2.split(' ').pop()}];
  } else if(ev.sport==='cricket'){
    vP=[
      {x:.3,y:.45,tx:.3,ty:.45,c:'#FFA726',name:'Bat',team:0},{x:.3,y:.55,tx:.3,ty:.55,c:'#FFA726',name:'Non-str',team:0},
      {x:.6,y:.5,tx:.6,ty:.5,c:'#CE93D8',name:'Bowl',team:1},{x:.55,y:.35,tx:.55,ty:.35,c:'#CE93D8',name:'Slip',team:1},
      {x:.55,y:.65,tx:.55,ty:.65,c:'#CE93D8',name:'Gully',team:1},{x:.8,y:.4,tx:.8,ty:.4,c:'#CE93D8',name:'Mid-on',team:1},
      {x:.8,y:.6,tx:.8,ty:.6,c:'#CE93D8',name:'Mid-off',team:1}
    ];
  } else if(ev.sport==='f1'){
    vP=(ev.drivers||[]).slice(0,10).map((d,i)=>{
      const angle=(i/10)*Math.PI*2 - Math.PI/2;
      const rx=0.38,ry=0.36,cx=0.5,cy=0.5;
      const x=cx+Math.cos(angle)*rx;
      const y=cy+Math.sin(angle)*ry;
      const tc=F1_TEAM_COLORS_V[d.team]||'#888';
      return {x,y,tx:x,ty:y,c:tc,name:d.n.split(' ').pop(),num:d.num,team:i};
    });
  }
  vBall={x:.5,y:.5};
}

function tickV(ev){
  const sp=ev.sport;
  if(sp==='football'&&ev.minute<90){
    ev.minute++;
    vP.forEach(p=>{
      if(Math.random()<.25){p.tx=Math.max(.02,Math.min(.98,p.tx+(Math.random()-.5)*.09));p.ty=Math.max(.04,Math.min(.96,p.ty+(Math.random()-.5)*.08));}
      p.x+=(p.tx-p.x)*.12;p.y+=(p.ty-p.y)*.12;
    });
    const ball=vP[ri(0,vP.length-1)];
    vBall.x+=(ball.x+(Math.random()-.5)*.04-vBall.x)*.3;
    vBall.y+=(ball.y+(Math.random()-.5)*.04-vBall.y)*.3;
    if(Math.random()<.04){
      const sc=Math.random()<(ev.homeOvr/(ev.homeOvr+ev.awayOvr))?.6:.4?0:1;
      if(sc===0)ev.hScore++;else ev.aScore++;
      goalFlash=true;if(goalT)clearTimeout(goalT);goalT=setTimeout(()=>goalFlash=false,1500);
      const scorers=vP.filter(p=>p.team===sc&&p.pos!=='GK');
      const scorer=pick(scorers.length?scorers:vP.filter(p=>p.team===sc));
      addC(ev.minute,`⚽ GOAL! ${scorer.name} scores for ${sc===0?ev.home:ev.away}!`);
      vBall.x=sc===0?.93:.07;vBall.y=.5;
    }
    if(Math.random()<.07)vSt.shots[ri(0,1)]++;
    if(Math.random()<.05)vSt.fouls[ri(0,1)]++;
    if(Math.random()<.04)vSt.corners[ri(0,1)]++;
    vSt.poss[0]=Math.max(30,Math.min(70,vSt.poss[0]+(Math.random()-.5)*3));vSt.poss[1]=100-vSt.poss[0];
    if(Math.random()<.18){const p=pick(vP);addC(ev.minute,p.name+' — '+pick(FCOMM));}
  } else if(sp==='basketball'){
    ev.hScore+=ri(0,3);ev.aScore+=ri(0,3);
    if(Math.random()<.04)ev.quarter=Math.min(4,ev.quarter+1);
    vP.forEach(p=>{if(Math.random()<.5){p.tx=Math.max(.03,Math.min(.97,p.tx+(Math.random()-.5)*.15));p.ty=Math.max(.05,Math.min(.95,p.ty+(Math.random()-.5)*.15));}p.x+=(p.tx-p.x)*.2;p.y+=(p.ty-p.y)*.2;});
    vBall.x=Math.max(.03,Math.min(.97,vBall.x+(Math.random()-.5)*.22));vBall.y=Math.max(.05,Math.min(.95,vBall.y+(Math.random()-.5)*.18));
    if(Math.random()<.15){const p=pick(vP);addC('Q'+ev.quarter,p.name+' — '+pick(BCOMM));}
  } else if(sp==='horses'||sp==='dogs'){
    if(!rProg[ev.id])rProg[ev.id]=ev.runners.map(()=>rnd(0,5));
    rProg[ev.id].forEach((_,i)=>{rProg[ev.id][i]=Math.min(100,rProg[ev.id][i]+rnd(.4,2.8)*(0.7+ev.runners[i].ovr/200));});
    if(Math.random()<.1){const lead=[...rProg[ev.id].keys()].sort((a,b)=>rProg[ev.id][b]-rProg[ev.id][a])[0];addC('—',ev.runners[lead].name+' — '+pick(RCOMM));}
  } else if(sp==='mma'){
    if(ev.round<5&&Math.random()<.025)ev.round++;
    vP.forEach(p=>{
      const opp=vP[1-vP.indexOf(p)];
      const dx=opp.x-p.x,dy=opp.y-p.y,dist=Math.sqrt(dx*dx+dy*dy);
      if(dist>.25){p.tx+=dx*.04;p.ty+=dy*.04;}else{p.tx+=(Math.random()-.5)*.1;p.ty+=(Math.random()-.5)*.1;}
      p.tx=Math.max(.15,Math.min(.85,p.tx));p.ty=Math.max(.15,Math.min(.85,p.ty));
      p.x+=(p.tx-p.x)*.2;p.y+=(p.ty-p.y)*.2;
    });
    if(Math.random()<.2)addC('R'+ev.round,pick(MCOMM));
  } else if(sp==='f1'){
    if(ev.lap<ev.totalLaps)ev.lap++;
    if(!rProg[ev.id])rProg[ev.id]=ev.drivers.map((_,i)=>i*2.2);
    rProg[ev.id].forEach((_,i)=>{
      const speed=rnd(0.8,1.4)*(1-i*0.012);
      rProg[ev.id][i]=Math.min(100,(rProg[ev.id][i]||0)+speed);
    });
    if(Math.random()<.06){
      const sorted=[...rProg[ev.id].keys()].sort((a,b)=>rProg[ev.id][b]-rProg[ev.id][a]);
      const p=ri(0,5),pos=sorted[p],posNext=sorted[p+1];
      if(posNext!==undefined){
        const tmp=rProg[ev.id][pos];rProg[ev.id][pos]=rProg[ev.id][posNext];rProg[ev.id][posNext]=tmp;
        addC('L'+ev.lap,ev.drivers[pos]?.n.split(' ').pop()+' overtakes '+ev.drivers[posNext]?.n.split(' ').pop()+'!');
      }
    }
    const leader=[...rProg[ev.id].keys()].sort((a,b)=>rProg[ev.id][b]-rProg[ev.id][a])[0];
    ev.leader=ev.drivers[leader]?.n||ev.leader;
    if(Math.random()<.08)addC('L'+ev.lap,pick(['Safety car deployed!','DRS enabled!','Fastest lap set!','Pit stop — undercut attempt!','Radio: "push push push!"','Tyre deg increasing','Incredible defending!','Gap closing — DRS zone next']));
  } else if(sp==='tennis'){
    vP.forEach(p=>{
      p.tx=Math.max(.05,Math.min(.95,p.tx+(Math.random()-.5)*.15));
      p.ty=Math.max(.1,Math.min(.9,p.ty+(Math.random()-.5)*.12));
      p.x+=(p.tx-p.x)*.25;p.y+=(p.ty-p.y)*.25;
    });
    vBall.x+=(vP[ri(0,1)].x+(Math.random()-.5)*.1-vBall.x)*.4;
    vBall.y+=(vP[ri(0,1)].y+(Math.random()-.5)*.1-vBall.y)*.4;
    if(Math.random()<.06){
      if(Math.random()<.5)ev.p1Games=(ev.p1Games||0)+1; else ev.p2Games=(ev.p2Games||0)+1;
    }
    if(Math.random()<.12)addC('Set '+(ev.p1Sets+ev.p2Sets+1),pick(['Ace!','Double fault!','Net cord — lucky!','Baseline winner!','Incredible rally!','Serve and volley!','Challenge upheld!','Break point!','Deuce!']));
  } else if(sp==='cricket'){
    vP.forEach(p=>{
      if(Math.random()<.3){p.tx=Math.max(.05,Math.min(.95,p.tx+(Math.random()-.5)*.08));p.ty=Math.max(.05,Math.min(.95,p.ty+(Math.random()-.5)*.08));}
      p.x+=(p.tx-p.x)*.15;p.y+=(p.ty-p.y)*.15;
    });
    if(Math.random()<.08){
      const runs=pick([0,0,1,1,1,2,3,4,4,6]);
      ev.hRuns=(ev.hRuns||0)+runs;
      if(runs===0&&Math.random()<.3)ev.hWkts=(ev.hWkts||0)+1;
      ev.overs=((parseFloat(ev.overs||0)*10+1)/10).toFixed(1);
      addC('Over '+(ev.overs||'1'),runs===6?'SIX!':runs===4?'FOUR!':runs===0&&Math.random()<.3?'WICKET!':runs+' run'+(runs!==1?'s':''));
    }
  }
  drawFrame(ev);
  if(typeof checkRoundEnd==='function')checkRoundEnd(ev.sport);
}

function drawSprite(ctx,px,py,kitColor,name,num){
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(px,py+10,5,2,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=kitColor;ctx.fillRect(px-5,py-1,10,9);
  ctx.fillStyle='#F5CBA7';ctx.beginPath();ctx.arc(px,py-6,4,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#3a2000';ctx.fillRect(px-4,py-10,8,4);
  ctx.fillStyle='rgba(255,255,255,.85)';ctx.font='bold 5px sans-serif';ctx.textAlign='center';ctx.fillText(num||'',px,py+5);
  ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(px-14,py+10,28,9);
  ctx.fillStyle='#fff';ctx.font='5px sans-serif';ctx.textAlign='center';
  ctx.fillText((name||'').substring(0,9),px,py+17);
}

function drawFootballPitch(cv,ev){
  const W=cv.width,H=cv.height,ctx=cv.getContext('2d');
  for(let i=0;i<8;i++){ctx.fillStyle=i%2===0?'#1e6618':'#1a5c14';ctx.fillRect(0,i*H/8,W,H/8);}
  ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=1.5;
  ctx.strokeRect(8,8,W-16,H-16);
  ctx.beginPath();ctx.moveTo(W/2,8);ctx.lineTo(W/2,H-8);ctx.stroke();
  ctx.beginPath();ctx.arc(W/2,H/2,38,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.5)';ctx.beginPath();ctx.arc(W/2,H/2,2.5,0,Math.PI*2);ctx.fill();
  ctx.strokeRect(8,H/2-52,72,104);ctx.strokeRect(8,H/2-28,32,56);
  ctx.strokeRect(W-80,H/2-52,72,104);ctx.strokeRect(W-40,H/2-28,32,56);
  ctx.beginPath();ctx.arc(8+72,H/2,28,Math.PI*.4,Math.PI*1.6,true);ctx.stroke();
  ctx.beginPath();ctx.arc(W-80,H/2,28,-Math.PI*.4,Math.PI*.4);ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.15)';ctx.fillRect(0,H/2-24,8,48);ctx.fillRect(W-8,H/2-24,8,48);
  ctx.strokeStyle='rgba(255,255,255,.6)';ctx.strokeRect(0,H/2-24,8,48);ctx.strokeRect(W-8,H/2-24,8,48);
  if(goalFlash){ctx.fillStyle='rgba(240,180,41,.25)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#F0B429';ctx.font='bold 24px Rajdhani';ctx.textAlign='center';ctx.fillText('⚽ GOAL!',W/2,H/2+8);}
  const sorted=[...vP].sort((a,b)=>a.pos==='GK'?1:b.pos==='GK'?-1:0);
  sorted.forEach(p=>drawSprite(ctx,p.x*W,p.y*H,p.c,p.name,p.num));
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(vBall.x*W,vBall.y*H,4.5,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#555';ctx.lineWidth=.7;ctx.stroke();
  ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(W/2-40,0,80,20);
  ctx.fillStyle='#F0B429';ctx.font='bold 13px Rajdhani';ctx.textAlign='center';ctx.fillText(`${ev.hScore} – ${ev.aScore}`,W/2,14);
  ctx.fillStyle='#8A9BB5';ctx.font='8px DM Sans';ctx.fillText(`${ev.minute}'`,W/2-30,14);
}

function drawBasketballCourt(cv,ev){
  const W=cv.width,H=cv.height,ctx=cv.getContext('2d');
  for(let i=0;i<6;i++){ctx.fillStyle=i%2===0?'#7a3d00':'#6b3500';ctx.fillRect(i*W/6,0,W/6,H);}
  ctx.strokeStyle='rgba(255,200,100,.55)';ctx.lineWidth=1.5;
  ctx.strokeRect(8,8,W-16,H-16);
  ctx.beginPath();ctx.moveTo(W/2,8);ctx.lineTo(W/2,H-8);ctx.stroke();
  ctx.beginPath();ctx.arc(W/2,H/2,32,0,Math.PI*2);ctx.stroke();
  ctx.strokeRect(8,H/2-36,56,72);ctx.strokeRect(W-64,H/2-36,56,72);
  ctx.strokeStyle='rgba(255,150,0,.8)';ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(30,H/2,7,0,Math.PI*2);ctx.stroke();
  ctx.beginPath();ctx.arc(W-30,H/2,7,0,Math.PI*2);ctx.stroke();
  ctx.strokeStyle='rgba(255,200,100,.3)';ctx.lineWidth=1;
  ctx.beginPath();ctx.arc(8,H/2,78,Math.PI*.35,Math.PI*1.65,false);ctx.stroke();
  ctx.beginPath();ctx.arc(W-8,H/2,78,Math.PI*1.35,Math.PI*.35,false);ctx.stroke();
  vP.forEach(p=>drawSprite(ctx,p.x*W,p.y*H,p.c,p.name,null));
  ctx.fillStyle='#FF8C00';ctx.beginPath();ctx.arc(vBall.x*W,vBall.y*H,4.5,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#5a2d00';ctx.lineWidth=.8;ctx.stroke();
  ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(W/2-40,0,80,20);
  ctx.fillStyle='#F0B429';ctx.font='bold 13px Rajdhani';ctx.textAlign='center';ctx.fillText(`${ev.hScore} – ${ev.aScore}`,W/2,14);
  ctx.fillStyle='#8A9BB5';ctx.font='8px DM Sans';ctx.fillText(`Q${ev.quarter}`,W/2-30,14);
}

function drawOctagon(cv,ev){
  const W=cv.width,H=cv.height,ctx=cv.getContext('2d');
  ctx.fillStyle='#1a0600';ctx.fillRect(0,0,W,H);
  const cx=W/2,cy=H/2,r=Math.min(W,H)*.42;
  ctx.fillStyle='#2d1100';ctx.beginPath();
  for(let i=0;i<8;i++){const a=Math.PI/4*i-Math.PI/8;i===0?ctx.moveTo(cx+r*Math.cos(a),cy+r*Math.sin(a)):ctx.lineTo(cx+r*Math.cos(a),cy+r*Math.sin(a));}
  ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(255,80,20,.5)';ctx.lineWidth=2;ctx.stroke();
  vP.forEach(p=>drawSprite(ctx,p.x*W,p.y*H,p.c,p.name,null));
}

function drawRaceTrack(cv,ev){
  const W=cv.width,H=cv.height,ctx=cv.getContext('2d');
  const isH=ev.sport==='horses';
  ctx.fillStyle=isH?'#2d5a1b':'#1a1a2e';ctx.fillRect(0,0,W,H);
  if(!rProg[ev.id])rProg[ev.id]=ev.runners.map(()=>0);
  const rp=rProg[ev.id],n=ev.runners.length,lH=(H-20)/n;
  const sorted=[...rp.keys()].sort((a,b)=>rp[b]-rp[a]);
  ev.runners.forEach((r,i)=>{
    const ly=10+i*lH;
    ctx.fillStyle=i%2===0?'rgba(255,255,255,.03)':'rgba(0,0,0,.08)';ctx.fillRect(0,ly,W,lH);
    ctx.fillStyle=RCOLS[i%RCOLS.length]+'44';ctx.fillRect(0,ly,W*rp[i]/100,lH);
    const rx=(rp[i]/100)*(W-40)+20,ry=ly+lH/2;
    if(isH){
      ctx.fillStyle=RCOLS[i%RCOLS.length];ctx.fillRect(rx-9,ry-3,18,6);ctx.fillRect(rx-4,ry-8,5,5);
      ctx.fillStyle='#F5CBA7';ctx.fillRect(rx-3,ry-7,4,4);
      ctx.fillStyle='#222';ctx.fillRect(rx-11,ry+3,3,5);ctx.fillRect(rx-5,ry+3,3,5);ctx.fillRect(rx+2,ry+3,3,5);ctx.fillRect(rx+8,ry+3,3,5);
    } else {
      ctx.fillStyle=RCOLS[i%RCOLS.length];ctx.fillRect(rx-6,ry-3,12,6);
      ctx.fillStyle='#F5CBA7';ctx.beginPath();ctx.arc(rx,ry-7,3,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#222';ctx.fillRect(rx-8,ry,3,5);ctx.fillRect(rx+5,ry,3,5);
    }
    const rank=sorted.indexOf(i)+1;
    ctx.fillStyle='rgba(0,0,0,.65)';ctx.fillRect(rx-8,ry-17,16,12);
    ctx.fillStyle=rank===1?'#FFD700':'#fff';ctx.font='bold 8px Rajdhani';ctx.textAlign='center';ctx.fillText('#'+rank,rx,ry-8);
    ctx.fillStyle='rgba(255,255,255,.65)';ctx.font='7px DM Sans';ctx.textAlign='left';ctx.fillText(r.name.substring(0,14),4,ry+4);
  });
  ctx.strokeStyle='rgba(255,255,255,.4)';ctx.lineWidth=2;ctx.setLineDash([4,4]);
  ctx.beginPath();ctx.moveTo(W-18,10);ctx.lineTo(W-18,H-10);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(W/2-55,0,110,14);
  ctx.fillStyle='#F0B429';ctx.font='bold 9px Rajdhani';ctx.textAlign='center';
  ctx.fillText('LEADER: '+(ev.runners[sorted[0]]?.name.substring(0,12)||'—'),W/2,11);
}

function drawF1Track(cv,ev){
  const W=cv.width,H=cv.height,ctx=cv.getContext('2d');
  ctx.fillStyle='#0d0d0d';ctx.fillRect(0,0,W,H);
  const cx=W/2,cy=H/2,rx=W*.38,ry=H*.36;
  ctx.strokeStyle='rgba(255,255,255,.06)';ctx.lineWidth=28;ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.stroke();
  ctx.strokeStyle='#2a2a2a';ctx.lineWidth=22;ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,.25)';ctx.lineWidth=1;ctx.setLineDash([8,8]);
  ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='#fff';ctx.fillRect(cx+rx-14,cy-12,4,24);
  ctx.fillStyle='#E10600';ctx.fillRect(cx+rx-10,cy-12,4,24);
  if(!rProg[ev.id])rProg[ev.id]=ev.drivers.map((_,i)=>i*2.5);
  const sorted=[...rProg[ev.id].keys()].sort((a,b)=>rProg[ev.id][b]-rProg[ev.id][a]);
  ev.drivers.forEach((d,i)=>{
    const progress=(rProg[ev.id][i]||0)/100;
    const angle=progress*Math.PI*2 - Math.PI/2;
    const px=cx+Math.cos(angle)*rx;
    const py=cy+Math.sin(angle)*ry;
    const tc=F1_TEAM_COLORS_V[d.team]||'#888';
    const rank=sorted.indexOf(i)+1;
    ctx.save();ctx.translate(px,py);
    const nextAngle=angle+0.05;
    const tx=cx+Math.cos(nextAngle)*rx,ty=cy+Math.sin(nextAngle)*ry;
    ctx.rotate(Math.atan2(ty-py,tx-px));
    ctx.fillStyle=tc;ctx.fillRect(-8,-3,16,6);
    ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(-2,-2,5,4);
    ctx.fillStyle='#111';ctx.fillRect(-9,-5,3,3);ctx.fillRect(6,-5,3,3);ctx.fillRect(-9,2,3,3);ctx.fillRect(6,2,3,3);
    ctx.restore();
    if(rank<=5){
      ctx.fillStyle='rgba(0,0,0,.75)';ctx.fillRect(px-12,py-20,24,13);
      ctx.fillStyle=rank===1?'#FFD700':'#fff';ctx.font='bold 8px Rajdhani';ctx.textAlign='center';
      ctx.fillText('P'+rank+' '+d.n.split(' ').pop().substring(0,5),px,py-10);
    }
  });
  ctx.fillStyle='rgba(0,0,0,.8)';ctx.fillRect(0,0,W,18);
  ctx.fillStyle='#E10600';ctx.font='bold 11px Rajdhani';ctx.textAlign='left';ctx.fillText('🏎️ F1 LIVE',6,13);
  ctx.fillStyle='#F0B429';ctx.textAlign='center';ctx.fillText('LAP '+ev.lap+'/'+ev.totalLaps,W/2,13);
  ctx.fillStyle='#fff';ctx.textAlign='right';ctx.fillText('P1: '+(ev.leader||'—'),W-6,13);
}

function drawTennisCourt(cv,ev){
  const W=cv.width,H=cv.height,ctx=cv.getContext('2d');
  ctx.fillStyle='#2565a3';ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=2;
  const mx=W*.12,my=H*.1,cw=W*.76,ch=H*.8;
  ctx.strokeRect(mx,my,cw,ch);
  ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(mx,H/2);ctx.lineTo(mx+cw,H/2);ctx.stroke();
  ctx.lineWidth=1.5;ctx.strokeStyle='rgba(255,255,255,.6)';
  ctx.beginPath();ctx.moveTo(W/2,my);ctx.lineTo(W/2,H/2);ctx.stroke();
  ctx.beginPath();ctx.moveTo(W/2,H/2);ctx.lineTo(W/2,my+ch);ctx.stroke();
  const sy=my+ch*.25;
  ctx.beginPath();ctx.moveTo(mx,sy);ctx.lineTo(mx+cw,sy);ctx.stroke();
  const sy2=my+ch*.75;
  ctx.beginPath();ctx.moveTo(mx,sy2);ctx.lineTo(mx+cw,sy2);ctx.stroke();
  vP.forEach((p,i)=>{
    const px=p.x*W,py=p.y*H;
    ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(px,py+8,5,2,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(px,py-5,8,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#F5CBA7';ctx.beginPath();ctx.arc(px,py-14,5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(px-18,py+10,36,12);
    ctx.fillStyle='#fff';ctx.font='bold 8px Rajdhani';ctx.textAlign='center';
    ctx.fillText(p.name.substring(0,10),px,py+20);
  });
  ctx.fillStyle='#ccff00';ctx.beginPath();ctx.arc(vBall.x*W,vBall.y*H,5,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,.4)';ctx.lineWidth=1;ctx.stroke();
  ctx.fillStyle='rgba(0,0,0,.75)';ctx.fillRect(0,0,W,20);
  ctx.fillStyle='#4FC3F7';ctx.font='bold 10px Rajdhani';ctx.textAlign='left';ctx.fillText(ev.p1.split(' ').pop(),6,14);
  ctx.fillStyle='#fff';ctx.textAlign='center';ctx.fillText(`${ev.p1Sets||0} – ${ev.p2Sets||0}  Sets`,W/2,14);
  ctx.fillStyle='#EF9A9A';ctx.textAlign='right';ctx.fillText(ev.p2.split(' ').pop(),W-6,14);
}

function drawCricketPitch(cv,ev){
  const W=cv.width,H=cv.height,ctx=cv.getContext('2d');
  ctx.fillStyle='#2d7a2d';ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=2;
  ctx.beginPath();ctx.ellipse(W/2,H/2,W*.44,H*.44,0,0,Math.PI*2);ctx.stroke();
  const px=W/2-18,py=H/2-60,pw=36,ph=120;
  ctx.fillStyle='#c8a865';ctx.fillRect(px,py,pw,ph);
  ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=1.5;
  ctx.strokeRect(px,py,pw,ph);
  ctx.beginPath();ctx.moveTo(px-8,py+20);ctx.lineTo(px+pw+8,py+20);ctx.stroke();
  ctx.beginPath();ctx.moveTo(px-8,py+ph-20);ctx.lineTo(px+pw+8,py+ph-20);ctx.stroke();
  [-6,0,6].forEach(ox=>{
    ctx.fillStyle='#fff';ctx.fillRect(W/2+ox-1,py+10,2,10);
    ctx.fillRect(W/2+ox-1,py+ph-20,2,10);
  });
  vP.forEach(p=>{
    const ppx=p.x*W,ppy=p.y*H;
    ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(ppx,ppy+7,4,2,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=p.c||'#FFA726';ctx.fillRect(ppx-5,ppy-2,10,9);
    ctx.fillStyle='#F5CBA7';ctx.beginPath();ctx.arc(ppx,ppy-8,4,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(0,0,0,.65)';ctx.fillRect(ppx-14,ppy+8,28,10);
    ctx.fillStyle='#fff';ctx.font='6px DM Sans';ctx.textAlign='center';ctx.fillText((p.name||'').substring(0,8),ppx,ppy+16);
  });
  ctx.fillStyle='#cc2200';ctx.beginPath();ctx.arc(vBall.x*W,vBall.y*H,4,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#880000';ctx.lineWidth=1;ctx.stroke();
  ctx.fillStyle='rgba(0,0,0,.75)';ctx.fillRect(0,0,W,20);
  ctx.fillStyle='#FFA726';ctx.font='bold 10px Rajdhani';ctx.textAlign='left';
  ctx.fillText(`${ev.home}: ${ev.hRuns||0}/${ev.hWkts||0}`,6,14);
  ctx.fillStyle='#fff';ctx.textAlign='center';ctx.fillText(`${ev.overs||'0.0'} overs`,W/2,14);
  ctx.fillStyle='#CE93D8';ctx.textAlign='right';ctx.fillText(ev.away,W-6,14);
}

function drawFrame(ev){
  const cv=document.getElementById('vcv');if(!cv)return;
  const sp=ev.sport;
  if(sp==='football')drawFootballPitch(cv,ev);
  else if(sp==='basketball')drawBasketballCourt(cv,ev);
  else if(sp==='horses'||sp==='dogs')drawRaceTrack(cv,ev);
  else if(sp==='mma')drawOctagon(cv,ev);
  else if(sp==='f1')drawF1Track(cv,ev);
  else if(sp==='tennis')drawTennisCourt(cv,ev);
  else if(sp==='cricket')drawCricketPitch(cv,ev);
  const cm=document.getElementById('vcomm');
  if(cm)cm.innerHTML=`<div class="cmt-ti">Commentary</div>${cLog.slice(0,7).map(c=>`<div class="cline"><span class="cmin">${c.min}</span><span>${c.text}</span></div>`).join('')}`;
  if(sp==='football'){
    const p0=Math.round(vSt.poss[0]);
    const upd=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
    upd('sp0',p0+'%');upd('sp1',(100-p0)+'%');
    upd('ss0',vSt.shots[0]);upd('ss1',vSt.shots[1]);
    upd('sc0',vSt.corners[0]);upd('sc1',vSt.corners[1]);
    upd('sf0',vSt.fouls[0]);upd('sf1',vSt.fouls[1]);
    const b=document.getElementById('spbar');if(b)b.style.width=p0+'%';
  }
  const vsc=document.getElementById('vscore');
  if(vsc){
    if(sp==='football')vsc.innerHTML=`<div class="vteams"><div class="vt">${ev.home}</div><div class="vsl">${ev.hScore} – ${ev.aScore}</div><div class="vt r">${ev.away}</div></div><div class="vmin">${ev.minute}' · ${ev.league}</div>`;
    else if(sp==='basketball')vsc.innerHTML=`<div class="vteams"><div class="vt">${ev.home}</div><div class="vsl">${ev.hScore} – ${ev.aScore}</div><div class="vt r">${ev.away}</div></div><div class="vmin">Q${ev.quarter} · ${ev.league}</div>`;
    else if(sp==='mma')vsc.innerHTML=`<div class="vteams"><div class="vt">${ev.f1}</div><div class="vsl" style="font-size:28px;color:var(--red)">R${ev.round}</div><div class="vt r">${ev.f2}</div></div><div class="vmin">Round ${ev.round} · ${ev.event}</div>`;
    else if(sp==='f1')vsc.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700">P1: ${ev.leader||'—'}</div><div style="font-size:10px;color:var(--txt2)">${ev.circuit}</div></div><div style="font-family:'Rajdhani',sans-serif;font-size:22px;font-weight:700;color:#E10600">LAP ${ev.lap}/${ev.totalLaps}</div></div>`;
    else if(sp==='tennis')vsc.innerHTML=`<div class="vteams"><div class="vt">${ev.p1}</div><div class="vsl">${ev.p1Sets||0} – ${ev.p2Sets||0}</div><div class="vt r">${ev.p2}</div></div><div class="vmin">Sets · ${ev.tournament}</div>`;
    else if(sp==='cricket')vsc.innerHTML=`<div class="vteams"><div class="vt">${ev.home}</div><div class="vsl" style="font-size:16px">${ev.hRuns||0}/${ev.hWkts||0}</div><div class="vt r">${ev.away}</div></div><div class="vmin">${ev.overs||'0.0'} overs · ${ev.format}</div>`;
  }
}

function openViewer(eid,e){
  if(e)e.stopPropagation();
  // F1 first to avoid ID conflicts with football (both use f1_ prefix)
  const all=[...(G.evts.f1||[]),...G.evts.football,...G.evts.basketball,...G.evts.horses,...G.evts.dogs,...G.evts.mma,...(G.evts.tennis||[]),...(G.evts.cricket||[])];
  const ev=all.find(x=>x.id===eid);if(!ev)return;
  vSt={shots:[0,0],fouls:[0,0],corners:[0,0],poss:[50,50]};cLog=[];
  initVP(ev);
  const sp=ev.sport;
  const isTeam=sp==='football'||sp==='basketball';
  const isRace=sp==='horses'||sp==='dogs';
  const isMMA=sp==='mma';
  const isF1=sp==='f1';
  const isTennis=sp==='tennis';
  const isCricket=sp==='cricket';
  const cvH=sp==='football'?330:sp==='basketball'?280:isRace?220:isF1||isTennis||isCricket?240:260;
  const title=isTeam?`${sp==='football'?'⚽':'🏀'} ${ev.home} vs ${ev.away}`:isMMA?`🥊 ${ev.f1} vs ${ev.f2}`:isF1?`🏎️ ${ev.circuit}`:isTennis?`🎾 ${ev.p1} vs ${ev.p2}`:isCricket?`🏏 ${ev.home} vs ${ev.away}`:`${sp==='horses'?'🐎':'🐕'} ${ev.title}`;
  const scoreHtml=isTeam?`<div class="vsc" id="vscore"><div class="vteams"><div class="vt">${ev.home}</div><div class="vsl">${ev.hScore} – ${ev.aScore}</div><div class="vt r">${ev.away}</div></div><div class="vmin">${sp==='football'?ev.minute+"' · "+ev.league:'Q'+ev.quarter+' · '+ev.league}</div></div>`:isMMA?`<div class="vsc" id="vscore"><div class="vteams"><div class="vt">${ev.f1}</div><div class="vsl" style="font-size:28px;color:var(--red)">R${ev.round}</div><div class="vt r">${ev.f2}</div></div><div class="vmin">Round ${ev.round} · ${ev.event}</div></div>`:isF1?`<div class="vsc" id="vscore"><div style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700">P1: ${ev.leader||'—'}</div><div style="font-size:10px;color:var(--txt2)">${ev.circuit}</div></div><div style="font-family:'Rajdhani',sans-serif;font-size:22px;font-weight:700;color:#E10600">LAP ${ev.lap}/${ev.totalLaps}</div></div></div>`:isTennis?`<div class="vsc" id="vscore"><div class="vteams"><div class="vt">${ev.p1}</div><div class="vsl">${ev.p1Sets||0} – ${ev.p2Sets||0}</div><div class="vt r">${ev.p2}</div></div><div class="vmin">Sets · ${ev.tournament}</div></div>`:isCricket?`<div class="vsc" id="vscore"><div class="vteams"><div class="vt">${ev.home}</div><div class="vsl" style="font-size:16px">${ev.hRuns||0}/${ev.hWkts||0}</div><div class="vt r">${ev.away}</div></div><div class="vmin">${ev.overs||'0.0'} overs · ${ev.format}</div></div>`:'';
  const statsHtml=sp==='football'?`<div style="padding:6px 16px 2px">
    <div class="stats-row"><div class="stat-v" id="sp0" style="text-align:right">50%</div><div class="stat-n">Possession</div><div class="stat-v" id="sp1">50%</div></div>
    <div class="stats-row"><div><div class="stat-bar-w"><div class="stat-bar-f" id="spbar" style="width:50%;background:var(--blu)"></div></div></div><div></div><div></div></div>
    <div class="stats-row"><div class="stat-v" id="ss0" style="text-align:right">0</div><div class="stat-n">Shots</div><div class="stat-v" id="ss1">0</div></div>
    <div class="stats-row"><div class="stat-v" id="sc0" style="text-align:right">0</div><div class="stat-n">Corners</div><div class="stat-v" id="sc1">0</div></div>
    <div class="stats-row"><div class="stat-v" id="sf0" style="text-align:right">0</div><div class="stat-n">Fouls</div><div class="stat-v" id="sf1">0</div></div>
  </div>`:'';
  document.getElementById('vpan').innerHTML=`
    <div class="vhdr">${title}<button class="cbtn" onclick="closeViewer()">×</button></div>
    ${scoreHtml}
    <div class="pitch-wrap"><canvas id="vcv" width="560" height="${cvH}"></canvas></div>
    ${statsHtml}
    <div class="cmtbox" id="vcomm"><div class="cmt-ti">Commentary</div></div>`;
  document.getElementById('vov').classList.remove('hidden');
  drawFrame(ev);
  if(vInt)clearInterval(vInt);
  vInt=setInterval(()=>tickV(ev),600);
}
function closeViewer(){document.getElementById('vov').classList.add('hidden');if(vInt)clearInterval(vInt);vInt=null;}
