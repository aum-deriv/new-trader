class DerivAPIService {
  private static instance: DerivAPIService;
  private socket: WebSocket | null = null;
  private app_id = '1089'; // Demo app_id, replace with your actual app_id
  private connectionPromise: Promise<void> | null = null;

  private constructor() {
    this.connect();
  }

  public static getInstance(): DerivAPIService {
    if (!DerivAPIService.instance) {
      DerivAPIService.instance = new DerivAPIService();
    }
    return DerivAPIService.instance;
  }

  private connect() {
    if (this.connectionPromise) return this.connectionPromise;

    this.connectionPromise = new Promise((resolve, reject) => {
      this.socket = new WebSocket(`wss://red.derivws.com/websockets/v3?app_id=${this.app_id}&l=EN&brand=deriv`);
      
      this.socket.onopen = () => {
        console.log('Connected to Deriv API');
        resolve();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket Error:', error);
        reject(error);
      };

      this.socket.onclose = () => {
        console.log('WebSocket connection closed');
        this.connectionPromise = null;
      };
    });

    return this.connectionPromise;
  }

  public async getActiveSymbols(): Promise<any> {
    try {
      await this.connect();

      return new Promise((resolve, reject) => {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
          reject(new Error('Socket is not connected'));
          return;
        }

        const request = {
          active_symbols: 'brief',
          product_type: 'basic'
        };

        const handleMessage = (msg: MessageEvent) => {
          const response = JSON.parse(msg.data);
          if (response.error) {
            reject(response.error);
          } else if (response.active_symbols) {
            this.socket?.removeEventListener('message', handleMessage);
            resolve(response.active_symbols);
          }
        };

        this.socket.addEventListener('message', handleMessage);
        this.socket.send(JSON.stringify(request));
      });
    } catch (error) {
      console.error('Error in getActiveSymbols:', error);
      throw error;
    }
  }

  public async getContractsForCompany(): Promise<any> {
    try {
      await this.connect();

      return new Promise((resolve, reject) => {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
          reject(new Error('Socket is not connected'));
          return;
        }

        const request = {
          contracts_for_company: 1
        };

        const handleMessage = (msg: MessageEvent) => {
          const response = JSON.parse(msg.data);
          if (response.error) {
            reject(response.error);
          } else if (response.contracts_for_company) {
            this.socket?.removeEventListener('message', handleMessage);
            resolve(response.contracts_for_company);
          }
        };

        this.socket.addEventListener('message', handleMessage);
        this.socket.send(JSON.stringify(request));
      });
    } catch (error) {
      console.error('Error in getContractsForCompany:', error);
      throw error;
    }
  }

  public async getContractsForSymbol(symbol: string): Promise<any> {
    try {
      await this.connect();

      return new Promise((resolve, reject) => {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
          reject(new Error('Socket is not connected'));
          return;
        }

        const requestId = Math.floor(Math.random() * 1000000);
        const request = {
          contracts_for: symbol,
          currency: 'USD',
          landing_company: 'svg',
          product_type: 'basic',
          req_id: requestId,
        };

        const handleMessage = (event: MessageEvent) => {
          const response = JSON.parse(event.data);
          if (response.req_id === requestId) {
            this.socket?.removeEventListener('message', handleMessage);
            if (response.error) {
              reject(response.error);
            } else {
              resolve(response.contracts_for);
            }
          }
        };

        this.socket.addEventListener('message', handleMessage);
        this.socket.send(JSON.stringify(request));
      });
    } catch (error) {
      console.error('Error in getContractsForSymbol:', error);
      throw error;
    }
  }

  public async subscribeTicks(symbol: string): Promise<any> {
    try {
      await this.connect();

      return new Promise((resolve, reject) => {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
          reject(new Error('Socket is not connected'));
          return;
        }

        const request = {
          ticks: symbol,
          subscribe: 1
        };

        this.socket.send(JSON.stringify(request));
        
        const handleResponse = (response: any) => {
          const data = JSON.parse(response.data);
          if (data.error) {
            this.socket?.removeEventListener('message', handleResponse);
            reject(data.error);
          } else if (data.msg_type === 'tick') {
            this.socket?.removeEventListener('message', handleResponse);
            resolve(data);
          }
        };

        this.socket.addEventListener('message', handleResponse);
      });
    } catch (error) {
      console.error('Error in subscribeTicks:', error);
      throw error;
    }
  }

  public async unsubscribe(subscriptionId: string): Promise<void> {
    try {
      await this.connect();

      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        throw new Error('Socket is not connected');
      }

      const request = {
        forget: subscriptionId
      };

      this.socket.send(JSON.stringify(request));
    } catch (error) {
      console.error('Error in unsubscribe:', error);
      throw error;
    }
  }

  public onMessage(callback: (response: any) => void): void {
    if (!this.socket) {
      throw new Error('Socket is not initialized');
    }

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      callback(data);
    };

    this.socket.addEventListener('message', handleMessage);
  }
}

export default DerivAPIService;
