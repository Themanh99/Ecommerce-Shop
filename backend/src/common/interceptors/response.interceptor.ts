import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ApiResponseDto } from '../dtos/api-response.dto';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponseDto<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponseDto<T>> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object' && 'success' in (data as Record<string, unknown>)) {
          return data as ApiResponseDto<T>;
        }

        let message = 'Success';
        let payload = data as T | null;

        if (data && typeof data === 'object' && 'message' in (data as Record<string, unknown>)) {
          const raw = data as Record<string, unknown>;
          if (typeof raw.message === 'string') {
            message = raw.message;
          }
          const { message: _ignored, ...rest } = raw;
          payload = Object.keys(rest).length > 0 ? (rest as T) : null;
        }

        return new ApiResponseDto<T>({
          success: true,
          message,
          data: payload,
          timestamp: new Date().toISOString(),
          path: request?.originalUrl ?? request?.url,
        });
      }),
    );
  }
}
