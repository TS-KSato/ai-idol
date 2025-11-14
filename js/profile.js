// ===== profile.js =====
(async function() {
  // データ読み込み
  await DB.load();
  const profileData = await loadJSON("data/profiles.json");
  const config = await loadJSON("data/profile.json");

  // URLパラメータからアーティストIDを取得
  const artistId = getParam("id");
  
  // プロフィール情報を取得（IDまたは名前で検索、なければ最初のアーティスト）
  let profile = null;
  if (artistId) {
    profile = profileData.profiles.find(p => p.id === artistId) 
           || profileData.profiles.find(p => p.stage_name === artistId);
  }
  if (!profile) {
    profile = profileData.profiles[0];
  }

  // === アバター画像の設定 ===
  const avatarImg = qs("#artistAvatar");
  avatarImg.src = profile.avatar;
  avatarImg.onerror = () => {
    // 画像が見つからない場合のフォールバック
    avatarImg.src = "assets/img/placeholder-artist.svg";
  };

  // === 基本情報の表示 ===
  qs("#artistName").textContent = profile.stage_name;
  qs("#artistTag").textContent = profile.tagline;
  qs("#artistBio").textContent = profile.bio_short;

  // 詳細情報（誕生日、星座、血液型のみ）
  qs("#artistBasics").textContent = 
    `${profile.birth} / ${profile.zodiac}・${profile.blood}型 / ${profile.hometown}`;

  // === 外見キーワード（チップ）の表示 ===
  const chipsContainer = qs("#lookChips");
  (profile.look_keywords || []).forEach(keyword => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = keyword;
    chipsContainer.appendChild(chip);
  });

  // === 代表曲リストの表示 ===
  const repSongsContainer = qs("#repSongs");
  
  // common.jsonからこのアーティストのオブジェクトを取得
  const artistObj = DB.cache.artists.find(a => 
    a.id === profile.id || a.name === profile.stage_name
  );
  
  // このアーティストの楽曲一覧を取得
  const artistSongsList = artistObj 
    ? DB.cache.songs.filter(s => s.artist_id === artistObj.id) 
    : [];
  
  // 楽曲タイトルから楽曲オブジェクトへのマップを作成
  const songMap = new Map(artistSongsList.map(s => [s.title, s]));
  
  // 代表曲リストを表示（最大10曲）
  (profile.rep_songs || []).slice(0, config.ui.top_songs).forEach(title => {
    const li = document.createElement("li");
    
    if (songMap.has(title)) {
      // サイト内に楽曲データがある場合はリンクを設定
      const song = songMap.get(title);
      li.innerHTML = `<a href="music.html?id=${encodeURIComponent(song.id)}">${title}</a>`;
    } else {
      // サイト内に楽曲データがない場合はテキストのみ
      li.textContent = title;
    }
    
    repSongsContainer.appendChild(li);
  });

  // === サイト内楽曲リストの表示 ===
  const songsContainer = qs("#artistSongs");
  
  // いいね数順にソート
  const sortedSongs = artistSongsList.sort((a, b) => 
    applyLikeCount(b.likes, b.id) - applyLikeCount(a.likes, a.id)
  );

  if (sortedSongs.length > 0) {
    // 最大いいね数を取得（プログレスバー用）
    const maxLikes = applyLikeCount(sortedSongs[0].likes, sortedSongs[0].id);
    
    sortedSongs.forEach((song, index) => {
      const likes = applyLikeCount(song.likes, song.id);
      const percentage = maxLikes > 0 ? Math.max(6, Math.round(likes / maxLikes * 100)) : 6;
      
      const row = document.createElement("a");
      row.className = "rank-item";
      row.href = `music.html?id=${encodeURIComponent(song.id)}`;
      row.innerHTML = `
        <div class="rank-num">${index + 1}</div>
        <div class="rank-cover">
          <img src="${song.cover}" alt="">
        </div>
        <div class="rank-main">
          <div style="font-weight:800">${song.title}</div>
          <div class="muted" style="font-size:12px">
            ${profile.stage_name} ・ いいね: ${fmt(likes)} ・ 視聴: ${fmt(song.viewer_count)}
          </div>
          <div class="progress">
            <em style="width:${percentage}%"></em>
          </div>
        </div>
      `;
      
      songsContainer.appendChild(row);
    });
  } else {
    // 楽曲がない場合のメッセージ
    const message = document.createElement("p");
    message.className = "muted";
    message.textContent = "このサイトには楽曲データがまだ登録されていません。代表曲リストをご参照ください。";
    songsContainer.appendChild(message);
  }

  // === 代表曲再生ボタン ===
  const playTopBtn = qs("#playTop");
  if (sortedSongs.length > 0) {
    // 一番人気の曲へのリンクを設定
    playTopBtn.href = `music.html?id=${encodeURIComponent(sortedSongs[0].id)}`;
  } else {
    // 楽曲がない場合は無効化
    playTopBtn.classList.add("muted");
    playTopBtn.textContent = "再生可能な曲がありません";
    playTopBtn.style.pointerEvents = "none";
  }
})();
