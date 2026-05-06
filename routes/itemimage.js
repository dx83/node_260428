import express from 'express';
const router = express.Router();
import pool from '../db.js';
import multer from 'multer';

// 파일의 저장방식 DB추가시 메모리, 파일저장경로설정
const storage = multer.memoryStorage();
// 업로드 설정
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

// 물품이미지등록 post
// 127.0.0.1:8081/api/itemimage/insert.do
// { "code":4, "image":"파일첨부" }
router.post("/insert.do", upload.single("image"), async (req, res) => {
    try {
        console.log(req.body);
        console.log(req.file);
        const data = [req.body.code, req.file.originalname, req.file.mimetype, req.file.size, req.file.buffer];

        const sql = "INSERT INTO itemimage(code, imagename, imagetype, imagesize, imagedata) VALUES(?,?,?,?,?)"
        const [result] = await pool.query(sql, data);

        return res.send({ result: result });
    }
    catch (err) {
        console.error(err);
        return res.status(500).send({ err: err })
    }
});

// <img src="주소" /> 이미지 가져오기
// 127.0.0.1:8081/api/itemimage/image.do?no=51
router.get("/image.do", async (req, res) => {
    try {
        const { no } = req.query;
        const sql = "SELECT * FROM itemimage WHERE no=?";
        const [result] = await pool.query(sql, [no]);
        res.contentType(result[0].imagetype);
        return res.send(result[0].imagedata); // return 생략 가능
    }
    catch (err) {
        return res.status(500).send({ err: err }); // return 생략 가능
    }
});

// 물품별 이미지 목록
// 127.0.0.1:8081/api/itemimage/list.do?code=14
router.get("/list.do", async (req, res) => {
    try {
        const { code } = req.query;
        const sql = `SELECT no FROM itemimage WHERE code=?`;
        const [result] = await pool.query(sql, [code]);

        let rows = [];
        for (let obj of result) {
            rows.push({
                src: `/api/itemimage/image.do?no=${obj.no}`
            })
        }

        return res.send({ result: rows });
    }
    catch (err) {
        console.error(err);
        return res.status(500).send({ err: err });
    }
});

// 물품 이미지 1개 삭제 (이미지 번호 사용)
// 127.0.0.1:8081/api/itemimage/delete.do
// body => { "no": 56 }
router.delete("/delete.do", async (req, res) => {
    try {
        const { no } = req.body;
        const sql = `DELETE FROM itemimage WHERE no=?`;
        const [result] = await pool.query(sql, [no]);
        return res.send({ result: result });
    }
    catch (err) {
        console.error(err);
        return res.status(500).send({ err: err });
    }
});

// 물품 이미지 1개 변경
// 127.0.0.1:8081/api/itemimage/update.do
// body => { "no": 123, "image":"파일첨부" }
router.put("/update.do", upload.single("image"), async(req, res)=>{
    try {
        const { no } = req.body;
        const sql = `UPDATE itemimage SET imagename=?, imagetype=?, imagesize=?, imagedata=?
                        WHERE no=?`;
        const [result] = await pool.query(sql, 
            [req.file.originalname, req.file.mimetype, req.file.size, req.file.buffer, no]);
        return res.send({ result: result});
    }
    catch (err) {
        console.error(err);
        return res.status(500).send({ err: err });
    }
});

export default router;