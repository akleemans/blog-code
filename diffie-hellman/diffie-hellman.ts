declare var angular: any;

enum Person {
    ALICE = 'Alice',
    BOB = 'Bob'
}

class DiffieHellmanCtrl implements ng.IOnInit {
    public me: Person = Person.ALICE;

    public _p: number;
    public _g: number;
    public _a: number;
    public _b: number;
    public A: number;
    public B: number;
    public K: number;

    public message: string;
    public encrypted: string;

    public $onInit(): void {
        console.log('Starting up! I am:', this.me);
    }

    // Function for Alice
    public prepareAlice() {
        // Initialize primes based on number size
        this._p = this.getSmallPrime();
        this._g = 2;
        this._a = this.getSecretNumber(this._p);

        this.A = this.modExp(this._g, this._a, this._p);
    }

    private getSmallPrime(): number {
        const smallPrimes = [83, 107, 167, 179, 227, 263];
        const random = Math.floor(Math.random() * smallPrimes.length);
        return smallPrimes[random];
    }

    // Function for Bob
    public prepareBob() {
        this._b = this.getSecretNumber(this._p);
        this.B = this.modExp(this._g, this._b, this._p);
    }

    // Generate random secret, for example a or b, in range {1...p-1}
    private getSecretNumber(max: number): number {
        return Math.floor(Math.random() * (max-1));
    }

    // Fast modular exponentiation for a ^ b mod n
    // from https://gist.github.com/krzkaczor/0bdba0ee9555659ae5fe
    private modExp(a: number, b: number, n: number) {
        a = a % n;
        let result: number = 1;
        let x = a;
        while (b > 0) {
            let leastSignificantBit: number = b % 2;
            b = b / 2;
            if (leastSignificantBit === 1) {
                result = result * x;
                result = result % n;
            }
            x = x * x;
            x = x % n;
        }
        return result;
    }

    public calculateKey(): void {
        if (this.me === Person.ALICE) {
            this.K = this.modExp(this.B, this._a, this._p); //Math.round(Math.pow(this.B, this._a) % this._p);
        } else {
            this.K = this.modExp(this.A, this._b, this._p); // Math.round(Math.pow(this.A, this._b) % this._p);
        }
    }

    // From https://stackoverflow.com/a/39870667/811708
    private encryptWithXORtoHex() {
        let input = this.message;
        let c = '';
        for (let i = 0; i < input.length; i++) {
            let value1 = input[i].charCodeAt(0);

            let xorValue = value1 ^ this.K;
            let xorValueAsHexString = xorValue.toString(16);

            if (xorValueAsHexString.length < 2) {
                xorValueAsHexString = '0' + xorValueAsHexString;
            }

            c += xorValueAsHexString;
        }
        this.encrypted = c;
    }

    private decrypt() {
        let input = this.message;
        let c = '';
        for (let i = 0; i < input.length; i += 2) {
            let value1 = parseInt(input[i].charAt(0) + input[i + 1].charAt(0), 16);
            let xorValue = value1 ^ this.K;
            c += String.fromCharCode(xorValue);
        }
        this.encrypted = c;
    }
}

angular.module('DiffieHellmanApp', []).controller('DiffieHellmanCtrl', DiffieHellmanCtrl);
