import { Mastra } from "@mastra/core";
import { LibSQLStore } from "@mastra/libsql";

import { assistantAgent } from "../agents/assistant.js";

export const mastra = new Mastra({
  agents: {
    assistantAgent,
  },

  storage: new LibSQLStore({
    id: "mastra-storage",
    url: "file:./mastra.db",
  }),

  server: {
    port: 4111,
  },
});