
var _ = require('underscore')
    , fs = require('fs')
    ,Base =require('../../server/lib/Base')
    , Garam = require('../../server/lib/Garam')
    , request = require('request')
    , moment = require('moment')
    , winston = require('winston')
    , UserBase = require('./UserBase')
    , assert= require('assert');


exports = module.exports = FileUpload;

function FileUpload () {
    Base.prototype.constructor.apply(this,arguments);

    this.uuid = '';


};

function getExtension(filename) {
    var i = filename.lastIndexOf('.');
    return (i < 0) ? '' : filename.substr(i);
}

_.extend(FileUpload.prototype,{
        create: function (req) {
            var uuid = req.param('uuid'),self=this;
            this.uuid = uuid;
            //this.fileStream
            this.setParts(req);
        },
        addData : function(req,callback) {

            var self = this;
            req.on('data',function(chunk) {
                    self.addChunk(chunk);
                }
            );

            req.on('end',function(){
                var total = 0,headerBuff = 21+ 4,
                    currentPart = self.parts,
                    data = Buffer.concat(currentPart.chunk, currentPart.bytelength),
                    type = data.readUInt8(0),
                    currentPacketSize = data.readUInt32BE(1),
                    partNum = data.readUInt32BE(5),
                    parttotal = data.readUInt32BE(9),
                    totalSize = data.readDoubleBE(13),
                    folder = 'tmp',
                    userOptionsSize = data.readUInt32BE(21),
                    thumbnail_landscape = 0,
                    thumbnail_portrait = 0,
                    thumbnail_use = 0,
                    thumbnails = [],
                    userOptions = {},
                    userOptionsBuffer;




                userOptionsBuffer = data.slice(headerBuff, headerBuff+userOptionsSize);
                userOptions = JSON.parse(userOptionsBuffer.toString());

                thumbnail_landscape = userOptions.thumbnail_landscape ?userOptions.thumbnail_landscape : 0;
                thumbnail_portrait = userOptions.thumbnail_portrait ?userOptions.thumbnail_portrait : 0;
                thumbnail_use = userOptions.thumbnail_use ?userOptions.thumbnail_use : 0;
                thumbnails = userOptions.thumbnails ? userOptions.thumbnails : [];
                folder = userOptions.folder ? userOptions.folder : 'tmp';

                var filename = uuid;


                currentPart.totalSize = totalSize;
                var filePartBuffer = new Buffer(currentPacketSize);
                data.copy(filePartBuffer,0, headerBuff+userOptionsSize, data.length);

                if (currentPacketSize !== filePartBuffer.length) {
                    console.log('error');
                } else {


                    var file = {};

                    file.fileName = self.uuid;
                    file.path = process.cwd()+'/file/';
                    file.folder =folder;

                    file.extension = self.checkExtension(self.parts.realName);
                    file.realName = self.parts.realName;
                    file.thumbnail_use = thumbnail_use;
                    file.thumbnail_portrait = thumbnail_portrait;
                    file.thumbnail_landscape = thumbnail_landscape;
                    file.thumbnails = thumbnails;


                    self.fileStream.write(filePartBuffer,null,function() {
                        file.buffer = filePartBuffer;
                        if (partNum === parttotal) {
                            self.fileStream.end();
                            callback('end');



                           // self.renderToJson(res,file);
                        } else {
                            callback(200);
                        }

                    })
                }


            });
        },

    adddthumbnail : function(file,callback) {
        var bucket = this.getBucket(),self=this;
        var list = [];
        var extension = getExtension(file.realName); //.split('.')[1];

        file.extension = extension;
        file.thumbData = [];
        var sourceFile = file.path+file.fileName;

        if (file.thumbnail_use) {

            assert(file.thumbnails);
            _.each(file.thumbnails,function(thumbnail){
                assert(thumbnail.thumbnail_fileName);
                var thumb = {
                    thumbnail : file.fileName +"_" +thumbnail.thumbnail_fileName,
                    sourceFile : sourceFile,
                    landscape : thumbnail.thumbnail_landscape,
                    portrait : thumbnail.thumbnail_portrait,
                    extension : extension,
                    path : file.path,
                    folder : file.folder

                }

                thumb.thumbnailFile = file.path+thumb.thumbnail;
                list.push(thumb);
            });

            __createThumb();
            function __createThumb() {
                if (list.length > 0) {
                    var options = list.pop();
                    easyimg.rescrop({
                        src:options.sourceFile, dst:options.thumbnailFile,
                        width:options.landscape, height:options.portrait,
                        x:0, y:0,
                        fill : false
                    }).then(
                        function(image) {

                            bucket.thumbnail(options,function(err,data){

                                data.thumb_etag = data.ETag;

                                file.thumbData.push(data);
                                __createThumb();
                                // dataPut(err,data);
                            });
                        },
                        function (err) {
                            if (err) {

                                callback({error:-300});
                                return;
                            }
                        }
                    );
                } else {
                    self.upload(file,callback);
                }
            }

        }else {
            dataPut();
        }

        function dataPut(err,thumb_data) {
            if (err) {
                callback({error:-301});
                return;
            }
            bucket.create(file,function(err,data){
                if (err) {
                    callback({error:-301});
                    return;
                }
                if (thumb_data) {
                    _.extend(data,thumb_data);
                }
                data.error = 0;

                callback(data);
            });
        }
    },
        checkExtension : function(filename) {
            var i = filename.lastIndexOf('.');
            return (i < 0) ? '' : filename.substr(i);
        },
        setParts : function(req) {
            this.parts = {
                chunk : [],
                realName : req.param('filename'),
                folder : req.param('folder'),
                totalSize : 0,
                bytelength : 0
            }

            var path = './file/'+this.uuid;

            this.fileStream = fs.createWriteStream(path);
            //
            //setTimeout(function(){
            //    if (globelpart[uuid]) {
            //        globelpart[uuid].ws.end();
            //        delete globelpart[uuid];
            //        console.log('delete image')
            //    }
            //},1000*3600);
        },
        addChunk : function(chunk) {
            this.parts.chunk.push(chunk);

            this.parts.bytelength += this.parts.chunk.length;
        }




    }
);


FileUpload.extend = Garam.extend;
