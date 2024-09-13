document.addEventListener('DOMContentLoaded', () => {
  fetch('/pages.txt')
    .then(response => response.text())
    .then(data => {
      const sitemapElement = document.getElementById('sitemap');

      if (!sitemapElement) return;

      const lines = data.split('\n');

      const descriptionDiv = document.getElementById('description');
      const newParagraph = document.createElement('p');

      lines.forEach(line => {
        if (line.trim()) {
          const args = line.split(' ');
          const path = args[0];
          const name = args[1];
          const description = args.slice(2).join(' ');

          if (window.location.href.includes(path)) newParagraph.textContent = description;

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
