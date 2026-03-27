import { z } from "zod";
import { siteConfig } from "@/config/site";

export const segmentSchema = z
  .object({
    start: z.number().min(0),
    end: z.number().min(0),
  })
  .refine((d) => d.end > d.start, { message: "End time must be after start time." })
  .refine(
    (d) => {
      const len = d.end - d.start;
      return (
        len >= siteConfig.clipDuration.minSeconds &&
        len <= siteConfig.clipDuration.maxSeconds
      );
    },
    {
      message: `Clip must be between ${siteConfig.clipDuration.minSeconds}s and ${siteConfig.clipDuration.maxSeconds / 60} minutes.`,
    },
  );

export const publishSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters.").max(120),
  description: z.string().max(2000).optional().default(""),
});

export const promptSchema = z.object({
  text: z.string().min(10, "Add a bit more detail (10+ characters).").max(4000),
});
