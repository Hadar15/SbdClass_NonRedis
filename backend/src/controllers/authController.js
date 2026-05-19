import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Semua kolom wajib diisi' });
        }
        const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rowCount && existingUser.rowCount > 0) {
            return res.status(400).json({ error: 'Email sudah terdaftar' });
        }
        // Validate role
        const finalRole = (role === 'SELLER' || role === 'BUYER') ? role : 'BUYER';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const userResult = await query('INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES ($1, $2, $3, $4, now(), now()) RETURNING id, name, email, role', [name, email, hashedPassword, finalRole]);
        const user = userResult.rows[0];
        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            message: 'Registrasi berhasil',
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
};
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email dan password wajib diisi' });
        }
        const userResult = await query('SELECT id, name, email, role, password FROM users WHERE email = $1', [email]);
        if (userResult.rowCount === 0) {
            return res.status(401).json({ error: 'Email atau password salah' });
        }
        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Email atau password salah' });
        }
        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            message: 'Login berhasil',
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
};
//# sourceMappingURL=authController.js.map