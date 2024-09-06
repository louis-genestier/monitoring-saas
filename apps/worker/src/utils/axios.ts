import axios from "axios";
import { PROXY_URL } from "./env";
import { HttpsProxyAgent } from "https-proxy-agent";
import { Agent } from "https";

const agent = PROXY_URL ? new HttpsProxyAgent(PROXY_URL) : new Agent();

const axiosInstance = axios.create({
  httpsAgent: agent,
  httpAgent: agent,
});

export default axiosInstance;
