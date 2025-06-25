import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const app = express();
const PORT = 3000;

app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));
app.use(express.json());

// Load API keys from .env
const MXTOOLBOX_API_KEY = process.env.MXTOOLBOX_API_KEY;
const MXTOOLBOX_API_URL = "https://api.mxtoolbox.com/api/v1/Lookup/blacklist/?argument=";

const cidrToIps = (cidr) => {
  const [ip, prefix] = cidr.split("/");
  const ipParts = ip.split(".").map(Number);
  const ipStart = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
  const totalHosts = Math.pow(2, 32 - parseInt(prefix));
  return Array.from({ length: totalHosts }, (_, i) => {
    const newIp = ipStart + i;
    return [
      (newIp >> 24) & 255,
      (newIp >> 16) & 255,
      (newIp >> 8) & 255,
      newIp & 255,
    ].join(".");
  });
};

const checkBlacklistStatus = async (ip) => {
  try {
    const response = await axios.get(`${MXTOOLBOX_API_URL}${ip}`, {
      headers: { Authorization: MXTOOLBOX_API_KEY },
    });

    if (!response.data || typeof response.data !== "object") {
      console.error(`Invalid response for ${ip}:`, response.data);
      return null;
    }

    const blacklistRecords = response.data.Failed || [];
    if (blacklistRecords.length > 0) {
      return { ip, blacklistedOn: blacklistRecords.map(site => site.Name) };
    }
    return null;
  } catch (error) {
    console.error(`Error checking ${ip}:`, error.message);
    return null;
  }
};

app.get("/check-blacklist", async (req, res) => {
  const { cidr } = req.query;
  if (!cidr) return res.status(400).json({ error: "CIDR block required" });

  const ips = cidrToIps(cidr);

  try {
    const blacklistResults = await Promise.all(ips.map(ip => checkBlacklistStatus(ip)));
    const filteredResults = blacklistResults.filter(result => result !== null);
    res.json({ results: filteredResults });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while checking the blacklist" });
  }
});

const ip2loc_URL = "https://api.ip2location.io/?";
const ip2loc_KEY = process.env.IP2LOC_KEY;

app.get("/check-iplocation", async (req, res) => {
  const { ip } = req.query;
  if (!ip) return res.status(400).json({ error: "IP required" });

  try {
    const response = await axios.get(`${ip2loc_URL}key=${ip2loc_KEY}&ip=${ip}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch IP location" });
  }
});

app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);
