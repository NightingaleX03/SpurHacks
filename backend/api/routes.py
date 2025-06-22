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
        with open(DATA_FILE, 'w') as f:
            json.dump({
                "codebases": codebases,
                "permissions": permissions,
                "companies": companies,
                "users": users
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
                codebases = data.get("codebases", {})
                permissions = data.get("permissions", {})
                companies = data.get("companies", {})
                users = data.get("users", {})
                
                # Convert string dates back to datetime objects
                for codebase in codebases.values():
                    if isinstance(codebase.get('created_at'), str):
                        codebase['created_at'] = datetime.fromisoformat(codebase['created_at'])
                    if isinstance(codebase.get('updated_at'), str):
                        codebase['updated_at'] = datetime.fromisoformat(codebase['updated_at'])
                # Similar conversions can be added for other data types if needed
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

@router.post("/chatbot/query")
async def chatbot_query(req: ChatRequest):
    """Chatbot endpoint using Gemini API with enhanced context"""
    gemini_client = get_gemini_client()
    if not gemini_client:
        raise HTTPException(status_code=500, detail="Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable.")
    
    try:
        # Get full repository information
        repo_info = get_full_repository_info()
        
        # Create a comprehensive context with repository structure and file descriptions
        enhanced_context = f"""
{req.context}

COMPLETE REPOSITORY STRUCTURE:
This is a full-stack web application with the following structure:

PROJECT OVERVIEW:
- Total Files: {repo_info['total_files']}
- Total Size: {repo_info['total_size']} bytes
- Technologies: {', '.join(repo_info['tech_stack_analysis'])}

FOLDER BREAKDOWN:
{chr(10).join([f"- {folder}: {summary}" for folder, summary in repo_info['folder_summaries'].items()])}

DETAILED STRUCTURE WITH FILE DESCRIPTIONS:
"""
        
        # Add detailed structure for each folder with file descriptions
        for folder, folder_info in repo_info['project_structure'].items():
            enhanced_context += f"\n{folder.upper()} FOLDER:\n"
            enhanced_context += f"- Total files: {folder_info['total_files']}\n"
            enhanced_context += f"- Key files: {', '.join(folder_info['key_files'][:5])}\n"  # Show first 5 key files
            enhanced_context += f"- Subfolders: {', '.join(folder_info['subfolders'][:5])}\n"  # Show first 5 subfolders
            
            # Add file descriptions for key files
            if folder_info['key_files']:
                enhanced_context += f"- Key file descriptions:\n"
                for key_file in folder_info['key_files'][:5]:  # Show descriptions for first 5 key files
                    if key_file in repo_info['file_descriptions']:
                        description = repo_info['file_descriptions'][key_file]
                        enhanced_context += f"  * {key_file}: {description}\n"
            
            # Show some important files
            important_files = [f for f in folder_info['files'] if any(key in f['path'] for key in ['main.py', 'package.json', 'angular.json', 'app.component.ts', 'requirements.txt'])]
            if important_files:
                enhanced_context += f"- Important files: {', '.join([f['path'] for f in important_files[:3]])}\n"
        
        # Add a summary of all file descriptions
        if repo_info['file_descriptions']:
            enhanced_context += f"\nDETAILED FILE ANALYSIS:\n"
            for file_path, description in list(repo_info['file_descriptions'].items())[:10]:  # Show first 10 descriptions
                enhanced_context += f"- {file_path}: {description}\n"
        
        response = await gemini_client.generate_content(req.message, enhanced_context)
        return {"reply": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")

@router.post("/diagrams/generate")
async def generate_diagram(req: dict):
    # In a real app, you'd use a more robust way to generate diagrams
    # For now, we'll just store and retrieve it
    diagram_id = str(len(diagrams) + 1)
    diagrams[diagram_id] = {
        "prompt": req.get("prompt"),
        "code": f"graph TD;\n    A[Start] --> B({req.get('type')});\n    B --> C{{End}};"
    }
    return {"diagram_id": diagram_id}

@router.get("/diagrams/{diagram_id}")
async def get_diagram(diagram_id: str):
    diagram = diagrams.get(diagram_id)
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    return diagram

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
        
        # Extract data from codebase_data if provided
        tech_stack = []
        total_files = 0
        if req.codebase_data:
            tech_stack = req.codebase_data.get('tech_stack', [])
            total_files = req.codebase_data.get('total_files', 0)
        
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
            codebase_data=req.codebase_data
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
