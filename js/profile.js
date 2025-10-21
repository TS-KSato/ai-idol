
// ===== profile.js =====
(async function(){
  const conf = await loadJSON("data/profile.json");
  const db = await DB.load();
  const id = getParam("id") || db.artists[0].id;
  const artist = db.artistById(id);

  qs("#artistAvatar").src = artist.avatar;
  qs("#artistName").textContent = artist.name;
  qs("#artistBio").textContent = artist.bio;
  qs("#artistFollowers").textContent = fmt(artist.followers) + " フォロワー";

  const songs = db.songsByArtist(id).sort((a,b)=> (applyLikeCount(b.likes, b.id)) - (applyLikeCount(a.likes, a.id)))
                .slice(0, conf.ui.top_songs);
  const host = qs("#artistSongs");
  songs.forEach((s,i)=>{
    const a = document.createElement("a");
    a.className = "rank-item";
    a.href = `music.html?id=${encodeURIComponent(s.id)}`;
    const likes = applyLikeCount(s.likes, s.id);
    a.innerHTML = `
      <div class="rank-num">${i+1}</div>
      <div class="rank-cover"><img src="${s.cover}" alt=""></div>
      <div class="rank-main">
        <div style="font-weight:800">${s.title}</div>
        <div class="muted" style="font-size:12px">${artist.name} ・ いいね: ${fmt(likes)} ・ 視聴: ${fmt(s.viewer_count)}</div>
        <div class="progress"><em style="width:${Math.max(6, Math.round(likes / (songs[0]?applyLikeCount(songs[0].likes, songs[0].id):likes) * 100))}%"></em></div>
      </div>
    `;
    host.appendChild(a);
  });
})();
