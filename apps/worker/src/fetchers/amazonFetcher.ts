import { JsonValue } from "@repo/prisma-client/src/generated/client/runtime/library";
import { fetcher } from "./fetcher";
import logger from "../utils/logger";
import { PROXY_PASSWORD } from "../utils/env";

type ItemResponse = {
  ASIN: string;
  Type: string;
  sortOfferInfo: string;
  isPrimeEligible: string;
  Value: {
    content: {
      twisterSlotJson: {
        isAvailable: boolean;
        price: string;
      };
      twisterSlotDiv: string;
    };
  };
};

const proxyList = [
  { ip: "89.43.32.224:6052", username: "xythxvbw" },
  { ip: "185.72.242.170:5853", username: "xythxvbw" },
  { ip: "23.109.208.129:6653", username: "xythxvbw" },
  { ip: "192.95.91.204:5831", username: "xythxvbw" },
  { ip: "45.61.96.231:6211", username: "xythxvbw" },
  { ip: "85.198.47.9:6277", username: "xythxvbw" },
  { ip: "103.114.59.186:6963", username: "xythxvbw" },
  { ip: "104.250.201.56:6601", username: "xythxvbw" },
  { ip: "206.41.164.15:6314", username: "xythxvbw" },
  { ip: "45.151.162.50:6452", username: "xythxvbw" },
  { ip: "85.198.46.231:6499", username: "xythxvbw" },
  { ip: "64.137.96.22:6589", username: "xythxvbw" },
  { ip: "103.3.227.95:6648", username: "xythxvbw" },
  {
    ip: "172.245.157.116:6701",
    username: "xythxvbw",
  },
  { ip: "93.113.150.11:6422", username: "xythxvbw" },
  {
    ip: "168.199.227.144:6923",
    username: "xythxvbw",
  },
  {
    ip: "168.199.227.193:6972",
    username: "xythxvbw",
  },
  { ip: "147.136.64.27:5790", username: "xythxvbw" },
  { ip: "88.218.105.12:5776", username: "xythxvbw" },
  {
    ip: "168.199.132.239:6311",
    username: "xythxvbw",
  },
  { ip: "172.98.169.195:6619", username: "xythxvbw" },
  { ip: "104.143.229.19:5947", username: "xythxvbw" },
  {
    ip: "168.199.132.160:6232",
    username: "xythxvbw",
  },
  { ip: "168.199.227.39:6818", username: "xythxvbw" },
  { ip: "64.137.104.32:5642", username: "xythxvbw" },
  {
    ip: "168.199.132.133:6205",
    username: "xythxvbw",
  },
  { ip: "64.137.106.65:6558", username: "xythxvbw" },
  { ip: "168.199.227.18:6797", username: "xythxvbw" },
  {
    ip: "168.199.132.235:6307",
    username: "xythxvbw",
  },
  { ip: "64.137.104.133:5743", username: "xythxvbw" },
  { ip: "147.136.64.82:5845", username: "xythxvbw" },
  { ip: "168.199.132.27:6099", username: "xythxvbw" },
  { ip: "168.199.227.54:6833", username: "xythxvbw" },
  {
    ip: "104.143.229.251:6179",
    username: "xythxvbw",
  },
  { ip: "45.94.136.101:6877", username: "xythxvbw" },
  { ip: "161.123.65.119:6828", username: "xythxvbw" },
  { ip: "88.218.105.82:5846", username: "xythxvbw" },
  { ip: "147.136.64.198:5961", username: "xythxvbw" },
  { ip: "103.75.228.72:6151", username: "xythxvbw" },
  { ip: "103.75.230.64:6455", username: "xythxvbw" },
  { ip: "103.75.229.34:5782", username: "xythxvbw" },
  { ip: "103.75.229.169:5917", username: "xythxvbw" },
  { ip: "216.173.74.186:5866", username: "xythxvbw" },
  { ip: "216.173.74.134:5814", username: "xythxvbw" },
  { ip: "23.236.222.172:7203", username: "xythxvbw" },
  { ip: "45.251.61.144:6862", username: "xythxvbw" },
  { ip: "103.75.230.254:6645", username: "xythxvbw" },
  { ip: "103.75.230.207:6598", username: "xythxvbw" },
  { ip: "206.41.172.86:6646", username: "xythxvbw" },
  { ip: "193.42.225.42:6533", username: "xythxvbw" },
  { ip: "23.236.222.162:7193", username: "xythxvbw" },
  { ip: "171.22.249.53:5633", username: "xythxvbw" },
  { ip: "194.116.250.71:6529", username: "xythxvbw" },
  { ip: "23.236.222.38:7069", username: "xythxvbw" },
  { ip: "103.75.228.83:6162", username: "xythxvbw" },
  { ip: "23.236.222.116:7147", username: "xythxvbw" },
  { ip: "23.229.126.95:7624", username: "xythxvbw" },
  {
    ip: "194.116.250.175:6633",
    username: "xythxvbw",
  },
  { ip: "103.75.228.128:6207", username: "xythxvbw" },
  { ip: "193.42.225.164:6655", username: "xythxvbw" },
  { ip: "103.75.228.0:6079", username: "xythxvbw" },
  { ip: "103.75.228.198:6277", username: "xythxvbw" },
  { ip: "103.75.229.121:5869", username: "xythxvbw" },
  { ip: "103.75.228.201:6280", username: "xythxvbw" },
  { ip: "161.123.65.103:6812", username: "xythxvbw" },
  { ip: "103.75.229.105:5853", username: "xythxvbw" },
  { ip: "161.123.65.169:6878", username: "xythxvbw" },
  { ip: "171.22.249.109:5689", username: "xythxvbw" },
  { ip: "216.173.74.197:5877", username: "xythxvbw" },
  { ip: "103.75.230.215:6606", username: "xythxvbw" },
  {
    ip: "194.116.250.119:6577",
    username: "xythxvbw",
  },
  { ip: "216.173.74.86:5766", username: "xythxvbw" },
  { ip: "194.116.250.61:6519", username: "xythxvbw" },
  { ip: "161.123.65.124:6833", username: "xythxvbw" },
  { ip: "206.41.175.154:6367", username: "xythxvbw" },
  { ip: "161.123.65.224:6933", username: "xythxvbw" },
  { ip: "23.236.222.68:7099", username: "xythxvbw" },
  { ip: "216.173.74.249:5929", username: "xythxvbw" },
  { ip: "103.75.230.115:6506", username: "xythxvbw" },
  { ip: "161.123.65.209:6918", username: "xythxvbw" },
  { ip: "45.251.61.223:6941", username: "xythxvbw" },
  { ip: "161.123.65.126:6835", username: "xythxvbw" },
  { ip: "45.251.61.191:6909", username: "xythxvbw" },
  { ip: "23.236.222.61:7092", username: "xythxvbw" },
  { ip: "23.229.126.107:7636", username: "xythxvbw" },
  { ip: "193.42.225.90:6581", username: "xythxvbw" },
  { ip: "206.41.175.37:6250", username: "xythxvbw" },
  {
    ip: "194.116.250.190:6648",
    username: "xythxvbw",
  },
  { ip: "45.251.61.252:6970", username: "xythxvbw" },
  { ip: "171.22.249.5:5585", username: "xythxvbw" },
  { ip: "194.116.250.52:6510", username: "xythxvbw" },
  { ip: "216.173.74.118:5798", username: "xythxvbw" },
  {
    ip: "194.116.250.207:6665",
    username: "xythxvbw",
  },
  { ip: "194.116.250.49:6507", username: "xythxvbw" },
  { ip: "171.22.249.28:5608", username: "xythxvbw" },
  { ip: "216.173.74.175:5855", username: "xythxvbw" },
  { ip: "23.236.222.202:7233", username: "xythxvbw" },
  { ip: "45.251.61.215:6933", username: "xythxvbw" },
  { ip: "216.173.74.182:5862", username: "xythxvbw" },
  { ip: "45.251.61.208:6926", username: "xythxvbw" },
];

export const fetchAmazonPrice = async ({
  id,
  apiBaseUrl,
  parameters,
  headers,
}: {
  id: string;
  apiBaseUrl: string;
  parameters: string;
  headers: JsonValue;
}) => {
  const proxy = {
    ...proxyList[Math.floor(Math.random() * proxyList.length)],
    password: PROXY_PASSWORD,
  };
  try {
    const item = await fetcher<ItemResponse>(
      apiBaseUrl,
      headers,
      id,
      parameters.replaceAll(/ID_TO_REPLACE/gi, id),
      proxy
    );

    return {
      new: parseFloat(item.Value.content.twisterSlotJson.price),
      used: undefined,
    };
  } catch (error: any) {
    if (error.response) {
      logger.error(
        `Error fetching Amazon price: ${error.response.status} with ip ${proxy.ip}`
      );
    }

    throw error;
  }
};
