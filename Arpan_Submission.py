import requests


API_URL = "https://world.openfoodfacts.org/api/v2/product/{}"

CACHE = {}


FIELDS = ",".join([
    "product_name",
    "ingredients_text",
    "nutriscore_grade",
    "nutriments",
    "allergens",
    "additives_tags",
    "nova_group",
    "brands",
    "categories",
    "countries",
    "serving_size",
])


def validate_barcode(barcode):
    """Check whether the barcode has a valid-looking format."""

    barcode = barcode.strip()

    if not barcode.isdigit():
        return False

    if len(barcode) not in (8, 12, 13, 14):
        return False

    return True


def get_additive_name(tag):
    """Convert an Open Food Facts additive tag into a readable name."""

    if not tag.startswith("en:"):
        return tag

    return tag[3:].replace("-", " ").title()


def get_product(barcode):
    """Retrieve a product from Open Food Facts."""

    barcode = barcode.strip()

    # Check cache first
    if barcode in CACHE:
        print("Using cached result.")
        return CACHE[barcode]

    url = API_URL.format(barcode)

    try:
        response = requests.get(
            url,
            params={"fields": FIELDS},
            headers={
                "User-Agent": "FoodLookupApp/1.0"
            },
            timeout=10
        )

        # A 404 means the product isn't in the database
        if response.status_code == 404:
            print("Product not found in Open Food Facts.")
            return None

        # Raise an exception for other HTTP errors
        response.raise_for_status()

        # Convert JSON into a Python dictionary
        data = response.json()

    except requests.exceptions.Timeout:
        print("The request timed out.")
        return None

    except requests.exceptions.ConnectionError:
        print("Could not connect to Open Food Facts.")
        return None

    except requests.exceptions.JSONDecodeError:
        print("The server returned invalid JSON.")
        return None

    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return None

    # Check the API's own product status
    if data.get("status") != 1:
        print("Product not found in Open Food Facts.")
        return None

    product = data.get("product")

    if not isinstance(product, dict):
        print("The API returned an unexpected response.")
        return None

    # Store successful result in cache
    CACHE[barcode] = product

    return product


def display_product(product):
    """Display useful information about a product."""

    name = product.get("product_name") or "Unknown"
    brands = product.get("brands") or "Unknown"
    ingredients = product.get("ingredients_text") or "Not available"
    nutriscore = product.get("nutriscore_grade") or "Not available"
    nova = product.get("nova_group") or "Not available"
    allergens = product.get("allergens") or "None listed"
    additives = product.get("additives_tags") or []
    serving_size = product.get("serving_size") or "Not available"
    countries = product.get("countries") or "Not available"

    print("\n" + "=" * 50)

    print(f"Product:       {name}")
    print(f"Brand:         {brands}")
    print(f"Nutri-Score:   {nutriscore.upper()}")
    print(f"NOVA Group:    {nova}")
    print(f"Serving size:  {serving_size}")
    print(f"Countries:     {countries}")
    print(f"Allergens:     {allergens}")

    print("\nIngredients:")
    print(ingredients)

    print("\nAdditives:")

    if additives:
        for additive in additives:
            readable_name = get_additive_name(additive)

            if readable_name != additive:
                print(f"  - {readable_name} ({additive[3:].upper()})")
            else:
                print(f"  - {readable_name}")
    else:
        print("  None listed")

    print("=" * 50)


def main():

    barcode = input("Enter product barcode: ").strip()

    if not validate_barcode(barcode):
        print(
            "Invalid barcode. Please enter an 8, 12, 13, "
            "or 14-digit numeric barcode."
        )
        return

    product = get_product(barcode)

    if product is not None:
        display_product(product)


if __name__ == "__main__":
    main()
