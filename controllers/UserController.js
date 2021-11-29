const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Vonage = require('@vonage/server-sdk')

const User = require('../models/User')

const { web3, account, contract } = require('../utils/contract_handler')
const Transaction = require('../utils/transaction_handler')

const signin_admin = async (req,res) => {
    console.log(req.body)
    const { email, password } = req.body

    try {
        const user = await User.findOne({ email: email })
        if(!user) return res.status(404).send()
        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if(!isPasswordCorrect) return res.status(404).send()
        const token = jwt.sign({ id: user._id, is_admin: true }, process.env.TOKEN_SECRET)
        res.status(200).json({ token: token })
    } catch (err) {
        console.log(err)
        res.status(400).send()
    }
}

const signin_voter = async (req,res) => {
    console.log(req.body)
    const { phone } = req.body
    try {
        const user = await User.findOne({ phone: phone })
        if (!user) return res.status(200).send({ message: "Phone number not registered. Please contact authorities." })
        const otp = Math.floor(Math.random() * (999999 - 100000 + 1)) + 1
        const vonage = new Vonage({
            apiKey: process.env.API_KEY,
            apiSecret: process.env.API_SECRET
        })
        const from = 'Electchain'
        const to = phone
        const text = `Your verification token is ${otp}`
        await User.updateOne({ phone: to }, { $set: { otp_code: otp } }, { upsert: true })
        vonage.message.sendSms(from, to, text, (err, result) => {
            if (err) {
                console.log(err)
                res.status(400).send()
            } else {
                if (result.messages[0]['status'] === '0') {
                    console.log('Message sent successfully.')
                    res.status(200).send({ message: "Otp sent to entered mobile number." })
                } else {
                    console.log(`Message failed with error: ${result.messages[0]['error-text']}`)
                    res.status(400).send()
                }
            }
        })
    } catch (err) {
        console.log(err)
        res.status(400).send()
    }
}

const signin_voter_verify = async (req, res) => {
    const { phone, otpCode } = req.body
    try {
        const user = await User.findOne({ phone: phone })
        if (user.otp_code == otpCode) {
            const token = jwt.sign({ id: user._id, is_admin: false }, process.env.TOKEN_SECRET)
            res.status(200).json({ token: token })
        } else {
            res.status(401).send()
        }
    } catch (err) {
        console.log(err)
        res.status(400).send()
    }
}

const signup = async (req,res) => {
    const { firstName, lastName, dob, email, phone, voterId } = req.body
    res.status(200).send({ message: "Candidate Registered."} )
    try {
        const isActive = await contract.methods.IsActive().call()
        const isCompleted = await contract.methods.IsCompleted().call()
        if (!isActive && !isCompleted) {
            const emailExist = await User.findOne({ email: email })
            if(emailExist) return res.status(200).send({ message: 'Email already exists.' })

            const phoneExist = await User.findOne({ phone: phone })
            if (phoneExist) return res.status(200).send({ message: 'Phone already exists.' })

            const voterIdExist = await User.findOne({ voter_id: voterId })
            if (voterIdExist) return res.status(200).send({ message: 'Voter id already exists.' })
            const newVoter = web3.eth.accounts.create(web3.utils.randomHex(32))
            const voter = await User.create({
                first_name: firstName,
                last_name: lastName,
                dob: dob,
                email: email,
                phone: phone,
                voter_id: voterId,
                wallet_address: newVoter.address,
                private_key: newVoter.privateKey
            })
            console.log(voter)
            const transaction = await contract.methods.addVoter(voter._id, voter.wallet_address, false)
            const receipt = await Transaction(account, web3, transaction)
            if (!receipt) {
                res.status(200).send({ message: "Something went wrong." })
            } else {
                res.status(200).send({ message: "Candidate Registered."} )
            }
        } else {
            if (isActive) {
                res.status(200).send({ message: "Voting has already started. Try again later." })
            } else if (isCompleted) {
                res.status(200).send({ message: "Reset voting to add new voters." })
            }
        }
    } catch (error) {
        console.log(error)
        res.status(400).json({ error: "Something went wrong." })
    }
}

module.exports = { signup, signin_voter, signin_voter_verify, signin_admin }
