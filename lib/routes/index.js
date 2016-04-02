'use strict';

module.exports = {
  init: function init(app, config) {
    app.get('/', function (req, res, next) {
      return res.render('index', {
        name: req.query.name,
        pageTitle: 'NTerm is not a Term'
      });
    });
  }
};