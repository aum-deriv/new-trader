import { useState, useEffect } from 'react';
import Dropdown from './Dropdown';
import './TradeParameters.css';

interface TradeParametersProps {
  minimumDuration: string;
  currency: string;
  defaultStake: number;
}

function TradeParameters({ minimumDuration, currency, defaultStake }: TradeParametersProps) {
  const [durationType, setDurationType] = useState('Duration');
  const [timeUnit, setTimeUnit] = useState('Minutes');
  const [duration, setDuration] = useState('');
  const [tradeType, setTradeType] = useState('Stake');
  const [amount, setAmount] = useState(0);
  const [allowEquals, setAllowEquals] = useState(false);
  const [startTime, setStartTime] = useState('Now');

  // Update duration when minimumDuration changes
  useEffect(() => {
    if (minimumDuration) {
      // Extract numeric value from minimumDuration (e.g., "5" from "5m")
      const numericValue = minimumDuration.replace(/[mhd]/g, '')
      setDuration(numericValue)

      // Set the time unit based on the suffix
      const unit = minimumDuration.slice(-1)
      switch(unit) {
        case 'm':
          setTimeUnit('Minutes')
          break
        case 'h':
          setTimeUnit('Hours')
          break
        case 'd':
          setTimeUnit('Days')
          break
      }
    }
  }, [minimumDuration])

  // Update amount when defaultStake changes
  useEffect(() => {
    setAmount(defaultStake)
  }, [defaultStake])

  // Get numeric value for display
  const getMinimumValue = () => {
    return minimumDuration.replace(/[mhd]/g, '')
  }

  return (
    <div className="trade-parameters">
      <div className="duration-container">
        <div className="start-time-row">
          <Dropdown
            label="Start Time"
            options={['Now']}
            value={startTime}
            onChange={setStartTime}
          />
        </div>
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
              Minimum: {getMinimumValue()}
            </div>
          </div>
          <Dropdown
            label=""
            options={['Hours', 'Minutes', 'Seconds', 'Ticks', 'Days']}
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
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="amount-input"
            />
            <span className="currency-label">{currency}</span>
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
