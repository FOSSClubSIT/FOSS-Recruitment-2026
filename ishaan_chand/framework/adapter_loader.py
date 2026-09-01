import json
import os

def load_adapter(adapter_name: str) -> dict:
    """
    Loads adapter JSON configuration by checking the package's adapters directory,
    then falling back to workspace adapters directory.
    """
    pkg_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    local_path = os.path.join(pkg_dir, "adapters", f"{adapter_name}.adapter.json")
    if os.path.exists(local_path):
        with open(local_path, "r", encoding="utf-8") as f:
            return json.load(f)
            
    parent_path = os.path.join(os.path.dirname(pkg_dir), "adapters", f"{adapter_name}.adapter.json")
    if os.path.exists(parent_path):
        with open(parent_path, "r", encoding="utf-8") as f:
            return json.load(f)
            
    raise FileNotFoundError(f"Adapter '{adapter_name}' not found at {local_path} or {parent_path}")
