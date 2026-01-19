import * as Sentry from "@sentry/remix";

import { Queue } from "~/utils/queue.server";

type QueueData = {
  email: string;
  username: string;
  resetLink: string;
};

export const qSendEmail = Queue<QueueData>("send-email", async (job) => {
  try {
    // Prepare the email payload
    const emailPayload = {
      to: [job.data.email],
      from: "noreply@trustmedis.com",
      subject: "TM Sign Reset Password",
      html: `<p>Halo, ${job.data.username}</p>
             <br /><br />
             <p>Kami menerima permintaan untuk mereset kata sandi akun Anda di TM Sign. Jika Anda tidak meminta pengaturan ulang kata sandi, abaikan email ini.</p>
             <br/><br/>
             <p>Untuk mengatur ulang kata sandi Anda, silakan klik tautan berikut.</p>
             <br/><br/>
             <a href='${job.data.resetLink}' target='blank'>Atur ulang kata sandi</a>
             <br/><br/>
             <p>Terimakasih.</p><br/>
             <p>Tim TM Sign.</p>`,
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
