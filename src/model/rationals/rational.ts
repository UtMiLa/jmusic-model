/* eslint-disable comma-dangle */
export interface RationalDef {
    numerator: number;
    denominator: number;
}

export class Rational {
    static value(rational: RationalDef): number {
        return rational.numerator / rational.denominator;
    }

    static add(rational1: RationalDef, rational2: RationalDef): RationalDef {
        return this.shorten({
            numerator: rational1.numerator * rational2.denominator + rational1.denominator * rational2.numerator, 
            denominator: rational1.denominator * rational2.denominator            
        });
    }

    static multiply(rational1: RationalDef, rational2: RationalDef): RationalDef {
        return this.shorten({
            numerator: rational1.numerator * rational2.numerator, 
            denominator: rational1.denominator * rational2.denominator            
        });
    }

    static subtract(rational1: RationalDef, rational2: RationalDef): RationalDef {
        return this.shorten({
            numerator: rational1.numerator * rational2.denominator - rational1.denominator * rational2.numerator, 
            denominator: rational1.denominator * rational2.denominator
        });
    }

    static compare(rational1: RationalDef, rational2: RationalDef): number {        
        return rational1.numerator * rational2.denominator - rational1.denominator * rational2.numerator;
    }

    static lcd(i1: number, i2: number): number {
        if (i1 < 0) return this.lcd(-i1, i2);
        if (i1 < i2) [i1, i2] = [i2, i1];
        if (i2 === 0) return i1;
        return this.lcd(i2, i1 - i2);
    }

    static shorten(rational: RationalDef): RationalDef {
        const lcd = this.lcd(rational.denominator, rational.numerator);
        return {
            numerator: rational.numerator / lcd, 
            denominator: rational.denominator / lcd
        };
    }

    static scale(rational: RationalDef, scalar: number, divideBy = 1): RationalDef {
        return this.shorten({
            numerator: rational.numerator * scalar, 
            denominator: rational.denominator * divideBy
        });
    }

    static toString(rational: RationalDef): string {
        return `${rational.numerator}/${rational.denominator}`;
    }
}