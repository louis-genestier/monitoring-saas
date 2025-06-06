import axios from "axios";
import {
  PROXY_URL_RESIDENTIALS,
  PROXY_URL_DATACENTERS,
  MOBILE_PROXY_URL,
} from "./env";
import { HttpsProxyAgent } from "https-proxy-agent";
import { Agent } from "https";

const agentResidentials = PROXY_URL_RESIDENTIALS
  ? new HttpsProxyAgent(PROXY_URL_RESIDENTIALS, {
      rejectUnauthorized: false,
    })
  : new Agent({
      rejectUnauthorized: false,
    });

const agentDatacenters = PROXY_URL_DATACENTERS
  ? new HttpsProxyAgent(PROXY_URL_DATACENTERS, {
      rejectUnauthorized: false,
    })
  : new Agent({
      rejectUnauthorized: false,
    });

const agentMobile = MOBILE_PROXY_URL
  ? new HttpsProxyAgent(MOBILE_PROXY_URL, {
      rejectUnauthorized: false,
    })
  : new Agent({
      rejectUnauthorized: false,
    });

const axiosInstance = axios.create({
  timeout: 5000,
});

const axiosInstanceWithResidentialProxy = axios.create({
  httpsAgent: agentResidentials,
  httpAgent: agentResidentials,
  timeout: 5000,
});

const axiosInstanceWithDatacenterProxy = axios.create({
  httpsAgent: agentDatacenters,
  httpAgent: agentDatacenters,
  timeout: 5000,
});

const axiosInstanceWithMobileProxy = axios.create({
  httpsAgent: agentMobile,
  httpAgent: agentMobile,
  timeout: 5000,
});

export default axiosInstance;

export {
  axiosInstanceWithResidentialProxy,
  axiosInstanceWithDatacenterProxy,
  axiosInstanceWithMobileProxy,
};
