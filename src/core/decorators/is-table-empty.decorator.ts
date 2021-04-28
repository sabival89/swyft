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

  descriptor.value = function (...args: any): Promise<any> {
    return Repository.isTableEmpty(table)
      .then(() => mainMethod.apply(this, args))
      .catch(() => {
        return new BadRequestException('Database is empty');
      });
  };

  return descriptor;
};

export default isTableEmpty;
