
(async function(){
  const db = await DB.load(); const store = await loadJSON("data/artist_profiles.json");
  const id = getParam("id"); let prof = null;
  if(id){ prof = store.profiles.find(p=>p.id===id) || store.profiles.find(p=>p.stage_name===id); }
  if(!prof){ prof = store.profiles[0]; }
  const avatar=qs("#artistAvatar"); avatar.src=prof.avatar; avatar.onerror=()=>{ avatar.src="assets/img/placeholder-artist.svg"; };
  qs("#artistName").textContent=prof.stage_name; qs("#artistTag").textContent=prof.tagline; qs("#artistBio").textContent=prof.bio_short;
  qs("#artistBasics").textContent=`${prof.real_name} / ${prof.birth}（${prof.age}歳） / ${prof.hometown} / ${prof.height_cm}cm / ${prof.zodiac}・${prof.blood}型`;
  const vals=Object.values(prof.socials||{}).map(Number); const maxF=vals.length?Math.max(...vals):0; qs("#artistFollowers").textContent=maxF?`${fmt(maxF)} フォロワー（主要SNS）`:"SNS情報なし";
  const chips=qs("#lookChips"); (prof.look_keywords||[]).forEach(k=>{ const s=document.createElement("span"); s.className="chip"; s.textContent=k; chips.appendChild(s); });
  const rep=qs("#repSongs"); const artistObj=db.artists.find(a=>a.id===prof.id||a.name===prof.stage_name); const list=artistObj?db.songs.filter(s=>s.artist_id===artistObj.id):[]; const map=new Map(list.map(s=>[s.title,s]));
  (prof.rep_songs||[]).slice(0,10).forEach(t=>{ const li=document.createElement("li"); if(map.has(t)){ const s=map.get(t); li.innerHTML=`<a href="music.html?id=${encodeURIComponent(s.id)}">${t}</a>`; } else { li.textContent=t; } rep.appendChild(li); });
  const ach=qs("#achievements"); (prof.achievements||[]).forEach(a=>{ const li=document.createElement("li"); li.textContent=a; ach.appendChild(li); });
  qs("#fanInfo").textContent=`ファンの呼び方：${prof.fan_name||"—"}`;
  const host=qs("#artistSongs"); const siteSongs=list.sort((a,b)=>applyLikeCount(b.likes,b.id)-applyLikeCount(a.likes,a.id));
  if(siteSongs.length){ const maxLikes=applyLikeCount(siteSongs[0].likes, siteSongs[0].id);
    siteSongs.forEach((s,i)=>{ const a=document.createElement("a"); a.className="rank-item"; a.href=`music.html?id=${encodeURIComponent(s.id)}`; const likes=applyLikeCount(s.likes,s.id);
      a.innerHTML=`<div class="rank-num">${i+1}</div><div class="rank-cover"><img src="${s.cover}" alt=""></div><div class="rank-main"><div style="font-weight:800">${s.title}</div><div class="muted" style="font-size:12px">${prof.stage_name} ・ いいね: ${fmt(likes)} ・ 視聴: ${fmt(s.viewer_count)}</div><div class="progress"><em style="width:${Math.max(6, Math.round(likes/(maxLikes||1)*100))}%"></em></div></div>`; host.appendChild(a); }); }
  else { const p=document.createElement("p"); p.className="muted"; p.textContent="このサイトのサンプルDBには登録曲が少ないため、代表曲リストをご参照ください。"; host.appendChild(p); }
  const playTop=qs("#playTop"); if(siteSongs.length){ playTop.href=`music.html?id=${encodeURIComponent(siteSongs[0].id)}`; } else { playTop.classList.add("muted"); playTop.textContent="再生可能な曲がありません"; }
})();
