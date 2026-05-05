"use server";

import { updateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache/tags";

export async function revalidateUsersCache() {
  updateTag(CACHE_TAGS.users);
}

export async function revalidateUserCache(id: string | number) {
  updateTag(CACHE_TAGS.users);
  updateTag(CACHE_TAGS.user(id));
}
