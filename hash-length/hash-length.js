var HashLengthCtrl = /** @class */ (function () {
    function HashLengthCtrl() {
        this.p = 20.0;
        this.k = 50;
        this.n = '';
        this.hash = '';
        this.prob = '';
        this.calculate();
    }
    HashLengthCtrl.prototype.calculate = function () {
        var p = this.p / 100.0;
        var k = this.k;
        var space = k * (k - 1) / (2 * p);
        var digits = this.getBaseLog(16, space);
        this.n = this.formatNumber(space, 0) + ' or ' + this.formatNumber(digits, 2) + ' hash digits';
        this.hash = this.getHash(Math.ceil(digits));
        // calculate exact probability
        var ex = -(k * (k - 1)) / (2 * space);
        var prob = (1 - Math.pow(Math.E, ex)) * 100;
        this.prob = this.formatNumber(prob, 1) + '%';
    };
    ;
    // noinspection JSMethodCanBeStatic
    HashLengthCtrl.prototype.formatNumber = function (nr, digits) {
        var x = Math.pow(10, digits);
        return (Math.round(nr * x) / x).toString();
    };
    // noinspection JSMethodCanBeStatic
    HashLengthCtrl.prototype.getBaseLog = function (x, y) {
        // noinspection JSSuspiciousNameCombination
        return Math.log(y) / Math.log(x);
    };
    // noinspection JSMethodCanBeStatic
    HashLengthCtrl.prototype.getRandomInt = function (max) {
        return Math.floor(Math.random() * Math.floor(max));
    };
    HashLengthCtrl.prototype.getHash = function (m) {
        var s = '';
        var d = '0123456789abcdef';
        for (var i = 0; i < m; i++) {
            var r = this.getRandomInt(16);
            s += d.substring(r, r + 1);
        }
        return s;
    };
    return HashLengthCtrl;
}());
angular.module('HashLengthApp', []).controller('HashLengthCtrl', HashLengthCtrl);
