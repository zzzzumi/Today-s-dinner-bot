var CHANNEL_ACCESS_TOKEN = "your Token";
const prop = PropertiesService.getScriptProperties().getProperties();

// 指定された日が営業日か（営業日 = 「土日でない」「祝日カレンダーに予定がない」）
// 営業日 = true
function isWorkday (targetDate) {

  // targetDate の曜日を確認、週末は休む (false)
  //var rest_or_work = ["REST","mon","tue","wed","thu","fri","REST"]; // 日〜土
  if (targetDate.getDay() == 0 || targetDate.getDay() == 6 ) {
    return false;
  }; 

  // 祝日カレンダーを確認する
  var calJpHolidayUrl = "ja.japanese#holiday@group.v.calendar.google.com";
  var calJpHoliday = CalendarApp.getCalendarById (calJpHolidayUrl);
  if (calJpHoliday.getEventsForDay (targetDate).length != 0) {
    // その日に予定がなにか入っている = 祝祭日 = 営業日じゃない (false)
    return false;
  } ;

  // 全て当てはまらなければ営業日 (True)
  return true;
}


/*
クイックリプライボタンを設定したメッセージを送る
———————————–*/
function pushmessage_quick_reply() {
	/* スクリプトプロパティのオブジェクトを取得 */
	

	/* クイックリプライボタンを設定したメッセージを送る */
	UrlFetchApp.fetch('https://api.line.me/v2/bot/message/push', {
		'headers': {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN, // スクリプトプロパティにトークンは事前に追加しておく
		},
		'method': 'POST',
		'payload': JSON.stringify({
			"to": 'Your GroupId', // スクリプトプロパティに送信先IDは事前に追加しておく
			"messages": [
				{
					"type": "text",
					"text": "今日の晩御飯は誰が作りますか？",
					"quickReply": {
						"items": [
							{
								"type": "action",
								"action": {
									"type": "message",
									"label": "Name1",
									"text": "Name1"
								}
							},
							{
								"type": "action",
								"action": {
									"type": "message",
									"label": "Name2",
									"text": "Name2"
								}
							},
              {
								"type": "action",
								"action": {
									"type": "message",
									"label": "Name3",
									"text": "Name3"
								}
							},
              {
								"type": "action",
								"action": {
									"type": "message",
									"label": "Name4",
									"text": "Name4"
								}
							},
              {
								"type": "action",
								"action": {
									"type": "message",
									"label": "外食or持ち帰り",
									"text": "外食、又は持ち帰りの予定です"
								}
							},
						]
					}
				}
			],
			"notificationDisabled": false // trueだとユーザーに通知されない
		}),
	});
}

// LINE Developersに書いてあるChannel Access Token
var access_token = "your Token"
// 自分のユーザーIDを指定します。LINE Developersの「Your user ID」の部分です。
var to = "your GropeId"
function createMessage() {
  //メッセージを定義する
  message = "何時に帰宅予定ですか？";
  return push(message);
}

/*↓----プッシュメッセージの関数----↓*/

//実際にメッセージを送信する関数を作成します。
function push(text) {
//メッセージを送信(push)する時に必要なurlでこれは、皆同じなので、修正する必要ありません。
//この関数は全て基本コピペで大丈夫です。
  var url = "https://api.line.me/v2/bot/message/push";
  var headers = {
    "Content-Type" : "application/json; charset=UTF-8",
    'Authorization': 'Bearer ' + access_token,
  };

  //toのところにメッセージを送信したいユーザーのIDを指定します。(toは最初の方で自分のIDを指定したので、linebotから自分に送信されることになります。)
  //textの部分は、送信されるメッセージが入ります。createMessageという関数で定義したメッセージがここに入ります。
  var postData = {
    "to" : to,
    "messages" : [
      {
        'type':'text',
        'text':text,
      }
    ]
  };

  var options = {
    "method" : "post",
    "headers" : headers,
    "payload" : JSON.stringify(postData)
  };

  return UrlFetchApp.fetch(url, options);
}

//プッシュメッセージのmain
function createMessege_main() {

  var today = new Date();

  // debug のために任意の日付を仕込む (year,month-1,day)
  //today = new Date(2022/0/10);

  // 営業日であれば実行
  if (isWorkday (today) == true) {
    createMessage();
  }
};

// クイックリプライのmain
function quick_push_main () {

  var today = new Date();

  // debug のために任意の日付を仕込む (year,month-1,day)
  //today = new Date(2022/0/10);

  // 営業日であれば実行
  if (isWorkday (today) == true) {
    pushmessage_quick_reply();
  }
};
