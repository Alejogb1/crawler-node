import requests
import csv
import pandas as pd
from io import StringIO
import re

# Authorization headers
headers = {
    'Authorization': 'Bearer jina_b930d01d88ba47d68dd261a3c4a57efchwmV3-MzssRlreusWjRdXuCoGGJ8',
    'X-Wait-For-Selector': 'body, a[data-uxi-element-id="jobItem"]'
}

# Path to the local CSV file containing Workday URLs in the fourth column
input_csv_file = 'jobs.csv'

# Initialize an empty list to store the processed data
processed_data = []

# Read the URLs from the fourth column of the CSV file
try:
    df = pd.read_csv(input_csv_file)
    csv_urls = df.iloc[:, 3].dropna().tolist()  # Extract URLs from the fourth column and remove any NaNs
except Exception as e:
    print(f"Error reading {input_csv_file}: {e}")
    csv_urls = []  # Set an empty list to avoid further issues

# Function to parse content into title, URL, and markdownContent
def parse_content(content, original_url):
    # Use regex or specific string parsing to separate each section
    title_match = re.search(r"Title:\s*(.*)\n", content)
    title = title_match.group(1) if title_match else "No Title Available"
    
    url_source_match = re.search(r"URL Source:\s*(https?://[^\s]+)", content)
    url_source = url_source_match.group(1) if url_source_match else original_url
    
    # Extract all content after "Markdown Content:"
    markdown_content_match = re.search(r"Markdown Content:\s*\n?\s*(.*)", content, re.DOTALL)
    markdown_content = markdown_content_match.group(1) if markdown_content_match else "No Markdown Content Available"
    
    return [title, url_source, markdown_content]

# Function to process each CSV file content to LLM-ready format
def process_csv_content(csv_text, original_url):
    # Parse the content for Title, URL, and Markdown Content
    structured_content = parse_content(csv_text, original_url)
    processed_data.append(structured_content)

# Iterate over CSV URLs, fetch and process each file
for url in csv_urls:
    jina_url = f'https://r.jina.ai/{url}'  # Construct the Jina URL

    try:
        # Fetch the content from Jina
        response = requests.get(jina_url, headers=headers)
        
        # Check for a successful request
        if response.status_code == 200:
            # Process the CSV content and pass the original URL
            process_csv_content(response.text, url)
        else:
            print(f"Failed to fetch {jina_url}: Status code {response.status_code}")
    except Exception as e:
        print(f"Error fetching {jina_url}: {e}")

# Output processed data to a new CSV file with structured columns
output_file = 'processed_content.csv'
with open(output_file, 'w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow(['Title', 'URL Source', 'Markdown Content'])  # Headers
    writer.writerows(processed_data)

print(f"Processed content saved to {output_file}")