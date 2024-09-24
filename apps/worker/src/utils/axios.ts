import axios from "axios";
import { PROXY_URL } from "./env";
import { HttpsProxyAgent } from "https-proxy-agent";
import { Agent } from "https";

const agent = PROXY_URL
  ? new HttpsProxyAgent(PROXY_URL, {
      rejectUnauthorized: false,
    })
  : new Agent({
      rejectUnauthorized: false,
    });

const axiosInstance = axios.create({});

const axiosInstanceWithProxy = axios.create({
  httpsAgent: agent,
  httpAgent: agent,
});

export default axiosInstance;

export { axiosInstanceWithProxy };
