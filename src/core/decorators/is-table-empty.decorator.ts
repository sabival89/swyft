import { BadRequestException } from '@nestjs/common';
import { Repository } from 'src/repositories/repository';

const isTableEmpty = (table: string) => (
  target: unknown,
  propertyKey: string,
  descriptor: PropertyDescriptor
) => {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args) {
    if (Repository.isTableEmpty(table) === false)
      return new BadRequestException('Database is empty');
    else return originalMethod.apply(this, args);
  };

  return descriptor;
};

export default isTableEmpty;
