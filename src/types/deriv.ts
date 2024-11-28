export interface ActiveSymbol {
  allow_forward_starting: number;
  display_name: string;
  exchange_is_open: number;
  is_trading_suspended: number;
  market: string;
  market_display_name: string;
  pip: number;
  submarket: string;
  submarket_display_name: string;
  symbol: string;
  symbol_type: string;
}

export interface ContractType {
  barrier_category: string;
  contract_category_display: string;
  contract_category: string;
  contract_type: string;
  display_name: string;
  default_stake: number;
  min_contract_duration: string;
  name: string;
  sentiment: string;
  title: string;
}

export interface ContractsForCompany {
  available: ContractType[];
  unavailable: ContractType[];
}

export interface CombinedContractType {
  barrier_category: string;
  contract_category_display: string;
  contract_category: string;
  display_name: string;
  default_stake: number;
  min_contract_duration: string;
  name: string;
  sentiments: Array<{contract_type: string, sentiment: string}>;
  title: string;
}
