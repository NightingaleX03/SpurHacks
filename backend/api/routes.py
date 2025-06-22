import httpx
import os
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid
from .git import github_api
from .gemini_client import get_gemini_client
from models.item import CodebaseShare, CodebasePermission, User, Company, UserRole, PermissionType
import json

router = APIRouter()

# In-memory storage for demonstration
codebases: dict = {}
permissions: dict = {}
companies: dict = {}
users: dict = {}

# Add some sample data for testing
def initialize_sample_data():
    """Initialize sample data for testing the codebase sharing system"""
    # Sample company from client/src/assets/data/sample-data.json
    sample_company = Company(
        id="comp_1",
        name="TechCorp Solutions",
        owner_id="sarah.johnson@techcorp-solutions.com",
        created_at=datetime.now()
    )
    companies[sample_company.id] = sample_company
    
    # Sample users from client/src/assets/data/sample-data.json
    sample_employer = User(
        id="emp_1",
        email="sarah.johnson@techcorp-solutions.com",
        role=UserRole.ENTERPRISE_EMPLOYER,
        company_id=sample_company.id,
        created_at=datetime.now()
    )
    users[sample_employer.email] = sample_employer
    
    sample_employee_1 = User(
        id="emp_2", 
        email="mike.chen@techcorp-solutions.com",
        role=UserRole.ENTERPRISE_EMPLOYEE,
        company_id=sample_company.id,
        created_at=datetime.now()
    )
    users[sample_employee_1.email] = sample_employee_1

    sample_employee_2 = User(
        id="emp_3", 
        email="emma.rodriguez@techcorp-solutions.com",
        role=UserRole.ENTERPRISE_EMPLOYEE,
        company_id=sample_company.id,
        created_at=datetime.now()
    )
    users[sample_employee_2.email] = sample_employee_2
    
    # Sample codebase
    sample_codebase = CodebaseShare(
        id="codebase-1",
        name="Sample Project",
        description="A sample codebase for testing",
        owner_id=sample_employee_1.email,
        owner_email=sample_employee_1.email,
        company_id=sample_company.id,
        created_at=datetime.now(),
        updated_at=datetime.now(),
        is_public=False,
        tech_stack=["Python", "Angular", "FastAPI"],
        total_files=150,
        total_size=1024000
    )
    codebases[sample_codebase.id] = sample_codebase
    
    # Grant permission to employee
    employee_permission = CodebasePermission(
        id="perm-1",
        codebase_id=sample_codebase.id,
        user_id=sample_employee_1.email,
        user_email=sample_employee_1.email,
        permission=PermissionType.READ,
        granted_by=sample_employee_1.email,
        granted_at=datetime.now()
    )
    permissions[employee_permission.id] = employee_permission

# Initialize sample data
initialize_sample_data()

# --- Data Persistence ---
DATA_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'shared_codebases.json')

def json_converter(o):
    if isinstance(o, datetime):
        return o.isoformat()

def save_data():
    """Saves the in-memory data stores to a JSON file."""
    try:
        # Convert all Pydantic models to dictionaries before saving
        codebases_dict = {k: v.dict() for k, v in codebases.items()}
        permissions_dict = {k: v.dict() for k, v in permissions.items()}
        companies_dict = {k: v.dict() for k, v in companies.items()}
        users_dict = {k: v.dict() for k, v in users.items()}

        with open(DATA_FILE, 'w') as f:
            json.dump({
                "codebases": codebases_dict,
                "permissions": permissions_dict,
                "companies": companies_dict,
                "users": users_dict
            }, f, default=json_converter, indent=4)
    except Exception as e:
        print(f"Error saving data: {e}")

def load_data():
    """Loads data from the JSON file into the in-memory stores."""
    global codebases, permissions, companies, users
    try:
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE, 'r') as f:
                data = json.load(f)
                
                # Convert loaded dictionaries back into Pydantic models, skipping any null values
                codebases = {k: CodebaseShare(**v) for k, v in data.get("codebases", {}).items() if v}
                permissions = {k: CodebasePermission(**v) for k, v in data.get("permissions", {}).items() if v}
                companies = {k: Company(**v) for k, v in data.get("companies", {}).items() if v}
                users = {k: User(**v) for k, v in data.get("users", {}).items() if v}
        else:
            # If no data file, initialize with sample data and save it
            initialize_sample_data()
            save_data()
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error loading data or file not found, initializing with sample data. Error: {e}")
        initialize_sample_data()
        save_data()

# Load data at startup
load_data()

class AnalyzeRequest(BaseModel):
    url: str

class FileContentRequest(BaseModel):
    owner: str
    repo: str
    path: str

class ChatRequest(BaseModel):
    message: str
    context: str

class ShareCodebaseRequest(BaseModel):
    name: str
    description: Optional[str] = None
    is_public: bool = False
    user_email: str
    company_id: str
    codebase_data: Optional[dict] = None  # Add this to store the actual codebase content

class GrantPermissionRequest(BaseModel):
    codebase_id: str
    grantor_email: str
    grantee_email: str
    permission: PermissionType
    expires_at: Optional[datetime] = None

class SaveCodebaseRequest(BaseModel):
    codebase_id: str
    name: str
    description: Optional[str] = None
    owner: str
    repo: str
    file_tree: List[dict]
    tech_stack: List[str]
    repo_info: dict
    total_files: int
    user_email: str
    company_id: str
    is_public: bool = False

class GenerateDiagramRequest(BaseModel):
    prompt: str
    diagram_type: str

# Dummy storage for demonstration
diagrams = {}

def get_server_folder_info():
    """Get information about the server folder structure and contents"""
    server_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'server')
    
    if not os.path.exists(server_path):
        return "Server folder not found in the expected location."
    
    info = {
        "folder_structure": [],
        "main_py_summary": "",
        "resources": []
    }
    
    # Get folder structure
    for root, dirs, files in os.walk(server_path):
        rel_path = os.path.relpath(root, server_path)
        if rel_path == '.':
            rel_path = 'server'
        else:
            rel_path = f'server/{rel_path}'
        
        for file in files:
            file_path = os.path.join(rel_path, file)
            file_size = os.path.getsize(os.path.join(root, file))
            info["folder_structure"].append({
                "path": file_path,
                "size": f"{file_size} bytes"
            })
    
    # Get main.py summary
    main_py_path = os.path.join(server_path, 'main.py')
    if os.path.exists(main_py_path):
        try:
            with open(main_py_path, 'r', encoding='utf-8') as f:
                content = f.read()
                info["main_py_summary"] = f"main.py contains {len(content.split())} words and implements a FastAPI application with authentication endpoints."
        except Exception as e:
            info["main_py_summary"] = f"Could not read main.py: {str(e)}"
    
    # Get resources info
    resources_path = os.path.join(server_path, 'resources')
    if os.path.exists(resources_path):
        try:
            for file in os.listdir(resources_path):
                file_path = os.path.join(resources_path, file)
                if os.path.isfile(file_path):
                    file_size = os.path.getsize(file_path)
                    info["resources"].append({
                        "name": file,
                        "size": f"{file_size} bytes"
                    })
        except Exception as e:
            info["resources"].append(f"Error reading resources: {str(e)}")
    
    return info

def get_full_repository_info():
    """Get comprehensive information about the entire repository structure"""
    # Get the project root directory (3 levels up from backend/api/routes.py)
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    
    repo_info = {
        "project_structure": {},
        "folder_summaries": {},
        "tech_stack_analysis": {},
        "file_descriptions": {},
        "total_files": 0,
        "total_size": 0
    }
    
    # Define important folders to analyze
    important_folders = ['client', 'backend', 'server']
    
    # Define key files to analyze for descriptions
    key_files_to_analyze = [
        'main.py', 'package.json', 'angular.json', 'app.component.ts', 
        'requirements.txt', 'README.md', 'app.routes.ts', 'app.config.ts',
        'gemini_client.py', 'routes.py', 'git.py', 'auth.service.ts',
        'codebase.service.ts', 'enterprise.service.ts', 'theme.service.ts'
    ]
    
    def analyze_file_content(file_path):
        """Analyze file content to generate a description"""
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                
            if not content.strip():
                return "Empty file"
            
            # Get file extension
            _, ext = os.path.splitext(file_path)
            
            # Analyze based on file type
            if ext == '.py':
                return analyze_python_file(content, os.path.basename(file_path))
            elif ext == '.ts':
                return analyze_typescript_file(content, os.path.basename(file_path))
            elif ext == '.json':
                return analyze_json_file(content, os.path.basename(file_path))
            elif ext == '.md':
                return analyze_markdown_file(content, os.path.basename(file_path))
            elif ext == '.html':
                return analyze_html_file(content, os.path.basename(file_path))
            elif ext == '.scss' or ext == '.css':
                return analyze_css_file(content, os.path.basename(file_path))
            else:
                return f"File with {len(content.split())} words and {len(content)} characters"
                
        except Exception as e:
            return f"Could not read file: {str(e)}"
    
    def analyze_python_file(content, filename):
        """Analyze Python file content"""
        lines = content.split('\n')
        imports = [line.strip() for line in lines if line.strip().startswith(('import ', 'from '))]
        classes = [line.strip() for line in lines if line.strip().startswith('class ')]
        functions = [line.strip() for line in lines if line.strip().startswith('def ')]
        
        description = f"Python file with {len(lines)} lines"
        
        if imports:
            description += f", imports: {', '.join([imp.split()[1] if 'import ' in imp else imp.split()[1] for imp in imports[:3]])}"
        
        if classes:
            description += f", classes: {', '.join([cls.split()[1].split('(')[0] for cls in classes[:3]])}"
        
        if functions:
            description += f", functions: {', '.join([func.split()[1].split('(')[0] for func in functions[:3]])}"
        
        # Look for specific patterns
        if 'FastAPI' in content:
            description += ", FastAPI application"
        if 'async def' in content:
            description += ", async functions"
        if '@router.' in content:
            description += ", API routes"
        if 'class' in content and 'BaseModel' in content:
            description += ", Pydantic models"
        
        return description
    
    def analyze_typescript_file(content, filename):
        """Analyze TypeScript file content"""
        lines = content.split('\n')
        imports = [line.strip() for line in lines if line.strip().startswith(('import ', 'from '))]
        classes = [line.strip() for line in lines if line.strip().startswith('export class ')]
        components = [line.strip() for line in lines if 'Component' in line and 'export' in line]
        services = [line.strip() for line in lines if 'Service' in line and 'export' in line]
        
        description = f"TypeScript file with {len(lines)} lines"
        
        if imports:
            description += f", imports: {', '.join([imp.split()[1] if 'import ' in imp else imp.split()[1] for imp in imports[:3]])}"
        
        if components:
            description += ", Angular component"
        if services:
            description += ", Angular service"
        if classes:
            description += f", classes: {', '.join([cls.split()[2].split('(')[0] for cls in classes[:3]])}"
        
        # Look for specific patterns
        if '@Component' in content:
            description += ", Angular component decorator"
        if '@Injectable' in content:
            description += ", Angular injectable service"
        if 'HttpClient' in content:
            description += ", HTTP client usage"
        if 'Router' in content:
            description += ", routing functionality"
        
        return description
    
    def analyze_json_file(content, filename):
        """Analyze JSON file content"""
        try:
            import json
            data = json.loads(content)
            
            if filename == 'package.json':
                return f"Node.js package.json with dependencies: {', '.join(list(data.get('dependencies', {}).keys())[:5])}"
            elif filename == 'angular.json':
                return "Angular CLI configuration file"
            elif filename == 'tsconfig.json':
                return "TypeScript configuration file"
            else:
                return f"JSON file with {len(data)} top-level keys"
        except:
            return f"JSON file with {len(content)} characters"
    
    def analyze_markdown_file(content, filename):
        """Analyze Markdown file content"""
        lines = content.split('\n')
        headers = [line.strip() for line in lines if line.strip().startswith('#')]
        
        description = f"Markdown file with {len(lines)} lines"
        if headers:
            description += f", sections: {', '.join([h.strip('#').strip() for h in headers[:3]])}"
        
        return description
    
    def analyze_html_file(content, filename):
        """Analyze HTML file content"""
        lines = content.split('\n')
        tags = [line.strip() for line in lines if '<' in line and '>' in line]
        
        description = f"HTML file with {len(lines)} lines"
        if tags:
            description += f", contains HTML elements"
        
        return description
    
    def analyze_css_file(content, filename):
        """Analyze CSS/SCSS file content"""
        lines = content.split('\n')
        rules = [line.strip() for line in lines if '{' in line and '}' in line]
        
        description = f"CSS/SCSS file with {len(lines)} lines"
        if rules:
            description += f", contains {len(rules)} style rules"
        
        return description
    
    for folder in important_folders:
        folder_path = os.path.join(project_root, folder)
        if os.path.exists(folder_path):
            folder_info = {
                "files": [],
                "subfolders": [],
                "total_files": 0,
                "total_size": 0,
                "key_files": []
            }
            
            # Walk through the folder
            for root, dirs, files in os.walk(folder_path):
                rel_root = os.path.relpath(root, folder_path)
                if rel_root == '.':
                    rel_root = folder
                else:
                    rel_root = f"{folder}/{rel_root}"
                
                # Add subfolders
                for dir_name in dirs:
                    if not dir_name.startswith('.'):  # Skip hidden folders
                        folder_info["subfolders"].append(f"{rel_root}/{dir_name}")
                
                # Add files
                for file in files:
                    if not file.startswith('.'):  # Skip hidden files
                        file_path = os.path.join(root, file)
                        file_size = os.path.getsize(file_path)
                        rel_file_path = f"{rel_root}/{file}"
                        
                        file_info = {
                            "path": rel_file_path,
                            "size": file_size,
                            "size_formatted": f"{file_size} bytes"
                        }
                        
                        folder_info["files"].append(file_info)
                        folder_info["total_files"] += 1
                        folder_info["total_size"] += file_size
                        
                        # Identify key files and analyze their content
                        if file in key_files_to_analyze:
                            folder_info["key_files"].append(rel_file_path)
                            # Analyze file content for description
                            description = analyze_file_content(file_path)
                            repo_info["file_descriptions"][rel_file_path] = description
            
            repo_info["project_structure"][folder] = folder_info
            repo_info["total_files"] += folder_info["total_files"]
            repo_info["total_size"] += folder_info["total_size"]
            
            # Generate folder summary
            if folder == 'client':
                repo_info["folder_summaries"][folder] = f"Angular frontend with {folder_info['total_files']} files ({folder_info['total_size']} bytes total)"
            elif folder == 'backend':
                repo_info["folder_summaries"][folder] = f"FastAPI backend with {folder_info['total_files']} files ({folder_info['total_size']} bytes total)"
            elif folder == 'server':
                repo_info["folder_summaries"][folder] = f"Additional server with {folder_info['total_files']} files ({folder_info['total_size']} bytes total)"
    
    # Analyze tech stack based on file extensions
    tech_stack = set()
    for folder_info in repo_info["project_structure"].values():
        for file_info in folder_info["files"]:
            file_path = file_info["path"]
            if file_path.endswith('.ts') or file_path.endswith('.tsx'):
                tech_stack.add('TypeScript')
            elif file_path.endswith('.js') or file_path.endswith('.jsx'):
                tech_stack.add('JavaScript')
            elif file_path.endswith('.py'):
                tech_stack.add('Python')
            elif file_path.endswith('.html'):
                tech_stack.add('HTML')
            elif file_path.endswith('.scss') or file_path.endswith('.css'):
                tech_stack.add('CSS/SCSS')
            elif file_path.endswith('.json'):
                tech_stack.add('JSON')
            elif file_path.endswith('.md'):
                tech_stack.add('Markdown')
            elif 'angular.json' in file_path or 'package.json' in file_path:
                tech_stack.add('Angular')
            elif 'requirements.txt' in file_path:
                tech_stack.add('Python Dependencies')
    
    repo_info["tech_stack_analysis"] = list(tech_stack)
    
    return repo_info

@router.post("/github/analyze")
async def analyze_repo(req: AnalyzeRequest):
    try:
        owner, repo = github_api.parse_github_url(req.url)
        if not owner or not repo:
            raise HTTPException(status_code=400, detail="Invalid GitHub URL")
        
        tree = github_api.get_repository_tree(owner, repo)
        file_tree = github_api.build_file_tree(tree)
        
        # Simple tech stack detection based on file extensions
        tech_stack = github_api.analyze_tech_stack(tree)
        
        # Get repo info
        repo_info = github_api.get_repository_info(owner, repo)

        return {
            "owner": owner,
            "repo": repo,
            "file_tree": file_tree,
            "tech_stack": list(tech_stack),
            "repo_info": repo_info,
            "total_files": len(tree)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/github/content/{owner}/{repo}")
async def get_file_content(owner: str, repo: str, path: str):
    try:
        content = github_api.get_file_content(owner, repo, path)
        return {"content": content}
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"File not found or error fetching content: {e}")

@router.get("/chatbot/test")
async def test_chatbot():
    """Test endpoint to check if the chatbot is working"""
    gemini_client = get_gemini_client()
    if not gemini_client:
        return {
            "status": "error",
            "message": "Gemini client not available",
            "details": "GEMINI_API_KEY environment variable is not set"
        }
    
    try:
        # Test with a simple prompt
        response = await gemini_client.generate_content("Hello", "This is a test.")
        return {
            "status": "success",
            "message": "Gemini client is working",
            "response": response[:100] + "..." if len(response) > 100 else response
        }
    except Exception as e:
        return {
            "status": "error",
            "message": "Gemini client test failed",
            "details": str(e)
        }

def get_fallback_response(message: str, context: str) -> str:
    """Provide a simple fallback response when Gemini API is not available"""
    message_lower = message.lower()
    
    # Basic keyword-based responses
    if any(word in message_lower for word in ['hello', 'hi', 'hey']):
        return "Hello! I'm here to help you with your codebase. What would you like to know?"
    
    elif any(word in message_lower for word in ['help', 'what can you do']):
        return "I can help you understand your codebase structure, explain code, suggest improvements, and answer questions about your project. Just ask me anything!"
    
    elif any(word in message_lower for word in ['structure', 'files', 'folders']):
        return "I can see you're asking about the codebase structure. This appears to be a full-stack application with frontend and backend components. What specific part would you like to know more about?"
    
    elif any(word in message_lower for word in ['error', 'bug', 'problem', 'issue']):
        return "I can help you debug issues! Could you provide more details about the error you're encountering? Include error messages, file names, or specific code snippets if possible."
    
    elif any(word in message_lower for word in ['explain', 'what does', 'how does']):
        return "I'd be happy to explain that! Could you provide more context about what specific code or functionality you'd like me to explain?"
    
    elif any(word in message_lower for word in ['improve', 'optimize', 'better']):
        return "I can help you improve your code! What specific area would you like to optimize? Performance, readability, security, or something else?"
    
    else:
        return "I understand you're asking about your codebase. While I'm currently in fallback mode (Gemini API not configured), I can still help with basic questions. Could you rephrase your question or ask something more specific about your code structure, files, or functionality?"

@router.post("/chatbot/query")
async def chatbot_query(req: ChatRequest):
    """Chatbot endpoint using Gemini API with enhanced context"""
    print(f"[Chatbot] Received request: {req.message}")
    
    gemini_client = get_gemini_client()
    if not gemini_client:
        print("[Chatbot] Gemini client not available, using fallback")
        # Use fallback response when Gemini is not available
        fallback_response = get_fallback_response(req.message, req.context)
        return {"reply": fallback_response}
    
    try:
        print("[Chatbot] Gemini client available, generating response...")
        # Create a simpler context that doesn't rely on complex repository analysis
        simple_context = f"""
You are a helpful AI coding assistant. The user is working with a codebase and has the following context:

{req.context}

Please provide helpful, concise answers about the codebase, code structure, or any programming questions they might have.
"""
        
        response = await gemini_client.generate_content(req.message, simple_context)
        print(f"[Chatbot] Generated response: {response[:100]}...")
        return {"reply": response}
    except Exception as e:
        print(f"[Chatbot ERROR] {e}")
        # Use fallback response when Gemini fails
        fallback_response = get_fallback_response(req.message, req.context)
        return {"reply": fallback_response}

@router.post("/diagrams/generate")
async def generate_diagram_endpoint(req: GenerateDiagramRequest):
    """
    Generates a Mermaid.js diagram using the Gemini API based on a user prompt.
    """
    gemini_client = get_gemini_client()
    if not gemini_client:
        # Fallback: Generate a simple diagram without Gemini API
        print("[WARNING] Gemini API key not configured. Using fallback diagram generation.")
        
        # Create a simple diagram based on the prompt and type
        fallback_diagrams = {
            "Sequence Diagram": f"""sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
    
    User->>Frontend: {req.prompt}
    Frontend->>Backend: Process Request
    Backend->>Database: Query Data
    Database-->>Backend: Return Data
    Backend-->>Frontend: Send Response
    Frontend-->>User: Display Result""",
            
            "Class Diagram": f"""classDiagram
    class User {{
        +String name
        +String email
        +login()
        +logout()
    }}
    class System {{
        +String name
        +process()
    }}
    User --> System : uses""",
            
            "Flowchart": f"""flowchart TD
    A[Start] --> B{{{req.prompt}}}
    B -->|Yes| C[Process]
    B -->|No| D[Skip]
    C --> E[End]
    D --> E""",
            
            "Component Diagram": f"""graph TB
    subgraph Frontend
        A[UI Component]
    end
    subgraph Backend
        B[API Service]
        C[Database]
    end
    A --> B
    B --> C""",
            
            "Activity Diagram": f"""flowchart TD
    A[Start] --> B{{{req.prompt}}}
    B --> C[Process Step 1]
    C --> D[Process Step 2]
    D --> E[Decision]
    E -->|Yes| F[Continue]
    E -->|No| G[End]
    F --> H[Final Step]
    H --> G""",
            
            "Use Case Diagram": f"""graph TD
    subgraph System
        A[User Management]
        B[Authentication]
        C[Data Processing]
    end
    subgraph Actors
        D[User]
        E[Admin]
    end
    D --> A
    D --> B
    E --> C""",
            
            "State Machine Diagram": f"""stateDiagram-v2
    [*] --> Idle
    Idle --> Processing: {req.prompt}
    Processing --> Success: Complete
    Processing --> Error: Fail
    Success --> Idle: Reset
    Error --> Idle: Reset""",
            
            "Deployment Diagram": f"""graph TB
    subgraph Client
        A[Web Browser]
    end
    subgraph Server
        B[Web Server]
        C[Application Server]
        D[Database Server]
    end
    A --> B
    B --> C
    C --> D""",
            
            "Package Diagram": f"""graph TB
    subgraph Package1
        A[Module A]
        B[Module B]
    end
    subgraph Package2
        C[Module C]
        D[Module D]
    end
    A --> C
    B --> D""",
            
            "Object Diagram": f"""graph TB
    A[User: john_doe]
    B[System: main_app]
    C[Database: user_db]
    A --> B
    B --> C""",
            
            "Communication Diagram": f"""sequenceDiagram
    participant A as User
    participant B as System
    participant C as Database
    
    A->>B: Request
    B->>C: Query
    C-->>B: Response
    B-->>A: Result""",
            
            "Interaction Overview": f"""flowchart TD
    A[Start] --> B[Main Flow]
    B --> C[Sub Flow 1]
    B --> D[Sub Flow 2]
    C --> E[End]
    D --> E""",
            
            "UML": f"""classDiagram
    class User {{
        +String name
        +String email
        +login()
        +logout()
    }}
    class System {{
        +String name
        +process()
    }}
    User --> System : uses"""
        }
        
        diagram_type = req.diagram_type
        if diagram_type in fallback_diagrams:
            mermaid_code = fallback_diagrams[diagram_type]
        else:
            mermaid_code = fallback_diagrams["Flowchart"]
        
        return {"mermaid_code": mermaid_code}

    # Construct a specialized prompt for the Gemini API
    full_prompt = f"""
    Act as an expert system architect. Based on the following user prompt and diagram type, generate a valid Mermaid.js diagram.
    The response should ONLY be the raw Mermaid.js code block, starting with 'graph' or 'sequenceDiagram' etc. Do not include any explanation or markdown code fences like ```mermaid.

    USER PROMPT: "{req.prompt}"
    DIAGRAM TYPE: "{req.diagram_type}"
    """

    try:
        # Generate the diagram code using Gemini
        mermaid_code = await gemini_client.generate_content(prompt=full_prompt)
        
        # Basic validation to ensure the response looks like Mermaid code
        if not any(keyword in mermaid_code for keyword in ['graph', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 'gantt']):
            raise ValueError("The generated output does not appear to be a valid Mermaid diagram.")

        return {"mermaid_code": mermaid_code.strip()}

    except Exception as e:
        print(f"Error generating diagram with Gemini: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate diagram. Error: {str(e)}")

@router.get("/diagrams/test")
async def test_diagram():
    """
    Test endpoint that returns a simple Mermaid diagram for debugging
    """
    test_diagram = """graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug needed]
    C --> E[End]
    D --> E"""
    
    return {"mermaid_code": test_diagram}

@router.get("/diagrams/{diagram_id}")
async def get_diagram(diagram_id: str):
    diagram = diagrams.get(diagram_id)
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    return diagram

@router.post("/diagrams/chat")
async def diagram_chat(req: ChatRequest):
    """
    Handle chatbot queries about a Mermaid diagram using Gemini.
    """
    try:
        gemini_client = get_gemini_client()
        if not gemini_client:
            return {"reply": "The AI model is not configured, so I can't analyze the diagram. Please contact support."}

        prompt = f"""
        You are an expert software architect and a specialist in reading and understanding Mermaid diagrams.
        A user has a question about a diagram they have generated.

        Here is the Mermaid code for the diagram:
        ---
        {req.context}
        ---

        Here is the user's question:
        "{req.message}"

        Based on the Mermaid diagram provided, please answer the user's question.
        Analyze the diagram's structure, components, and relationships to provide a comprehensive answer.
        If the question is about changing the diagram, you can suggest specific modifications to the Mermaid code.
        If the question is unclear or cannot be answered from the diagram alone, ask for clarification.
        Keep your response helpful and concise.
        """

        response = gemini_client.generate_content(prompt)
        return {"reply": response.text}

    except Exception as e:
        print(f"Error in diagram chat: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while processing your chat message.")

@router.get("/enterprise/resources")
async def get_enterprise_resources():
    # This would fetch from a database in a real application
    return {
        "resources": [
            {"name": "Onboarding Guide", "type": "pdf", "url": "#"},
            {"name": "Security Best Practices", "type": "document", "url": "#"}
        ]
    }

@router.get("/server/info")
async def get_server_info():
    """Get information about the server folder structure and contents"""
    try:
        server_info = get_server_folder_info()
        return server_info
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching server info: {str(e)}")

@router.get("/repository/info")
async def get_repository_info():
    """Get comprehensive information about the entire repository structure"""
    try:
        repo_info = get_full_repository_info()
        return repo_info
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching repository info: {str(e)}")

@router.get("/github/repo-info")
async def get_repo_info(owner: str, repo: str):
    """
    An endpoint to fetch general repository information like star count, forks, etc.
    """
    try:
        repo_info = github_api.get_repository_info(owner, repo)
        return repo_info
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching repository info: {str(e)}")

# Helper functions
def get_user_by_email(email: str) -> Optional[User]:
    return users.get(email)

def get_company_by_id(company_id: str) -> Optional[Company]:
    return companies.get(company_id)

def can_access_codebase(user_email: str, codebase_id: str) -> bool:
    """Check if user has access to a codebase"""
    user = get_user_by_email(user_email)
    if not user:
        return False
    
    # Employers can access all codebases in their company
    if user.role == UserRole.ENTERPRISE_EMPLOYER:
        codebase = codebases.get(codebase_id)
        if codebase and codebase.company_id == user.company_id:
            return True
    
    # Check explicit permissions
    for perm in permissions.values():
        if (perm.codebase_id == codebase_id and 
            perm.user_email == user_email and 
            (not perm.expires_at or perm.expires_at > datetime.now())):
            return True
    
    # Check if user is the owner of the codebase
    codebase = codebases.get(codebase_id)
    if codebase and codebase.owner_email == user_email:
        return True
    
    return False

def get_user_codebases(user_email: str) -> List[CodebaseShare]:
    """Get all codebases a user has access to"""
    user = get_user_by_email(user_email)
    if not user:
        return []
    
    accessible_codebases = []
    
    for codebase in codebases.values():
        if can_access_codebase(user_email, codebase.id):
            accessible_codebases.append(codebase)
    
    return accessible_codebases

# Codebase Sharing Endpoints
@router.post("/codebases/share")
async def share_codebase(req: ShareCodebaseRequest):
    """Share a codebase with the organization"""
    try:
        # Create new codebase entry
        codebase_id = str(uuid.uuid4())
        now = datetime.now()
        
        # Sanitize codebase_data to ensure it's JSON serializable
        codebase_data_serializable = None
        if req.codebase_data:
            try:
                # Force conversion of any complex objects to JSON-compatible types
                # Using default=str is a fallback for any non-standard objects
                codebase_data_json_str = json.dumps(req.codebase_data, default=str)
                codebase_data_serializable = json.loads(codebase_data_json_str)
            except TypeError as e:
                print(f"Could not make codebase_data serializable: {e}")
                raise HTTPException(status_code=400, detail="Codebase data contains non-serializable content.")

        # Extract data from the sanitized codebase_data
        tech_stack = []
        total_files = 0
        if codebase_data_serializable:
            tech_stack = codebase_data_serializable.get('tech_stack', [])
            total_files = codebase_data_serializable.get('total_files', 0)
        
        codebase = CodebaseShare(
            id=codebase_id,
            name=req.name,
            description=req.description,
            owner_id=req.user_email,
            owner_email=req.user_email,
            company_id=req.company_id,
            created_at=now,
            updated_at=now,
            is_public=req.is_public,
            tech_stack=tech_stack,
            total_files=total_files,
            codebase_data=codebase_data_serializable
        )
        
        codebases[codebase_id] = codebase
        
        # Automatically grant access to employer
        user = get_user_by_email(req.user_email)
        if user and user.role == UserRole.ENTERPRISE_EMPLOYEE:
            # Find employer in the same company
            for other_user in users.values():
                if (other_user.role == UserRole.ENTERPRISE_EMPLOYER and 
                    other_user.company_id == req.company_id):
                    # Grant admin access to employer
                    permission = CodebasePermission(
                        id=str(uuid.uuid4()),
                        codebase_id=codebase_id,
                        user_id=other_user.email,
                        user_email=other_user.email,
                        permission=PermissionType.ADMIN,
                        granted_by=req.user_email,
                        granted_at=now
                    )
                    permissions[permission.id] = permission
                    break
        
        # If codebase is public, grant access to all employees in the company
        if req.is_public:
            for other_user in users.values():
                if (other_user.role == UserRole.ENTERPRISE_EMPLOYEE and 
                    other_user.company_id == req.company_id and
                    other_user.email != req.user_email):  # Don't grant to self (they're already the owner)
                    # Grant read access to all employees
                    permission = CodebasePermission(
                        id=str(uuid.uuid4()),
                        codebase_id=codebase_id,
                        user_id=other_user.email,
                        user_email=other_user.email,
                        permission=PermissionType.READ,
                        granted_by=req.user_email,
                        granted_at=now
                    )
                    permissions[permission.id] = permission
        
        # Save data after sharing
        save_data()
        
        return {"message": "Codebase shared successfully", "codebase_id": codebase_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sharing codebase: {str(e)}")

@router.post("/codebases/grant-permission")
async def grant_permission(req: GrantPermissionRequest):
    """Grant permission to access a codebase"""
    try:
        # Check if grantor has permission to grant access
        grantor = get_user_by_email(req.grantor_email)
        if not grantor:
            raise HTTPException(status_code=404, detail="Grantor not found")

        # Only employers or codebase owners can grant permissions
        codebase = codebases.get(req.codebase_id)
        if not codebase:
            raise HTTPException(status_code=404, detail="Codebase not found")

        can_grant = (
            grantor.role == UserRole.ENTERPRISE_EMPLOYER or
            codebase.owner_email == req.grantor_email
        )

        if not can_grant:
            raise HTTPException(status_code=403, detail="Insufficient permissions to grant access")

        # Check if grantee exists
        grantee = get_user_by_email(req.grantee_email)
        if not grantee:
            raise HTTPException(status_code=404, detail="Grantee not found")

        # Create permission for the grantee
        permission = CodebasePermission(
            id=str(uuid.uuid4()),
            codebase_id=req.codebase_id,
            user_id=req.grantee_email,
            user_email=req.grantee_email,
            permission=req.permission,
            granted_by=req.grantor_email,
            granted_at=datetime.now(),
            expires_at=req.expires_at
        )

        permissions[permission.id] = permission
        return {"message": "Permission granted successfully", "permission_id": permission.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error granting permission: {str(e)}")

@router.get("/codebases/my-codebases")
async def get_my_codebases(user_email: str):
    """Get all codebases the user has access to"""
    try:
        accessible_codebases = get_user_codebases(user_email)
        return {"codebases": accessible_codebases}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching codebases: {str(e)}")

@router.get("/codebases/{codebase_id}")
async def get_codebase(codebase_id: str, user_email: str):
    """Get specific codebase details"""
    try:
        if not can_access_codebase(user_email, codebase_id):
            raise HTTPException(status_code=403, detail="Access denied")
        
        codebase = codebases.get(codebase_id)
        if not codebase:
            raise HTTPException(status_code=404, detail="Codebase not found")
        
        return codebase
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching codebase: {str(e)}")

@router.get("/codebases/{codebase_id}/permissions")
async def get_codebase_permissions(codebase_id: str, user_email: str):
    """Get permissions for a specific codebase"""
    try:
        if not can_access_codebase(user_email, codebase_id):
            raise HTTPException(status_code=403, detail="Access denied")
        
        codebase_permissions = [
            perm for perm in permissions.values() 
            if perm.codebase_id == codebase_id
        ]
        
        return {"permissions": codebase_permissions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching permissions: {str(e)}")

@router.post("/codebases/save")
async def save_codebase(req: SaveCodebaseRequest):
    """Save codebase data"""
    try:
        # Check if user has access to the codebase
        if not can_access_codebase(req.user_email, req.codebase_id):
            raise HTTPException(status_code=403, detail="Access denied")
        
        codebase = codebases.get(req.codebase_id)
        if not codebase:
            raise HTTPException(status_code=404, detail="Codebase not found")
        
        # Update codebase data
        codebase.name = req.name
        codebase.description = req.description
        codebase.owner_id = req.owner
        codebase.owner_email = req.owner
        codebase.company_id = req.company_id
        codebase.is_public = req.is_public
        codebase.codebase_data = req.codebase_data
        
        # Update permissions
        for perm in permissions.values():
            if perm.codebase_id == req.codebase_id:
                perm.user_id = req.owner
                perm.user_email = req.owner
                perm.permission = PermissionType.READ
                perm.granted_by = req.owner
                perm.granted_at = datetime.now()
        
        # Save data after saving
        save_data()
        
        return {"message": "Codebase saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving codebase: {str(e)}")

@router.get("/codebases/{codebase_id}/data")
async def get_codebase_data(codebase_id: str, user_email: str):
    """Get full codebase data including file tree and content"""
    try:
        if not can_access_codebase(user_email, codebase_id):
            raise HTTPException(status_code=403, detail="Access denied")
        
        codebase = codebases.get(codebase_id)
        if not codebase:
            raise HTTPException(status_code=404, detail="Codebase not found")
        
        # Return the full codebase data
        return {
            "id": codebase.id,
            "name": codebase.name,
            "description": codebase.description,
            "owner": codebase.owner_email,
            "repo": codebase.name,  # Use name as repo for now
            "file_tree": codebase.codebase_data.get('file_tree', []) if codebase.codebase_data else [],
            "tech_stack": codebase.tech_stack,
            "repo_info": codebase.codebase_data.get('repo_info', {}) if codebase.codebase_data else {},
            "total_files": codebase.total_files,
            "is_public": codebase.is_public,
            "created_at": codebase.created_at,
            "updated_at": codebase.updated_at
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching codebase data: {str(e)}")
