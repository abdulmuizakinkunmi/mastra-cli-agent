import { Agent } from "@mastra/core/agent";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { config } from "dotenv";

import { memory } from "../mastra/memory.js";

import { convertCurrencyTool } from "../tools/currency.js";
import { getHotelBookingScheduleTool } from "../tools/hotels.js";
import { getFlightBookingScheduleTool } from "../tools/flights.js";
import { ragSearchTool } from "../tools/rag.js";

config();

const apiKey = process.env.OPENROUTER_API_KEY;
const modelName = process.env.MODEL_NAME;

if (!apiKey) {
  throw new Error("OPENROUTER_API_KEY is not configured.");
}

if (!modelName) {
  throw new Error("MODEL_NAME is not configured.");
}

const openrouter = createOpenRouter({
  apiKey,
});

export const assistantAgent = new Agent({
  id: "cli-assistant",

  name: "CLI Assistant",

  instructions: `
You are a helpful production-style CLI AI assistant.

You have four tools:

1. convert_currency
2. get_hotel_booking_schedule
3. get_flight_booking_schedule
4. rag_search

Use tools whenever they are appropriate.

Use rag_search for questions about internal company,
project, policy, documentation, or other information
stored in the internal data directory.

Use convert_currency for currency conversions.

Use get_hotel_booking_schedule for hotel booking
schedule requests.

Use get_flight_booking_schedule for flight schedule
requests.

Do not invent internal information.

Be concise, accurate, and transparent about uncertainty.
`,

  model: openrouter(modelName),

  memory,

  tools: {
    convertCurrencyTool,
    getHotelBookingScheduleTool,
    getFlightBookingScheduleTool,
    ragSearchTool,
  },
});