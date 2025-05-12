const noderMailer = require('nodemailer');

require('dotenv').config()

const transporter = noderMailer.createTransport({
    service:"gmail",
   auth:{ 
    user:process.env.EMAIL_USER,
    pass:process.env.EMAIL_PASS
   }
})

const sendMail = async (to,subject,text,html)=>{
    try {
        await transporter.sendMail({
            from:process.env.EMAIL_USER,
            to,
            subject,
            text,
            html
        })
        console.log(`Email sent to ${to}`);
        
    } catch (error) {
       console.log(error);
        console.error('Error');
    }
}
module.exports=sendMail;