const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 8000;
require('dotenv').config();
app.listen(port);
const mongoURI = process.env.url;
const MongoClient = require('mongodb').MongoClient;

MongoClient.connect(mongoURI, { useUnifiedTopology: true })
    .then(client => {
        const db = client.db('cinefy');
        const moviesCollection = db.collection('movies');
        app.post('/insert_movie', async (req, res) => {
            const name=req.query.name;
            const src=req.query.src;
            const obj={
                "_id":{
                    "movie_id":src+"_________id"
                },
                "name":name,
                "src":src
            }
            try {
                const result = await moviesCollection.insertOne(obj);
                console.log(result);
                res.status(200).send({"message":"success"})
            } catch (error) {
                console.error(error);
                res.status(500).send({"message":"movie already exists"});
            }
        })
    });