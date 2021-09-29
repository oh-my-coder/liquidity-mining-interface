import { createDrOpiumContractInstance } from './contract'
import Web3 from 'web3'
import { convertFromBN, convertToBN } from './bn'
import { sendTx } from './transaction'
import { TMining, TCalculatingMiningParams, TClaimableMiningParams } from './types'
import { fetchTheGraph } from './theGraph'
import BalanceTree from './balanceTree'
import { BigNumber } from 'ethers'


export const getUserStake = async (
  mining: TMining,
  userAddress: string
) => {
  const decimals = 18
  const params = mining.params as TCalculatingMiningParams
  if (!params || !params.subgraphUrl || !params.subgraphParam) {
    return
  }
  const query = `
  {
    user(id: "${userAddress.toLowerCase()}") {
      deposits
      ${params.subgraphParam}
    }
  }  
  `
  const res = await fetchTheGraph(params.subgraphUrl, query)
  if (res.user) {
    return {
      rewards: +convertFromBN(res.user[params.subgraphParam], decimals),
      deposits: res.user.deposits
    } 
  }
  return {
    rewards: 0,
    deposits: 0
  }
}


export const getDropiumInfo = async (mining: TMining, userAddress: string) => {
  const params = mining.params as TClaimableMiningParams

  if (!params || !params.list || !params.address) {
    return
  }

  // Get users account data
  const user = params.list.find(el => el.account === userAddress)
  const drOpiumContract = createDrOpiumContractInstance(params.address)

  const bonusEnd = await drOpiumContract?.methods.bonusEnd().call()
  
  if (!user) return {charityFee: 0, bonusEnd: 0, fullReward: 0, claimableReward: 0}

  const index = params.list.indexOf(user)

  
  // Check if already claimed
  const isClaimed = await drOpiumContract?.methods.isClaimed(index).call()

  if (isClaimed) {
    return {charityFee: 0, bonusEnd: 0, fullReward: 0, claimableReward: 0}
  }

  const adjustment = await drOpiumContract?.methods.calculateAdjustedAmount(convertToBN(user.amount, 18)).call()

  const initialAmount = user.amount
  const bonusPart = +convertFromBN(adjustment.bonusPart, 18)

  const fullReward = initialAmount + bonusPart
  const adjustedAmount = +convertFromBN(adjustment.adjustedAmount, 18)

  return {
    claimableReward: +adjustedAmount.toFixed(2),
    fullReward: +fullReward.toFixed(2),
    charityFee: 1 - adjustedAmount / fullReward,
    bonusEnd
  }
}

export const claimReward = async (
  mining: TMining,
  userAddress: string,
  onConfirm: () => void,
  onError: (error: Error) => void
) => {
  
  const params = mining.params as TClaimableMiningParams

  if (!params || !params.list || !params.address) {
    return
  }
  const drOpiumContract = createDrOpiumContractInstance(params.address)
 
  const replicateTree = params.list.map(el => {
    return {
      account: el.account.toLowerCase(),
      amount: BigNumber.from(Web3.utils.toWei(el.amount.toString()))
    }
  })

  const user = replicateTree.find(el => el.account === userAddress.toLowerCase())
  if (!user) return 
  const index = replicateTree.indexOf(user)


  const tree = new BalanceTree(replicateTree)
  const merkleProof = tree.getProof(index, user.account, user.amount)

  const tx = drOpiumContract?.methods
  .claim(
    index,
    user.account,
    user.amount,
    merkleProof
  )
  .send({
    from: userAddress
  })
  return await sendTx(tx, onConfirm, onError)

}

