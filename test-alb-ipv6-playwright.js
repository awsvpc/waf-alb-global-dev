const dns = require("dns");
const https = require("https");

// Only for this test process
dns.setDefaultResultOrder("ipv6first");

// Ignore self-signed/invalid certs (testing only)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const options = {
  hostname: "YOUR-ALB-DNS-NAME",
  port: 443,
  path: "/api/test",
  method: "POST",

  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },

  timeout: 30000
};

const payload = JSON.stringify({
  username: "test",
  action: "health-check"
});

console.log("Sending POST request...");

const req = https.request(options, (res) => {

  console.log("HTTP Status:", res.statusCode);
  console.log("Headers:", res.headers);

  let body = "";

  res.on("data", (chunk) => {
    body += chunk;
  });

  res.on("end", () => {
    console.log("Response:");
    console.log(body);
  });
});


req.on("timeout", () => {
  console.error("Connection timeout");
  req.destroy();
});


req.on("error", (err) => {
  console.error("Request error:");
  console.error(err);
});


req.write(payload);
req.end();
