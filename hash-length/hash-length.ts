declare var angular: any;

class HashLengthCtrl {
    public p = 20.0;
    public k = 50;
    public n: string = '';
    public hash = '';
    public prob = '';

    public constructor() {
        this.calculate();
    }

    public calculate() {
        let p = this.p / 100.0;
        let k = this.k;
        let space = k * (k - 1) / (2 * p);
        let digits = this.getBaseLog(16, space);
        this.n = this.formatNumber(space, 0) + ' or ' + this.formatNumber(digits, 2) + ' hash digits';
        this.hash = this.getHash(Math.ceil(digits));

        // calculate exact probability
        let ex = -(k * (k - 1)) / (2 * space);
        let prob = (1 - Math.pow(Math.E, ex)) * 100;
        this.prob = this.formatNumber(prob, 1) + '%';
    };

    // noinspection JSMethodCanBeStatic
    private formatNumber(nr: number, digits: number): string {
        const x = 10 ** digits;
        return (Math.round(nr * x) / x).toString();
    }

    // noinspection JSMethodCanBeStatic
    private getBaseLog(x: number, y: number): number {
        // noinspection JSSuspiciousNameCombination
        return Math.log(y) / Math.log(x);
    }

    // noinspection JSMethodCanBeStatic
    private getRandomInt(max: number): number {
        return Math.floor(Math.random() * Math.floor(max));
    }

    private getHash(m: number): string {
        let s = '';
        let d = '0123456789abcdef';
        for (let i = 0; i < m; i++) {
            let r = this.getRandomInt(16);
            s += d.substring(r, r + 1);
        }
        return s;
    }

}

angular.module('HashLengthApp', []).controller('HashLengthCtrl', HashLengthCtrl);
