import { BadRequestException } from '@nestjs/common';
import { Repository } from 'src/repositories/repository';

/**
 * Check if an existing table is empty
 * @param table
 * @returns
 */
const isTableEmpty = (table: string) => (
  target: unknown,
  propertyKey: string,
  descriptor: PropertyDescriptor
) => {
  const mainMethod = descriptor.value;

  descriptor.value = function (...args) {
    if (Repository.isTableEmpty(table))
      return new BadRequestException('Database is empty');
    else return mainMethod.apply(this, args);
  };

  return descriptor;
};

export default isTableEmpty;
