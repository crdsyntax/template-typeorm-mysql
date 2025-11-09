import { registerDecorator, ValidationOptions, ValidationArguments } from "class-validator";
import { TranslationService } from "../services/transalation.service";

export function TranslatedValidation(
  validationFunction: (value: any, args: ValidationArguments) => boolean,
  translationKey: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "translatedValidation",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return validationFunction(value, args);
        },
        defaultMessage(args: ValidationArguments) {
          const translationService = new TranslationService();
          return translationService.t(translationKey);
        },
      },
    });
  };
}

export function TranslatedIsNotEmpty(
  translationKey: string,
  validationOptions?: ValidationOptions,
) {
  return TranslatedValidation(
    (value: any) => value !== null && value !== undefined && value !== "",
    translationKey,
    validationOptions,
  );
}

export function TranslatedIsString(translationKey: string, validationOptions?: ValidationOptions) {
  return TranslatedValidation(
    (value: any) => typeof value === "string",
    translationKey,
    validationOptions,
  );
}

export function TranslatedIsEmail(translationKey: string, validationOptions?: ValidationOptions) {
  return TranslatedValidation(
    (value: any) => {
      if (typeof value !== "string") return false;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    translationKey,
    validationOptions,
  );
}

export function TranslatedMatches(
  pattern: RegExp,
  translationKey: string,
  validationOptions?: ValidationOptions,
) {
  return TranslatedValidation(
    (value: any) => {
      if (typeof value !== "string") return false;
      return pattern.test(value);
    },
    translationKey,
    validationOptions,
  );
}

export function TranslatedLength(
  min: number,
  max: number,
  translationKey: string,
  validationOptions?: ValidationOptions,
) {
  return TranslatedValidation(
    (value: any) => {
      if (typeof value !== "string") return false;
      return value.length >= min && value.length <= max;
    },
    translationKey,
    validationOptions,
  );
}
