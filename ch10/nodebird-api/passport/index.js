const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const User = require('../models/user');

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id); // 세션에 user의 id만 저장
  });
 
  // { id: 3, 'connect.sid': s%3189203810391280 }

  passport.deserializeUser((id, done) => {
    User.findOne({ 
      where: { id },
      include: [{
        model: User,
        attributes: ['id', 'nick'],
        as: 'Followers',

      }, {
        model: User,
        attributes: ['id', 'nick'],
        as: 'Followings',
      }],
    }) // 1) id를 넘겨받으면, id를 통해 찾아서
      .then(user => done(null, user)) // 2) user 정보를 복구해준다. -> req.user, req.isAuthenticated()
      .catch(err => done(err));
  });

  local();
  kakao();
};