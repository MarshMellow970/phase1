const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const sockets = require('./sockets.js');
const server = require('./listen.js');
const builder = require('./mongodb/BuildScripts');
const deleter = require('./mongodb/removescripts');
const fetcher = require('./mongodb/viewscripts');

const PORT = 3000;

app.use(cors());

sockets.connect(io, PORT);

server.listen(http, PORT);


app.get('/build',function(req,res){
    builder.build();
});

app.get('/delete',function(req,res){
    deleter.remove();
});

app.get('/view',function(req,res){
    fetcher.find();
});

