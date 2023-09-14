import Dexie from "dexie";
import { VectorStore } from "langchain/vectorstores/base";
import { Embeddings } from "langchain/embeddings/base";
import { Document } from "langchain/document";
<<<<<<< HEAD:apps/web/app/services/DexieVectorStore.ts
import { TensorFlowEmbeddings } from "langchain/embeddings/tensorflow";
=======
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-cpu";
import { TransformerjsEmbeddings } from "./TransformerjsEmbeddings";
>>>>>>> f8f02e2 (FEA : Implement TransformerJS embeddings and update question answering pipeline):app/services/DexieVectorStore.ts

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
    console.log("Starting the addDocuments process...");

    const chunkSize = 1;
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
        console.log("Mapped document metadata for chunk.");

        const result = await this.client.bulkAdd(documentsMetadata);
        console.log(`Bulk add to client completed for chunk ${index + 1}.`);
        console.log(
          `Stored Percentage: ${(
            (((index + 1) * chunk.length) / totalDocuments) *
            100
          ).toFixed(2)}%`
        );

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

    const queryTensor = tf.tensor(queryVector);

    const allVectors = await this.client.toArray();

    const similarities = allVectors.map((doc) => {
      const docTensor = tf.tensor(doc.embedding);

      const similarity = tf.metrics
        .cosineProximity(queryTensor, docTensor)
        .arraySync() as number;
      return { similarity, pageContent: doc.content };
    });

    // ZIP the similarities with the documents
    const sortedSimilarities = similarities.sort(
      (a, b) => b.similarity - a.similarity
    );

    return sortedSimilarities
      .slice(0, k)
      .map((s) => new Document({ pageContent: s.pageContent }));
  }

  async similaritySearchVectorWithScore(
    query: number[],
    k: number,
    filter?: this["FilterType"]
  ): Promise<[Document, number][]> {
    const queryTensor = tf.tensor(query);

    const allVectors = await this.client.toArray();
    const similarities = allVectors.map((doc) => {
      const docTensor = tf.tensor(doc.embedding);
      const similarity = tf.metrics
        .cosineProximity(queryTensor, docTensor)
        .arraySync() as number;
      return { similarity, pageContent: doc.content };
    });

    // ZIP the similarities with the documents
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
    const queryTensor = tf.tensor(queryVector);
    const allVectors = await this.client.toArray();
    const similarities = allVectors.map((doc) => {
      const docTensor = tf.tensor(doc.embedding);

      const similarity = tf.metrics
        .cosineProximity(queryTensor, docTensor)
        .arraySync() as number;
      return { similarity, pageContent: doc.content };
    });

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
    console.log("Starting the fromDocuments process...");
    const store = new this(embeddings, dbConfig);
    await store.addDocuments(docs);
    return store;
  }
}

export default DexieVectorStore;
