const express=require("express")
const {connection}=require("./db")
const {userRouter}=require("./route/user.route")
const {ipRouter}=require("./route/ip.route")
const redisClient = require("./helper/redis");
const logger=require("./middleware/logger")
require("dotenv").config()
// const port = process.env.port || 4567;

const app=express()
app.use(express.json())

app.get("/",(req,res)=>{
    res.send("Home page")
})

app.get("/", async(req,res)=>{
    res.send(await redisClient.get("name"));
})
app.use("/user",userRouter)
app.use("ip",ipRouter)
app.listen(4567,async()=>{
try{
    await connection
    console.log("connected to db")
    console.log("server is running on 4567")


}catch(err){
    console.log(err)
}

    
})