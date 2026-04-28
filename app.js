import express from 'express';
import boardRouter from './routes/board.js';

const app = express();
const port = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/board', boardRouter);

// postman 에서 초기 연결 확인
//app.get('/', (req, res) => {
//    res.send({ result: 'Hello World!' });
//}); 

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
