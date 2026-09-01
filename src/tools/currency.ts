import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const convertCurrencyTool = createTool({
  id: "convert_currency",
  description:
    "Convert an amount from one currency to another. Use this tool whenever the user asks for a currency conversion.",

  inputSchema: z.object({
    amount: z.number().positive(),
    from: z.string().length(3).describe("Source currency code, e.g. USD"),
    to: z.string().length(3).describe("Target currency code, e.g. NGN"),
  }),

  execute: async ({ amount, from, to }) => {
    try {
      const sourceCurrency = from.toUpperCase();
      const targetCurrency = to.toUpperCase();

      const response = await fetch(
        `https://open.er-api.com/v6/latest/${encodeURIComponent(
          sourceCurrency,
        )}`,
      );

      if (!response.ok) {
        throw new Error(`Currency API returned ${response.status}`);
      }

      const data = (await response.json()) as {
        result: string;
        rates?: Record<string, number>;
      };

      const rate = data.rates?.[targetCurrency];

      if (!rate) {
        throw new Error(
          `Exchange rate for ${sourceCurrency} to ${targetCurrency} was not found.`,
        );
      }

      return {
        amount,
        from: sourceCurrency,
        to: targetCurrency,
        rate,
        convertedAmount: amount * rate,
      };
    } catch (error) {
      throw new Error(
        `Currency conversion failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  },
});