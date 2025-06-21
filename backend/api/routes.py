import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from .git import github_api

router = APIRouter()

# Request/response models
class PromptRequest(BaseModel):
    prompt: str

class Diagram(BaseModel):
    id: int
    name: str
    content: str

class EditDiagramRequest(BaseModel):
    name: str = None
    content: str = None

class TraceRequest(BaseModel):
    feature: str

class DeployRequest(BaseModel):
    config: dict

class ScanRequest(BaseModel):
    target: str

class SubscribeRequest(BaseModel):
    user_id: int
    plan: str

class GitHubRepoRequest(BaseModel):
    url: str

class FileContentRequest(BaseModel):
    owner: str
    repo: str
    path: str

# Dummy storage for demonstration
diagrams = {}

@router.post("/prompt")
def handle_prompt(req: PromptRequest):
    # Dummy response
    return {"suggestions": ["monolith", "microservices", "serverless"], "diagrams": []}

@router.get("/diagrams/{diagram_id}")
def get_diagram(diagram_id: int):
    diagram = diagrams.get(diagram_id)
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    return diagram

@router.post("/diagrams")
def create_diagram(diagram: Diagram):
    diagrams[diagram.id] = diagram
    return diagram

@router.put("/diagrams/{diagram_id}")
def edit_diagram(diagram_id: int, req: EditDiagramRequest):
    diagram = diagrams.get(diagram_id)
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    if req.name:
        diagram.name = req.name
    if req.content:
        diagram.content = req.content
    diagrams[diagram_id] = diagram
    return diagram

@router.get("/code/trace")
def code_trace(feature: str):
    # Dummy response
    return {"feature": feature, "trace": ["file1.py", "file2.py"]}

@router.post("/devops/deploy")
def devops_deploy(req: DeployRequest):
    # Dummy response
    return {"status": "Deployment triggered", "config": req.config}

@router.post("/security/scan")
def security_scan(req: ScanRequest):
    # Dummy response
    return {"target": req.target, "vulnerabilities": []}

@router.post("/billing/subscribe")
def billing_subscribe(req: SubscribeRequest):
    # Dummy response
    return {"user_id": req.user_id, "plan": req.plan, "status": "Subscribed"}


class MermaidRequest(BaseModel):
    code: str  # Mermaid diagram code

@router.post("/mermaid/render")
async def render_mermaid(req: MermaidRequest):
    """
    Sends Mermaid code to the Mermaid Live Editor API and returns the rendered SVG.
    """
    # Mermaid Live Editor API endpoint for rendering SVG
    api_url = "https://mermaid.ink/svg"
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(api_url, content=req.code.encode("utf-8"))
            if response.status_code != 200:
                raise HTTPException(status_code=502, detail="Mermaid API error")
            return {"svg": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# GitHub API endpoints
@router.post("/github/analyze")
def analyze_repository(req: GitHubRepoRequest):
    """Analyze a GitHub repository and return its file tree and tech stack"""
    try:
        owner, repo = github_api.parse_github_url(req.url)
        
        # Get repository tree
        tree_data = github_api.get_repository_tree(owner, repo)
        if not tree_data:
            raise HTTPException(status_code=404, detail="Repository not found or is private")
        
        # Build hierarchical file tree
        file_tree = github_api.build_file_tree(tree_data)
        
        # Analyze tech stack
        tech_stack = github_api.analyze_tech_stack(tree_data)
        
        # Get repository info
        repo_info = github_api.get_repository_info(owner, repo)
        
        return {
            "owner": owner,
            "repo": repo,
            "file_tree": file_tree,
            "tech_stack": tech_stack,
            "repo_info": repo_info,
            "total_files": len([item for item in tree_data if item['type'] == 'blob'])
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing repository: {str(e)}")

@router.get("/github/content/{owner}/{repo}")
def get_file_content(owner: str, repo: str, path: str):
    """Get the content of a specific file from a GitHub repository"""
    try:
        content = github_api.get_file_content(owner, repo, path)
        if content is None:
            raise HTTPException(status_code=404, detail="File not found")
        
        return {
            "owner": owner,
            "repo": repo,
            "path": path,
            "content": content
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching file content: {str(e)}")

@router.get("/github/info/{owner}/{repo}")
def get_repository_info(owner: str, repo: str):
    """Get basic information about a GitHub repository"""
    try:
        repo_info = github_api.get_repository_info(owner, repo)
        if not repo_info:
            raise HTTPException(status_code=404, detail="Repository not found")
        
        return repo_info
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching repository info: {str(e)}")
