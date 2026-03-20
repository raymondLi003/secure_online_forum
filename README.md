# CS4203_P2
A Secure forum for CS4203 Practical

Set up:
0. Need to be on the school network because the database is hosted on the school server. The connection will be refused if not. 
1. Run "npm install" in both directories: CS4203_P2/frontend and CS4203_P2/server 
2. Run "npm run dev" in the directory: CS4203_P2/server to start the server
3. Run "npm run build" in the directory CS4203_P2/frontend and then run "npm run dev" in the same directory to start the frontend
4. Choose the https://localhost:3001/ option to visit the website. 

User Guide:
1. There are sample credentials in the directory CS4203_P2/server for reference for what credentials that need to be stored
2. Users need to store their own userIds and private keys, and they need to use both of them to log in, each log in creates a 2-hour refresh token. 
3. To access the Groups page, users need to log in first to see the groups page unless they have a valid refresh token.
4. Users can create groups, where with each successful creation user gets a log in private key and decryption key for messages. 
5. Users need to input their userID, groupId(the group they want to join), and the log in key for the group to join the group
6. Users need to input their decryption key to view the messages. Users can post without inputting the encryption key but they cannot view the messages. 
7. Users need to refresh and input their decryption key to check the updated group chat. 
8. To remove a user from the group, simply input the userId and groupId. Since the messages are anonymous, users could only know their own userId theoretically.
9. User can click log out to redirect to the home page where 


MySQL settings:

    MySQL username = bl61
    MySQL hostname = bl61.teaching.cs.st-andrews.ac.uk


NB. The password may no longer be correct if you have changed it on
    this server.

For command line access on your host server run:

  /usr/bin/mysql --defaults-extra-file=/var/cs/mysql/bl61/my.cnf -u bl61

or

  /usr/local/bin/mycli --defaults-file /var/cs/mysql/bl61/my.cnf -u bl61

NB. Aliases have been setup (on the host servers) so that if you enter
'mysql' or 'mycli' sans path or arguments (on the host servers) then the
above settings will automatically be used.

For command line access on another server or Linux lab client run:

  /usr/bin/mysql -h bl61.teaching.cs.st-andrews.ac.uk -u bl61 -p

or

  /usr/local/bin/mycli -h bl61.teaching.cs.st-andrews.ac.uk -u bl61

If another user has given you rights on their database use their
hostname with your username and password.

