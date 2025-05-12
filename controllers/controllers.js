const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
const sendMail = require('../config/nodemailer');  // For email sending
require('dotenv').config()
const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

// Regex for validating email and phone
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+91\d{10}$/;

const normalizeNumber = (num) => num.replace(/\D/g, '').replace(/^91/, '');

// Temporary storage for users waiting for OTP verification
const tempUser = {};

const sendOtpToPhone = async (mobileNumber, otp) => {
  try {
    const message = await client.messages.create({
      body: `Your OTP is ${otp}`,
      to: mobileNumber,  // The recipient's phone number
      from: process.env.Number // Your Twilio number
    });
    console.log('OTP sent to phone:', message.sid);
  } catch (error) {
    console.error('Error sending OTP to phone:', error);
  }
};


exports.register = async (req, res) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = Date.now() + 5 * 60 * 1000; // OTP expires in 5 minutes
  const { identifier, password, firstName, lastName, role } = req.body;

  let normalizedNumber = null;
  let email = null;

  // Check whether the identifier is an email or phone number
 if (emailRegex.test(identifier)) {
  console.log('Valid email');
  email = identifier;
} else if (phoneRegex.test(identifier)) {
  console.log('Valid phone number');
  normalizedNumber = normalizeNumber(identifier);
} else {  
  return res.status(400).json({ message: 'Invalid email or phone number' });
}

  try {
    // Check if the user already exists in the database
    const existingUser = await User.findOne(
      email ? { email } : { mobileNumber: normalizedNumber }
    );

    if (existingUser) {
      // If user exists, just log them in (without OTP)
      const match = await bcrypt.compare(password, existingUser.password);
      if (!match) {
        return res.status(401).json({ message: 'Wrong password' });
      }

      const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, {
        expiresIn: '1d',
      });

      return res.status(200).json({ message: 'Login successful', token });
    } else {
      // If user doesn't exist, proceed with registration and OTP
      const hashPassword = await bcrypt.hash(password, 10);
      const userTempKey = email || normalizedNumber;

      tempUser[userTempKey] = {
        firstName,
        lastName,
        password: hashPassword,
        email,
        mobileNumber: normalizedNumber,
        role,
        otp,
        otpExpires,
      };

      // Send OTP based on registration method
      if (normalizedNumber) {
        // Send OTP to phone if registered with phone number
        await sendOtpToPhone(normalizedNumber, otp);
      } else {
        // Send OTP to email if registered with email
        await sendMail(email, otp);
      }

      console.log('Registering Temp User:', tempUser[userTempKey]);

      return res.status(200).json({ message: 'OTP sent successfully', identifier: userTempKey });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred' });
  }
};
exports.verifyOtp = async (req, res) => {
  const { identifier, otp } = req.body;

  const isEmail = emailRegex.test(identifier);
  const key = isEmail ? identifier : normalizeNumber(identifier);

  const temp = tempUser[key];
  if (!temp || temp.otp !== otp || temp.otpExpires < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  try {
    // Create a new user and save it to the database
    const newUser = new User({
      firstName: temp.firstName,
      lastName: temp.lastName,
      email: temp.email,
      password: temp.password,
      mobileNumber: temp.mobileNumber,
      role: temp.role,
    });

    await newUser.save();
    delete tempUser[key]; // Remove temp user after saving

    return res.status(201).json({ message: 'OTP verified. Registration successful.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred during registration.' });
  }
};



exports.create = async (req, res) => {
  try {
    const { firstName, lastName, password, mobileNumber, email, role, subject, hireDate } = req.body;
    
    const exist = await User.findOne({ mobileNumber });

    if (exist) {
      return res.status(400).json({ message: 'User Already Exists!' });
    }

    // Check if the role is Teacher and handle teacher-specific fields
    let newUserData = { firstName, lastName, password, mobileNumber, email, role };

    if (role === 'Teacher') {
      // Include teacher-specific fields if role is Teacher
      newUserData = {
        ...newUserData,
        subject,
        hireDate,
      };
    }

    const hashPassword = await bcrypt.hash(password, 10);
    newUserData.password = hashPassword;

    const newUser = new User(newUserData);
    await newUser.save();

    console.log('Registered data:', newUser);
    return res.status(200).json({ message: 'User Registered Successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An Error Occurred' });
  }
};

exports.users = async (req,res) => {
    try {
      const {name,role} = req.query

    let filters={}
    if(name){
    filters.name={$regex:name,$options:"i"}
    }
    if(role){
      filters.role={$regex:role,$options:"i"}
    }
    const user=await User.find(filters)
return res.json(user)
} catch (error) {
    console.error(error);
    
return res.status(500).json({message:'An Error Occured'})
}
}
// exports.stats=async (req,res) => {
//     try {
//     const{income,sessions,conversionRate,traffic}=req.body
// const newStats =await dashBoard.create({income:income,sessions:sessions,conversionRate:conversionRate,traffic:traffic})
// return res.status(200).json({message:'Success'})
// } catch (error) {
//        console.error(error);
//        return res.status(500).json({message:'An Error Occured'})
// }
// }

// exports.updateStats=async (req,res) => {
//     try {
//    const updateDashboard = await dashBoard.findByIdAndUpdate(req.params.id,req.body,{new:true});
//    if(!updateDashboard){
//     return res.status(400).json({message:'Dashboard not found'})
//    }
// return res.status(200).json({message:'Success'})
// } catch (error) {
//        console.error(error);
//        return res.status(500).json({message:'An Error Occured'})
// }
// }
// exports.getDashboard=async (req,res) => {
//     try {
//         const dashBoardData = await dashBoard.find()
//         if(!dashBoardData){
//             return res.status(500).json({message:'Data Not Aviable'})
//         }
//         return res.json(dashBoardData)
//     } catch (error) {
//         console.error(error);
//          return res.status(500).json({message:'An Error Occured'})
//     }
// }
// exports.conversionRate = async (req, res) => {
//     try {
//         const totalSessions = await sessions.countDocuments();
//         const totalConversions = await conversion.countDocuments();

//         // Calculate conversion rate
//         const conversionRate = (totalConversions / totalSessions) * 100;
//         console.log("UserId from session:", req.session.userId);

//         const conversionData = await conversion.findOneAndUpdate(   { userId: req.session.userId },
//             {
//                 $set: {
//                     conversionRate: conversionRate.toFixed(2),
//                     convertedAt: new Date()
//                 }
//             },
//             { upsert: true, new: true } );

//         console.log(totalSessions);
//         console.log(conversionData);
//         res.json({ conversionRate: conversionRate.toFixed(2) + "%" });
//     } catch (error) {
//         console.error("Error calculating conversion rate:", error);
//         return res.status(500).json({ message: "Error calculating conversion rate" });
//     }
// };

  



















//   exports.getconversionRate = async (req, res) => {
//     try {
//     const conversions = await conversion.find();
//     res.json(conversions);
// } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: "Error calculating conversion rate" });
// }
//   }
//   exports.Sessions = async (req, res) => {
//     try {
//         const userSession = await sessions.findOne({ userId: req.session.userId });

//         if (req.session.userId) {
//             console.log('Session exists for user:', req.session.userId);
//         } else {
//             console.log('No session found');
//         }

//         if (!req.session.isCounted) {
//             if (!userSession) {
//                 await sessions.create({ userId: req.session.userId, createdAt: new Date() });
//                 req.session.isCounted = true;
//             } else {
//                 req.session.isCounted = true;
//             }
//         }

//         const sessionData = new sessions({
//             userId: req.session.userId,
//             createdAt: new Date(),
//         });
//         await sessionData.save();


//         const totalSessions = await sessions.countDocuments();
//         console.log(totalSessions);
//         res.json({ totalSessions });
//     } catch (error) {
//         console.error("Error fetching sessions:", error);
//         res.status(500).json({ message: "Error fetching session data" });
//     }
// };


  



  