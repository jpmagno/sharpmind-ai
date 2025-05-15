from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from youtube_transcript_api import YouTubeTranscriptApi
from newspaper import Article
from urllib.parse import urlparse, parse_qs
import validators

router = APIRouter()

class ExtractRequest(BaseModel):
    url: str

@router.post("/extract")
async def extract_content(req: ExtractRequest):
    url = req.url.strip()

    if not validators.url(url):
        raise HTTPException(status_code=400, detail="Invalid URL")
    
    try:
        if "youtube.com" in url or "youtu.be" in url:
            video_id = extract_youtube_id(url)
            if not video_id:
                raise HTTPException(status_code=400, detail="Invalid Youtube URL")
            transcript = YouTubeTranscriptApi.get_transcript(video_id)
            text = " ".join([entry['text'] for entry in transcript])
            return {"content": text}
        
        article = Article(url)
        article.download()
        article.parse()
        return {"content": article.text}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract content: {str(e)}")
    
def extract_youtube_id(url):
    try:
        if "youtu.be" in url:
            return urlparse(url).path[1:]
        if "youtube.com" in url:
            query = parse_qs(urlparse(url).query)
            return query.get("v", [None])[0]
    
    except:
        return None