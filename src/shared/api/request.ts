import { cognitoAuth } from '../auth/cognitoAuth';

const baseUrl = import.meta.env.VITE_API_URL;

const getHeaders = async (initHeaders: HeadersInit = {}) => {
  const token = await cognitoAuth.getAuthToken();

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...(initHeaders as Record<string, string>),
  };
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || response.statusText || 'API request failed');
  }

  return response.json();
};

export const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  if (!baseUrl) {
    throw new Error('Missing VITE_API_URL environment variable.');
  }

  const headers = await getHeaders(init.headers ?? {});
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
  });

  return (await handleResponse(response)) as T;
};
