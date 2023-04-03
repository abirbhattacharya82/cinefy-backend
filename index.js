const express = require('express');
const port = process.env.PORT || 8000;
const app = express();
require('dotenv').config();
const connectionURL = process.env.url;
const MongoClient = require('mongodb').MongoClient;
app.get('/', (req, res) => {
    res.send("Its working");
})

app.get('/login', (req, res) => {
    const username = req.query.username;
    const password = req.query.password;
    const url=connectionURL;
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db('W3Dev');
        var myobj = { _id: { username: username }, password: password };
        dbo.collection('Todo-app').findOne(myobj, function (err, result) {
            if (err) {
                res.send([
                    {
                        status: 404,
                        message: 'User not found'
                    }
                ]);
                db.close();
            }
            else if (result == null) {
                res.send([
                    {
                        status: 404,
                        message: 'User not found'
                    }
                ]);
                db.close();
            }
            else {
                res.send([
                    {
                        status: 200,
                        message: 'User found'
                    }
                ]);
                db.close();
            }
        });
    });
});

app.listen(port);