import { AbsoluteTime, Time, TimeSpan } from './time';
import { expect } from 'chai';
import { Rational, RationalDef } from '~/model/rationals/rational';

describe('Times', ()=> {
    describe('Rational', ()=> {
        it('should create a rational', () => {
            const r: RationalDef = { numerator: 1, denominator: 2 };
            expect(Rational.value(r)).to.eq(0.5);
        });

        it('should return a correct numeric value of a rational', () => {
            const r: RationalDef = { numerator: 5, denominator: 7 };
            expect(Rational.value(r)).to.eq(5/7);
        });

        it('should correctly add two rationals', () => {
            const r3 = { numerator: 5, denominator: 7 };
            const r4 = { numerator: 3, denominator: 4 };
            expect(Rational.add(r3, r4)).to.deep.eq({ numerator: 41, denominator: 28 });
        });


        it('should correctly scale a rational', () => {
            const r3 = { numerator: 5, denominator: 7 };
            const r4 = { numerator: 35, denominator: 12 };
            expect(Rational.scale(r3, 2)).to.deep.eq({ numerator: 10, denominator: 7 });
            expect(Rational.scale(r3, 2, 3)).to.deep.eq({ numerator: 10, denominator: 21 });
            expect(Rational.scale(r4, 2, 5)).to.deep.eq({ numerator: 7, denominator: 6 });
        });

        it('should calculate lcd for two ints', () => {            
            expect(Rational.lcd(24, 64)).to.eq(8);
            expect(Rational.lcd(24, 65)).to.eq(1);
            expect(Rational.lcd(64, 24)).to.eq(8);
            expect(Rational.lcd(12, 8)).to.eq(4);
        });


        it('should correctly shorten a rational', () => {
            const r1 = { numerator: 9, denominator: 18 };
            expect(Rational.shorten(r1)).to.deep.eq({ numerator: 1, denominator: 2 });

            const r2 = { numerator: 12, denominator: 8 };
            expect(Rational.shorten(r2)).to.deep.eq({ numerator: 3, denominator: 2 });
        });
        it('should correctly add and shorten two rationals', () => {
            const r1 = { numerator: 1, denominator: 6 };
            const r2 = { numerator: 1, denominator: 3 };
            expect(Rational.add(r1, r2)).to.deep.eq({ numerator: 1, denominator: 2 });

            const r3 = { numerator: 5, denominator: 7 };
            const r4 = { numerator: 3, denominator: 4 };
            expect(Rational.add(r3, r4)).to.deep.eq({ numerator: 41, denominator: 28 });
        });

        
        it('should multiply a rational with a scalar', () => {
            const r1 = { numerator: 5, denominator: 7 };
            const scalar = 6;
            expect(Rational.scale(r1, scalar)).to.deep.eq({ numerator: 30, denominator: 7 });

            const r2 = { numerator: 5, denominator: 8 };
            expect(Rational.scale(r2, scalar)).to.deep.eq({ numerator: 15, denominator: 4 });
        });

        it('should correctly compare two rationals', () => {
            const r1 = { numerator: 2, denominator: 5 };
            const r2 = { numerator: 1, denominator: 3 };
            expect(Rational.compare(r1, r2)).to.be.greaterThan(0);

            const r3 = { numerator: 5, denominator: 7 };
            const r4 = { numerator: 3, denominator: 4 };
            expect(Rational.compare(r3, r4)).to.be.lessThan(0);

            const r5 = { numerator: 15, denominator: 6 };
            const r6 = { numerator: 35, denominator: 14 };
            expect(Rational.compare(r5, r6)).to.eq(0);
        });


    });




    describe('Times', ()=> {
        it('should create an absolute time', () => {
            const r: AbsoluteTime = { numerator: 1, denominator: 2, type: 'abs' };
            expect(Rational.value(r)).to.eq(0.5);
        });

        it('should compare two absolute times', () => {
            const r1: AbsoluteTime = { numerator: 0, denominator: 2, type: 'abs' };
            const r2: AbsoluteTime = { numerator: 1, denominator: 2, type: 'abs' };
            expect(Rational.compare(r1, r2)).to.be.lessThan(0);
        });

        it('should correctly find timespan between two absolute times', () => {
            const r3: AbsoluteTime = { numerator: 5, denominator: 7, type: 'abs' };
            const r4: AbsoluteTime = { numerator: 3, denominator: 4, type: 'abs' };
            expect(Time.getSpan(r3, r4)).to.deep.eq({ numerator: 1, denominator: 28, type: 'span' });
        });

        it('should correctly find timespan from start and vice versa', () => {
            const r3: AbsoluteTime = { numerator: 5, denominator: 7, type: 'abs' };
            const r4: TimeSpan = { numerator: 5, denominator: 7, type: 'span' };
            expect(Time.fromStart(r3)).to.deep.eq(r4);
            expect(Time.fromStart(r4)).to.deep.eq(r3);
        });


        it('should correctly add two timespans', () => {
            const r3: TimeSpan = { numerator: 5, denominator: 7, type: 'span' };
            const r4: TimeSpan = { numerator: 3, denominator: 4, type: 'span' };
            expect(Time.addSpans(r3, r4)).to.deep.eq({ numerator: 41, denominator: 28, type: 'span' });
        });

        it('should correctly add timespan to absolute time', () => {
            const r3: AbsoluteTime = { numerator: 5, denominator: 7, type: 'abs' };
            const r4: TimeSpan = { numerator: 3, denominator: 4, type: 'span' };
            expect(Time.addTime(r3, r4)).to.deep.eq({ numerator: 41, denominator: 28, type: 'abs' });
        });
 
        it('should multiply a timespan with a scalar', () => {
            const r1 = Time.newSpan(5, 7);
            const scalar = 6;
            expect(Time.scale(r1, scalar)).to.deep.eq({ numerator: 30, denominator: 7, type: 'span' });

            const r2 = Time.newSpan(5, 8);
            expect(Time.scale(r2, scalar)).to.deep.eq({ numerator: 15, denominator: 4, type: 'span' });
        });

        it('should reject times of wrong type', () => {
            const r1: AbsoluteTime = { numerator: 5, denominator: 7, type: 'abs' };
            const r2: AbsoluteTime = { numerator: 3, denominator: 4, type: 'abs' };
            const r3: TimeSpan = { numerator: 5, denominator: 7, type: 'span' };
            const r4: TimeSpan = { numerator: 3, denominator: 4, type: 'span' };

            expect(() => { 
                const res = Time.addTime(r3 as any, r4);
            }).to.throw(/Type error/);


            expect(() => { 
                const res = Time.addTime(r1, r2 as any);
            }).to.throw(/Type error/);

            expect(() => { 
                const res = Time.getSpan(r1, r4 as any);
            }).to.throw(/Type error/);


            expect(() => { 
                const res = Time.getSpan(r3 as any, r2);
            }).to.throw(/Type error/);


            expect(() => { 
                const res = Time.addSpans(r1 as any, r4);
            }).to.throw(/Type error/);

            expect(() => { 
                const res = Time.addSpans(r3, r1 as any);
            }).to.throw(/Type error/);


        });

        it('should compare equality of two absolute times', () => {
            const t1 = Time.newAbsolute(3, 4);
            const t2 = Time.newAbsolute(9, 12);
            const t3 = Time.newAbsolute(0, 4);
            const t4 = Time.newAbsolute(0, 1);

            expect(Time.equals(t1, t2)).to.be.true;
            expect(Time.equals(t1, t3)).to.be.false;
            expect(Time.equals(t4, t3)).to.be.true;
        });
        
        it('should calculate number of dots from numerator', () => {
            expect(Time.getDotNo(1)).to.eq(0);
            expect(Time.getDotNo(3)).to.eq(1);
            expect(Time.getDotNo(7)).to.eq(2);
            expect(Time.getDotNo(15)).to.eq(3);
        });

    });






});