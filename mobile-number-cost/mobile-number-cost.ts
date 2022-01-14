declare var angular: any;

class PhoneNumberCtrl {
    public nr = '5888222';
    public prefix = '079';
    public cost: string = '';
    public category = '';
    public subcategory = '';

    public constructor() {
        this.calculate();
    }

    public calculate(): void {
        console.log('calculate called this: ', this);
        const nr = this.prefix + this.nr;
        if (nr.length !== 10) {
            console.log('Invalid number length for ' + nr);
            this.category = '-';
            this.cost = 'CHF -';
            this.subcategory = '-';
            return;
        }
        let category = this.getCategory(nr);
        let categories = {'B': 10000, 'C': 800, 'D': 200, 'E': 100};
        this.category = category;
        this.cost = 'CHF ' + categories[category];
    }

    public getCategory(nr): string {
        let category = 'E';
        this.subcategory = 'other';
        let catB = this.isCategoryB(nr);
        let catC = this.isCategoryC(nr);
        let catD = this.isCategoryD(nr);

        if (catB !== '') {
            this.subcategory = catB;
            category = 'B';
        } else if (catC !== '') {
            this.subcategory = catC;
            category = 'C';
        } else if (catD !== '') {
            this.subcategory = catD;
            category = 'D';
        }
        return category;
    }

    // noinspection JSMethodCanBeStatic
    private isCategoryB(nr: string): string {
        // 5-7 gleiche Ziffern am Schluss
        let l = nr.substr(9, 1);
        if (l === nr.substr(8, 1) &&
            l === nr.substr(7, 1) &&
            l === nr.substr(6, 1) &&
            l === nr.substr(5, 1)) {
            return '5-7 same digits at the end';
        }

        // 3 gleiche 3er Blöcke
        let t = nr.substr(7, 3);
        if (t === nr.substr(4, 3) && t === nr.substr(1, 3)) {
            return '3 equal 3-digit blocks';
        }
        return '';
    }

    // noinspection JSMethodCanBeStatic
    private isCategoryC(nr: string): string {
        // 3 gleiche 2er-Blöcke
        let t = nr.substr(4, 2);
        if (t === nr.substr(6, 2) && t === nr.substr(8, 2)) {
            return '3 equal 2-digit blocks';
        }

        // 2 gleiche 3er-Blöcke
        if (nr.substr(4, 3) === nr.substr(7, 3)) {
            return '2 equal 3-digit blocks';
        }

        // 2 x 3 gleiche Ziffern
        if (nr.substr(4, 1) === nr.substr(5, 1) &&
            nr.substr(6, 1) === nr.substr(5, 1) &&
            nr.substr(7, 1) === nr.substr(8, 1) &&
            nr.substr(9, 1) === nr.substr(8, 1)) {
            return '2 blocks of 3 equal digits';
        }

        // 2 100er-Blöcke
        if (nr.substr(5, 2) + nr.substr(8, 2) === '0000') {
            return '2 3-digit blocks ending in 00';
        }

        // 3 x 3-stellig auf- oder absteigend
        let sub = '3 3-digit blocks ';
        let t1 = nr.substr(1, 3);
        let t2 = nr.substr(4, 3);
        let t3 = nr.substr(7, 3);
        // last digit
        if (t1.substr(0, 1) == t2.substr(0, 1) &&
            t1.substr(0, 1) == t3.substr(0, 1) &&
            t1.substr(1, 1) == t2.substr(1, 1) &&
            t1.substr(1, 1) == t3.substr(1, 1)) {

            if (+t1.substr(2, 1) == +t2.substr(2, 1) + 1 &&
                +t1.substr(2, 1) == +t3.substr(2, 1) + 2) {
                return sub + 'descending';
            }

            if (+t1.substr(2, 1) == +t2.substr(2, 1) - 1 &&
                +t1.substr(2, 1) == +t3.substr(2, 1) - 2) {
                return sub + 'ascending';
            }
        }
        // second digit
        if (t1.substr(0, 1) == t2.substr(0, 1) &&
            t1.substr(0, 1) == t3.substr(0, 1) &&
            t1.substr(2, 1) == t2.substr(2, 1) &&
            t1.substr(2, 1) == t3.substr(2, 1)) {

            if (+t1.substr(1, 1) == +t2.substr(1, 1) + 1 &&
                +t1.substr(1, 1) == +t3.substr(1, 1) + 2) {
                return sub + 'descending';
            }

            if (+t1.substr(1, 1) == +t2.substr(1, 1) - 1 &&
                +t1.substr(1, 1) == +t3.substr(1, 1) - 2) {
                return sub + 'ascending';
            }
        }
        // first digit
        if (t1.substr(2, 1) == t2.substr(2, 1) &&
            t1.substr(2, 1) == t3.substr(2, 1) &&
            t1.substr(1, 1) == t2.substr(1, 1) &&
            t1.substr(1, 1) == t3.substr(1, 1)) {

            if (+t1.substr(0, 1) == +t2.substr(0, 1) + 1 &&
                +t1.substr(0, 1) == +t3.substr(0, 1) + 2) {
                return sub + 'descending';
            }

            if (+t1.substr(0, 1) == +t2.substr(0, 1) - 1 &&
                +t1.substr(0, 1) == +t3.substr(0, 1) - 2) {
                return sub + 'ascending';
            }
        }
        return '';
    }

    // noinspection JSMethodCanBeStatic
    private isCategoryD(nr: string): string {
        // 3 x 2 gleiche Ziffern
        if (nr.substr(4, 1) === nr.substr(5, 1) &&
            nr.substr(6, 1) === nr.substr(7, 1) &&
            nr.substr(8, 1) === nr.substr(9, 1)) {
            return '3 blocks with 2 equal digits';
        }

        // 2 gleiche 2er-Blöcke
        if (nr.substr(8, 2) === nr.substr(6, 2)) {
            return '2 equal 2-digit blocks';
        }

        // 3 Nullen am Schluss
        if (nr.substr(7, 3) === '000') {
            return '3 zeros at the end';
        }

        // 3 x 2-stellig, auf- oder absteigend
        let sub = '3 2-digit blocks ';
        let t1 = nr.substr(4, 2);
        let t2 = nr.substr(6, 2);
        let t3 = nr.substr(8, 2);

        // last digit
        if (t1.substr(0, 1) == t2.substr(0, 1) &&
            t1.substr(0, 1) == t3.substr(0, 1)) {
            if (+t1.substr(1, 1) == +t2.substr(1, 1) + 1 &&
                +t1.substr(1, 1) == +t3.substr(1, 1) + 2) {
                return sub + 'descending';
            }

            if (+t1.substr(1, 1) == +t2.substr(1, 1) - 1 &&
                +t1.substr(1, 1) == +t3.substr(1, 1) - 2) {
                return sub + 'ascending';
            }
        }

        // first digit
        if (t1.substr(1, 1) == t2.substr(1, 1) &&
            t1.substr(1, 1) == t3.substr(1, 1)) {
            if (+t1.substr(0, 1) == +t2.substr(0, 1) + 1 &&
                +t1.substr(0, 1) == +t3.substr(0, 1) + 2) {
                return sub + 'descending';
            }

            if (+t1.substr(0, 1) == +t2.substr(0, 1) - 1 &&
                +t1.substr(0, 1) == +t3.substr(0, 1) - 2) {
                return sub + 'ascending';
            }
        }

        return '';
    }

}

angular.module('PhoneNumberApp', []).controller('PhoneNumberCtrl', PhoneNumberCtrl);
