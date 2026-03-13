// ==================== GENERATE ====================
function genOdds(ho,ao){
  const dr=parseFloat(Math.max(2.4,Math.min(4.5,((ho+ao)/2)*0.85)).toFixed(2));
  return {home:ho,draw:dr,away:ao,
    ah05h:parseFloat((ho*.94).toFixed(2)),ah05a:parseFloat((ao*.94).toFixed(2)),
    ah15h:parseFloat((ho*.78).toFixed(2)),ah15a:parseFloat((ao*.78).toFixed(2)),
    o25:parseFloat(rnd(1.6,2.2).toFixed(2)),u25:parseFloat(rnd(1.6,2.2).toFixed(2)),
    o35:parseFloat(rnd(2.0,3.5).toFixed(2)),u35:parseFloat(rnd(1.3,1.7).toFixed(2)),
    o45:parseFloat(rnd(3.5,6).toFixed(2)),u45:parseFloat(rnd(1.1,1.4).toFixed(2)),
    bttsY:parseFloat(rnd(1.7,2.4).toFixed(2)),bttsN:parseFloat(rnd(1.5,2.0).toFixed(2)),
    cs00:parseFloat(rnd(6,12).toFixed(2)),cs10:parseFloat(rnd(5,9).toFixed(2)),cs20:parseFloat(rnd(6,11).toFixed(2)),
    cs01:parseFloat(rnd(5,9).toFixed(2)),cs11:parseFloat(rnd(6,11).toFixed(2)),cs21:parseFloat(rnd(7,14).toFixed(2)),
    cs12:parseFloat(rnd(7,14).toFixed(2)),cs22:parseFloat(rnd(10,18).toFixed(2)),cs31:parseFloat(rnd(12,22).toFixed(2)),
    hth:parseFloat(rnd(2.5,4.5).toFixed(2)),htd:parseFloat(rnd(1.8,3.0).toFixed(2)),hta:parseFloat(rnd(2.5,4.5).toFixed(2)),
    htfthh:parseFloat(rnd(3,6).toFixed(2)),htfthd:parseFloat(rnd(6,12).toFixed(2)),htftdh:parseFloat(rnd(4,8).toFixed(2)),
    htftdd:parseFloat(rnd(8,16).toFixed(2)),htftah:parseFloat(rnd(6,14).toFixed(2)),htftaa:parseFloat(rnd(3,6).toFixed(2)),
    hfg:parseFloat(rnd(1.8,2.8).toFixed(2)),afg:parseFloat(rnd(1.8,2.8).toFixed(2)),nfg:parseFloat(rnd(5,9).toFixed(2)),
    hcard:parseFloat(rnd(2.5,4.5).toFixed(2)),acard:parseFloat(rnd(2.5,4.5).toFixed(2)),c35:parseFloat(rnd(1.6,2.4).toFixed(2)),
    hcorn:parseFloat(rnd(1.7,3.2).toFixed(2)),acorn:parseFloat(rnd(1.7,3.2).toFixed(2)),
    hw0:parseFloat(rnd(3.5,7).toFixed(2)),aw0:parseFloat(rnd(3.5,7).toFixed(2)),
    hpen:parseFloat(rnd(3,6).toFixed(2)),apen:parseFloat(rnd(3,6).toFixed(2)),et:parseFloat(rnd(4,8).toFixed(2))
  };
}

function genFootball(){
  G.evts.football=[];
  Object.keys(LEAGUES).forEach((lg,lgi)=>{
    const teams=shuf(LEAGUES[lg].teams);
    const n=Math.min(Math.floor(teams.length/2),4);
    for(let i=0;i<n*2;i+=2){
      const h=teams[i],a=teams[i+1];
      if(!h||!a||h.n===a.n)continue;
      const ho=odds(h.o,a.o),ao=odds(a.o,h.o);
      const isLive=lgi<4&&i===0;
      const hLU=getLU(h.n)||{f:'4-3-3',players:Array.from({length:11},(_,j)=>({name:'Player '+(j+1),pos:'—',num:j+1,ovr:75,x:.5,y:.1+j*.08}))};
      const aLU=getLU(a.n)||{f:'4-3-3',players:Array.from({length:11},(_,j)=>({name:'Player '+(j+1),pos:'—',num:j+1,ovr:75,x:.5,y:.1+j*.08}))};
      // Generate player props for top players
      const hProps = genPlayerProps(hLU.players, h.n);
      const aProps = genPlayerProps(aLU.players, a.n);
      G.evts.football.push({id:'f'+lgi+'_'+i,sport:'football',league:lg,home:h.n,homeOvr:h.o,away:a.n,awayOvr:a.o,hLU,aLU,hProps,aProps,odds:genOdds(ho,ao),isLive,minute:isLive?ri(15,80):0,hScore:isLive?ri(0,2):0,aScore:isLive?ri(0,2):0,startTime:isLive?'LIVE':ri(1,10)+'h'});
    }
  });
}

function genPlayerProps(players, teamName) {
  // generate props for forwards/attackers and midfielders
  const attackers = players.filter(p => ['ST','CF','LW','RW','CAM','RAM','LAM','AM'].includes(p.pos));
  return attackers.slice(0,3).map(p => ({
    name: p.name,
    pos: p.pos,
    ovr: p.ovr,
    anytime: parseFloat(rnd(1.8, 5.5).toFixed(2)),
    first: parseFloat(rnd(5, 12).toFixed(2)),
    assist: parseFloat(rnd(2.5, 5.5).toFixed(2)),
    shots2: parseFloat(rnd(1.5, 2.8).toFixed(2)),
    shots3: parseFloat(rnd(2.2, 4.5).toFixed(2)),
    card: parseFloat(rnd(4, 9).toFixed(2)),
  }));
}



function genBasketball(){
  G.evts.basketball=[];
  const pool=shuf(NBA_TEAMS);
  for(let i=0;i<Math.min(pool.length-1,16);i+=2){
    const h=pool[i],a=pool[i+1];
    const ho=odds(h.o,a.o),ao=odds(a.o,h.o);
    const spr=parseFloat(Math.abs(h.o-a.o)*.45).toFixed(1);
    const isLive=i<4;
    const hLU=getBLU(h.n), aLU=getBLU(a.n);
    // Player props
    const hProps = hLU.map(p=>({name:p.name,pos:p.pos,pts20:parseFloat(rnd(1.5,3).toFixed(2)),pts25:parseFloat(rnd(2.5,5.5).toFixed(2)),reb8:parseFloat(rnd(1.6,3.5).toFixed(2)),ast6:parseFloat(rnd(1.7,4).toFixed(2)),dbl:parseFloat(rnd(2.5,5).toFixed(2))}));
    const aProps = aLU.map(p=>({name:p.name,pos:p.pos,pts20:parseFloat(rnd(1.5,3).toFixed(2)),pts25:parseFloat(rnd(2.5,5.5).toFixed(2)),reb8:parseFloat(rnd(1.6,3.5).toFixed(2)),ast6:parseFloat(rnd(1.7,4).toFixed(2)),dbl:parseFloat(rnd(2.5,5).toFixed(2))}));
    G.evts.basketball.push({
      id:'b'+i,sport:'basketball',league:pick(NBALEAGUE),
      home:h.n,homeOvr:h.o,away:a.n,awayOvr:a.o,
      hLU,aLU,hProps,aProps,spread:spr,
      odds:{home:ho,away:ao,hSpr:parseFloat((ho*.93).toFixed(2)),aSpr:parseFloat((ao*.93).toFixed(2)),
        o215:parseFloat(rnd(1.8,2.2).toFixed(2)),u215:parseFloat(rnd(1.8,2.2).toFixed(2)),
        o225:parseFloat(rnd(1.8,2.2).toFixed(2)),u225:parseFloat(rnd(1.8,2.2).toFixed(2)),
        o235:parseFloat(rnd(1.8,2.2).toFixed(2)),u235:parseFloat(rnd(1.8,2.2).toFixed(2)),
        hQ1:parseFloat(rnd(1.8,2.2).toFixed(2)),aQ1:parseFloat(rnd(1.8,2.2).toFixed(2)),
        hHT:parseFloat(rnd(1.7,2.3).toFixed(2)),aHT:parseFloat(rnd(1.7,2.3).toFixed(2)),
        m5:parseFloat(rnd(3.5,5.5).toFixed(2)),m10:parseFloat(rnd(2.5,4).toFixed(2)),m15:parseFloat(rnd(2,3.5).toFixed(2)),
        ot:parseFloat(rnd(4,7).toFixed(2)),noOt:parseFloat(rnd(1.1,1.4).toFixed(2))},
      isLive,hScore:isLive?ri(50,100):0,aScore:isLive?ri(50,100):0,quarter:isLive?ri(1,4):0,startTime:isLive?'LIVE':ri(1,8)+'h'
    });
  }
}

function genRaces(type){
  G.evts[type]=[];
  const names=type==='horses'?HORSES:DOGS,races=type==='horses'?HRACE:DRACE;
  for(let r=0;r<4;r++){
    const n=type==='horses'?ri(6,10):6;
    const runners=shuf(names).slice(0,n).map((nm,i)=>{
      const ov=ri(60,94),wo=parseFloat(Math.max(1.3,(n-ov/94*n+1)*rnd(.9,1.4)).toFixed(2));
      return {name:nm,ovr:ov,num:i+1,winOdds:wo,placeOdds:parseFloat((wo*.33).toFixed(2)),ew:parseFloat((wo*.38).toFixed(2)),exacta:parseFloat((wo*ri(2,4)).toFixed(2))};
    });
    G.evts[type].push({id:type[0]+r,sport:type,title:pick(races),info:n+' runners · '+(type==='horses'?ri(1,4)+'m '+ri(0,7)+'f':'480m'),runners,isLive:r===0,startTime:r===0?'LIVE':r===1?ri(5,30)+'min':ri(1,4)+'h'});
  }
}

function genMMA(){
  G.evts.mma=[];
  const pool=shuf(UFC);
  for(let i=0;i<pool.length-1&&i<12;i+=2){
    const f1=pool[i],f2=pool[i+1];
    const o1=odds(f1.o,f2.o),o2=odds(f2.o,f1.o);
    G.evts.mma.push({id:'m'+i,sport:'mma',event:pick(MEVT),f1:f1.n,f1ovr:f1.o,f2:f2.n,f2ovr:f2.o,
      odds:{f1:o1,f2:o2,f1ko:parseFloat((o1*1.55).toFixed(2)),f2ko:parseFloat((o2*1.55).toFixed(2)),
        f1sub:parseFloat((o1*2).toFixed(2)),f2sub:parseFloat((o2*2).toFixed(2)),
        f1dec:parseFloat((o1*1.85).toFixed(2)),f2dec:parseFloat((o2*1.85).toFixed(2)),
        r1fin:parseFloat(rnd(2.5,5).toFixed(2)),r2fin:parseFloat(rnd(2.5,5).toFixed(2)),r3fin:parseFloat(rnd(2,4).toFixed(2)),
        gdec:parseFloat(rnd(1.5,2.5).toFixed(2)),ndec:parseFloat(rnd(1.5,2.5).toFixed(2)),
        u15:parseFloat(rnd(2,3.5).toFixed(2)),o25r:parseFloat(rnd(1.7,3).toFixed(2)),u25r:parseFloat(rnd(1.5,2.5).toFixed(2))},
      isLive:i===0,round:i===0?ri(1,3):0,startTime:i===0?'LIVE':ri(1,8)+'h'});
  }
}

function genTennis(){
  G.evts.tennis=[];
  const pool=shuf(TENNIS_PLAYERS);
  for(let i=0;i<Math.min(pool.length-1,12);i+=2){
    const p1=pool[i],p2=pool[i+1];
    const o1=odds(p1.o,p2.o),o2=odds(p2.o,p1.o);
    const isLive=i<2;
    G.evts.tennis.push({
      id:'t'+i,sport:'tennis',tournament:pick(TENNIS_TOURNAMENTS),
      p1:p1.n,p1ovr:p1.o,p1country:p1.country,
      p2:p2.n,p2ovr:p2.o,p2country:p2.country,
      odds:{p1:o1,p2:o2,
        p1s1:parseFloat((o1*.9).toFixed(2)),p2s1:parseFloat((o2*.9).toFixed(2)),
        p1s2:parseFloat((o1*.85).toFixed(2)),p2s2:parseFloat((o2*.85).toFixed(2)),
        o225g:parseFloat(rnd(1.7,2.3).toFixed(2)),u225g:parseFloat(rnd(1.7,2.3).toFixed(2)),
        tb:parseFloat(rnd(1.5,2.5).toFixed(2)),notb:parseFloat(rnd(1.5,2.5).toFixed(2)),
        str3:parseFloat(rnd(1.3,1.8).toFixed(2)),str4:parseFloat(rnd(2,3.5).toFixed(2)),str5:parseFloat(rnd(3,6).toFixed(2))
      },
      isLive, p1Sets:isLive?ri(0,2):0, p2Sets:isLive?ri(0,2):0,
      startTime:isLive?'LIVE':ri(1,8)+'h'
    });
  }
}

function genCricket(){
  G.evts.cricket=[];
  const pool=shuf(CRICKET_TEAMS);
  for(let i=0;i<Math.min(pool.length-1,8);i+=2){
    const h=pool[i],a=pool[i+1];
    const ho=odds(h.o,a.o),ao=odds(a.o,h.o);
    const isLive=i<2;
    const format=pick(CRICKET_FORMATS);
    G.evts.cricket.push({
      id:'c'+i,sport:'cricket',format,
      home:h.n,homeOvr:h.o,away:a.n,awayOvr:a.o,
      odds:{home:ho,away:ao,
        hInns:parseFloat(rnd(1.7,2.8).toFixed(2)),aInns:parseFloat(rnd(1.7,2.8).toFixed(2)),
        o300:parseFloat(rnd(1.7,2.5).toFixed(2)),u300:parseFloat(rnd(1.7,2.5).toFixed(2)),
        o350:parseFloat(rnd(2.5,4).toFixed(2)),u350:parseFloat(rnd(1.3,1.8).toFixed(2)),
        topHb:parseFloat(rnd(2.5,5).toFixed(2)),topAb:parseFloat(rnd(2.5,5).toFixed(2)),
        draw:format==='Test Match'?parseFloat(rnd(3,6).toFixed(2)):null
      },
      isLive,hRuns:isLive?ri(80,250):0,aRuns:isLive?ri(80,250):0,
      hWkts:isLive?ri(0,9):0,overs:isLive?ri(10,45):0,
      startTime:isLive?'LIVE':ri(1,8)+'h'
    });
  }
}

function generateAll(){genFootball();genBasketball();genRaces('horses');genRaces('dogs');genMMA();genTennis();genCricket();genF1();}

function genF1(){
  G.evts.f1=[];
  const circuits=shuf(F1_CIRCUITS).slice(0,5);
  circuits.forEach((circuit,ci)=>{
    const drivers=shuf(F1_DRIVERS);
    const isLive=ci===0;
    // Race winner odds based on OVR
    const raceDrivers=drivers.slice(0,10).map(d=>{
      const wo=parseFloat(Math.max(1.5,Math.pow(20/d.o*10,1.6)*rnd(0.85,1.2)).toFixed(2));
      const podO=parseFloat((wo*.28).toFixed(2));
      const top6O=parseFloat((wo*.18).toFixed(2));
      const top10O=parseFloat((wo*.1).toFixed(2));
      const poleO=parseFloat(Math.max(1.5,wo*.9).toFixed(2));
      const flO=parseFloat(Math.max(2,wo*.7).toFixed(2));
      return {...d, raceWin:wo, podium:podO, top6:top6O, top10:top10O, pole:poleO, fastLap:flO};
    });
    // Head to head teammate pairings
    const h2h=[];
    const teamMap={};
    raceDrivers.forEach(d=>{if(!teamMap[d.team])teamMap[d.team]=[];teamMap[d.team].push(d);});
    Object.values(teamMap).forEach(pair=>{
      if(pair.length>=2){
        const [d1,d2]=pair;
        const h1=parseFloat(Math.max(1.3,1/(d1.o/(d1.o+d2.o))*0.9).toFixed(2));
        const h2=parseFloat(Math.max(1.3,1/(d2.o/(d1.o+d2.o))*0.9).toFixed(2));
        h2h.push({d1:d1.n,d2:d2.n,h1,h2,team:d1.team});
      }
    });
    const safetyCarO=parseFloat(rnd(1.3,2.2).toFixed(2));
    const noSCO=parseFloat(rnd(1.5,2.5).toFixed(2));
    G.evts.f1.push({
      id:'f1_'+ci,sport:'f1',circuit,drivers:raceDrivers,h2h,
      safetyCarO,noSCO,
      dnfO:parseFloat(rnd(1.4,2.2).toFixed(2)),
      redFlagO:parseFloat(rnd(2.5,5).toFixed(2)),
      lapsLeadO:parseFloat(rnd(1.4,2.5).toFixed(2)),
      isLive,lap:isLive?ri(10,55):0,totalLaps:ri(55,70),
      leader:isLive?drivers[0].n:null,
      startTime:isLive?'LIVE':ri(1,7)+'d'
    });
  });
}


// ==================== START ALL ====================
function startAll(sport){
  const evts=G.evts[sport]||[];
  evts.forEach(ev=>{
    if(!ev.isLive){
      ev.isLive=true;
      ev.startTime='LIVE';
      // Initialize live state per sport
      if(sport==='football'){ev.minute=ev.minute||ri(1,30);ev.hScore=ev.hScore||0;ev.aScore=ev.aScore||0;}
      else if(sport==='basketball'){ev.quarter=ev.quarter||1;ev.hScore=ev.hScore||ri(10,40);ev.aScore=ev.aScore||ri(10,40);}
      else if(sport==='horses'||sport==='dogs'){/* race progress handled by rProg */}
      else if(sport==='mma'){ev.round=ev.round||1;}
      else if(sport==='tennis'){ev.p1Sets=ev.p1Sets||0;ev.p2Sets=ev.p2Sets||0;}
      else if(sport==='cricket'){ev.hRuns=ev.hRuns||ri(20,80);ev.hWkts=ev.hWkts||0;ev.overs=ev.overs||'1.0';}
      else if(sport==='f1'){ev.lap=ev.lap||ri(1,15);ev.leader=ev.drivers&&ev.drivers[0]?ev.drivers[0].n:null;}
    }
  });
  renderEvents();
}
