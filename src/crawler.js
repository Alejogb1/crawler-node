import { PlaywrightCrawler } from '@crawlee/playwright';

// Website class to store the site-specific details
class Website {
    constructor(name, url, titleSelector, bodySelector) {
        this.name = name;
        this.url = url;
        this.titleSelector = titleSelector;
        this.bodySelector = bodySelector;
    }
}

// Site data array…
const siteData = [
    ['Nvidia', 'https://nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite', 'h1', 'div.title-description'],
];

// Initialize the websites array
const websites = siteData.map(data => new Website(...data));

// Function to create the crawler and scrape the content
async function scrapeWebsite(website) {
    const crawler = new PlaywrightCrawler();

    await crawler.run([{
        url: website.url,
        handler: async ({ page, request, log }) => {
            log.info(`Scraping ${website.name} - ${request.url}`);

            const title = await page.textContent(website.titleSelector);
            const body = await page.textContent(website.bodySelector);
            
            await context.enqueue_links(
                selector='a.group.cursor-pointer.px-4.py-5.text-small.bg-alpha3',
                strategy='all',
            )
    
            console.log(`Title: ${title}\nContent: ${body}\n`);
        }
    }]);
}

// Scrape each website with its corresponding path
(async () => {
    await scrapeWebsite(websites[0]);
})();