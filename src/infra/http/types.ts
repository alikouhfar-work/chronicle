export type ApiSession = { token: string; user: { id: string; email: string; name: string | null } };

export type ApiErrorBody = { ok: false; error: string; code: string };
