import { PlaywrightCrawler, RequestQueue, Dataset } from '@crawlee/playwright';

export async function crawlWorkdayJobs(workdayUrls) {
    const requestQueue = await RequestQueue.open();
    const dataset = await Dataset.open();

    const crawler = new PlaywrightCrawler({
        requestQueue,
        maxConcurrency: 5, // Ajusta según sea necesario
        retryOnBlocked: true,
        maxRequestRetries: 5,
        requestHandler: async ({ page, request, log }) => {
            log.info(`Scraping ${request.url}`);
                // Enhanced waiting strategy
                await Promise.race([
                    Promise.all([
                        page.waitForLoadState('networkidle', { timeout: 30000 }),
                        page.waitForSelector('a[data-uxi-element-id="jobItem"]', { timeout: 30000 }),
                    ]),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Page load timeout')), 45000)),
                ]);

                // Additional wait to ensure dynamic content is loaded
                await page.waitForTimeout(2000);


            try {
                const content = await page.content();
                console.log(content);
                await page.screenshot({ path: 'before-evaluate.png' });
                const jobLinks = await page.evaluate(() => {
                    console.log("antes de obtener links")
                    const links = Array.from(document.querySelectorAll('a[data-uxi-element-id="jobItem"]'));
                    console.log("\nLOST LINKS: ")
                    return links.map(link => (
                    console.log("\n",link),  
                    {
                        url: link.href,
                        title: link.textContent.trim(),
                    }));
                });
                for (const job of jobLinks) {
                    await requestQueue.addRequest({
                        url: job.url,
                        userData: {
                            title: job.title,
                            isJobPage: true,
                        },
                    });
                }
                log.info(`Enqueued ${jobLinks.length} job links from ${request.url}`);

        
            } catch (error) {
                log.error(`Error processing ${request.url}: ${error.message}`);
            }
        },
    });

    await crawler.run(workdayUrls.map(url => ({ url })));
}