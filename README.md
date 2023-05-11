# Assignment-04

1. Create a REST API using Express Framework, Node.js server, PostgreSQL database.

#Pre-requisites
1. Download NodeJS from the website.
2. Check the node and npm versions and verify the paths.

#Commands to run the API
1. npm init to create a package.json file
2. npm install to install all the node dependencies.
3. npm test is used to run the unit test - Jest 
4. node index.js is used to run the Node.js script on the specified port.

The endpoints are tested using Postman!

2. Create a Packer script to build the AMI with all the necessary installations to be used to run the REST api in the ec2 instance 
#Commands to run the packer script
1. packer init .
2. packer fmt ami.pkr.hcl
3. packer validate ami.pkr.hcl -var-file=dev-vars.pkrvars.json -var-file=secrets.pkvars.json
(secrets.pkvars.json include the aws access key and secret key used to access the AWS account and should not be added to repo)
3. packer build ami.pkr.hcl -var-file=dev-vars.pkrvars.json -var-file=secrets.pkvars.json

An AMI with the necessary installations (NodeJS, postgreSQL, webapp.zip should be created from the packer script) in the AWS account(dev) and this AMI should be shared to the AWS demo.

//random changes to file
