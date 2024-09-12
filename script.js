document.addEventListener('DOMContentLoaded', () => {
  fetch('/pages.txt')
    .then(response => response.text())
    .then(data => {
      const sitemapElement = document.getElementById('sitemap');

      if (!sitemapElement) return;

      const lines = data.split('\n');

      lines.forEach(line => {
        if (line.trim()) {
          const [path, name, description] = line.split(' ');

          const listItem = document.createElement('li');
          const link = document.createElement('a');
          link.href = path;
          link.textContent = name;
          link.description = description;
          listItem.appendChild(link);

          sitemapElement.appendChild(listItem);
        }
      });
    })
    .catch(error => {
      console.error('Error loading pages.txt:', error);
    });
});
