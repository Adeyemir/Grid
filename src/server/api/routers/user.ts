import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  // Get user profile by Privy user ID
  getProfile: publicProcedure
    .input(z.object({ privyUserId: z.string() }))
    .query(async ({ ctx, input }) => {
      const profile = await ctx.db.userProfile.findUnique({
        where: { privyUserId: input.privyUserId },
      });
      return profile;
    }),

  // Check if username is available
  checkUsername: publicProcedure
    .input(z.object({ username: z.string().min(3).max(20) }))
    .query(async ({ ctx, input }) => {
      const normalizedUsername = input.username.toLowerCase().trim();

      // Check for valid characters (alphanumeric and underscores only)
      if (!/^[a-z0-9_]+$/.test(normalizedUsername)) {
        return { available: false, reason: "Username can only contain letters, numbers, and underscores" };
      }

      const existing = await ctx.db.userProfile.findUnique({
        where: { username: normalizedUsername },
      });

      return {
        available: !existing,
        reason: existing ? "Username is already taken" : null
      };
    }),

  // Create user profile with username
  createProfile: publicProcedure
    .input(
      z.object({
        privyUserId: z.string(),
        username: z.string().min(3).max(20),
        walletAddress: z.string().optional(),
        displayName: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const normalizedUsername = input.username.toLowerCase().trim();

      // Validate username format
      if (!/^[a-z0-9_]+$/.test(normalizedUsername)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Username can only contain letters, numbers, and underscores",
        });
      }

      // Check if user already has a profile
      const existingProfile = await ctx.db.userProfile.findUnique({
        where: { privyUserId: input.privyUserId },
      });

      if (existingProfile) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already has a profile",
        });
      }

      // Check if username is taken
      const existingUsername = await ctx.db.userProfile.findUnique({
        where: { username: normalizedUsername },
      });

      if (existingUsername) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Username is already taken",
        });
      }

      // Create the profile
      const profile = await ctx.db.userProfile.create({
        data: {
          privyUserId: input.privyUserId,
          username: normalizedUsername,
          walletAddress: input.walletAddress,
          displayName: input.displayName || normalizedUsername,
        },
      });

      return profile;
    }),

  // Update user profile
  updateProfile: publicProcedure
    .input(
      z.object({
        privyUserId: z.string(),
        displayName: z.string().optional(),
        avatarUrl: z.string().url().optional(),
        walletAddress: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.userProfile.update({
        where: { privyUserId: input.privyUserId },
        data: {
          displayName: input.displayName,
          avatarUrl: input.avatarUrl,
          walletAddress: input.walletAddress,
        },
      });

      return profile;
    }),

  // Get user by username (for sending to Grid users)
  getByUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      // Clean the username - remove @ and lowercase
      const cleanUsername = input.username.toLowerCase().replace(/^@/, "").trim();

      const profile = await ctx.db.userProfile.findUnique({
        where: { username: cleanUsername },
      });

      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return {
        username: profile.username,
        displayName: profile.displayName,
        walletAddress: profile.walletAddress,
      };
    }),
});
