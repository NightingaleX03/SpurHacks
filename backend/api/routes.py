import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

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
