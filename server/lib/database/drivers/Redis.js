var _ = require('underscore')
    , Redis = sql = require('redis')
    , Garam = require('../../Garam')
    , DB_driver = require('../DB_driver')

    , format = require('util').format
    , assert= require('assert');



//1
module.exports  = DB_driver.extend({
    conn :null,
    close : function() {
        var conn = this.conn.isConn();
        if (conn) {
            this.conn.close();
        }
    },
    connection : function(spo_callback) {
        var self = this,conn,config;

        return  (function() {

            this.conn = (function() {
                var conn = null,config;
                var nohm = require('nohm').Nohm;
                config = {
                    server     : self.get('hostname'),
                    user     : self.get('username'),
                    password : self.get('password'),
                    database : self.get('database'),
                    port : self.get('port'),
                    //connectTimeout : 100,
                    //SyncTimeout :100,

                };


                /*
                 configOptions.ClientName = "SafeRedisConnection";
                 configOptions.ConnectTimeout = 100000;
                 configOptions.SyncTimeout = 100000;
                 configOptions.AbortOnConnectFail = false;
                 */

                if (self.get('pool')) {
                    config.pool = self.get('pool');
                }


                function _connection(callback) {
                    if (!conn) {
                        conn = Redis.createClient(self.get('port'),self.get('hostname'),{});
                        if(self.get('auth')) {
                            conn.auth(self.get('auth'));
                        }

                        conn.on("connect", function() {
                            conn.select(self.get('database'), function(){
                                nohm.setClient(conn);
                                var secondClient = require('redis').createClient(self.get('port'),self.get('hostname'),{});
                                if(self.get('auth')) {
                                    secondClient.auth(self.get('auth'));
                                }

                                secondClient.select(self.get('database'),function(){

                                    nohm.setPubSubClient(secondClient, function (err) {
                                        if (err) {
                                            console.log('Error while initializing the second redis client');
                                        } else {
                                            if (typeof callback === 'function') {
                                                callback();
                                            }

                                        }
                                    });

                                });



                            });

                        });
                        conn.on('ready',function(){
                            //    console.log('on')
                        });
                        conn.on('error',function(e){

                            Garam.getInstance().reConnectDB('redis',self.get('namespace'));
                            Garam.logger().error(e.stack) ;
                        });

                        conn.on('end',function(e){
                            Garam.logger().warn('end redis ',self.get('namespace'));
                        });




                    }
                }
                _connection(spo_callback);

                return {

                    isConn : function() {
                        return conn ? true : false;
                    },
                    close : function() {
                        //conn.close();
                        //delete conn;
                        conn.end(false);
                        conn = null;
                    },
                    getConnection : function(callback) {
                        if (!conn) {
                            _connection(function(){
                                callback(false,conn);
                            });
                        } else {
                            callback(false,conn);
                        }

                    },
                    getNamespace : function() {
                        return self.get('namespace');
                    },
                    getNohm : function() {
                        return nohm;
                    },
                    reConnect: function (callback) {
                        if (conn && conn.closing) {
                            this.close();
                            _connection(function () {
                                callback(null);
                            });
                        } else {
                            callback('fail')
                        }
                    }
                }
            })();





        }).call(this);


    },
    getAllOptions : function() {
        return    {
            server     : this.get('hostname'),
            user     : this.get('username'),
            password : this.get('password'),
            database : this.get('database'),
            port : this.get('port')
        };
    },
    /**
     * ���߿� conn �� ������ �� �� �ִ�.
     * @param procedure
     * @param InputParams
     * @param callback
     */
    execute1 : function(procedure,InputParams,outputParams,callback) {

        this.conn.request(procedure,InputParams,outputParams,callback);
    },
    execute : function(procedure,InputParams) {
        callback('execute is not supported ');
    },
    
    hset : function(hashKey,hash,value, callback) {
        assert(hash);
        var Queries;
        if (_.isArray(hashKey)) {
            callback = arguments[1];
        } else {
            if (callback === undefined) {
                assert(0);
            }
        }


        this.conn.getConnection(function(err,connection) {
            if(err)  {
                Garam.getInstance().log.warn(err);
            }
            if (_.isArray(hashKey)) {
                connection.hset(hashKey, Redis.print);
            } else {
                connection.hset(hashKey,hash, value, Redis.print);
            }


        });
    },
    hkeys : function(hashkeys,callback) {
        assert(hashkeys);

        if (callback === undefined) {
            assert(0);
        }
        this.conn.getConnection(function(err,connection) {
            if(err)  {
                Garam.getInstance().log.warn(err);
            }

            connection.hkeys(hashkeys,  function(err,replies){
                console.log(replies.length + " replies:");
                replies.forEach(function (reply, i) {
                    console.log("    " + i + ": " + reply);
                });
            });

        });
    },
    mset : function(fields,callback) {
        if(!_.isArray(fields)) {
            var args = Array.prototype.slice.call(arguments),data=[];
            for (var i in args) {
                if (!_.isFunction(args[i])) {
                    data.push(args[i]);
                } else {
                    callback = args[i];
                }
            }
            fields = data;
        }


        this.conn.getConnection(function(err,connection) {
            if(err)  {
                Garam.getInstance().log.warn(err);
            }


            connection.mset(fields,function(err,res){
                callback(err,res);
            });
        });
    },
    hmset : function() {
        var args = Array.prototype.slice.call(arguments),data=[],callback;
        for (var i in args) {
            if (!_.isFunction(args[i])) {
                if (_.isObject(args[i])) {
                    for(var j in args[i]) {
                        data.push(j);
                        data.push(args[i][j]);
                    }
                } else {
                    data.push(args[i]);
                }

            } else {
                callback = args[i];
            }
        }
        this.conn.getConnection(function(err,connection) {
            if(err)  {
                Garam.getInstance().log.warn(err);
            }


            connection.hmset(data,function(err,res){
                if(err)  {
                    Garam.getInstance().log.warn(err);
                }
                callback(err,res);
            });
        });
    },
    hgetAll : function(key,callback) {
        this.conn.getConnection(function(err,connection) {
            if(err)  {
                Garam.getInstance().log.warn(err);
            }


            connection.hgetall(key,function(err,res){
                if(err)  {
                    Garam.getInstance().log.warn(err);
                }
                callback(err,res);
            });
        });
    },
    hmsetObj : function(key,obj,callback) {
        assert(key);
        if(!_.isObject(obj)) {
            assert(0);
        }
        this.conn.getConnection(function(err,connection) {
            if(err)  {
                Garam.getInstance().log.warn(err);
            }


            connection.HMSET(key,obj,function(err,res){
                callback(err,res);
            });
        });
    },
    deleteHm: function(hash,key,callback) {
        this.conn.getConnection(function(err,connection) {
            if(err)  {
                Garam.getInstance().log.warn(err);
            }


            connection.HDEL(hash,key,function(err,res){
                console.log(err)
                callback(err,res);
            });
        });
    },
    getQeury : function(key,callback) {

       this.conn.getConnection(function(err,connection) {
           if(err)  {
               Garam.getInstance().log.warn(err);
           }

           connection.get(key,function(err,res){
               callback(err,res);
           });
       });
    },
    set : function(key,value,callback) {
        assert(key);
        assert(value);

        this.conn.getConnection(function(err,connection) {
            if(err)  {
                Garam.getInstance().log.warn(err);
            }


            connection.set(key,value,function(err,res){
                callback(err,res);
            });
        });
    },
    query : function() {
        var args= [].slice.call(arguments);
        var userCallback = args.pop();
        if (typeof userCallback !== 'function') {
            assert(0);
        }
        var func = args.shift();
        var callback = function(err,res) {
            userCallback(err,res);
        }
        args.push(callback);
        this[func].apply(this,args);
    }



});

