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
//router.get("/selectlist.json", async (req, res) => {
//    try {
//        const sql = 'select b.* from board b';
//        const [result] = await pool.query(sql);
//        //console.log(result);
//        return res.send({ result: result });
//    }
//    catch (err) {
//        return res.send({ err: err });
//    }
//});
// GET => 127.0.0.1:8081/api/board/selectList.json?page=1&size=10&text=
router.get("/selectlist.json", async (req, res) => {
    try {
        // page와 size를 받아서 변수에 보관
        const { page, size, text } = req.query;

        const sql = 'select b.* from board b where title like concat("%",?,"%") order by no desc limit ?, ?'; // no : 컬럼명
        const [result] = await pool.query(sql, [text, (Number(page) - 1) * Number(size), Number(size)]);

        // 총 게시물 개수
        const sql2 = 'select count(*) as cnt from board where title like concat("%",?,"%")';
        const [result2] = await pool.query(sql2, [text]);
        const totalCount = result2[0].cnt;

        //console.log(result2[0].cnt);
        return res.send({ result: result, totalCount: totalCount });
    }
    catch (err) {
        console.error(err);
        return res.send({ err: err });
    }
});

// 게시판 글 상세, 조회수 증가
// 127.0.0.1:8081/api/board/selectone.json?no=5
router.get('/selectone.json', async (req, res) => {
    try {
        const { no } = req.query;

        const sql1 = "update board set hit = hit+1 where no=?"
        await pool.query(sql1, [no]);

        //const [result] = await pool.query(sql1, [no]);
        //if (result1.effectedRows == 0) {
        //    return res.send({ result1, message: '존재하지 않은 글입니다.'});
        //}

        const sql = 'select * from board where no=?';
        const [result] = await pool.query(sql, [no]);
        //console.log(result);
        return res.send({ result: result });
    }
    catch (err) {
        return res.status(500).send({ err: err });
    }
});

// 이전글
// 127.0.0.1:8081/api/board/prev.json?no=5
router.get('/prev.json', async (req, res) => {
    try {
        const { no } = req.query;
        const sql = 'select * from board where no < ? order by no desc limit 1';
        const [result] = await pool.query(sql, [no]);
        //console.log(result);
        return res.send({ result: result });
    }
    catch (err) {
        return res.status(500).send({ err: err });
    }
});

// 다음글
// 127.0.0.1:8081/api/board/next.json?no=5
router.get('/next.json', async (req, res) => {
    try {
        const { no } = req.query;
        const sql = 'select * from board where no > ? order by no asc limit 1';
        const [result] = await pool.query(sql, [no]);
        //console.log(result);
        return res.send({ result: result });
    }
    catch (err) {
        return res.status(500).send({ err: err});
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
        console.error(err);
        return res.status(500).send({ err: err });
    }
});

// postman delete => 127.0.0.1:8080/api/board/deleteone.json
router.delete('/deleteone.json', async (req, res) => {
    try {
        //const sql = 'delete from board order by no desc limit 1;';
        const { no } = req.body;
        const sql = 'delete from board where no=?';
        const [result] = await pool.query(sql, [no]);
        //console.log(result);
        return res.send({ result: result });
    }
    catch (err) {
        console.error(err);
        return res.status(500).send({ err: err });
    }
});


export default router;