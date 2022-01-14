declare var angular: any;

interface Balance {
    short: string;
    name: string;
    balance: number;
    origRate: number;
}

class CryptoValueCtrl implements ng.IOnInit {

    private static $inject = ['$http', '$scope'];
    private API_URL: string = 'https://min-api.cryptocompare.com/data/price?fsym=EUR&tsyms=GNT,SNT,EUR,BTC,BCH,ETH,XRP,ZEC,XMR,MLN,XLM,LTC,ICN,GNO,ETC,EOS,REP';
    private currencies = null;

    public balances: Balance[] = [
        {short: 'GNT', name: 'Golem', balance: 0.0, origRate: 0.617},
        {short: 'SNT', name: 'Status', balance: 0.0, origRate: 0.111},
        {short: 'ZEC', name: 'Zcash', balance: 0.0, origRate: 255.8199},
        {short: 'XRP', name: 'Ripple', balance: 613.52955, origRate: 1.08},
        {short: 'XMR', name: 'Monero', balance: 0.0, origRate: 202.1836},
        {short: 'MLN', name: 'Melon', balance: 0.0, origRate: 60.5327},
        {short: 'XLM', name: 'Lumen', balance: 0.0, origRate: 0.1029},
        {short: 'LTC', name: 'Litecoin', balance: 0.0, origRate: 288.0},
        {short: 'ICN', name: 'Iconomi', balance: 0.0, origRate: 1.1627},
        {short: 'GNO', name: 'Gnosis', balance: 0.0, origRate: 90.4159},
        {short: 'EUR', name: 'Euro', balance: 0.0, origRate: 1.0},
        {short: 'ETC', name: 'Ether Classic', balance: 0.0, origRate: 21.7817},
        {short: 'ETH', name: 'Ether', balance: 0.0, origRate: 375.0938},
        {short: 'EOS', name: 'EOS', balance: 0.0, origRate: 3.1797},
        {short: 'REP', name: 'Augur', balance: 0.0, origRate: 24.3902},
        {short: 'BTC', name: 'Bitcoin', balance: 0.0, origRate: 12985.3266},
        {short: 'BCH', name: 'Bitcoin Cash', balance: 0.0, origRate: 1091.9415},
    ];

    public constructor(
        private readonly $http: ng.IHttpService,
        private readonly $scope: ng.IScope
    ) {
    }

    public $onInit(): void {
        this.getCrypto().then(request => {
            this.currencies = request.data;
            console.log('Got currencies:', this.currencies);
            this.$scope.$apply();
        });
    }

    public getTotal(): number {
        let total = 0.0;
        if (this.currencies) {
            this.balances.forEach(item => {
                total += this.getValue(item);
            });
        }
        return total;
    }

    public getDifference(balance: Balance): number {
        if (this.currencies) {
            const currentRate = 1.0 / this.currencies[balance.short];
            return this.round(currentRate / balance.origRate * 100.0 - 100.0);
        } else {
            return 0.0;
        }
    }

    public getValue(balance: Balance): number {
        let value = 0.0;
        if (this.currencies) {
            value = balance.balance * this.getRate(balance.short);
        }
        return value;
    }

    public getRate(short: string): number {
        let rate = 1.0;
        if (this.currencies) {
            rate = 1.0 / this.currencies[short];
        }
        return rate;
    }

    private round(value: number): number {
        return Math.round(value * 100) / 100;
    }

    private async getCrypto() {
        return this.$http.get(this.API_URL);
    }
}

angular.module('CryptoValueApp', []).controller('CryptoValueCtrl', CryptoValueCtrl);
