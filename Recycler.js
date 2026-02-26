const { readDB, writeDB } = require('../db');

class Recycler {
  static find(query = {}) {
    const db = readDB();
    let recyclers = db.recyclers.filter(r => r.verified);
    
    if (query.location) {
      recyclers = recyclers.filter(r => 
        r.location.toLowerCase().includes(query.location.toLowerCase())
      );
    }
    
    if (query.service_type) {
      recyclers = recyclers.filter(r => 
        r.service_type === query.service_type || r.service_type === 'both'
      );
    }
    
    return recyclers;
  }

  static seed() {
    const db = readDB();
    if (db.recyclers.length === 0) {
      db.recyclers = [
        {
          id: '1',
          name: 'Green Solar Recycling',
          contact_number: '+1-555-0101',
          email: 'contact@greensolar.com',
          location: 'New York',
          service_type: 'both',
          verified: true
        },
        {
          id: '2',
          name: 'EcoPanel Solutions',
          contact_number: '+1-555-0202',
          email: 'info@ecopanel.com',
          location: 'California',
          service_type: 'recycling',
          verified: true
        }
      ];
      writeDB(db);
    }
  }
}

module.exports = Recycler;
