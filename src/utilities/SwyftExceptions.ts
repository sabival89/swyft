import { BadRequestException, HttpException } from '@nestjs/common';

export declare class EmptyDatabaseException extends HttpException {
  constructor(
    ObjectOrError?: string | Record<string, unknown> | any,
    description?: string
  );
}
