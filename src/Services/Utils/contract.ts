import { EMiningType } from './types';
import authStore from './../Stores/AuthStore'
import DrOpium from '../Blockchain/abis/DrOpium.json'
import StakingClaimable from '../Blockchain/abis/StakingClaimable.json'
import StakingClaimableV2 from '../Blockchain/abis/StakingClaimableV2.json'
import IERC20 from '../Blockchain/abis/IERC20.json'
import { AbiItem } from 'web3-utils'

export const createDrOpiumContractInstance = (address: string) => {
  const web3 = authStore.blockchain.getWeb3()
  if (!web3) {
    return
  }
  const contract = new web3.eth.Contract(DrOpium as AbiItem[], address)
  return contract
}

export const createStakingClaimableContractInstance = (address: string, type: EMiningType) => {
  const web3 = authStore.blockchain.getWeb3()
  if (!web3) {
    return
  }
  const contract = type === EMiningType.STAKING_CLAIMABLE ? new web3.eth.Contract(StakingClaimable as AbiItem[], address) : new web3.eth.Contract(StakingClaimableV2 as AbiItem[], address)
  return contract
}

export const createTokenContractInstance = (address: string) => {
  const web3 = authStore.blockchain.getWeb3()
  if (!web3) {
    return
  }
  const contract = new web3.eth.Contract(IERC20 as AbiItem[], address)
  return contract
}