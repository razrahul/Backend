// import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
// import { User } from "../Models/User.js";
// import { Course } from "../Models/Course.js";
// import ErrorHandler from "../Utils/errorHandler.js";
// import { instance } from "../server.js";
// import crypto from "crypto"
// import { Payment } from "../Models/Payment.js";


// // export const buySubscription = catchAsyncError(async (req, res, next)=> {

// //     const user = await User.findById(req.user._id);

// //     const course = await Course.findById(req.body.id);

// //     if(user.role === 'admin') return next(new ErrorHandler("Admin can't buy subscription", 400))
    
// //     if(!course) return next(new ErrorHandler("Course not found", 404))
        
// //     const plan_id=process.env.PLAN_ID || "plan_OcNNWiAQlcQVnx"

// //     const subscription = await instance.subscriptions.create({
// //             plan_id: plan_id,
// //             customer_notify: 1,
// //             quantity: 1,
// //             total_count: 12,
            
// //           }) 
           
// //     user.subscription.push({
// //         id: subscription.id,
// //         course: course._id,
// //         status: subscription.status,
// //         // payment: subscription
// //     })

// //     await user.save();

// //     res.status(201).json({
// //         success: true,
// //         subscriptionId: subscription.id,
// //     })

// // })
// export const buySubscription = catchAsyncError(async (req, res, next)=> {

//     const user = await User.findById(req.user._id);

//     const course = await Course.findById(req.body.id);

//     if(user.role === 'admin') return next(new ErrorHandler("Admin can't buy subscription", 400))
    
//     if(!course) return next(new ErrorHandler("Course not found", 404))
        
//       const { amount, currency = "INR" } = req.body;

//       // Validate the amount
//       if (!amount || amount <= 0) {
//         return next(new ErrorHandler("Invalid amount", 400));
//       }
    
//       const options = {
//         amount: amount * 100, // amount in the smallest currency unit (paise for INR)
//         currency: currency,
//         receipt: `receipt_${Date.now()}`, // unique receipt id
//         payment_capture: 1 // auto capture payment (1 for true)
//       };
    
//       try {
//         const order = await instance.orders.create(options);
    
//         res.status(201).json({
//           success: true,
//           orderId: order.id,
//           amount: order.amount,
//           currency: order.currency
//         });
//       } catch (error) {
//         return next(new ErrorHandler("Failed to create order", 500));
//       }

// })


// // export const paymentVerification = catchAsyncError(async (req, res, next) => {
// //     const { razorpay_signature, razorpay_payment_id, razorpay_subscription_id } = req.body;
  
// //     const user = await User.findById(req.user._id);
  
// //     const Subscription = user.subscription.find(sub => sub.id === razorpay_subscription_id);
  
// //     if (!Subscription) {
// //       return res.redirect(`${process.env.FRONTEND_URL}/paymentfail`);
// //     }
  
// //     const generated_signature = crypto
// //       .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
// //       .update(razorpay_payment_id + "|" + Subscription.id, "utf-8")
// //       .digest("hex");
  
// //     const isAuthentic = generated_signature === razorpay_signature;
  
// //     // if (!isAuthentic) {
// //     //   return res.redirect(`${process.env.FRONTEND_URL}/paymentfail`);
// //     // }

// //     if (!isAuthentic) {
// //       user.subscription = user.subscription.filter(sub => sub.id.toString() !== Subscription._id.toString());
// //       await user.save();
// //       return res.redirect(`${process.env.FRONTEND_URL}/paymentfail`);
// //   }
  
// //     // Database update comes here
    
// //     await Payment.create({
// //       razorpay_signature,
// //       razorpay_payment_id,
// //       razorpay_subscription_id,
// //     });
  
// //     Subscription.status = "active";
  
// //     await user.save();
  
// //     res.redirect(
// //       `${process.env.FRONTEND_URL}/paymentsuccess?reference=${razorpay_payment_id}`
// //     );
// //   });
// export const paymentVerification = catchAsyncError(async (req, res, next) => {
//   const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

//   const user = await User.findById(req.user._id);

//   if (!user) {
//       return next(new ErrorHandler("User not found", 404));
//   }

//   // Create the expected signature
//   const generated_signature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
//       .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//       .digest("hex");

//   // Verify the signature
//   const isAuthentic = generated_signature === razorpay_signature;

//   if (!isAuthentic) {
//       // If the signature doesn't match, reject the payment and update the user's subscription
//       user.subscription = user.subscription.filter(sub => sub.id !== razorpay_order_id);
//       await user.save();
//       return res.status(400).json({ success: false, message: "Payment verification failed" });
//   }

//   // If payment is successful, create a record in the Payment model
//   await Payment.create({
//       razorpay_payment_id,
//       razorpay_order_id,
//       razorpay_signature,
//       user: user._id,
//       status: "successful"
//   });

//   // Update user's subscription status to active
//   const subscription = user.subscription.find(sub => sub.id === razorpay_order_id);
//   if (subscription) {
//       subscription.status = "active";
//   }

//   await user.save();

//   res.status(200).json({
//       success: true,
//       message: "Payment verified successfully",
//       paymentId: razorpay_payment_id
//   });
// });

// export const getRazorPayKey = catchAsyncError(async (req, res, next)=> {

//     res.status(200).json({
//         success: true,
//         key: process.env.RAZORPAY_API_KEY
//     })

// })

// export const cancelSubscription = catchAsyncError(async (req, res, next) => {
//     try {
//       const user = await User.findById(req.user._id);
//       if (!user) return next(new ErrorHandler("User not found", 404));
  
//       const course = await Course.findById(req.query.id);
//       if (!course) return next(new ErrorHandler("Invalid Course Id", 404));
  
//       const subscription = user.subscription.find(sub => sub.course.toString() === course._id.toString());
//       if (!subscription) return next(new ErrorHandler("Subscription not found", 404));
  
//       const subscriptionId = subscription.id;
//       console.log(subscriptionId);
      
//       let refund = false;
  
//       await instance.subscriptions.cancel(subscriptionId);
  
//       const payment = await Payment.findOne({ razorpay_subscription_id: subscriptionId });
//       if (!payment) return next(new ErrorHandler("Payment not found", 404));
  
//       const gap = Date.now() - new Date(payment.createdAt).getTime();
//       const refundTime = process.env.REFUND_DAYS * 24 * 60 * 60 * 1000;
  
//       if (refundTime > gap) {
//         await instance.payments.refund(payment.razorpay_payment_id);
//         refund = true;
//       }
  
//       user.subscription = user.subscription.filter(sub => sub.course.toString() !== course._id.toString());
  
//       await payment.deleteOne();
  
//       await user.save();
  
//       res.status(200).json({
//         success: true,
//         message: refund
//           ? "Subscription cancelled, You will receive full refund within 7 days"
//           : "Subscription cancelled, No refund initiated as subscription was cancelled after refund period"
//       });
//     } catch (error) {
//       next(new ErrorHandler(error.message, 500));
//     }
//   });

import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import { User } from "../Models/User.js";
import { Course } from "../Models/Course.js";
import ErrorHandler from "../Utils/errorHandler.js";
import { instance } from "../server.js";
import crypto from "crypto";
import { Payment } from "../Models/Payment.js";

// Buy Subscription
export const buySubscription = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(new ErrorHandler("User not found", 404));

  const courseId = req.body.id;
  if (!courseId) return next(new ErrorHandler("Course ID is required", 400));

  const course = await Course.findById(courseId);
  if (!course) return next(new ErrorHandler("Course not found", 404));

  if (user.role === 'admin') return next(new ErrorHandler("Admin can't buy subscription", 400));

  const subscription = user.subscription.find(sub => sub.course.toString() === courseId.toString());
  if (subscription) return next(new ErrorHandler("Course already purchased", 404));

  const { amount, currency = "INR" } = req.body;
  if (!amount || amount <= 0) return next(new ErrorHandler("Invalid amount", 400));

  const options = {
      amount: amount * 100, // amount in the smallest currency unit (paise for INR)
      currency: currency,
      receipt: `receipt_${Date.now()}`, // unique receipt id
      payment_capture: 1 ,// auto capture payment (1 for true)
      notes: {
        key1: "value3",
        key2: "value2"
      }
  };

  try {
      const order = await instance.orders.create(options);

      user.subscription.push({
          id: order.id, // Razorpay order ID as string
          course: course._id, // Reference to Course model
          status: "created", // Subscription status
      });

      await user.save();

      res.status(201).json({
          success: true,
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
      });
  } catch (error) {
      return next(new ErrorHandler("Failed to create order", 500));
  }
});

// Payment Verification
export const paymentVerification = catchAsyncError(async (req, res, next) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
  // console.log(razorpay_payment_id, razorpay_order_id, razorpay_signature);
  
  const user = await User.findById(req.user._id);
  if (!user) return next(new ErrorHandler("User not found", 404));

  // Create the expected signature
  const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

  // Verify the signature
  const isAuthentic = generated_signature === razorpay_signature;

  if (!isAuthentic) {
      // If the signature doesn't match, reject the payment and update the user's subscription
      user.subscription = user.subscription.filter(sub => sub.id !== razorpay_order_id);
      await user.save();
      return res.redirect(`${process.env.FRONTEND_URL}/paymentfail`);
      return res.status(400).json({ success: false, message: "Payment verification failed" });
  }

  // If payment is successful, create a record in the Payment model
  await Payment.create({
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      user: user._id,
      status: "successful",
  });

  // Update user's subscription status to active
  const subscription = user.subscription.find(sub => sub.id === razorpay_order_id);
  if (subscription) subscription.status = "active";

  await user.save();
  res.redirect(
    `${process.env.FRONTEND_URL}/paymentsuccess?reference=${razorpay_payment_id}`
  );

  // res.status(200).json({
  //     success: true,
  //     message: "Payment verified successfully",
  //     paymentId: razorpay_payment_id,
  // });
});

// Get RazorPay Key
export const getRazorPayKey = catchAsyncError(async (req, res, next) => {
  res.status(200).json({
      success: true,
      key: process.env.RAZORPAY_API_KEY,
  });
});

// Cancel Subscription
export const cancelSubscription = catchAsyncError(async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) return next(new ErrorHandler("User not found", 404));
  
      const courseId = req.query.id;
      if (!courseId) return next(new ErrorHandler("Course ID is required", 400));
  
      const course = await Course.findById(courseId);
      if (!course) return next(new ErrorHandler("Invalid Course Id", 404));
  
      const subscription = user.subscription.find(sub => sub.course.toString() === course._id.toString());
      if (!subscription) return next(new ErrorHandler("Subscription not found", 404));
  
      const orderId = subscription.id.toString(); // Ensure orderId is a string
      console.log("Subscription ID:", orderId);
  
      // Find the Payment document where the razorpay_order_id matches the subscription ID
      const paymentCourse = await Payment.findOne({ razorpay_order_id: orderId });
  
      if (!paymentCourse) {
        console.error("Payment not found for orderId:", orderId);
        return next(new ErrorHandler("Payment not found", 404));
      }
  
      const paymentId = paymentCourse.razorpay_payment_id;
      if (!paymentId) {
        console.error("Payment ID not found in the paymentCourse document:", paymentCourse);
        return next(new ErrorHandler("Payment ID not found", 500));
      }
  
      console.log("Payment Details:", paymentCourse);
      console.log("Payment ID:", paymentId);
  
      let refund = false;
  
      const { amount, currency = "INR" } = req.body;
      if (!amount || amount <= 0) return next(new ErrorHandler("Invalid amount", 400));
  
      const options = {
        amount: amount * 100, // amount in the smallest currency unit (paise for INR)
        speed: "normal",
        currency: currency,
        receipt: `receipt_${Date.now()}`, // unique receipt id
        notes: {
          key1: "value3",
          key2: "value2"
        }
      };
  
      const gap = Date.now() - new Date(paymentCourse.createdAt).getTime();
      const refundTime = process.env.REFUND_DAYS * 24 * 60 * 60 * 1000;
  
      if (refundTime > gap) {
        try {
            await instance.payments.refund(paymentId, options);
            refund = true;
        } catch (refundError) { 
            if (refundError.error && refundError.error.code === 'BAD_REQUEST_ERROR') {
                console.error('Refund failed due to insufficient balance:', refundError.error.description);
                return next(new ErrorHandler("Refund failed: Insufficient balance in Razorpay account. Please add funds and try again.", 400));
            } else {
                console.error('Error processing refund:', refundError);
                return next(new ErrorHandler("Failed to process refund", 500));
            }
        }
        
      }
  
      user.subscription = user.subscription.filter(sub => sub.course.toString() !== course._id.toString());
  
      await paymentCourse.deleteOne();
      await user.save();
  
      res.status(200).json({
        success: true,
        message: refund
          ? "Subscription cancelled. You will receive a full refund within 7 days."
          : "Subscription cancelled. No refund initiated as the subscription was cancelled after the refund period.",
      });
    } catch (error) {
      console.error('Error in cancelSubscription:', error);
      next(new ErrorHandler(error.message, 500));
    }
  });
  