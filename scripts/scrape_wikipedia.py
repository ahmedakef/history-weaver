#!/usr/bin/env python3
"""
Wikipedia Historical Figures Scraper
=====================================
Scrapes Wikipedia to generate YAML entries for public/data/figures.yaml.

Usage:
    # Single figure by Wikipedia URL
    python scripts/scrape_wikipedia.py "https://en.wikipedia.org/wiki/Ibn_Khaldun"

    # Multiple figures
    python scripts/scrape_wikipedia.py \
        "https://en.wikipedia.org/wiki/Ibn_Khaldun" \
        "https://en.wikipedia.org/wiki/Al-Biruni"

    # From a file (one URL per line)
    python scripts/scrape_wikipedia.py --file scripts/urls.txt

    # Specify categories manually
    python scripts/scrape_wikipedia.py "https://en.wikipedia.org/wiki/Ibn_Khaldun" --categories philosophy,authority

    # Output to file (append mode)
    python scripts/scrape_wikipedia.py "https://en.wikipedia.org/wiki/Ibn_Khaldun" --output output.yaml

Requirements:
    pip install requests pyyaml
"""

import argparse
import json
import re
import sys
import textwrap
from urllib.parse import unquote, quote

try:
    import requests
except ImportError:
    print("Error: 'requests' package is required. Install with: pip install requests")
    sys.exit(1)

try:
    import yaml
except ImportError:
    print("Error: 'pyyaml' package is required. Install with: pip install pyyaml")
    sys.exit(1)


VALID_CATEGORIES = [
    "science", "mathematics", "medicine", "optics", "astronomy",
    "religion", "islam", "fiqh", "hadith", "kalam",
    "authority", "philosophy",
]


def extract_title_from_url(url: str) -> tuple[str, str]:
    """Extract the article title and language from a Wikipedia URL."""
    match = re.match(r"https?://(\w+)\.wikipedia\.org/wiki/(.+)", url.strip())
    if not match:
        raise ValueError(f"Invalid Wikipedia URL: {url}")
    lang = match.group(1)
    title = unquote(match.group(2)).replace("_", " ")
    return lang, title


def fetch_wikipedia_summary(lang: str, title: str) -> dict:
    """Fetch article summary from Wikipedia REST API."""
    encoded = quote(title.replace(" ", "_"))
    url = f"https://{lang}.wikipedia.org/api/rest_v1/page/summary/{encoded}"
    resp = requests.get(url, headers={"User-Agent": "HistoryWeaver/1.0"})
    resp.raise_for_status()
    return resp.json()


def fetch_wikidata_entity(title: str, lang: str = "en") -> dict | None:
    """Fetch Wikidata entity for a Wikipedia article to get structured data."""
    params = {
        "action": "wbgetentities",
        "sites": f"{lang}wiki",
        "titles": title.replace(" ", "_"),
        "props": "claims|sitelinks|labels|descriptions",
        "format": "json",
    }
    resp = requests.get("https://www.wikidata.org/w/api.php", params=params,
                        headers={"User-Agent": "HistoryWeaver/1.0"})
    resp.raise_for_status()
    data = resp.json()
    entities = data.get("entities", {})
    for eid, entity in entities.items():
        if eid.startswith("Q"):
            return entity
    return None


def extract_year_from_claim(claim: dict) -> int | None:
    """Extract a year from a Wikidata time claim."""
    try:
        time_value = claim[0]["mainsnak"]["datavalue"]["value"]["time"]
        # Format: +YYYY-MM-DDT00:00:00Z or -YYYY-...
        match = re.match(r"([+-]?\d+)-", time_value)
        if match:
            return int(match.group(1))
    except (KeyError, IndexError, ValueError):
        pass
    return None


def get_sitelinks(entity: dict) -> dict[str, str]:
    """Get Wikipedia URLs for en and ar from Wikidata sitelinks."""
    links = {}
    sitelinks = entity.get("sitelinks", {})
    for lang_code in ["en", "ar"]:
        site_key = f"{lang_code}wiki"
        if site_key in sitelinks:
            title = sitelinks[site_key]["title"].replace(" ", "_")
            links[lang_code] = f"https://{lang_code}.wikipedia.org/wiki/{title}"
    return links


def get_label(entity: dict, lang: str) -> str | None:
    """Get a label from Wikidata in the given language."""
    labels = entity.get("labels", {})
    if lang in labels:
        return labels[lang]["value"]
    return None


def get_description(entity: dict, lang: str) -> str | None:
    """Get a description from Wikidata in the given language."""
    descs = entity.get("descriptions", {})
    if lang in descs:
        return descs[lang]["value"]
    return None


def make_id(name: str) -> str:
    """Generate a slug id from a name."""
    slug = name.lower().strip()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s-]+", "_", slug)
    slug = slug.strip("_")
    return slug


def scrape_figure(url: str, categories: list[str] | None = None) -> dict:
    """Scrape a single Wikipedia article and return a figure dict."""
    lang, title = extract_title_from_url(url)

    print(f"  Fetching summary for '{title}' ({lang})...")
    summary = fetch_wikipedia_summary(lang, title)

    print(f"  Fetching Wikidata entity...")
    entity = fetch_wikidata_entity(title, lang)

    # Names
    name_en = summary.get("title", title)
    name_ar = None
    born = None
    died = None
    wikipedia_links = {lang: url.strip()}

    if entity:
        name_ar = get_label(entity, "ar")
        if lang != "en":
            name_en = get_label(entity, "en") or name_en

        # Birth/death from Wikidata
        claims = entity.get("claims", {})
        born = extract_year_from_claim(claims.get("P569", []))
        died = extract_year_from_claim(claims.get("P570", []))

        # Wikipedia links
        wikipedia_links = get_sitelinks(entity) or wikipedia_links

    # Description
    desc_en = summary.get("extract", "")
    # Trim to first 2-3 sentences for conciseness
    sentences = re.split(r'(?<=[.!?])\s+', desc_en)
    desc_en = " ".join(sentences[:3]).strip()

    desc_ar = None
    if entity:
        desc_ar = get_description(entity, "ar")

    # Build the figure
    figure_id = make_id(name_en)

    name = {"en": name_en}
    if name_ar:
        name["ar"] = name_ar

    description = {"en": desc_en}
    if desc_ar:
        description["ar"] = desc_ar

    figure = {
        "id": figure_id,
        "name": name,
        "born": born,
        "died": died,
        "categories": categories or ["philosophy"],
        "description": description,
        "wikipedia": wikipedia_links,
    }

    return figure


def figure_to_yaml(figure: dict) -> str:
    """Convert a figure dict to a YAML string matching the project format."""
    lines = []
    lines.append(f"  - id: {figure['id']}")
    lines.append(f"    name:")
    for lang, val in figure["name"].items():
        lines.append(f"      {lang}: {val}")

    if figure["born"] is not None:
        lines.append(f"    born: {figure['born']}")
    else:
        lines.append(f"    born: 0  # TODO: fill in birth year")

    if figure["died"] is not None:
        lines.append(f"    died: {figure['died']}")
    else:
        lines.append(f"    died: 0  # TODO: fill in death year")

    lines.append(f"    categories:")
    for cat in figure["categories"]:
        lines.append(f"      - {cat}")

    lines.append(f"    description:")
    for lang, val in figure["description"].items():
        wrapped = val.replace("\n", " ").strip()
        lines.append(f"      {lang}: >")
        for line in textwrap.wrap(wrapped, width=72):
            lines.append(f"        {line}")

    if figure.get("wikipedia"):
        lines.append(f"    wikipedia:")
        for lang, url in figure["wikipedia"].items():
            lines.append(f"      {lang}: {url}")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(
        description="Scrape Wikipedia to generate YAML entries for History Weaver"
    )
    parser.add_argument("urls", nargs="*", help="Wikipedia URLs to scrape")
    parser.add_argument("--file", "-f", help="File containing Wikipedia URLs (one per line)")
    parser.add_argument("--categories", "-c", help="Comma-separated category ids (e.g. philosophy,mathematics)")
    parser.add_argument("--output", "-o", help="Output file (appends). Prints to stdout if omitted.")

    args = parser.parse_args()

    urls = list(args.urls) if args.urls else []
    if args.file:
        with open(args.file) as f:
            urls.extend(line.strip() for line in f if line.strip() and not line.startswith("#"))

    if not urls:
        parser.print_help()
        print("\nError: No URLs provided. Pass URLs as arguments or use --file.")
        sys.exit(1)

    categories = None
    if args.categories:
        categories = [c.strip() for c in args.categories.split(",")]
        invalid = [c for c in categories if c not in VALID_CATEGORIES]
        if invalid:
            print(f"Warning: Unknown categories: {', '.join(invalid)}")
            print(f"Valid categories: {', '.join(VALID_CATEGORIES)}")

    results = []
    for url in urls:
        print(f"\nScraping: {url}")
        try:
            figure = scrape_figure(url, categories)
            yaml_str = figure_to_yaml(figure)
            results.append(yaml_str)
            print(f"  ✓ {figure['name'].get('en', figure['id'])} ({figure['born']}–{figure['died']})")
        except Exception as e:
            print(f"  ✗ Error: {e}", file=sys.stderr)

    if not results:
        print("\nNo figures scraped successfully.")
        sys.exit(1)

    output = "\n\n".join(results)

    if args.output:
        with open(args.output, "a") as f:
            f.write("\n\n" + output + "\n")
        print(f"\n✓ Appended {len(results)} figure(s) to {args.output}")
    else:
        print("\n# ---- Copy the following into public/data/figures.yaml under 'figures:' ----\n")
        print(output)
        print()


if __name__ == "__main__":
    main()
