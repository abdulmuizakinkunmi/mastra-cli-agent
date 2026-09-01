import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const getFlightBookingScheduleTool = createTool({
  id: "get_flight_booking_schedule",

  description:
    "Get flight booking schedule information between two locations for a specified date.",

  inputSchema: z.object({
    origin: z.string().min(2),
    destination: z.string().min(2),
    date: z.string().describe("Flight date in YYYY-MM-DD format"),
  }),

  execute: async ({ origin, destination, date }) => {
    return {
      origin,
      destination,
      date,
      status: "schedule_request_received",
      message:
        `Flight booking schedule requested from ${origin} ` +
        `to ${destination} on ${date}.`,
    };
  },
});