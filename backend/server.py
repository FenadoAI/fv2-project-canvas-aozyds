from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import random
import hashlib

# AI agents
from ai_agents.agents import AgentConfig, SearchAgent, ChatAgent


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# AI agents init
agent_config = AgentConfig()
search_agent: Optional[SearchAgent] = None
chat_agent: Optional[ChatAgent] = None

# Website Idea Generator Data
TOPICS = [
    "fitness", "education", "food", "travel", "technology", "health", "finance", "entertainment",
    "fashion", "beauty", "pets", "home improvement", "gardening", "sports", "music", "art",
    "books", "productivity", "meditation", "sustainability", "gaming", "parenting", "dating",
    "career", "freelancing", "real estate", "cryptocurrency", "photography", "cooking", "recipes"
]

THEMES = [
    "minimalist", "luxury", "community-driven", "AI-powered", "mobile-first", "eco-friendly",
    "subscription-based", "marketplace", "social platform", "educational", "professional",
    "creative", "data-driven", "personalized", "collaborative", "automated", "gamified",
    "privacy-focused", "open-source", "enterprise", "local", "global", "niche", "mainstream"
]

TEMPLATES = [
    "{famous_site} for {field}",
    "{famous_site} but {theme}",
    "{famous_site} meets {other_site} for {field}",
    "A {theme} platform for {field}",
    "The {theme} solution for {field} professionals",
    "{famous_site} reimagined for {field}",
    "A {theme} marketplace for {field}",
    "The future of {field} - {theme} and {other_theme}",
    "{famous_site} + {other_site} = Perfect {field} platform",
    "Revolutionizing {field} with {theme} approach"
]

FAMOUS_SITES = [
    "Netflix", "Airbnb", "Uber", "Instagram", "TikTok", "LinkedIn", "Amazon", "eBay",
    "YouTube", "Spotify", "Pinterest", "Twitter", "Facebook", "Discord", "Reddit",
    "Slack", "Zoom", "Duolingo", "Coursera", "Medium", "GitHub", "Figma", "Notion"
]


def generate_idea():
    topic = random.choice(TOPICS)
    theme = random.choice(THEMES)
    template = random.choice(TEMPLATES)
    famous_site = random.choice(FAMOUS_SITES)
    other_site = random.choice([site for site in FAMOUS_SITES if site != famous_site])
    other_theme = random.choice([t for t in THEMES if t != theme])

    # Generate idea text based on template
    idea_text = template.format(
        famous_site=famous_site,
        field=topic,
        theme=theme,
        other_site=other_site,
        other_theme=other_theme
    )

    return {
        "idea_text": idea_text,
        "topic": topic,
        "theme": theme,
        "template": template
    }

# Main app
app = FastAPI(title="AI Agents API", description="Minimal AI Agents API with LangGraph and MCP support")

# API router
api_router = APIRouter(prefix="/api")


# Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str


# AI agent models
class ChatRequest(BaseModel):
    message: str
    agent_type: str = "chat"  # "chat" or "search"
    context: Optional[dict] = None


class ChatResponse(BaseModel):
    success: bool
    response: str
    agent_type: str
    capabilities: List[str]
    metadata: dict = Field(default_factory=dict)
    error: Optional[str] = None


class SearchRequest(BaseModel):
    query: str
    max_results: int = 5


class SearchResponse(BaseModel):
    success: bool
    query: str
    summary: str
    search_results: Optional[dict] = None
    sources_count: int
    error: Optional[str] = None


# Website Idea Generator Models
class WebsiteIdea(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    idea_text: str
    topic: str
    theme: str
    template: str
    upvotes: int = 0
    share_url: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)


class IdeaResponse(BaseModel):
    success: bool
    idea: Optional[WebsiteIdea] = None
    error: Optional[str] = None


class UpvoteResponse(BaseModel):
    success: bool
    upvotes: int
    error: Optional[str] = None


class PopularIdeasResponse(BaseModel):
    success: bool
    ideas: List[WebsiteIdea]
    total: int
    error: Optional[str] = None

# Routes
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]


# AI agent routes
@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(request: ChatRequest):
    # Chat with AI agent
    global search_agent, chat_agent
    
    try:
        # Init agents if needed
        if request.agent_type == "search" and search_agent is None:
            search_agent = SearchAgent(agent_config)
            
        elif request.agent_type == "chat" and chat_agent is None:
            chat_agent = ChatAgent(agent_config)
        
        # Select agent
        agent = search_agent if request.agent_type == "search" else chat_agent
        
        if agent is None:
            raise HTTPException(status_code=500, detail="Failed to initialize agent")
        
        # Execute agent
        response = await agent.execute(request.message)
        
        return ChatResponse(
            success=response.success,
            response=response.content,
            agent_type=request.agent_type,
            capabilities=agent.get_capabilities(),
            metadata=response.metadata,
            error=response.error
        )
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        return ChatResponse(
            success=False,
            response="",
            agent_type=request.agent_type,
            capabilities=[],
            error=str(e)
        )


@api_router.post("/search", response_model=SearchResponse)
async def search_and_summarize(request: SearchRequest):
    # Web search with AI summary
    global search_agent
    
    try:
        # Init search agent if needed
        if search_agent is None:
            search_agent = SearchAgent(agent_config)
        
        # Search with agent
        search_prompt = f"Search for information about: {request.query}. Provide a comprehensive summary with key findings."
        result = await search_agent.execute(search_prompt, use_tools=True)
        
        if result.success:
            return SearchResponse(
                success=True,
                query=request.query,
                summary=result.content,
                search_results=result.metadata,
                sources_count=result.metadata.get("tools_used", 0)
            )
        else:
            return SearchResponse(
                success=False,
                query=request.query,
                summary="",
                sources_count=0,
                error=result.error
            )
            
    except Exception as e:
        logger.error(f"Error in search endpoint: {e}")
        return SearchResponse(
            success=False,
            query=request.query,
            summary="",
            sources_count=0,
            error=str(e)
        )


@api_router.get("/agents/capabilities")
async def get_agent_capabilities():
    # Get agent capabilities
    try:
        capabilities = {
            "search_agent": SearchAgent(agent_config).get_capabilities(),
            "chat_agent": ChatAgent(agent_config).get_capabilities()
        }
        return {
            "success": True,
            "capabilities": capabilities
        }
    except Exception as e:
        logger.error(f"Error getting capabilities: {e}")
        return {
            "success": False,
            "error": str(e)
        }


# Website Idea Generator Routes
@api_router.post("/ideas/generate", response_model=IdeaResponse)
async def generate_website_idea():
    try:
        # Generate new idea
        idea_data = generate_idea()

        # Create WebsiteIdea object
        idea = WebsiteIdea(**idea_data)

        # Generate share URL (simple hash-based)
        share_hash = hashlib.md5(f"{idea.id}{idea.idea_text}".encode()).hexdigest()[:8]
        idea.share_url = f"/idea/{share_hash}"

        # Save to database
        await db.website_ideas.insert_one(idea.dict())

        return IdeaResponse(success=True, idea=idea)

    except Exception as e:
        logger.error(f"Error generating idea: {e}")
        return IdeaResponse(success=False, error=str(e))


@api_router.get("/ideas/popular", response_model=PopularIdeasResponse)
async def get_popular_ideas(limit: int = 20):
    try:
        # Get most upvoted ideas
        ideas_cursor = db.website_ideas.find().sort("upvotes", -1).limit(limit)
        ideas_docs = await ideas_cursor.to_list(length=limit)

        ideas = [WebsiteIdea(**doc) for doc in ideas_docs]

        # Get total count
        total = await db.website_ideas.count_documents({})

        return PopularIdeasResponse(success=True, ideas=ideas, total=total)

    except Exception as e:
        logger.error(f"Error getting popular ideas: {e}")
        return PopularIdeasResponse(success=False, ideas=[], total=0, error=str(e))


@api_router.get("/ideas/recent", response_model=PopularIdeasResponse)
async def get_recent_ideas(limit: int = 20):
    try:
        # Get most recent ideas
        ideas_cursor = db.website_ideas.find().sort("created_at", -1).limit(limit)
        ideas_docs = await ideas_cursor.to_list(length=limit)

        ideas = [WebsiteIdea(**doc) for doc in ideas_docs]

        # Get total count
        total = await db.website_ideas.count_documents({})

        return PopularIdeasResponse(success=True, ideas=ideas, total=total)

    except Exception as e:
        logger.error(f"Error getting recent ideas: {e}")
        return PopularIdeasResponse(success=False, ideas=[], total=0, error=str(e))


@api_router.get("/ideas/share/{share_hash}", response_model=IdeaResponse)
async def get_shared_idea(share_hash: str):
    try:
        # Find idea by share URL
        idea_doc = await db.website_ideas.find_one({"share_url": f"/idea/{share_hash}"})

        if not idea_doc:
            raise HTTPException(status_code=404, detail="Idea not found")

        idea = WebsiteIdea(**idea_doc)
        return IdeaResponse(success=True, idea=idea)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting shared idea: {e}")
        return IdeaResponse(success=False, error=str(e))


@api_router.post("/ideas/{idea_id}/upvote", response_model=UpvoteResponse)
async def upvote_idea(idea_id: str):
    try:
        # Update upvote count
        result = await db.website_ideas.update_one(
            {"id": idea_id},
            {"$inc": {"upvotes": 1}}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Idea not found")

        # Get updated idea to return current upvote count
        idea_doc = await db.website_ideas.find_one({"id": idea_id})
        upvotes = idea_doc["upvotes"] if idea_doc else 0

        return UpvoteResponse(success=True, upvotes=upvotes)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error upvoting idea: {e}")
        return UpvoteResponse(success=False, upvotes=0, error=str(e))

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging config
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    # Initialize agents on startup
    global search_agent, chat_agent
    logger.info("Starting AI Agents API...")
    
    # Lazy agent init for faster startup
    logger.info("AI Agents API ready!")


@app.on_event("shutdown")
async def shutdown_db_client():
    # Cleanup on shutdown
    global search_agent, chat_agent
    
    # Close MCP
    if search_agent and search_agent.mcp_client:
        # MCP cleanup automatic
        pass
    
    client.close()
    logger.info("AI Agents API shutdown complete.")
