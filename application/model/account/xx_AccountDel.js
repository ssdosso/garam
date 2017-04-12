/**
 * 샘플입니다.
 * @type {{getInstance: Function}}
 */
var BaseProcedure = require('../../../server/lib/database/model/BaseProcedure');


var DP = BaseProcedure.extend({
    dpname: 'xx_AccountDel',
    create: function () {
        this.setDP('xx_AccountDel');
        this.addInput({name: 'accountSerial', type: 'bigint'});

    },
    setParameter: function (id) {
        return [
            {
                name: 'accountSerial',
                value:id
            }

        ];
    }
});

module.exports = DP;