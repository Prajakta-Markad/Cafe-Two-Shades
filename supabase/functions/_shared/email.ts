const RESEND_API_URL =
  "https://api.resend.com/emails";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: SendEmailOptions) {
  const apiKey =
    Deno.env.get("RESEND_API_KEY");

  const from =
    Deno.env.get("EMAIL_FROM");

  if (!apiKey || !from) {
    throw new Error(
      "Email service is not configured."
    );
  }

  const response = await fetch(
    RESEND_API_URL,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        ...(replyTo
          ? { reply_to: replyTo }
          : {}),
      }),
    }
  );

  if (!response.ok) {
    const errorText =
      await response.text();

    console.error(
      "Resend error:",
      errorText
    );

    throw new Error(
      "Unable to send email."
    );
  }

  return response.json();
}