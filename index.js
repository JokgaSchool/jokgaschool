const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const { swaggerSetup, swaggerDocs } = require('./swagger-config');
const { connectToDatabase } = require('./models/db');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
require('dotenv').config();

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const port = 3001;

connectToDatabase();

// 미들웨어 설정
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 14 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'Strict'
    }
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'client/build')));

app.use('/dev-tools/docs/api_1zKdf3*Fk', swaggerSetup, swaggerDocs);

app.use('/api', userRoutes);
app.use('/api', postRoutes);
app.use('/api', commentRoutes);

// catch-all 핸들러
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Socket 설정
// require('./socket')(io);


http.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
