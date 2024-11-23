import csv
import re
import os
from datetime import datetime

def slugify(title):
    # Generate a slug from the title
    slug = re.sub(r'[^a-zA-Z0-9]+', '-', title.strip().lower())
    slug = re.sub(r'-+', '-', slug).strip('-')  # Remove leading/trailing hyphens
    return slug

def format_title(title):
    # Strip leading/trailing whitespace and newlines
    title = title.strip()
    
    # Check if title contains both single and double quotes
    if '"' in title and "'" in title:
        # Replace single quotes with two single quotes and wrap in double quotes
        formatted_title = '"' + title.replace('"', '\\"') + '"'
    elif '"' in title:
        # Use single quotes to wrap the title
        formatted_title = "'" + title.replace("'", "''") + "'"
    else:
        # Default to double quotes
        formatted_title = '"' + title + '"'
    return formatted_title

def create_markdown_file(title, content, date, output_folder):
    # Generate slug and file name
    slug = slugify(title)
    file_name = f"{slug}.md"
    file_path = os.path.join(output_folder, file_name)

    # Format the title to handle special characters
    formatted_title = format_title(title)
    markdown_content = f"""---
title: {formatted_title}
date: '2024-11-08'
id: '{slug}'
---

{content}
"""
    
    # Write content to markdown file
    with open(file_path, 'w') as file:
        file.write(markdown_content)
    print(f"Markdown file created: {file_path}")

def process_csv(input_csv, output_folder):
    # Create output directory if it doesn't exist
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    # Get current date for the markdown files
    date = datetime.now().strftime('%Y-%m-%d')
    
    # Read CSV and process each row
    with open(input_csv, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            title = row['title']
            content = row['markdown_content']
            create_markdown_file(title, content, date, output_folder)

# Example usage
output_folder = 'markdown_files'  # Specify your destination folder
process_csv('title_content.csv', output_folder)
