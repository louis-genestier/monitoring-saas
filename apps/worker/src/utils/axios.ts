import axios from "axios";
import { PROXY_URL_RESIDENTIALS, PROXY_URL_DATACENTERS } from "./env";
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

const axiosInstance = axios.create({});

const axiosInstanceWithResidentialProxy = axios.create({
  httpsAgent: agentResidentials,
  httpAgent: agentResidentials,
});

const axiosInstanceWithDatacenterProxy = axios.create({
  httpsAgent: agentDatacenters,
  httpAgent: agentDatacenters,
});

export default axiosInstance;

export { axiosInstanceWithResidentialProxy, axiosInstanceWithDatacenterProxy };
