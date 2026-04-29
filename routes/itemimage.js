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

// <img src="주소" />
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

export default router;