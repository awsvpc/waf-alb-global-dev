#!/bin/bash
useradd -m -U -s /bin/bash cloud_user
echo 'cloud_user:bQg%e1d(' | chpasswd
usermod -aG wheel cloud_user
/usr/sbin/adduser demoacademy
/bin/echo '123456' | /usr/bin/passwd demoacademy --stdin
/bin/echo 'demoacademy ALL=(ALL:ALL) ALL' >> /etc/sudoers
/bin/sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/g' /etc/ssh/sshd_config
/etc/init.d/sshd reload
yum update -y
yum install -y httpd
service httpd start
echo '<html><center><body <h1>WAF Test</h1></body></html>' > /var/www/html/index.html
