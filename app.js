const { App } = require('@slack/bolt')

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// September 30, 2019 11:59:59 PM を Unix エポックタイムで表示
const now = new Date()
const minuteAfter = new Date(now.getTime() + 60000)
const whenSeptemberEnds = Math.floor(minuteAfter/1000.0) ;

const globalMiddleWare = async({payload, context, next}) => {
  console.log('globalMiddleWare')
  await next()
}

app.use(globalMiddleWare)

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
      },
      {
        "block_id": "assign_ticket",
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Yahho!`
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Click Me"
          },
          "action_id": "select_user"
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
app.action("test", async({body, ack, say}) => {
  await ack();
  await say(`uuuuuuuuuu`);
});
app.action({ action_id: 'select_user', block_id: 'assign_ticket' },
  async ({ action, ack, context, respond }) => {
    console.log("app.action({ action_id: 'select_user', block_id: 'assign_ticket' },")
    await ack();
    await respond("yahho", {replace_original: true})
    // console.log(Object.entries(action))
    // try {
    //   const result = await app.client.reactions.add({
    //     token: context.botToken,
    //     name: 'white_check_mark',
    //     timestamp: action.ts,
    //     channel: action.channel.id
    //   });
    // }
    // catch (error) {
    //   console.error(error);
    // }
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

app.command('/open_modal', async({say, ack, command})=> {
  ack()    
  // 組み込みの WebClient を使って views.open API メソッドを呼び出す
  await say(`${command.text}`);
});

app.command('/ticket', async({ack, body, client}) => {
  await ack();
  try {
    const result = await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: 'modal',
        callback_id: 'view_1',
        title: {
          type: 'plain_text',
          text: 'Modal title'
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: "Welcome to a modal with _blocks_"
            },
            accessory: {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Click me!'
              },
              action_id: 'button_abc'
            }
          },
          {
            type: 'input',
            block_id: 'input_c',
            label: {
              type: 'plain_text',
              text: 'What are your hopes and dreames?'
            },
            element: {
              type:'plain_text_input',
              action_id: 'dreamy_input',
              multiline: true
            }
          }
        ],
        submit: {
          type:"plain_text",
          text: 'Submit'
        }
      }
    });
    console.log(result)
  }
  catch(err){
    console.error(err)
  }
});

app.action('button_abc', async({ack, body, client}) => {
  await ack();

  try {
    const result = await client.views.update({
      view_id: body.view.id,
      view: {
        type: 'modal',
        callback_id: 'view_1',
        title: {
          type: 'plain_text',
          text:'Updated modal'
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'plain_text',
              text: 'Updated modal'
            }
          },
          {
            type: 'image',
            image_url: 'https://media.giphy.com/media/SVZGEcYt7brkFUyU90/giphy.gif',
            alt_text: 'Yay! The modal was updated'
          }
        ]
      }
    });
    console.log(result)
  }catch(err){
    console.error(err)
  }
});

(async () => {
  await app.start(process.env.PORT || 3000)
  console.log('⚡️ Bolt app is running!')
})();
