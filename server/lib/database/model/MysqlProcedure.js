var EventEmitter = require('events').EventEmitter
    ,_ = require('underscore')
    , Garam = require('../../Garam')
    , Backbone = require('backbone')
    , Mssql  = require('mssql')
    , format = require('util').format
    , assert= require('assert');

exports = module.exports = DB_SQL;




function DB_SQL () {
    this._query = '';
    this._ready = false;
    this._stream = false;
    this._input = {};
    this._output = {};
    this._model =  new Backbone.Collection();
    this._dataType = {
        'int':0,
        'bigint':null,
        'money':null,
        'numeric':null,
        'smallint':null,
        'smallmoney':null,
        'real':null,
        'tinyint':null,
        'char':null,
        'nchar':null,
        'text':null,
        'varchar':null,
        'nvarchar':null,
        'xml':null,
        'time':null,
        'date':null,
        'dateTime':null,
        'dateTime2':null,
        'dateTimeOffset':null,
        'smallDateTime':null,
        'uniqueIdentifier':null,
        'binary':null,
        'varBinary':null,
        'image':null,
        'UDT':null,
        'geography':null,
        'geometry':null,
    }
}


_.extend(DB_SQL.prototype, EventEmitter.prototype, {
    create : function() {},
    run : function() {

    },
    set : function(key,name){
        this[key] = name;
    } ,
    isReady: function() {
        return this._ready;
    },
    setReady : function() {
        this._ready = true;
    },
    setStream : function(stream) {
        this._stream = true;
    },
    isStream : function() {
        return this._stream;
    },
    addField : function(field) {
        assert(field.name);
        assert(field.type);
        assert(typeof field.defaultVal  ==='undefined' ? 0 : true);
        this._input[field.name] = field;
    },
    addOutput : function(output) {

        assert(output.name);
        assert(output.type);

        this._output[output.name] = output;
    },
    setDP : function(dp) {
        this._dp = dp;
    },
    /**
     * 기본 테이블을 저장한다.
     */
    setTableName : function (table) {
        this._table = table;
    },
    setQuery : function(query) {
        this._query = query;
    },
    getQuery : function() {
        return this._query;
    },
    getProcedure : function() {
        return this._dp;
    },
    setParameter : function(data) {
        this.setData = false;
    },
    getDefaultParam : function () {

    },
    addParam : function (data) {
        if (typeof data === 'undefined') {
            data = {};
        }
        var packet = this.getPacket();

        for(var i in packet) {

            if (data[i] || data[i] === false) {
                packet[i] = data[i];
            }

        }
        if (typeof packet.pid ==='undefined') {
            packet.pid = this.pid;
        }
        return packet;
    },
    addData : function(data) {
       // console.log(data)
        var self = this;
        if (_.isArray(data)) {
            _.each(data,function(row){

                self._model.add(row);
            });
        }
       // this._model.add({});
    },
    getModel : function() {
        return this._model;
    },
    getConnection : function (mode) {
        var self = this;
        return new Promise(function(resolved,rejected){
            Garam.getDB(self.namespace).connection().getConnection(function(err,conn) {
                if (err) {
                    Garam.logger().error('database  ',self.namespace,err);
                    return rejected(err);

                }



                return resolved(conn);

            },mode);
        });

    },
    execute : function(query,parmas,mode,debug) {

        var self = this;
        return new Promise(function(resolved,rejected){
            if (!_.isArray(parmas)) {
                return rejected('invalid array type');
            }
            self.getConnection(mode)
                .then(function(connection){
                   var q = connection.query(query, parmas, function (error, results, fields) {
                        connection.release();
                        if(error) {
                            Garam.logger().error(query);
                            Garam.logger().error(q.sql);
                            Garam.logger().error('db ',self.namespace,'error:',query);
                            return rejected(error);
                        }

                        resolved(results)

                    });

                    if(debug) console.log(q.sql);
                })
                .catch(function(err){
                    Garam.logger().error('db error',self.namespace,query);
                    rejected(err);
                })

        });



    }


});

DB_SQL.extend = Garam.extend;