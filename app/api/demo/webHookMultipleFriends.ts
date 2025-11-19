import { createWebhook, sleep } from "workflow";
import {
  makeCardText,
  makeCardImage,
  sendRSVPEmail,
  sendBirthdayCard
} from "./steps";

export async function birthdayWorkflow(
  prompt: string,
  email: string,
  friends: string[],
  birthday: Date
) {
  "use workflow";

  const text = await makeCardText(prompt);
  const image = await makeCardImage(text);

  const webhooks = friends.map(_ => createWebhook());
  await Promise.all(
    friends.map(
      (friend, i) => sendRSVPEmail(friend, webhooks[i].url)
    )
  );
  const reqs: Request[] = await Promise.all(webhooks);
  const rsvps = await Promise.all(
    reqs.map(
      req => req.json().then(({ rsvp }) => rsvp)
    )
  );
  
  await sleep(birthday);

  await sendBirthdayCard(text, image, rsvps, email);

  return { text, image, rsvps, status: "Sent" };
}

