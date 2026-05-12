import jwt from 'jsonwebtoken';
const JWT_SECRET = 'dl8tn@als8!#a_ajr2@tqlwEKL34132'; // 임의로 설정

// access token 검증
const verifyToken = (req, res, next) => {
    // const headers = { "Authorization" : "Bearer <token>" }
    // "Bearer <token>" 공백으로 분할해서 두번째 요소를 토큰으로 사용
    // [0] Bearer [1] <token>
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).send({ result: 0, message: '토큰이 없습니다.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.customer = decoded;
        next(); // 다음 미들웨어로 넘어감
    }
    catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).send({result:0, message:'토큰이 만료되었습니다.'});
        }
        else if (err.name === 'JsonWebTokenError') {
            return res.status(401).send({result:0, message:'유효하지 않은 토큰입니다.'});
        }
        return res.status(401).send({ result: 0, message: '토큰 검증 실패' });
    }
}

// 토큰 갱신을 위한 refresh token 검증
const verifyRefreshToken = (refreshToken) => {
    let decoded;
    try {
        decoded = jwt.verify(refreshToken, JWT_SECRET);
        return decoded;
    }
    catch (err) {
        console.log(err);
        return null;
    }
}

const generateAccessToken = (customer) => {
    return jwt.sign(customer, JWT_SECRET, { expiresIn: '1h' });
}

const generateRefreshToken = (customer) => {
    return jwt.sign(customer, JWT_SECRET, { expiresIn: '7d' });
}

export { verifyToken, generateAccessToken, generateRefreshToken, verifyRefreshToken };