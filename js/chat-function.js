//网络链接上了
function onNet(){
	//网络链接上了
	console.log("xmpp重连...");
	setTimeout(function(){
		mySdk.xmppLogin(function(){
			//重连成功后加入我自己的群聊
			GroupManager.joinMyRoom();
		});
	},2000);
}
//断网了
function offNet(){
	//网络断开了
	$("#myonline").html("(离线)");
}

//检查网络状态 和xmpp 链接状态
function checkNetAndXmppStatus(){
	console.log("当前网络状态 "+NetWork.online);
	if(NetWork.online){
		console.log(" xmpp链接状态 "+myConnection.connected);
		if(!myConnection.connected){
			$("#myonline").html("(离线)");
			//xmpp 链接断开了
			mySdk.xmppLogin(function(){
				$("#myonline").html("(在线)");
				GroupManager.joinMyRoom();
			});
		}
	}else 
		ownAlert(3,"网络断开了,请检查网络!");
	
}

function sleep(numberMillis) {
    var now = new Date();
    var exitTime = now.getTime() + numberMillis;
    while (true) {
        now = new Date();
        if (now.getTime() > exitTime)
            return;
    }
}

function unique(arr) {
	var result = [], isRepeated;
	for (var i = 0, len = arr.length; i < len; i++) {
		isRepeated = false;
		for (var j = 0, len = result.length; j < len; j++) {
			if (arr[i] == result[j]) {
				isRepeated = true;
				break;
			}
		}
		if (!isRepeated) {
			result.push(arr[i]);
		}
	}
	return result;
}

function welcome(from,userId,nickname,welcomeContent){ //打开系统聊天框，并显示欢迎信息
		// ownAlert(3,"欢迎测试");
		
		$("#userModal").modal('hide');
		ConversationManager.isOpen = true;
		ConversationManager.from = from;
		var type = from.indexOf(myData.mucJID) == -1 ? 1 : 0;
		
	    UI.showDetails(from,type,nickname);//打开系统聊天框
	    $("#msgTab").addClass("msgMabayChange"); //让消息Tab 处于选中状态
		if (1 == type){

		} else {
			/*var to = from + "/" + myData.userId;
			GroupManager._XEP_0045_018(to);*/
		}
		var welcomeHtml = "<div id='msg_"+userId+"' class='chat_content_group buddy'>"
						+	"<div class='imgAvatar floatLeft'>"
						+		"<figure>"
						+	   		"<img src='img/im_10000.png' class='chat_content_avatar'>"
						+		"</figure>"
						+	"</div>"
						+  "<p class='chat_nick'>"+nickname+"</p>"
						+   "<div class='content'>"
						+   	 "<p class='chat_content'>"+welcomeContent+"</p>"
						+   "</div>"
						+"</div>";

		// 追加消息
		$("#messageContainer").append(welcomeHtml);

		// 滚动到底部
		UI.scrollToEnd();

};

