// ===== music.js =====
(async function(){
  Loading.show("楽曲情報を読み込み中...");
  
  try {
    const conf = await loadJSON("data/music.json");
    await DB.load();
    const id = getParam("id") || DB.cache.songs[0].id;
    const song = DB.songById(id);
    const artist = DB.artistById(song.artist_id);

    // fill UI
    qs("#cover").src = song.cover;
    qs("#title").textContent = song.title;
    const artistLink = qs("#artistLink");
    artistLink.href = `profile.html?id=${artist.id}`;
    artistLink.textContent = artist.name;

    const baseLikes = song.likes;
    const liked = !!LS.get(keyLiked(song.id), false);
    const faved = !!LS.get(keyFaved(song.id), false);
    const myRate = LS.get(keyRated(song.id), 0);

    function updateStats(){
      qs("#views").textContent = fmt(song.viewer_count) + " 視聴";
      const likeCount = applyLikeCount(baseLikes, song.id);
      qs("#likes").textContent = fmt(likeCount) + " いいね";
      const avg = song.rating;
      const baseCnt = song.rating_count;
      // if user rated, blend a single extra vote into average to visualize instantly
      const v = LS.get(keyRated(song.id), 0);
      const blended = v ? ((avg * baseCnt) + v) / (baseCnt + 1) : avg;
      qs("#rating").textContent = starString(blended);
    }
    updateStats();

    const audio = qs("#audio");
    audio.src = song.audio;
// Volume control
const volumeSlider = qs("#volumeSlider");
const volumeValue = qs("#volumeValue");
const muteBtn = qs("#muteBtn");
let previousVolume = 0.8;

// 初期音量を設定（localStorageから復元）
const savedVolume = LS.get("volume", 80);
audio.volume = savedVolume / 100;
volumeSlider.value = savedVolume;
volumeValue.textContent = savedVolume + "%";
updateMuteIcon();

volumeSlider.addEventListener("input", () => {
  const val = volumeSlider.value;
  audio.volume = val / 100;
  volumeValue.textContent = val + "%";
  LS.set("volume", Number(val));
  previousVolume = audio.volume;
  updateMuteIcon();
});

muteBtn.addEventListener("click", () => {
  if (audio.volume > 0) {
    previousVolume = audio.volume;
    audio.volume = 0;
    volumeSlider.value = 0;
    volumeValue.textContent = "0%";
  } else {
    audio.volume = previousVolume || 0.8;
    volumeSlider.value = Math.round(audio.volume * 100);
    volumeValue.textContent = Math.round(audio.volume * 100) + "%";
  }
  updateMuteIcon();
});

function updateMuteIcon() {
  const vol = audio.volume;
  if (vol === 0) {
    muteBtn.textContent = "🔇";
  } else if (vol < 0.5) {
    muteBtn.textContent = "🔉";
  } else {
    muteBtn.textContent = "🔊";
  }
}
    // エラーメッセージ表示フラグ
    let errorMessageShown = false;

    audio.addEventListener("error", ()=>{
      // srcにsample.wavが含まれていない場合のみ処理
      if (!errorMessageShown && !audio.src.includes("sample.wav")) {
        errorMessageShown = true;
        qs("#title").insertAdjacentHTML("afterend", `<div class="muted" style="font-size:12px">※ サンプルの無音音源を再生しています</div>`);
        audio.src = "assets/audio/sample.wav";
      }
    });

    // fav / like buttons
    const favBtn = qs("#favBtn");
    const likeBtn = qs("#likeBtn");

    function syncButtons(){
      favBtn.classList.toggle("active", !!LS.get(keyFaved(song.id), false));
      favBtn.textContent = favBtn.classList.contains("active") ? "♥ お気に入り中" : "♡ お気に入り";

      likeBtn.classList.toggle("active", !!LS.get(keyLiked(song.id), false));
      likeBtn.textContent = likeBtn.classList.contains("active") ? "👍 済" : "👍 いいね";
    }
    syncButtons();

    favBtn.addEventListener("click", ()=>{
      const cur = !!LS.get(keyFaved(song.id), false);
      LS.set(keyFaved(song.id), !cur);
      syncButtons();
    });

    likeBtn.addEventListener("click", ()=>{
      const cur = !!LS.get(keyLiked(song.id), false);
      LS.set(keyLiked(song.id), !cur);
      updateStats();
      syncButtons();
    });

    // review stars
    const stars = qs("#stars");
    function paintStars(val){
      qsa("#stars button").forEach(btn=>{
        const v = Number(btn.dataset.v);
        btn.textContent = v <= val ? "★" : "☆";
      });
    }
    paintStars(myRate);
    stars.addEventListener("click", (e)=>{
      const b = e.target.closest("button[data-v]");
      if(!b) return;
      const v = Number(b.dataset.v);
      const allowChange = conf.review.allow_change;
      const cur = LS.get(keyRated(song.id), 0);
      if(cur && !allowChange) return;
      LS.set(keyRated(song.id), v);
      paintStars(v);
      updateStats();
    });

    // related (same artist)
    const relA = qs("#rel-artist");
    const relArtist = DB.songsByArtist(artist.id).filter(s=>s.id!==song.id).slice(0, conf.ui.max_related_artist);
    relArtist.forEach(s=> relA.appendChild(songItemEl(s, artist)));

    // related (same category)
    const relC = qs("#rel-category");
    const relCategory = DB.songsByCategory(song.category).filter(s=>s.id!==song.id).slice(0, conf.ui.max_related_category);
    relCategory.forEach(s=> relC.appendChild(songItemEl(s, DB.artistById(s.artist_id))));
    
  } catch (error) {
    console.error("データ読み込みエラー:", error);
    alert("楽曲情報の読み込みに失敗しました");
  } finally {
    Loading.hide();
  }
})();
