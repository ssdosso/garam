
var BaseProcedure = require('../../../server/lib/database/model/MysqlProcedure.js');


var DP = BaseProcedure.extend({
    dpname: 'testQuery',
    create: function () {
        this.setTableName('testQuery');
        this.addField({name: 'id', type: 'int' ,defaultVal:0}); //입력해야할. 파라메터
        this.addField({name: 'test', type: 'text',defaultVal:'test'});


    },

    testQuery : function () {
        var params = [1];
      
        this.execute("SELECT * FROM testtabel",params,function (err,rows,fields) {
           for (var i in rows) {
               console.log(rows[i].id)
           }

          
        });
    }
});

module.exports = DP;