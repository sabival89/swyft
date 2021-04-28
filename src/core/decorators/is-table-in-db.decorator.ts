import { BadRequestException } from '@nestjs/common';
import { Repository } from 'src/repositories/repository';

/**
 * Check if a given table exists in the database
 * @param table
 * @returns
 */
const isTableInDB = (table: any) => (
  target: unknown,
  propertyKey: string,
  descriptor: PropertyDescriptor
) => {
  const mainMethod = descriptor.value;

  descriptor.value = function (...args) {
    return Repository.isTableInDB(table)
      .then(() => mainMethod.apply(this, args))
      .catch(() => {
        return new BadRequestException('The table does not exist');
      });
  };

  return descriptor;
};

export default isTableInDB;
