const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');

dotenv.config(); // dotenv는 require 한다음, 최대한 위에 적어주는 것이 좋다.
const pageRouter = require('./routes/page');
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');


const app = express();
app.set('port', process.env.PORT || 8001);
app.set('view engine', 'html');
nunjucks.configure('views', {
  express: app,
  watch: true,
});

app.use(morgan('dev'));

// static: 요청과 실제 파일 주소가 다를 때 역할을 해주는 것
app.use(express.static(path.join(__dirname, 'public')));
app.use('img', express.static(path.join(__dirname, 'uploads'))); // 사람들은 이미지 를 요청하지만 실제 폴더에는 images를 요청
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
}));

// 라우터 연결
app.use('/', pageRouter);
app.use('/auth', authRouter);
app.use('/post', postRouter);

// 404 처리 미들웨어
app.use((req, res, next) => {
  const error =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

// 에러 미들웨어
app.use((err, req, res, next) => {
  res.locals.message = err.message; // 탬플릿 엔진에서 message라는 변수, 에러 변수 사용할 수 있게 해준다
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {}; // 개발모드일때는 에러 상세내역이 보이고, 배포모드일 때는 안보여주고
  res.status(err.status || 500);
  res.render('error');
});

app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기중');
});