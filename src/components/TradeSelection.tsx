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
}

function TradeSelection({
  market,
  tradeType,
  symbols,
  contractTypes,
  onMarketChange,
  onTradeTypeChange
}: TradeSelectionProps) {
  const getContractDisplayName = (contract: CombinedContractType): string => {
    return contract.contract_category_display;
  };

  return (
    <div className="dropdowns-container">
      <Dropdown
        label="Market"
        options={symbols.map(symbol => symbol.display_name)}
        value={market}
        onChange={onMarketChange}
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
