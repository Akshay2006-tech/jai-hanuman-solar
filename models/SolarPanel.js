const { readDB, writeDB } = require('../db');

class SolarPanel {
  static create(data) {
    const db = readDB();
    const panel = {
      id: Date.now().toString(),
      user: data.user,
      installation_date: new Date(data.installation_date),
      brand: data.brand,
      capacity_kw: parseFloat(data.capacity_kw),
      location: data.location,
      serial_number: data.serial_number || '',
      created_at: new Date()
    };
    db.panels.push(panel);
    writeDB(db);
    return this.hydrate(panel);
  }

  static find(query) {
    const db = readDB();
    const panels = db.panels.filter(p => p.user === query.user);
    return panels.map(p => this.hydrate(p));
  }

  static findOneAndDelete(query) {
    const db = readDB();
    const index = db.panels.findIndex(p => p.id === query.id && p.user === query.user);
    if (index > -1) {
      db.panels.splice(index, 1);
      writeDB(db);
    }
  }

  static hydrate(data) {
    data.installation_date = new Date(data.installation_date);
    data.calculatedAge = function() {
      const today = new Date();
      const delta = today - this.installation_date;
      return delta / (365.25 * 24 * 60 * 60 * 1000);
    };
    data.expiryYear = function() {
      return this.installation_date.getFullYear() + 25;
    };
    data.expiryDate = function() {
      const expiry = new Date(this.installation_date);
      expiry.setFullYear(expiry.getFullYear() + 25);
      return expiry;
    };
    data.remainingLifePercentage = function() {
      const age = this.calculatedAge();
      return Math.max(0, ((25 - age) / 25) * 100);
    };
    data.expiryStatus = function() {
      const today = new Date();
      const expiry = this.expiryDate();
      const daysLeft = (expiry - today) / (24 * 60 * 60 * 1000);
      if (daysLeft < 0) return 'expired';
      if (daysLeft < 730) return 'near_expiry';
      return 'safe';
    };
    data.estimatedWasteKg = function() {
      return this.capacity_kw * 75;
    };
    return data;
  }
}

module.exports = SolarPanel;
