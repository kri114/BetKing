# BetKing 🎰
A virtual sports betting tycoon game. No real money involved.

## Sports
⚽ Football · 🏀 Basketball · 🐎 Horse Racing · 🐕 Dog Racing · 🥊 MMA · 🎾 Tennis · 🏏 Cricket · 🏎️ F1

## Features
- Live match viewer with animated visuals
- Player props, accumulators, cash out
- Leaderboard, profile & badges
- Daily bonus

## Deploy on Render
1. Push to GitHub
2. New Web Service on render.com → Static Site
3. Root directory: `/` · Publish directory: `/`
4. Done — no build step needed

## File Structure
```
index.html          # Main HTML
css/style.css       # All styles
js/data.js          # Squad & league data
js/state.js         # Global state (G object)
js/utils.js         # Helper functions
js/generate.js      # Event generation
js/render.js        # Event card rendering
js/viewer.js        # Live match viewer
js/slip.js          # Bet slip & placing bets
js/profile.js       # Profile tab & badges
js/storage.js       # Save/load & init
```

## Accounts / Persistence
User data (balance, history, profile) is saved via `window.storage` (Claude.ai artifact storage).
When hosting externally, replace `window.storage` calls in `js/storage.js` with `localStorage`.
See the README section below for the exact code swap.

### Switching to localStorage for persistent accounts
In `js/storage.js`, replace:
```js
async function save(){
  try{await window.storage.set('bk6', JSON.stringify({...}));}catch(e){}
}
async function load(){
  try{
    const r=await window.storage.get('bk6');
    if(r?.value){ const d=JSON.parse(r.value); ... }
  }catch(e){}
}
```
With:
```js
function save(){
  try{localStorage.setItem('bk6', JSON.stringify({bal:G.bal,wins:G.wins,losses:G.losses,hist:G.hist.slice(0,80),debt:G.debt,daily:G.daily,user:G.user}));}catch(e){}
}
async function load(){
  try{
    const d=JSON.parse(localStorage.getItem('bk6')||'null');
    if(d){ G.bal=d.bal??100; G.wins=d.wins||0; G.losses=d.losses||0; G.hist=d.hist||[]; G.debt=d.debt||0; G.daily=d.daily||false; if(d.user)G.user={...G.user,...d.user}; }
  }catch(e){}
}
```
Also make the init call `load()` synchronously (remove `await`).
localStorage persists across browser sessions on the same device. For true cross-device accounts, you'd need a backend (e.g. Supabase free tier).
