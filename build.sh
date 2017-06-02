
mkdir node_modules
echo production > ./env
cp -r ./lib/* node_modules
npm install --registry=https://registry.npm.taobao.org
mkdir config/crawlerkeys
