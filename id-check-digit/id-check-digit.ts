declare var angular: any;

class IdCheckDigitCtrl {
    public partA: string = 'C8912345';
    public checksumA = '';
    public partB = '880101';
    public checksumB = '';
    public partC = '250101';
    public checksumC = '';
    public globalChecksum = '';
    public valid = false;

    public constructor() {
        this.calculate();
    }

    public calculate(): void {
        this.checksumA = this.checksum(this.partA, 8);
        this.checksumB = this.checksum(this.partB, 6);
        this.checksumC = this.checksum(this.partC, 6);
        if (this.checksumA === '' || this.checksumB === '' || this.checksumC === '') {
            this.globalChecksum = '';
            this.valid = false;
            return;
        }

        // historically, the number had a digit more, add a zero to compensate
        let allNumbers = this.partA + '0' + this.checksumA;
        allNumbers += this.partB + this.checksumB;
        allNumbers += this.partC + this.checksumC;

        this.globalChecksum = this.checksum(allNumbers, 24);
        if (this.globalChecksum !== '') {
            this.valid = true;
        }
    }

    // noinspection JSMethodCanBeStatic
    private checksum(dateStr: string, expectedLength: number): string {
        if (dateStr.length !== expectedLength) {
            return '';
        }
        const letters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const mod = [7, 3, 1];

        let s = 0;
        for (let i = 0; i < dateStr.length; i++) {
            let c = dateStr.charAt(i);
            if (letters.indexOf(c) !== -1) {
                s += letters.indexOf(c) * mod[i % 3];
            } else {
                return '';
            }
        }
        return (s.toString()).charAt(s.toString().length - 1);
    }

}

angular.module('IdCheckDigitApp', []).controller('IdCheckDigitCtrl', IdCheckDigitCtrl);
