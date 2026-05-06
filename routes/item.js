import express from 'express';
const router = express.Router();
import pool from '../db.js';

// 물품등록 post
// 127.0.0.1:8081/api/item/insert.do
// { "name":"컴퓨터", "price":"140000", "detail":"설명", "qty":200, "phone":"010-0002-0000 }
router.post("/insert.do", async (req, res) => {
    try {
        const { name, price, detail, qty, phone } = req.body;
        const sql = 'INSERT INTO item(name, price, detail, qty, phone) VALUES(?,?,?,?,?)';
        const [result] = await pool.query(sql, [name, price, detail, qty, phone]);
        return res.send({ result: result, status: 200 });
    }
    catch (err) {
        return res.send({ err: err });
    }
});

// 물품변경 put
// 127.0.0.1:8081/api/item/update.do?code=5
// body => { "name":"수박", "price":35000, "detail":"씨많은", "qty":111 }
router.put("/update.do", async (req, res) => {
    try {
        const { code } = req.query;
        const { name, price, detail, qty } = req.body;
        const sql = 'UPDATE item SET name=?, price=?, detail=?, qty=? WHERE code=?';
        const [result] = await pool.query(sql, [name, price, detail, qty, code]);
        return res.send({ result: result, statu: 200 });
    }
    catch (err) {
        console.log(err);
        return res.send({ err: err });
    }
});

// 물품1개 삭제
// 127.0.0.1:8081/api/item/delete.do
// { "code":123 }
router.delete("/delete.do", async (req, res) => {
    try {
        //const { code } = req.query; // Params : Key => code / Value => 50
        const { code } = req.body;      // body : row json =? { "code":49}
        const sql = 'DELETE FROM item WHERE code=?';
        const [result] = await pool.query(sql, code);
        return res.send({ result: result, statu: 200 });
    }
    catch (err) {
        console.log(err);
        return res.send({ err: err });
    }
});

// 물품목록조회 get 페이지, 개수, 검색어 필요
// 127.0.0.1:8081/api/item/list.do?page=1&cnt=10&search=
router.get("/list.do", async (req, res) => {
    try {
        const { page, cnt, search } = req.query;
        const sql = `SELECT i.* FROM item i WHERE name LIKE concat("%", ?, "%")
                        OR detail LIKE concat("%", ? "%")
                        ORDER BY code DESC LIMIT ?, ?`;
        const [result] = await pool.query(sql, [
            search, search, (Number(page) - 1) * Number(cnt), Number(cnt)]);

        const sql1 = `SELECT count(*) as cnt FROM item i
                        WHERE name LIKE concat("%", ? "%")
                        OR detail LIKE concat("%", ?, "%")`;
        const [result1] = await pool.query(sql1, [search, search]);
        const total = result1[0].cnt;

        return res.send({ result: result, total: total });
    }
    catch (err) {
        console.error(err);
        return res.status(500).send({ err: err });
    }
});

// 물품 1개 조회 GET
// 127.0.01:8081/api/item/select.do?code=1
router.get("/select.do", async (req, res) => {
    try {
        const { code } = req.query;
        const sql = `SELECT i.* FROM item i WHERE code=?`;
        const [result] = await pool.query(sql, [code]);

        if (result.length == 0) {
            return res.send({ result: result, message: '존재하지 않는 상품입니다.' });
        }
        return res.send({ result: result, status: 200 });
    }
    catch (err) {
        console.error(err);
        return res.status(500).send({ err: err });
    }
});




// 개인 연습용: 고객 비밀번호 모두 난수화하는 코드
// 127.0.0.1:8081/api/item/test.do?email=a@a.com&name=가나다
//router.get("/test.do", async (req, res) => {
//    try {
//        const { email, name } = req.query;
//        const sql = 'SELECT c.password FROM customer c WHERE email=? AND name=?';
//        const [result] = await pool.query(sql, [email, name]);
//        console.log(result);
//        return res.send({ result: result[0], status: 200 });
//    }
//    catch (err) {
//        console.log(err);
//        return res.send({ err: err });
//    }
//});

export default router;