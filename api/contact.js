import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, phone, details } = req.body;

    // Validate input
    if (!name || !phone || !details) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Send email via Resend
    const data = await resend.emails.send({
      from: 'MS Removal <onboarding@resend.dev>',
      to: process.env.CONTACT_EMAIL || 'paul@pipelinekenosha.com',
      subject: `New Quote Request from ${name}`,
      html: `
        <h2>New Quote Request</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Details:</strong></p>
        <p>${escapeHtml(details).replace(/\n/g, '<br>')}</p>
      `,
    });

    if (data.error) {
      console.error('Resend error:', data.error);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Quote request submitted successfully' 
    });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Simple HTML escape to prevent XSS
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
