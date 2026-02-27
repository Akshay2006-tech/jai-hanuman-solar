const mongoose = require('mongoose');

const recyclerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact_number: { type: String, required: true },
  email: { type: String, required: true },
  location: { type: String, required: true },
  service_type: { 
    type: String, 
    enum: ['recycling', 'refurbishing', 'both'],
    required: true 
  },
  verified: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Recycler', recyclerSchema);
