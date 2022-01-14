var IdCheckDigitCtrl = /** @class */ (function () {
    function IdCheckDigitCtrl() {
        this.partA = 'C8912345';
        this.checksumA = '';
        this.partB = '880101';
        this.checksumB = '';
        this.partC = '250101';
        this.checksumC = '';
        this.globalChecksum = '';
        this.valid = false;
        this.calculate();
    }
    IdCheckDigitCtrl.prototype.calculate = function () {
        this.checksumA = this.checksum(this.partA, 8);
        this.checksumB = this.checksum(this.partB, 6);
        this.checksumC = this.checksum(this.partC, 6);
        if (this.checksumA === '' || this.checksumB === '' || this.checksumC === '') {
            this.globalChecksum = '';
            this.valid = false;
            return;
        }
        // historically, the number had a digit more, add a zero to compensate
        var allNumbers = this.partA + '0' + this.checksumA;
        allNumbers += this.partB + this.checksumB;
        allNumbers += this.partC + this.checksumC;
        this.globalChecksum = this.checksum(allNumbers, 24);
        if (this.globalChecksum !== '') {
            this.valid = true;
        }
    };
    // noinspection JSMethodCanBeStatic
    IdCheckDigitCtrl.prototype.checksum = function (dateStr, expectedLength) {
        if (dateStr.length !== expectedLength) {
            return '';
        }
        var letters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var mod = [7, 3, 1];
        var s = 0;
        for (var i = 0; i < dateStr.length; i++) {
            var c = dateStr.charAt(i);
            if (letters.indexOf(c) !== -1) {
                s += letters.indexOf(c) * mod[i % 3];
            }
            else {
                return '';
            }
        }
        return (s.toString()).charAt(s.toString().length - 1);
    };
    return IdCheckDigitCtrl;
}());
angular.module('IdCheckDigitApp', []).controller('IdCheckDigitCtrl', IdCheckDigitCtrl);
