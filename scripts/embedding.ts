import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import {
  JSONLoader,
  JSONLinesLoader,
} from "langchain/document_loaders/fs/json";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Tensor, pipeline } from "@xenova/transformers";
import process from "process";
import path from "path";
import fs from "fs";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 0,
});

interface Embedding {
  content: string;
  embedding: number[];
  metadata?: Record<string, any>;
}

const loadFiles = async (path: string): Promise<Embedding[]> => {
  const loader = new DirectoryLoader(path, {
    ".json": (path) => new JSONLoader(path, "/texts"),
    ".jsonl": (path) => new JSONLinesLoader(path, "/html"),
    ".txt": (path) => new TextLoader(path),
    ".csv": (path) => new CSVLoader(path, "text"),
    ".pdf": (path) => new PDFLoader(path),
  });
  const extractor = await pipeline(
    "feature-extraction",
    "Supabase/bge-small-en"
  );
  const docs = await loader.load();
  const splittedDocs = await splitter.splitDocuments(docs);
  let embeddings: Embedding[] = [];
  for (const splittedDocument of splittedDocs) {
    const content = splittedDocument.pageContent;

    const output: Tensor = await extractor(splittedDocument.pageContent, {
      pooling: "mean",
      normalize: true,
    });

    const embedding = output.flatten().tolist();
    embeddings.push({
      content,
      embedding,
      metadata: splittedDocument.metadata,
    });
  }

  return embeddings;
};

const main = async () => {
  const folderPath = process.argv[2];
  const savePath = process.argv[3]
    ? path.join(folderPath, "embeddings", process.argv[3])
    : path.join(folderPath, "embeddings");

  if (!folderPath) {
    console.error("Please provide a folder path.");
    process.exit(1);
  }

  if (!fs.existsSync(savePath)) {
    fs.mkdirSync(savePath, { recursive: true });
  }

  const embeddings = await loadFiles(folderPath);

  const jsonFilePath = path.join(savePath, "embeddings.json");
  fs.writeFileSync(jsonFilePath, JSON.stringify(embeddings, null, 2));

  console.log(`Embeddings saved to ${jsonFilePath}`);
};

main();