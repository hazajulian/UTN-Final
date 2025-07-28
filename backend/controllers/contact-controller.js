// controllers/contact-controller.js
import { sendMail } from '../utils/mail-service.js';

export async function contactController(req, res) {
  const { subject, message } = req.body;
  const user = req.user; // Por el middleware de auth

  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  if (!subject || !message) {
    return res.status(400).json({ message: 'Subject and message are required' });
  }

  try {
    await sendMail({
      to: process.env.CONTACT_RECEIVER,
      subject: `[Contact Form] ${subject}`,
      text: `Mensaje de ${user.username} <${user.email}>:\n\n${message}`,
    });
    return res.json({ message: 'Message sent!' });
  } catch (err) {
    console.error('Failed to send contact email:', err);
    return res.status(500).json({ message: 'Error sending email' });
  }
}
