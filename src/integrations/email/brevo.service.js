const { sendTransactionalEmailRequest } = require("./brevo.client");

const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || "";
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || "Campus Bus Tracker";

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const validateSender = () => {
  if (!BREVO_SENDER_EMAIL) {
    throw new Error("BREVO_SENDER_EMAIL is not set in environment variables");
  }
};

const normalizeRecipients = (recipients = []) => {
  if (!Array.isArray(recipients) || recipients.length === 0) {
    throw new Error("At least one recipient is required");
  }

  return recipients.map((recipient) => {
    if (!recipient.email) {
      throw new Error("Recipient email is required");
    }

    return {
      email: recipient.email,
      name: recipient.name || ""
    };
  });
};

const buildAnnouncementSubject = ({ title }) => {
  return `[Campus Bus Tracker] ${title}`;
};

const buildAnnouncementText = ({
  title,
  message,
  priority = "medium",
  scope = "general"
}) => {
  return `
Campus Bus Tracker Announcement

Title: ${title}
Priority: ${priority}
Scope: ${scope}

Message:
${message}
  `.trim();
};

const buildAnnouncementHtml = ({
  title,
  message,
  priority = "medium",
  scope = "general"
}) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
      <h2 style="margin-bottom: 12px;">Campus Bus Tracker Announcement</h2>
      <p><strong>Title:</strong> ${escapeHtml(title)}</p>
      <p><strong>Priority:</strong> ${escapeHtml(priority)}</p>
      <p><strong>Scope:</strong> ${escapeHtml(scope)}</p>
      <hr />
      <p style="white-space: pre-line;">${escapeHtml(message)}</p>
    </div>
  `;
};

const sendEmail = async ({ to, subject, htmlContent, textContent }) => {
  validateSender();

  const normalizedRecipients = normalizeRecipients(to);

  return sendTransactionalEmailRequest({
    sender: {
      email: BREVO_SENDER_EMAIL,
      name: BREVO_SENDER_NAME
    },
    to: normalizedRecipients,
    subject,
    htmlContent,
    textContent
  });
};

const sendAnnouncementEmail = async ({
  recipients,
  title,
  message,
  priority = "medium",
  scope = "general"
}) => {
  if (!title || !String(title).trim()) {
    throw new Error("Announcement title is required");
  }

  if (!message || !String(message).trim()) {
    throw new Error("Announcement message is required");
  }

  const subject = buildAnnouncementSubject({ title });
  const htmlContent = buildAnnouncementHtml({
    title,
    message,
    priority,
    scope
  });
  const textContent = buildAnnouncementText({
    title,
    message,
    priority,
    scope
  });

  return sendEmail({
    to: recipients,
    subject,
    htmlContent,
    textContent
  });
};

module.exports = {
  sendEmail,
  sendAnnouncementEmail
};