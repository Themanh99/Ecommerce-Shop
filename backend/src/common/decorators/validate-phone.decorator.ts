import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
import { validatePhone } from '../utils/string.util';

export function ValidatePhone(validationOptions?: ValidationOptions): PropertyDecorator {
  return (object: object, propertyName: string | symbol) => {
    registerDecorator({
      name: 'ValidatePhone',
      target: object.constructor,
      propertyName: propertyName.toString(),
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string' || !value) {
            return false;
          }
          return validatePhone(value);
        },
        defaultMessage(args?: ValidationArguments): string {
          return `${args?.property ?? 'Field'} khong phai so dien thoai hop le`;
        },
      },
    });
  };
}
