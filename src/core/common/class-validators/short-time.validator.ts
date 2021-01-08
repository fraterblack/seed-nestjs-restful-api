import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'shortTime', async: false })
export class ShortTimeValidator implements ValidatorConstraintInterface {
    validate(text: string, args: ValidationArguments) {
        return this.validateShortTime(text);
    }

    defaultMessage(args: ValidationArguments) {
        return 'Hora $value é inválida';
    }

    validateShortTime(value: string) {
        const regex = /^((2[0-3]{1})|([0-1]{1}[0-9]{1})):[0-5]{1}[0-9]{1}$/;

        if (regex.test(value)) {
            try {
                value.asTime().format(true);
                return true;
            } catch (error) {
                return false;
            }
        }

        return false;
    }
}
