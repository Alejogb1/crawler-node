import json
import csv

# cargar datos del json
with open('dataset_myworkdayjobs_2024-11-03_12-30-38-606.json', 'r') as json_file:
    data = json.load(json_file)

# crear archivo csv
with open('jobs.csv', 'w', newline='') as csv_file:
    writer = csv.writer(csv_file)
    # escribir encabezado
    writer.writerow(['title', 'location', 'postedOn', 'url'])

    # iterar sobre cada trabajo y extraer los datos
    for job_entry in data:
        for job in job_entry.get('jobs', []):
            title = job.get('title', 'N/A')
            location = job.get('location', 'N/A')
            posted_on = job.get('postedOn', 'N/A')
            url = job.get('url', 'N/A')
            writer.writerow([title, location, posted_on, url])

print("Archivo CSV 'jobs.csv' creado exitosamente.")
