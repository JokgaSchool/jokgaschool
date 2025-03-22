const express = require('express');
const router = express.Router();
const { getComments, createComment } = require('../controllers/commentController.js');

/**
 * @swagger
 * /api/comments/{postId}:
 *   get:
 *     summary: 포스트 댓글 불러오기
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         description: 댓글을 불러올 포스트의 ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 댓글 조회 성공
 *       500:
 *         description: 서버 오류 발생
 */
router.get('/comments/:postId', getComments);

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: 포스트 댓글 게시
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: string
 *                 description: 댓글을 달 포스트의 ID
 *               content:
 *                 type: string
 *                 description: 댓글의 내용
 *     responses:
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 데이터베이스에서 유저 찾기 실패
 *       201:
 *         description: 포스트 댓글 게시 성공
 *       500:
 *         description: 서버 오류 발생
 */
router.post('/comments', createComment);

module.exports = router;
