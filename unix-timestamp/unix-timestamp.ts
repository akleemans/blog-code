declare var angular: any;

class UnixTimestampCtrl implements ng.IOnInit {

    private static $inject = ['$http', '$scope'];
    private API_URL: string = 'https://www.ietf.org/timezones/data/leap-seconds.list'; //'https://hpiers.obspm.fr/iers/bul/bulc/Leap_Second.dat';
    public unixTimestamp: number = 0;
    public secondsSinceEpoch: number = 0;
    public diffSeconds: number = 0;
    public currentTime;

    public constructor(
        private readonly $http: ng.IHttpService,
        private readonly $scope: ng.IScope
    ) {
    }

    public $onInit(): void {
        this.getLeapSecondData().then(response => {
            const rawData: string = response.data as string;
            let lastLine;
            for (let line of rawData.trim().split('\n')) {
                if (line.substr(0, 1) !== '#') {
                    lastLine = line;
                }
            }
            if (lastLine.length > 0) {
                const part = lastLine.split('#')[0].trim();
                console.log('part:', part);
                this.diffSeconds = +part.substring(part.length - 2, part.length) - 10;
            }
            console.log('diffSeconds:', this.diffSeconds);
            this.$scope.$apply();
        });

        setInterval(() => {
            const now = new Date();
            this.currentTime = now.toUTCString();
            this.unixTimestamp = Math.floor(now.getTime() / 1000);

            if (this.diffSeconds !== 0) {
                this.secondsSinceEpoch = this.unixTimestamp + this.diffSeconds;
            }
            this.$scope.$apply();
        }, 200);
    }

    private async getLeapSecondData() {
        return this.$http.get(this.API_URL);
    }
}

angular.module('UnixTimestampApp', []).controller('UnixTimestampCtrl', UnixTimestampCtrl);
