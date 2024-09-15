document.addEventListener('DOMContentLoaded', () => {
  fetch('/pages.txt')
    .then(response => response.text())
    .then(data => {
      const sitemapElement = document.getElementById('sitemap');

      if (!sitemapElement) return;

      const lines = data.split('\n');

      const descriptionDiv = document.getElementById('description');
      const newParagraph = document.createElement('p');
      newParagraph.textContent = 'Not found.'
      lines.forEach(line => {
        if (line.trim()) {
          const args = line.split(' ');
          const path = args[0];
          const name = args[1];
          const description = args.slice(2).join(' ');

          const now = `/${window.location.href.split('/').slice(3).join('/')}`;
          console.log(now);
          if (
            now.includes(path) ||
            (
              now === '/' &&
              path === '/index.html'
            )
          ) newParagraph.textContent = description;

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

const footer = document.querySelector('footer');

if (footer) {
  const links = [
    {
      url: 'https://dsc.gg/otolab',
      textContent: 'Discord'
    },
    {
      url: 'https://otoneko.jp/',
      textContent: 'Dev Homepage'
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
  copyButton.style.right = '10px';
  copyButton.style.bottom = '10px';
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
}
