import { api } from "./api";

import type { UserResponse } from "../types/auth";

export async function getCurrentUser(): Promise<UserResponse> {
  const response = await api.get<UserResponse>(
    "/auth/me",
  );

  return response.data;
}