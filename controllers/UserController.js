const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Vonage = require('@vonage/server-sdk')

const User = require('../models/User')

const { web3, account, contract } = require('../utils/contract_handler')
const Transaction = require('../utils/transaction_handler')

const signin_admin = async (req,res) => {
    const { email, password } = req.body

    try {
        const user = await User.findOne({ email: email })
        if(!user) return res.status(404).json({ message: 'User does not exists' })
        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if(!isPasswordCorrect) return res.status(400).json({ message: 'Invalid Password' })
        const token = jwt.sign({ id: user._id, is_admin: true }, process.env.TOKEN_SECRET)
        res.status(200).json({ token: token })
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: 'Something went wrong.' })
    }
}

const signin_voter = async (req,res) => {
    const { phone } = req.body
    try {
        const otp = Math.floor(Math.random() * (999999 - 100000 + 1)) + 1
        const vonage = new Vonage({
            apiKey: process.env.API_KEY,
            apiSecret: process.env.API_SECRET
        })
        const from = 'Electchain'
        const to = `91${phone}`
        const text = `Your verification token is ${otp}`
        await User.updateOne({ phone: to }, { $set: { otp_code: otp } }, { upsert: true })
        vonage.message.sendSms(from, to, text, (err, result) => {
            if (err) {
                console.log(err)
                res.status(400).json({ error: "Something went wrong." })
            } else {
                if (result.messages[0]['status'] === '0') {
                    console.log('Message sent successfully.')
                    res.sendStatus(200)
                } else {
                    console.log(`Message failed with error: ${result.messages[0]['error-text']}`)
                    res.sendStatus(400)
                }
            }
        })
    } catch (err) {
        console.log(err)
        res.status(400).json({ error: "Something went wrong." })
    }
}

const signin_voter_verify = async (req, res) => {
    const { phone, otp_code } = req.body
    try {
        const user = await User.findOne({ phone: `91${phone}` })
        if (user.otp_code == otp_code) {
            const token = jwt.sign({ id: user._id, is_admin: false }, process.env.TOKEN_SECRET)
            res.status(200).json({ token: token })
        } else {
            res.status(401).json({ error: "Invaild otp entered." })
        }
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: "Something went wrong. Try again later." })
    }
}

const signup = async (req,res) => {
    const { first_name, last_name, dob, email, phone, voter_id } = req.body
    try {
        const isActive = await contract.methods.IsActive().call()
        if (!isActive) {
            const emailExist = await User.findOne({ email: email })
            if(emailExist) return res.status(400).json({ message: 'Email already exists.' })

            const phoneExist = await User.findOne({ phone: phone })
            if (phoneExist) return res.status(400).json({ message: 'Phone already exists.' })

            const voterIdExist = await User.findOne({ voter_id: voter_id })
            if (voterIdExist) return res.status(400).json({ message: 'Voter id already exists.' })
            const newVoter = web3.eth.accounts.create(web3.utils.randomHex(32))
            const voter = await User.create({
                first_name: first_name,
                last_name: last_name,
                dob: dob,
                email: email,
                phone: phone,
                voter_id: voter_id,
                wallet_address: newVoter.address,
                private_key: newVoter.privateKey
            })
            console.log(voter)
            const transaction = await contract.methods.addVoter(voter._id, voter.wallet_address, false)
            const receipt = await Transaction(account, web3, transaction)
            console.log(receipt)
            res.status(200).json({ message: "Candidate Registered."} )
        } else {
            res.status(200).json({ message: "Voting has already started. Try again later." })
        }
    } catch (error) {
        console.log(error)
        res.status(400).json({ error: "Something went wrong." })
    }
}

module.exports = { signup, signin_voter, signin_voter_verify, signin_admin }