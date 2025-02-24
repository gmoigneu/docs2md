from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from io import BytesIO
from docling.document_converter import DocumentConverter
from docling.datamodel.base_models import DocumentStream, InputFormat
import uvicorn
import os
# Create FastAPI app
app = FastAPI(
    title="Document to Markdown Converter",
    description="API for converting various document formats to Markdown using Docling",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://docs2md.nls.io"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Initialize the document converter
converter = DocumentConverter()

@app.post("/tomd")
async def convert_to_markdown(file: UploadFile):
    """
    Convert uploaded document to Markdown format.
    
    Supported formats:
    - PDF
    - DOCX
    - XLSX
    - PPTX
    - HTML
    
    Returns a JSON object with:
    - filename: Original filename
    - content: Markdown content
    """
    # Check file extension
    filename = file.filename.lower()
    if not any(filename.endswith(ext) for ext in ['.pdf', '.docx', '.xlsx', '.pptx', '.html']):
        raise HTTPException(
            status_code=400, 
            detail="Unsupported file format. Please upload PDF, DOCX, XLSX, PPTX, or HTML files."
        )
    
    try:
        # Read file content
        content = await file.read()
        
        # Create BytesIO object from content
        file_stream = BytesIO(content)
        
        # Create DocumentStream for Docling
        doc_stream = DocumentStream(name=filename, stream=file_stream)
        
        # Convert document to markdown
        result = converter.convert(doc_stream)
        
        # Get markdown content
        markdown_content = result.document.export_to_markdown()
        
        # Return JSON response with filename and content
        return {
            "filename": file.filename,
            "content": markdown_content
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conversion error: {str(e)}")

@app.get("/")
async def root():
    """Root endpoint that provides basic information about the API"""
    return {
        "message": "Document to Markdown Converter API",
        "usage": "POST a document file to /tomd endpoint to convert it to Markdown",
        "supported_formats": ["PDF", "DOCX", "XLSX", "PPTX", "HTML"]
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=os.getenv("PORT", 8000), reload=True) 