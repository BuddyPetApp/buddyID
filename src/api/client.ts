import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:5000/api';

export async function getApiBaseUrl(): Promise<string> {
  return DEFAULT_API_URL;
}

interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

import { supabase } from '../lib/supabase';

async function getHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  
  return headers;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = await getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  const headers = await getHeaders();

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers ?? {}),
    },
  });

  const text = await response.text();
  const json = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const error = json as any;
    const errorMessage = error.description || error.title || error.message || 'Erro desconhecido';
    throw new Error(errorMessage);
  }

  return json as T;
}

export const apiClient = {
  get: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),

  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),

  patch: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};
