from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, Dict, List
from datetime import datetime
from enum import Enum

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

class UserRole(str, Enum):
    ENTERPRISE_EMPLOYER = "enterprise_employer"
    ENTERPRISE_EMPLOYEE = "enterprise_employee"
    EDUCATION_USER = "education_user"

class PermissionType(str, Enum):
    READ = "read"
    WRITE = "write"
    ADMIN = "admin"

class CodebaseShare(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    owner_id: str
    owner_email: str
    company_id: str
    created_at: datetime
    updated_at: datetime
    is_public: bool = False
    tech_stack: List[str] = []
    total_files: int = 0
    total_size: int = 0
    codebase_data: Optional[dict] = None  # Store the actual codebase content

class CodebasePermission(BaseModel):
    id: str
    codebase_id: str
    user_id: str
    user_email: str
    permission: PermissionType
    granted_by: str
    granted_at: datetime
    expires_at: Optional[datetime] = None

class Company(BaseModel):
    id: str
    name: str
    owner_id: str
    created_at: datetime
    settings: dict = {}

class User(BaseModel):
    id: str
    email: str
    role: UserRole
    company_id: Optional[str] = None
    created_at: datetime
    settings: dict = {}

class GrantPermissionRequest(BaseModel):
    codebase_id: str
    grantee_email: str  # The employee to be granted access
    permission: PermissionType
    expires_at: Optional[datetime] = None
    grantor_email: str  # The admin/employer making the request

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