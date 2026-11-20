"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { contactMessages, prayerRequests } from "@/db/schema";
import { allow, clientIp } from "@/lib/rate-limit";
import { EMAIL_RE, field, type FormState } from "@/lib/validate";

const TOPICS = ["Planning a visit", "A question about the ministry", "Speaking with a minister", "Something else"];

const TOO_MANY: FormState = {
  ok: false,
  message: "You have sent several messages in a short time. Please wait a few minutes and try again.",
};

export async function submitPrayerRequest(_prev: FormState, formData: FormData): Promise<FormState> {
  // Hidden field that people never see; anything that fills it in is a bot.
  if (field(formData, "website")) return { ok: true, message: "Thank you." };

  const name = field(formData, "name", 120);
  const email = field(formData, "email", 200);
  const phone = field(formData, "phone", 40);
  const request = field(formData, "request", 4000);
  const confidential = formData.get("confidential") === "on";
  const wantsContact = formData.get("wantsContact") === "on";

  const errors: Record<string, string> = {};
  if (request.length < 5) errors.request = "Please tell us how we can pray for you.";
  if (email && !EMAIL_RE.test(email)) errors.email = "That email address does not look right. Please check it.";
  if (wantsContact && !email && !phone) {
    errors.email = "Add an email address or a phone number so we can reach you.";
  }
  if (Object.keys(errors).length > 0) {
    return { ok: false, message: "Please check the marked fields and send again.", errors };
  }

  if (!allow(`prayer:${await clientIp()}`, 6, 10 * 60_000)) return TOO_MANY;

  try {
    await db.insert(prayerRequests).values({ name, email, phone, request, confidential, wantsContact });
  } catch {
    return { ok: false, message: "We could not send your request just now. Please try again in a moment." };
  }

  revalidatePath("/admin", "layout");
  const firstName = name.split(/\s+/)[0];
  return { ok: true, message: firstName ? `Thank you, ${firstName}.` : "Thank you." };
}

export async function submitContactMessage(_prev: FormState, formData: FormData): Promise<FormState> {
  if (field(formData, "website")) return { ok: true, message: "Thank you." };

  const name = field(formData, "name", 120);
  const email = field(formData, "email", 200);
  const phone = field(formData, "phone", 40);
  const topicRaw = field(formData, "topic", 80);
  const topic = TOPICS.includes(topicRaw) ? topicRaw : TOPICS[TOPICS.length - 1];
  const message = field(formData, "message", 4000);

  const errors: Record<string, string> = {};
  if (!name) errors.name = "Please tell us your name.";
  if (email && !EMAIL_RE.test(email)) errors.email = "That email address does not look right. Please check it.";
  if (!email && !phone) errors.email = "Add an email address or a phone number so we can reply.";
  if (message.length < 5) errors.message = "Please write a short message.";
  if (Object.keys(errors).length > 0) {
    return { ok: false, message: "Please check the marked fields and send again.", errors };
  }

  if (!allow(`contact:${await clientIp()}`, 6, 10 * 60_000)) return TOO_MANY;

  try {
    await db.insert(contactMessages).values({ name, email, phone, topic, message });
  } catch {
    return { ok: false, message: "We could not send your message just now. Please try again in a moment." };
  }

  revalidatePath("/admin", "layout");
  const firstName = name.split(/\s+/)[0];
  return { ok: true, message: `Thank you, ${firstName}.` };
}
