const scrape = require('website-scraper');

// Modify the URL and directory path below as needed
const options = {
  urls: ['https://example.com'],
  directory: './cloned-website',
  // You can customize the behavior here (e.g. download recursive links, asset types)
};

console.log('Starting website clone...');
scrape(options)
  .then((result) => {
    console.log('Website cloned successfully into the "./cloned-website" directory!');
  })
  .catch((err) => {
    console.error('An error occurred during cloning:', err);
  });
