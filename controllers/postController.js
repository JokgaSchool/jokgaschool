const { getPostsCollection, getUsersCollection } = require('../models/db.js');
const { ObjectId } = require('mongodb');

async function searchPosts(req, res) {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: '검색어를 입력하세요.' });
    }

    const escapeRegExp = (string) => {
      return string.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, '\\$&');
    };

    const escapedQuery = escapeRegExp(query);

    // 검색 필드드 (제목, 설명, 태그)
    const searchFilter = {
      $or: [
        { title: { $regex: escapedQuery, $options: 'i' } },
        { description: { $regex: escapedQuery, $options: 'i' } },
        { tags: { $regex: escapedQuery, $options: 'i' } },
        { d_author: { $regex: escapedQuery, $options: 'i' } },
        { author: { $regex: escapedQuery, $options: 'i' } }
      ]
    };

    const posts = await getPostsCollection()
      .find(searchFilter, { projection: { title: 1, description: 1, a_id: 1, createdAt: 1, rank: 1, tags: 1 } })
      .sort({ createdAt: -1 })
      .toArray();

    if (!posts.length) {
      return res.status(404).json({ message: '검색 결과가 없습니다.' });
    }

    const userIds = posts.map(post => post.a_id);
    const users = await getUsersCollection()
      .find({ _id: { $in: userIds.map(id => new ObjectId(id)) } }, { projection: { _id: 1, userHandle: 1, DisplayName: 1 } })
      .toArray();
    
    const userMap = Object.fromEntries(users.map(user => [user._id.toString(), user]));

    const formattedPosts = posts.map(post => ({
      ...post,
      author: userMap[post.a_id]?.userHandle || "Deleted User",
      d_author: userMap[post.a_id]?.DisplayName || "(Deleted User)",
    }));

    res.json(formattedPosts);
  } catch (error) {
    console.error("Error searching posts:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
}

async function getPost(req, res) {
  try {
    const postId = req.params.id;

    if (!ObjectId.isValid(postId)) {
      return res.status(400).json({ message: '잘못된 요청입니다.' });
    }

    const post = await getPostsCollection().findOne({ _id: new ObjectId(postId) });

    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    const userId = post.a_id;
    const user = await getUsersCollection().findOne(
      { _id: new ObjectId(userId) },
      { projection: { _id: 1, userHandle: 1, DisplayName: 1 } }
    );

    const formattedPost = {
      ...post,
      author: user?.userHandle || "알 수 없음",
      d_author: user?.DisplayName || "(삭제됨)",
    };

    res.json(formattedPost);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
}

async function getAllPosts(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const rankFilter = req.query.rank ? parseInt(req.query.rank, 10) : null;
    
    let filter = {};
    if (rankFilter) filter.rank = rankFilter;
    
    const posts = await getPostsCollection()
      .find(filter, { projection: { title: 1, description: 1, a_id: 1, createdAt: 1, rank: 1, tags: 1 } })
      .sort({ rank: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    if (!posts.length) return res.json([]);

    const userIds = posts.map(post => post.a_id);
    const users = await getUsersCollection()
      .find({ _id: { $in: userIds.map(id => new ObjectId(id)) } }, { projection: { _id: 1, userHandle: 1, DisplayName: 1 } })
      .toArray();
    
    const userMap = Object.fromEntries(users.map(user => [user._id.toString(), user]));

    const formattedPosts = posts.map(post => ({
      ...post,
      author: userMap[post.a_id]?.userHandle || "Deleted User",
      d_author: userMap[post.a_id]?.DisplayName || "(Deleted User)",
    }));

    res.json(formattedPosts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
}

async function createPost(req, res) {
  try {
    const { user } = req.session;
    if (!user || user.rank === undefined) {
      return res.status(403).json({ message: "로그인이 필요합니다." });
    }

    const { title, description, tags, rank } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: "제목과 내용을 입력하세요." });
    }

    const userId = new ObjectId(user.id);
    const userData = await getUsersCollection().findOne({ _id: userId });

    if (!userData) {
      return res.status(403).json({ message: "사용자를 찾을 수 없습니다." });
    }

    if (user.rank <= 0 ) {
      return res.status(403).json({ message: "게시물 작성 권한이 없습니다." });
    }

    // rank 값 검증 및 제한
    const postRank = parseInt(rank, 10);
    if (isNaN(postRank)) {
      return res.status(400).json({ message: "유효한 rank 값을 입력하세요." });
    }

    if (postRank > user.rank) {
      return res.status(403).json({ message: "본인의 등급을 초과하는 rank를 선택할 수 없습니다." });
    }

    const newPost = {
      title,
      description,
      tags: Array.isArray(tags) ? tags.filter(tag => tag.trim() !== "") : [],
      rank: postRank,
      createdAt: new Date(),
      author: userData.userHandle,
      a_id: userData._id,
      d_author: userData.DisplayName,
      comment_up: 1
    };

    await getPostsCollection().insertOne(newPost);
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
}

module.exports = { getPost, getAllPosts, createPost, searchPosts};
