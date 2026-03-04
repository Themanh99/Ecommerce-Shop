import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
import { validateEmail } from '../utils/string.util';

export function ValidateEmail(validationOptions?: ValidationOptions): PropertyDecorator {
  return (object: object, propertyName: string | symbol) => {
    registerDecorator({
      name: 'ValidateEmail',
      target: object.constructor,
      propertyName: propertyName.toString(),
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string' || !value) {
            return false;
          }
          return validateEmail(value);
        },
        defaultMessage(args?: ValidationArguments): string {
          return `${args?.property ?? 'Field'} khong phai email hop le`;
        },
      },
    });
  };
}
