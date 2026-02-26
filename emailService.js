const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Send expiry alert email
async function sendExpiryAlert(userEmail, panelData) {
  const daysLeft = Math.ceil((panelData.expiryDate() - new Date()) / (24 * 60 * 60 * 1000));
  const isExpired = daysLeft < 0;
  const statusColor = isExpired ? '#dc3545' : '#ffc107';
  const statusText = isExpired ? 'EXPIRED' : `${daysLeft} days until expiry`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@solarrecycle.com',
    to: userEmail,
    subject: `⚠️ Solar Panel ${isExpired ? 'EXPIRED' : 'Expiry Alert'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${statusColor};">Solar Panel ${isExpired ? 'Expired' : 'Expiry Alert'}</h2>
        <p>Your solar panel requires immediate attention:</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid ${statusColor};">
          <p><strong>Brand:</strong> ${panelData.brand}</p>
          <p><strong>Capacity:</strong> ${panelData.capacity_kw} kW</p>
          <p><strong>Location:</strong> ${panelData.location}</p>
          <p><strong>Installation Date:</strong> ${new Date(panelData.installation_date).toLocaleDateString()}</p>
          <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${isExpired ? 'EXPIRED' : 'NEAR EXPIRY'}</span></p>
          <p><strong>Estimated Waste:</strong> ${panelData.estimatedWasteKg()} kg</p>
        </div>
        <p>${isExpired ? 'This panel has expired and should be recycled immediately.' : 'Please plan for recycling within the next 2 years.'}</p>
        <div style="margin: 20px 0;">
          <a href="http://localhost:3000/recycler-directory" style="display: inline-block; background: #2d9c5e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-right: 10px;">Find Recyclers</a>
          <a href="http://localhost:3000/dashboard" style="display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">View Dashboard</a>
        </div>
        <p style="font-size: 12px; color: #666; margin-top: 30px;">This is an automated alert from Solar Recycle Platform. You receive this because you have panels approaching end-of-life.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error };
  }
}

// Send welcome email
async function sendWelcomeEmail(userEmail, username) {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@solarrecycle.com',
    to: userEmail,
    subject: '🌞 Welcome to Solar Recycle Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d9c5e;">Welcome ${username}!</h2>
        <p>Thank you for joining Solar Recycle Platform.</p>
        <p>Start tracking your solar panels and get automated expiry alerts.</p>
        <a href="http://localhost:3000/dashboard" style="display: inline-block; background: #2d9c5e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Go to Dashboard</a>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error };
  }
}

// Send batch expiry summary email
async function sendBatchExpiryAlert(userEmail, username, expiringPanels) {
  const totalWaste = expiringPanels.reduce((sum, p) => sum + p.estimatedWasteKg(), 0);
  const expiredCount = expiringPanels.filter(p => p.expiryStatus() === 'expired').length;
  const nearExpiryCount = expiringPanels.filter(p => p.expiryStatus() === 'near_expiry').length;
  
  const panelsList = expiringPanels.map(panel => {
    const daysLeft = Math.ceil((panel.expiryDate() - new Date()) / (24 * 60 * 60 * 1000));
    const statusText = daysLeft < 0 ? 'EXPIRED' : `${daysLeft} days left`;
    const statusColor = daysLeft < 0 ? '#dc3545' : '#ffc107';
    
    return `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px;">${panel.brand}</td>
        <td style="padding: 10px;">${panel.capacity_kw} kW</td>
        <td style="padding: 10px;">${panel.location}</td>
        <td style="padding: 10px; color: ${statusColor}; font-weight: bold;">${statusText}</td>
      </tr>
    `;
  }).join('');
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@solarrecycle.com',
    to: userEmail,
    subject: `⚠️ ${expiringPanels.length} Solar Panel${expiringPanels.length > 1 ? 's' : ''} Need Attention`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Solar Panel Expiry Summary</h2>
        <p>Hello ${username},</p>
        <p>You have <strong>${expiringPanels.length}</strong> solar panel${expiringPanels.length > 1 ? 's' : ''} that need attention:</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p><strong>Summary:</strong></p>
          <ul>
            <li>Expired panels: <span style="color: #dc3545;">${expiredCount}</span></li>
            <li>Near expiry panels: <span style="color: #ffc107;">${nearExpiryCount}</span></li>
            <li>Total estimated waste: <strong>${totalWaste} kg</strong></li>
          </ul>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #e9ecef;">
              <th style="padding: 12px; text-align: left;">Brand</th>
              <th style="padding: 12px; text-align: left;">Capacity</th>
              <th style="padding: 12px; text-align: left;">Location</th>
              <th style="padding: 12px; text-align: left;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${panelsList}
          </tbody>
        </table>
        
        <div style="margin: 30px 0;">
          <a href="http://localhost:3000/recycler-directory" style="display: inline-block; background: #2d9c5e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-right: 10px;">Find Recyclers</a>
          <a href="http://localhost:3000/dashboard" style="display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">View Dashboard</a>
        </div>
        
        <p style="font-size: 12px; color: #666; margin-top: 30px;">This is an automated weekly summary from Solar Recycle Platform.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error };
  }
}

module.exports = { sendExpiryAlert, sendWelcomeEmail, sendBatchExpiryAlert };
