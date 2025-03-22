const express = require('express');
const { getPost, getAllPosts, createPost, searchPosts } = require('../controllers/postController.js');
const router = express.Router();

/**
 * @swagger
 * /api/posts/:id:
 *   get:
 *     summary: 포스트 불러오기
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         description: 불러올 포스트의 ID
 *         schema:
 *           type: string
 *     responses:
 *       404:
 *         description: 포스트를 찾을 수 없음
 *       500:
 *         description: |
 *           실패: 서버 오류 발생
 *       403:
 *         description: |
 *           실패: 권한 부족

 */
router.get('/posts/:id/:title', getPost);
/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: 모든 포스트 불러오기
 *     responses:
 *       500:
 *         description: |
 *           실패: 서버 오류 발생
 *       403:
 *         description: |
 *           실패: 권한 부족
 */
router.get('/posts', getAllPosts);
/**
 * @swagger
 * /api/rposts:
 *   post:
 *     summary: 포스트 게시
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               rank:
 *                 type: string
 *     responses:
 *       403:
 *         description: Forbidden
 *       404:
 *         description: |
 *           실패: 데이터베이스에서 유저 찾기 실패
 *       201:
 *         description: |
 *           포스트 게시 성공
 *       500:
 *         description: |
 *           서버 오류 발생
 */
router.post('/rposts', createPost);
router.get('/posts/search', searchPosts);

module.exports = router;
