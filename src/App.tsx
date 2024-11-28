import { useState } from 'react'
import './App.css'
import TradeTop from './components/TradeTop'
import TradeBottom from './components/TradeBottom'
import { ActiveSymbol } from './types/deriv'

function App() {
  const [selectedSymbol, setSelectedSymbol] = useState<ActiveSymbol | null>(null)

  const handleSymbolSelect = (symbol: ActiveSymbol | null) => {
    console.log('Symbol selected in App:', symbol)
    setSelectedSymbol(symbol)
  }

  return (
    <div className="app">
      <TradeTop onSymbolSelect={handleSymbolSelect} />
      {selectedSymbol ? (
        <TradeBottom symbol={selectedSymbol.symbol} />
      ) : (
        <div className="trade-bottom">
          <h3>Select a market to view the price chart</h3>
        </div>
      )}
    </div>
  )
}

export default App