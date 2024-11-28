import { ActiveSymbol, CombinedContractType } from '../types/deriv'
import Dropdown from './Dropdown'
import './Dropdown.css'

interface TradeSelectionProps {
  market: string
  tradeType: string
  symbols: ActiveSymbol[]
  contractTypes: CombinedContractType[]
  onMarketChange: (value: string) => void
  onTradeTypeChange: (value: string) => void
  onSymbolSelect: (symbol: ActiveSymbol) => void
}

function TradeSelection({
  market,
  tradeType,
  symbols,
  contractTypes,
  onMarketChange,
  onTradeTypeChange,
  onSymbolSelect
}: TradeSelectionProps) {
  const getContractDisplayName = (contract: CombinedContractType): string => {
    return contract.contract_category_display;
  };

  const handleMarketChange = (value: string) => {
    console.log('Market changed in TradeSelection:', value)
    onMarketChange(value)
    const selectedSymbol = symbols.find(s => s.display_name === value)
    console.log('Found symbol:', selectedSymbol)
    if (selectedSymbol) {
      onSymbolSelect(selectedSymbol)
    }
  };

  console.log('TradeSelection render - symbols:', symbols, 'market:', market)

  return (
    <div className="dropdowns-container">
      <Dropdown
        label="Market"
        options={symbols.map(symbol => symbol.display_name)}
        value={market}
        onChange={handleMarketChange}
      />
      <Dropdown
        label="Trade Type"
        options={contractTypes.map(getContractDisplayName)}
        value={tradeType}
        onChange={onTradeTypeChange}
      />
    </div>
  );
}

export default TradeSelection;
