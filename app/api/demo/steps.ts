// Functions for webhook.ts
export async function makeCardText(prompt: string) {
  return "Card text";
}

export async function makeCardImage(text: string) {
  return "image-url";
}

export async function sendRSVPEmail(friend: string, webhookUrl: string) {
  return { success: true };
}

export async function sendBirthdayCard(
  text: string,
  image: string,
  rsvp: any,
  email: string
) {
  return { success: true };
}

// Functions for error.ts
export async function createUser(email: string) {
  return { id: "user-123" };
}

export async function sendWelcomeEmail(email: string) {
  return { success: true };
}

export async function sendOneWeekCheckInEmail(email: string) {
  return { success: true };
}

