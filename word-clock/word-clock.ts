declare var angular: any;

class WordClockCtrl implements ng.IOnInit {

    public clock = {
        zaeh: false,
        fuef: false,
        zwaenzg: false,
        viertu: false,
        ab: false,
        punkt: false,
        vor: false,
        haubi: false,
        saechsi: false,
        nueni: false,
        eis: false,
        zwoei: false,
        zaehni: false,
        eufi: false,
        drue: false,
        zwoeufi: false,
        sibni: false,
        achti: false,
        fuefi: false,
        vieri: false,
    };

    public $onInit(): void {
        const now = new Date();
        const mm = Math.round(now.getMinutes() / 5) * 5;
        const hh = now.getHours();

        console.log('hh =' + hh + ', mm=' + mm);

        // hour part
        const hours = ['zwoeufi', 'eis', 'zwoei', 'drue', 'vieri', 'fuefi', 'saechsi', 'sibni', 'achti', 'nueni', 'zaehni', 'eufi'];

        // min part
        if (mm == 0) {
            this.clock.punkt = true;
            this.clock[hours[hh % 12]] = true;
        } else if (mm == 5) {
            this.clock.fuef = true;
            this.clock.ab = true;
            this.clock[hours[hh % 12]] = true;
        } else if (mm == 10) {
            this.clock.zaeh = true;
            this.clock.ab = true;
            this.clock[hours[hh % 12]] = true;
        } else if (mm == 15) {
            this.clock.viertu = true;
            this.clock.ab = true;
            this.clock[hours[hh % 12]] = true;
        } else if (mm == 20) {
            this.clock.zwaenzg = true;
            this.clock.ab = true;
            this.clock[hours[hh % 12]] = true;
        } else if (mm == 25) {
            this.clock.fuef = true;
            this.clock.vor = true;
            this.clock.haubi = true;
            this.clock[hours[(hh + 1) % 12]] = true;
        } else if (mm == 30) {
            this.clock.haubi = true;
            this.clock[hours[(hh + 1) % 12]] = true;
        } else if (mm == 35) {
            this.clock.fuef = true;
            this.clock.ab = true;
            this.clock.haubi = true;
            this.clock[hours[(hh + 1) % 12]] = true;
        } else if (mm == 40) {
            this.clock.zwaenzg = true;
            this.clock.vor = true;
            this.clock[hours[(hh + 1) % 12]] = true;
        } else if (mm == 45) {
            this.clock.viertu = true;
            this.clock.vor = true;
            this.clock[hours[(hh + 1) % 12]] = true;
        } else if (mm == 50) {
            this.clock.zaeh = true;
            this.clock.vor = true;
            this.clock[hours[(hh + 1) % 12]] = true;
        } else if (mm == 55) {
            this.clock.fuef = true;
            this.clock.vor = true;
            this.clock[hours[(hh + 1) % 12]] = true;
        }
        if (mm == 60) {
            this.clock.punkt = true;
            this.clock[hours[(hh + 1) % 12]] = true;
        }

        console.log('date:', new Date());
    }
}

angular.module('WordClockApp', []).controller('WordClockCtrl', WordClockCtrl);
