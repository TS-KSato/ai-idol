// ===== artists.js =====
(async function() {
  // データ読み込み
  const db = await DB.load();
  const profileData = await loadJSON("data/profiles.json");

  const grid = qs("#artistsGrid");

  // プロフィールデータでソート（IDの昇順）
  const sortedProfiles = profileData.profiles.sort((a, b) => a.id.localeCompare(b.id));

  sortedProfiles.forEach(profile => {
    // common.jsonから対応するアーティストを取得
    const artist = db.artists.find(a => a.id === profile.id);
    if (!artist) return;

    // 代表曲のうち、最初の3曲を取得
    const repSongsText = (profile.rep_songs || []).slice(0, 3).join('、');

    // カード要素を作成
    const card = document.createElement('a');
    card.className = 'artist-card-item';
    card.href = `profile.html?id=${encodeURIComponent(profile.id)}`;
    
    card.innerHTML = `
      <div class="avatar-wrapper">
        <img src="${artist.avatar}" alt="${artist.name}" onerror="this.src='assets/img/placeholder-artist.svg'">
      </div>
      <div class="info">
        <h3 class="name">${artist.name}</h3>
        <p class="bio">${artist.bio}</p>
        ${repSongsText ? `<p class="rep-songs"><strong>代表曲:</strong> ${repSongsText}</p>` : ''}
      </div>
    `;

    grid.appendChild(card);
  });
})();
