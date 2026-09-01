import { Memory } from "@mastra/memory";
import { LibSQLStore, LibSQLVector } from "@mastra/libsql";
import { fastembed } from "@mastra/fastembed";

export const memory = new Memory({
  storage: new LibSQLStore({
    id: "cli-memory-storage",
    url: "file:./mastra.db",
  }),

  vector: new LibSQLVector({
    id: "cli-memory-vector",
    url: "file:./mastra.db",
  }),

  embedder: fastembed,

  options: {
    lastMessages: 20,

    semanticRecall: {
      topK: 5,
      messageRange: 10,
    },
  },
});