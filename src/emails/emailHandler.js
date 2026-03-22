import { resendClient, sender } from "../utils/resend.js";
import { createWelcomeEmailTemplate } from "./email.templates.js";
import { ApiError } from '../utils/ApiError.js'

export const sendWelcomeEmail = async (email, name, clientURL) => {
  const { data, error } = await resendClient.emails.send({
    from: `${sender.name} <${sender.email}>`,
    to: email,
    subject: "Welcome to Chatify!",
    html: createWelcomeEmailTemplate(name, clientURL),
  });

  if (error) {
    console.error("Error sending welcome email:", error);
    throw new ApiError(400,"Failed to send welcome email");
  }

  console.log("Welcome Email sent successfully", data);
};