import express from 'express';
const router = express.Router();
import pool from '../db.js';

// postman post => 127.0.0.1:8081/api/board/insert.json send하기
// postman body => { "title":"제목", "content":"내용", "writer":"글쓴이"}
router.post("/insert.json", async (req, res) => {
    try {
        const { title, content, writer } = req.body;
        const sql = 'insert into board(title, content, writer) values(?, ?, ?)';
        const result = await pool.query(sql, [title, content, writer]);
        //console.log(req.body);  // cmd에 나옴
        return res.send({ result: result[0] });
    }
    catch (err) {
        return res.send({ err: err });
    }
});

// postman GET => 127.0.0.1:8081/api/board/selectList.json
router.get("/selectlist.json", async (req, res) => {
    try {
        const sql = 'select b.* from board b';
        const [result] = await pool.query(sql);
        //console.log(result);
        return res.send({ result: result });
    }
    catch (err) {
        return res.send({ err: err });
    }
});

// postman put => 127.0.0.1:8081/api/board/updateone.json?no=5
// body => {"title":"제목변경", "content":"변경내용", "writer":"변경자"}
router.put("/updateone.json", async (req, res) => {
    try {
        const { no } = req.query;
        const { title, content, writer } = req.body;
        const sql = 'update board set title=?, content=?, writer=? where no=?';
        const [result] = await pool.query(sql, [title, content, writer, no]);
        //console.log(result);
        return res.send({ result: result });
    }
    catch (err) {
        return res.status(500).send({ err: err });
    }
});

// postman delete => 127.0.0.1:8080/api/board/deleteone.json
router.delete('/deleteone.json', async (req, res) => {
    try {
        //const sql = 'delete from board order by no desc limit 1;';
        const {no} = req.body;
        const sql = 'delete from board where no=?';
        const [result] = await pool.query(sql, [no]);
        //console.log(result);
        return res.send({ result: result });
    }
    catch (err) {
        return res.status(500).send({ err: err });
    }
});


export default router;