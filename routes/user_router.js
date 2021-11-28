const express = require('express')
const router = express.Router();

const { signin_admin, signin_voter, signin_voter_verify, signup } = require('../controllers/UserController')

router.post('/signin/admin', signin_admin)
router.post('/signin/voter',signin_voter)
router.post('/signin/voter/verify', signin_voter_verify)
router.post('/signup', signup)


module.exports = router