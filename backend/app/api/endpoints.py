# app/api/endpoints.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.openai_service import summarize_article_content

router = APIRouter()

class SummarizeRequest(BaseModel):
    content: str

@router.post("/summarize")
async def summarize_article(req: SummarizeRequest):
    try:
        result = summarize_article_content(req.content)
        if "error" in result:
            raise HTTPException(status_code=502, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

    
