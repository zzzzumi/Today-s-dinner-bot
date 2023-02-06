var TOKEN = "your Token";
const shId = "your shId";
const ss = SpreadsheetApp.openById(shId).getSheetByName("your shPage1");
const sheet = SpreadsheetApp.openById(shId).getSheetByName("your shPage2");
const logs = SpreadsheetApp.openById(shId).getSheetByName("your shPage3");
var userDisplayName; //リプを送った人の名前
var replyMessage = "";
var count=0;
var time; //リプを送った時間
var values;　 //スプレッドシートから取得したデータ(2次元配列)
var valuesflat; //スプレッドシートから取得したデータを1次元配列にしたもの


function doPost(e){

  var event = JSON.parse(e.postData.contents).events[0]; //イベントを取得する

  if(event.type === "message"){

    if(event.message.type === "text"){
      var text = event.message.text;
      switch(text){
        case "入室":
          userDisplayName = input_menber(event);
          replyMessage = input_sh(userDisplayName,time)
          var reply_token = event.replyToken;
          var messages = [{ "type": "text",
                            "text": replyMessage}];
          sendReplyMessage(reply_token, messages);
          break

        case "退室":
          userDisplayName = input_menber(event);
          replyMessage = del_sh(userDisplayName,time);
          var reply_token = event.replyToken;
          var messages = [{ "type": "text",
                            "text": replyMessage }];
          sendReplyMessage(reply_token, messages);
          break

        case "今いる人":
          var reply_token = event.replyToken;
          count = sheet.getLastColumn();
          if(count == 0){
            replyMessage = "今いる人は"+count+"人です。"
          }
          else{
          values = sheet.getRange(1,1,1,count).getDisplayValues();
          replyMessage = "今いる人は"+count+"人です。"+"\n" + values.toString();
          }
          var messages = [{ "type": "text",
                            "text": replyMessage }];
          sendReplyMessage(reply_token, messages);
          break

        default:
          var reply_token = event.replyToken;
          var messages = [{ "type": "text",
                            "text": "対応していません" }];
          sendReplyMessage(reply_token, messages);
          break

      }
    }
  }
}

// あるメッセージに返信するReply APIを叩きます。Webhookイベントには必ず`replyToken`が設定されていて、それをReply APIにわたすと、即時返信ができるようになります
function sendReplyMessage(reply_token, messages){ //各状態でのreplyMessageを返信する処理
  var url = 'https://api.line.me/v2/bot/message/reply';
  var res = UrlFetchApp.fetch(url, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': reply_token,
      'messages': messages 
    }),
  });
  return res;
}

function input_menber(event,userDisplayName){  //リプを送った人の名前と、押した時間を取得し、名前を戻り値にする処理

    var userId = event.source.userId;
    var timestamp = event.timestamp;
    time = Utilities.formatDate(new Date(timestamp), 'JST', 'yyyy-MM-dd HH:mm:ss');
    var endPoint = `https://api.line.me/v2/bot/profile/${userId}`;
    const resp = UrlFetchApp.fetch(endPoint, {
      'headers': {
        "Content-Type": "application/json",
        Authorization: "Bearer " + TOKEN,
      },
      'method': "GET",
    });
    userDisplayName = JSON.parse(resp.getContentText()).displayName;

    return userDisplayName;
}

function input_sh(userDisplayName,time){ //入室を押したときのスプレッドシートとつながる処理

  const data = [userDisplayName,time,"入室"];
  var valuesNum = sheet.getLastColumn();
  if(valuesNum == 0){ //何もシートに記入されてなかった時の処理
    sheet.getRange(1,1).setValue(userDisplayName);
    valuesNum = sheet.getLastRow();
    values = sheet.getRange(1,1,1,valuesNum).getDisplayValues();
    ss.appendRow(data);
    replyMessage = "入室しました"
  }
  else{ //シートに何かが記入されているときの処理
    values = sheet.getRange(1,1,1,valuesNum).getDisplayValues();
    valuesflat = values.flat();
    var stringValues = values.toString();
    var bool = stringValues.includes(userDisplayName);
    if(bool){ //もし、リプを送った人の名前がすでにシートに記入されていたら
      replyMessage = "退室してください";
    }
    else{ //もし、リプを送った人の名前がすでにシートに記入されていなかったら
      sheet.getRange(1,1,1,valuesNum).clear();
      valuesflat.push(String(userDisplayName));
      sheet.appendRow(valuesflat);
      ss.appendRow(data);
      replyMessage = "入室しました";
    }
  }
  return replyMessage;
}

function del_sh(userDisplayName,time){ //退室を押したときのスプレッドシートとつながる処理

  const data = [userDisplayName,time,"退室"];
  var valuesNum = sheet.getLastColumn();
  if(valuesNum == 0){ //何もシートに記入されてなかった時の処理
    replyMessage = "入室してください"
  }
  else{ //シートに何かが記入されているときの処理
    values = sheet.getRange(1,1,1,valuesNum).getDisplayValues();
    valuesflat = values.flat();
    var stringValues = values.toString();
    var bool = stringValues.includes(userDisplayName);
    if(bool){ //もし、リプを送った人の名前がすでにシートに記入されていたら
      sheet.getRange(1,1,1,valuesNum).clearContent();
      var index = valuesflat.indexOf(userDisplayName);
      valuesflat.splice(index,1);
      if(valuesflat.length == 0){
        replyMessage = "退室しました";
        ss.appendRow(data);
        return replyMessage;
      }
      sheet.appendRow(valuesflat);
      ss.appendRow(data);
      replyMessage = "退室しました";
    }
    else{ //もし、リプを送った人の名前がすでにシートに記入されていなかったら
      replyMessage = "入室してください"
    }
  }
  return replyMessage;
}

function setList(){ //シートの情報を10時ごろに削除する関数
  var countRow = ss.getLastRow();
  var countColumn = sheet.getLastColumn();
  if(countRow == 0) return 0;
  ss.getRange(1,1,countRow,3).clearContent();
  if(countColumn == 0) return 0;
  sheet.getRange(1,1,1,countColumn).clearContent();
}

function log(message){
  logs.appendRow([message]);
}
