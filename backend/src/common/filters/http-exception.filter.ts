import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ApiResponseDto } from '../dtos/api-response.dto';
import { ERROR_MESSAGES } from '../constants/app.constants';
import { AppLoggerService } from '../services/logger.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { statusCode, message, error } = this.parseException(exception);

    this.logger.logError(
      message,
      exception instanceof Error ? exception.stack : undefined,
      `${request.method} ${request.url}`,
    );

    response.status(statusCode).json(
      new ApiResponseDto({
        success: false,
        message,
        data: null,
        error,
        timestamp: new Date().toISOString(),
        path: request.url,
      }),
    );
  }

  private parseException(exception: unknown): {
    statusCode: number;
    message: string;
    error?: unknown;
  } {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse() as
        | string
        | { message?: string | string[]; error?: string };

      if (typeof exceptionResponse === 'string') {
        return { statusCode, message: exceptionResponse };
      }

      if (Array.isArray(exceptionResponse?.message)) {
        return {
          statusCode,
          message: exceptionResponse.message[0],
          error: exceptionResponse.message,
        };
      }

      return {
        statusCode,
        message: exceptionResponse?.message ?? exception.message,
        error: exceptionResponse?.error,
      };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          return {
            statusCode: HttpStatus.CONFLICT,
            message: 'Du lieu da ton tai',
            error: exception.meta,
          };
        case 'P2003':
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Loi rang buoc khoa ngoai',
            error: exception.meta,
          };
        case 'P2025':
          return {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Khong tim thay du lieu',
            error: exception.meta,
          };
        default:
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Loi truy van du lieu',
            error: { code: exception.code, meta: exception.meta },
          };
      }
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    };
  }
}
