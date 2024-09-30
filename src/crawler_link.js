import { CheerioCrawler } from 'crawlee';

const crawler = new CheerioCrawler({
    maxRequestsPerCrawl: 50,
    async requestHandler({ $, request, enqueueLinks }) {
        // Extract all links from the body
        const links = $('body a').map((_, el) => $(el).attr('href')).get();
        
        console.log(`Links found on "${request.url}":`);
        links.forEach(link => console.log(link));

        await enqueueLinks();
    },
});

await crawler.run(['https://www.rosebud.ai/company']);