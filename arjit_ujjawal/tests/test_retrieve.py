"""
Unit tests for rag/retrieve.py semantic retrieval interface.
"""

import unittest
from unittest.mock import patch, MagicMock
from pathlib import Path
from rag.retrieve import retrieve, _get_collection


class TestRetrieve(unittest.TestCase):

    def test_normal_retrieval(self):
        """Test valid semantic retrieval query returns formatted results."""
        results = retrieve("database timeout", k=2)
        self.assertIsInstance(results, list)
        self.assertLessEqual(len(results), 2)
        if results:
            first = results[0]
            self.assertIn("id", first)
            self.assertIn("document_type", first)
            self.assertIn("title", first)
            self.assertIn("text", first)
            self.assertIn("tags", first)
            self.assertIn("score", first)
            self.assertIn("filename", first)
            self.assertGreaterEqual(first["score"], 0.0)
            self.assertLessEqual(first["score"], 1.0)

    def test_empty_and_invalid_query(self):
        """Test empty or non-string queries return empty list safely."""
        self.assertEqual(retrieve(""), [])
        self.assertEqual(retrieve("   "), [])
        self.assertEqual(retrieve(None), [])
        self.assertEqual(retrieve(12345), [])
        self.assertEqual(retrieve([], k=5), [])

    def test_invalid_k_values(self):
        """Test negative or zero k values return empty list."""
        self.assertEqual(retrieve("database", k=0), [])
        self.assertEqual(retrieve("database", k=-5), [])

    @patch("rag.retrieve.CHROMA_DB_DIR", Path("/non/existent/path/for/unit/test/chroma_db"))
    @patch("rag.retrieve._collection", None)
    @patch("rag.retrieve._client", None)
    def test_missing_database_graceful_handling(self):
        """Test missing database directory returns empty list without raising exception."""
        results = retrieve("Kubernetes pod crash", k=3)
        self.assertEqual(results, [])

    @patch("rag.retrieve._get_collection")
    def test_empty_collection_handling(self, mock_get_coll):
        """Test empty Chroma collection returns empty list gracefully."""
        mock_coll = MagicMock()
        mock_coll.count.return_value = 0
        mock_get_coll.return_value = mock_coll

        results = retrieve("CrashLoopBackOff", k=3)
        self.assertEqual(results, [])

    @patch("rag.retrieve._get_collection")
    def test_collection_query_exception_handling(self, mock_get_coll):
        """Test Chroma query execution failure returns empty list safely."""
        mock_coll = MagicMock()
        mock_coll.count.return_value = 10
        mock_coll.query.side_effect = Exception("Chroma internal vector store error")
        mock_get_coll.return_value = mock_coll

        results = retrieve("Redis memory leak", k=3)
        self.assertEqual(results, [])


if __name__ == "__main__":
    unittest.main()
