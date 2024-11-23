import os
import sys
import logging
from pathlib import Path
import google.generativeai as genai
from markdown import Markdown
from io import StringIO

class MarkdownProcessor:
    def __init__(self, api_key):
        """Initialize the processor with Google API credentials."""
        self.setup_logging()
        try:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel("gemini-1.5-flash")
        except Exception as e:
            logging.error(f"Failed to initialize Gemini API: {str(e)}")
            raise

    def setup_logging(self):
        """Configure logging settings."""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.StreamHandler(),
                logging.FileHandler('markdown_processing.log')
            ]
        )

    def read_markdown_file(self, file_path):
        """Read markdown content from a file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
            logging.info(f"Successfully read file: {file_path}")
            return content
        except Exception as e:
            logging.error(f"Error reading file {file_path}: {str(e)}")
            raise

    def markdown_to_text(self, markdown_content):
        """Convert markdown to plain text."""
        try:
            # Create a markdown converter
            md = Markdown()
            # Convert markdown to html
            html = md.convert(markdown_content)
            
            # Remove HTML tags (simple approach)
            # For more complex HTML processing, consider using BeautifulSoup
            text = html.replace('<p>', '').replace('</p>', '\n')
            return text
        except Exception as e:
            logging.error(f"Error converting markdown to text: {str(e)}")
            raise

    def process_content(self, text_content):
        """Process the content using Gemini API."""
        try:
            response = self.model.generate_content(text_content)
            return response.text
        except Exception as e:
            logging.error(f"Error processing content with Gemini: {str(e)}")
            raise

    def process_markdown_file(self, file_path):
        """Main method to process a markdown file."""
        try:
            # Verify file exists
            if not Path(file_path).exists():
                raise FileNotFoundError(f"File not found: {file_path}")

            # Read markdown content
            markdown_content = self.read_markdown_file(file_path)
            
            # Convert to text
            text_content = self.markdown_to_text(markdown_content)
            
            # Process with Gemini
            result = self.process_content(text_content)
            
            return result

        except Exception as e:
            logging.error(f"Failed to process markdown file: {str(e)}")
            raise

def main():
    # Check if API key is set in environment variables
    api_key = "AIzaSyBc6r8pZgDN6zw373sZeJCFZYIyXNULJTs"
    if not api_key:
        print("Please set GEMINI_API_KEY environment variable")
        sys.exit(1)

    # Specify the path to the markdown file
    file_path = 'markdown.txt'
    
    try:
        processor = MarkdownProcessor(api_key)
        result = processor.process_markdown_file(file_path)
        print("Processed Content:")
        print("-" * 50)
        print(result)
        
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()