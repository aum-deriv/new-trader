import { useState, useEffect } from 'react'
import './App.css'
import DerivAPIService from './services/DerivAPIService'
import { ActiveSymbol, ContractType, CombinedContractType } from './types/deriv'
import TradeSelection from './components/TradeSelection'
import TradeParameters from './components/TradeParameters'

function App() {
  const [market, setMarket] = useState<string>('')
  const [tradeType, setTradeType] = useState<string>('')
  const [symbols, setSymbols] = useState<ActiveSymbol[]>([])
  const [contractTypes, setContractTypes] = useState<CombinedContractType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getContractCategory = (contract: ContractType): string => {
    // Normalize contract categories to handle variations of the same type
    if (contract.contract_category.includes('callput')) {
      if (contract.barrier_category === 'euro_atm') {
        return 'rise_fall';
      }
      if (contract.barrier_category === 'euro_non_atm') {
        return 'higher_lower';
      }
    }
    return contract.contract_category;
  };

  const getDisplayName = (category: string): string => {
    const displayNames: Record<string, string> = {
      'rise_fall': 'Rise/Fall',
      'higher_lower': 'Higher/Lower'
    };
    return displayNames[category] || category;
  };

  const combineContractTypes = (contracts: ContractType[]): CombinedContractType[] => {
    const contractMap = new Map<string, CombinedContractType>();

    contracts.forEach(contract => {
      const category = getContractCategory(contract);
      
      if (!contractMap.has(category)) {
        contractMap.set(category, {
          contract_category: category,
          contract_category_display: getDisplayName(category),
          barrier_category: contract.barrier_category,
          sentiments: [contract.sentiment]
        });
      } else {
        const existing = contractMap.get(category)!;
        if (!existing.sentiments.includes(contract.sentiment)) {
          existing.sentiments.push(contract.sentiment);
        }
      }
    });

    return Array.from(contractMap.values())
      .filter(contract => contract.sentiments.length >= 1)
      .sort((a, b) => a.contract_category_display.localeCompare(b.contract_category_display));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const derivAPI = DerivAPIService.getInstance()
        const [activeSymbols, contractsForCompany] = await Promise.all([
          derivAPI.getActiveSymbols(),
          derivAPI.getContractsForCompany()
        ]);
        
        setSymbols(activeSymbols)
        const combinedTypes = combineContractTypes(contractsForCompany.available);
        setContractTypes(combinedTypes)

        // Set default values from the first items
        if (activeSymbols.length > 0) {
          setMarket(activeSymbols[0].display_name)
        }
        if (combinedTypes.length > 0) {
          setTradeType(combinedTypes[0].contract_category_display)
        }

        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="app-container">Loading data...</div>
  }

  if (error) {
    return <div className="app-container">Error: {error}</div>
  }

  return (
    <div className="app-container">
      <div className="trade-container">
        <TradeSelection
          market={market}
          tradeType={tradeType}
          symbols={symbols}
          contractTypes={contractTypes}
          onMarketChange={setMarket}
          onTradeTypeChange={setTradeType}
        />
        <TradeParameters
          minimumDuration="1 minute"
          currency="USD"
        />
      </div>
    </div>
  )
}

export default App
