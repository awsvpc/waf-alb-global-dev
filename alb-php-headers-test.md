# Request Header Viewer on Amazon Linux

This guide installs Apache and PHP on an Amazon Linux EC2 instance and creates a simple web page that displays incoming HTTP request headers.

## Prerequisites

* Amazon Linux EC2 instance
* Security Group allowing inbound HTTP (TCP 80)
* SSH access to the instance

---

## Step 1: Connect to the EC2 Instance

```bash
ssh -i <key.pem> ec2-user@<public-ip>
```

---

## Step 2: Update the System

Amazon Linux 2:

```bash
sudo yum update -y
```

Amazon Linux 2023:

```bash
sudo dnf update -y
```

---

## Step 3: Install Apache and PHP

Amazon Linux 2:

```bash
sudo yum install -y httpd php
```

Amazon Linux 2023:

```bash
sudo dnf install -y httpd php
```

---

## Step 4: Start Apache

For Amazon Linux 2 and Amazon Linux 2023:

```bash
sudo systemctl enable httpd
sudo systemctl start httpd
```

Verify the service is running:

```bash
sudo systemctl status httpd
```

---

## Step 5: Create the Header Viewer Page

Create the PHP file:

```bash
sudo tee /var/www/html/headers.php > /dev/null <<'EOF'
<?php
header('Content-Type: text/plain');

echo "Request Method: " . $_SERVER['REQUEST_METHOD'] . "\n";
echo "Request URI: " . $_SERVER['REQUEST_URI'] . "\n\n";

foreach (getallheaders() as $name => $value) {
    echo "$name: $value\n";
}
?>
EOF
```

Verify the file exists:

```bash
ls -l /var/www/html/headers.php
```

---

## Step 6: Test Locally

Run:

```bash
curl http://localhost/headers.php
```

Expected output:

```text
Request Method: GET
Request URI: /headers.php

Host: localhost
User-Agent: curl/7.x
Accept: */*
```

---

## Step 7: Configure the Security Group

Add an inbound rule:

| Type | Protocol | Port | Source    |
| ---- | -------- | ---- | --------- |
| HTTP | TCP      | 80   | 0.0.0.0/0 |

For testing, you may restrict the source to your public IP address.

---

## Step 8: Find the Instance Public IP

```bash
curl http://169.254.169.254/latest/meta-data/public-ipv4
```

Example output:

```text
54.123.45.67
```

---

## Step 9: Access the Application

Open a browser and navigate to:

```text
http://<PUBLIC-IP>/headers.php
```

Example:

```text
http://54.123.45.67/headers.php
```

---

## Example Output

```text
Request Method: GET
Request URI: /headers.php

Host: 54.123.45.67
User-Agent: Mozilla/5.0
Accept: text/html
Accept-Language: en-US,en;q=0.9
X-Forwarded-For: 1.2.3.4
```

---

## Troubleshooting

### Verify Apache is Running

```bash
sudo systemctl status httpd
```

### Check Listening Ports

```bash
sudo ss -lntp | grep ':80'
```

Expected output:

```text
LISTEN 0 128 :::80 :::*
```

### Check Apache Logs

```bash
sudo tail -f /var/log/httpd/error_log
```

```bash
sudo tail -f /var/log/httpd/access_log
```

### Verify the Security Group

Ensure TCP port 80 is allowed from your client IP or from `0.0.0.0/0`.

---

## Optional: Display All Server Variables

Replace `/var/www/html/headers.php` with:

```php
<?php
echo "<pre>";
print_r($_SERVER);
echo "</pre>";
?>
```

This displays all request headers, CGI variables, and Apache environment information.
###########

# WAF SQL Injection Test Application

This simple PHP application is used to test WAF rules by displaying incoming HTTP requests and parameters.

## Install test1.php without header

Create the file
```bash
sudo tee /var/www/html/test.php > /dev/null <<'EOF'
<?php
header('Content-Type: text/plain');

echo "Received input:\n";

if (isset($_GET['id'])) {
    echo $_GET['id'];
} else {
    echo "no id parameter";
}
?>
EOF
```

## Install test.php

Create the file:

```bash
sudo tee /var/www/html/test.php > /dev/null <<'EOF'
<?php

header('Content-Type: text/plain');

echo "==== REQUEST INFORMATION ====\n\n";

echo "Method: " . $_SERVER['REQUEST_METHOD'] . "\n";
echo "URI: " . $_SERVER['REQUEST_URI'] . "\n";
echo "Remote IP: " . $_SERVER['REMOTE_ADDR'] . "\n\n";


echo "==== REQUEST HEADERS ====\n\n";

$headers = getallheaders();

foreach ($headers as $name => $value) {
    echo "$name: $value\n";
}


echo "\n==== QUERY PARAMETERS ====\n\n";

if (!empty($_GET)) {
    foreach ($_GET as $key => $value) {
        echo "$key = $value\n";
    }
} else {
    echo "No query parameters\n";
}


echo "\n==== POST PARAMETERS ====\n\n";

if (!empty($_POST)) {
    foreach ($_POST as $key => $value) {
        echo "$key = $value\n";
    }
} else {
    echo "No POST parameters\n";
}


echo "\n==== SERVER VARIABLES ====\n\n";

echo "User Agent: " . $_SERVER['HTTP_USER_AGENT'] . "\n";
echo "Host: " . $_SERVER['HTTP_HOST'] . "\n";

?>
EOF
```

---

# Test Normal Request

```bash
curl "http://<EC2-IP>/test.php?id=123"
```

Example output:

```text
==== REQUEST INFORMATION ====

Method: GET
URI: /test.php?id=123
Remote IP: 1.2.3.4


==== QUERY PARAMETERS ====

id = 123
```

---

# Test SQL Injection Patterns

## Basic SQL Injection

```bash
curl "http://<EC2-IP>/test.php?id=1%27%20OR%20%271%27=%271"
```

Decoded:

```sql
1' OR '1'='1
```

---

## UNION SQL Injection

```bash
curl "http://<EC2-IP>/test.php?id=1%20UNION%20SELECT%201,2,3"
```

---

## Comment Injection

```bash
curl "http://<EC2-IP>/test.php?id=1%27--"
```

---

# Test With Custom Headers

```bash
curl \
-H "User-Agent: waf-test" \
-H "X-Test: sql-injection-check" \
"http://<EC2-IP>/test.php?id=1%27%20OR%201=1"
```

The application should display:

```text
User-Agent: waf-test
X-Test: sql-injection-check
```

---

# AWS WAF Testing

For AWS WAF:

1. Put this EC2 instance behind:

   * Application Load Balancer
   * CloudFront
   * API Gateway

2. Add AWS Managed Rule:

```
AWSManagedRulesSQLiRuleSet
```

3. Start with:

```
Action: Count
```

4. Review:

```
AWS WAF -> Web ACL -> Sampled Requests
```

5. Change to:

```
Action: Block
```

---

# Verify Apache Logs

Watch requests:

```bash
sudo tail -f /var/log/httpd/access_log
```

Errors:

```bash
sudo tail -f /var/log/httpd/error_log
```

---

# Verify Application

Open:

```
http://<EC2-PUBLIC-IP>/test.php
```

or:

```
http://<EC2-PUBLIC-IP>/test.php?id=test
```

This page can be used as a lightweight WAF inspection endpoint.

