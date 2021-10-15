import { 
  createDrOpiumContractInstance, createStakingClaimableContractInstance,
  createTokenContractInstance
} from './contract'
import Web3 from 'web3'
import { convertFromBN, convertToBN } from './bn'
import { sendTx } from './transaction'
import { TMining, TDropiumCalculatingMiningParams, TDropiumClaimableMiningParams } from './types'
import { fetchTheGraph } from './theGraph'
import BalanceTree from './balanceTree'
import { BigNumber } from 'ethers'

const MAX_UINT256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'

// DROPIUM methods
export const getDropiumUserStake = async (
  mining: TMining,
  userAddress: string
) => {
  const decimals = 18
  const params = mining.params as TDropiumCalculatingMiningParams
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
  const params = mining.params as TDropiumClaimableMiningParams

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

export const claimDropiumReward = async (
  mining: TMining,
  userAddress: string,
  onConfirm: () => void,
  onError: (error: Error) => void
) => {
  
  const params = mining.params as TDropiumClaimableMiningParams

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

// Staking Claimable methods

export const getStakingMiningInfo = async (
  address: string,
  userAddress: string
) => {
  const decimals = 18
  const contract = createStakingClaimableContractInstance(address)
  const userStake = await contract?.methods.balanceOf(userAddress).call()
  const userRewards = await contract?.methods.rewards(userAddress).call()

  return {
    userStake: +convertFromBN(userStake, decimals),
    userRewards: +convertFromBN(userRewards, decimals),
  }
}

export const makeApprove = async (
  address: string, 
  userAddress: string, 
  onConfirm: () => void, 
  onError: (error: Error) => void,
  marginAddress?: string
): Promise<string> => {

  // Create contracts instances 
  const stakingClaimableContract = createStakingClaimableContractInstance(address)
  const tokenAddress =  marginAddress || await stakingClaimableContract?.methods.underlying().call()
  const tokenContract = createTokenContractInstance(tokenAddress)

  // Make allowance 
  const tx = tokenContract?.methods.approve(address, MAX_UINT256).send({ from: userAddress })
  return await sendTx(tx, onConfirm, onError)
}


export const stakeIntoPool = async (
  value: number,
  address: string, 
  userAddress: string, 
  onConfirm: () => void, 
  onError: (error: Error) => void
) => {
  // Create contracts instances 
  const stakingClaimableContract = createStakingClaimableContractInstance(address)

  // Create deposit tx
  const decimals = await stakingClaimableContract?.methods.decimals().call()
  const tx = stakingClaimableContract?.methods.stake(convertToBN(value, +decimals)).send({ from: userAddress })

  // Send tx
  return await sendTx(tx, onConfirm, onError)
}

export const unstakeFromPool = async (
  value: number,
  address: string, 
  userAddress: string, 
  onConfirm: () => void, 
  onError: (error: Error) => void
) => {
  // Create contracts instances 
  const stakingClaimableContract = createStakingClaimableContractInstance(address)

  // Create withdrawal tx
  const decimals = await stakingClaimableContract?.methods.decimals().call()
  const tx = stakingClaimableContract?.methods.withdraw(convertToBN(value, +decimals)).send({ from: userAddress })

  // Send tx
  return await sendTx(tx, onConfirm, onError)
}

export const checkTokenBalance = async (
  address: string,
  userAddress: string,
  value: number
) => {
  try {
    const stakingClaimableContract = createStakingClaimableContractInstance(address)
    const decimals = await stakingClaimableContract?.methods.decimals().call()
    const tokenAddress =  await stakingClaimableContract?.methods.underlying().call()
    const tokenContract = createTokenContractInstance(tokenAddress)
    const balanceBN = await tokenContract?.methods.balanceOf(userAddress).call()
    const balance = +convertFromBN(balanceBN, decimals)
    return value > balance
  } catch (e) {
    console.log(e)
    return true
  }
}

export const getAllowance = async (tokenAddress: string, userAddress: string, address: string) => {
  const tokenContract = createTokenContractInstance(tokenAddress)

  const allowance = await tokenContract?.methods.allowance(userAddress, address).call()
  return allowance
}

export const checkAllowance = async (
  value: number,
  address: string, 
  userAddress: string,
) => {

  // Create contracts instances 
  const stakingClaimableContract = createStakingClaimableContractInstance(address)
  const tokenAddress = await stakingClaimableContract?.methods.underlying().call({from: userAddress})
  // Check allowance
  const allowance = await getAllowance(tokenAddress, userAddress, address).then((allowance: string) => {
    return stakingClaimableContract?.methods.decimals().call().then((decimals: string) => {
      return +convertFromBN(allowance, +decimals)
    })
  })
  return allowance > value 
}

export const checkStakedBalance = async (
  address: string,
  userAddress: string,
  value: number
) => {
  try {
    const stakingClaimableContract = createStakingClaimableContractInstance(address)
    const balanceBN = await stakingClaimableContract?.methods.balanceOf(userAddress).call()
    const decimals = await stakingClaimableContract?.methods.decimals().call()
    const balance = +convertFromBN(balanceBN, +decimals)
    return value > balance
  } catch (e) {
    console.log(e)
    return true
  }
}

export const claimStakingClaimableReward = async (
  address: string,
  userAddress: string, 
  onConfirm: () => void, 
  onError: (error: Error) => void
) => {
  const stakingClaimableContract = createStakingClaimableContractInstance(address)
  const tx = stakingClaimableContract?.methods.getReward().send({ from: userAddress })
  return await sendTx(tx, onConfirm, onError)
}

export const exitStakingClaimableReward = async (
  address: string,
  userAddress: string, 
  onConfirm: () => void, 
  onError: (error: Error) => void
) => {
  const stakingClaimableContract = createStakingClaimableContractInstance(address)
  const tx = stakingClaimableContract?.methods.exit().send({ from: userAddress })
  return await sendTx(tx, onConfirm, onError)
}