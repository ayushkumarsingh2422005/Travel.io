const { sendEmail } = require('../utils/emailService');

exports.contactUs = async (req, res) => {
    try {
        const { name, email, mobile, message } = req.body;

        // Validate input (basic validation, frontend does more)
        if (!name || !email || !mobile || !message) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        // Email to Admin
        const adminEmailContent = `
      <h3>New Contact Us Submission</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Mobile:</strong> ${mobile}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

        await sendEmail({
            to: [{ email: process.env.ADMIN_EMAIL || 'support@travel.io', name: 'Admin' }],
            subject: 'New Contact Us Inquiry',
            htmlContent: adminEmailContent
        });

        // Confirmation Email to User
        const userEmailContent = `
      <h3>Thank you for contacting us, ${name}!</h3>
      <p>We have received your message and will get back to you shortly.</p>
      <p><strong>Your Message:</strong></p>
      <blockquote>${message}</blockquote>
    `;

        await sendEmail({
            to: [{ email: email, name: name }],
            subject: 'We successfully received your message',
            htmlContent: userEmailContent
        });

        res.status(200).json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error in contactUs:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.partnerWithUs = async (req, res) => {
    try {
        const { name, email, mobile, message } = req.body;

        if (!name || !email || !mobile || !message) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        // Email to Admin
        const adminEmailContent = `
      <h3>New Partner Application</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Mobile:</strong> ${mobile}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

        await sendEmail({
            to: [{ email: process.env.ADMIN_EMAIL || 'admin@travel.io', name: 'Admin' }],
            subject: 'New Partner Application',
            htmlContent: adminEmailContent
        });

        // Confirmation Email to User
        const userEmailContent = `
      <h3>Thank you for your interest in partnering with us, ${name}!</h3>
      <p>We have received your application details. Our team will review them and contact you soon.</p>
    `;

        await sendEmail({
            to: [{ email: email, name: name }],
            subject: 'Partner Application Received',
            htmlContent: userEmailContent
        });

        res.status(200).json({ success: true, message: 'Application sent successfully' });
    } catch (error) {
        console.error('Error in partnerWithUs:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
