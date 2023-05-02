const express=require("express")
const {userModel}=require("../model/user.model")
const jwt=require("jsonwebtoken")
const bcrypt=require("bcrypt")
const redisClient = require("../helper/redis");
const authenticator=require("../middleware/authenticate.middleware")



const userRouter=express.Router()
userRouter.post("/signup",async(req,res)=>{
    const{name,email,pass}=req.body
    try{
        bcrypt.hash(pass,5,async(err,hash)=>{
            if(err){
                res.send({"msg":"something went wrong"})
            }else{
                const user=new userModel({name,email,pass:hash})
                await user.save()
                res.send({"msg":"signup succefully"})
            }
        })
        

    }
    catch(err){
        res.send({"msg":"something went wrong"})
        console.log(err)
    }
   
})

userRouter.post("/login",async(req,res)=>{
  
    try {
         
        const {email, pass} = req.body;

        const isUserPresent  = await userModel.findOne({email});

        if(!isUserPresent) return res.send("user not present, Register please");

        const isPasswordCorrect = await bcrypt.compare(pass,isUserPresent.pass);

        if(!isPasswordCorrect) return res.send("Invalid Credentials");

        const token = await jwt.sign({userId:isUserPresent._id},process.env.JWT_SECRET, {expiresIn:"6hr"})

        res.send({message: "Login Success", token});


    } catch(err) {
         res.send(err.message)
    }
})

userRouter.get("/logout",async(req,res)=>{
    try{

        const token = req.headers?.authorization?.split(" ")[1];

        if(!token) return res.status(403);

        await redisClient.set(token,token);
        res.send("logout successful");
    }catch(err) {
        res.send(err.message)
    }
})

module.exports={
    userRouter
}