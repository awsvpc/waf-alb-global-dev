# Test AWS ALB Connectivity Using Playwright

This guide tests connectivity from **WSL2 Ubuntu** using **Playwright Chromium** against an AWS Application Load Balancer (ALB).

Useful when:

- Browser works
- `curl -vk` works
- Playwright fails with errors like:
```

ETIMEDOUT ffff::x.x.x.x

````
- Suspecting IPv6/DNS/TLS issues

---

## 1. Install Playwright

```bash
mkdir playwright-test
cd playwright-test

npm init -y

npm install playwright

npx playwright install chromium
````

---

# 2. Basic ALB HTTPS Test

Create:

```
test-alb.js
```

Add:

```javascript
const { chromium } = require("playwright");

(async () => {
  const url = "https://your-alb-domain.com";

  console.log("Starting browser...");

  const browser = await chromium.launch({
    headless: true,

    // Test IPv4 path
    args: [
      "--disable-ipv6"
    ]
  });


  const page = await browser.newPage({
    ignoreHTTPSErrors: false
  });


  page.on("requestfailed", request => {

    console.log("REQUEST FAILED:");
    console.log(request.url());
    console.log(request.failure());

  });


  try {

    console.log("Opening:", url);


    const response = await page.goto(url, {

      waitUntil: "networkidle",

      timeout: 60000

    });


    console.log("HTTP Status:");
    console.log(response.status());


    console.log("Final URL:");
    console.log(page.url());


    console.log("Page Title:");
    console.log(await page.title());


  } catch(error) {

    console.error("ERROR:");
    console.error(error);

  }


  await browser.close();

})();
```

Run:

```bash
node test-alb.js
```

---

# 3. Test API POST Request Through Playwright

Create:

```
post-test.js
```

Add:

```javascript
const { chromium } = require("playwright");


(async () => {


  const browser = await chromium.launch({

    headless: true,

    args: [
      "--disable-ipv6"
    ]

  });


  const page = await browser.newPage();


  try {


    const result = await page.evaluate(async () => {


      const response = await fetch(

        "https://your-alb-domain.com/api/test",

        {

          method: "POST",

          headers: {

            "Content-Type": "application/json"

          },


          body: JSON.stringify({

            test: "hello"

          })

        }

      );


      return {

        status: response.status,

        body: await response.text()

      };


    });


    console.log(result);



  } catch(error) {


    console.error(error);


  }



  await browser.close();



})();
```

Run:

```bash
node post-test.js
```

---

# 4. Check DNS Resolution

Because errors may show:

```
ffff::x.x.x.x
```

Check DNS:

```bash
getent ahosts your-alb-domain.com
```

Example output:

```
IPv6 address
IPv4 address
```

If IPv6 appears first, test IPv4:

```bash
curl -4 -vk https://your-alb-domain.com
```

Test IPv6:

```bash
curl -6 -vk https://your-alb-domain.com
```

Expected:

* IPv4 works
* IPv6 times out

This indicates an IPv6 routing issue.

---

# 5. Check TLS Connection

From the same WSL machine:

```bash
openssl s_client \
-connect your-alb-domain.com:443 \
-tls1_3
```

Expected:

```
Protocol : TLSv1.3
Verify return code: 0
```

---

# 6. ALB TLS Policy Notes

Current policy:

```
ELBSecurityPolicy-TLS13-1-3-2021-06
```

This requires TLS 1.3 support.

Modern Playwright Chromium supports it.

If testing compatibility, temporarily try:

```
ELBSecurityPolicy-TLS13-1-2-2021-06
```

or:

```
ELBSecurityPolicy-TLS-1-2-2017-01
```

Do not leave weaker policies enabled unless required.

---

# 7. Common Causes

## IPv6 issue

Symptoms:

```
ETIMEDOUT ffff::x.x.x.x
```

Fix:

```javascript
args: [
  "--disable-ipv6"
]
```

or:

```bash
NODE_OPTIONS=--dns-result-order=ipv4first
```

---

## Proxy issue

Check:

```bash
env | grep -i proxy
```

Look for:

```
HTTP_PROXY
HTTPS_PROXY
NO_PROXY
```

Test without proxy:

```bash
curl --noproxy "*" -vk https://your-alb-domain.com
```

---

## Security Group

ALB must allow:

```
Inbound:
TCP 443
Source: your client IP/network
```

Outbound:

```
All traffic
```

---

# Summary

Troubleshooting order:

1. Test Playwright with `--disable-ipv6`
2. Check DNS using `getent ahosts`
3. Compare `curl -4` vs `curl -6`
4. Verify TLS with `openssl`
5. Check ALB security groups and logs

Most likely cause for:

```
Playwright fails
curl works
browser works
ffff::x.x.x.x timeout
```

is IPv6 preference/routing from the WSL environment.

