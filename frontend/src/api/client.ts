const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/*
Centralized HTTP layer 
*/

type ApiErrorResponse = {
  error: {
    status: number;
    code: string;
    message: string;
  };
};

// GET requests
export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    let message = 'Something went wrong';

    try {
      const data: ApiErrorResponse = await response.json();
      message = data.error.message;
    } catch {
      // fallback to generic message
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}
