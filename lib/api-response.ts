import { NextResponse } from 'next/server';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json<ApiResponse<T>>({ success: true, data }, { status });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json<ApiResponse>({ success: false, error: message }, { status });
}

// Map Supabase error codes to user-friendly messages
const ERROR_MAP: Record<string, string> = {
  '23505': 'This record already exists.',
  '23503': 'Related record not found.',
  '42501': 'You do not have permission to perform this action.',
  'PGRST301': 'You must be logged in to access this resource.',
  'user_already_exists': 'An account with this email already exists.',
  'invalid_credentials': 'Invalid email or password.',
  'email_not_confirmed': 'Please verify your email before logging in.',
};

export function mapSupabaseError(error: { code?: string; message?: string }): string {
  if (error.code && ERROR_MAP[error.code]) return ERROR_MAP[error.code];
  if (error.message && ERROR_MAP[error.message]) return ERROR_MAP[error.message];
  return 'Something went wrong. Please try again.';
}
