# Installing and running
Make sure *node.js* and *npm* is installed on your system. Then run:
``` 
npm install
```
in this folder. 

Download [fordgobike_all.csv](https://drive.google.com/open?id=1azVN-Vi_Hpgn2_jRt0pHnzXK7Nc5PhQe) and put it in the *data* folder.

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

# Adding new (server-side) dependencies
Run:
``` 
npm install name-of-dependency --save
```
in this folder. This will automatically update the *package.json* file.

