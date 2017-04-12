/**
 * Created by megan on 2016-02-24.
 */

var BaseProcedure = require('../../../server/lib/database/model/BaseProcedure');

var DP = BaseProcedure.extend({
    dpname: 'xx_UserGameInfoInsert',
    create: function(){
        this.setDP('xx_UserGameInfoInsert');

        this.addInput({name:'accountSerial', type:'bigint'});
        this.addInput({name:'favorTeamIndex', type:'tinyint'});
        this.addInput({name:'teamNm', type:'nvarchar', length: 50})
    },
    setParameter: function(userModel, params){
        return [
            {
                name: 'accountSerial',
                value: userModel.accountSerial
            },
            {
                name: 'favorTeamIndex',
                value: params.favorTeamIndex
            },
            {
                name: 'teamNm',
                value: params.teamNm
            }
        ];
    },
    get: function(err, rows){
        if(!err){
            return rows[0];
        }
    }
});

module.exports = DP;