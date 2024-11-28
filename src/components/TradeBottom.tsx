import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TickData } from '../types/deriv'
import DerivAPIService from '../services/DerivAPIService'
import './TradeBottom.css'

interface TradeBottomProps {
  symbol: string;
}

interface ChartData {
  time: string;
  ask: number;
  bid: number;
}

function TradeBottom({ symbol }: TradeBottomProps) {
  const [ticksData, setTicksData] = useState<ChartData[]>([])
  const [subscription, setSubscription] = useState<string | null>(null)

  useEffect(() => {
    if (!symbol) return

    console.log('Subscribing to ticks for symbol:', symbol)
    
    const handleTicksStream = (response: any) => {
      console.log('Received tick data:', response)
      if (response.tick) {
        const tick = response.tick as TickData
        const time = new Date(tick.epoch * 1000).toLocaleTimeString()
        
        setTicksData(prevData => {
          const newData = [...prevData, { 
            time, 
            ask: tick.ask,
            bid: tick.bid
          }]
          // Keep last 50 data points for better visualization
          return newData.slice(-50)
        })
      }
    }

    const subscribeToTicks = async () => {
      try {
        const derivAPI = DerivAPIService.getInstance()
        
        // Unsubscribe from previous subscription if exists
        if (subscription) {
          console.log('Unsubscribing from previous subscription:', subscription)
          await derivAPI.unsubscribe(subscription)
        }

        console.log('Subscribing to new symbol:', symbol)
        const response = await derivAPI.subscribeTicks(symbol)
        console.log('Subscription response:', response)
        
        if (response.subscription?.id) {
          setSubscription(response.subscription.id)
        }
        derivAPI.onMessage(handleTicksStream)
      } catch (error) {
        console.error('Error subscribing to ticks:', error)
      }
    }

    subscribeToTicks()

    return () => {
      if (subscription) {
        console.log('Cleaning up subscription:', subscription)
        DerivAPIService.getInstance().unsubscribe(subscription)
      }
    }
  }, [symbol, subscription])

  console.log('Current ticks data:', ticksData)

  return (
    <div className="trade-bottom">
      <h3>Price Chart for {symbol}</h3>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={ticksData}
            margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              interval="preserveStartEnd"
              minTickGap={50}
            />
            <YAxis
              domain={['auto', 'auto']}
              tickFormatter={(value) => value.toFixed(2)}
            />
            <Tooltip />
            <Line
              name="Ask"
              dataKey="ask"
              stroke="#2196F3"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default TradeBottom
