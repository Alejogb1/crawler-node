import { PlaywrightCrawler, Dataset } from '@crawlee/playwright';

async function crawlWorkdayJobs(urls) {
    const crawler = new PlaywrightCrawler({
        async requestHandler({ page, request, log }) {
            log.info(`Processing ${request.url}`);
            await page.waitForSelector('li.css-1q2dra3');

            const jobs = await page.$$eval('li.css-1q2dra3', (elements) => {
                return elements.map((el) => {
                    const titleElement = el.querySelector('h3 a');
                    const idElement = el.querySelector('ul[data-automation-id="subtitle"] li');
                    const postedElement = el.querySelector('dd.css-129m7dg');

                    return {
                        title: titleElement.textContent,
                        href: titleElement.href,
                        id: idElement.textContent,
                        postedOn: postedElement.textContent,
                    };
                });
            });

            for (const job of jobs) {
                log.info(`Found job: ${job.title}`);
                await Dataset.pushData(job);
                // Here you can process each job, e.g., save to a file or database
            }

            // Check for next page and enqueue if exists
            const nextButton = await page.$('button[data-uxi-element-id="next"]:not([disabled])');
            if (nextButton) {
                await crawler.addRequests([{ url: request.url }]);
            }
        },
        maxRequestsPerCrawl: 100, // Adjust as needed
    });

    await crawler.run(urls);
}

export { crawlWorkdayJobs };