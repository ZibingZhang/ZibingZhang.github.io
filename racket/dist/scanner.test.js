import scanner from './scanner.js';
import * as lit from './literals.js';
describe('isNumber parsing', () => {
    describe('a number', () => {
        test('a real decimal', () => {
            expect(scanner.isNumber('#e-3.'))
                .toEqual(new lit.RacketExactNumber(-3n, 1n));
            expect(scanner.isNumber('#i+4.532'))
                .toEqual(new lit.RacketInexactFraction(4532n, 1000n));
            expect(scanner.isNumber('.014159'))
                .toEqual(new lit.RacketExactNumber(14159n, 1000000n));
        });
        test('a real fraction', () => {
            expect(scanner.isNumber('9/3'));
        });
        test('an imaginary number', () => {
            expect(scanner.isNumber('+1i'))
                .toEqual(new lit.RacketComplexNumber(new lit.RacketExactNumber(0n, 1n), new lit.RacketExactNumber(1n, 1n)));
        });
    });
});
