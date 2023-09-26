import { Embedding } from "@/shared/types";
import Dexie from "dexie";
import DexieVectorStore from "./DexieVectorStore";
import { TransformerjsEmbeddings } from "./TransformerjsEmbeddings";

const db = new Dexie("embeddings");
db.version(1).stores({
  embeddings: "++id, created_at",
});

export const loadProcessedEmbedding = async () => {
  const response = await fetch("/bucket/embeddings.json");
  const {
    embeddings,
    createAt,
  }: { embeddings: Embedding[]; createAt: number } = await response.json();

  // Get the last_embeddings_date from local storage or some other store
  const lastEmbeddingsDate = localStorage.getItem("last_embeddings_date");
  console.log({ lastEmbeddingsDate });
  // If there's no previous timestamp or the new one is greater, update the cache
  if (!lastEmbeddingsDate || Number(lastEmbeddingsDate) < createAt) {
    // Clear the table and add new entries
    console.log("Updating embeddings cache");
    await db.table("embeddings").clear();
    await db.table("embeddings").bulkAdd(embeddings);

    // Update the last_embeddings_date in local storage
    localStorage.setItem("last_embeddings_date", createAt.toString());
  }
};

export const getEmbeddingsRetriever = async () => {
  const vectorStore = await new DexieVectorStore(
    new TransformerjsEmbeddings({}),
    {
      client: db.table("embeddings"),
    },
  );

  const retriever = await vectorStore.asRetriever(6);

  return retriever;
};
