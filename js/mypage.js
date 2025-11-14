// ===== mypage.js =====
(async function() {
  // データ読み込み
  await DB.load();

  // LocalStorageから全データを取得
  const allKeys = Object.keys(localStorage);
  
  // お気に入り、いいね、レビューのデータを収集
  const favedSongIds = [];
  const likedSongIds = [];
  const reviewedSongs = []; // {songId, rating}

  allKeys.forEach(key => {
    if (key.startsWith('faved:')) {
      const songId = key.replace('faved:', '');
      if (LS.get(key, false)) {
        favedSongIds.push(songId);
      }
    } else if (key.startsWith('liked:')) {
      const songId = key.replace('liked:', '');
      if (LS.get(key, false)) {
        likedSongIds.push(songId);
      }
    } else if (key.startsWith('rated:')) {
      const songId = key.replace('rated:', '');
      const rating = LS.get(key);
      if (rating && rating > 0) {
        reviewedSongs.push({ songId, rating });
      }
    }
  });

  // 統計を表示
  qs("#favCount").textContent = favedSongIds.length;
  qs("#likeCount").textContent = likedSongIds.length;
  qs("#reviewCount").textContent = reviewedSongs.length;

  // お気に入りの曲を表示
  const favContainer = qs("#favSongs");
  if (favedSongIds.length > 0) {
    favContainer.innerHTML = '';
    favedSongIds.forEach(songId => {
      const song = DB.songById(songId);
      if (!song) return;
      
      const artist = DB.artistById(song.artist_id);
      const item = createSongItem(song, artist);
      favContainer.appendChild(item);
    });
  }

  // いいねした曲を表示
  const likeContainer = qs("#likedSongs");
  if (likedSongIds.length > 0) {
    likeContainer.innerHTML = '';
    likedSongIds.forEach(songId => {
      const song = DB.songById(songId);
      if (!song) return;
      
      const artist = DB.artistById(song.artist_id);
      const item = createSongItem(song, artist);
      likeContainer.appendChild(item);
    });
  }

  // レビューした曲を表示
  const reviewContainer = qs("#reviewedSongs");
  if (reviewedSongs.length > 0) {
    reviewContainer.innerHTML = '';
    reviewedSongs.forEach(({ songId, rating }) => {
      const song = DB.songById(songId);
      if (!song) return;
      
      const artist = DB.artistById(song.artist_id);
      const item = createSongItemWithRating(song, artist, rating);
      reviewContainer.appendChild(item);
    });
  }

  // 楽曲アイテムを作成する関数
  function createSongItem(song, artist) {
    const a = document.createElement('a');
    a.className = 'rank-item';
    a.href = `music.html?id=${encodeURIComponent(song.id)}`;
    
    const likes = applyLikeCount(song.likes, song.id);
    
    a.innerHTML = `
      <div class="rank-cover">
        <img src="${song.cover}" alt="">
      </div>
      <div class="rank-main">
        <div style="font-weight:800">${song.title}</div>
        <div class="muted" style="font-size:12px">
          ${artist.name} ・ ${song.category} ・ いいね: ${fmt(likes)}
        </div>
      </div>
    `;
    
    return a;
  }

  // 楽曲アイテム（評価付き）を作成する関数
  function createSongItemWithRating(song, artist, rating) {
    const a = document.createElement('a');
    a.className = 'song-item-with-rating';
    a.href = `music.html?id=${encodeURIComponent(song.id)}`;
    
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    
    a.innerHTML = `
      <div class="cover">
        <img src="${song.cover}" alt="">
      </div>
      <div class="info">
        <div class="title">${song.title}</div>
        <div class="subtitle">${artist.name} ・ ${song.category}</div>
      </div>
      <div class="rating">${stars}</div>
    `;
    
    return a;
  }
})();
