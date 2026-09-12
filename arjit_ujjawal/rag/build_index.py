"""
AI SRE System - ChromaDB Indexing Pipeline
Builds a persistent vector index from JSON incident reports and Markdown operational runbooks.
"""

import os
import sys
import json
import logging
from pathlib import Path
from typing import List, Dict, Any, Tuple, Optional

import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("rag.build_index")

# Base paths
PROJECT_ROOT = Path(__file__).resolve().parent.parent
INCIDENTS_DIR = PROJECT_ROOT / "rag" / "data" / "incidents"
RUNBOOKS_DIR = PROJECT_ROOT / "rag" / "data" / "runbooks"
CHROMA_DB_DIR = PROJECT_ROOT / "rag" / "chroma_db"
COLLECTION_NAME = "sre_knowledge_base"
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"


def parse_incident(file_path: Path) -> Tuple[str, str, Dict[str, Any]]:
    """
    Parses an incident JSON file and converts it into a searchable text document and metadata dict.
    
    Returns:
        Tuple of (doc_id, document_text, metadata_dict)
    """
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    doc_id = data.get("incident_id", file_path.stem)
    title = data.get("title", "")
    affected_service = data.get("affected_service", "")
    severity = data.get("severity", "")
    root_cause = data.get("root_cause", "")
    resolution = data.get("resolution", "")
    
    symptoms = data.get("symptoms", [])
    if isinstance(symptoms, list):
        symptoms_str = "\n".join(f"- {s}" for s in symptoms)
    else:
        symptoms_str = str(symptoms)

    tags = data.get("tags", [])
    tags_str = ", ".join(tags) if isinstance(tags, list) else str(tags)

    # Combine fields into a rich, structured text representation for dense embedding search
    document_text = (
        f"Document Type: Incident Report\n"
        f"Incident ID: {doc_id}\n"
        f"Title: {title}\n"
        f"Severity: {severity}\n"
        f"Affected Service: {affected_service}\n\n"
        f"Symptoms:\n{symptoms_str}\n\n"
        f"Root Cause:\n{root_cause}\n\n"
        f"Resolution:\n{resolution}\n\n"
        f"Tags: {tags_str}"
    )

    metadata = {
        "id": doc_id,
        "document_type": "incident",
        "title": title,
        "tags": tags_str,
        "filename": file_path.name,
    }

    return doc_id, document_text, metadata


def parse_runbook(file_path: Path) -> Tuple[str, str, Dict[str, Any]]:
    """
    Parses a runbook Markdown file and converts it into a searchable text document and metadata dict.
    
    Returns:
        Tuple of (doc_id, document_text, metadata_dict)
    """
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    doc_id = file_path.stem
    
    # Extract title from first markdown header if available
    title = doc_id
    lines = content.splitlines()
    for line in lines:
        if line.startswith("# Runbook:"):
            title = line.replace("# Runbook:", "").strip()
            break
        elif line.startswith("#"):
            title = line.lstrip("#").strip()
            break

    # Extract related tags
    tags_str = ""
    if "## Related Tags" in content:
        tags_block = content.split("## Related Tags")[-1]
        raw_tags = [t.strip("- ").strip() for t in tags_block.splitlines() if t.strip().startswith("-")]
        tags_str = ", ".join(raw_tags)

    document_text = f"Document Type: Operational Runbook\nFilename: {file_path.name}\n\n{content}"

    metadata = {
        "id": doc_id,
        "document_type": "runbook",
        "title": title,
        "tags": tags_str,
        "filename": file_path.name,
    }

    return doc_id, document_text, metadata


def load_all_documents() -> Tuple[List[str], List[str], List[Dict[str, Any]], int, int]:
    """
    Loads all incident JSONs and runbook Markdowns from the dataset directories.
    
    Returns:
        Tuple of (ids, documents, metadatas, incident_count, runbook_count)
    """
    ids: List[str] = []
    documents: List[str] = []
    metadatas: List[Dict[str, Any]] = []

    print("Loading incidents...")
    incident_files = sorted(list(INCIDENTS_DIR.glob("*.json")))
    for incident_file in incident_files:
        try:
            doc_id, doc_text, meta = parse_incident(incident_file)
            ids.append(doc_id)
            documents.append(doc_text)
            metadatas.append(meta)
        except Exception as e:
            logger.error(f"Failed to parse incident file '{incident_file.name}': {e}")
    
    incident_count = len(incident_files)
    print(f"{incident_count} loaded")

    print("\nLoading runbooks...")
    runbook_files = sorted(list(RUNBOOKS_DIR.glob("*.md")))
    for runbook_file in runbook_files:
        try:
            doc_id, doc_text, meta = parse_runbook(runbook_file)
            ids.append(doc_id)
            documents.append(doc_text)
            metadatas.append(meta)
        except Exception as e:
            logger.error(f"Failed to parse runbook file '{runbook_file.name}': {e}")
    
    runbook_count = len(runbook_files)
    print(f"{runbook_count} loaded")

    return ids, documents, metadatas, incident_count, runbook_count


def build_chroma_index() -> None:
    """
    Builds and persists the ChromaDB vector index from the AI SRE dataset.
    """
    try:
        # Load dataset
        ids, documents, metadatas, incident_count, runbook_count = load_all_documents()
        total_docs = len(ids)

        if total_docs == 0:
            logger.warning("No documents found to index.")
            return

        print("\nGenerating embeddings...")
        embedding_fn = SentenceTransformerEmbeddingFunction(model_name=EMBEDDING_MODEL_NAME)

        print("\nCreating Chroma collection...")
        CHROMA_DB_DIR.mkdir(parents=True, exist_ok=True)
        chroma_client = chromadb.PersistentClient(path=str(CHROMA_DB_DIR))

        collection = chroma_client.get_or_create_collection(
            name=COLLECTION_NAME,
            embedding_function=embedding_fn,
            metadata={"hnsw:space": "cosine"}
        )

        # Check existing IDs to handle duplicates gracefully
        existing = collection.get()
        existing_ids = set(existing["ids"]) if existing and "ids" in existing else set()

        new_ids = []
        new_docs = []
        new_metas = []

        for doc_id, doc_text, meta in zip(ids, documents, metadatas):
            if doc_id in existing_ids:
                logger.info(f"Skipping duplicate document ID: '{doc_id}'")
            else:
                new_ids.append(doc_id)
                new_docs.append(doc_text)
                new_metas.append(meta)

        if new_ids:
            collection.add(
                ids=new_ids,
                documents=new_docs,
                metadatas=new_metas
            )
            logger.info(f"Successfully added {len(new_ids)} new documents to collection '{COLLECTION_NAME}'.")
        else:
            logger.info("All documents already exist in the collection. No new records added.")

        print(f"\nIndexed {collection.count()} documents")
        print("\nDone.")

    except Exception as e:
        logger.error(f"Fatal error during Chroma indexing: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    build_chroma_index()
