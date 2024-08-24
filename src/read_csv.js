import fs from 'fs';
import { createObjectCsvWriter } from 'csv-writer'; // Import csv-writer
import csv from 'csv-parser';

const outputFilePath = 'career_links.csv'; // Define the output file path
let careerLinksData = []; // Initialize an array to store career links

const csvWriter = createObjectCsvWriter({
    path: outputFilePath,
    header: [
        { id: 'href', title: 'URL' },
        { id: 'text', title: 'Text' }
    ]
});

// Function to read seed URLs from CSV file
async function readSeedUrlsFromCsv(filePath) {
    return new Promise((resolve, reject) => {
        const seedUrls = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                if (row.company_webiste_url) {
                    seedUrls.push(row.company_webiste_url);
                }
            })
            .on('end', () => {
                resolve(seedUrls);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

// Function to get seed URLs
async function getSeedUrls() {
    try {
        console.log('Reading seed URLs from companies.csv...');
        const seedUrls = await readSeedUrlsFromCsv('companies.csv');
        return seedUrls;
    } catch (error) {
        console.error('Error reading seed URLs from CSV:', error);
        return [];
    }
}

// Add this function at the end of the file
async function main() {
    const logStream = fs.createWriteStream('url_log.txt', {flags: 'w'});
    const log = (message) => {
        console.log(message);
        logStream.write(message + '\n');
    };

    log('Starting to read seed URLs...');
    const seedUrls = await getSeedUrls();
    log(`Found ${seedUrls.length} seed URLs:`);
    seedUrls.forEach((url, index) => {
        log(`${index + 1}. ${url}`);
    });
    
    fs.writeFileSync('all_urls.txt', seedUrls.join('\n'), 'utf8');
    log('All URLs have been written to all_urls.txt');
    logStream.end();
}

// Replace the existing getSeedUrls() call with this:
main().catch(error => console.error('Error in main function:', error));