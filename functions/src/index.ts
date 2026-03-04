import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import * as functionsV1 from "firebase-functions/v1";
import * as nodemailer from "nodemailer";

initializeApp();
const firestore = getFirestore();

// Gmail SMTP config — loaded from functions/.env
const GMAIL_EMAIL = process.env.GMAIL_EMAIL || "";
const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD || "";
const NOTIFY_TO = process.env.NOTIFY_TO || GMAIL_EMAIL;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_EMAIL,
    pass: GMAIL_PASSWORD,
  },
});

/**
 * Firestore trigger: sends email notification when a new contact enquiry is created.
 */
export const onNewContact = onDocumentCreated(
  { document: "contacts/{contactId}", region: "us-central1" },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const data = snap.data();
    const { name, email, phone, message, source } = data;
    const contactId = event.params.contactId;
    const timestamp = data.createdAt?.toDate?.()
      ? data.createdAt.toDate().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      : new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    const htmlBody = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1C1A17; padding: 24px 32px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #FAF7F2; font-size: 18px; margin: 0; font-weight: 600;">
            New Enquiry — Pune Global Group
          </h1>
        </div>
        <div style="background: #FAF7F2; padding: 32px; border: 1px solid #e8e2da; border-top: none; border-radius: 0 0 8px 8px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 10px 0; color: #7A736D; width: 100px; vertical-align: top;">Name</td>
              <td style="padding: 10px 0; color: #1C1A17; font-weight: 500;">${name || "—"}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #7A736D; vertical-align: top;">Email</td>
              <td style="padding: 10px 0; color: #1C1A17;">
                <a href="mailto:${email}" style="color: #1C1A17;">${email || "—"}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #7A736D; vertical-align: top;">Phone</td>
              <td style="padding: 10px 0; color: #1C1A17;">
                ${phone ? `<a href="tel:${phone}" style="color: #1C1A17;">${phone}</a>` : "—"}
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #7A736D; vertical-align: top;">Message</td>
              <td style="padding: 10px 0; color: #1C1A17; line-height: 1.6;">${message || "—"}</td>
            </tr>
          </table>
          <hr style="border: none; border-top: 1px solid #e8e2da; margin: 20px 0;" />
          <p style="font-size: 12px; color: #7A736D; margin: 0;">
            Source: ${source || "website"} · ID: ${contactId}<br/>
            Received: ${timestamp}
          </p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"PGG Website" <${GMAIL_EMAIL}>`,
      to: NOTIFY_TO,
      replyTo: email || undefined,
      subject: `Website Enquiry — ${name || "Website Visitor"} — puneglobalgroup.in`,
      html: htmlBody,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent for contact ${contactId} from ${name}`);
    } catch (error) {
      console.error("Failed to send email:", error);
      throw error;
    }
  }
);

/**
 * HTTP endpoint for contact form submissions.
 * Bypasses client-side Firestore permissions by using Admin SDK.
 */
export const submitContact = functionsV1.region("us-central1").https.onRequest(
  async (req, res) => {
    // CORS handling
    const origin = req.headers.origin || "";
    const allowed = /puneglobalgroup\.in$/.test(origin) || origin === "http://localhost:3000";
    if (allowed) {
      res.set("Access-Control-Allow-Origin", origin);
      res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.set("Access-Control-Allow-Headers", "Content-Type");
    }
    if (req.method === "OPTIONS") { res.status(204).send(""); return; }
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      res.status(400).json({ error: "Name, email, and message are required." });
      return;
    }

    try {
      const docRef = await firestore.collection("contacts").add({
        name,
        email,
        phone: phone || "",
        message,
        createdAt: FieldValue.serverTimestamp(),
        source: "website",
      });

      console.log(`Contact saved: ${docRef.id} from ${name}`);

      // Send email directly (don't rely on onNewContact trigger)
      const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

      const htmlBody = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1C1A17; padding: 24px 32px; border-radius: 8px 8px 0 0;">
            <h1 style="color: #FAF7F2; font-size: 18px; margin: 0; font-weight: 600;">
              New Enquiry — Pune Global Group
            </h1>
          </div>
          <div style="background: #FAF7F2; padding: 32px; border: 1px solid #e8e2da; border-top: none; border-radius: 0 0 8px 8px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 10px 0; color: #7A736D; width: 100px; vertical-align: top;">Name</td>
                <td style="padding: 10px 0; color: #1C1A17; font-weight: 500;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #7A736D; vertical-align: top;">Email</td>
                <td style="padding: 10px 0; color: #1C1A17;">
                  <a href="mailto:${email}" style="color: #1C1A17;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #7A736D; vertical-align: top;">Phone</td>
                <td style="padding: 10px 0; color: #1C1A17;">
                  ${phone ? `<a href="tel:${phone}" style="color: #1C1A17;">${phone}</a>` : "—"}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #7A736D; vertical-align: top;">Message</td>
                <td style="padding: 10px 0; color: #1C1A17; line-height: 1.6;">${message}</td>
              </tr>
            </table>
            <hr style="border: none; border-top: 1px solid #e8e2da; margin: 20px 0;" />
            <p style="font-size: 12px; color: #7A736D; margin: 0;">
              Source: website · ID: ${docRef.id}<br/>
              Received: ${timestamp}
            </p>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `"PGG Website" <${GMAIL_EMAIL}>`,
        to: NOTIFY_TO,
        replyTo: email,
        subject: `Website Enquiry — ${name} — puneglobalgroup.in`,
        html: htmlBody,
      });

      console.log(`Email sent for contact ${docRef.id} from ${name}`);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("submitContact error:", error);
      res.status(500).json({ error: "Failed to submit. Please try again." });
    }
  }
);
