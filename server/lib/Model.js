var EventEmitter = require('events').EventEmitter
    ,_ = require('underscore')
    , Garam = require('./Garam')

    , format = require('util').format
    , assert= require('assert');
var Type = require('./Types');
exports = module.exports = Model;

function Model (type) {
    this.conn = null;
    this.ready = false;
    this.type = type;
}


_.extend(Model.prototype, EventEmitter.prototype, {
    create : function() {

    },

    getModelName : function () {
        return this.name;
    },
    setName : function(name) {
        this.name = name;
    },
    set : function(key,name){
        this[key] = name;
    } ,
    _create : function(dbName) {
        if (typeof dbName ==='undefined') {
            dbName = 'redis';
        }
        this.schema = {properties:{},publish:true};

        var redisConnect =  Garam.getDB(dbName).connection(),self=this;
        //require.uncache('nohm');
        this.nohm= redisConnect.getNohm();
        this.namespace = redisConnect.getNamespace();
        this.nohm.namespace = this.namespace;
        redisConnect.getConnection(function(err, conn){
            self.nohm.setClient(conn);
            self.conn = conn;

            self.create();
        });




    },
    setConn : function(conn) {
        this.nohm.setClient(conn);

        this.conn = conn;
    },
    getConn : function() {
        return  this.conn;
    },
    getNamespace : function() {
        return this.namespace;
    },
    createModel : function() {
        var nohm = this.nohm;
        // nohm.setPublish(true);

        nohm.model(this.name, this.schema);
        this.ready = true;
    },
    setParameter: function (param) {
        return []
    },
    findArray : function(fieldName,arr,callback) {
        if (!_.isArray(arr)) {
            assert(0);
        }
        var self = this,list=[];
        var nohm =  this.nohm;
        _query.call(this);
        function _query() {
            var self = this;
            var qeury = {};
            if (arr.length > 0) {
                var searchValue = arr.pop();
            } else{
                callback(false,list)
                return;
            }
            var model = nohm.factory(this.name);
            qeury[fieldName] = searchValue;
            model.findAndLoad(qeury,function(err,result) {
                if (err) {
                    if (err === 'not found') {
                        list.push(0);
                    } else {
                        callback(err);
                        return;
                    }

                } else {

                    list.push(result[0]);

                }
                _query.call(self);


            });
        }
    },
    queryKeys : function(obj,callback) {
        if (!_.isObject(obj)){
            Garam.logger().error(obj);
            assert(0);
            return;
        }
        for (var i in obj) {
            if (typeof obj[i] === 'undefined') {
                assert(0,i);
                return;
            }
        }
        var nohm =  this.nohm,self=this;
        var model = nohm.factory(this.name);


        model.find(obj,function(err,rows) {

            if (err) {
                if (err === 'not found') {
                    rows = {
                        length : 0
                    }
                    callback(null,rows);
                    return;
                }

            }
            callback(err,rows);


        });
    },
    getAll : function (callback) {


        var nohm =  this.nohm,self=this,rows=[],models=[],idLIst=[];
        var model = nohm.factory(this.name);

        model.find(function (err, ids) {
            // ids = array of ids

            if (err) {
                if (err === 'not found') {
                    callback(null,[],[]);
                } else {
                    console.log('not !!!')
                    callback(err);

                }
                return;
            }

            if (ids.length > 0) {
                self._load(ids,rows,models,function () {
                    callback(null,models,rows);
                });
            } else {
                callback(null,[],[]);
            }
        });


    },
    _rankLoad : function (ids,rows,models,callback) {
        var nohm =  this.nohm,model = nohm.factory(this.name);
        load.call(this);
        var r =0;
        function load() {
            if (ids.length > 0) {
                var key = ids.pop();
            } else {
                callback();
                return;
            }
            model.load(key, function (err, properties) {
                if (err && err !=='not found') {

                    callback(err);
                    return;
                } else if(err && err =='not found') {
                    load();
                } else {
                    rows.push(properties);
                    models.push(model);
                    model.rank =++r;

                    load();
                }
            });
        }


    },
    /**
     * and 조건 단위로.group
     */
    setZrank : function () {
        var args =[];
        for (var i in arguments) {
            args.push(arguments[i]);
        }

        this.zrankArgs = args;
    },
    getZaddKey : function (params) {
        var args ='nohm:rank:'+this.name,keyNotFound =true,key;
        for(var i  in this.zrankArgs) {
            key = this.zrankArgs[i];
            if(params[key]) {
                keyNotFound =false;
                args +=':'+key+':'+params[key];
            }
        }
        if(keyNotFound) {
            assert(0,'keyNotFound');
        }

        return args;
    },
    /**
     * idx 값에 대한 랭킹 정보
     * @param params
     * @param idx
     * @param callback
     */
    getRank: function (params,idx,callback) {

        var args =this.getZaddKey(params);
        args = [args,idx];
        this.conn.zrank(args, function (err, rank) {
            callback(err,rank);
        });
    },
    /**
     * 지정된 범위 에 대한 랭킹 총정보
     * @param params
     * @param options   max, min, start : 0 , count 3
     * @param callback
     */
    getRanks :function (params,options,callback) {
        var args =this.getZaddKey(params);
        var max =options.max || '+inf';
        var min =options.min || '-inf';
        var offset =options.start;
        var count = options.count;
        var self =this;
        args = [args,max,min,'WITHSCORES','LIMIT',offset,count];
        this.conn.zrevrangebyscore(args, function (err, response) {
            if (err) {
                callback(err);
                return;
            }

            // write your code here
            var list  =[];
            for(var i =0;i < response.length; i++)  {
                if(i%2 ===0) {
                    list.push(response[i])
                }
            }
            var rows = [];
            var models =[];
            self._rankLoad(list,rows,models,function () {
                callback(null,models,rows)
            });
        });

    },
    /**
     * idx 값에 대한 데이터를 저장하고 순위를 업데이트
     * @param model
     * @param params
     * @param score
     * @param callback
     */
    updateRank :function (model,params,score,callback) {
        var args =this.getZaddKey(params);
        args =[args,score];

        this.update(model,params,function (err) {
            if(err) {
                callback(err);
                return;
            }
            args.push(model.id);

            this.conn.zadd(args,function (err,response) {
                callback(err);
            });
        }.bind(this))
    },

    /**
     * 데이터를 저장하고, 순위를 추가
     * @param params
     * @param score
     * @param callback
     */
    addRank : function (params,score,callback) {
        var args =this.getZaddKey(params);
        args =[args,score];


        this.insert(params,function (err,model) {
            if(err) {
                Garam.logger().warn('addRank insert error',params);

            }
            args.push(model.id);
            this.conn.zadd(args,function (err,response) {
                callback(err)
            });

            //console.log(model.id)``
        }.bind(this));


    },
    _load : function (ids,rows,models,callback) {
        var nohm =  this.nohm,model = nohm.factory(this.name);
        load.call(this);

        function load() {
            if (ids.length > 0) {
                var key = ids.pop();
            } else {
                callback();
                return;
            }
            model.load(key, function (err, properties) {
                if (err && err !=='not found') {

                    callback(err);
                    return;
                } else if(err && err =='not found') {
                    load();
                } else {
                    rows.push(properties);
                    models.push(model);

                    load();
                }
            });
        }


    },
    query : function(obj,userCallback) {
        if (!_.isObject(obj)){
            Garam.logger().error(obj);
            assert(0);
            return;
        }
        for (var i in obj) {
            if (typeof obj[i] === 'undefined') {
                assert(0,i);
                return;
            }
        }

        var nohm =  this.nohm,self=this;
        var model = nohm.factory(this.name);
        var rows=[],models=[];

        this.checkDbConnection(nohm, function(e) {
            if (e == 'fail') {
                userCallback(e);
                return;
            }
            model.find(obj, function (err, ids) {
                if (err) {
                    (err === 'not found') ? userCallback(null, rows) : userCallback(err);
                    return;
                }
                if (ids.length > 0) {
                    self._load(ids, rows, models, function () {
                        userCallback(null, models, rows);
                    });
                } else {
                    userCallback(null, rows);
                }
            });
        });

        // function _load(row,callback) {
        //     var key = row.pop(),childModel = nohm.factory(self.name);
        //
        //     childModel.load(key, function (err, properties) {
        //         if (err) {
        //
        //             if (row.length > 0) {
        //                 _load(row,callback);
        //             } else {
        //                 callback(rows);
        //             }
        //
        //         } else {
        //             rows.push(properties);
        //             models.push(childModel);
        //
        //             ids.push(this.allProperties().id);
        //
        //             if (row.length > 0) {
        //                 _load(row,callback);
        //             } else {
        //
        //                 callback(models,ids,rows);
        //             }
        //             // you could use this.allProperties() instead, which also gives you the 'id' property
        //         }
        //     });
        // }

        /*model.find(obj,function(err,ids) {

            if (err) {
                if (err === 'not found') {
                    userCallback(null,rows);
                } else {
                    userCallback(err);

                }
                return;
            }


            if (ids.length > 0) {
                self._load(ids,rows,models,function () {
                    userCallback(null,models,rows);
                });
            } else {
                userCallback(null,rows);
            }
            // if (err) {
            //     if (err === 'not found') {
            //         result = {
            //             length : 0
            //         }
            //         userCallback(null,result);
            //     } else {
            //         userCallback(err,result);
            //     }
            //
            //
            //     return;
            // }

            // if (result.length > 1) {
            //     _load(result, function (rs,md,ids,rows) {
            //         userCallback(null,rs,md,ids,rows);
            //     });
            // } else if(result.length ===0 ) {
            //     userCallback(null,[]);
            // } else {
            //     if (!_.isArray(result)) {
            //         Garam.logger().error(obj);
            //         assert(0);
            //         return;
            //     }
            //     model.load(result[0], function (err, properties) {
            //         if (err) {
            //             Garam.logger().warn(model.errors);
            //             userCallback(model.errors);
            //         } else {
            //
            //             var prop = this.allProperties();
            //             userCallback(null,[model],prop.id,[properties]);
            //
            //         }
            //     });
            // }

        });*/


    },
    /**
     *
     * @param event
     * @param callback
     */
    subscribe : function(event,callback) {
        var nohm = this.nohm,self=this;
        var model = nohm.factory(this.name);
        switch (event) {
            case 'create':
            case 'update':
            case 'save':
            case 'remove':
            case 'link':
            case 'unlink':
                break;
            default :
                assert(0);
                break;
        }
        model.subscribe(event, function (event) {
            // console.log('someModel with id'+event.target.id+' was updated and now looks like this:', event.target.properties);
            callback(event.target.id,event.target.properties);
        });

    },

    getModel : function(key,callback) {
        var nohm = this.nohm,self=this;

        var model = nohm.factory(this.name);
        model.load(key, function (err, properties) {
            if (err) {

                callback(err);
                return;
            }
            callback(null,model);
        });
    },
    deleteKey : function(key) {
        var db = Garam.getDB('redis');
        db.deleteKey(key);
    },
    remove : function(model,callback) {
        var nohm = this.nohm,self=this;
        if (!model) {
            model = nohm.factory(this.name);
        }
        model.remove({ // options object can be omitted
            silent: false, // whether remove event is published. defaults to false.
        }, function (err) {
            if (err) {

                console.log(err);
            }
            callback(err);
        });

    },
    update : function(model,obj,callback) {
        if (!model) {
            Garam.logger().error('Not Found Model');
            callback('Not Found Model');
            return;
        }

        if (!obj) {
            Garam.logger().error('Not Found Save Data');
            callback('Not Found Save Data');
            return;
        }
        model.p(obj);
        model.save(function(err){
            if (err === 'invalid') {
                console.log('properties were invalid: ', model.errors);

                callback(err)
            } else if (err) {

                console.log(err); // database or unknown error
                callback(err);
            } else {
                callback(null);
            }
        });
    },
    insert : function(obj,callback) {
        var nohm = this.nohm;
        var model = nohm.factory(this.name);
        model.p(obj);
        model.save(function(err){
            if (err === 'invalid') {
                console.log('properties were invalid: '+JSON.stringify(obj), model.errors);
                callback(err)
            } else if (err) {

                console.log(err); // database or unknown error
                callback(err);
            } else {
                callback(null,model);
            }
        });
    },

    /**
     *
     * @param field
     * @param type
     * @param unique
     * @param validations
     * @param index
     */
    addField : function(field,type,unique,validations,index) {
        assert(field);
        assert(type);


        this.schema.properties[field] = {};
        if (_.isObject(type)) {
            this.schema.properties[field].defaultValue = type.defaultValue;
            this.schema.properties[field].type = type.func;
        } else {
            this.schema.properties[field].type = type;
        }

        this.schema.properties[field].unique = unique ? unique : false;
        if (index) {
            this.schema.properties[field].validations = validations;
        }
        if (index) {
            this.schema.properties[field].index = index;
        }


    },
    checkDbConnection: function(nohm, callback) {
        if(nohm.client.connected && nohm.client.ready) {
            callback(null);
        } else {
            var dbNm = Garam.getDB(this.namespace);
            dbNm.db.conn.reConnect(callback);
        }
    }
});

Model.extend = Garam.extend;