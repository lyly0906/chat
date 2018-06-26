var msgHistory = {};  //储存用于获取聊天历史记录的数据
var messageNumber = 0;  //记录用户接收到的(未读)消息数量
var friendRelation = {}; //记录好友关系  key：userId  value： true/false  true:是好友 false:不是好友
var ConversationManager = {
	isOpen : false,// 聊天窗口是否打开
	from : null,// 目标用户
	fromUserId:null,
	msgsList : {},
	roomData : null,
	user:null,
	friend:null,
	isGroup:0,//1是群聊 0是单聊
	username:null,
	/**
	 * 打开会话
	 */
	open : function(from, name) {
		$("#messageBody").val("");
		$("#userModal").modal('hide');
		this.isOpen = true;
		this.from = from;
		ConversationManager.username = name;
		this.fromUserId=myFn.getUserIdFromJid(from);
		var type = from.indexOf(AppConfig.mucJID) == -1 ? 1 : 0;
		if(0==type)
			this.isGroup=1;
		else
			this.isGroup=0;
        console.log(type);
		//将获取消息历史记录的数据进行临时存储
		msgHistory["type"] = type;
		msgHistory["from"] = from;
		msgHistory["index"] = 0; //将聊天记录的页码数进行初始化
		var chatType=1==type?"chat":"groupchat";
		//判断是否存在本地未读消息
		console.log(this.fromUserId);
		if(!myFn.isNil(DataMap.unReadMsg[this.fromUserId]) && this.fromUserId == 10000){

			var unReadMsg = DataMap.unReadMsg[this.fromUserId];
			console.log(unReadMsg);

			UI.showDetails(from,type,name); //显示顶部数据
			if (1 == type){
				$("#Snapchat").show();
			} else {
				GroupManager._XEP_0045_037(ConversationManager.fromUserId,myData.userId);
				$("#Snapchat").hide();
			}
			//清除未读消息数量提示
			UI.clearMsgNum(ConversationManager.fromUserId);
			for (var i = 0; i < unReadMsg.length; i++) {
				var msg = unReadMsg[i];
				if(msg.type == 202)
					msg.messageId = unReadMsg[i-1].messageId;
				var itemHtml = UI.createItem(msg, ConversationManager.fromUserId, 0);
				if(myFn.isNil(itemHtml))
					return "";
				$("#messageContainer").append(itemHtml);

			}
			setTimeout(function(){ //将滚动条移动到最下方
				UI.scrollToEnd();
			},400);
			//存储消息记录的结束时间
			DataMap.msgEndTime[ConversationManager.fromUserId] = unReadMsg[0].timeSend;

			mySdk.showLoadHistoryIcon(1); //加载消息历史结束后，显示消息历史的相关Icon
			return;
		}

		ConversationManager.showHistory(false, type, from, 0, function(status, result) {
			if (0 == status) {
				UI.showDetails(from,type,name); //显示顶部数据
				if (1 == type){
					$("#Snapchat").show();
				} else {
					GroupManager._XEP_0045_037(ConversationManager.fromUserId,myData.userId);
					$("#Snapchat").hide();
					
				}
                console.log(result);

				var length = result.length - 1;
				for (var i = length; i >= 0; i--) {
					var o = result[i];
					
					var msg=eval("(" + o.body.replace(/&quot;/gm, '"') + ")");
					//if(msg.type>100 )continue;
					msg.chatType=chatType;
					msg.id=o.messageId;
					if(myFn.isEncrypt(msg)){
						
						ConversationManager.decrypt(msg,function(contentType,text){
							msg.type=contentType;
							msg.content=text;
							//消息显示到Html中
							ConversationManager.showHistoryToHtml(type,o,msg);
						});
						
					}else{
						ConversationManager.showHistoryToHtml(type,o,msg);
					}
				}
				//清除未读消息数量提示
				UI.clearMsgNum(ConversationManager.fromUserId);
				mySdk.showLoadHistoryIcon(1); //加载消息历史结束后，显示消息历史的相关Icon	

			} else{
				ownAlert(2,result);
			}
		});
	},
	showAvatar : function(userId){ //显示聊天窗口顶部头像和昵称
		$("#chatAvator").empty();
		$("#desphoto").empty();
		$("#gphoto").empty();
		var imgUrl=10000!=userId?myFn.getAvatarUrl(userId):"img/im_10000.png";
		var avatarHtml ="<div class='imgAvatar'>"
			           +	"<figure style='height:40px;width:40px;'>"
		               +	  "<img onerror='this.src=\"img/ic_avatar.png\"' src='" + imgUrl+ "' class='chat_content_avatar'>"
		               +	"</figure>"
		               +"</div>";
		$("#chatAvator").append(avatarHtml);
		$("#desphoto").append(avatarHtml);
		$("#gphoto").append(avatarHtml);
		$("#"+userId+"").hide();
	},
	showHistory : function(isLocal, type, id, pageIndex, cb,endTime) {
		
		if (isLocal) {
			var msgs = this.msgsList[from];
			var length = msgs.length - 1;
			for (var i = length; i == 0; i--) {
				var msg = msgs[i];
			}
		} else {
			var eTime = endTime*1000;
			if(myFn.isNil(endTime)){
				eTime = 0;
			}
			var url = 1 == type ? '/tigase/shiku_msgs' : '/tigase/shiku_muc_msgs';
			var params = {
				pageIndex : pageIndex,
				pageSize : 10,
				endTime : new Date().getTime()
			};
			params[1 == type ? "receiver" : "roomId"] = myFn.getUserIdFromJid(id);
			params["userId"] = myFn.getUserIdFromJid(myData.jid);
			myFn.invoke({
				url : url,
				data : params,
				success : function(result) {
					if (1 == result.resultCode) {
						cb(0, result.data);
						var msg=null;
						for (var i = 0; i < result.data.length; i++) {
							msg=eval("(" + result.data[i].body.replace(/&quot;/gm, '"') + ")");
							DataMap.msgMap[msg.messageId]=msg;
						}
						msgHistory["index"] = msgHistory["index"] + 1; //页码数加1
					} else {
						cb(1, result.resultMsg);
					}
				},
				error : function(result) {
					cb(1, null);
				}
			})
		}
	},
	showHistoryToHtml:function(type,o,msg){ //显示历史消息记录
		//console.log("dsfsdfsd"+msg);
		var itemHtml = "";
			if (1 == type) {
				if (o.direction == 0) {
					itemHtml += UI.createItem(msg, o.sender, o.direction);
				} else {
					if(myData.userId == o.sender){   // 我自发的才显示状态
						itemHtml += UI.createItem(msg, o.receiver, 1);
					}else{
						itemHtml += UI.createItem(msg, o.receiver, 0);
					}
				}
			} else {
				if (myData.userId == o.sender) {
					itemHtml += UI.createItem(msg, o.sender, o.direction);
				} else {
					itemHtml += UI.createItem(msg, o.sender, o.direction);
				}
			}
			if(myFn.isNil(itemHtml))
				return "";
			$("#messageContainer").append(itemHtml);
			
			//检查记录中是否存在未读消息
			if(1!=ConversationManager.isGroup&&msg.isRead == false && o.sender != myData.userId){
				ConversationManager.sendReadReceipt(ConversationManager.from, myData.jid, o.messageId); //发送已读回执
				//调用方法将该消息在数据库中的状态改为已读
				changeRead(o.messageId);
			}
			setTimeout(function(){
				UI.scrollToEnd();
			},500);
		
	},
	storeMsg : function(from, to, msg) {
		var msgs = ConversationManager.msgsList[from];
		if (undefined == msgs || null == msgs) {
			msgs = new Array();
			this.msgsList[from] = msgs;
		}
		msgs.push(msg);
	},
	encrypt:function(msg,cb) {
		var url ='/tigase/encrypt';
		var key="12345678";
		var params = {
				text : msg.content,
				key : key
			};
		myFn.invoke({
				url : url,
				data : params,
				success : function(result) {
					if (1 == result.resultCode) {
						cb(msg.type,result.data.text);	
					}
				},
				error : function(result) {
					cb(1, null);
				}
			});
	},
	decrypt:function(msg,cb) {
			var url ='/tigase/decrypt';
			var key="12345678";
			var params = {
					text : msg.content,
					key : key
				};
		myFn.invoke({
				url : url,
				data : params,
				success : function(result) {
					if (1 == result.resultCode) {
						cb(msg.type,result.data.text);	
					}
				},
				error : function(result) {
				}
			});
		
	},
	//收到消息
	receiver : function(elem) {
		if(elem.childNodes.length >= 2){
			console.log(elem);
			for(var i=0;i<elem.childNodes.length;i++){
				if(elem.childNodes[i].nodeName == "message"){
					var message = ConversationManager.checkMessageNew(elem.childNodes[i]);
					console.log("处理后1的message");
                    console.log(message);
					// 因为此处已经剥离为单消息体，则直接检查是否为消息回执
					if(myFn.isNil(message))
						continue;
					var from = message.getAttribute('from');
					var fromUserId = myFn.getUserIdFromJid(from);

					//判断消息是否来自于黑名单用户，是则不接收
					if(!myFn.isNil(DataMap.blackListUIds[fromUserId])){
						return;
					}
					var type = message.getAttribute('type');

					var bodyElem = message.getElementsByTagName('body')[0];

					//console.log("body "+bodyElem);
					// 非单聊或群聊消息或消息内容为空
					if ((type != "chat" && type != "groupchat") || bodyElem == undefined || bodyElem.length <= 0) {
						console.log("跳过1： type "+type+"  "+ bodyElem);
						return;
					}

					var bodyText = Strophe.getText(bodyElem);



					if ("{" != bodyText.charAt(0) || "}" != bodyText.charAt(bodyText.length - 1)) {
						//console.log("跳过：" + bodyText);
						// 说明是ejabberd 过来的数据需要处理
						var username = ConversationManager.username;
						//bodyText = "{&quot;content&quot;:&quot;'+ bodyText +'&quot;,&quot;type&quot;:1,&quot;fromUserName&quot;:&quot;"+ username +"&quot;}";
						bodyText = {
							messageId: message.getAttribute('id'),
							fromUserId : fromUserId,
							fromUserName : username,
							content : bodyText,
							type : type
						};
						//return;
					}

					var msg = eval("(" + bodyText.replace(/&quot;/gm, '"') + ")");

					var contextType=msg.type;
					//过滤 body.type
					if(!ConversationManager.filterContenTType(contextType))
						return;
					var id = message.getAttribute('id');
					var to = message.getAttribute('to');
					var toUserId = myFn.getUserIdFromJid(to);
					msg.id=id;
					console.log(id+"|"+to);
					msg.chatType=type;
					if(type == "chat"){//单聊 //群聊不发回执
						if(localStorage.getItem("jid") !== null){
							var tmpjid = localStorage.getItem("jid").replace(","+fromUserId,"");
							localStorage.setItem("jid",tmpjid);
						}
						// 删除数据库的记录
						myFn.invoke({
							url : '/chatkeep/delete',
							data : {
								userId : myData.userId,
								toUserId : fromUserId,
								jid : 0,
								type:0
							},
							success : function(result) {
								if (1 == result.resultCode) {
									//console.log(result.resultMsg);
									return true;
								}
							},
							error : function(result) {
							}
						});
						// 收到消息立即发送回执给发送者
						if(msg.fromUserId!=myData.userId&&26!=msg.type){
							var delay=message.getAttribute("delay");//有这个字段就代表是离线消息
							if(myFn.isNil(delay)) //离线消息 不发送达回执
								ConversationManager.receipt(from, to, id);
						}

					}else if(type == "groupchat"){//群聊
						if(localStorage.getItem("mucjid") !== null){
							var tmpmucjid = localStorage.getItem("mucjid").replace(","+fromUserId,"");
							localStorage.setItem("mucjid",tmpmucjid);
						}
						// 删除数据库的记录
						myFn.invoke({
							url : '/chatkeep/delete',
							data : {
								userId : myData.userId,
								toUserId : 0,
								jid:fromUserId,
								type:1
							},
							success : function(result) {
								if (1 == result.resultCode) {
									//console.log(result.resultMsg);
									return true;
								}
							},
							error : function(result) {
							}
						});
					}

					if(myFn.isEncrypt(msg)){
						ConversationManager.decrypt(msg,function(type,text){
							msg.type=type;
							msg.content=text;
							ConversationManager.receiverShowMsg(from,fromUserId,to,msg);
						});

					}else{
						ConversationManager.receiverShowMsg(from,fromUserId,to,msg);
					}
				}else if(elem.childNodes[i].nodeName == "presence"){
					ConversationManager.checkPresence(elem.childNodes[i],1);
				}
			}
		}else{
			var presence = ConversationManager.checkPresence(elem,0);
			if(!myFn.isNil(presence)){
				return;
			}
			var message=ConversationManager.checkMessage(elem);
            console.log("单个message");
			console.log(elem);
			console.log("处理后的message");
			console.log(message);
			if(myFn.isNil(message))
				return;
			var from = message.getAttribute('from');
			var fromUserId = myFn.getUserIdFromJid(from);

			//判断消息是否来自于黑名单用户，是则不接收
			if(!myFn.isNil(DataMap.blackListUIds[fromUserId])){
				return;
			}
			var type = message.getAttribute('type');

			var bodyElem = message.getElementsByTagName('body')[0];

			//console.log("body "+bodyElem);
			// 非单聊或群聊消息或消息内容为空
			if ((type != "chat" && type != "groupchat") || bodyElem == undefined || bodyElem.length <= 0) {
				console.log("跳过： type "+type+"  "+ bodyElem);
				return;
			}

			var bodyText = Strophe.getText(bodyElem);



			if ("{" != bodyText.charAt(0) || "}" != bodyText.charAt(bodyText.length - 1)) {
				//console.log("跳过：" + bodyText);
				// 说明是ejabberd 过来的数据需要处理
				var username = ConversationManager.username;
				//bodyText = "{&quot;content&quot;:&quot;'+ bodyText +'&quot;,&quot;type&quot;:1,&quot;fromUserName&quot;:&quot;"+ username +"&quot;}";
				bodyText = {
					messageId: message.getAttribute('id'),
					fromUserId : fromUserId,
					fromUserName : username,
					content : bodyText,
					type : type
				};
				//return;
			}

			var msg = eval("(" + bodyText.replace(/&quot;/gm, '"') + ")");

			var contextType=msg.type;
			//过滤 body.type
			if(!ConversationManager.filterContenTType(contextType))
				return;
			var id = message.getAttribute('id');
			var to = message.getAttribute('to');

			var toUserId = myFn.getUserIdFromJid(to);
			msg.id=id;
			console.log(id);
			msg.chatType=type;
			if(type == "chat"){//单聊 //群聊不发回执
				if(localStorage.getItem("jid") !== null){
					var tmpjid = localStorage.getItem("jid").replace(","+fromUserId,"");
					localStorage.setItem("jid",tmpjid);
				}

				// 删除数据库的记录
				myFn.invoke({
					url : '/chatkeep/delete',
					data : {
						userId : myData.userId,
						toUserId : fromUserId,
						jid : 0,
						type:0
					},
					success : function(result) {
						if (1 == result.resultCode) {
							//console.log(result.resultMsg);
							return true;
						}
					},
					error : function(result) {
					}
				});

				// 收到消息立即发送回执给发送者
				if(msg.fromUserId!=myData.userId&& 26!=msg.type){
					var delay=message.getAttribute("delay");//有这个字段就代表是离线消息
					if(myFn.isNil(delay)) //离线消息 不发送达回执
						ConversationManager.receipt(from, to, id);
				}

			}else if(type == "groupchat"){//群聊
				if(localStorage.getItem("mucjid") !== null){
					var tmpmucjid = localStorage.getItem("mucjid").replace(","+fromUserId,"");
					localStorage.setItem("mucjid",tmpmucjid);
				}

				// 删除数据库的记录
				myFn.invoke({
					url : '/chatkeep/delete',
					data : {
						userId : myData.userId,
						toUserId : 0,
						jid:fromUserId,
						type:1
					},
					success : function(result) {
						if (1 == result.resultCode) {
							//console.log(result.resultMsg);
							return true;
						}
					},
					error : function(result) {
					}
				});
			}

			if(myFn.isEncrypt(msg)){
				ConversationManager.decrypt(msg,function(type,text){
					msg.type=type;
					msg.content=text;
					ConversationManager.receiverShowMsg(from,fromUserId,to,msg);
				});

			}else{
				ConversationManager.receiverShowMsg(from,fromUserId,to,msg);
			}
		}
	},
	//获取 xml message
	getMessage:function(elem){
		var message=null;

		if (elem.childNodes.length == 0)
			return message;
		if (elem.firstChild.nodeName != "message")
			return message;
		else {
			message = elem.firstChild;
		}
		console.log("message "+message.toString());
		return message;

	},
	getPresence:function(elem){
		var presence=null;

		if (elem.childNodes.length == 0)
			return presence;
		if (elem.firstChild.nodeName != "presence")
			return presence;
		else {
			presence = elem.firstChild;
		}
		return presence;
	},
	//接受的消息显示到页面
	receiverShowMsg:function(from,fromUserId,to,msg){
			//if(msg.chatType == "groupchat")//群聊
				//调整控制信息  401 群文件上传  402 群文件删除

				if(parseInt(msg.type/100)==9||401==msg.type||402==msg.type){
					msg=GroupManager.converGroupMsg(msg);
					UI.showMsg(msg, fromUserId, 0);
					return;
				}
				//好友验证 消息
				if (parseInt(msg.type/100)==5){
					UI.showMsgNum(10001);
					msg.fromUserId=fromUserId;
					UI.msgWithFriend(msg);
					return;
				}

				// 存储消息
				ConversationManager.storeMsg(from, to, msg);
				var fromJid=ConversationManager.from;
				var isGroup=myFn.isNil(msg.objectId)?false:myFn.getUserIdFromJid(fromJid)==msg.objectId;
					// 显示
					if (ConversationManager.isOpen && (fromJid.toLowerCase()
							== from.substr(0, from.indexOf("/")).toLowerCase()||isGroup)) { //判断聊天面板是否打开
						console.log("聊天面板已打开，显示消息。");
						console.log("msgType  " + msg.type+"   "+msg.content);
						if (from.indexOf(AppConfig.mucJID) != -1) {
							var jid = from.substr(0, from.indexOf("@"));
							if (GroupManager.filters[jid]) {
								return;
							}
						}
						if(msg.fromUserId==myData.userId)
							return;
						else if (fromUserId == myData.userId) {
							// console.log("显示自己发送的")
							// UI.showMsg(msg, fromUserId, 1);
						} else
							UI.showMsg(msg, fromUserId, 0);
						    console.log("msgType2  " + msg.type+"   "+msg.content);
						if(26==msg.type||201==msg.type||10005==fromUserId)//已读回执 和正在输入状态 终止执行
							return;
						if(msg.chatType == "chat"){//单聊
							if(26!=msg.type){
								ConversationManager.sendReadReceipt(from, to, msg.id); //发送已读回执
								if(201!=msg.type&&26!=msg.type&&parseInt(msg.type/100)!=5){
									if(10005==fromUserId)
										return;
									UI.moveFriendToTop(fromUserId,0,0);
									
								}
							}
						}else  if("groupchat"==msg.chatType){
							UI.moveFriendToTop(fromUserId,0,1);
						}
						console.log("msgType3  " + msg.type+"   "+msg.content);
						
					}else {
						console.log("聊天面板已关闭");
						if(msg.type == 83){ // 显示接收红包
							UI.showMsg(msg, fromUserId, 0);
							return;
						}
						//已读回执 和正在输入状态 终止执行
						if(26==msg.type||201==msg.type|| 202 == msg.type || 10005==fromUserId)
							return;
						if("chat"==msg.chatType){
							if(10005==fromUserId)
								return;
							//接受到消息好友移动到新朋友的下方  //显示未读消息数量提示
							// $("#myFriendsList #friends_"+fromUserId).insertAfter("#friends_10001");	
						    console.log("打印收到消息的type"+msg.type);
							// 次数的数据量显示并没有过滤掉撤销的数据，反倒会增加消息条数
							UI.moveFriendToTop(fromUserId,1,0);
							if(msg.type == 202){
                                var originMsgNum = 0;
								if(DataMap.msgNum[fromUserId]<=2){
									originMsgNum = DataMap.msgNum[fromUserId];
									DataMap.msgNum[fromUserId] = DataMap.msgNum[fromUserId] -1;
								}else{
									DataMap.msgNum[fromUserId] = DataMap.msgNum[fromUserId] - 1;
									originMsgNum = DataMap.msgNum[fromUserId];
								}
								$("#myMessagesList #msgNum_"+fromUserId+" #span").html(originMsgNum);
								$("#to #messageNum").text(originMsgNum);
							}
						}else if("groupchat"==msg.chatType){
							UI.moveFriendToTop(fromUserId,1,1);
							$("#myRoomList #groups_"+fromUserId).prependTo($("#myRoomList"));
						}

						//存储没有显示到页面的消息(未读消息)
						if(myFn.isNil(DataMap.unReadMsg[fromUserId]) ){ //判断是否存在记录，没有则创建
							/*ownAlert(3,"没有数据哦");*/
							var unReadMsgMap = new Array();
							unReadMsgMap.push(msg);
							DataMap.unReadMsg[fromUserId] = unReadMsgMap;
						}else{ //存在记录，则添加
							DataMap.unReadMsg[fromUserId].push(msg);
						}
							


					}

	},
	//接受的消息显示到页面(初始化会话列表)
	receiverShowMsgNew:function(from,fromUserId,to,msg){

		//if(msg.chatType == "groupchat")//群聊
		//调整控制信息  401 群文件上传  402 群文件删除
		if(parseInt(msg.type/100)==9||401==msg.type||402==msg.type){
			msg=GroupManager.converGroupMsg(msg);
			UI.showMsg(msg, fromUserId, 0);
			return;
		}
		//好友验证 消息
		if (parseInt(msg.type/100)==5){
			UI.showMsgNum(10001);
			msg.fromUserId=fromUserId;
			UI.msgWithFriend(msg);
			return;
		}

		// 存储消息
		ConversationManager.storeMsg(from, to, msg);
		var fromJid=ConversationManager.from;
		var isGroup=myFn.isNil(msg.objectId)?false:myFn.getUserIdFromJid(fromJid)==msg.objectId;
		// 显示
		if (ConversationManager.isOpen && (fromJid.toLowerCase()
			== from.substr(0, from.indexOf("/")).toLowerCase()||isGroup)) { //判断聊天面板是否打开
			//console.log("聊天面板已打开，显示消息。")

			if (from.indexOf(AppConfig.mucJID) != -1) {
				var jid = from.substr(0, from.indexOf("@"));
				if (GroupManager.filters[jid]) {
					return;
				}
			}
			if(msg.fromUserId==myData.userId)
				return;
			else if (fromUserId == myData.userId) {
				// console.log("显示自己发送的")
				// UI.showMsg(msg, fromUserId, 1);
			} else
				UI.showMsg(msg, fromUserId, 0);
			console.log("msgType1  " + msg.type+"   "+msg.content);
			if(26==msg.type||201==msg.type||10005==fromUserId)//已读回执 和正在输入状态 终止执行
				return;
			if(msg.chatType == "chat"){//单聊
				if(26!=msg.type){
					ConversationManager.sendReadReceipt(from, to, msg.id); //发送已读回执
					if(201!=msg.type&&26!=msg.type&&parseInt(msg.type/100)!=5){
						if(10005==fromUserId)
							return;
						UI.moveFriendToTop(fromUserId,0,0);

					}
				}
			}else  if("groupchat"==msg.chatType){
				UI.moveFriendToTop(fromUserId,0,1);
			}


		}else {
			//已读回执 和正在输入状态 终止执行
			if(26==msg.type||201==msg.type||10005==fromUserId)
				return;
			if("chat"==msg.chatType){
				if(10005==fromUserId)
					return;
				//接受到消息好友移动到新朋友的下方  //显示未读消息数量提示
				// $("#myFriendsList #friends_"+fromUserId).insertAfter("#friends_10001");

				UI.moveFriendToTopNew(fromUserId,0,0);
			}else if("groupchat"==msg.chatType){
				UI.moveFriendToTopNew(fromUserId,0,1);
				$("#myRoomList #groups_"+fromUserId).prependTo($("#myRoomList"));
			}

			//存储没有显示到页面的消息(未读消息)
			if(msg.type != 202){
				console.log(111);
				if(myFn.isNil(DataMap.unReadMsg[fromUserId]) ){ //判断是否存在记录，没有则创建
					/*ownAlert(3,"没有数据哦");*/
					var unReadMsgMap = new Array();
					unReadMsgMap.push(msg);
					DataMap.unReadMsg[fromUserId] = unReadMsgMap;
				}else{ //存在记录，则添加
					DataMap.unReadMsg[fromUserId].push(msg);
				}

			}



		}

	},
	//消息回执
	receipt : function(from, to, id) {
		var receipt = $msg({
			to : from,
			from : to,
			type : 'chat'
		}).c("received", {
			xmlns : "urn:xmpp:receipts",
			id : id
		}, null);
		myConnection.send(receipt.tree());

		console.log("发送回执：" + receipt);
	},
	//发送已读回执
	sendReadReceipt : function(from, to,messageId) {
		var msg=ConversationManager.createMsg(26,messageId);

		var receipt = $msg({
			to : from,
			from : to,
			type : 'chat',
			id:messageId
		}).c("body", null, JSON.stringify(msg)).c
		("request", {
			xmlns : "urn:xmpp:receipts"
		}, null);
		myConnection.send(receipt.tree());
		
		console.log("发送已读回执："+receipt);
		
	},
	checkPresence:function(elem,type){
		var presence = "";
		if(type == 0){
			presence = ConversationManager.getPresence(elem);
		}else{
			presence = elem;
		}
		if(presence != null)
			ConversationManager.isPresence(presence);
		return presence;
	},
	//检测消息内容
	checkMessage:function(elem){
		//console.log("检测消息内容");
		//console.log(elem);
		//检查是否被挤下线
		if(ConversationManager.checkConflict(elem))
			return null;
		var message=ConversationManager.getMessage(elem);
		if(null==message)
			return null;
		else if(ConversationManager.checkReceived(message))
			return null;
		else return message;

	},
	//检测消息内容，为集合包做检测
	checkMessageNew:function(message){
		//console.log("检测消息内容");
		//console.log(elem);
		//检查是否被挤下线
		if(ConversationManager.checkConflict(message))
			return null;
		if(ConversationManager.checkReceived(message))
			return null;
		else return message;

	},
	//检测是否为下线消息
	checkConflict:function(elem){
		var type = elem.getAttribute('type');
		var condition=elem.getAttribute('condition');
		if(myFn.isNil(type)||myFn.isNil(condition))
			return false;
		/*if("remote-stream-error"==condition&&"terminate"==type){
			ownAlert(3,"您已经被挤下线");
			window.location.href = "login.html";
			return true;
		}*/
		return false;
	},
	//检测是否为消息回执
	checkReceived:function(message){
		var received=message.getElementsByTagName('received')[0];
		if(myFn.isNil(received))
			return false;
		else {

			var id = received.getAttribute('id');
			//console.log("消息体："+received);
			var xmlns=received.getAttribute('xmlns');
			if(myFn.notNull(xmlns)&&myFn.notNull(id)){
				//console.log("收到送达回执 ："+id);
				DataMap.msgStatus[id] = 1; //将发送消息状态进行储存 1:送达
				//将对应消息的状态显示为送达
				$("#msgStu_"+id+"").attr("class","msgStatus msgStatusBG"); //改变背景
				$("#msgStu_"+id+"").empty();
				if(1==ConversationManager.isGroup){
					$("#msgStu_"+id+"").attr("class","msgStatus"); 
					$("#msgStu_"+id+"").text("").show();
				}
				else
					$("#msgStu_"+id+"").text("送达").show();
				return true;
			}
		}
		return false;
	},
	isPresence:function(presence){
		var type = presence.getAttribute('type');

		if(myFn.notNull(type)&&myFn.notNull(type)){
			if(type == "unavailable"){
				var from = presence.getAttribute("from");
				from = from.split("@")[0];
				if(from != myData.userId && presence.getAttribute("from").indexOf('muc') < 0){
					console.log("offline");
					DataMap.friendsOnlineStatus[from] = "OFFLINE";
					$("#friends_"+from + " .inline-state").hide();
					$(".headContent #state").html("(离线)");
				}
			}
		}else{
			var from = presence.getAttribute("from");
			from = from.split("@")[0];
			if(from != myData.userId && presence.getAttribute("from").indexOf('muc') < 0){
				console.log("online");
				DataMap.friendsOnlineStatus[from] = "ONLINE";
				$("#friends_"+from + " .inline-state").show();
				$(".headContent #state").html("(在线)");
			}
		}
		console.log(DataMap.friendsOnlineStatus);
	},
	filterContenTType:function(type){
		//已读回执
		// if(42==type||43==type)
		// 	return false;
		return true;

	},
	refresh:function(msg){
		var timeSend = Math.round(new Date().getTime() / 1000);
		var messageId=myFn.randomUUID();

			msg.messageId=messageId;
			msg.fromUserId = myData.user.userId + "";
			msg.fromUserName = myData.user.nickname;
			msg.timeSend = timeSend;
			msg.isEncrypt=myData.isEncrypt;
			msg.isReadDel=myData.isReadDel;
			msg.isRead=false;
		return msg;
	},
	createMsg :function(type,content){

			var timeSend = Math.round(new Date().getTime() / 1000);
			var messageId=myFn.randomUUID();
			var msg = {
				messageId:messageId,
				fromUserId : myData.user.userId + "",
				fromUserName : myData.user.nickname,
				content : content,
				timeSend : timeSend,
				type : type,
				isEncrypt:myData.isEncrypt,
				isReadDel:myData.isReadDel,
				isRead:false
			};
			return msg;
	},
	showLog :function(msg){//日志
		if(msg.fromUserId==ConversationManager.fromUserId){
			var logHtml ="<div class='logContent' >"
						+"	<span>"+msg.content+"</span> "
						+"</div>";
			$("#messageContainer").append(logHtml);
			UI.scrollToEnd();
		}

	},
	sendMsg : function(msg,callback,toJid) {
		//检查Xmpp 是否在线
		if(myConnection.connected){
			ConversationManager.checkEncrypt(msg,function(result){
				ConversationManager.sendMsgAfter(result,toJid);
				callback(result);
			});
		}else{
			window.wxc.xcConfirm("你已掉线是否重新登录？", window.wxc.xcConfirm.typeEnum.confirm,{
				onOk:function(){
					mySdk.xmppLogin(function(){
						GroupManager.joinMyRoom();
						ConversationManager.checkEncrypt(msg,function(result){
							ConversationManager.sendMsgAfter(result,toJid);
							callback(result);
						});
					});
				}
			});
		}
		

	},
	sendMsgAfter:function(msg,toJid){
		var type=msg.type;
		var from = myData.jid;
		// toJid指定的消息接受者
		// Temp.toJid 临时的消息接受者
		// ConversationManager.from  聊天框的消息接受者
		
		/*if(myFn.isNil(toJid))
			toJid=Temp.toJid;*/
		if(myFn.isNil(toJid))
		 	toJid = ConversationManager.from;
		// 存储消息
		ConversationManager.storeMsg(toJid, from, msg);
		/*var iqcarbon = $iq({
			id : "enableCarbons",
			xmlns : "jabber:client",
			type : "set"
		}).c("enable", {
			xmlns : "urn:xmpp:carbons:2"
		}, null);

		myConnection.sendIQ(iqcarbon,function(santa){
			console.log(santa);
		});*/
				
		// 发送消息
		var elem = null;
		var toGoal = null;
		if (toJid.indexOf("@"+AppConfig.mucJID) != -1) {
			toGoal = toJid.replace("@"+AppConfig.mucJID,"");
			elem = $msg({
				to : toJid,
				type : 'groupchat',
				id : msg.messageId
			}).c("body", null, JSON.stringify(msg)).c("request", {
				xmlns : "urn:xmpp:receipts"
			}, null);
		} else {
			toGoal = toJid.replace("@"+AppConfig.boshDomain,"");
			elem = $msg({
				to : toJid,
				type : 'chat',
				id : msg.messageId
			}).c("body", null, JSON.stringify(msg)).c("request", {
				xmlns : "urn:xmpp:receipts"
			}, null);
		}

		/*console.log("msg");
		console.log(msg);
		console.log("打印msg");
		console.log(JSON.stringify(msg));
		console.log("打印message");
		console.log(elem.toString());
		console.log("打印toJid");
		console.log(toJid+'|'+toGoal);
		console.log("打印Jid");
		console.log(from+'|'+myData.user.userId+'|'+myData.user.nickname);
		console.log("打印content");
		//msg.content = msg.content ? msg.content : JSON.stringify(msg);
		console.log(msg.content);*/
		if (toJid.indexOf("@"+AppConfig.mucJID) != -1) {
            // 群聊模式归档
			$.ajax({
				type: "POST", //提交方式
				url : AppConfig.apiUrl+'/tigase/addMucMsg',//路径
				data:{
					room_id:toGoal,
					room_jid:toJid,
					body: JSON.stringify(msg),
					message: elem.toString(),
					sender: myData.user.userId,
					sender_jid: from,
					nickname:myData.user.nickname,
					messageId: msg.messageId,
					context: msg.content,
					access_token:myData.access_token
				},//数据，这里使用的是Json格式进行传输
				success: function (result) {//返回数据根据结果进行相应的处理
					//console.log(result);
				},
				error : function(XMLHttpRequest, textStatus, errorThrown) {//这个error函数调试时非常有用，如果解析不正确，将会弹出错误框　　　　

				}
			});
		}else{
			// 单聊模式归档
			$.ajax({
				type: "POST", //提交方式
				url : AppConfig.apiUrl+'/tigase/addMsg',//路径
				data:{
					body: JSON.stringify(msg),
					message: elem.toString(),
					receiver: toJid.replace("@"+AppConfig.boshDomain,""),
					receiver_jid: toJid,
					sender: myData.user.userId,
					sender_jid: from,
					messageId: msg.messageId,
					context: msg.content,
					access_token:myData.access_token
				},//数据，这里使用的是Json格式进行传输
				success: function (result) {//返回数据根据结果进行相应的处理
					//console.log(result);
				},
				error : function(XMLHttpRequest, textStatus, errorThrown) {//这个error函数调试时非常有用，如果解析不正确，将会弹出错误框　　　　

				}
			});
		}
		//console.log(iqcarbon);

		msg.id=elem.nodeTree.id;
		msg.toJid=toJid;
		myConnection.send(elem.tree());
		return msg;
	},
	checkEncrypt:function(msg,callback){
		//检测消息加密  如果加密 调用接口加密
		var content=msg.content;
		if(myData.isEncrypt==1 || myData.isEncrypt=='1'){
				ConversationManager.encrypt(msg,function(type,text){
					msg.type=type;
					msg.content=text;
					//ConversationManager.sendMsgAfter(content,msg);
					callback(msg);
				});
		}else{
			//ConversationManager.sendMsgAfter(content,msg);
			callback(msg);
		}
	}
	
};

 function changeTab(tabCon_num,id){
        for(i=0;i<=2;i++) {
            document.getElementById("tabCon_"+i).style.display="none"; //将所有的层都隐藏
        }
        document.getElementById("tabCon_"+tabCon_num).style.display="block";//显示当前层
           
        //切换图片
		//更改自己的图标
		$("#"+id+"").addClass("msgMabayChange");
		//将其它兄弟的图标还原
		if("msgTab"==id){
			$("#messagePanel").getNiceScroll().show();//显示滚动条
			$("#detailsTab").removeClass("msgMabayChange");
		}else if("detailsTab"==id){
			$("#messagePanel").getNiceScroll().hide();//隐藏滚动条
			$("#msgTab").removeClass("msgMabayChange");
		}

};

function creatMsgHistory(type,o,msg){ //生成一条聊天消息的html
		
		var itemHtml = "";
			if (1 == type) {
				if (o.direction == 0) {
					itemHtml += UI.createItem(msg, o.sender, 1);
				} else {
					if(o.sender == myData.userId){
						itemHtml += UI.createItem(msg, o.receiver, 1);
					}else{
						itemHtml += UI.createItem(msg, o.receiver, 0);
					}

				}
			} else {
				if (myData.userId == o.sender) {
					itemHtml += UI.createItem(msg, o.sender, 1);
				} else {
					itemHtml += UI.createItem(msg, o.sender, 0);
				}
			}
			if(myFn.isNil(itemHtml)){
				return "";
			}
		//检查记录中是否存在未读消息
		if(1!=ConversationManager.isGroup&&msg.isRead == false){
			ConversationManager.sendReadReceipt(ConversationManager.from, myData.jid, o.messageId); //发送已读回执
			//调用方法将该消息在数据库中的状态改为已读
			changeRead(o.messageId);
		}

		return itemHtml;		
	}

	function changeRead(messageId){  //修改消息状态为已读
		if(myFn.isNil(messageId)){
			// ownAlert(3,"messageId 为空");
			return;
		}
		myFn.invoke({
				url:"/tigase/changeRead",
				data:{
					messageId:messageId
				},
				success:function(result){
					// ownAlert(3,"修改已读完成");
				}
		})
	};

	
