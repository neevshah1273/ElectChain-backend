module.exports = async (account, web3, transaction) => {
    try {
        const option = {
            to: transaction._parent._address,
            data: transaction.encodeABI(),
            gas: await transaction.estimateGas({ from: account.address }),
            gasPrice: await web3.eth.getGasPrice(),
            value: 0
        }
        const signed  = await web3.eth.accounts.signTransaction(option, account.privateKey)
        const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction)
        return receipt
    } catch (err) {
        console.log(err)
        return null
    }
}