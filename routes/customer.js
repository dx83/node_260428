import bcrypt from 'bcrypt';
import express from 'express';
const router = express.Router();
import pool from '../db.js';
import { verifyToken, generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../auth.js'


// 9. 토큰 생성 access(30m), refresh(8h) 생성
// access token 갱신 post
// 127.0.0.1:8081/api/customer/refreshToken.do
// body => { "refreshToken": "..."}
router.post('/refreshToken.do', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        console.log('RefreshToken.do', refreshToken);

        const decode = verifyRefreshToken(refreshToken);
        console.log('/refreshToken.do', decode);    // 로그인할 때 email, name을 저장했음
        const accessToken = generateAccessToken({ email: decode.email, name: decode.name });
        return res.send({ result: 1, accessToken: accessToken, refreshToken: refreshToken });
    }
    catch (err) {
        console.error(err);
        return res.send({ result: 0, status: 401, message: "유효하지 않은 토큰입니다." });
    }
});

// 8. 고객 정보 반환
// 127.0.0.1:8081/api/customer/info.do
// token은 헤더에서 보내줌 여기서 이메일은 추출함
router.get('/info.do', verifyToken, async (req, res) => {
    try {
        const sql = 'SELECT c.email, c.name, c.phone FROM customer c WHERE c.email=?';
        const [result] = await pool.query(sql, [req.customer.email]);
        return res.send({ result: result, status: 200 });
    }
    catch (err) {
        console.error(err);
        return res.status(500).send({ err: err });
    }
});

// 7. 화원칼퇴 put
// 회원과 연결된 데이터를 보존하기위해 실제 DELETE를 하지 않고 NULL로 처리
// 127.0.0.1:8081/api/customer/delete.do
// body => { "password": "a1"}
router.put('/delete.do', verifyToken, async (req, res) => {
    try {
        const { password } = req.body;
        // 토큰에서 추출한것
        const email = req.customer.email;

        const sql = 'SELECT password FROM customer WHERE email=?';
        const [result] = await pool.query(sql, [email]);
        if (result.length === 1) {
            if (await bcrypt.compare(password, result[0].password)) {
                const sql1 = 'UPDATE customer SET password=null, name=null, ' +
                    'phone=null WHERE email=?';
                const [result1] = await pool.query(sql1, [email]);
                return res.send({ result: result1, status: 200 });
            }
        }
        return res.send({ result: 0 });
    }
    catch (err) {
        console.error(err);
        return res.send({ status: -1, err: err });
    }
});

// 6. 암호변경 put
// 127.0.0.1:8081/api/customer/password.do
// body => { "password": "a1", "newPassword": "변경" }
// token은 헤더에서 보내줌 여기서 이메일은 추출함
router.put('/password.do', verifyToken, async (req, res) => {
    try {
        const { password, newPassword } = req.body;
        // 토큰에서 추출한 것
        const email = req.customer.email;
        // 이메일을 이용하여 DB에서 현재 패스워드 가져오기
        const sql = 'SELECT password FROM customer WHERE email=?';
        const [result] = await pool.query(sql, [email]);
        // 입력된 password와 DB에서 가져온 패스워드 비교
        if (result.length === 1) {
            if (await bcrypt.compare(password, result[0].password)) {
                // 변경된 비밀번호를 hash 하기
                const hashNewPassword = await bcrypt.hash(newPassword, 10);
                const sql1 = 'UPDATE customer SET password=? WHERE email=?';
                const [result1] = await pool.query(sql1, [hashNewPassword, email]);
                return res.send({ result: result1, status: 200 })
            }
        }
        return res.send({ result: 0 });
    }
    catch (err) {
        console.error(err);
        return res.send({ status: -1, err: err });
    }
});

// 5. 회원 정보 변경 put
// 127.0.0.1:8081/api/customer/update.do
// body { "name":"변경할이름", "phone":"010-7777-7777"}
// token은 헤더에서 보내줌 여기서 이메일은 추출함
router.put('/update.do', verifyToken, async (req, res) => {
    try {
        //console.log(req.customer);
        const sql = 'UPDATE customer SET name=?, phone=? WHERE email=?'
        const [result] = await pool.query(sql,
            [req.body.name, req.body.phone, req.customer.email]);
        return res.send({ result: 1, status: 200 });
    }
    catch (err) {
        console.error(err);
        return res.status(500).send({ err: err });
    }
});


// 1.회원가입
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
// 3. 회원가입 암호 난수화 : bcrypt 단방향, salt 값은 랜덤값으로
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

// 2.로그인 post
// 127.0.0.1:8081/api/customer/login.do
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
// 4. 로그인에 토큰 적용 127.0.0.1:8081/api/customer/login_token.do
// post body raw json => { "email": "a@a.com", "password":"1234" }
//router.post('/login_token.do', async (req, res) => {
//    try {
//        const { email, password } = req.body;
//        const sql = 'SELECT c.email, c.password, c.name FROM customer c WHERE email=?';
//        const [result] = await pool.query(sql, [email]);
//        console.log(result);
//        if (result.length === 1) {  // 이메일 일치
//            if (await bcrypt.compare(password, result[0].password)) { // 암호 일치
//                // accessToken 발급 만료시간을 짧게 이메일과 이름을 토큰에 포함시킴
//                const accessToken = jwt.sign( // 이메일,이름,임의생성난수,만료기간까지 섞어서 토큰 생성
//                    { email: result[0].email, name: result[0].name }
//                    , JWT_SECRET
//                    , {
//                        expiresIn: '1h'
//                    }
//                );
//                // refreshToken발급 보안상 만료시간을 길게
//                const refreshToken = jwt.sign(
//                    { email: result[0].email, name: result[0].name }
//                    , JWT_SECRET
//                    , {
//                        expiresIn: '7d'
//                    }
//                );
//                return res.send({ result: 1, accessToken: accessToken, refreshToken: refreshToken });
//            }
//        }
//        return res.send({ result: 0 });
//    }
//    catch (err) {
//        console.error(err);
//        return res.status(500).send({ err: err });
//    }
//});
router.post('/login_token.do', async (req, res) => {
    try {
        const { email, password } = req.body;
        const sql = 'SELECT c.email, c.password, c.name FROM customer c WHERE email=?';
        const [result] = await pool.query(sql, [email]);
        console.log(result);
        if (result.length === 1) {  // 이메일 일치
            if (await bcrypt.compare(password, result[0].password)) { // 암호 일치
                const customer = { email: result[0].email, name: result[0].name };
                // accessToken 발급 만료시간을 짧게 이메일과 이름을 토큰에 포함시킴
                const accessToken = generateAccessToken(customer);
                // refreshToken발급 보안상 만료시간을 길게
                const refreshToken = generateRefreshToken(customer);
                return res.send({ result: 1, accessToken: accessToken, refreshToken: refreshToken });
            }
        }
        return res.send({ result: 0 });
    }
    catch (err) {
        console.error(err);
        return res.status(500).send({ err: err });
    }
});


// 1번외.개발자 전용 코드 : 암호되지 않은 모든 비밀번호 암호화시키는 코드
// 127.0.0.1:8081/api/customer/migratePasswords.do
//router.post('/migratePasswords.do', async (req, res) => {
//    try {
//        // 1. 모든 사용자의 이메일과 현재 비밀번호를 가져옴
//        const [users] = await pool.query('SELECT email, password FROM customer');
//        
//        let updateCount = 0;
//
//        // 2. 각 사용자별로 비밀번호 해싱 및 업데이트 진행
//        for (const user of users) {
//            // 이미 해싱된 비밀번호인지 체크 ($2b$로 시작하면 보통 bcrypt 암호문임)
//            if (user.password == null || user.password.startsWith('$2b$')) continue;
//
//            const hashPassword = await bcrypt.hash(user.password, 10);
//            const updateSql = 'UPDATE customer SET password = ? WHERE email = ?';
//            await pool.query(updateSql, [hashPassword, user.email]);
//            updateCount++;
//        }
//
//        return res.send({ 
//            message: "마이그레이션 완료", 
//            totalProcessed: users.length,
//            updatedCount: updateCount,
//            status: 200 
//        });
//    }
//    catch (err) {
//        console.error(err);
//        return res.status(500).send({ err: err.message });
//    }
//});
export default router;