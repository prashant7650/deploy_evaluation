const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { ipModel } = require("../model/ip.model");
require("dotenv").config();
const passport=require("passport");
const mongoose = require('mongoose');
const redisClient = require("../helper/redis");
const winston=require("winston");
const { createLogger, transports,format } = winston;
const {authenticator}=require("../middleware/authenticate.middleware")
const ipRouter = express.Router();
const {MongoDB} = require('winston-mongodb')
const axios=require("axios")
ipRouter.use(passport.initialize());

ipRouter.get("/", async (req, res) => {
    try {
        res.status(200).send({ msg: "all data " })
    } catch (error) {
        res.status(400).send(error.message)
    }
})


  const logger = createLogger({
    level: "info",
    format: format.combine(
     format.timestamp(),
     format.json()
    ),

    transports: [
      new transports.MongoDB({
        level: 'error',
        db: process.env.MongoURL,
        options: { useUnifiedTopology: true },
        collection: 'logs'
      })
    ]
  });


ipRouter.get('/ip/:ip', authenticator, (req, res) => {
    const ip = req.params.ip;
    
    redisclient.get(ip, (err, reply) => {
        if (err) {
            return res.status(500).json({ message: "err"});
        }
        if (reply) {
            const ipInfo = JSON.parse(reply);
            return res.json(ipInfo);
        }
        axios.get("https://ipapi.co/8.8.8.8/json/")
            .then(response => {
                const ipInfo = {
                    ip: response.data.ip,
                    city: response.data.city
                };
             
                redisclient.get(ip, JSON.stringify(ipInfo), 'EX', 21600, err => {
                    if (err) {
                        logger.error(err);
                    }
                });

                const userId = req.user;
                const search = { ip, city: ipInfo.city };
                mongoose.connection.db.collection(userId).insertOne(search, err => {
                    if (err) {
                        logger.error(err);
                    }
                });
                res.json(ipInfo);
            })

            .catch(error => {
                logger.error(error);
                res.status(500).json({ message: "err" });
            });
    });
});
module.exports={
    ipRouter
}