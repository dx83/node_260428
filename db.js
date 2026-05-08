import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    // localhost = 127.0.0.1, 실 주소 : 192.168.0.46
    //host: 'host.docker.internal', // docker 내부에서 컨테이너간
    host: '127.0.0.1',
    user: 'root',
    password: '1234',
    database: 'db1',
    port:13306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool;