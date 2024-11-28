import { useState, useEffect } from 'react'
import DerivAPIService from '../services/DerivAPIService'
import { ActiveSymbol, ContractType, CombinedContractType } from '../types/deriv'
import TradeSelection from './TradeSelection'
import TradeParameters from './TradeParameters'
import './TradeTop.css'

function TradeTop() {
  const [market, setMarket] = useState<string>('')
  const [tradeType, setTradeType] = useState<string>('')
  const [symbols, setSymbols] = useState<ActiveSymbol[]>([])
  const [contractTypes, setContractTypes] = useState<CombinedContractType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSymbol, setSelectedSymbol] = useState<ActiveSymbol | null>(null)
  const [selectedContract, setSelectedContract] = useState<ContractType | null>(null)

  const getContractCategory = (contract: ContractType): string => {
    if (contract.contract_category.includes('callput')) {
      if (contract.barrier_category === 'euro_atm') {
        return 'rise_fall'
      }
      if (contract.barrier_category === 'euro_non_atm') {
        return 'higher_lower'
      }
    }
    return contract.contract_category
  }

  const getDisplayName = (category: string): string => {
    const displayNames: Record<string, string> = {
      'rise_fall': 'Rise/Fall',
      'higher_lower': 'Higher/Lower'
    }
    return displayNames[category] || category
  }

  const combineContractTypes = (contracts: ContractType[]): CombinedContractType[] => {
    const contractMap = new Map<string, CombinedContractType>()

    contracts.forEach(contract => {
      const category = getContractCategory(contract)
      
      if (!contractMap.has(category)) {
        contractMap.set(category, {
          contract_category: category,
          contract_category_display: getDisplayName(category),
          barrier_category: contract.barrier_category,
          sentiments: [{ contract_type: contract.contract_type, sentiment: contract.sentiment }],
          display_name: contract.display_name,
          default_stake: contract.default_stake,
          min_contract_duration: contract.min_contract_duration,
          name: contract.name,
          title: contract.title,
        })
      } else {
        const existing = contractMap.get(category)!
        if (!existing.sentiments.includes({ contract_type: contract.contract_type, sentiment: contract.sentiment })) {
          existing.sentiments.push({ contract_type: contract.contract_type, sentiment: contract.sentiment })
        }
      }
    })

    return Array.from(contractMap.values())
      .filter(contract => contract.sentiments.length >= 1)
      .sort((a, b) => {
        // Always put Rise/Fall first
        if (a.contract_category === 'rise_fall') return -1
        if (b.contract_category === 'rise_fall') return 1
        // For all other categories, sort alphabetically
        return a.contract_category_display.localeCompare(b.contract_category_display)
      })
  }

  const findMatchingContract = (contracts: ContractType[], selectedCategory: string) => {
    return contracts.find(contract => {
      const category = getContractCategory(contract)
      return category === selectedCategory
    })
  }

  const updateSelectedContracts = async () => {
    if (!selectedSymbol) return

    try {
      const derivAPI = DerivAPIService.getInstance()
      const response = await derivAPI.getContractsForSymbol(selectedSymbol.symbol)
      
      // Find the matching contract based on the selected trade type
      const displayToCategory: Record<string, string> = {
        'Rise/Fall': 'rise_fall',
        'Higher/Lower': 'higher_lower'
      }
      const selectedCategory = Object.entries(displayToCategory).find(
        ([display]) => display === tradeType
      )?.[1]

      if (selectedCategory) {
        const matchingContract = findMatchingContract(response.available, selectedCategory)
        console.log('Selected Contract Details:', matchingContract)
        setSelectedContract(matchingContract || null)
      }
    } catch (err) {
      console.error('Error fetching contracts for symbol:', err)
    }
  }

  useEffect(() => {
    updateSelectedContracts()
  }, [selectedSymbol, tradeType])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const derivAPI = DerivAPIService.getInstance()
        const [activeSymbols, contractsForCompany] = await Promise.all([
          derivAPI.getActiveSymbols(),
          derivAPI.getContractsForCompany()
        ])
        
        setSymbols(activeSymbols)
        const combinedTypes = combineContractTypes(contractsForCompany.available)
        setContractTypes(combinedTypes)

        if (activeSymbols.length > 0) {
          const firstSymbol = activeSymbols[0]
          setMarket(firstSymbol.display_name)
          setSelectedSymbol(firstSymbol)
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

  const handleMarketChange = (newMarket: string) => {
    setMarket(newMarket)
    const symbol = symbols.find(s => s.display_name === newMarket)
    setSelectedSymbol(symbol || null)
  }

  if (loading) {
    return <div className="trade-top">Loading data...</div>
  }

  if (error) {
    return <div className="trade-top">Error: {error}</div>
  }

  return (
    <div className="trade-top">
      <div className="trade-container">
        <TradeSelection
          market={market}
          tradeType={tradeType}
          symbols={symbols}
          contractTypes={contractTypes}
          onMarketChange={handleMarketChange}
          onTradeTypeChange={setTradeType}
        />
        <TradeParameters
          minimumDuration={selectedContract?.min_contract_duration ?? ''}
          currency="USD"
          defaultStake={selectedContract?.default_stake ?? 0}
        />
      </div>
      <div className="purchase-container">
        {/* Purchase content will go here */}
      </div>
    </div>
  )
}

export default TradeTop
