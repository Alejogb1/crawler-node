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
        const seedUrls = await readSeedUrlsFromCsv('companies.csv');
        return seedUrls;
    } catch (error) {
        console.error('Error reading seed URLs from CSV:', error);
        return [];
    }
}
