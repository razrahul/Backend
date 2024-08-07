import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import { sendEmail } from "../Utils/sendEmail.js";
import { Stats } from "../Models/Stats.js";


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


export const getDashboardStats = catchAsyncError(async (req, res, next) => {
    const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(12);
  
    const statsData = [];
  
    for (let i = 0; i < stats.length; i++) {
      statsData.unshift(stats[i]);
    }
    const requiredSize = 12 - stats.length;
  
    for (let i = 0; i < requiredSize; i++) {
      statsData.unshift({
        users: 0,
        subscription: 0,
        views: 0,
      });
    }
  
    const usersCount = statsData[11].users;
    const subscriptionCount = statsData[11].subscription;
    const viewsCount = statsData[11].views;
  
    let usersPercentage = 0,
      viewsPercentage = 0,
      subscriptionPercentage = 0;
    let usersProfit = true,
      viewsProfit = true,
      subscriptionProfit = true;
  
    if (statsData[10].users === 0) usersPercentage = usersCount * 100;
    if (statsData[10].views === 0) viewsPercentage = viewsCount * 100;
    if (statsData[10].subscription === 0)
      subscriptionPercentage = subscriptionCount * 100;
    else {
      const difference = {
        users: statsData[11].users - statsData[10].users,
        views: statsData[11].views - statsData[10].views,
        subscription: statsData[11].subscription - statsData[10].subscription,
      };
  
      usersPercentage = (difference.users / statsData[10].users) * 100;
      viewsPercentage = ((difference.views / statsData[10].views) * 100).toFixed(3);
      subscriptionPercentage =
        (difference.subscription / statsData[10].subscription) * 100;
      if (usersPercentage < 0) usersProfit = false;
      if (viewsPercentage < 0) viewsProfit = false;
      if (subscriptionPercentage < 0) subscriptionProfit = false;
    }
  
    res.status(200).json({
      success: true,
      stats: statsData,
      usersCount,
      subscriptionCount,
      viewsCount,
      subscriptionPercentage,
      viewsPercentage,
      usersPercentage,
      subscriptionProfit,
      viewsProfit,
      usersProfit,
    });
  });
  