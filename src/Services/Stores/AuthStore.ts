import { observable, action } from 'mobx'
import { BlockchainStore } from '@opiumteam/mobx-web3/lib/Classes/Blockchain.store'
import { Blockchain } from '@opiumteam/mobx-web3'
import config from '../Config'

// Utils
export class AuthStore {
  @observable public loggedIn = false
  @observable public networkId = 1
  @observable public blockchainStore: BlockchainStore
  @observable public blockchain: Blockchain
  

  constructor() {
    // @ts-ignore
    this.blockchain = new Blockchain(this.networkId, 'Ethereum', 'https://cloudflare-eth.com/', '', 'wss://cloudflare-eth.com/', console, '')
    // @ts-ignore
    this.blockchainStore = new BlockchainStore(this.blockchain, console)
    this.blockchainStore.registerCallbacks(this._finalizeLogin, this._finalizeLogin, this._finalizeLogout, this._walletChangeCallback)
  }

  public logout = () => {
    this.blockchainStore.logout()
    this._finalizeLogout()
  }
  
  @action
  private _finalizeLogout = () => {
    this.loggedIn = false
  }

  @action
  private _walletChangeCallback = () => {

  }

  @action
  public changeNetwork = (networkName: string, networkId: number) => {
    this.networkId = networkId
    // @ts-ignore
    this.blockchain = new Blockchain(networkId, networkName, 'https://cloudflare-eth.com/', '', 'wss://cloudflare-eth.com/', console, config.rpc[networkId])
    // @ts-ignore
    this.blockchainStore = new BlockchainStore(this.blockchain, console)
    this.blockchainStore.registerCallbacks(this._finalizeLogin, this._finalizeLogin, this._finalizeLogout, this._walletChangeCallback)
  }


  /** PRIVATE */
  @action
  private _finalizeLogin = () => {
    this.loggedIn = true
  }
}

export default new AuthStore()
