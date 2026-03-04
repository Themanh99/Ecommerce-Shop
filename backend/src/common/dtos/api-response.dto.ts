export class ApiResponseDto<T> {
  success: boolean;
  message: string;
  data: T | null;
  timestamp: string;
  path?: string;
  error?: unknown;

  constructor(partial: Partial<ApiResponseDto<T>>) {
    Object.assign(this, partial);
  }
}
