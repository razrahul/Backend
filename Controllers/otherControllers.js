import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import { sendEmail } from "../Utils/sendEmail.js";


export const contact = catchAsyncError( async (req, res, next) => {

    const { name, email, message } = req.body;

    const detail = `A Message Fron A Contact Us....
    \nName: ${name}\nEmail: ${email}\nMessage: ${message}`;

    const mail = process.env.ADMIN_MAIL_ID

    await sendEmail(mail, "Contact Form", detail)

    res.status(200).json({
        success: true,
        message: "Contact form submitted successfully"
    })
})

export const requestCourse= catchAsyncError( async(req, res, next)=> {

    const { name, email, course } = req.body;

    const deatil = ` A Message Fron A RequestCourse....
    \nName: ${name}\nEmail: ${email}\n RequestCourse: ${course}`;

    const mail = process.env.ADMIN_MAIL_ID

    await sendEmail(mail, "Request Course Form", deatil)

    res.status(200).json({
        success: true,
        message: "Request course form submitted successfully"
    })
})