const blessed = require('blessed');
const mc = require('minecraft-protocol');
const settings = require('./settings.js');

let {screen, chat, input, label} = ui();
let client = mc.createClient(settings.mc);
client.on('success', onlogin);

function onlogin(){
  label.setContent(` ${client.username} `);
  screen.render();
  client.removeListener('success', onlogin);
  
  client.on('chat', function({message}) {
    if (message!='""'){
      let out = '';
      let {extra=[], text=''} = JSON.parse(message);
      extra.forEach((text) => {
        if (text.hasOwnProperty('text')) out += text.text;
        else out += text;
      });
      chat.pushLine(out + text);
      screen.render();
    }
  });
  input.key('enter', function() {
    let msg = input.getValue();
    if (msg === 'exit') return process.exit(0);
    client.write('chat', {message: msg});
    input.clearValue();
    input.focus();
    screen.render();
  });
}
function ui(){
  let screen = blessed.screen({
    smartCSR: true,
    title: 'plexi\'s minecraft chat client'
  });

  const options = {
    padding: {
      left: 1,
      right: 1
    },
    border: {
      type: 'line'
    },
    style: {
      fg: 'white',
      border: {
        fg: 'gray'
      }
    }
  };
   
  let label;
  if (!settings.mc.hasOwnProperty('port')) label = ` ${settings.mc.host} `;
  else label = ` ${settings.mc.host}:${settings.mc.port} `;
  let chat = blessed.log(Object.assign({bottom: 3, label},options));
  
  let input = blessed.textbox(Object.assign({
    height: 3,
    bottom: 0,
    inputOnFocus: true
  },options));
  
  label = blessed.text({
    bottom: 2,
    left: 2,
    content: ` ${settings.mc.username} `
  });

  screen.append(chat);
  screen.append(input);
  screen.append(label);

  input.focus();
  screen.render();
  return {screen, chat, label, input};
}

