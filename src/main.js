import { PlaywrightCrawler, RequestQueue, Dataset } from '@crawlee/playwright';
import { crawlWorkdayJobs } from './crawlWorkdayJobs.js';

// Website class to store the site-specific details
class Website {
    constructor(name, url, titleSelector, bodySelector) {
        this.name = name;
        this.url = url;
        this.titleSelector = titleSelector;
        this.bodySelector = bodySelector;
    }
}

// Site data array
const siteData = [
    ['Pinecone', 'https://inworld.ai/careers', 'h1', 'a.group.cursor-pointer.px-4.py-5.text-small.bg-alpha3'],
];

const workdayUrls = [
    'https://ag.wd3.myworkdayjobs.com/en-US/Airbus',
    // Add other Workday URLs here
];


// Initialize the websites array

const websites = siteData.map(data => new Website(...data));

// Function to extract job links from Greenhouse pages
async function extractGreenhouseJobLinks(page) {
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

// Function to create the crawler and scrape the content
async function scrapeWebsite(website) {
    const requestQueue = await RequestQueue.open(); // Open or create a new RequestQueue

    const crawler = new PlaywrightCrawler({
        requestHandler: async ({ page, request, log }) => {
            log.info(`Scraping ${request.url}`);

            // Handle Greenhouse-specific logic
            if (website.url.includes('greenhouse')) {
                await page.waitForSelector('tr.job-post');
                const jobLinks = await extractGreenhouseJobLinks(page);

                // Enqueue the job links into the RequestQueue
                for (const job of jobLinks) {
                    await requestQueue.addRequest({
                        url: job.url,
                        userData: {
                            title: job.title,
                            location: job.location,
                        },
                    });
                    await Dataset.pushData(job);
                }

                log.info(`Enqueued ${jobLinks.length} job links from ${website.name}`);
            } else {
                const body = await page.textContent(website.bodySelector);
                log.info(`Content: ${body}`);
            }
        },
    });

    await crawler.run([{
        url: website.url,
    }]);
}

// Scrape each website with its corresponding path
(async () => {
    await scrapeWebsite(websites[0]); // Greenhouse site example
    console.log('Crawling Workday jobs');
    await crawlWorkdayJobs(workdayUrls);
})();