export enum EMiningType {
  DROPIUM = 'DROPIUM',
  STAKING_CLAIMABLE = 'STAKING_CLAIMABLE'
}

export enum EMiningStatus {
  CALCULATING = 'CALCULATING',
  CLAIMABLE = 'CLAIMABLE'
}

export type TDropiumCalculatingMiningParams = {
  subgraphUrl?: string,
  subgraphParam?: string
}

export type TDropiumClaimableMiningParams = {
  address?: string,
  list?: {account: string, amount: number}[]
}

export type TStakingClaimableMiningParams = {
  address: string,
}

export type TMining = {
  title?: string
  type?: EMiningType
  totalRewards?: number
  status?: EMiningStatus
  networkId?: 1 | 56 |137
  params?: TDropiumCalculatingMiningParams | TDropiumClaimableMiningParams | TStakingClaimableMiningParams
}