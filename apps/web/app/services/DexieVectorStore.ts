import Dexie from "dexie";
import { VectorStore } from "langchain/vectorstores/base";
import { Embeddings } from "langchain/embeddings/base";
import { Document } from "langchain/document";

import { TransformerjsEmbeddings } from "./TransformerjsEmbeddings";

let similarityWorker: any;

if (typeof window !== "undefined") {
  similarityWorker = new Worker(
    new URL("./../../workers/similarityWorker.ts", import.meta.url)
  );
}

const embeddings = new TransformerjsEmbeddings({});

const db = new Dexie("chatHistoryDB");

db.version(1).stores({
  chat_history: "++id, created_at",
});

export interface DexieBaseLibArgs {
  client: Dexie.Table<Row, number>;
  tableName?: string;
  queryName?: string;
  filter?: Record<string, any>;
  upsertBatchSize?: number;
}

interface NewRow {
  embedding: number[];
  content: string;
  metadata: Record<string, any>;
}

interface Row extends NewRow {
  id: number;
}

class DexieVectorStore extends VectorStore {
  private client: Dexie.Table<NewRow, number>;

  FilterType = {};
  lc_namespace = ["embedding"];

  constructor(embeddings: Embeddings, args: DexieBaseLibArgs) {
    super(embeddings, args);
    this.client = args.client;
  }

  _vectorstoreType(): string {
    return "dexie";
  }

  async addDocuments(
    documents: Document[],
    options?: Record<string, any>
  ): Promise<string[]> {
    const chunkSize = 50;
    const totalDocuments = documents.length;

    const chunks = Array.from(
      { length: Math.ceil(totalDocuments / chunkSize) },
      (_, i) => documents.slice(i * chunkSize, (i + 1) * chunkSize)
    );

    const resultIds = await chunks.reduce(
      async (accPromise, chunk, index) => {
        const acc = await accPromise;

        const documentsTextContent = chunk.map(
          ({ pageContent }) => pageContent
        );

        const documentsTextEmbedding =
          await embeddings.embedDocuments(documentsTextContent);
        const documentsMetadata: NewRow[] = chunk.map((doc, i) => ({
          metadata: doc.metadata,
          content: doc.pageContent,
          embedding: documentsTextEmbedding[i],
        }));
        const result = await this.client.bulkAdd(documentsMetadata);

        return acc.concat(result.toString().split(","));
      },
      Promise.resolve([] as string[])
    );

    return resultIds;
  }

  async addVectors(
    vectors: number[][],
    documents: Document[],
    options?: { ids?: string[] | number[] }
  ) {
    const documentsMetadata: Row[] = documents.map((doc, i) => ({
      id: i,
      metadata: doc.metadata,
      content: doc.pageContent,
      embedding: vectors[i],
    }));

    const result = await this.client.bulkAdd(documentsMetadata);
    return result.toString().split(","); // Converting the number to a string array
  }

  async similaritySearch(query: string, k?: number): Promise<Document[]> {
    const queryVector = await embeddings.embedQuery(query);
    const allVectors = await this.client.toArray();

    const chunkSize = 1; //Chunksize bigger that one cause race conditions and crashes
    const totalVectors = allVectors.length;
    let similarities: any[] = [];

    for (let i = 0; i < totalVectors; i++) {
      const chunk = allVectors.slice(i, i + chunkSize);
      const chunkPromises = chunk.map(async (doc) => {
        return new Promise<number>((resolve) => {
          similarityWorker.onmessage = (event: { data: number }) => {
            resolve(event.data);
          };
          similarityWorker.postMessage({
            queryVector,
            docVector: doc.embedding,
          });
        }).then((similarity) => {
          const response = {
            similarity,
            pageContent: doc.content,
            metadata: doc.metadata,
          };
          return response;
        });
      });

      const chunkResults = await Promise.all(chunkPromises);
      similarities = similarities.concat(chunkResults);
    }

    const sortedSimilarities = similarities.sort(
      (a, b) => b.similarity - a.similarity
    );

    return sortedSimilarities
      .slice(0, k)
      .map(
        (s) =>
          new Document({ pageContent: s.pageContent, metadata: s.metadata })
      );
  }

  async similaritySearchVectorWithScore(
    query: number[],
    k: number,
    filter?: this["FilterType"]
  ): Promise<[Document, number][]> {
    const allVectors = await this.client.toArray();

    const similarities = await Promise.all(
      allVectors.map(async (doc) => {
        return new Promise<number>((resolve) => {
          similarityWorker.onmessage = (event: { data: number }) => {
            resolve(event.data);
          };
          similarityWorker.postMessage({
            queryVector: query,
            docVector: doc.embedding,
          });
        }).then((similarity) => {
          return { similarity, pageContent: doc.content };
        });
      })
    );

    const sortedSimilarities = similarities.sort(
      (a, b) => b.similarity - a.similarity
    );

    return sortedSimilarities
      .slice(0, k)
      .map((s) => [new Document({ pageContent: s.pageContent }), s.similarity]);
  }

  async similaritySearchWithScore(
    query: string,
    k: number,
    filter?: this["FilterType"]
  ): Promise<[Document, number][]> {
    const queryVector = await embeddings.embedQuery(query);
    const allVectors = await this.client.toArray();

    const similarities = await Promise.all(
      allVectors.map(async (doc) => {
        return new Promise<number>((resolve) => {
          similarityWorker.onmessage = (event: { data: number }) => {
            resolve(event.data);
          };
          similarityWorker.postMessage({
            queryVector,
            docVector: doc.embedding,
          });
        }).then((similarity) => {
          return { similarity, pageContent: doc.content };
        });
      })
    );

    const sortedSimilarities = similarities.sort(
      (a, b) => b.similarity - a.similarity
    );

    return sortedSimilarities
      .slice(0, k)
      .map((s) => [new Document({ pageContent: s.pageContent }), s.similarity]);
  }

  async delete(params: { ids: string[] }): Promise<void> {
    const { ids } = params;
    for (const id of ids) {
      await this.client.delete(parseInt(id));
    }
  }

  static async fromTexts(
    texts: string[],
    metadatas: object[] | object,
    embeddings: Embeddings,
    dbConfig: DexieBaseLibArgs
  ): Promise<DexieVectorStore> {
    const store = new this(embeddings, dbConfig);
    store.addDocuments(
      texts.map((text) => new Document({ pageContent: text }))
    );
    return store;
  }

  static async fromDocuments(
    docs: Document[],
    embeddings: Embeddings,
    dbConfig: DexieBaseLibArgs
  ): Promise<DexieVectorStore> {
    const store = new this(embeddings, dbConfig);
    await store.addDocuments(docs);
    return store;
  }
}

export default DexieVectorStore;
