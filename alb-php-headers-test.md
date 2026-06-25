Here's a README.md you can use for the header-viewer application.

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
