import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
import { validateEmail, validatePhone } from '../utils/string.util';

export function ValidateContact(validationOptions?: ValidationOptions): PropertyDecorator {
  return (object: object, propertyName: string | symbol) => {
    registerDecorator({
      name: 'ValidateContact',
      target: object.constructor,
      propertyName: propertyName.toString(),
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string' || !value) {
            return false;
          }
          return validateEmail(value) || validatePhone(value);
        },
        defaultMessage(args?: ValidationArguments): string {
          return `${args?.property ?? 'Field'} phai la email hoac so dien thoai Viet Nam hop le`;
        },
      },
    });
  };
}
