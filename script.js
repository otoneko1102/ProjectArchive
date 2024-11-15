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
  const links = [
    {
      url: 'https://dsc.gg/otohome',
      textContent: 'Discord'
    },
    {
      url: 'https://otoho.me/',
      textContent: 'Team HP'
    },
    {
      url: 'https://otoneko.jp/',
      textContent: 'Dev HP'
    }
  ];
  for (const link of links) {
    const element = document.createElement('a');
    element.href = link.url;
    element.textContent = link.textContent;
    element.target = '_blank';
    footer.appendChild(element);
  }

  const copyButton = document.createElement('button');
  const linkIcon = '🔗';
  const checkIcon = '✅';

  copyButton.textContent = linkIcon;
  copyButton.title = 'Copy';
  copyButton.style.position = 'absolute';
  copyButton.style.right = '20px';
  copyButton.style.bottom = '20px';
  copyButton.style.border = 'none';
  copyButton.style.background = 'transparent';
  copyButton.style.cursor = 'pointer';
  copyButton.style.marginLeft = '10px';
  copyButton.style.fontSize = '24px';

  copyButton.addEventListener('click', () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      copyButton.textContent = checkIcon;
      copyButton.title = 'Success!'

      setTimeout(() => {
        copyButton.textContent = linkIcon;
        copyButton.title = 'Copy'
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
