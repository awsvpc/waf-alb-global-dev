const dns = require("dns");
const https = require("https");

// Only this Node process/test
dns.setDefaultResultOrder("ipv6first");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const url = "https://YOUR-ALB-DNS/health";

console.log("Testing:", url);

https.get(url, { timeout: 30000 }, (res) => {
  console.log("Status:", res.statusCode);

  res.on("data", chunk => {
    console.log(chunk.toString());
  });

}).on("timeout", function () {
  console.error("Timeout");
  this.destroy();

}).on("error", (err) => {
  console.error("Error:", err);
});
