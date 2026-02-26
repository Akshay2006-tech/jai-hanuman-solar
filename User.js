const bcrypt = require('bcryptjs');
const { readDB, writeDB } = require('../db');

class User {
  static async create(data) {
    const db = readDB();
    const user = {
      id: Date.now().toString(),
      username: data.username,
      email: data.email,
      password: await bcrypt.hash(data.password, 10),
      created_at: new Date()
    };
    db.users.push(user);
    writeDB(db);
    return user;
  }

  static findOne(query) {
    const db = readDB();
    return db.users.find(u => u.username === query.username || u.id === query.id);
  }

  static async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }
}

module.exports = User;
