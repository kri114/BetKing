// ==================== STATE ====================
let G={
  bal:100,wins:0,losses:0,hist:[],slip:[],mode:'single',stake:0,
  sport:'football',tab:'sportsbook',daily:false,debt:0,lg:'All',showLU:{},
  evts:{football:[],basketball:[],horses:[],dogs:[],mma:[],tennis:[],cricket:[],f1:[]},
  activeBets:[],
  user:{name:'Player',emoji:'🦁',color:'#F0B429',title:'Rookie',bio:''},
};
let aiBal=[2800,5200,1400,8900,3300,6100,700,4700,9800,2100];
const AIPLAYERS=[{name:'Viktor Zane',av:'VZ',c:'#E53935',t:'High Roller'},{name:'Sofia Papadaki',av:'SP',c:'#7B1FA2',t:'Sharp'},{name:'Marco DiLeo',av:'MD',c:'#1565C0',t:'Grinder'},{name:'Aisha Okonkwo',av:'AO',c:'#00695C',t:'Value Hunter'},{name:'Tomás Reyes',av:'TR',c:'#E65100',t:'Accumulator King'},{name:'Jing Wei',av:'JW',c:'#AD1457',t:'Analytics Pro'},{name:'Finn Callahan',av:'FC',c:'#4527A0',t:'Underdog Chaser'},{name:'Reza Ahmadi',av:'RA',c:'#00838F',t:'Form Student'},{name:'Lena Braun',av:'LB',c:'#558B2F',t:'Each Way Expert'},{name:'Carlos Vega',av:'CV',c:'#D84315',t:'Parlay Builder'}];

// BADGES
const BADGES = [
  {id:'first_win',icon:'🏆',name:'First Win',req:'Win your first bet',cond:()=>G.wins>=1},
  {id:'high_roller',icon:'💰',name:'High Roller',req:'Bet $100 at once',cond:()=>G.hist.some(h=>h.stake>=100)},
  {id:'lucky7',icon:'🎰',name:'Lucky Seven',req:'Win 7 bets',cond:()=>G.wins>=7},
  {id:'millionaire',icon:'💎',name:'Millionaire',req:'Reach $1,000',cond:()=>G.bal>=1000},
  {id:'streaker',icon:'🔥',name:'On Fire',req:'Win 3 in a row',cond:()=>{let s=0;for(let h of G.hist){if(h.result==='win')s++;else break;}return s>=3;}},
  {id:'accumulator',icon:'📈',name:'Acca King',req:'Place a 4+ leg acca',cond:()=>G.hist.some(h=>h.legs&&h.legs>=4)},
  {id:'degen',icon:'😈',name:'Degen',req:'Go all-in',cond:()=>G.hist.some(h=>h.allIn)},
  {id:'cashout',icon:'💸',name:'Cash Out King',req:'Cash out a bet',cond:()=>G.hist.some(h=>h.result==='cashout')},
];
