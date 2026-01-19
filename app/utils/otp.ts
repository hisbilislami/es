// app/utils/otp.ts
import crypto from "crypto";
import redis from "./redis.server";

const OTP_LENGTH = 6; // Length of the OTP
const OTP_EXPIRATION = 600; // OTP expiration time in seconds (5 minutes), change it later, it's just for development.

export const generateOTP = async (email: string): Promise<string> => {
  // Generate a random OTP
  const otp = crypto
    .randomInt(0, 10 ** OTP_LENGTH)
    .toString()
    .padStart(OTP_LENGTH, "0");

  // Store OTP in Redis with an expiration time
  await redis.setex(`otp:${email}`, OTP_EXPIRATION, otp);

  return otp;
};

// Function to verify the OTP
export const verifyOTP = async (
  email: string,
  otp: string,
): Promise<boolean> => {
  const storedOtp = await redis.get(`otp:${email}`);

  // Check if the OTP matches and delete it after verification
  if (storedOtp === otp) {
    // Delete OTP after successful verification
    await redis.del(`otp:${email}`);
    return true;
  }

  // OTP did not match or has expired
  return false;
};
