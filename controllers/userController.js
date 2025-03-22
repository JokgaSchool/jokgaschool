const bcrypt = require('bcrypt');
const { getUsersCollection, getIdUsedCollection } = require('../models/db.js');
const rateLimit = require('express-rate-limit');
const { ObjectId } = require('mongodb');

const saltRounds = 10;

const requestLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, 
    max: 100,
    message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
    statusCode: 429,
    headers: true,
    keyGenerator: (req) => req.ip,
});

// 유효성 검사 함수
function validateSignupData(DisplayName, userHandle, password) {
    if (DisplayName.length > 30) {
        return '이름은 최대 30자까지 가능합니다.';
    }

    const userHandleRegex = /^[a-zA-Z0-9가-힣_]{1,15}$/;
    if (!userHandleRegex.test(userHandle)) {
        return '아이디는 영문, 숫자, 한글, 밑줄(_)만 사용 가능하며 최대 15자입니다.';
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        return '비밀번호는 최소 8자, 영문/숫자/특수문자(@$!%*#?&)를 포함해야 합니다.';
    }

    return null;
}

// 회원가입 API
async function signup(req, res) {
    let { DisplayName, userHandle, password } = req.body;
    userHandle = userHandle.toLowerCase(); // 소문자 변환

    try {
        const validationError = validateSignupData(DisplayName, userHandle, password);
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const usersCollection = getUsersCollection();
        const idUsedCollection = getIdUsedCollection();

        const existingUser = await usersCollection.findOne({ userHandle: userHandle.toLowerCase() });
        const idUsed = await idUsedCollection.findOne({ userHandle: userHandle.toLowerCase() });

        if (existingUser) {
            return res.status(400).json({ message: '이미 존재하는 사용자명입니다.' });
        }

        if (idUsed) {
            return res.status(400).json({ message: '해당 아이디는 사용할 수 없습니다.' });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = await usersCollection.insertOne({ 
            DisplayName, 
            userHandle,
            password: hashedPassword, 
            rank: 0, 
            registeredAt: new Date() 
        });

        await idUsedCollection.insertOne({ 
            user_id: newUser.insertedId, 
            DisplayName,
            userHandle, 
            registeredAt: new Date() 
        });

        res.status(200).json({ message: '회원가입이 완료되었습니다.' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
}

async function deleteUser(req, res) {
    try {
        if (!req.session.user) {
            return res.status(401).json({ message: '로그인 상태가 아닙니다.' });
        }

        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ message: '필수 데이터가 누락되었습니다.' }); 
        }
        const usersCollection = getUsersCollection();
        const idUsedCollection = getIdUsedCollection();

        const userId = new ObjectId(req.session.user.id);
        const user = await usersCollection.findOne({ _id: userId });

        if (!user) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
        }

        await idUsedCollection.updateOne(
            { user_id: user._id },
            {
                $set: {
                    DisplayName: user.DisplayName,
                    userHandle: user.userHandle,
                    rank: user.rank,
                    deletedAt: new Date(),
                },
            }
        );

        // 계정 삭제
        await usersCollection.deleteOne({ _id: user._id });

        // 세션 삭제
        req.session.destroy((err) => {
            if (err) {
                console.error("세션 삭제 중 오류 발생:", err);
                return res.status(500).json({ message: '세션 삭제 중 오류가 발생했습니다.' });
            }
            res.clearCookie('connect.sid', { path: '/' });
            res.status(200).json({ message: '회원 탈퇴가 완료되었습니다.' });
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
}

// 로그인 API
async function login(req, res) {
    const { userHandle, password } = req.body;

    try {
        const usersCollection = getUsersCollection();
        let user = await usersCollection.findOne({ userHandle });

        if (!user) {
            return res.status(401).json({ message: '사용자를 찾을 수 없습니다.' });
        }
        
        if (!user.password || user.rank === undefined || !user.DisplayName || !user.userHandle) {
            return res.status(404).json({ message: '로그인 할 수 없습니다.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
        }

        req.session.user = {
            id: user._id,
            display_name: user.DisplayName,
            user_handle: user.userHandle,
            rank: user.rank,
        };

        res.status(200).json({
            message: '로그인 성공',
            user: { display_name: user.DisplayName, user_handle: user.userHandle, rank: user.rank },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: '알 수 없는 오류가 발생했습니다.' });
    }
}

// 로그아웃 API
async function logout(req, res) {
    try {
        if (!req.session) {
            return res.status(400).json({ message: '이미 로그아웃된 상태입니다.' });
        }

        req.session = null;

        res.clearCookie('session', { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict' });
        res.status(200).json({ message: '로그아웃 되었습니다.' });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ message: '로그아웃 중 오류가 발생했습니다.' });
    }
}

// 사용자 정보 조회 API
function getClientUserInfo(req, res) {
    if (req.session.user) {
        res.status(200).json({ isAuthenticated: true, user: req.session.user });
    } else {
        res.status(401).json({ isAuthenticated: false, message: '인증되지 않은 사용자입니다.' });
    }    
}

module.exports = { 
    signup: [requestLimiter, signup],
    login: [requestLimiter, login],
    logout,
    deleteUser,
    getClientUserInfo
};
