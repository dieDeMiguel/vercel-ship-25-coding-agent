import { sleep } from "workflow";
import {
  createUser,
  sendWelcomeEmail,
  sendOneWeekCheckInEmail
} from "./steps"

export async function userSignup(email: string) {
  "use workflow";

  const date = new Date();

  // Create the user and send the welcome email
  const user = await createUser(email); // 0.05% error rate
  await sendWelcomeEmail(email); // 1.0% error rate

  // Pause for 7 days
  // without consuming any resources
   await sleep("7 days");
  await sendOneWeekCheckInEmail(email); // 1.0% error rate

  // The total error rate is 0.05% + 1.0% + 1.0% = 2.05%

  return { userId: user.id, status: "done", date };
}