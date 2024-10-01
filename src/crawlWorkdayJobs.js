import { PlaywrightCrawler, RequestQueue, Dataset } from '@crawlee/playwright';

export async function crawlWorkdayJobs(workdayUrls) {
    const requestQueue = await RequestQueue.open();

    const crawler = new PlaywrightCrawler({
        requestHandler: async ({ page, request, log }) => {
            log.info(`Scraping ${request.url}`);

            // Wait for the page to load completely
            await page.waitForLoadState();

            // Add your selector logic here
            const jobLinks = await page.evaluate(() => {
                // Example selector logic, adjust as needed
                const links = Array.from(document.querySelectorAll('a[data-uxi-element-id="jobItem"]'));
                return links.map(link => ({
                    url: link.href,
                    title: link.textContent.trim(),
                }));
            });

            if (jobLinks.length === 0) {
                log.info(`No job links found on ${request.url}`);
            } else {
                for (const job of jobLinks) {
                    await requestQueue.addRequest({
                        url: job.url,
                        userData: {
                            title: job.title,
                        },
                    });
                    await Dataset.pushData(job);
                }
                log.info(`Enqueued ${jobLinks.length} job links from ${request.url}`);
            }
        },
    });

    await crawler.run(workdayUrls.map(url => ({ url })));
}