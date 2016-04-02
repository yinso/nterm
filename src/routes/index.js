'use strict';

module.exports = {
  init (app, config) {
    app.get('/', (req, res, next) => {
      return res.render('index', {
        name: req.query.name,
        pageTitle: 'NTerm is not a Term'
      });
    });
  }
}
