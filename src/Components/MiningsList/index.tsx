import { FC } from 'react'
import { observer } from 'mobx-react'
import appStore from '../../Services/Stores/AppStore'

import DropiumMiningItem from '../DropiumMiningItem'
import StakingMiningItem from '../StakingMiningItem'
import './styles.scss'
import { EMiningType } from '../../Services/Utils/types'

const MiningsList: FC<{}> = () => {

  return (
    <div className='minings-wrapper'>
      {appStore.miningsByNetwork.length 
        ? appStore.miningsByNetwork.map((mining) => {
            return mining.type === EMiningType.DROPIUM 
              ? <DropiumMiningItem mining={mining} key={mining.title}/>
              : <StakingMiningItem mining={mining} key={mining.title}/>
        }) 
        : <div className='no-minings'>Import liquidity mining programs to see them</div>
    }
    </div>
  )
}

export default observer(MiningsList)

