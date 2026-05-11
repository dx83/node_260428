import express from 'express';
import pool from '../db.js';
import { verifyToken } from '../auth.js';
const router = express.Router();

// 1. 주문하기
// 127.0.0.1:8081/api/purchase/add.do
// body => { "code": 123, "cnt": 123 }
router.post('/add.do', verifyToken, async (req, res) => {
    try {
        const { code, cnt } = req.body;
        const email = req.customer.email;
        const sql = "INSERT INTO purchase (email, code, cnt) values(?, ?, ?)";
        const [result] = await pool.query(sql, [email, code, Number(cnt)]);
        if (result.affectedRows == 1) {
            return res.send({ result: 1 });
        }
        else {
            return res.send({ result: 0 });
        }
    }
    catch (err) {
        console.error(err);
        return res.status(500).send({ err: err });
    }
});

// 2. 주문목록
// 127.0.0.1:8081/api/purchase/list.do
// token은 헤더에서 보내줌 여기서 이메일은 추출함
router.get('/list.do', verifyToken, async (req, res) => {
    try {
        const email = req.customer.email;
        const sql = "SELECT * FROM purchase_view WHERE email=? order by no desc";
        const [result] = await pool.query(sql, [email]);
        return res.send({ result: result, status: 200 });
    }
    catch (err) {
        console.error(err);
        return res.send({ status: 500, err: err });
    }
});


export default router;