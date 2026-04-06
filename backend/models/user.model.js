const pool = require('../config/db');

class User {
  static async create(userData) {
    const { name, email, password, role } = userData;
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, email, password, role]
    );
    return rows[0].id;
  }

  static async findByEmail(email) {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0];
  }

  static async findById(id) {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0];
  }

  static async updateProfile(id, profileData) {
    const { name, profile_pic, resume_url, skills, bio } = profileData;
    await pool.query(
      'UPDATE users SET name = $1, profile_pic = $2, resume_url = $3, skills = $4, bio = $5 WHERE id = $6',
      [name, profile_pic, resume_url, skills, bio, id]
    );
  }
}

module.exports = User;