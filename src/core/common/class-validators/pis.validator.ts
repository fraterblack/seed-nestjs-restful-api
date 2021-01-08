import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'pis', async: false })
export class PisValidator implements ValidatorConstraintInterface {
    validate(text: string, args: ValidationArguments) {
        return this.validatePis(text);
    }

    defaultMessage(args: ValidationArguments) {
        return 'PIS $value é inválido';
    }

    /*
    * Validation based mariohmol/js-brasil script
    * https://github.com/mariohmol/js-brasil
    */
    private validatePis(value: string) {
        value = this.getAllDigits(value);
        const nis = this.fillString(value, 11, '0');
        const regex = /\d{11}/; // /^\d{3}\.\d{5}\.\d{2}\-\d{1}$/;
        if (!regex.test(nis)) {
            return false;
        }

        const digit = this.createPis(value);
        return nis[10].toString() === digit.toString();
    }

    private createPis(value: string) {

        value = this.getAllDigits(value);
        const nis: any = this.fillString(value, 11, '0');

        let d: any;
        let p = 2;
        let c = 9;
        for (d = 0; c >= 0; c--, (p < 9) ? p++ : p = 2) {
            d += nis[c] * p;
        }

        const digit = (((10 * d) % 11) % 10);
        return digit;
    }

    private getAllDigits(input: string) {
        if (!input.match) {
            input = input.toString();
        }
        const match = input.match(/\d/g);
        if (match) {
            return match.join('');
        }
        return '';
    }

    private fillString(str: string, size: number, fill: string) {
        if (str.length < size) {
            const dif = size - str.length;
            for (let i = 0; i < dif; i++) {
                str = fill + str;
            }
        }

        return str;
    }
}
