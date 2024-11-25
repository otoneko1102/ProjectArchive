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

document.addEventListener('DOMContentLoaded', () => {
  fetch('/pages.txt')
    .then(response => response.text())
    .then(data => {
      const sitemapElement = document.getElementById('sitemap');

      if (!sitemapElement) return;

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
    button.id = 'scrollButton';
    button.textContent = 'Jump!';

    document.body.appendChild(button);

    button.addEventListener('click', function () {
      functionSection.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        button.style.display = 'none';
      }, 300)
    });
  }
});

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
    copyButton.className = 'copybutton';
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

        setTimeout(() => {
          iconImage.src = linkIcon;
          iconImage.alt = 'Copy Link';
          copyButton.title = 'Copy';
        }, 3000);
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
