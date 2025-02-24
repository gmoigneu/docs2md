# Document to Markdown Converter API

A FastAPI-based service that converts various document formats to Markdown using Docling.

## Features

- Simple REST API with a single endpoint (`/tomd`)
- Supports multiple document formats:
  - PDF
  - DOCX
  - XLSX
  - PPTX
  - HTML
- Returns plain text Markdown

## Requirements

- Python 3.8+
- Dependencies listed in `requirements.txt`

## Installation

1. Clone the repository
2. Navigate to the API directory
3. Install dependencies:

```bash
pip install -r requirements.txt
```

## Running the Server

Start the server with:

```bash
uvicorn main:app --reload
```

The server will start on http://127.0.0.1:8000 by default.

For production deployment, use:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## API Documentation

Once the server is running, you can access:
- Interactive API documentation: http://127.0.0.1:8000/docs
- Alternative documentation: http://127.0.0.1:8000/redoc

## API Usage

### Convert Document to Markdown

**Endpoint:** `POST /tomd`

**Request:**
- Content-Type: `multipart/form-data`
- Body: File upload with key `file`

**Response:**
- Content-Type: `text/plain`
- Body: Markdown text

### Example Usage

#### Using curl:

```bash
curl -X POST "http://127.0.0.1:8000/tomd" \
  -H "accept: text/plain" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/document.pdf"
```

#### Using Python requests:

```python
import requests

url = "http://127.0.0.1:8000/tomd"
files = {"file": open("document.pdf", "rb")}
response = requests.post(url, files=files)
print(response.text)
```

#### Using JavaScript/Fetch API:

```javascript
const formData = new FormData();
formData.append('file', document.querySelector('#fileInput').files[0]);

fetch('http://127.0.0.1:8000/tomd', {
  method: 'POST',
  body: formData
})
.then(response => response.text())
.then(markdown => console.log(markdown))
.catch(error => console.error('Error:', error));
```

## Error Handling

The API returns appropriate HTTP status codes:
- `400`: Invalid file format
- `500`: Conversion error

Error responses include a JSON object with a `detail` field explaining the error.