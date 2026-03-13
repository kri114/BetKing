// ==================== UTILS ====================
const rnd=(a,b)=>Math.random()*(b-a)+a;
const ri=(a,b)=>Math.floor(rnd(a,b+1));
const pick=a=>a[ri(0,a.length-1)];
const shuf=a=>[...a].sort(()=>Math.random()-.5);
const fmt=n=>'$'+Math.round(n).toLocaleString();
const fmtD=n=>'$'+parseFloat(n).toFixed(2);
const oc=o=>o>=85?'hi':o>=75?'md':'lo';
const odds=(a,b)=>parseFloat(Math.max(1.05,Math.min(9,1/(0.5+(a-b)*0.008))).toFixed(2));
const isSel=(eid,mkt)=>G.slip.some(s=>s.eid===eid&&s.mkt===mkt);
const selC=(eid,mkt)=>isSel(eid,mkt)?'sel':'';

function getLU(name){
  const sq=SQ[name];
  if(!sq||!sq.f)return null;
  const pos=FM_POS[sq.f]||FM_POS['4-3-3'];
  return {f:sq.f,players:sq.p.map(([nm,pt,num,ov],i)=>({name:nm,pos:pt,num,ovr:ov,x:pos[i]?.[0]??0.5,y:pos[i]?.[1]??0.5}))};
}
function getBLU(name){
  const sq=SQ[name];
  if(sq&&sq.p)return sq.p.map(([nm,pt,num,ov])=>({name:nm,pos:pt,num,ovr:ov}));
  return Array.from({length:5},(_,i)=>({name:'Player '+(i+1),pos:['PG','SG','SF','PF','C'][i],num:i+1,ovr:79}));
}
