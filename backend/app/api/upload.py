from fastapi import APIRouter, File, UploadFile, HTTPException
import fitz
import docx

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        filename = file.filename.lower()

        if filename.endswith(".pdf"):
            text = extract_pdf_text(contents)
        elif filename.endswith(".docx"):
            text = extract_docx_text(contents)
        elif filename.endswith(".txt"):
            text = contents.decode("utf-8")
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")
        
        return {"content": text}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read file: {str(e)}")
    
def extract_pdf_text(binary):
    with fitz.open(stream=binary, filetype="pdf") as doc:
        return "\n".join([page.get_text() for page in doc])

def extract_docx_text(binary):
    from io import BytesIO
    doc = docx.Document(BytesIO(binary))
    return "\n".join([para.text for para in doc.paragraphs])