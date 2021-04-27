const express = require('express');
const morgan = require('morgan');

const indexRouter = require('./routes');
const userRouter = require('./routes/user')

const app = express();

app.use('/', indexRouter);
app.use('/user', userRouter);

app.set('port', process.env.PORT || 3000);

app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.send('hello express');
})

app.post('/', (req, res) => {
    res.send('hello express!');
});

app.get('/about', (req, res) => {
    res.send('hello express!');
})

app.listen(app.get('port'), () => {
    console.log('익스프레스 서버 실행');
});

app.use((req, res, next) => {
	res.status(404).send('404 에러처리');
});

// 에러 처리 미들웨어
app.use((err, req, res, next) => {
	console.log(err);
    res.send('에러났지만 나만 볼 수 있다');
});