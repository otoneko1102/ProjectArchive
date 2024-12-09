let isMuted = localStorage?.getItem('mute');
if (!isMuted) isMuted = 'true';

function playSound(path) {
  if (isMuted === 'true') return;
  const sound = new Audio(path);
  sound.play();
}

function popup(message) {
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  const popup = document.createElement('div');
  popup.className = 'popup';
  popup.innerHTML = `<p>${message}</p>`;
  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', () => {
    overlay.remove();
  });

  setTimeout(() => {
    overlay.remove();
  }, 1000);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchJson(path) {
  console.log(`Try to fetch ${path}.`);
  const response = await fetch(path);
  if (!response.ok) return console.error(`Failed to fetch ${path}.`);
  const rawData = await response.text();
  const data = JSON.parse(rawData);
  console.log(`Successfully fetched ${path}.`, data);
  return data;
};

async function fetchText(path) {
  console.log(`Try to fetch ${path}.`);
  const response = await fetch(path);
  if (!response.ok) return console.error(`Failed to fetch ${path}.`);
  const rawData = await response.text();
  let data = rawData;
  if (data.endsWith('\n')) data = data.slice(0, -1);
  data = data.replace(/\n/g, '<br>');
  console.log(`Successfully fetched ${path}.`, data);
  return data;
};

function showLoadingBar(input) {
  const loading = document.createElement('div');
  loading.id = 'loading';
  loading.innerHTML = `「${input}」を検索しています...`;

  const progressBar = document.createElement('div');
  progressBar.id = 'progress-bar';
  loading.appendChild(progressBar);
  document.body.appendChild(loading);

  const during = 1500;
  setTimeout(() => {
    progressBar.style.transition = `width ${during}ms linear`;
    progressBar.style.width = '0%';
  }, 10);

  setTimeout(() => {
    loading.style.opacity = '0';
    setTimeout(() => loading.remove(), 500);
  }, during);
}

function search() {
  const searchInput = document.getElementById('search');
  const searchWord = searchInput.value;
  const searchButton = document.getElementById('search-button');
  const searchIcon = document.getElementById('search-icon');
  searchButton.disabled = true;
  searchIcon.src = '/img/svg/loading.svg';
  searchIcon.title = 'Loading...';
  searchIcon.alt = 'Loading...';
  searchIcon.classList.add('spin');

  const sitemapChilds = document.querySelectorAll('li[id="sitemap-child"]');

  if (searchWord) showLoadingBar(searchWord);

  setTimeout(() => {
    searchIcon.classList.remove('spin');
    searchButton.disabled = false;
    searchIcon.src = '/img/svg/search.svg';
    searchIcon.title = 'Search';
    searchIcon.alt = 'Search';

    if (searchWord) {
      for (const child of sitemapChilds) {
        const childLinks = child.getElementsByTagName('a');
        let matchFound = false;
        for (const link of childLinks) {
          if (
            link.textContent.includes(searchWord) ||
            link.href
              .replace(`${window.location.protocol}//${window.location.host}`, '')
              .replace('/main/', '')
              .replace(/\//g, '')
              .includes(searchWord)
          ) {
            matchFound = true;
            break;
          }
        }
        if (matchFound) {
          child.style.display = 'block';
        } else {
          child.style.display = 'none';
        }
      }
    } else {
      for (const child of sitemapChilds) {
        child.style.display = 'block';
      }
    }
  }, 1000)
}

document.addEventListener('DOMContentLoaded', () => {
  fetch('/pages.txt')
    .then(response => response.text())
    .then(data => {
      const sitemapElement = document.getElementById('sitemap');

      if (!sitemapElement) return;

      const searchBar = document.getElementById('search-bar');
      const searchInputWrapper = document.createElement('div');
      searchInputWrapper.id = 'search-wrapper';
      const searchInput = document.createElement('input');
      searchInput.id = 'search';
      searchInput.placeholder = 'サイトマップを検索';
      searchInputWrapper.appendChild(searchInput);
      searchBar.appendChild(searchInputWrapper);
      searchInput.addEventListener('input', () => {
        const clearButton = searchInputWrapper.querySelector('::after');
        if (searchInput.value) {
          searchInputWrapper.style.setProperty('--clear-button-display', 'block');
        } else {
          searchInputWrapper.style.setProperty('--clear-button-display', 'none');
        }
      });
      searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          search();
        }
      });
      searchInputWrapper.addEventListener('click', (event) => {
        const rect = searchInputWrapper.getBoundingClientRect();
        const isWithinClearButton = event.clientX > rect.right - 30 && event.clientX < rect.right;
        
        if (isWithinClearButton) {
          searchInput.value = '';
          searchInput.dispatchEvent(new Event('input'));
        }
      });
      const searchButton = document.createElement('button');
      searchButton.id = 'search-button';
      searchButton.onclick = search;
      const searchIcon = document.createElement('img');
      searchIcon.id = 'search-icon';
      searchIcon.src = '/img/svg/search.svg';
      searchIcon.title = 'Search';
      searchIcon.alt = 'Search';
      searchIcon.style.width = '20px';
      searchIcon.style.height = '20px';
      searchButton.appendChild(searchIcon);
      searchBar.appendChild(searchButton);

      const lines = data.split('\n');

      const is404 = document?.getElementById('notfound');

      const pageName = document.getElementById('name');
      const descriptionDiv = document.getElementById('description');
      const newParagraph = document.createElement('p');
      pageName.textContent = '404';
      newParagraph.textContent = 'Not found.';
      lines.forEach(line => {
        if (line.trim()) {
          const args = line.split(' ');
          const path = args[0];
          const name = args[1];
          const description = args.slice(2).join(' ');

          const now = `/${window.location.href.split('/').slice(3).join('/')}`;
          console.log(now);

          if (
            !is404 &&
            (
              now.includes(path) ||
              (
                /^\/+$/.test(now) &&
                path === '/index.html'
              )
            )
          ) {
            pageName.textContent = name;
            newParagraph.textContent = description;
          }

          const listItem = document.createElement('li');
          listItem.id = 'sitemap-child';
          const link = document.createElement('a');
          link.href = path;
          link.textContent = name;
          link.description = description;
          listItem.appendChild(link);

          sitemapElement.appendChild(listItem);
        }
      });
      descriptionDiv.appendChild(newParagraph);
    })
    .catch(error => {
      console.error('Error loading pages.txt:', error);
    });
});

document.addEventListener('DOMContentLoaded', function () {
  const functionSection = document.getElementById('function');

  if (functionSection) {
    const button = document.createElement('button');
    button.id = 'scroll-button';
    button.textContent = '⏬️';

    document.body.appendChild(button);

    button.addEventListener('click', function () {
      functionSection.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        button.style.display = 'none';
      }, 300)
    });
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const button = document.createElement('button');
  button.id = 'sound-button';
  button.textContent = isMuted === 'true' ? '📣' : '🔇';

  document.body.appendChild(button);

  button.addEventListener('click', function () {
    if (button.textContent === '📣') {
      button.textContent = '🔇';
      localStorage.setItem('mute', 'false');
      isMuted = 'false';
    } else {
      button.textContent = '📣';
      localStorage.setItem('mute', 'true');
      isMuted = 'true';
    }
    popup(`ミュートを${isMuted === 'true' ? '有効化' : '無効化'}しました！`);
    console.log("Mute: " + isMuted);
  });
});

const tpp = document.getElementById('t-pp');

if (tpp) {
  (async () => {
    const link = (await fetchJson('/config.json'))['t-pp'];
    const a = document.createElement('a');
    a.href = link;
    a.textContent = '利用規約・プライバシーポリシー';
    a.target = '_blank';
    tpp.appendChild(a);
  })();
}

const footer = document.querySelector('footer');

if (footer) {
  (async () => {
    const links = await fetchJson('/links.json');
    for (const link of links) {
      const element = document.createElement('a');
      element.href = link.url;
      element.textContent = link.textContent;
      element.target = '_blank';
      footer.appendChild(element);
    }

    const copyButton = document.createElement('button');
    copyButton.className = 'copy-button';
    const linkIcon = '/img/svg/link_b.svg';
    const checkIcon = '/img/svg/check_b.svg';

    const iconImage = document.createElement('img');
    iconImage.src = linkIcon;
    iconImage.alt = 'Copy Link';
    iconImage.style.width = '24px';
    iconImage.style.height = '24px';
    copyButton.appendChild(iconImage);

    copyButton.title = 'Copy';
    copyButton.style.position = 'absolute';
    copyButton.style.right = '20px';
    copyButton.style.bottom = '20px';
    copyButton.style.border = 'none';
    copyButton.style.background = 'transparent';
    copyButton.style.cursor = 'pointer';
    copyButton.style.marginLeft = '10px';

    copyButton.addEventListener('click', () => {
      const url = window.location.href;
      navigator.clipboard.writeText(url).then(() => {
        iconImage.src = checkIcon;
        iconImage.alt = 'Copied';
        copyButton.title = 'Success!';
        popup('ページのリンクをコピーしました！');

        setTimeout(() => {
          iconImage.src = linkIcon;
          iconImage.alt = 'Copy Link';
          copyButton.title = 'Copy';
        }, 1000);
      }).catch(err => {
        console.error(err);
      });
    });

    footer.appendChild(copyButton);

    const c = document.createElement('p');
    c.innerHTML = '&copy; 2024 otoneko. All rights reserved. | Project Archive';
    c.style.display = 'block';
    footer.appendChild(c);
  })();
}

function showBar() {
  const notFound = document.getElementById('notfound');
  if (!notFound) return;
  notFound.innerHTML = 'ページが見つかりませんでした';

  const progressBar = document.createElement('div');
  progressBar.id = 'progress-bar';
  notFound.appendChild(progressBar);

  const during = 5000;
  setTimeout(() => {
    progressBar.style.transition = `width ${during}ms linear`;
    progressBar.style.width = '0%';
  }, 10);

  setTimeout(() => {
    notFound.style.opacity = '0';
    setTimeout(() => notFound.remove(), 500);
  }, during);
}

window.onload = showBar;
