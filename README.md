# ethhmy-bridge.appengine
Harmony Layerzero Bridge appengine

## Install instructions

### Requirements 

* nodejs 

### Commands

* Fetch repo 

```
git clone git@github.com:harmony-one/layerzero-bridge.appengine.git
```

* Install dependencies

```
npm install
```

* Create empty secrets (read only mode)

```
mkdir -p ./keys
```

keys folder contain the firebase credentials in a file named `keys.json`

private environment can also be loaded there with a file named `.env.private`

* Develop

```
npm run build
npm run start:watch
```

* Build

```
npm run build
```

* Start prod

```
npm run start:prod
```

* How to get all operations list 

```
curl --location --request GET 'http://localhost:8080/operations'
```

# Docker

## build lz-be docker image
```
./build.sh
```

## push to docker hub
You need to have permission to push to the harmonyone repo.

```bash
sudo docker login
sudo docker tag lz-be harmonyone/lz-be:latest
sudo docker push harmonyone/lz-be
```
