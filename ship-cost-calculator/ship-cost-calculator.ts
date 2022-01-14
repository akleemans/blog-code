declare var angular: any;

class ShipCostCtrl {
    public slots: number = 25;
    public price: string = '';
    public hours: string = '';

    public constructor() {
        this.calculateCost();
    }

    public calculateCost(): void {
        if (this.slots < 1 || this.slots > 99) {
            this.price = '0 units';
            this.hours = '0 hours';
        } else {
            const p = Math.pow(this.slots, 4.75);
            this.price = this.format(p) + ' units';
            this.hours = ((p / 1000000) / 1.3).toFixed(2) + ' hours';
        }
    }

    // noinspection JSMethodCanBeStatic
    private format(p: number): string {
        let nr = Math.round(p).toString(10);
        let s = '';
        let count = 0;
        for (let i = nr.length - 1; i >= 0; i--) {
            if (count > 0 && count % 3 == 0) {
                s = '\'' + s;
            }
            s = nr.charAt(i) + s;
            count += 1;
        }
        return s;
    }

}

angular.module('ShipCostApp', []).controller('ShipCostCtrl', ShipCostCtrl);
