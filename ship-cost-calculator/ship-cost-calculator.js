var ShipCostCtrl = /** @class */ (function () {
    function ShipCostCtrl() {
        this.slots = 25;
        this.price = '';
        this.hours = '';
        this.calculateCost();
    }
    ShipCostCtrl.prototype.calculateCost = function () {
        if (this.slots < 1 || this.slots > 99) {
            this.price = '0 units';
            this.hours = '0 hours';
        }
        else {
            var p = Math.pow(this.slots, 4.75);
            this.price = this.format(p) + ' units';
            this.hours = ((p / 1000000) / 1.3).toFixed(2) + ' hours';
        }
    };
    // noinspection JSMethodCanBeStatic
    ShipCostCtrl.prototype.format = function (p) {
        var nr = Math.round(p).toString(10);
        var s = '';
        var count = 0;
        for (var i = nr.length - 1; i >= 0; i--) {
            if (count > 0 && count % 3 == 0) {
                s = '\'' + s;
            }
            s = nr.charAt(i) + s;
            count += 1;
        }
        return s;
    };
    return ShipCostCtrl;
}());
angular.module('ShipCostApp', []).controller('ShipCostCtrl', ShipCostCtrl);
