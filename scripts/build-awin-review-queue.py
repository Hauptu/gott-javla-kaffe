#!/usr/bin/env python3
"""Convert the prepared Ginza/SharkNinja Awin CSV into a non-live review queue.

Usage:
  python3 scripts/build-awin-review-queue.py input.csv data/awin-review-queue.json

The output is deliberately separate from products.json: every record remains
pending manual review and is not eligible for the live product catalogue.
"""
import csv
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

INCLUDE = ("espressomaskin", "kaffebryggare", "kaffemaskin",
           "kaffekvarn", "manuell bryggning", "perkolator")

def clean(value):
    return (value or "").strip()

def slug_id(source, feed_id, ean, name):
    base = clean(ean) or clean(feed_id) or clean(name)
    safe = re.sub(r"[^a-zA-Z0-9]+", "-", base).strip("-").lower()
    return f"awin-review-{safe or 'unknown'}"

def main():
    if len(sys.argv) != 3:
        raise SystemExit("Usage: build-awin-review-queue.py input.csv output.json")
    source_path, output_path = map(Path, sys.argv[1:])
    rows = []
    with source_path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        required = {"Källa", "Kategori (förslag)", "Produktnamn i feed",
                    "Varumärke", "EAN/GTIN", "Pris (SEK)", "Affiliate-länk",
                    "Bildlänk", "Produktsida"}
        missing = required - set(reader.fieldnames or [])
        if missing:
            raise SystemExit("Missing CSV columns: " + ", ".join(sorted(missing)))
        for row in reader:
            category = clean(row.get("Kategori (förslag)"))
            if not any(term in category.lower() for term in INCLUDE):
                continue
            source = clean(row.get("Källa"))
            feed_id = clean(row.get("Feed produkt-ID"))
            ean = clean(row.get("EAN/GTIN"))
            name = clean(row.get("Produktnamn i feed"))
            try:
                price = float(clean(row.get("Pris (SEK)")).replace(",", "."))
                if price <= 0:
                    price = None
            except (TypeError, ValueError):
                price = None
            stock = clean(row.get("I lager (feed)"))
            record = {
                "id": slug_id(source, feed_id, ean, name),
                "status": "pending_review",
                "needs_review": True,
                "lifecycle_status": "pending_review",
                "source": source,
                "category_suggestion": category,
                "name_from_feed": name,
                "brand": clean(row.get("Varumärke")),
                "model": clean(row.get("Modell")),
                "ean": ean,
                "feed_product_id": feed_id,
                "merchant_product_id": clean(row.get("Återförsäljarens produkt-ID")),
                "feed_price_sek": price,
                "feed_in_stock": stock in {"1", "true", "True", "ja", "Ja"},
                "affiliate_url": clean(row.get("Affiliate-länk")),
                "product_page_url": clean(row.get("Produktsida")),
                "image_url": clean(row.get("Bildlänk")),
                "description_from_feed": clean(row.get("Beskrivning")),
                "ean_match_status": clean(row.get("EAN-matchstatus")),
                "matched_product_reference": clean(row.get("Matchad produkt i jämförelsefil")),
                "recommended_handling": clean(row.get("Rekommenderad hantering")),
                "review_checks": [
                    "confirm product is coffee-related and category is correct",
                    "check whether EAN already exists in products.json or grinders.json",
                    "verify image belongs to this exact model",
                    "verify product page, affiliate URL and current price",
                    "complete editorial attributes before approving"
                ]
            }
            rows.append(record)
    output = {
        "schema_version": 1,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source_file": source_path.name,
        "purpose": "Manual review queue only; these records are not live catalogue entries.",
        "count": len(rows),
        "items": rows
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(rows)} review candidates to {output_path}")

if __name__ == "__main__":
    main()
