import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";

export const demoRouter = createTRPCRouter({
  hello: protectedProcedure
    .input(z.object({ text: z.string().max(25) }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
});