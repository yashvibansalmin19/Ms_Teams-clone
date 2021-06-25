let express = require('express')
let router = express.Router();

/*Get video call page */

router.get('/', function(req, res) {
    res.render('index', {
        name: 'Videocall'
    });
});

module.exports = router;
