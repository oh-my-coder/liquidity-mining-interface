import { TMining } from './../Utils/types'
import { computed, action, observable, reaction } from "mobx"
import authStore from "./AuthStore"
import { minings } from '../DataBase/minings'

export class AppStore {

 @observable minings: TMining[] | [] = minings
 @observable requestsAreNotAllowed: boolean = ((authStore.blockchainStore.requiredNetworkName !== authStore.blockchainStore.currentNetworkName) || !authStore.blockchainStore.address)

 constructor() {
  reaction(() => authStore.blockchainStore.address, this.setRequestsAreNotAllowedReaction)
  reaction(() => authStore.blockchainStore.requiredNetworkName, this.setRequestsAreNotAllowedReaction)
  reaction(() => authStore.blockchainStore.currentNetworkName, this.setRequestsAreNotAllowedReaction)
}

@action
setRequestsAreNotAllowedReaction = () => {
  this.requestsAreNotAllowed = ((authStore.blockchainStore.requiredNetworkName !== authStore.blockchainStore.currentNetworkName) || !authStore.blockchainStore.address)
}

  @computed
  private get _miningsByNetwork(): {[key: number]: TMining[]} {
    return {
      1: this.ethMinings,
      56: this.bscMinings,
      137: this.polygonMinings
    }
  }

  @computed get ethMinings(): TMining[] {
    return this.minings.filter(minings => minings.networkId === 1)
  }

  @computed get bscMinings(): TMining[] {
    return this.minings.filter(minings => minings.networkId === 56)
  }

  @computed get polygonMinings(): TMining[] {
    return this.minings.filter(minings => minings.networkId === 137)
  }

  @computed
  get miningsByNetwork(): TMining[] {
    return this._miningsByNetwork[authStore.networkId]
  } 
  
  @action 
  public setMinings(minings: TMining[]) {
    this.minings = minings
  }
}

export default new AppStore()
