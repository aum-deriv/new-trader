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
}

export default DerivAPIService;
