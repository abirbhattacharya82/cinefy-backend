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
            const name = req.query.name;
            const src = req.query.src;
            const obj = {
                "_id": {
                    "movie_id": src + "_________id"
                },
                "name": name,
                "src": src
            }
            try {
                const result = await moviesCollection.insertOne(obj);
                console.log(result);
                res.status(200).send({ "message": "success" })
            } catch (error) {
                console.error(error);
                res.status(404).send({ "message": "movie already exists" });
            }
        })

        app.get('/movies', async (req, res) => {
            try {
                const cursor = await moviesCollection.find();
                const movies = await cursor.toArray();
                res.status(200).send({ "message": "successs", "movies": movies });
            } catch (error) {
                console.error(error);
                res.status(404).send({ "message": "Error retrieving movies from database." });
            }
        });
    });

MongoClient.connect(mongoURI, { useUnifiedTopology: true })
    .then(client => {
        const db = client.db('cinefy');
        const userCollections = db.collection('users');

        app.post('/register', async (req, res) => {
            const username = req.query.username;
            const password = req.query.password;
            const obj = {
                "_id": {
                    "username": username
                },
                "password": password
            }
            try {
                const result = await userCollections.insertOne(obj);
                console.log(result);
                res.status(200).send({ "message": "success" })
            } catch (error) {
                console.error(error);
                res.status(404).send({ "message": "username already exists" });
            }
        });
    }
    )