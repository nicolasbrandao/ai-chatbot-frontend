import { Tensor, pipeline } from "@xenova/transformers";
import { Embeddings, EmbeddingsParams } from "langchain/embeddings/base";

export class TransformerjsEmbeddings extends Embeddings {
  constructor(params: EmbeddingsParams) {
    super(params);
  }

  async embedDocuments(documents: string[]): Promise<number[][]> {
    const chunkSize = 2;
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
    const extractor = await pipeline(
      "feature-extraction",
      "Supabase/gte-small"
    );

    const output: Tensor = await extractor(document, {
      pooling: "mean",
      normalize: true,
    });

    return output.flatten().tolist();
  }
}
