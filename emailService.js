const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const fromEmail = process.env.FROM_EMAIL || 'noreply@solarrecycle.com';
const adminEmail = process.env.ADMIN_EMAIL;

// Send admin notification when new user registers
async function sendAdminNotification(userData) {
  if (!adminEmail) return { success: false, error: 'Admin email not configured' };
  
  const msg = {
    to: adminEmail,
    from: fromEmail,
    subject: '🎉 New User Registration - Solar Recycle Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d9c5e;">New User Registered!</h2>
        <p>A new user has registered on your Solar Recycle Platform:</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p><strong>Username:</strong> ${userData.username}</p>
          <p><strong>Email:</strong> ${userData.email}</p>
          <p><strong>Full Name:</strong> ${userData.full_name || 'Not provided'}</p>
          <p><strong>Registration Date:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p style="font-size: 12px; color: #666; margin-top: 30px;">This is an automated notification from Solar Recycle Platform.</p>
      </div>
    `
  };
  
  try {
    await sgMail.send(msg);
    console.log('Admin notification sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Admin notification error:', error);
    return { success: false, error };
  }
}

// Send expiry alert email
async function sendExpiryAlert(userEmail, panelData) {
  const daysLeft = Math.ceil((panelData.expiryDate() - new Date()) / (24 * 60 * 60 * 1000));
  const isExpired = daysLeft < 0;
  const statusColor = isExpired ? '#dc3545' : '#ffc107';
  
  const msg = {
    to: userEmail,
    from: fromEmail,
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
        <p style="font-size: 12px; color: #666; margin-top: 30px;">This is an automated alert from Solar Recycle Platform.</p>
      </div>
    `
  };
  
  try {
    await sgMail.send(msg);
    console.log('Expiry alert sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Expiry alert error:', error);
    return { success: false, error };
  }
}

// Send welcome email
async function sendWelcomeEmail(userEmail, username) {
  console.log(`Attempting to send welcome email to: ${userEmail}`);
  
  if (!userEmail) {
    console.error('No email provided for welcome email');
    return { success: false, error: 'No email provided' };
  }
  
  const msg = {
    to: userEmail,
    from: fromEmail,
    subject: '🌞 Welcome to Solar Recycle Platform - Registration Successful!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d9c5e;">Welcome to Solar Recycle Platform, ${username}!</h2>
        <p>Thank you for registering with us! Your account has been successfully created.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #2d9c5e; margin-top: 0;">What you can do now:</h3>
          <ul style="line-height: 1.6;">
            <li>📊 Track your solar panels and monitor their lifecycle</li>
            <li>⚠️ Get automated expiry alerts before panels need recycling</li>
            <li>🔍 Find verified recyclers in your area</li>
            <li>📈 View waste estimates and environmental impact</li>
          </ul>
        </div>
        
        <div style="margin: 30px 0;">
          <a href="http://localhost:3000/dashboard" style="display: inline-block; background: #2d9c5e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-right: 10px;">Go to Dashboard</a>
          <a href="http://localhost:3000/add-panel" style="display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Add Your First Panel</a>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">Need help? Check out our <a href="http://localhost:3000/how-it-works" style="color: #2d9c5e;">How It Works</a> guide or <a href="http://localhost:3000/contact" style="color: #2d9c5e;">contact us</a>.</p>
        <p style="font-size: 12px; color: #666;">This is an automated welcome email from Solar Recycle Platform.</p>
      </div>
    `
  };
  
  try {
    await sgMail.send(msg);
    console.log('Welcome email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Welcome email error:', error);
    return { success: false, error };
  }
}

// Check and send expiry alerts for all users
async function checkAndSendExpiryAlerts() {
  const User = require('./models/UserMongo');
  const SolarPanel = require('./models/SolarPanelMongo');
  
  try {
    console.log('Starting expiry alert check...');
    const users = await User.find({});
    
    for (const user of users) {
      const panels = await SolarPanel.find({ user: user._id });
      const expiringPanels = panels.filter(panel => {
        const status = panel.expiryStatus();
        return status === 'near_expiry' || status === 'expired';
      });
      
      if (expiringPanels.length > 0) {
        console.log(`Found ${expiringPanels.length} expiring panels for user ${user.username}`);
        
        for (const panel of expiringPanels) {
          await sendExpiryAlert(user.email, panel);
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay between emails
        }
      }
    }
    
    console.log('Expiry alert check completed');
    return { success: true };
  } catch (error) {
    console.error('Expiry alert check error:', error);
    return { success: false, error };
  }
}

module.exports = { 
  sendExpiryAlert, 
  sendWelcomeEmail, 
  sendAdminNotification, 
  checkAndSendExpiryAlerts 
};
