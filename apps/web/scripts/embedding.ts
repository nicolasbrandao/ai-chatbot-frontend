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
import ProgressBar from "progress";
import { Embedding } from "@/types/shared";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 0,
});

const loadFiles = async (dirPath: string): Promise<Embedding[]> => {
  const loader = new DirectoryLoader(dirPath, {
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

  const bar = new ProgressBar(":bar :percent", { total: splittedDocs.length });

  let embeddings: Embedding[] = [];
  for (const splittedDocument of splittedDocs) {
    const content = splittedDocument.pageContent;

    const output: Tensor = await extractor(splittedDocument.pageContent, {
      pooling: "mean",
      normalize: true,
    });
    const relativeSourcePath = path.relative(
      process.cwd(),
      splittedDocument.metadata.source
    );

    const embedding = output.flatten().tolist();
    embeddings.push({
      content,
      embedding,
      metadata: {
        ...splittedDocument.metadata,
        source: relativeSourcePath,
      },
    });

    bar.tick();
  }

  return embeddings;
};

const main = async () => {
  const folderPath = process.argv[2];
  const savePath = process.argv[3]
    ? path.join(folderPath, process.argv[3])
    : path.join(folderPath);

  if (!folderPath) {
    console.error("Please provide a folder path.");
    process.exit(1);
  }

  if (!fs.existsSync(savePath)) {
    fs.mkdirSync(savePath, { recursive: true });
  }

  const embeddings = await loadFiles(folderPath);

  const jsonFilePath = path.join(savePath, "embeddings.json");
  fs.writeFileSync(
    jsonFilePath,
    JSON.stringify({ embeddings, createAt: Date.now() }, null, 2)
  );

  console.log(`Embeddings saved to ${jsonFilePath}`);
};

main();
