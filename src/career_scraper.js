import { PlaywrightCrawler, Dataset } from '@crawlee/playwright';
import fs from 'fs'; // Add this import at the top
import { createObjectCsvWriter } from 'csv-writer'; // Import csv-writer
import csv from 'csv-parser';

const knownATSDomains = [
    'greenhouse.io', 'lever.co', 'myworkdayjobs.com', 
    'freshteam.com', 'ashbyhq.com', 'icims.com', 
    'smartrecruiters.com', 'workable.com'
];

const careerPatterns = [
    'career', 'jobs', 'join', 'open-roles','apply',
    '/apply', '/jobsearch', '/search/', '/recruiting'
];

const crawler = new PlaywrightCrawler({
    async requestHandler({ request, page, enqueueLinks, log }) {
        log.info(`Crawling ${request.url}`);
        
        // Extract all links from the page
        const links = await page.$$eval('a', as => as.map(a => ({ href: a.href, text: a.innerText.toLowerCase() })));
        
        // Filter links for careers or ATS pages
        const careerLinks = links.filter(link => 
            knownATSDomains.some(domain => link.href.includes(domain)) ||
            careerPatterns.some(pattern => link.text.includes(pattern))
);

        if (careerLinks.length > 0) {
            log.info(`Found careers/ATS page: ${careerLinks[0].href}`);
            // Save or process the careers/ATS link…
            console.log(`Careers page: ${careerLinks[0].href}`);
            careerLinksData.push(careerLinks[0]); // Store the found link
        } else {
            log.warning(`No careers page found for ${request.url}`);
        }
    }
});

(async () => {
    // List of seed URLs (main URLs of the companies)
    const seedUrls = [
        'https://luma.ai',
        'https://inworld.ai',
        'https://csm.com',
        'https://rosebud.ai',
        'https://iambic.ai',
        'https://genesistherapeutics.ai',
        'https://charmhealth.com',
        'https://isomorphiclabs.com',
        'https://quantum-systems.com',
        'https://shield.ai',
        'https://hermeus.com',
        'https://monumental.ai',
        'https://canvas.ai',
        'https://atypicalai.com',
        'https://koboldmetals.com',
        'https://orbitalmaterials.com',
        'https://cradle.bio',
        'https://physicx.com',
        'https://atomicindustries.com',
        'https://retrocausal.ai',
        'https://daedalus.com',
        'https://waabi.ai',
        'https://vayurobotics.com',
        'https://resistant.ai',
        'https://evolutioniq.com',
        'https://flawlessai.com',
        'https://deepdub.ai',
        'https://aionics.ai',
        'https://juacomputing.com',
        'https://greyparrot.ai',
        'https://elicit.org',
        'https://twelvelabs.io',
        'https://objectiveinc.com',
        'https://perplexity.ai',
        'https://groundlight.ai',
        'https://lightup.ai',
        'https://numbersstation.ai',
        'https://adept.ai',
        'https://myko.ai',
        'https://glyphic.ai',
        'https://cognition.com',
        'https://magic.xyz',
        'https://phind.com',
        'https://ema.ai',
        'https://pryon.com',
        'https://writer.com',
        'https://gather.ai',
        'https://ideogram.ai',
        'https://elevenlabs.io',
        'https://suno.ai',
        'https://runwayml.com',
        'https://modyfi.com',
        'https://figure.ai',
        'https://flipai.com',
        'https://mechanicalorchard.com',
        'https://binarly.io',
        'https://wraithwatch.com',
        'https://mistral.ai',
        'https://01.ai',
        'https://openai.com',
        'https://anthropic.com',
        'https://reka.ai',
        'https://together.ai',
        'https://sakana.ai',
        'https://nomic.ai',
        'https://sarvam.ai',
        'https://leap.ai',
        'https://mindsdb.com',
        'https://databricks.com',
        'https://huggingface.co',
        'https://adaptive.com',
        'https://chalk.ai',
        'https://predibase.com',
        'https://glaive.ai',
        'https://agentic.ai',
        'https://superagi.com',
        'https://modular.com',
        'https://xethub.com',
        'https://wandb.com',
        'https://trojai.ai',
        'https://protectai.com',
        'https://groq.com',
        'https://extropic.io',
        'https://lightmatter.com',
        'https://tenstorrent.com',
        'https://rebellions.ai',
        'https://xanadu.ai',
        'https://argilla.io',
        'https://cleanlab.io',
        'https://datalogy.ai',
        'https://martian.ai',
        'https://voltrondata.com'
    ];
    // Add seed URLs to the queue
    for (const url of seedUrls) {
        await crawler.addRequests([url]);
    }

    // Start the crawler
    await crawler.run();

    // Export the career links to CSV using csv-writer
    await csvWriter.writeRecords(careerLinksData); // Write to CSV file
    console.log(`Career links exported to ${outputFilePath}`);
})();