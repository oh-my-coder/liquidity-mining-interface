import { FC } from 'react'
import { observer } from 'mobx-react'
import appStore from '../../Services/Stores/AppStore'

import MiningItem from '../MiningItem'
import './styles.scss'

const MiningsList: FC<{}> = () => {

  return (
    <div className='minings-wrapper'>
      {appStore.miningsByNetwork.length ? 
      appStore.miningsByNetwork.map((mining) => {
        return (
          <MiningItem mining={mining} key={mining.title}/>
        )
      }) :
      <div className='no-minings'>Import liquidity mining programs to see them</div>
    }
    </div>
  )
}

export default observer(MiningsList)

