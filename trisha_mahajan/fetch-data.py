import time
import os
import pandas as pd
import requests

# GitHub API Endpoint
SEARCH_URL = "https://api.github.com/search/repositories"

# Categories to fetch data for
TOPICS_MAP = {
    "cli": "CLI Tool",
    "web-framework": "Web Dev",
    "machine-learning": "Machine Learning",
    "mobile": "Mobile Dev",
}

def fetch_repositories(topic, category_label, max_results=50):
    """Fetches public repositories from GitHub based on topic."""
    print(f"Fetching projects for category: {category_label}...")

    # Query string parameters
    params = {
        "q": f"topic:{topic} stars:>100",  # Filter for quality repos with stars
        "sort": "stars",
        "order": "desc",
        "per_page": max_results,
    }
    
    headers = {"Accept": "application/vnd.github.v3+json"}

    response = requests.get(SEARCH_URL, headers=headers, params=params)

    if response.status_code != 200:
        print(f"Failed to fetch data: {response.status_code}")
        return []

    items = response.json().get("items", [])
    extracted_data = []

    for item in items:
        description = item.get("description")
        license_info = item.get("license")

        # Skip entries with no description
        if not description:
            continue

        license_name = (
            license_info.get("spdx_id", "Unknown") if license_info else "Unknown"
        )

        extracted_data.append(
            {
                "text": description,
                "category": category_label,
                "license": license_name,
            }
        )

    return extracted_data


def main():
    all_dataset_rows = []

    for topic, label in TOPICS_MAP.items():
        data = fetch_repositories(topic, label, max_results=15)
        all_dataset_rows.extend(data)
        # Sleep for 2 seconds between requests to avoid hitting rate limits
        time.sleep(2)

    # Convert to Pandas DataFrame
    df = pd.DataFrame(all_dataset_rows)
    # Ensure output directory exists
    output_dir = "data"
    os.makedirs(output_dir, exist_ok=True)

    output_path = os.path.join(output_dir, "dataset.csv")
    df.to_csv(output_path, index=False)

    print(f"\nDataset successfully generated with {len(df)} rows!")
    print(f"Saved to: {output_path}")


if __name__ == "__main__":
    main()
