"""
AI SRE System - Semantic Retrieval Engine
Provides RAG semantic search across ChromaDB vector database containing incident reports and runbooks.

Example Usage by Teammates:
    from rag.retrieve import retrieve

    results = retrieve("Payment Gateway 504 timeout", k=3)
    for res in results:
        print(f"[{res['score']}] {res['title']} ({res['document_type']})")

Example Search Queries for Testing:
    - "database timeout"
    - "CrashLoopBackOff"
    - "Redis latency"
    - "JWT authentication"
    - "DNS failure"
"""

import sys
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional

import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

# Configure logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("rag.retrieve")

# Global Configuration
PROJECT_ROOT = Path(__file__).resolve().parent.parent
CHROMA_DB_DIR = PROJECT_ROOT / "rag" / "chroma_db"
COLLECTION_NAME = "sre_knowledge_base"
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"

# Singleton cache for persistent client and collection to avoid re-initialization overhead
_client: Optional[chromadb.PersistentClient] = None
_collection: Optional[Any] = None


def _get_collection() -> Optional[Any]:
    """
    Helper function to lazily initialize and return the ChromaDB collection.
    
    Returns:
        ChromaDB collection instance or None if database is missing/uninitialized.
    """
    global _client, _collection

    if _collection is not None:
        return _collection

    if not CHROMA_DB_DIR.exists():
        logger.error(f"ChromaDB directory does not exist at '{CHROMA_DB_DIR}'. Build index first.")
        return None

    try:
        if _client is None:
            _client = chromadb.PersistentClient(path=str(CHROMA_DB_DIR))

        embedding_fn = SentenceTransformerEmbeddingFunction(model_name=EMBEDDING_MODEL_NAME)
        
        # Verify collection exists
        existing_collections = [c.name for c in _client.list_collections()]
        if COLLECTION_NAME not in existing_collections:
            logger.error(f"Collection '{COLLECTION_NAME}' not found in ChromaDB.")
            return None

        _collection = _client.get_collection(
            name=COLLECTION_NAME,
            embedding_function=embedding_fn
        )
        return _collection

    except Exception as e:
        logger.error(f"Failed to connect to ChromaDB collection '{COLLECTION_NAME}': {e}")
        return None


def retrieve(query: str, k: int = 5) -> List[Dict[str, Any]]:
    """
    Retrieves the top-k most relevant documents (incidents and runbooks) from the ChromaDB vector database.

    Args:
        query: Free-text search query describing an incident symptom, technology, or issue.
        k: Maximum number of relevant documents to return (default: 5).

    Returns:
        List of dictionaries with fields:
            - id (str): Unique document identifier (e.g., 'INC-2026-001' or 'RB-001_k8s_pod_crashloop')
            - document_type (str): 'incident' or 'runbook'
            - title (str): Document title
            - text (str): Full document content text
            - tags (List[str]): List of relevant tags
            - score (float): Normalized relevance score (higher is more relevant, range 0.0 to 1.0)
            - filename (str): Source filename

    Examples:
        >>> results = retrieve("PostgreSQL connection pool exhaustion", k=2)
        >>> print(results[0]['id'], results[0]['score'])
    """
    # 1. Input Validation
    if not isinstance(query, str) or not query.strip():
        logger.warning("Empty or invalid query string provided to retrieve(). Returning empty list.")
        return []

    if k <= 0:
        logger.warning(f"Invalid value for k={k}. Returning empty list.")
        return []

    clean_query = query.strip()

    # 2. Get ChromaDB Collection
    collection = _get_collection()
    if collection is None:
        logger.error("ChromaDB collection unavailable. Returning empty result list.")
        return []

    try:
        # Check if collection is empty
        if collection.count() == 0:
            logger.warning("ChromaDB collection is empty.")
            return []

        # 3. Perform Vector Similarity Search
        results = collection.query(
            query_texts=[clean_query],
            n_results=min(k, collection.count()),
            include=["documents", "metadatas", "distances"]
        )

        output: List[Dict[str, Any]] = []

        if not results or not results.get("ids") or not results["ids"][0]:
            return []

        ids = results["ids"][0]
        documents = results["documents"][0] if results.get("documents") else [""] * len(ids)
        metadatas = results["metadatas"][0] if results.get("metadatas") else [{}] * len(ids)
        distances = results["distances"][0] if results.get("distances") else [1.0] * len(ids)

        for doc_id, doc_text, meta, dist in zip(ids, documents, metadatas, distances):
            # 4. Score Normalization:
            # Cosine distance d in Chroma is in range [0, 2].
            # Cosine similarity = 1.0 - distance.
            # Normalize into [0.0, 1.0] range where 1.0 is exact match.
            raw_sim = 1.0 - float(dist)
            normalized_score = round(max(0.0, min(1.0, raw_sim)), 4)

            # Parse tags back into a list of strings
            raw_tags = meta.get("tags", "")
            if isinstance(raw_tags, str):
                tags_list = [t.strip() for t in raw_tags.split(",") if t.strip()]
            elif isinstance(raw_tags, list):
                tags_list = raw_tags
            else:
                tags_list = []

            item = {
                "id": str(meta.get("id", doc_id)),
                "document_type": str(meta.get("document_type", "unknown")),
                "title": str(meta.get("title", "Untitled")),
                "text": str(doc_text),
                "tags": tags_list,
                "score": normalized_score,
                "filename": str(meta.get("filename", ""))
            }
            output.append(item)

        # Sort descending by normalized similarity score
        output.sort(key=lambda x: x["score"], reverse=True)
        return output

    except Exception as e:
        logger.error(f"Error executing vector retrieval for query '{clean_query}': {e}", exc_info=True)
        return []


def run_cli_demo() -> None:
    """
    Interactive CLI demo for testing the retrieve() function across sample SRE failure queries.
    """
    print("\n" + "=" * 65)
    print("      AI SRE System - Semantic Vector Retrieval CLI Demo")
    print("=" * 65)

    sample_queries = [
        "database timeout",
        "CrashLoopBackOff",
        "Redis latency",
        "JWT authentication",
        "DNS failure"
    ]

    print("\nPre-configured Test Queries:")
    for idx, q in enumerate(sample_queries, 1):
        print(f"  [{idx}] {q}")

    print("\nRunning test queries...\n")
    for q in sample_queries:
        print(f"\n>>> Query: '{q}'")
        print("-" * 55)
        results = retrieve(query=q, k=2)
        if not results:
            print("  No results found.")
        for r in results:
            print(f"  • ID: {r['id']:<20} Type: {r['document_type']:<10} Score: {r['score']:.4f}")
            print(f"    Title: {r['title']}")
            print(f"    Tags:  {', '.join(r['tags'][:4])}")

    print("\n" + "=" * 65)
    print("Interactive Search Mode (Press Ctrl+C or enter empty to exit)")
    print("=" * 65)

    try:
        while True:
            user_query = input("\nEnter query > ").strip()
            if not user_query:
                print("Exiting demo.")
                break
            
            top_k_results = retrieve(query=user_query, k=5)
            print(f"\nTop {len(top_k_results)} results for '{user_query}':")
            print("-" * 65)
            for idx, item in enumerate(top_k_results, 1):
                print(f"[{idx}] Score: {item['score']:.4f} | ID: {item['id']} ({item['document_type'].upper()})")
                print(f"    Title:    {item['title']}")
                print(f"    Filename: {item['filename']}")
                print(f"    Tags:     {', '.join(item['tags'])}")
                print()

    except (KeyboardInterrupt, EOFError):
        print("\nDemo ended.")


if __name__ == "__main__":
    run_cli_demo()
