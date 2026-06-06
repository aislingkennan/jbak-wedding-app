import nodemailer from 'nodemailer';
import type { Party } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

function buildHtml(party: Party): string {
  const rsvpUrl = `${BASE_URL}/rsvp/${party.token}`;
  const isFull = party.attendanceType === 'Ceremony + Dinner';

  const venueSection = isFull
    ? `
      <p style="margin:0 0 8px 0;"><strong>Ceremony</strong><br/>
      MoLI — Museum of Literature Ireland<br/>
      Newman House, 85/86 St Stephen's Green, Dublin 2<br/>
      <em>Arrive 2:00pm · Ceremony begins 2:30pm</em></p>
      <p style="margin:0 0 8px 0;"><strong>Dinner &amp; Dancing</strong><br/>
      Ashton's Pub, Clonskeagh Road, Rathmines, Dublin 6<br/>
      <em>Arrive 4:45pm</em></p>
    `
    : `
      <p style="margin:0 0 8px 0;"><strong>Dinner &amp; Dancing</strong><br/>
      Ashton's Pub, Clonskeagh Road, Rathmines, Dublin 6<br/>
      <em>Arrive 4:45pm</em></p>
    `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Inter:wght@300;400&display=swap" rel="stylesheet" />
</head>
<body style="margin:0;padding:0;background-color:#f5f0e8;font-family:'Inter',Helvetica,Arial,sans-serif;color:#3a3028;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0e8;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#fdfaf5;border:1px solid #e8d9bf;border-radius:4px;overflow:hidden;">
          <tr>
            <td style="padding:0;position:relative;text-align:center;">
              <img src="${BASE_URL}/photos/puppy.jpg" alt="Jack &amp; Aisling" width="560" style="display:block;width:100%;max-height:380px;object-fit:cover;object-position:center 60%;" />
              <div style="background-color:rgba(30,20,10,0.15);padding:16px 40px;margin-top:-4px;">
                <p style="margin:0 0 4px 0;color:#c9a84c;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-family:'Cormorant Garamond',Georgia,serif;">Saturday, 5th September 2026</p>
                <h1 style="margin:0;color:#fdfaf5;font-size:32px;font-weight:normal;font-family:'Cormorant Garamond',Georgia,serif;">Jack &amp; Aisling</h1>
                <p style="margin:8px 0 0 0;color:#c9a84c;font-size:13px;font-family:'Cormorant Garamond',Georgia,serif;">Dublin, Ireland</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 20px 0;font-size:17px;font-family:'Cormorant Garamond',Georgia,serif;">Dear ${party.displayName},</p>
              <p style="margin:0 0 24px 0;line-height:1.7;font-size:15px;">We would be so delighted to have you join us as we celebrate our wedding day!</p>
              <div style="border-left:3px solid #c9a84c;padding-left:20px;margin-bottom:28px;font-size:14px;line-height:1.8;">
                ${venueSection}
              </div>
              <p style="margin:0 0 8px 0;line-height:1.7;font-size:15px;">Please let us know if you are able to join us by responding below.</p>
              <p style="margin:0 0 28px 0;line-height:1.7;font-size:15px;"><strong>Please RSVP by June 25th.</strong></p>
              <div style="text-align:center;margin-bottom:32px;">
                <a href="${rsvpUrl}" style="display:inline-block;background-color:#c9a84c;color:#fff;text-decoration:none;padding:14px 36px;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-family:'Inter',Helvetica,Arial,sans-serif;">RSVP Now</a>
              </div>
              <p style="margin:0;font-size:12px;color:#8a7a6a;text-align:center;font-family:'Inter',Helvetica,Arial,sans-serif;">
                Or copy this link:<br/>
                <a href="${rsvpUrl}" style="color:#c9a84c;">${rsvpUrl}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f5f0e8;padding:20px 40px;text-align:center;border-top:1px solid #e8d9bf;">
              <p style="margin:0;font-size:12px;color:#a0917f;">Questions? Email <a href="mailto:aisling.kennan@gmail.com" style="color:#c9a84c;">aisling.kennan@gmail.com</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendInvite(party: Party): Promise<void> {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `Jack & Aisling <${process.env.GMAIL_USER}>`,
    to: party.emails.join(', '),
    subject: "You're invited — Jack & Aisling, 5th September 2026",
    html: buildHtml(party),
  });
}
