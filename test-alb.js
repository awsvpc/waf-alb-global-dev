const https = require("https");

const url = "https://YOUR-ALB-DNS-NAME/health";

console.log("Testing:", url);

const req = https.get(url, {
  timeout: 30000,
  headers: {
    "User-Agent": "node-alb-test"
  }
}, (res) => {
  console.log("Connected");
  console.log("Status:", res.statusCode);
  console.log("Headers:", res.headers);

  let body = "";

  res.on("data", chunk => {
    body += chunk;
  });

  res.on("end", () => {
    console.log("Response body:");
    console.log(body);
  });
});

req.on("timeout", () => {
  console.error("Request timeout");
  req.destroy();
});

req.on("error", (err) => {
  console.error("Connection error:");
  console.error(err);
});
