import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const dir = path.resolve("assets/pinterest");
const files = fs.readdirSync(dir).filter((name) => name.endsWith(".svg"));

for (const file of files) {
  const input = path.join(dir, file);
  const output = path.join(dir, file.replace(/\.svg$/i, ".png"));
  await sharp(input, { density: 144 })
    .resize(1000, 1500, { fit: "fill" })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(output);
  console.log(`Rendered ${output}`);
}
