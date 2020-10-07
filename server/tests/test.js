var app = require('../server');
var http = require('http');
let chai = require('chai');
let chaiHttp = require('chai-http');

var assert = require('assert');
describe('server tests', function(){
    before(function() {console.log("before test");});

    after(function() {console.log("after test");});

    describe('/', ()=>{
        it('it should return the application and run', (done) => {
            chai.request(app)
            .get('/')
            .end((err, res)=>{
                res.should.have.status(200);
                done();
            })
            
        })
    })

    describe('/api/upload', ()=>{
        it('it should insert a photo into the userimage folder', (done) => {
            chai.request(app).post('/api/upload').type('form')
            .send({})
        })
    })
})