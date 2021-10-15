import React, { FC, useState, useEffect } from 'react'
import { observer } from 'mobx-react'
import { useAlert } from 'react-alert'
import { Button, ETheme } from '@opiumteam/react-opium-components'
import authStore from '../../Services/Stores/AuthStore'
import appStore from '../../Services/Stores/AppStore'
import { 
  makeApprove, getStakingMiningInfo, 
  stakeIntoPool, unstakeFromPool, checkTokenBalance, 
  checkAllowance, checkStakedBalance, claimStakingClaimableReward,
  exitStakingClaimableReward
} from '../../Services/Utils/methods'
import { TMining, TStakingClaimableMiningParams } from '../../Services/Utils/types'

import './styles.scss'

type TProps = {
  mining: TMining
}

const defaultInfo = {userStake: 0, userRewards: '0'}

const StakingMiningItem: FC<TProps> = (props: TProps) => {
  const alert = useAlert()

  const [ info, setInfo ] = useState(defaultInfo)
  const [ stakeValue, setStakeValue ] = useState(0) 


  const userAddress = authStore.blockchainStore.address

  const { mining } = props
  const { address } = mining.params as TStakingClaimableMiningParams
  const { type } = mining

  useEffect(() => {
    if (mining.params && userAddress) {
      getStakingMiningInfo(address, userAddress, type).then(res => setInfo(res))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAddress, mining])


  const makeStake = async () => {
    if (stakeValue === 0) {
      alert.error('Please enter the amount')
      return
    }

    const insufficientBalance = await checkTokenBalance(address, userAddress, stakeValue, type)
    if (insufficientBalance) {
      alert.error('Insufficient balance')
      return
    }

    const tokenAllowed = await checkAllowance(stakeValue, address, userAddress, type)
    if (!tokenAllowed) {
      makeApprove(
        address, 
        userAddress, 
        type,
        () => stakeIntoPool(stakeValue, address, userAddress, type, () => alert.success('Token was successfully approved'), (e) => alert.error(e.message)),
        (e) => alert.error(e.message)
        )
    } else {
      stakeIntoPool(stakeValue, address, userAddress, type, () => alert.success('Successfully staked'), (e) => alert.error(e.message))
    }
  }

  const makeUnstake = async () => {
    if (stakeValue === 0) {
      alert.error('Please enter the amount')
      return
    }

    const insufficientStake = await checkStakedBalance(address, userAddress, stakeValue, type)
    if (insufficientStake) {
      alert.error('insufficient staked balance')
      return
    }
    unstakeFromPool(stakeValue, address, userAddress, type, () => alert.success('Successfully unstaked'), (e) => alert.error(e.message))
  }

  const renderInfo = () => {
    return (
      <div className='staking-mining-item-info'>
        <div>Your stake: {info.userStake.toFixed(2)} LP tokens</div>
        <div>Your rewards: {info.userRewards}</div>
      </div>
    )
  }

  const claim = async () => {
    await claimStakingClaimableReward(address, userAddress, type, () => alert.success('Successfully claimed'), (e) => alert.error(e.message))
  }

  const exit = async () => {
    await exitStakingClaimableReward(address, userAddress, type, () => alert.success('Successfully exited'), (e) => alert.error(e.message))
  }

  return (
    <div className='staking-mining-item-wrapper' key={mining.title}>
      <div className='staking-mining-item-title'>{mining.title}</div>
      {renderInfo()}
        {/* <div className='staking-mining-item-reward'>{renderRewards(mining)}</div> */}
      <div className='pools-list-item-second-column'>
        <div className='pools-list-item-input'>Amount to stake: <input type='number' onChange={e => setStakeValue(+e.target.value)} /></div>
        <div className='pools-list-item-second-column-buttons-wrapper'>
          <Button theme={ETheme.LIGHT} variant='primary' label='stake' onClick={makeStake} disabled={appStore.requestsAreNotAllowed}/>
          <Button theme={ETheme.LIGHT} variant='secondary' label='unstake' onClick={makeUnstake} disabled={appStore.requestsAreNotAllowed}/>
        </div>
      </div>
      <div className='staking-mining-item-button-wrapper'>
        <Button variant='secondary' theme={ETheme.LIGHT} label='claim' onClick={claim}/>
        <Button variant='secondary' theme={ETheme.LIGHT} label='exit' onClick={exit}/>
      </div>
    </div>
  )
}

export default observer(StakingMiningItem)
