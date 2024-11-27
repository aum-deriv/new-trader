import { useState } from 'react';
import Dropdown from './Dropdown';
import './TradeParameters.css';

interface TradeParametersProps {
  minimumDuration: string;
  currency: string;
}

function TradeParameters({ minimumDuration, currency }: TradeParametersProps) {
  const [durationType, setDurationType] = useState('Duration');
  const [timeUnit, setTimeUnit] = useState('Minutes');
  const [duration, setDuration] = useState('');
  const [tradeType, setTradeType] = useState('Stake');
  const [amount, setAmount] = useState('');
  const [allowEquals, setAllowEquals] = useState(false);

  return (
    <div className="trade-parameters">
      <div className="duration-container">
        <div className="duration-row">
          <Dropdown
            label=""
            options={['Duration', 'End Time']}
            value={durationType}
            onChange={setDurationType}
          />
          <div className="duration-input-container">
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="duration-input"
            />
            <div className="validation-message">
              Minimum: {minimumDuration}
            </div>
          </div>
          <Dropdown
            label=""
            options={['Hours', 'Minutes', 'Seconds', 'Ticks']}
            value={timeUnit}
            onChange={setTimeUnit}
          />
        </div>
      </div>

      <div className="amount-container">
        <div className="amount-row">
          <Dropdown
            label=""
            options={['Stake', 'Payout']}
            value={tradeType}
            onChange={setTradeType}
          />
          <div className="amount-input-container">
            <span className="currency-label">{currency}</span>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="amount-input"
            />
          </div>
        </div>
      </div>

      <div className="equals-container">
        <label className="equals-label">
          <input
            type="checkbox"
            checked={allowEquals}
            onChange={(e) => setAllowEquals(e.target.checked)}
            className="equals-checkbox"
          />
          Allow equals
          <div className="info-icon" title="Win payout if exit spot is equal to entry spot">
            ⓘ
          </div>
        </label>
      </div>
    </div>
  );
}

export default TradeParameters;
