import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const PROTO_PATH = path.join(process.cwd(), 'lib/lightwalletd/service.proto');

// Public Lightwalletd endpoints
const LIGHTWALLETD_ENDPOINTS = [
  'mainnet-lightwalletd.zecwallet.co:9067',
  'lightwalletd.electriccoin.co:9067',
  'zcash.blockchair.com:50051',
];

let cachedClient: any = null;

export async function getLightwalletdClient() {
  if (cachedClient) {
    return cachedClient;
  }

  try {
    // Load proto file
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
    const CompactTxStreamer = (protoDescriptor.cash as any).z.wallet.sdk.rpc.CompactTxStreamer;

    // Try endpoints in order
    for (const endpoint of LIGHTWALLETD_ENDPOINTS) {
      try {
        const client = new CompactTxStreamer(
          endpoint,
          grpc.credentials.createInsecure()
        );

        // Test connection with GetLightdInfo
        await new Promise((resolve, reject) => {
          client.GetLightdInfo({}, (error: any, response: any) => {
            if (error) {
              reject(error);
            } else {
              resolve(response);
            }
          });
        });

        console.log(`[Lightwalletd] Connected: ${endpoint}`);
        cachedClient = { client, endpoint };
        return cachedClient;
      } catch (error) {
        console.log(`[Lightwalletd] Failed to connect to ${endpoint}:`, error);
        continue;
      }
    }

    throw new Error('Failed to connect to any Lightwalletd endpoint');
  } catch (error) {
    console.error('Lightwalletd client error:', error);
    throw error;
  }
}

export async function getAddressBalance(address: string): Promise<number> {
  try {
    const { client } = await getLightwalletdClient();

    return new Promise((resolve, reject) => {
      // Use AddressList format (real Lightwalletd expects an array)
      client.GetTaddressBalance({ addresses: [address] }, (error: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          // Convert zatoshis to ZEC (1 ZEC = 100,000,000 zatoshis)
          const balanceZEC = parseInt(response.valueZat || '0') / 100000000;
          resolve(balanceZEC);
        }
      });
    });
  } catch (error) {
    console.error('Get address balance error:', error);
    throw error;
  }
}

export async function getLightdInfo() {
  try {
    const { client } = await getLightwalletdClient();

    return new Promise((resolve, reject) => {
      client.GetLightdInfo({}, (error: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  } catch (error) {
    console.error('Get lightd info error:', error);
    throw error;
  }
}

