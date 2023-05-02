const mongoose=require("mongoose")

const ipSchema=mongoose.Schema({
    name:String,
    city:String
    
})

const ipModel=mongoose.model("ip",ipSchema)

module.exports={
    ipModel
}