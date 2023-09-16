"use client";
import { EmbeddingWorkerMessage } from "@/types/models/shared";
import { Embeddings, EmbeddingsParams } from "langchain/embeddings/base";

let worker: any;

if (typeof window !== "undefined") {
  worker = new Worker(
    new URL("./../../workers/embeddingWorker.ts", import.meta.url)
  );
}

export class TransformerjsEmbeddings extends Embeddings {
  constructor(params: EmbeddingsParams) {
    super(params);
  }

  async embedDocuments(documents: string[]): Promise<number[][]> {
    const chunkSize = 50;
    const results: number[][] = [];

    for (let i = 0; i < documents.length; i += chunkSize) {
      const chunk = documents.slice(i, i + chunkSize);
      const chunkResults = await Promise.all(
        chunk.map((document) => this.embedQuery(document))
      );
      results.push(...chunkResults);
    }

    return results;
  }

  async embedQuery(document: string): Promise<number[]> {
    return new Promise<number[]>((resolve, reject) => {
      worker.postMessage({ text: document });
      worker.addEventListener("message", (event: EmbeddingWorkerMessage) => {
        if (event.data.status === "complete") {
          const output = event.data.output!;
          resolve(output);
        } else {
          reject(new Error("Failed to process document"));
        }
      });
    });
  }
}
