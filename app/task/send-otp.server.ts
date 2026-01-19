import { generateOTP } from "~/utils/otp";
import { Queue } from "~/utils/queue.server";
import * as Sentry from "@sentry/remix";

type QueueData = {
  email: string;
};

export const qSendOtp = Queue<QueueData>("send-otp", async (job) => {
  // Generate & store OTP in Redis with an expiration time

  try {
    const otp = await generateOTP(job.data.email);
    console.log(`Sending otp to ${job.data.email}`);

    // Prepare the email payload
    const emailPayload = {
      to: [job.data.email],
      from: "noreply@trustmedis.com",
      subject: "E-sign Registration",
      html: `<p>Your OTP code is: <strong>${otp}</strong></p>`,
    };

    const response = await fetch("https://mail-worker.trustmedis.workers.dev", {
      method: "POST",
      headers: {
        Authorization: process.env.MAIL_TOKEN ?? "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    console.log("email delivered.");

    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.statusText}`);
    }
  } catch (error) {
    Sentry.captureException(error);
  }
});
