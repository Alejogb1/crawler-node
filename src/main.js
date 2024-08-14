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
    ['O\'Reilly', 'https://www.oreilly.com', 'h1', 'div.title-description'],
    ['Pinecone', 'https://www.pinecone.io/careers/', 'h1', 'a.group.cursor-pointer.px-4.py-5.text-small.bg-alpha3'],
    // lever.co 
    ['Replicant', 'https://jobs.lever.co/replicant', 'h1', 'a.posting-title'],
    ['cgsfederal', 'https://jobs.lever.co/cgsfederal', 'h1', 'a.posting-title'],
    ['hadrian', 'https://jobs.lever.co/hadrian/', 'h1', 'a.posting-title'],
    // greenhouse 
    ['greenhouse', 'https://job-boards.greenhouse.io/axs', 'h1', 'a.posting-title'],
];

// Initialize the websites array
const websites = siteData.map(data => new Website(...data));

// Function to create the crawler and scrape the content
async function scrapeWebsite(website) {
    async function extractGreenhouseJobLinks(page) {    
        // Extract all job links
        const jobLinks = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('tr.job-post td.cell a'));
            return links.map(link => ({
                url: link.href,
                title: link.querySelector('p.body:not(.body__secondary)').textContent.trim(),
                location: link.querySelector('p.body__secondary').textContent.trim(),
            }));
        });
    
        return jobLinks;
    }
    
    const crawler = new PlaywrightCrawler({
        requestHandler: async ({ page, request, log, enqueueLinks }) => {
            log.info(`Scraping ${request.url}`);
            const body = await page.textContent(website.bodySelector);
            // verify if the website url has 'greenhouse'
            if (website.url.includes('greenhouse')) { 
                await page.wait_for_selector('tr.job-post', state='visible')
                extractGreenhouseJobLinks(website)
            } else {
                await enqueueLinks({
                    selector: website.bodySelector,
                    strategy: 'all',
                });
    
            }
            // Return title and body for use in the handler
            return { title, body }; // Added …return statement
        },
    });

    await crawler.run([{
        url: website.url,
        handler: async ({ page, request, log, context }) => { //… Corrected to use context
            const { title, body } = await context.requestHandler({ page, request, log, context }); // Call requestHandler to get title and body
            log.info(`Scraping ${website.name} - ${request.url}`);
            console.log(`Title: ${title}\nContent: ${body}\n`);
        }
    }]);
}

// Scrape each website with its corresponding path
(async () => {
    await scrapeWebsite(websites[4]);
})()