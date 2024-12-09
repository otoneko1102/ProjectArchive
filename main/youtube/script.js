function fetchYouTube() {
  const base = document.getElementById("youtube-url").value;
  const videoId = extractVideoId(base);

  if (videoId) {
    const url = `https://www.youtube.com/watch?v=${videoId}`
    fetch(`https://noembed.com/embed?url=${url}`)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        if (data.error) {
          console.error(data.error);
          popup("動画タイトル・投稿者・サムネイルの取得に失敗しました");
        }

        const title = data.title;
        const author = data.author_name;
        const authorPage = data.author_url;
        const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

        document.getElementById("title").innerHTML = title ? `元動画: <a href="${url}" target="_blank">${title}</a>`  : '元動画: ---';
        document.getElementById("author").innerHTML = author ? `投稿者: <a href="${authorPage}" target="_blank">${author}</a>` : '投稿者: ---';
        document.getElementById("thumbnail").src = thumbnail ?? '/img/icon.jpg';
      })
      .catch(error => {
        console.error(error);
        popup("動画タイトル・投稿者・サムネイルの取得に失敗しました");
      });

    fetch(`https://returnyoutubedislikeapi.com/votes?videoId=${videoId}`)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        if (data.status == 404) {
          console.error(data.title);
          popup("動画情報の取得に失敗しました");
        }
        const play = data.viewCount?.toLocaleString() ?? '---';
        const like = data.likes?.toLocaleString() ?? '---';
        const dislike = data.dislikes?.toLocaleString() ?? '---';

        document.getElementById("play").innerText = ` 再生数: ${play}`;
        document.getElementById("like").innerText = `高評価数: ${like}`;
        document.getElementById("dislike").innerText = `低評価数: ${dislike}`;
      })
      .catch(error => {
        console.error(error);
        popup("動画情報の取得に失敗しました");
      });
  } else {
    popup("正しいURLを入力してください");
  }
}

function extractVideoId(url) {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
