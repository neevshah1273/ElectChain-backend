// import express from 'express';
// //import bodyParser from 'body-parser';
// import mongoose from 'mongoose';
// import cors from 'cors';
// import dotenv from 'dotenv'
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")
const express = require("express")

dotenv.config()

const app = express();

app.use(express.json({limit : "30mb", extended: true}));
app.use(express.urlencoded({limit : "30mb", extended: true}));
app.use(cors());

mongoose.connect(process.env.DB_CONNECT, {
    useNewUrlParser: true, 
    useUnifiedTopology: true
})

const db=mongoose.connection;
db.on('error', console.log.bind(console, "connection error"))
db.once('open', function(callback) {
    console.log("Database connected")
})

const userRouter = require('./routes/user_router')
app.use('/', userRouter);

const candidateRouter = require('./routes/candidate_router')
app.use('/candidate', candidateRouter)

const voteRouter = require('./routes/vote_router')
app.use('/vote', voteRouter)

app.listen(process.env.PORT, () => {
    console.log("Server listening on port 3000")
})
//mongoose.set('useFindAndModify',false);