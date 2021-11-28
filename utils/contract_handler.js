const Web3 = require('web3')
const fs = require('fs')

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_URL))
const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY)
web3.eth.defaultAccount = web3.eth.accounts[0]

const contractJson = fs.readFileSync('./utils/electchain_abi.json')
const CONTRACT_ABI = JSON.parse(contractJson)
const contract = new web3.eth.Contract(CONTRACT_ABI, process.env.CONTRACT_ADDRESS, {
        from: process.env.WALLET_ADDRESS,
        gasPrice: process.env.GAS_PRICE
})

module.exports = {web3, account, contract}