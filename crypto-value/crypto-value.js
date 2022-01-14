var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var CryptoValueCtrl = /** @class */ (function () {
    function CryptoValueCtrl($http, $scope) {
        this.$http = $http;
        this.$scope = $scope;
        this.API_URL = 'https://min-api.cryptocompare.com/data/price?fsym=EUR&tsyms=GNT,SNT,EUR,BTC,BCH,ETH,XRP,ZEC,XMR,MLN,XLM,LTC,ICN,GNO,ETC,EOS,REP';
        this.currencies = null;
        this.balances = [
            { short: 'GNT', name: 'Golem', balance: 0.0, origRate: 0.617 },
            { short: 'SNT', name: 'Status', balance: 0.0, origRate: 0.111 },
            { short: 'ZEC', name: 'Zcash', balance: 0.0, origRate: 255.8199 },
            { short: 'XRP', name: 'Ripple', balance: 613.52955, origRate: 1.08 },
            { short: 'XMR', name: 'Monero', balance: 0.0, origRate: 202.1836 },
            { short: 'MLN', name: 'Melon', balance: 0.0, origRate: 60.5327 },
            { short: 'XLM', name: 'Lumen', balance: 0.0, origRate: 0.1029 },
            { short: 'LTC', name: 'Litecoin', balance: 0.0, origRate: 288.0 },
            { short: 'ICN', name: 'Iconomi', balance: 0.0, origRate: 1.1627 },
            { short: 'GNO', name: 'Gnosis', balance: 0.0, origRate: 90.4159 },
            { short: 'EUR', name: 'Euro', balance: 0.0, origRate: 1.0 },
            { short: 'ETC', name: 'Ether Classic', balance: 0.0, origRate: 21.7817 },
            { short: 'ETH', name: 'Ether', balance: 0.0, origRate: 375.0938 },
            { short: 'EOS', name: 'EOS', balance: 0.0, origRate: 3.1797 },
            { short: 'REP', name: 'Augur', balance: 0.0, origRate: 24.3902 },
            { short: 'BTC', name: 'Bitcoin', balance: 0.0, origRate: 12985.3266 },
            { short: 'BCH', name: 'Bitcoin Cash', balance: 0.0, origRate: 1091.9415 },
        ];
    }
    CryptoValueCtrl.prototype.$onInit = function () {
        var _this = this;
        this.getCrypto().then(function (request) {
            _this.currencies = request.data;
            console.log('Got currencies:', _this.currencies);
            _this.$scope.$apply();
        });
    };
    CryptoValueCtrl.prototype.getTotal = function () {
        var _this = this;
        var total = 0.0;
        if (this.currencies) {
            this.balances.forEach(function (item) {
                total += _this.getValue(item);
            });
        }
        return total;
    };
    CryptoValueCtrl.prototype.getDifference = function (balance) {
        if (this.currencies) {
            var currentRate = 1.0 / this.currencies[balance.short];
            return this.round(currentRate / balance.origRate * 100.0 - 100.0);
        }
        else {
            return 0.0;
        }
    };
    CryptoValueCtrl.prototype.getValue = function (balance) {
        var value = 0.0;
        if (this.currencies) {
            value = balance.balance * this.getRate(balance.short);
        }
        return value;
    };
    CryptoValueCtrl.prototype.getRate = function (short) {
        var rate = 1.0;
        if (this.currencies) {
            console.log('curr. do exist!');
            rate = 1.0 / this.currencies[short];
        }
        console.log('getting rate for', short, ':', rate);
        return rate;
    };
    CryptoValueCtrl.prototype.round = function (value) {
        return Math.round(value * 100) / 100;
    };
    CryptoValueCtrl.prototype.getCrypto = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.$http.get(this.API_URL)];
            });
        });
    };
    CryptoValueCtrl.$inject = ['$http', '$scope'];
    return CryptoValueCtrl;
}());
angular.module('CryptoValueApp', []).controller('CryptoValueCtrl', CryptoValueCtrl);
