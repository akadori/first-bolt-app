const { App } = require('@slack/bolt')

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// September 30, 2019 11:59:59 PM を Unix エポックタイムで表示
const now = new Date()
const minuteAfter = new Date(now.getTime() + 60000)
const whenSeptemberEnds = Math.floor(minuteAfter/1000.0) ;


// wake me up うまくいかない
// Error: An API error occurred: internal_error
//     at Object.platformErrorFromResult (/Users/tamari/ghq/github.com/tamaritamari/first-bolt-app/node_modules/@slack/web-api/dist/errors.js:51:33)
//     at WebClient.apiCall (/Users/tamari/ghq/github.com/tamaritamari/first-bolt-app/node_modules/@slack/web-api/dist/WebClient.js:152:28)
//     at processTicksAndRejections (internal/process/task_queues.js:93:5)
//     at async /Users/tamari/ghq/github.com/tamaritamari/first-bolt-app/app.js:16:20
//     at async Array.<anonymous> (/Users/tamari/ghq/github.com/tamaritamari/first-bolt-app/node_modules/@slack/bolt/dist/middleware/builtin.js:189:9)
//     at async Array.<anonymous> (/Users/tamari/ghq/github.com/tamaritamari/first-bolt-app/node_modules/@slack/bolt/dist/middleware/builtin.js:217:9)
//     at async Array.exports.onlyEvents (/Users/tamari/ghq/github.com/tamaritamari/first-bolt-app/node_modules/@slack/bolt/dist/middleware/builtin.js:65:5) {
//   code: 'slack_webapi_platform_error',
//   data: {
//     ok: false,
//     error: 'internal_error',
//     response_metadata: { scopes: [Array], acceptedScopes: [Array] }
//   }
// }

// app.message('wake me up', async ({ message, context }) => {
//   try {
//     // トークンを用いて chat.scheduleMessage 関数を呼び出す
//     const result = await app.client.chat.scheduleMessage({
//       // アプリの初期化に用いたトークンを `context` オブジェクトに保存
//       token: context.botToken,
//       channel: message.channel.id,
//       post_at: whenSeptemberEnds,
//       text: 'Summer has come and passed'
//     });
//   }
//   catch (error) {
//     console.error(error);
//   }
// });

app.message('hello', async({message, say}) => {
  await say({
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Hey there <@${message.user}>!`
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Click Me"
          },
          "action_id": "button_click"
        }
      }
    ],
    text: `Hey there <@${message.user}>!`
  });
});
app.message(':wave:', async ({ message, say }) => {
  await say(`Hello, <@${message.user}>`);
});
app.action("button_click", async({body, ack, say}) => {
  await ack();
  await say(`<@${body.user.id}> clicked the button`);
});

// おれbolt才能ない 
// うまく動かない(https://slack.dev/bolt-js/ja-jp/concepts#event-listening)
//
// oauth: reactions:readを足してもダメでした
//
// app.event('reaction_added', async({item, item_user}, client) => {
//   console.log("reaction_added")
//   try {
//     const result = await client.chat.postMessage({
//       channel: item.channel,
//       text: `<@${item_user}> you pushed stamp button`
//     })
//     console.log(result)
//   }catch(error){
//     console.error(error)
//   }
// });

(async () => {
  await app.start(process.env.PORT || 3000)
  console.log('⚡️ Bolt app is running!')
})();
