const server = require("express")();
const line = require("@line/bot-sdk"); // Messaging APIのSDKをインポート
const axios = require("axios");


const line_config = {
    channelAccessToken: process.env.LINE_ACCESS_TOKEN, // 環境変数からアクセストークンをセットしています
    channelSecret: process.env.LINE_CHANNEL_SECRET // 環境変数からChannel Secretをセットしています
};

// Webサーバー設定
server.listen(process.env.PORT || 1212);

// APIコールのためのクライアントインスタンスを作成
const bot = new line.Client(line_config);

// ルーター設定
server.post('/bot/webhook', line.middleware(line_config), (req, res, next) => {
    // 先行してLINE側にステータスコード200でレスポンスする。
    res.sendStatus(200);

    // すべてのイベント処理のプロミスを格納する配列。
    let events_processed = [];

    // イベントオブジェクトを順次処理。
    req.body.events.forEach((event) => {
        // この処理の対象をイベントタイプがメッセージで、かつ、テキストタイプだった場合に限定。
        if (event.type == "message" && event.message.type == "text") {
            // ユーザーからのテキストメッセージが「こんにちは」だった場合のみ反応。
            if (event.message.text == "こんにちは") {
                // replyMessage()で返信し、そのプロミスをevents_processedに追加。
                events_processed.push(bot.replyMessage(event.replyToken, {
                    type: "text",
                    text: "これはこれは"
                }));
            }
        }
    });

    // すべてのイベント処理が終了したら何個のイベントが処理されたか出力。
    Promise.all(events_processed).then(
        (response) => {
            console.log(`${response.length} event(s) processed.`);
        }
    );
});

function getQiitaArticles() {
    return new Promise((resolve, reject) => {
        axios.get(process.env.QIITA_API)
            .then(function (response) {
                let articles = response.data;
                resolve(articles);
            })
            .catch(function (error) {
                reject(error);
            })
    });

}

async function selectArticleUrls() {
    let articles = await getQiitaArticles();
    let articleUrls = [];
    articles.forEach((element) => {
        articleUrls.push(element.node.linkUrl);
    });
    return articleUrls;
}

async function pushArticle() {
    const client = new line.Client({
        channelAccessToken: line_config.channelAccessToken
    });
    const articleUrls = await selectArticleUrls();

    articleUrls.forEach((articleUrl) => {
        let message = {
            type: 'text',
            text: articleUrl
        }
        client.pushMessage(process.env.LINE_USER_ID, message)
            .then((response) => {
                console.log('success push')
            })
            .catch((err) => {
                console.log('failure push! error: \n' + err)
            });
    });
}

//qiitaトレンド記事のpush通知を送る
pushArticle();
