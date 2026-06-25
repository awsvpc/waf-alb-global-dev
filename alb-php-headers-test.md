<pre>

Install Apache and PHP
1. Update packages
sudo yum update -y

For Amazon Linux 2023:

sudo dnf update -y
2. Install Apache and PHP
sudo yum install -y httpd php

For Amazon Linux 2023:

sudo dnf install -y httpd php
3. Start Apache

Amazon Linux 2 / 2023:

sudo systemctl enable httpd
sudo systemctl start httpd

Older Amazon Linux:

sudo chkconfig httpd on
sudo service httpd start
4. Create the header viewer page
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
5. Verify the file exists
ls -l /var/www/html/headers.php
6. Test locally
curl http://localhost/headers.php

Expected output:

Request Method: GET
Request URI: /headers.php

Host: localhost
User-Agent: curl/7.x
Accept: */*
7. Open port 80 in the EC2 Security Group

Add an inbound rule:

Type: HTTP
Port: 80
Source: 0.0.0.0/0 (or your IP for testing)
8. Find your public IP
curl http://169.254.169.254/latest/meta-data/public-ipv4
9. Access the page
http://<PUBLIC-IP>/headers.php

Example:

http://54.123.45.67/headers.php
Optional: Display all request/server variables

Replace the contents of headers.php with:
```
<?php
echo "<pre>";
print_r($_SERVER);
echo "</pre>";
?>
```
This shows all headers plus CGI and Apache environment variables.
</pre>
