const express = require('express');
const { signup, login, logout, getClientUserInfo, deleteUser } = require('../controllers/userController.js');
const router = express.Router();

/**
 * @swagger
 * /api/signup:
 *   post:
 *     summary: 새로운 계정 만들기
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               DisplayName:
 *                 type: string
 *               userHandle:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: 계정이 성공적으로 만들어짐
 *       400:
 *         description: |
 *           실패: 이미 존재하는 사용자명
 *       500:
 *         description: |
 *           서버 오류 발생
 */
router.post('/signup', signup);
/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: 계정 로그인하기
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 로그인 성공
 *       400:
 *         description: |
 *           실패: 사용자를 찾을 수 없음
 *       401:
 *         description: |
 *           실패: 비밀번호가 일치하지 않음
 *       500:
 *         description: |
 *           서버 오류 발생
 */
router.post('/login', login);
/**
 * @swagger
 * /api/logout:
 *   post:
 *     summary: 계정 로그아웃
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 *       500:
 *         description: 로그아웃 중 오류 발생
 */
router.post('/logout', logout);
/**
 * @swagger
 * /api/getClientUserInfo:
 *   get:
 *     summary: 로그인(계정) 정보 불러오기
 *     responses:
 *       200:
 *         description: 로그인 정보 불러오기 성공
 *       400:
 *         description: 로그인이 되어있지 않음
 */

router.delete('/deleteUser', deleteUser)

router.get('/getClientUserInfo', getClientUserInfo);

module.exports = router;
