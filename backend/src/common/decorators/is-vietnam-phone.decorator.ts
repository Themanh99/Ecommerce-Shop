import { ValidationOptions } from 'class-validator';
import { ValidatePhone } from './validate-phone.decorator';

export function IsVietnamPhone(validationOptions?: ValidationOptions): PropertyDecorator {
  return ValidatePhone(validationOptions);
}
