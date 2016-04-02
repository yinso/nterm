
function init (app, config) {
  app.set('view engine', 'jade');
  app.use(require('express').static(path.join(__dirname, '..', 'public')));
  require('./routes/index').init(app, config);
}

module.exports = {
  init: init
};
