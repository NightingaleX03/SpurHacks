from google import genai
from google.genai import types
import os
from dotenv import load_dotenv
import json

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMNI_API_KEY"))

def split_text_into_chunks(text, chunk_size=500):
    words = text.split()
    for i in range(0, len(words), chunk_size):
        yield " ".join(words[i:i + chunk_size])

def generate_completion_with_context(chunk_text, context_instruction, max_tokens=50):
    combined_prompt = f"{context_instruction}\n\n{chunk_text}"
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=combined_prompt,
        config=types.GenerateContentConfig(
            max_output_tokens=max_tokens,
            thinking_config=types.ThinkingConfig(thinking_budget=0)
        ),
    )
    return response.text.strip()

def convert_raw_text_to_jsonl_with_context(output_file_path="alpaca_formatted_data.jsonl", chunk_size=500):
    # Load raw text files, ignoring non-UTF-8 characters
    with open("scraped_content.txt", "r", encoding="utf-8", errors="ignore") as f:
        knowledge_text = f.read()

    with open("mermaid_diagrams_p_and_code.txt", "r", encoding="utf-8", errors="ignore") as f:
        code_text = f.read()

    scraped_pairs = []

    # Context for understanding and explanation
    context = (
        "Extract only the most relevant and educational parts of the text that help explain "
        "what each diagram is, what it is used for, how to interpret it, and how to create it. "
        "Focus on:\n"
        "- Clear definitions of the diagram type (e.g., sequence, flowchart, Gantt, cloud architecture).\n"
        "- Step-by-step instructions on how to read or create the diagram.\n"
        "- Syntax or code examples (e.g., Mermaid, PlantUML).\n"
        "- Key terms, roles (actors/components), and relationships.\n"
        "- Real-world use cases and scenarios.\n\n"
        "Exclude:\n"
        "- UI or navigation instructions\n"
        "- Ads, footers, or unrelated headings\n"
        "- Version history or changelogs\n\n"
        "The output should be clean, structured, and grouped by diagram type if possible. "
        "Prefer explanatory paragraphs, lists, and code blocks."
    )

    # Context for Mermaid code extraction
    context2 = (
        "Extract only the Mermaid diagram code blocks from the text. "
        "These code blocks should include the Mermaid syntax starting with a keyword like "
        "`graph`, `sequenceDiagram`, `classDiagram`, `gantt`, or others supported by Mermaid. "
        "Return only the raw code between the ```mermaid code fences, without extra explanation, "
        "UI descriptions, or unrelated markdown.\n\n"
        "Include all relevant Mermaid code blocks that define actual diagrams, such as:\n"
        "- Flowcharts (graph TD or LR)\n"
        "- Sequence diagrams (sequenceDiagram)\n"
        "- Class diagrams (classDiagram)\n"
        "- Gantt charts (gantt)\n"
        "- State diagrams, entity relationships, user journeys, etc.\n\n"
        "Only return code blocks. Do not include headings, commentary, or descriptive text."
    )

    chunks = list(split_text_into_chunks(knowledge_text, chunk_size=chunk_size))
    chunks2 = list(split_text_into_chunks(code_text, chunk_size=chunk_size))

    # Process explanatory chunks
    for i, chunk in enumerate(chunks):
        print(f"Processing explanation chunk {i + 1}/{len(chunks)}...")
        completion = generate_completion_with_context(chunk, context, max_tokens=50)
        scraped_pairs.append({
            "instruction": chunk,
            "response": completion
        })

    # Process Mermaid code chunks
    for i, chunk in enumerate(chunks2):
        print(f"Processing code chunk {i + 1}/{len(chunks2)}...")
        completion = generate_completion_with_context(chunk, context2, max_tokens=50)
        scraped_pairs.append({
            "instruction": chunk,
            "response": completion
        })

    # Write to JSONL
    with open(output_file_path, "w", encoding="utf-8", errors="ignore") as f_out:
        for pair in scraped_pairs:
            instruction = str(pair["instruction"]).encode("utf-8", errors="ignore").decode("utf-8", errors="ignore").strip()
            response = str(pair["response"]).encode("utf-8", errors="ignore").decode("utf-8", errors="ignore").strip()

            json.dump({"instruction": instruction, "response": response}, f_out)
            f_out.write("\n")

    print(f"✅ Alpaca-style data saved to {output_file_path}")

if __name__ == "__main__":
    convert_raw_text_to_jsonl_with_context("alpaca_formatted_data.jsonl", chunk_size=500)
