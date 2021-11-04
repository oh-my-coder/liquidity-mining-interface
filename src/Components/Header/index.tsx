import { FC, useState } from 'react'
import { observer } from 'mobx-react'
import { useAlert } from 'react-alert'
import { Button, DropdownSelector, OpiumLink, ETheme, Popup } from '@opiumteam/react-opium-components'
import authStore from '../../Services/Stores/AuthStore'
import appStore from '../../Services/Stores/AppStore'
import { AuthType } from '@opiumteam/mobx-web3'
import axios from 'axios'

import './styles.scss'
import { TMining } from '../../Services/Utils/types'


const dropdownItems = [
  { title: 'Ethereum', value: '1' },
  { title: 'Binance', value: '56' },
  { title: 'Polygon', value: '137' },
]

const Header: FC<{}> = () => {

  const [dropDownTitle, setDropDownTitle] = useState(dropdownItems[0].title)
  const [showImport, setShowImport] = useState(false)
  const alert = useAlert()

  const handleSelect = (index: string) => {
    setDropDownTitle(dropdownItems[+index].title)
    authStore.changeNetwork(dropdownItems[+index].title, +dropdownItems[+index].value)
  }

  const { requiredNetworkName, currentNetworkName, address} = authStore.blockchainStore

  const getMinings = () => {
    const url = window.prompt('Enter url to load new minings')
    if (!url) return
    axios.get(url).then(res => {
      appStore.setMinings(res.data)
      setShowImport(false)
      alert.success('New minings are loaded')
    }).catch(e => {
      console.log(e.message)
      alert.error('Unable to load minings, see console for more info')
    })
  }

  const getMiningsFromJson = () => {
    let data = window.prompt('Enter url to load new minings')
    if (!data) return
    try {
      const parsedData = JSON.parse(data) as TMining[]
      appStore.setMinings(parsedData)
      setShowImport(false)
      alert.success('New minings are loaded')
    } catch {
      alert.error('Unable to load minings, JSON is incorrect')
      return
    }
  }



  return (
    <div className='header-wrapper'>
      <Popup
        theme={ETheme.LIGHT}
        titleSize="lg"
        title="Choose the import way"
        subtitle="You can choose if you want to import new minings either from any URL or paste the JSON"
        className='positions-list-popup'
        popupIsOpen={showImport}
        closePopup={() => setShowImport(false)}
        component={
          <div className='import-popup-buttons'>
          <Button 
            variant='secondary' 
            theme={ETheme.LIGHT}
            label={'from URL'} 
            onClick={getMinings} 
          />
          <Button 
            variant='secondary' 
            theme={ETheme.LIGHT}
            label={'from JSON'} 
            onClick={getMiningsFromJson} 
          />
        </div>
        }
      />
      <div className='header-title'>Liquidity Mining Interface</div>
      <DropdownSelector
        title={dropDownTitle}
        items={dropdownItems}
        onSelect={(eventKey) => handleSelect(eventKey)}
        theme={ETheme.LIGHT}
      />
      <div className={`header-network-wrapper ${requiredNetworkName !== currentNetworkName && 'red-network'}`}>
        <div>Required network: {requiredNetworkName}</div>
        <div>You current network: {currentNetworkName}</div>
      </div>
      <Button 
        variant='secondary' 
        theme={ETheme.LIGHT}
        label={'import minings'} 
        onClick={() => setShowImport(true)} 
      />
      <div className='header-buttons-wrapper'>
        {(authStore.loggedIn && authStore.blockchainStore.address) && 
        <OpiumLink theme={ETheme.LIGHT} newTab={true} label={address} href={`https://etherscan.io/address/${address}`} />
      }
      <Button 
        variant='secondary' 
        theme={ETheme.LIGHT}
        label={(authStore.loggedIn && address) ? 'logout' : 'login'} 
        onClick={(authStore.loggedIn && address) ? () => authStore.blockchainStore.logout() : () => authStore.blockchainStore.login(AuthType.INJECTED)} 
      />
      </div>
    </div>
  )
}

export default observer(Header)
