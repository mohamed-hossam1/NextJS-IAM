"use server";

import z from "zod";
import { apiClient } from "@/lib/api/client";
import { actionClient } from "@/lib/next-action-handler/safe-action";
import {
  RevokeSessionSchema,
  SetPasswordSchema,
  UpdateProfileSchema,
} from "@/lib/zodSchema/profile-schema";
import type { PublicSession, PublicUser } from "@/types/auth";

export const getCurrentSession = actionClient
  .metadata({ actionName: "profile.getCurrentSession" })
  .action(async () => {
    try {
      const user = await apiClient.get<{
        id: string;
        email: string;
        name?: string | null;
        avatarUrl?: string | null;
        isVerified?: boolean;
        createdAt: string;
        updatedAt: string;
        hasPassword?: boolean;
      }>("/users/me");

      if (!user?.id) return null;

      const publicUser: PublicUser = {
        id: user.id,
        name: user.name ?? "",
        email: user.email,
        emailVerified: Boolean(user.isVerified),
        image: user.avatarUrl ?? null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        hasPassword: user.hasPassword,
      };

      const session: PublicSession = {
        id: user.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        expiresAt: "",
        ipAddress: null,
        userAgent: null,
      };

      return { session, user: publicUser };
    } catch {
      return null;
    }
  });

export const updateProfile = actionClient
  .metadata({ actionName: "profile.updateProfile" })
  .inputSchema(UpdateProfileSchema)
  .action(async ({ parsedInput }) => {
    return await apiClient.patch("/users/me", parsedInput);
  });

export const hasPassword = actionClient
  .metadata({ actionName: "profile.hasPassword" })
  .action(async () => {
    const user = await apiClient.get<{ hasPassword: boolean }>("/users/me");
    return user?.hasPassword ?? false;
  });

export const sendCurrentUserPasswordResetEmail = actionClient
  .metadata({ actionName: "profile.sendCurrentUserPasswordResetEmail" })
  .action(async () => {
    try {
      const user = await apiClient.get<{ email: string }>("/users/me");
      if (user?.email) {
        await apiClient.post("/auth/forgot-password", { email: user.email });
      }
    } catch {}

    return {
      message: "If your account is valid, a reset email was sent.",
    };
  });

const ChangePasswordInputSchema = z.object({
  oldPassword: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6),
});

export const changePassword = actionClient
  .metadata({ actionName: "profile.changePassword" })
  .inputSchema(ChangePasswordInputSchema)
  .action(async ({ parsedInput }) => {
    const oldPassword = parsedInput.oldPassword ?? parsedInput.currentPassword;
    return await apiClient.post("/auth/change-password", {
      oldPassword,
      newPassword: parsedInput.newPassword,
    });
  });

export const setPassword = actionClient
  .metadata({ actionName: "profile.setPassword" })
  .inputSchema(SetPasswordSchema)
  .action(async ({ parsedInput }) => {
    return await apiClient.post("/auth/set-password", parsedInput);
  });

export const listSessionsPublic = actionClient
  .metadata({ actionName: "profile.listSessionsPublic" })
  .action(async () => {
    const data = await apiClient.get<{
      sessions: Array<{
        id: string;
        deviceName?: string;
        ipAddress?: string;
        userAgent?: string;
        isCurrent: boolean;
        createdAt: string;
        updatedAt: string;
      }>;
    }>("/auth/sessions");

    return (data?.sessions ?? []).map((s) => ({
      id: s.id,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      expiresAt: "",
      ipAddress: s.ipAddress ?? null,
      userAgent: s.userAgent ?? null,
    }));
  });

export const revokeSessionById = actionClient
  .metadata({ actionName: "profile.revokeSessionById" })
  .inputSchema(RevokeSessionSchema)
  .action(async ({ parsedInput }) => {
    return await apiClient.post("/auth/sessions/revoke", {
      sessionId: parsedInput.sessionId,
    });
  });

export const revokeAllOtherSessions = actionClient
  .metadata({ actionName: "profile.revokeAllOtherSessions" })
  .action(async () => {
    return await apiClient.post("/auth/sessions/revoke-all");
  });

export const deleteAccount = actionClient
  .metadata({ actionName: "profile.deleteAccount" })
  .action(async () => {
    return await apiClient.delete("/users/me");
  });
