import { google } from "googleapis";

function base64url(str) {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function sendGmailRaw({ accessToken, from, to, subject, body }) {
  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const raw = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
      'Content-Type: text/plain; charset="UTF-8"',
      "",
      body,
    ].join("\r\n");

    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: base64url(raw) },
    });
    return res.data;
  } catch (e) {
    // <<< tambahkan debug lengkap
    console.error("Gmail API error:", e?.response?.data || e);
    throw e;
  }
}
