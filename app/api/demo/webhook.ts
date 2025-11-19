import { createWebhook } from "workflow";
import {
  makeCardText,
  makeCardImage,
  sendRSVPEmail,
  sendBirthdayCard
} from "./steps"

export async function paymentFlow(prompt: string, friend: string, email: string) {
  "use workflow";

  const text = await makeCardText(prompt)
  const image = await makeCardImage(text)

  const webhook = createWebhook()
  await sendRSVPEmail(friend, webhook.url)
  const req: Request = await webhook
  const { rsvp } = await req.json()

  await sendBirthdayCard(text, image, rsvp, email)

  return { text, image, status: "Sent" }
}