import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import dayjs from 'dayjs';

@ValidatorConstraint({ name: 'date', async: false })
export class DateOnlyValidator implements ValidatorConstraintInterface {
    validate(text: string, args: ValidationArguments) {
        return this.validateDateOnly(text);
    }

    defaultMessage(args: ValidationArguments) {
        return 'A data $value é inválida';
    }

    validateDateOnly(value: string) {
        const regex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;

        if (regex.test(value)) {
            return dayjs(value, 'YYYY-MM-DD', true).isValid();
        }

        return false;
    }
}
