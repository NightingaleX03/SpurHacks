import requests
import base64
from typing import List, Dict, Optional
import os

class GitHubAPI:
    def __init__(self):
        # Get GitHub token from environment variable (optional)
        self.token = os.getenv('GITHUB_TOKEN')
        self.base_url = "https://api.github.com"
        self.headers = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'SpurHacks-App'
        }
        
        if self.token:
            self.headers['Authorization'] = f'token {self.token}'
    
    def parse_github_url(self, url: str) -> tuple[str, str]:
        """Extract owner and repo name from GitHub URL"""
        # Remove https://github.com/ and split
        parts = url.replace('https://github.com/', '').split('/')
        if len(parts) < 2:
            raise ValueError("Invalid GitHub URL format")
        return parts[0], parts[1]
    
    def get_repository_tree(self, owner: str, repo: str, branch: str = 'main') -> List[Dict]:
        """Get the complete file tree of a repository. Tries 'main' first, then 'master'."""
        for branch_name in [branch, 'master']:
            url = f"{self.base_url}/repos/{owner}/{repo}/git/trees/{branch_name}?recursive=1"
            try:
                response = requests.get(url, headers=self.headers)
                print(f"[DEBUG] Requesting: {url}")
                print(f"[DEBUG] Status: {response.status_code}")
                print(f"[DEBUG] Response: {response.text}")
                if response.status_code == 404:
                    continue  # Try next branch
                response.raise_for_status()
                data = response.json()
                return data.get('tree', [])
            except requests.exceptions.RequestException as e:
                print(f"Error fetching repository tree for branch '{branch_name}': {e}")
                continue
        print(f"Repository tree not found for either 'main' or 'master' branch.")
        return []
    
    def get_file_content(self, owner: str, repo: str, path: str) -> Optional[str]:
        """Get the content of a specific file"""
        url = f"{self.base_url}/repos/{owner}/{repo}/contents/{path}"
        
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            
            data = response.json()
            if data.get('type') == 'file':
                # Decode base64 content
                content = base64.b64decode(data['content']).decode('utf-8')
                return content
            return None
        except requests.exceptions.RequestException as e:
            print(f"Error fetching file content: {e}")
            return None
    
    def get_repository_info(self, owner: str, repo: str) -> Optional[Dict]:
        """Get basic repository information"""
        url = f"{self.base_url}/repos/{owner}/{repo}"
        
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching repository info: {e}")
            return None
    
    def build_file_tree(self, tree_data: List[Dict]) -> List[Dict]:
        """Convert GitHub API tree data to hierarchical file structure"""
        file_map = {}
        root = []
        
        # Sort by path to ensure parents come before children
        sorted_tree = sorted(tree_data, key=lambda x: x['path'])
        
        for item in sorted_tree:
            path_parts = item['path'].split('/')
            current_level = root
            current_path = ''
            
            for part in path_parts:
                current_path = f"{current_path}/{part}" if current_path else part
                
                # Check if node already exists at this level
                existing_node = next((node for node in current_level if node['name'] == part), None)
                
                if not existing_node:
                    # Create new node
                    new_node = {
                        'name': part,
                        'type': 'folder' if item['type'] == 'tree' else 'file',
                        'path': item['path'] if current_path == item['path'] else current_path,
                        'children': [] if item['type'] == 'tree' else None,
                        'expanded': False
                    }
                    current_level.append(new_node)
                    existing_node = new_node
                
                # Move to next level if it's a folder
                if existing_node['type'] == 'folder':
                    current_level = existing_node['children']
        
        return root
    
    def analyze_tech_stack(self, tree_data: List[Dict]) -> List[str]:
        """Analyze repository to detect technology stack"""
        tech_stack = []
        file_paths = [item['path'] for item in tree_data]
        
        # Common technology indicators
        tech_indicators = {
            'package.json': 'Node.js',
            'requirements.txt': 'Python',
            'pom.xml': 'Java',
            'build.gradle': 'Java',
            'Cargo.toml': 'Rust',
            'go.mod': 'Go',
            'angular.json': 'Angular',
            'vue.config.js': 'Vue.js',
            'next.config.js': 'Next.js',
            'tailwind.config.js': 'TailwindCSS',
            'webpack.config.js': 'Webpack',
            'vite.config.js': 'Vite',
            'dockerfile': 'Docker',
            'docker-compose.yml': 'Docker',
            'kubernetes': 'Kubernetes',
            '.github/workflows': 'GitHub Actions',
            'tsconfig.json': 'TypeScript',
            'eslint.config.js': 'ESLint',
            'prettier.config.js': 'Prettier'
        }
        
        for file_path in file_paths:
            file_name = file_path.lower()
            for indicator, tech in tech_indicators.items():
                if indicator in file_name and tech not in tech_stack:
                    tech_stack.append(tech)
        
        return tech_stack

# Create a global instance
github_api = GitHubAPI() 