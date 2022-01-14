var Person;
(function (Person) {
    Person["ALICE"] = "Alice";
    Person["BOB"] = "Bob";
})(Person || (Person = {}));
var DiffieHellmanCtrl = /** @class */ (function () {
    function DiffieHellmanCtrl() {
        this.me = Person.ALICE;
    }
    DiffieHellmanCtrl.prototype.$onInit = function () {
        console.log('Starting up! I am:', this.me);
    };
    // Function for Alice
    DiffieHellmanCtrl.prototype.prepareAlice = function () {
        // Initialize primes based on number size
        this._p = this.getSmallPrime();
        this._g = 2;
        this._a = this.getSecretNumber(this._p);
        this.A = this.modExp(this._g, this._a, this._p);
    };
    DiffieHellmanCtrl.prototype.getSmallPrime = function () {
        var smallPrimes = [83, 107, 167, 179, 227, 263];
        var random = Math.floor(Math.random() * smallPrimes.length);
        return smallPrimes[random];
    };
    // Function for Bob
    DiffieHellmanCtrl.prototype.prepareBob = function () {
        this._b = this.getSecretNumber(this._p);
        this.B = this.modExp(this._g, this._b, this._p);
    };
    // Generate random secret, for example a or b, in range {1...p-1}
    DiffieHellmanCtrl.prototype.getSecretNumber = function (max) {
        return Math.floor(Math.random() * (max - 1));
    };
    // Fast modular exponentiation for a ^ b mod n
    // from https://gist.github.com/krzkaczor/0bdba0ee9555659ae5fe
    DiffieHellmanCtrl.prototype.modExp = function (a, b, n) {
        a = a % n;
        var result = 1;
        var x = a;
        while (b > 0) {
            var leastSignificantBit = b % 2;
            b = b / 2;
            if (leastSignificantBit === 1) {
                result = result * x;
                result = result % n;
            }
            x = x * x;
            x = x % n;
        }
        return result;
    };
    DiffieHellmanCtrl.prototype.calculateKey = function () {
        if (this.me === Person.ALICE) {
            this.K = this.modExp(this.B, this._a, this._p); //Math.round(Math.pow(this.B, this._a) % this._p);
        }
        else {
            this.K = this.modExp(this.A, this._b, this._p); // Math.round(Math.pow(this.A, this._b) % this._p);
        }
    };
    // From https://stackoverflow.com/a/39870667/811708
    DiffieHellmanCtrl.prototype.encryptWithXORtoHex = function () {
        var input = this.message;
        var c = '';
        for (var i = 0; i < input.length; i++) {
            var value1 = input[i].charCodeAt(0);
            var xorValue = value1 ^ this.K;
            var xorValueAsHexString = xorValue.toString(16);
            if (xorValueAsHexString.length < 2) {
                xorValueAsHexString = '0' + xorValueAsHexString;
            }
            c += xorValueAsHexString;
        }
        this.encrypted = c;
    };
    DiffieHellmanCtrl.prototype.decrypt = function () {
        var input = this.message;
        var c = '';
        for (var i = 0; i < input.length; i += 2) {
            var value1 = parseInt(input[i].charAt(0) + input[i + 1].charAt(0), 16);
            var xorValue = value1 ^ this.K;
            c += String.fromCharCode(xorValue);
        }
        this.encrypted = c;
    };
    return DiffieHellmanCtrl;
}());
angular.module('DiffieHellmanApp', []).controller('DiffieHellmanCtrl', DiffieHellmanCtrl);
