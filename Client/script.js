async function checkBlacklist() {
  const cidr = document.getElementById("cidr").value;
  if (!cidr) return alert("Please enter a CIDR block.");

  document.getElementById("results").innerHTML =
    "<p>Checking blacklist status...</p>";

  try {
    const response = await fetch(
      `/check-blacklist?cidr=${encodeURIComponent(cidr)}`
    );

    const data = await response.json();

    let resultHTML = "<h3>Blacklist Results</h3>";

    if (data.results.length === 0) {
      resultHTML += "<p>No blacklisted IPs found.</p>";
    } else {
      resultHTML +=
        '<table border="2"><tr><th>IP</th><th>Blacklisted On</th></tr>';
      data.results.forEach((entry) => {
        resultHTML += `<tr><td>${entry.ip}</td><td>${entry.blacklistedOn.join(
          ", "
        )}</td></tr>`;
      });
      resultHTML += "</table>";
    }

    document.getElementById("results").innerHTML = resultHTML;
  } catch (error) {
    document.getElementById(
      "results"
    ).innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
  }
}

async function CheckGeo() {
  const ip = document.getElementById("ip").value;

  if (!ip) {
    alert("Please enter an IP address.");
    return;
  }

  const ipgeo_URL = "https://api.ipgeolocation.io/ipgeo?";
  const ipgeo_KEY = "a04def40dce34f6cbab8488636d90294";
  const ipapi_URL = "https://ipapi.co/";
  const format = "json";
  const iploc_URL = "https://api.iplocation.net/?ip=";

  let resultHTML = `
    <table border="1" align="center">
      <caption><h2>Results</h2></caption>
      <tr>
        <th>Source</th>
        <th>IP</th>
        <th>Country</th>
        <th>Region</th>
        <th>Zip Code</th>
        <th>ISP</th>
      </tr>
  `;

  const sources = [
    {
      name: "IPgeolocation.io",
      url: `${ipgeo_URL}apiKey=${ipgeo_KEY}&ip=${ip}`,
    },
    { name: "IPapi.co", url: `${ipapi_URL}${ip}/${format}/` },
    { name: "IPlocation.net", url: `${iploc_URL}${ip}` },
    {
      name: "IPinfo.io",
      url: `https://ipinfo.io/${ip}?token=7a912dcd443cfa`,
    },
    {
      name: "freeipapi.com",
      url: `https://freeipapi.com/api/json/${ip}`,
    },
    {
      name: "ip2location.com",
      url: `/check-iplocation?ip=${encodeURIComponent(ip)}`,
    },
  ];

  const Notify = "Fetching the data! Please Wait......";
  document.getElementById("notify").innerHTML = Notify;

  for (let source of sources) {
    try {
      let response = await fetch(source.url);
      if (!response.ok) throw new Error("Error fetching data");

      let data = await response.json();
      let country =
        data.country_code2 ||
        data.country ||
        data.countryCode ||
        data.country_code ||
        "N/A";
      let region =
        data.state_code ||
        data.region_code ||
        data.region ||
        data.regionName ||
        data.region_name ||
        "N/A";
      let zip =
        data.zipcode ||
        data.postal ||
        data.zipCode ||
        data.zip_code ||
        "N/A";
      let isp = data.org || data.isp || data.as || "N/A";

      resultHTML += `
        <tr>
          <td>${source.name}</td>
          <td>${ip}</td>
          <td>${country}</td>
          <td>${region}</td>
          <td>${zip}</td>
          <td>${isp}</td>
        </tr>
      `;
    } catch (error) {
      console.error(`${source.name} Error:`, error);
      resultHTML += `
        <tr>
          <td>${source.name}</td>
          <td>${ip}</td>
          <td colspan="4">Error retrieving data</td>
        </tr>
      `;
    }
  }

  resultHTML += "</table>";
  document.getElementById("notify").style.display = "none";
  document.getElementById("result").innerHTML = resultHTML;
}
