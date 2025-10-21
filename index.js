
// ===== index.js =====
(async function(){
  const conf = await loadJSON("data/index.json");
  const db = await DB.load();

  const tabs = qs("#tabs");
  const tabNames = conf.ui.tabs;
  const state = { tab: "視聴者数" };

  function renderTabs(){
    tabs.innerHTML = "";
    tabNames.forEach(name => {
      const btn = document.createElement("button");
      btn.textContent = name;
      btn.className = name === state.tab ? "active" : "";
      btn.addEventListener("click", ()=>{ state.tab = name; render(); });
      tabs.appendChild(btn);
    });
  }

  function renderList(){
    const host = qs("#ranking-list");
    host.innerHTML = "";
    const limit = conf.ranking.limit;

    if(state.tab === "視聴者数"){
      const sorted = [...db.songs].sort((a,b)=>b.viewer_count - a.viewer_count).slice(0, limit);
      const max = sorted[0]?.viewer_count ?? 0;
      sorted.forEach((s,i)=> host.appendChild(
        rankSongRow(i+1, s, db.artistById(s.artist_id), "視聴", s.viewer_count, max)
      ));
    }else if(state.tab === "いいね数"){
      const sorted = [...db.songs].sort((a,b)=> (applyLikeCount(b.likes, b.id)) - (applyLikeCount(a.likes, a.id))).slice(0, limit);
      const max = sorted[0] ? applyLikeCount(sorted[0].likes, sorted[0].id) : 0;
      sorted.forEach((s,i)=> host.appendChild(
        rankSongRow(i+1, s, db.artistById(s.artist_id), "いいね", applyLikeCount(s.likes, s.id), max)
      ));
    }else{
      // 人気歌手: 楽曲いいね合計で算出（ローカルいいねも反映）
      const likeByArtist = {};
      db.songs.forEach(s=>{
        likeByArtist[s.artist_id] = (likeByArtist[s.artist_id]||0) + applyLikeCount(s.likes, s.id);
      });
      const rows = db.artists.map(a=>({artist:a, tot: likeByArtist[a.id]||0}))
                             .sort((x,y)=>y.tot - x.tot)
                             .slice(0, limit);
      const max = rows[0]?.tot ?? 0;
      rows.forEach((r,i)=> tabs.appendChild);
      rows.forEach((r,i)=> host.appendChild(
        rankArtistRow(i+1, r.artist, r.tot, max)
      ));
    }
  }

  function render(){ renderTabs(); renderList(); }
  render();
})();
