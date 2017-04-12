var Backbone = require('backbone')
    , _ = require('underscore')
    , Garam = require('../../Garam')
    ,  Cluster = require('cluster')
    , Base = require('../../Base')
    , assert = require('assert')
    , fs = require('fs')
    , async = require('async');


var DBlib = function(namespace) {
    this.namespace = namespace;
    this.sql_list = {};
};
module.exports =  DBlib;
_.extend(DBlib.prototype, Base.prototype, {
    addSQL : function(sql) {
        assert(sql.dpname);

        var db =    Garam.getDB(this.namespace);

        db.addProcedure(sql.dpname,sql);
        sql.create();




    },
    create : function(model_dir) {
        var self = this;
        var namespace = this.namespace;
        this.appDir = Garam.getInstance().get('appDir');
        this._sql = {};

        if(!fs.existsSync(this.appDir + '/model')) {
            Garam.getInstance().log.info(this.appDir + '/db make db dir');
            fs.mkdirSync(this,appDir + '/model');
        }

        if(!fs.existsSync(this.appDir + '/model/' + namespace)){
            Garam.getInstance().log.info(this.appDir + '/db/' + namespace + 'make model dir');
            fs.mkdirSync(this.appDir + '/model/' + namespace);
        }

        var dir = process.cwd()+'/'+ this.appDir + '/model/'+namespace;
        var list = fs.readdirSync(dir);
        var total =list.length;

        if(total === 0){
            Garam.getInstance().log.error('Procedure Factory is empty',namespace);
            Garam.getInstance().emit('completeWork',namespace);
            Garam.getInstance().emit('databaseOnReady',namespace);
            return;
        }

        list.forEach(function (file,i) {
            (function(job) {
                var stats = fs.statSync(dir + '/'+ file);
                if (stats.isFile()) {
                    var sql = require(dir + '/'+  file);
                    var t = new sql();

                    if(!t.dpname) {
                        Garam.getInstance().log.error(dir + '/'+  file+', dbname does not exist');
                        return;
                    }
                    self.addSQL(t);
                    if (total === (job+1)) {
                        Garam.getInstance().emit('completeWork',namespace);
                        Garam.getInstance().emit('databaseOnReady',namespace);
                    }

                } else {
                    read(file,function () {
                        if (total === (job+1)) {
                            Garam.getInstance().emit('completeWork',namespace);
                            Garam.getInstance().emit('databaseOnReady',namespace);
                        }
                    });
                }
            })(i);


            // var stats = fs.statSync(dir + '/'+ file);
            // if (stats.isFile()) {
            //     var sql = require(dir + '/'+  file);
            //     var t = new sql();
            //
            //     if(!t.dpname) {
            //         Garam.getInstance().log.error(dir + '/'+  file+', dbname does not exist');
            //         return;
            //     }
            //     self.addSQL(t);
            //
            // }
            // if (total === (i+1)) {
            //
            //     Garam.getInstance().emit('completeWork',namespace);
            //     Garam.getInstance().emit('databaseOnReady',namespace);
            // }
        });


        function read(folderName,callback) {
            var subDir = dir+'/'+folderName;
            var list = fs.readdirSync(subDir);
            var total = list.length,Transaction;
            if (list.length > 0) {
                list.forEach(function (file,i) {
                    (function (job) {
                        var stats = fs.statSync(subDir + '/'+ file);
                        if (stats.isFile()) {
                            var sql = require(subDir + '/'+ file);
                            var t = new sql();

                            if(!t.dpname) {
                                Garam.getInstance().log.error(dir + '/'+  file+', dbname does not exist');
                                return;
                            }
                            self.addSQL(t);
                            if (total === (job+1)) {

                                callback();

                            }

                        } else {
                            assert(0);
                        }
                    })(i);
                });
            }
        }


    }
});


DBlib.extend = Garam.extend;