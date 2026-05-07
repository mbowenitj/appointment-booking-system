import nodemailer from 'nodemailer';
import { Branch } from '../types';

let transporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (transporter) return transporter;

  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });

  console.log(`📧  Ethereal test account: ${testAccount.user}`);
  return transporter;
}

interface SendEmailParams {
  to: string;
  customerName: string;
  branch: Branch;
  date: string;
  timeSlot: string;
  bookingId: string;
}

interface EmailResult {
  success: boolean;
  previewUrl: string | null;
}

export async function sendConfirmationEmail(params: SendEmailParams): Promise<EmailResult> {
  const { to, customerName, branch, date, timeSlot, bookingId } = params;

  const formattedDate = new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const [hourStr, minuteStr] = timeSlot.split(':');
  const hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  const displayTime = `${displayHour}:${minuteStr} ${ampm}`;

  try {
    const transport = await getTransporter();

    const info = await transport.sendMail({
      from: '"BookEasy" <noreply@bookeasy.com>',
      to,
      subject: `✅ Appointment Confirmed - ${formattedDate} at ${displayTime}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; background:#f3f4f6; padding:20px;">
          <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
            <div style="background:#4F46E5; padding:32px; text-align:center;">
              <h1 style="color:#fff; margin:0; font-size:24px;">🗓 Appointment Confirmed!</h1>
            </div>
            <div style="padding:32px;">
              <p style="font-size:16px; color:#374151;">Dear <strong>${customerName}</strong>,</p>
              <p style="color:#6B7280;">Your appointment has been successfully booked. Here are your details:</p>
              <table style="width:100%; border-collapse:collapse; margin:24px 0; font-size:15px;">
                <tr>
                  <td style="padding:12px 16px; background:#EEF2FF; font-weight:600; color:#4338CA; width:40%;">Booking ID</td>
                  <td style="padding:12px 16px; background:#F9FAFB; color:#111827;">${bookingId}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px; background:#EEF2FF; font-weight:600; color:#4338CA;">Branch</td>
                  <td style="padding:12px 16px; background:#F9FAFB; color:#111827;">${branch.name}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px; background:#EEF2FF; font-weight:600; color:#4338CA;">Address</td>
                  <td style="padding:12px 16px; background:#F9FAFB; color:#111827;">${branch.address}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px; background:#EEF2FF; font-weight:600; color:#4338CA;">Date</td>
                  <td style="padding:12px 16px; background:#F9FAFB; color:#111827;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px; background:#EEF2FF; font-weight:600; color:#4338CA;">Time</td>
                  <td style="padding:12px 16px; background:#F9FAFB; color:#111827;">${displayTime}</td>
                </tr>
              </table>
              <p style="color:#6B7280; font-size:14px; border-top:1px solid #E5E7EB; padding-top:20px;">
                Need to cancel or reschedule? Please contact us at least 24 hours in advance.<br/>
                <span style="color:#9CA3AF;">This is a simulated email for demonstration purposes.</span>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info) || null;
    console.log(`📧  Confirmation email sent → ${previewUrl}`);
    return { success: true, previewUrl };
  } catch (err) {
    console.error('⚠️  Email send failed:', (err as Error).message);
    return { success: false, previewUrl: null };
  }
}
