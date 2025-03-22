const express = require('express');
const path = require('path');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const { connectToDatabase, getUsersCollection } = require('./models/db.js');
const { ObjectId } = require('mongodb');
const userRoutes = require('./routes/userRoutes.js');
const postRoutes = require('./routes/postRoutes.js');
const commentRoutes = require('./routes/commentRoutes.js');
const PingRoutes = require('./routes/PingRoutes.js');
const randomstring = require('randomstring');
require('dotenv').config();

const app = express();
const http = require('http').createServer(app);
const port = process.env.PORT || 3001;

app.set('trust proxy', 1);

(async () => {
    try {
        await connectToDatabase();
    } catch (err) {
        console.error('❌ MongoDB 연결 실패:', err);
        process.exit(1); // 서버 종료
    }
})();

// 미들웨어 설정
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 세션 미들웨어 설정
app.use(
    cookieSession({
        name: 'session',
        keys: [process.env.SECRET_KEY],
        maxAge: 14 * 24 * 60 * 60 * 1000, // 14일
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
    })
);

app.use(express.static(path.join(__dirname, 'client/dist')));

async function generateUniqueUserHandle(usersCollection) {
    let userHandle;
    let isUnique = false;

    while (!isUnique) {
        userHandle = `user-${randomstring.generate({ length: 6, charset: 'numeric' })}`;
        const existingUser = await usersCollection.findOne({ userHandle });
        if (!existingUser) {
            isUnique = true;
        }
    }
    return userHandle;
}

async function generateRandomDisplayName() {
    return `User_${randomstring.generate({ length: 8, charset: 'alphabetic' })}`;
}

// 유저 정보 업데이트 미들웨어
app.use(async (req, res, next) => {
    if (req.session.user && req.session.user.id) {
        try {
            const usersCollection = getUsersCollection();
            if (!usersCollection) throw new Error('MongoDB 연결이 설정되지 않음.');

            const updatedUser = await usersCollection.findOne({ _id: new ObjectId(req.session.user.id) });

            if (!updatedUser) {
                req.session = null; // 세션 삭제
                return res.status(401).json({ error: '세션이 만료되었습니다. 다시 로그인하세요.' });
            }

            // user.DisplayName 없으면 생성
            if (!updatedUser.DisplayName) {
                updatedUser.DisplayName = await generateRandomDisplayName();
                await usersCollection.updateOne(
                    { _id: updatedUser._id },
                    { $set: { DisplayName: updatedUser.DisplayName } }
                );
            }

            // user.userHandle 없으면 생성
            if (!updatedUser.userHandle) {
                updatedUser.userHandle = await generateUniqueUserHandle(usersCollection);
                await usersCollection.updateOne(
                    { _id: updatedUser._id },
                    { $set: { userHandle: updatedUser.userHandle } }
                );
            }

            // user.rank가 없으면 기본값 0 설정
            if (updatedUser.rank === undefined) {
                updatedUser.rank = 0;
                await usersCollection.updateOne(
                    { _id: updatedUser._id },
                    { $set: { rank: updatedUser.rank } }
                );
            }

            // 세션 업데이트
            req.session.user = {
                id: updatedUser._id.toString(),
                display_name: updatedUser.DisplayName,
                user_handle: updatedUser.userHandle,
                rank: updatedUser.rank,
            };

        } catch (error) {
            console.error('유저 조회 중 오류 발생:', error);
            return res.status(500).json({ error: '서버 오류' });
        }
    }
    next();
});

// API 라우트 등록
app.use('/api', userRoutes);
app.use('/api', postRoutes);
app.use('/api', commentRoutes);
app.use('/api', PingRoutes);

// 프론트엔드 서빙
app.get('*', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
    } catch (error) {
        console.error('Static file serving error:', error);
        res.status(500).json({ error: '서버 오류' });
    }
});

// 서버 실행
http.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}/`);
});
