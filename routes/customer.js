import bcrypt from 'bcrypt';
import express from 'express';
const router = express.Router();
import pool from '../db.js';

// 회원가입
// postman post => 127.0.0.1:8081/api/customer/join.do
// body => { "email":"db@db.com", "name":"대박이", "password":"db", "phone":"010-1234-5678" }
//router.post('/join.do', async (req, res) => {
//    try {
//        const { email, name, password, phone } = req.body;
//        const sql = 'INSERT INTO customer (email, name, password, phone) VALUES (?,?,?,?)';
//        const [result] = await pool.query(sql, [email, name, password, phone]);
//        return res.send({ result: result, status: 200 });
//    }
//    catch (err) {
//        return res.status(500).send({ err: err });
//    }
//})
// bcrypt 단방향, salt 값은 랜덤값으로
// { "email":"abc@abc.com", "name":"ABC", "password":"1234", "phone":"010-0000-4321" }
router.post('/join.do', async (req, res) => {
    try {
        const { email, name, password, phone } = req.body;
        const hashPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO customer (email, name, password, phone) VALUES (?,?,?,?)';
        const [result] = await pool.query(sql, [email, name, hashPassword, phone]);
        return res.send({ result: result, status: 200 });
    }
    catch (err) {
        return res.status(500).send({ err: err });
    }
});

// 로그인 post
// 127.0.0.1:8081/api/customer/login.do
// body => { "email": "db@db.com", "password":"db" }
// body => { "email": "abc@abc.com", "password":"1234" }
router.post('/login.do', async (req, res) => {
    try {
        const { email, password } = req.body;
        const sql = 'SELECT c.email, c.password, c.name FROM customer c WHERE email=?';
        const [result] = await pool.query(sql, [email]);
        console.log(result);
        if (result.length === 1) {
            if (await bcrypt.compare(password, result[0].password)) {
                return res.send({ result: 1 });
            }
        }
        return res.send({ result: 0 });
    }
    catch (err) {
        console.error(err);
        return res.status(500).send({ err: err });
    }
});

// 개발자 전용 코드 : 암호되지 않은 모든 비밀번호 암호화시키는 코드
// 127.0.0.1:8081/api/customer/migratePasswords.do
router.post('/migratePasswords.do', async (req, res) => {
    try {
        // 1. 모든 사용자의 이메일과 현재 비밀번호를 가져옴
        const [users] = await pool.query('SELECT email, password FROM customer');
        
        let updateCount = 0;

        // 2. 각 사용자별로 비밀번호 해싱 및 업데이트 진행
        for (const user of users) {
            // 이미 해싱된 비밀번호인지 체크 ($2b$로 시작하면 보통 bcrypt 암호문임)
            if (user.password == null || user.password.startsWith('$2b$')) continue;

            const hashPassword = await bcrypt.hash(user.password, 10);
            const updateSql = 'UPDATE customer SET password = ? WHERE email = ?';
            await pool.query(updateSql, [hashPassword, user.email]);
            updateCount++;
        }

        return res.send({ 
            message: "마이그레이션 완료", 
            totalProcessed: users.length,
            updatedCount: updateCount,
            status: 200 
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).send({ err: err.message });
    }
});


export default router;