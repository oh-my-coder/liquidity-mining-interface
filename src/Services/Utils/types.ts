export enum EMiningType {
  DROPIUM = 'DROPIUM'
}

export enum EMiningStatus {
  CALCULATING = 'CALCULATING',
  CLAIMABLE = 'CLAIMABLE'
}

export type TCalculatingMiningParams = {
  subgraphUrl?: string,
  subgraphParam?: string
}

export type TClaimableMiningParams = {
  address?: string,
  list?: {account: string, amount: number}[]
}

export type TMining = {
  title?: string
  type?: EMiningType
  totalRewards?: number
  status?: EMiningStatus
  networkId?: 1 | 56 |137
  params?: TCalculatingMiningParams | TClaimableMiningParams
}