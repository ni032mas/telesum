import { apiFetch } from "./client";

export interface AuthStatus {
  authenticated: boolean;
  phone?: string;
}

export interface SendCodeResult {
  success: boolean;
  phoneCodeHash: string;
}

export interface VerifyResult {
  success: boolean;
  authenticated?: boolean;
  passwordRequired?: boolean;
}

export function getAuthStatus(): Promise<AuthStatus> {
  return apiFetch<AuthStatus>("/auth/status");
}

export function sendCode(phone: string): Promise<SendCodeResult> {
  return apiFetch<SendCodeResult>("/auth/send-code", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
}

export function verifyCode(code: string): Promise<VerifyResult> {
  return apiFetch<VerifyResult>("/auth/verify-code", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export function verifyPassword(password: string): Promise<VerifyResult> {
  return apiFetch<VerifyResult>("/auth/verify-password", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}
