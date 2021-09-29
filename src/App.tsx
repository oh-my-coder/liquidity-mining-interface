import './App.css';
import Header from './Components/Header'
import Minings from './Components/MiningsList'
import { positions, Provider as AlertProvider } from 'react-alert'
import { BrowserView, MobileView } from "react-device-detect"

const options = {
  timeout: 5000,
  position: positions.TOP_CENTER,
  containerStyle: {
    zIndex: 100, 
  }
}

const AlertTemplate = ({options, message, close }:any) => (
  <div style={{ 
    margin: 20, 
    borderRadius: 10, 
    display: 'flex', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-evenly', 
    width: '20rem', 
    height: '4rem', 
    backgroundColor: (options.type === 'error' ? '#F6029C' : '#2ECD94'), 
    color: '#0A0A1E',
    padding: '1rem'
  }}>
    {message}
  </div>
) 

function App() {
  return (
    <AlertProvider template={AlertTemplate} {...options}>
      <div className="App">
        <MobileView >
          <div className='mobile-text'>Liquidity mining interface does not support mobile devices yet. <br/><br/> Please use desktop version.</div>
        </MobileView>
        <BrowserView>
          <Header />
          <Minings />
        </BrowserView>
      </div>
    </AlertProvider>
  );
}

export default App;
