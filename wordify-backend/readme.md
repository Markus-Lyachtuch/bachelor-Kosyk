Prequsities: docker should be installed and running

1. cd wordify-backend
2. Be sure that you have node.js and postgres installed not less than 20 version
3. npm install
4. Fill .env with .env.example field keys
5. npm run seed:oxford run script in order to fill oxford data json into database
6. Start docker container with

```
docker build -t wordify-backend .
docker run -p 8080:8080 "wordify-backend"
```
