import fs from "node:fs/promises";
import path from "node:path";
import { MDocument } from "@mastra/rag";
import { LibSQLVector } from "@mastra/libsql";
import { fastembed } from "@mastra/fastembed";

const DATA_DIR = path.resolve("data");

const vectorStore = new LibSQLVector({
  id: "rag-vector-store",
  url: "file:./mastra.db",
});


const INDEX_NAME = "internal_documents";

await vectorStore.createIndex({
  indexName: INDEX_NAME,
  dimension: 384,
});

async function main() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  const files = await fs.readdir(DATA_DIR);

  const supportedFiles = files.filter((file) =>
    /\.(txt|md|markdown|json|html|htm)$/i.test(file),
  );

  if (supportedFiles.length === 0) {
    console.log("No supported documents found in data/.");
    console.log("Supported formats: .txt, .md, .markdown, .json, .html, .htm");
    return;
  }

  let totalChunks = 0;

  for (const file of supportedFiles) {
    const filePath = path.join(DATA_DIR, file);
    const text = await fs.readFile(filePath, "utf8");

    if (!text.trim()) {
      console.log(`Skipping empty file: ${file}`);
      continue;
    }

    console.log(`Indexing: ${file}`);

    const document = MDocument.fromText(text, {
      source: file,
      path: filePath,
    });

    await document.chunk({
      strategy: "recursive",
      maxSize: 1000,
      overlap: 200,
    });

    const chunks = document.getDocs();

    if (chunks.length === 0) {
      console.log(`No chunks generated for: ${file}`);
      continue;
    }

    const embeddings = await fastembed.doEmbed({
      values: chunks.map((chunk) => chunk.text),
    });

    await vectorStore.upsert({
      indexName: INDEX_NAME,
      vectors: embeddings.embeddings,
      metadata: chunks.map((chunk) => ({
        text: chunk.text,
        source: file,
        path: filePath,
      })),
    });

    totalChunks += chunks.length;

    console.log(`Indexed ${chunks.length} chunks from ${file}`);
  }

  console.log(`\nDone. Indexed ${totalChunks} chunks.`);
}

main().catch((error) => {
  console.error("RAG indexing failed:", error);
  process.exit(1);
});