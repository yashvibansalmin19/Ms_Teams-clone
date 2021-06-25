let express = require('express')
let router = express.Router();

/*Get login page */

router.get('/', function(req, res) {
    res.render('indexNew', {
        name: 'LoginPage'
    });
});

module.exports = router;
