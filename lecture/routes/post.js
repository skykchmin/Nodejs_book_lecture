const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { Post, Hashtag } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

try { // 업로드 폴더가 없으면 에러가 나기 때문에, 업로드 폴더를 생성합니다
  fs.readdirSync('uploads');
} catch (error) {
  console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
  fs.mkdirSync('uploads');
}

// multer 설정
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) { // uploads 폴더에 이미지 업로드를 할 것이고
      cb(null, 'uploads/');
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    }, // 파일명은 파일명에다가 날짜를 넣어서 만든다. 덮어씌우기 방지
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
  console.log(req.file);
  res.json({ url: `/img/${req.file.filename}` }); 
}); // ﻿form에서 'img' 라는 키로 이미지를 업로드를 해줘야합니다. 업로드 하고 난 후에 미들웨어를 실행하게 되는데 업로드한 파일 결과물이 req.file 안에 적혀있을 것이고 url을 다시 프론트로 돌려보내줍니다.

const upload2 = multer();
router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => { // 실제 이미지가 업로드 되어있기 때문에, 파일 업로드가 되어있기 때문에 upload.none() 을 사용하면 된다
  try {
    console.log(req.user);
    const post = await Post.create({
      content: req.body.content,
      img: req.body.url,
      UserId: req.user.id,
    });
    const hashtags = req.body.content.match(/#[^\s#]*/g);
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map(tag => {
          return Hashtag.findOrCreate({
            where: { title: tag.slice(1).toLowerCase() },
          })
        }),
      );
      await post.addHashtags(result.map(r => r[0]));
    }
    res.redirect('/');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;