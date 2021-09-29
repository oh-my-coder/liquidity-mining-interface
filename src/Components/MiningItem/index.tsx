import React, { FC, useState, useEffect } from 'react'
import moment from 'moment'
import { observer } from 'mobx-react'
import { useAlert } from 'react-alert'
import { Button, ETheme } from '@opiumteam/react-opium-components'
import authStore from '../../Services/Stores/AuthStore'
import { getDropiumInfo , getUserStake, claimReward } from '../../Services/Utils/methods'
import { EMiningStatus, TMining } from '../../Services/Utils/types'

import './styles.scss'

type TProps = {
  mining: TMining
}

const defaultCalculatingData = {deposits: 0, rewards: 0}
const defaultClaimableData = {charityFee: 0, bonusEnd: 0, fullReward: 0, claimableReward: 0}

const MiningItem: FC<TProps> = (props: TProps) => {
  const alert = useAlert()

  const [ calculatingData, setCalculatingData ] = useState(defaultCalculatingData)
  const [ claimableData, setClaimableData ] = useState(defaultClaimableData)

  const userAddress = authStore.blockchainStore.address

  const { mining } = props

  useEffect(() => {
    if (mining.status === EMiningStatus.CALCULATING) {
      getUserStake(mining, userAddress).then(res => {
        if (res) {
          setCalculatingData(res)
        }
      })
    } else {
      getDropiumInfo(mining, userAddress).then(res => {
        if (res) {
          setClaimableData(res)
        }
      })
    }
  }, [userAddress, mining]);


  const renderRewards = (mining: TMining) => {
    if (mining.status === EMiningStatus.CALCULATING) {
      return (
        <div>Current reward: {calculatingData.rewards.toFixed(3)} $OPIUM</div>
      )
    }
    return (
      <div>
        <div>Full reward: {claimableData.fullReward} $OPIUM</div>
        <div>Claimable reward: {claimableData.claimableReward} $OPIUM</div>
      </div>
    )
  }

  const renderFee = (mining: TMining) => {
    if (mining.status === EMiningStatus.CALCULATING) {
      return (
        <div>Your stake: {calculatingData.deposits} LP tokens</div>
      )
    }
    return (
      <div>
        <div>Charity fee: {(claimableData.charityFee * 100).toFixed()}%</div>
        <div>Charity fee ends: {moment.unix(claimableData.bonusEnd).format('DD-MMM-YY').toUpperCase()}</div>
      </div>
    )
  }

  const claim = async () => {
    await claimReward(mining, userAddress, () => alert.success('Successfully claimed'), (e) => alert.error(e.message))
  }

  return (
    <div className='mining-item-wrapper' key={mining.title}>
        <div className='mining-item-title'>{mining.title}</div>
        <div className='mining-item-reward'>{renderRewards(mining)}</div>
        <div className='mining-item-fee'>{renderFee(mining)}</div>
        <div className='mining-item-button-wrapper'><Button variant='secondary' theme={ETheme.LIGHT} disabled={claimableData.claimableReward === 0} label='claim' onClick={claim}/></div>
    </div>
  )
}

export default observer(MiningItem)
