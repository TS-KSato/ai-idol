
// ===== common.js =====
const DATA_COMMON = "data/common.json";

const qs = sel => document.querySelector(sel);
const qsa = sel => Array.from(document.querySelectorAll(sel));

function getParam(name){
  const url = new URL(location.href);
  return url.searchParams.get(name);
}

async function loadJSON(path){
  const res = await fetch(path, {cache: "no-store"});
  if(!res.ok) throw new Error(`failed to load ${path}`);
  return await res.json();
}

function fmt(num){
  if(num >= 10000) return (num/10000).toFixed(1).replace(/\.0$/,'') + "万";
  if(num >= 1000) return (num/1000).toFixed(1).replace(/\.0$/,'') + "千";
  return String(num);
}

// localStorage helpers
const LS = {
  get(k, def=null){ try{ const v = localStorage.getItem(k); return v==null?def:JSON.parse(v);}catch(e){return def}},
  set(k, v){ localStorage.setItem(k, JSON.stringify(v)); },
  has(k){ return localStorage.getItem(k) != null; },
  del(k){ localStorage.removeItem(k); }
}

function keyLiked(songId){ return `liked:${songId}`}
function keyFaved(songId){ return `faved:${songId}`}
function keyRated(songId){ return `rated:${songId}`}

// simple db wrapper
const DB = {
  cache: null,
  async load(){
    if(this.cache) return this.cache;
    this.cache = await loadJSON(DATA_COMMON);
    return this.cache;
  },
  artistById(id){ return this.cache.artists.find(a=>a.id===id) },
  songById(id){ return this.cache.songs.find(s=>s.id===id) },
  songsByArtist(aid){ return this.cache.songs.filter(s=>s.artist_id===aid) },
  songsByCategory(cat){ return this.cache.songs.filter(s=>s.category===cat) }
}

function starString(avg){
  const rounded = Math.round(avg*10)/10;
  return `★${rounded.toFixed(1)}`;
}

function applyLikeCount(baseLikes, songId){
  const liked = !!LS.get(keyLiked(songId), false);
  const localDelta = liked ? 1 : 0;
  return baseLikes + localDelta;
}

function ensureOnce(element, className){
  element.classList.add(className);
}

// Card builders
function songItemEl(song, artist){
  const div = document.createElement('a');
  div.className = "item card";
  div.href = `music.html?id=${encodeURIComponent(song.id)}`;
  div.style.padding = "10px";
  div.innerHTML = `
    <img src="${song.cover}" alt="" style="border-bottom:1px solid #1f2632; max-height:120px; object-fit:cover">
    <div class="title">${song.title}</div>
    <div class="sub">${artist.name} ・ ${song.category}</div>
  `;
  return div;
}

function rankSongRow(rank, song, artist, metricLabel, metricValue, maxValue){
  const row = document.createElement("a");
  row.className = "rank-item";
  row.href = `music.html?id=${encodeURIComponent(song.id)}`;
  const pct = maxValue ? Math.max(6, Math.round(metricValue / maxValue * 100)) : 0;
  row.innerHTML = `
    <div class="rank-num">${rank}</div>
    <div class="rank-cover"><img src="${song.cover}" alt=""></div>
    <div class="rank-main">
      <div style="font-weight:800">${song.title}</div>
      <div class="muted" style="font-size:12px">${artist.name} ・ ${metricLabel}: ${fmt(metricValue)}</div>
      <div class="progress"><em style="width:${pct}%"></em></div>
    </div>
  `;
  return row;
}

function rankArtistRow(rank, artist, totalLikes, maxLikes){
  const row = document.createElement("a");
  row.className = "rank-item";
  row.href = `profile.html?id=${encodeURIComponent(artist.id)}`;
  const pct = maxLikes ? Math.max(6, Math.round(totalLikes / maxLikes * 100)) : 0;
  row.innerHTML = `
    <div class="rank-num">${rank}</div>
    <div class="rank-cover"><img src="${artist.avatar}" alt=""></div>
    <div class="rank-main">
      <div style="font-weight:800">${artist.name}</div>
      <div class="muted" style="font-size:12px">合計いいね: ${fmt(totalLikes)}</div>
      <div class="progress"><em style="width:${pct}%"></em></div>
    </div>
  `;
  return row;
}
