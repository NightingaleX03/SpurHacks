# StackSketch – Intelligent Software Diagram Assistant

StackSketch is an AI-powered tool that generates, edits, and maintains software system diagrams with real-time collaboration, deep code understanding. Designed with solutions archiects in mind, StackSketch autmotes the diagram creation process to make time for strategic, high-level design and innovation

---

## 🚀 Features

### 🏗️ Diagram Generation
- Create **architecture, UML, enitity relationship diagramss and more from scratch** using vague or detailed prompts.
- Supports multiple architecture styles: **Monolith**, **Microservices**, **Serverless**, etc.
- Apply **design constraints** (e.g., AWS, GCP, Azure services, specific frameworks).
- Suggest multiple layout options and architectural strategies.
- Export to Confluence, PNG, or SVG.

### ✍️ Real-Time Editing & Collaboration
- Edit any diagrams **live** with teammates.
- Suggest **smart edits** based on code changes or new requirements.
- Track and highlight architecture-impacting updates automatically.
- Maintain **multiple diagrams per project** with full version history.

### 🔍 Deep Codebase Understanding
- The alogrithm will use RAG to understand your codebase and instantly generate diagrams using **semantic search**.
- **Query your current codebase**:  
  _"How does the login system work?"_  
  _"Where is the business logic for payment validation?"_
- **Trace feature flows** across files and layers, with file path links in generated visuals.
- Automatically update diagrams as your code evolves.
- **Onboarding Made Easy** 

### 🧠 AI Capabilities
- Powered by a **fine-tuned LLaMA 3 2B model**.
- Uses **A fine-tuned model** to provide code-accurate insights.
- Refines understanding with **code context**, not just comments or docstrings.

### 👋 Onboarding Made Easy
- Help new developers onboard faster with interactive architectural overviews and smart, visual queries that explain your codebase from day one.

---

## 🛠️ Tech Stack

| Component     | Tech Used         |
|---------------|-------------------|
| Frontend      | Angular            |
| Backend       | FastAPI            |
| AI Model      | LLaMA 3 (fine-tuned) |

---

## 📦 Getting Started

1. **Clone the repository:**

   ```bash
    git clone [<repository-url>](https://github.com/NightingaleX03/SpurHacks.git)
   
2. **Run Backend:**

Open a new terminal and navigate to the server directory, create a virtual environment, and install the required dependencies:
   ```bash
    cd server
    python3 -m venv venv
    source venv/bin/activate    # On Windows, use: venv\Scripts\activate
    pip install -r requirements.txt
```
   
Then, run the command below. The backend will be running at: http://127.0.0.1:8000
Swagger API docs available at: http://127.0.0.1:8000/docs
   ```bash
     uvicorn main:app --reload
```

3. **Run Frontend**
Open a terminal and navigate to the server directory and install dependancies.
   ```bash
     cd client
     npm i

Once node_modules are added, run the command below, frontend will be running at: http://localhost:4200
  ```bash
    ng serve












  



