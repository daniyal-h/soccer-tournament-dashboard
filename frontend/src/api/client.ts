const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/*
Centralized HTTP layer 
*/

type ApiErrorResponse = {
  error?: {
    status?: number;
    code?: string;
    message?: string;
  };
};

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 500, code = 'UNKNOWN_ERROR') {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const SAFE_ERROR_CODES = new Set(['NOT_FOUND', 'BAD_REQUEST', 'CONFLICT', 'TOO_MANY_REQUESTS']);

// GET requests with deliberate error throwing
export async function apiGet<T>(path: string): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`);

    // bad response should only show message if it's a safe error code
    // otherwise, throw a generic one
    if (!response.ok) {
      let status = response.status;
      let code = 'UNKNOWN_ERROR';
      let message = 'Something went wrong.';

      try {
        const data: ApiErrorResponse = await response.json();

        status = data.error?.status ?? status;
        code = data.error?.code ?? code;

        if (data.error?.message && data.error?.code && SAFE_ERROR_CODES.has(data.error.code)) {
          message = data.error.message;
        }
      } catch {
        // keep generic fallback
      }

      throw new ApiError(message, status, code);
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError('Unable to reach the server.', 0, 'NETWORK_ERROR');
  }
}
