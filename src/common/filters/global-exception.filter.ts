import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_SERVER_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        errorCode = exception.constructor.name;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const responseObj = exceptionResponse as any;

        // NestJS ValidationPipe에서 오는 경우: message가 배열일 수 있음
        if (Array.isArray(responseObj.message)) {
          message = responseObj.message.join(', ');
        } else {
          message = responseObj.message || responseObj.error || 'Unknown error';
        }

        errorCode = responseObj.error || exception.constructor.name;
      }
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      message = '데이터베이스 오류가 발생했습니다.';
      errorCode = 'DATABASE_ERROR';

      // MySQL & PostgreSQL 중복 키 오류 감지
      const lowerMsg = exception.message.toLowerCase();
      if (
        lowerMsg.includes('duplicate') ||
        lowerMsg.includes('unique constraint')
      ) {
        status = HttpStatus.CONFLICT;
        message = '이미 존재하는 데이터입니다.';
        errorCode = 'DUPLICATE_ENTRY';
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      errorCode = exception.constructor.name;
    }

    // 로그 기록 (개발 환경에서만 stack 표시)
    const stack = exception instanceof Error ? exception.stack : '';
    const isDev = process.env.NODE_ENV !== 'production';

    this.logger.error(
      `🔥 HTTP ${status} Error - ${message}`,
      isDev ? stack : undefined,
      `${request.method} ${request.url}`,
    );

    const errorResponse = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      errorCode,
    };

    response.status(status).json(errorResponse);
  }
}
