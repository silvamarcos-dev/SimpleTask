import { api } from "./api";
import type {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  UserResponse,
} from "../types/auth";

export async function login(
  data: LoginRequest,
): Promise<TokenResponse> {
  const formData = new URLSearchParams();

  formData.append("username", data.email);
  formData.append("password", data.password);

  const response = await api.post<TokenResponse>(
    "/auth/login",
    formData,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  return response.data;
}

export async function register(
  data: RegisterRequest,
): Promise<UserResponse> {
  const response = await api.post<UserResponse>(
    "/auth/register",
    data,
  );

  return response.data;
}