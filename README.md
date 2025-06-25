# Smart IP Checker

Smart IP Checker is a simple web app that checks:
- If IP addresses in a subnet are blacklisted (via MXToolbox API)
- The geolocation of an IP using multiple API providers

### 1. IP Blacklist Checker
- Input a subnet (e.g., `45.39.2.0/24`)
- Expands it into individual IPs
- Uses [MXToolbox](https://mxtoolbox.com/) API to check blacklist status
- Displays results in a table
### 2. IP Geo Checker
- Input a single IP address (e.g., `45.39.2.178`)
- Fetches location data using multiple APIs:
  - IPGeolocation.io
  - ipapi.co
  - iplocation.net
  - ipinfo.io
  - freeipapi.com
  - ip2location.com (via server proxy)

# Tech Stack
[Frontend]: HTML, JavaScript

[Backend]: Node.js, Express

## APIs Used:

# BlackList Check
- MXToolbox

# Geolocation Check
- IPGeolocation
- IPapi
- IPinfo
- FreeIPAPI
- IP2Location
