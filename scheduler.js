const cron = require('node-cron');
const { checkAndSendExpiryAlerts } = require('./emailService');

// Schedule expiry alert check to run daily at 9:00 AM
function startScheduler() {
  console.log('Starting email scheduler...');
  
  // Run daily at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('Running scheduled expiry alert check...');
    try {
      await checkAndSendExpiryAlerts();
      console.log('Scheduled expiry alert check completed successfully');
    } catch (error) {
      console.error('Scheduled expiry alert check failed:', error);
    }
  });
  
  // Run weekly summary on Mondays at 10:00 AM
  cron.schedule('0 10 * * 1', async () => {
    console.log('Running weekly expiry summary...');
    try {
      await checkAndSendExpiryAlerts();
      console.log('Weekly expiry summary completed successfully');
    } catch (error) {
      console.error('Weekly expiry summary failed:', error);
    }
  });
  
  console.log('Email scheduler started successfully');
}

module.exports = { startScheduler };