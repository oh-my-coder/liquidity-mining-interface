import { PromiEvent, TransactionReceipt } from 'web3-core/types'

export const sendTx = (
  transactionReceipt: PromiEvent<TransactionReceipt>,
  onConfirm: () => void,
  onError: (error: Error) => void
): Promise<string> => new Promise((resolve, reject) => {
  let done = false
  try {
    transactionReceipt.once('error', e => {if (done) {onError(e)} else {reject(e)}})
    transactionReceipt.once('confirmation', (confirmationNumber, receipt) => {if (receipt.status) {onConfirm()}})
    transactionReceipt.once('transactionHash', txHash => {done = true; resolve(txHash)})
  } catch (e) {
    reject(e)
  }
})
