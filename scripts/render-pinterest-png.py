from pathlib import Path
import cairosvg

directory = Path("assets/pinterest")
svg_files = sorted(directory.glob("*.svg"))

for svg in svg_files:
    output = svg.with_suffix(".png")
    cairosvg.svg2png(
        url=str(svg),
        write_to=str(output),
        output_width=1000,
        output_height=1500,
    )
    print(f"Rendered {output}")

print(f"Rendered {len(svg_files)} Pinterest PNGs.")
