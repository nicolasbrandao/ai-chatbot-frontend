import { cos_sim } from "@xenova/transformers";

self.addEventListener(
  "message",
  async (event: { data: { queryVector: number[]; docVector: number[] } }) => {
    const { queryVector, docVector } = event.data;
    const similarity = await cos_sim(queryVector, docVector);
    self.postMessage(similarity);
  },
);
