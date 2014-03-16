var restify = require("restify");
var mongojs = require("mongojs");

var ip_addr = "127.0.0.1";
var port = "8080";

var server = restify.createServer({
	name : "geotrashAPI"
});

var connection_string = '127.0.0.1:27017/geotrashdb';
var db = mongojs(connection_string, ['geotrashdb']);
var trash = db.collection("trash");

server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS());

function findAllTrash(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
    trash.find().limit(20).sort({postedOn : -1} , function(err , success){
        console.log('Response success '+success);
        console.log('Response error '+err);
        if(success){
            res.send(200 , success);
            return next();
        }else{
            return next(err);
        }
 
    });
 
}
 
function findTrashNear(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
        console.log('findTrash');

    trash.find({loc: {$near: [req.query.longitude, req.query.latitude], $maxDistance: req.query.distance}}, function(err, success){

        console.log(req.query.distance);

        console.log('Response success '+success);
        console.log('Response error '+err);
        if(success){
            res.send(200 , success);
            return next();
        }
        return next(err);
    });
}
 
function postNewTrash(req , res , next){
    var newTrash = {};
    newTrash.name = req.params.name;
    newTrash.description = req.params.description;
    newTrash.loc = [req.params.longitude, req.params.latitude];
    newTrash.postedOn = new Date();
 
    res.setHeader('Access-Control-Allow-Origin','*');
 
    trash.save(newTrash , function(err , success){
        console.log('Response success '+success);
        console.log('Response error '+err);
        if(success){ 

            res.send(201 , newTrash);
            return next();
        }else{
            return next(err);
        }
    });
}
 
function deleteTrash(req , res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
    trash.remove({_id:mongojs.ObjectId(req.params.trashId)} , function(err , success){
        console.log('Response success '+success);
        console.log('Response error '+err);
        if(success){
            res.send(204);
            return next();      
        } else{
            return next(err);
        }
    })

}

var PATH = '/trash'
server.get({path : PATH +'/near', version : '0.0.1'} , findTrashNear);
server.post({path : PATH , version: '0.0.1'} ,postNewTrash);
server.del({path : PATH +'/:trashId' , version: '0.0.1'} ,deleteTrash);

server.listen(port, ip_addr, function () {
	console.log("%s listening at %s", server.name, server.url);
});
