import {z} from "zod";

export const locationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

export const createLocationSchema = z.object({
  roomName: z.string().min(1, "Room name is required"),
  radius: z.number().positive("Radius must be a positive number").optional(),
  location: locationSchema,
});

