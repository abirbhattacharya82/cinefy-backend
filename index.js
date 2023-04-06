const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 8000;
require('dotenv').config();

const mongoURI = process.env.url;
const MongoClient = require('mongodb').MongoClient;
const jwt = require('jsonwebtoken');

MongoClient.connect(mongoURI, { useUnifiedTopology: true })
    .then(client => {
        const db = client.db('cinefy');
        const moviesCollection = db.collection('movies');
        const userCollection = db.collection('users');

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

        app.post('/register', async (req, res) => {
            const username = req.query.username;
            const password = req.query.password;
            const obj = {
                "_id": {
                    "username": username
                },
                "password": password,
                "watchlist": []
            }
            try {
                const result = await userCollection.insertOne(obj);
                res.status(200).send({ "message": "success" })
            } catch (error) {
                console.error(error);
                res.status(404).send({ "message": "username already exists" });
            }
        });

        app.get('/login', async (req, res) => {
            const username = req.query.username;
            const password = req.query.password;
            const obj = {
                "_id": {
                    "username": username
                },
                "password": password
            }
            try {
                const user = await userCollection.findOne(obj);
                const secret = process.env.secret;
                const payload = { userID: user._id.username };
                const option = { expiresIn: '1h' };
                const tokenG = jwt.sign(payload, secret, option);
                res.status(200).send({ "message": "successs", "username": user._id.username, "token": tokenG });
            } catch (error) {
                res.status(404).send({ "message": "Invalid Credentials" });
            }
        });

        app.get('/userData', async (req, res) => {
            const token=req.query.token;
            const secret = process.env.secret;
            try{
                const user=jwt.verify(token,secret,(err,response)=>{
                    if(err){
                        return 404;
                    }
                    else{
                        return 200;
                    }
                });
                if(user==404){
                    res.status(404).send({"message":"Token Expired"});
                }
                else{
                    res.status(200).send({"message":"Token Valid"});
                }
            }catch(e){
                res.status(404).send({"message":"Token Expired"});
            }
        })

        app.post('/addToWatchList', async (req, res) => {
            const token = req.query.token;
            const movie_id = req.query.movie_id;
            try {
                const result = await userCollection.updateOne({ "token": token }, { $push: { watchlist: movie_id } });
                if (result.modifiedCount == 1) {
                    res.status(200).send({ "message": "successfully added to watchlist" });
                }
                else {
                    res.status(404).send({ "message": "Error Occured" });
                }
            }
            catch (err) {
                res.status(404).send({ "message": "Error Occured" });
            }
        });

        app.get('/fetchWatchlist', async (req, res) => {
            const token = req.query.token;
            try {
                const cursor = await userCollection.findOne({ "token": token });
                res.status(200).send({ "watchlist": cursor.watchlist });
            }
            catch (err) {
                console.log(err);
                res.status(404).send({ "message": "Error in Fetching" });
            }
        });

        app.listen(port);
    });