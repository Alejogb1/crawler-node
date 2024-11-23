import pandas as pd
import google.generativeai as genai
import time
import logging
from tqdm import tqdm

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('gemini_processing.log')
    ]
)

# Gemini API configuration
GEMINI_API_KEY = "AIzaSyBc6r8pZgDN6zw373sZeJCFZYIyXNULJTs"  # Replace with your API key
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")

def process_with_gemini(markdown_content):
    """Process markdown content with Gemini API with retry logic"""
    max_retries = 3
    for attempt in range(max_retries):
        try:
            # Add a prompt to guide Gemini's analysis
            prompt = f"""Rewrite the StackOverflow title to maximize click-through rate (CTR) with a single, optimized title that sounds natural and human-made. Craft it in a way that feels conversational and intuitive, avoiding rigid, 'programmed' formats. The title should read like a genuine problem-solving statement, capturing the reader’s attention by clearly hinting at a quick, efficient solution. Use language that feels approachable and spontaneous, as if offering a helpful tip, rather than a formulaic answer. Return just one raw title as the output, prioritizing natural flow and engagement.

            My first suggestion is:

            {markdown_content}"""
            
            response = model.generate_content(prompt)
            return response.text
            
        except Exception as e:
            if attempt == max_retries - 1:  # Last attempt
                logging.error(f"Failed to process with Gemini after {max_retries} attempts: {str(e)}")
                return "Error processing content"
            time.sleep(2 ** attempt)  # Exponential backoff
    
    return "Error processing content"

def main():
    try:
        # Read the processed forum content
        input_file = 'forum_processed_content.csv'
        logging.info(f"Reading input file: {input_file}")
        df = pd.read_csv(input_file)
        
        # Initialize list to store Gemini responses
        gemini_responses = []
        
        # Process each markdown content with Gemini
        logging.info("Processing markdown content with Gemini API")
        for content in tqdm(df['Title'], desc="Processing Title with Gemini"):
            # Add delay to respect rate limits
            time.sleep(1)
            
            # Process content
            response = process_with_gemini(content)
            gemini_responses.append(response)
        
        # Add Gemini responses as a new column
        df['Gemini Response'] = gemini_responses
        
        # Save to new CSV file
        output_file = 'title_processed_content_with_gemini.csv'
        df.to_csv(output_file, index=False, encoding='utf-8')
        logging.info(f"Processed content saved to {output_file}")
        
    except Exception as e:
        logging.error(f"An error occurred: {str(e)}")
        raise

if __name__ == "__main__":
    main()