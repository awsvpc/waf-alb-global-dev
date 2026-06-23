const dns = require("dns");
dns.setDefaultResultOrder("ipv6first");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const { request } = require("@playwright/test");

(async () => {
  const api = await request.newContext();

  const response = await api.post(
    "https://YOUR-ALB-DNS/api",
    {
      timeout: 30000
    }
  );

  console.log(response.status());
})();
