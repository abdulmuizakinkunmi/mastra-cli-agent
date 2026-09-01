import { createVectorQueryTool } from "@mastra/rag";
import { LibSQLVector } from "@mastra/libsql";
import { fastembed } from "@mastra/fastembed";

export const ragSearchTool = createVectorQueryTool({
  id: "rag-search",
  description:
    "Search internal documents stored in the data directory. Use this tool when the user asks about internal information, policies, documentation, procedures, or project-specific information.",
  vectorStore: new LibSQLVector({
    id: "rag-vector-store",
    url: "file:./mastra.db",
  }),
  indexName: "internal_documents",
  model: fastembed,
  includeSources: true,
});