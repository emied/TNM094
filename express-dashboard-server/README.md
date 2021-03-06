# Installing and running
Make sure *node.js* and *npm* is installed on your system. Then run:
``` 
npm install
```
in this folder. 

Download [data.zip](https://drive.google.com/open?id=1ofiJXLB7rKSfIZRdghXOba-4cLw4r_oC) and unzip it in the *data/source* folder. [Data explanation](data/README.md).

To automatically restart the server when changes are made, install *nodemon* using:
``` 
npm install nodemon -g
```
and start the server by running:
``` 
nodemon start
```
in this folder.

The server will then be available at: http://localhost:3000/

---

To get debug messages in the console, start the server by running:<br/>
<br/>
Windows:
``` 
SET DEBUG=dashboard:* & nodemon start
``` 
Linux and macOS:
``` 
DEBUG=dashboard:* nodemon start
``` 

# Adding new (server-side) dependencies
Run:
``` 
npm install name-of-dependency --save
```
in this folder. This will automatically update the *package.json* file.