const mongoose = require('mongoose');

const solarPanelSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  installation_date: { type: Date, required: true },
  brand: { type: String, required: true },
  capacity_kw: { type: Number, required: true },
  location: { type: String, required: true },
  serial_number: { type: String },
  created_at: { type: Date, default: Date.now }
});

solarPanelSchema.methods.calculatedAge = function() {
  const today = new Date();
  const delta = today - this.installation_date;
  return delta / (365.25 * 24 * 60 * 60 * 1000);
};

solarPanelSchema.methods.expiryYear = function() {
  return this.installation_date.getFullYear() + 25;
};

solarPanelSchema.methods.expiryDate = function() {
  const expiry = new Date(this.installation_date);
  expiry.setFullYear(expiry.getFullYear() + 25);
  return expiry;
};

solarPanelSchema.methods.remainingLifePercentage = function() {
  const age = this.calculatedAge();
  return Math.max(0, ((25 - age) / 25) * 100);
};

solarPanelSchema.methods.expiryStatus = function() {
  const today = new Date();
  const expiry = this.expiryDate();
  const daysLeft = (expiry - today) / (24 * 60 * 60 * 1000);
  if (daysLeft < 0) return 'expired';
  if (daysLeft < 730) return 'near_expiry';
  return 'safe';
};

solarPanelSchema.methods.estimatedWasteKg = function() {
  return this.capacity_kw * 75;
};

module.exports = mongoose.model('SolarPanel', solarPanelSchema);
