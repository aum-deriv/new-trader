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
  contract_category_display: string;
  display_name: string;
  name: string;
  sentiment: string;
  title: string;
}

export interface ContractsForCompany {
  available: ContractType[];
  unavailable: ContractType[];
}
