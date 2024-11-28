class DerivAPIService {
  private static instance: DerivAPIService;
  private socket: WebSocket | null = null;
  private app_id = '1089'; // Demo app_id, replace with your actual app_id
  private connectionPromise: Promise<void> | null = null;
  private messageHandlers: Set<(response: any) => void> = new Set();

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

      this.socket.onmessage = (event) => {
        const response = JSON.parse(event.data);
        this.messageHandlers.forEach(handler => handler(response));
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

        const handleMessage = (response: any) => {
          if (response.error) {
            reject(response.error);
            return;
          }
          if (response.active_symbols) {
            resolve(response.active_symbols);
          }
        };

        // Add temporary handler for subscription response
        this.messageHandlers.add(handleMessage);
        
        // Remove it after getting the response
        setTimeout(() => {
          this.messageHandlers.delete(handleMessage);
        }, 5000);

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

        const handleMessage = (response: any) => {
          if (response.error) {
            reject(response.error);
            return;
          }
          if (response.contracts_for_company) {
            resolve(response.contracts_for_company);
          }
        };

        // Add temporary handler for subscription response
        this.messageHandlers.add(handleMessage);
        
        // Remove it after getting the response
        setTimeout(() => {
          this.messageHandlers.delete(handleMessage);
        }, 5000);

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

        const handleMessage = (response: any) => {
          if (response.req_id === requestId) {
            if (response.error) {
              reject(response.error);
            } else {
              resolve(response.contracts_for);
            }
          }
        };

        // Add temporary handler for subscription response
        this.messageHandlers.add(handleMessage);
        
        // Remove it after getting the response
        setTimeout(() => {
          this.messageHandlers.delete(handleMessage);
        }, 5000);

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
          if (response.error) {
            reject(response.error);
            return;
          }
          if (response.msg_type === 'tick') {
            resolve(response);
          }
        };

        // Add temporary handler for subscription response
        this.messageHandlers.add(handleResponse);
        
        // Remove it after getting the response
        setTimeout(() => {
          this.messageHandlers.delete(handleResponse);
        }, 5000);
      });
    } catch (error) {
      console.error('Error in subscribeTicks:', error);
      throw error;
    }
  }

  public onMessage(callback: (response: any) => void): () => void {
    this.messageHandlers.add(callback);
    return () => this.messageHandlers.delete(callback);
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
}

export default DerivAPIService;
