const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const formidable = require('formidable');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const sockets = require('./sockets.js');
const server = require('./listen.js');
const builder = require('./mongodb/BuildScripts');
const deleter = require('./mongodb/removescripts');
const fetcher = require('./mongodb/viewscripts');
const bodyParser = require('body-parser')
const PORT = 3000;
app.use(cors());
app.use(bodyParser.json());
//image upload part
app.use(express.static(path.join(__dirname , '../chat/dist/chat')));

app.use('/images', express.static(path.join(__dirname, './userimages')));
require('./routes/uploads.js')(app, formidable);

sockets.connect(io, PORT);

server.listen(http, PORT);
// load mongo into jsons 
app.get('/',function(req,res){
    res.sendFile(path.join(__dirname , '../chat/dist/chat/index.html'));
});

app.get('/build',function(req,res){
    builder.build();
});

app.get('/delete',function(req,res){
    deleter.remove();
});

app.get('/view',function(req,res){
    fetcher.find();
});

