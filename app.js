import express from 'express';
import boardRouter from './routes/board.js';
import customerRouter from './routes/customer.js';
import itemRouter from './routes/item.js';
import itemimageRouter from './routes/itemimage.js';
import purchaseRouter from './routes/purchase.js';  // 4

// 1 =================================================
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const buildPath = path.join(__dirname, './build');
// ===================================================

const app = express();
const port = 8081;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2 =================================================
app.use(express.static(buildPath));
// ===================================================

app.use('/api/board', boardRouter);
app.use('/api/customer', customerRouter);
app.use('/api/item', itemRouter);
app.use('/api/itemimage', itemimageRouter);
app.use('/api/purchase', purchaseRouter); // 4

// 3 =================================================
app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next();
    }
    res.sendFile(path.join(buildPath, 'index.html'));
});
// ===================================================

// postman 에서 초기 연결 확인
//app.get('/', (req, res) => {
//    res.send({ result: 'Hello World!' });
//}); 

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
