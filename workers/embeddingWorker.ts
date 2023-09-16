import { pipeline, Tensor } from "@xenova/transformers";

self.addEventListener("message", async (event) => {
  try {
    const document = event.data.text;

    const extractor = await pipeline(
      "feature-extraction",
      "Supabase/bge-small-en"
    );

    const output: Tensor = await extractor(document, {
      pooling: "mean",
      normalize: true,
    });

    const flattenedOutput = output.flatten().tolist();

    self.postMessage({
      status: "complete",
      output: flattenedOutput,
    });
  } catch (error) {
    self.postMessage({
      status: "error",
      message: error,
    });
  }
});
