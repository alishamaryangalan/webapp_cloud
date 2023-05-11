#!/bin/bash
sudo yum update -y
sudo yum upgrade -y

sudo chmod 755 /home/ec2-user

echo 'Install Node.js and npm'
curl --silent --location https://rpm.nodesource.com/setup_16.x | sudo bash -
sudo yum install -y gcc-c++ make
sudo yum install -y nodejs

# PostgreSQL steps
# sudo yum install postgresql-server -y
# sudo yum clean metadata
# sudo postgresql-setup initdb
# sudo systemctl stop postgresql
# sudo systemctl start postgresql
# sudo systemctl enable postgresql
# sudo systemctl status postgresql
# sudo su postgres -c "psql -c \"CREATE DATABASE mydatabase;\""
# sudo -u postgres psql -c "ALTER ROLE postgres WITH PASSWORD 'password';"
# sudo sh -c "echo 'host    all             all             0.0.0.0/0        md5' >> /var/lib/pgsql/data/pg_hba.conf"
# sudo sed -i 's/ident/md5/' /var/lib/pgsql/data/pg_hba.conf
# sudo systemctl restart postgresql
# sudo systemctl status postgresql

sudo yum clean all
sudo rm -rf /var/cache/yum

sudo unzip webapp.zip -d webapp
cd ~/webapp && sudo mkdir uploads
cd ~/webapp && sudo chmod 777 uploads
cd ~/webapp && sudo npm install i

pwd
sudo mv /tmp/webapp.service /etc/systemd/system/

sudo systemctl daemon-reload
sudo systemctl start webapp
sudo systemctl enable webapp
sudo systemctl status webapp