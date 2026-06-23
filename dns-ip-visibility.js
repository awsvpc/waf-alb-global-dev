const dns = require("dns");
const https = require("https");

const host = "YOUR-ALB-DNS-NAME";

dns.lookup(host, { all: true }, (err, addresses) => {
  if (err) {
    console.error("DNS error:", err);
    return;
  }

  console.log("Resolved addresses:");
  console.log(addresses);

  https.get(`https://${host}/health`, {
    timeout: 30000
  }, res => {

    console.log("HTTP status:", res.statusCode);

    res.on("data", data => {
      console.log(data.toString());
    });

  }).on("timeout", () => {
    console.error("HTTPS timeout");
  }).on("error", err => {
    console.error("HTTPS error:", err);
  });
});
