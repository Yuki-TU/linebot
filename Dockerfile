
FROM node:14.5.0-alpine

# ワークディレクトリ
WORKDIR /app

# コンテナ内で必要なパッケージをインストール
COPY package.json .
RUN npm install

COPY . .

CMD npm start
