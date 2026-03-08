# Scripts

## Wikipedia Scraper

Scrapes Wikipedia to generate YAML entries for `public/data/figures.yaml`.

### Setup

```bash
pip install requests pyyaml
```

### Usage

```bash
# Single figure
python scripts/scrape_wikipedia.py "https://en.wikipedia.org/wiki/Ibn_Khaldun" --categories philosophy,authority

# Multiple figures
python scripts/scrape_wikipedia.py \
    "https://en.wikipedia.org/wiki/Al-Biruni" \
    "https://en.wikipedia.org/wiki/Avicenna" \
    --categories science,philosophy

# From a file of URLs
python scripts/scrape_wikipedia.py --file scripts/urls.txt

# Save to file
python scripts/scrape_wikipedia.py --file scripts/urls.txt --output output.yaml
```

### What it does

1. Fetches the article summary from Wikipedia's REST API
2. Queries Wikidata for structured data (birth/death years, Arabic names, sitelinks)
3. Outputs properly formatted YAML matching the project's schema

### Notes

- The script uses Wikipedia's and Wikidata's public APIs (no API key needed)
- Birth/death years come from Wikidata; review for accuracy
- Categories must be set manually via `--categories` (the script can't auto-classify)
- Arabic names and Wikipedia links are fetched automatically from Wikidata
- Review and edit the output before pasting into `figures.yaml`
