import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const getHotelBookingScheduleTool = createTool({
  id: "get_hotel_booking_schedule",

  description:
    "Get hotel booking schedule information for a destination and date range.",

  inputSchema: z.object({
    destination: z.string().min(2),
    checkIn: z.string().describe("Check-in date in YYYY-MM-DD format"),
    checkOut: z.string().describe("Check-out date in YYYY-MM-DD format"),
  }),

  execute: async ({ destination, checkIn, checkOut }) => {
    return {
      destination,
      checkIn,
      checkOut,
      status: "available_for_booking",
      message:
        `Hotel booking schedule requested for ${destination} ` +
        `from ${checkIn} to ${checkOut}.`,
    };
  },
});