import './App.css';
import Header from './Components/Header'
import Minings from './Components/MiningsList'
import { positions, Provider as AlertProvider } from 'react-alert'

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
        <Header />
        <Minings />
      </div>
    </AlertProvider>
  );
}

export default App;
