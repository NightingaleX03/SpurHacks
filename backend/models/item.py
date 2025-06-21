from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, Dict

router = APIRouter()

# --- Models ---
class PromptRequest(BaseModel):
    prompt: str

class Diagram(BaseModel):
    id: int
    name: str
    content: str

class EditDiagramRequest(BaseModel):
    name: Optional[str] = None
    content: Optional[str] = None

class DeployRequest(BaseModel):
    config: dict

class ScanRequest(BaseModel):
    target: str

class SubscribeRequest(BaseModel):
    user_id: int
    plan: str

# --- In-memory storage for demonstration ---
diagrams: Dict[int, Diagram] = {}

# --- Endpoints ---

@router.post("/prompt")
def handle_prompt(req: PromptRequest):
    # Dummy response
    return {
        "suggestions": ["monolith", "microservices", "serverless"],
        "diagrams": []
    }

@router.get("/diagrams/{diagram_id}")
def get_diagram(diagram_id: int):
    diagram = diagrams.get(diagram_id)
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    return diagram

@router.post("/diagrams")
def create_diagram(diagram: Diagram):
    if diagram.id in diagrams:
        raise HTTPException(status_code=400, detail="Diagram ID already exists")
    diagrams[diagram.id] = diagram
    return diagram

@router.put("/diagrams/{diagram_id}")
def edit_diagram(diagram_id: int, req: EditDiagramRequest):
    diagram = diagrams.get(diagram_id)
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    update_data = req.dict(exclude_unset=True)
    updated = diagram.copy(update=update_data)
    diagrams[diagram_id] = updated
    return updated

@router.get("/code/trace")
def code_trace(feature: str = Query(..., description="Feature to trace in codebase")):
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