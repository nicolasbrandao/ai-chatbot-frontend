import { cos_sim } from "@xenova/transformers";

self.addEventListener(
  "message",
  (event: { data: { queryVector: number[]; docVector: number[] } }) => {
    const { queryVector, docVector } = event.data;
    const similarity = cos_sim(queryVector, docVector);
    self.postMessage(similarity);
  }
);
