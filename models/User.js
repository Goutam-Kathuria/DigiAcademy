const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName:{type:String,required:true},
    lastName:{type:String,required:true},
    password:{type:String,required:true},
    mobileNumber:{type:String,required:true,unique:true},
    email:{type:String,required:false,unique:false},
    otp:{type:String,require:false},
    otpExpires:Date,
    role:{enum:["Teacher","Student"],default:'Student',type:String},
    subject:String ,
    hireDate: { type: Date }
},{timestamps:true})
module.exports=mongoose.model('User',userSchema)