import { PlaywrightCrawler, RequestQueue, Dataset } from "@crawlee/playwright";

export async function crawlWorkdayJobs(workdayUrls) {
  const requestQueue = await RequestQueue.open();

  const crawler = new PlaywrightCrawler({
    requestQueue,
    maxConcurrency: 5,
    retryOnBlocked: true,
    maxRequestRetries: 5,
    requestHandler: async ({ page, request, log }) => {
      log.info(`Scraping ${request.url}`);
      await page.waitForTimeout(2000);
      try {
        // Capture page content
        const content = await page.content();

        // Take a screenshot for debugging
        await page.screenshot({
          path: `screenshot-${Date.now()}.png`,
          fullPage: true,
        });

        // Extract job listing data
        const jobData = await page.evaluate(() => {
          const jobListings = Array.from(
            document.querySelectorAll('a[data-uxi-element-id="jobItem"]')
          ).map((link) => ({
            title: link.textContent.trim(),
            url: link.href,
          }));

          return jobListings.map((job) => {
            return {
              title: job.title,
              url: job.url,
              content: document.querySelector(".job-description").innerText, // Adjust selector as needed
            };
          });
        });

        log.info(`Enqueued ${jobData.length} job listings from ${request.url}`);

        // Separate each job listing into chunks
        const structuredJobs = jobData.map((job) => ({
          title: `Title: ${job.title}`,
          url: `URL Source: ${job.url}`,
          markdownContent: `
**Job Description:**
${job.content.split("\n").slice(0, 5).join("\n")}

**Requirements:**
${job.content.split("\n").slice(5, 10).join("\n")}

**Benefits and Salary:**
${job.content.split("\n").slice(10, 15).join("\n")}
          `,
        }));

        structuredJobs.forEach((job) =>
          log.info(`Job Details:\n${job.markdownContent}`)
        );

        // Store structured data
        await Dataset.pushData(structuredJobs);

        // Handle pagination
        await handlePagination(page, requestQueue, request.url, log);
      } catch (error) {
        log.error(`Error processing ${request.url}: ${error.message}`);
      }
    },
  });

  await crawler.run(workdayUrls.map((url) => ({ url })));
}

async function handlePagination(page, requestQueue, log) {
  try {
    const nextButton = await page.$('button[data-uxi-element-id="next"]');

    if (nextButton) {
      await nextButton.click();
      await Promise.race([
        page.waitForSelector('button[data-uxi-element-id="next"]', {
          timeout: 30000,
          state: "visible",
        }),
        page.waitForNavigation({ timeout: 30000 }),
      ]);
    } else {
      log.info("No more pages to process");
    }
  } catch (error) {
    log.error(`Pagination error: ${error.message}`);
    await page.screenshot({
      path: `pagination-error-${Date.now()}.png`,
      fullPage: true,
    });
  }
}
