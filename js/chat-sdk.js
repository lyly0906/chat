var mySdk = {
	xmppLogin:function (callback) {
		myConnection = new Strophe.Connection(AppConfig.boshUrl);
		console.log("xmpp开始链接-----"+myData.jid+"|"+myData.password);
		myConnection.connect(myData.jid, myData.password, function(status) {
			if (status == Strophe.Status.CONNECTED) {
				myConnection.send($pres().tree());
				myConnection.xmlInput = ConversationManager.receiver;
				callback();
				console.log("xmpp连接成功-----");
				$("#myonline").html("(在线)");
			} else if (status = Strophe.Status.CONNECTING) {
				console.log("xmpp连接中 。。。");
				$("#myonline").html("(连接中)");
				//15s 后链接成功显示离线
				setTimeout(function(){
					if(!myConnection.connected)
						$("#myonline").html("(离线)");
				},15000);
			} else if(status = Strophe.Status.CONNFAIL){
				console.log("xmpp连接被断开或失败 。。。 CONNFAIL");
				$("#myonline").html("(离线)");
			} else if(status = Strophe.Status.DISCONNECTED){
				console.log("xmpp连接已断开 。。。 DISCONNECTED");
				$("#myonline").html("(离线)");
			}else {
				console.log("xmpp连接失败 ！！！"+status);
				// Strophe.Status.CONNFAIL 连接失败
				// Strophe.Status.AUTHFAIL 帐号或密码错误
				// Strophe.Status.DISCONNECTED 连接断开
				ownAlert(2,"登录失败，请重新登录");
				window.location.href = "login.html";
			}
		});
	},
	xmppDisconnect:function(msg){
		console.log("xmpp xmppDisconnect");
		myConnection.connected=false;
		$("#myonline").html("(离线)");
		if(myFn.isNil(msg))
		  myConnection.disconnect("退出登陆!");
		else myConnection.disconnect(msg);
	},
	getUser : function(userId, callback) {
		var value=DataMap.userMap[userId];
		if(myFn.notNull(value))
			return callback(value);

		myFn.invoke({
			url : '/user/get',
			data : {
				userId : userId
			},
			success : function(result) {
				if (1 == result.resultCode) {
					DataMap.userMap[userId]=result.data;
					callback(result.data);
				}
			},
			error : function(result) {
			}
		});
	},
	getUserOnLine : function(userId, callback) {
		myFn.invoke({
			url : '/user/getOnLine',
			data : {
				userId : userId
			},
			success : function(result) {
				if (1 == result.resultCode) {
					callback(result.data);
				}
			},
			error : function(result) {
			}
		});
	},
	getUserOnlineNew : function(userId, callback){
		$.ajax({
			type: "POST",
			url: AppConfig.authUrl,
			dataType: "json",
			data : JSON.stringify({"host":AppConfig.boshDomain,"user":userId}),
			success: function (result) {
				result.userId = userId;
				callback(result);
			},
			beforeSend: function (xhr) {
				xhr.setRequestHeader("Authorization", "Basic "+ AppConfig.authorization);
			}
		});
	},
	addRoster : function(userId,touserId, callback){
		$.ajax({
			type: "POST",
			url: AppConfig.addrosterUrl,
			dataType: "json",
			data : JSON.stringify({"localserver":AppConfig.boshDomain,"localuser":userId,"user":touserId,"server":AppConfig.boshDomain,"nick":myData.nickname,"group":"","subs":"both"}),
			success: function (result) {
				callback(result);
			},
			beforeSend: function (xhr) {
				xhr.setRequestHeader("Authorization", "Basic "+ AppConfig.authorization);
			}
		});
	},
	delRoster : function(userId,touserId, callback){
		$.ajax({
			type: "POST",
			url: AppConfig.delrosterUrl,
			dataType: "json",
			data : JSON.stringify({"localserver":AppConfig.boshDomain,"localuser":userId,"user":touserId,"server":AppConfig.boshDomain}),
			success: function (result) {
				callback(result);
			},
			beforeSend: function (xhr) {
				xhr.setRequestHeader("Authorization", "Basic "+ AppConfig.authorization);
			}
		});
	},
	//获取好友设置
	getSetting : function(userId,callback) {
		var value=DataMap.userSetting[userId];
		if(myFn.notNull(value))
			return callback(value);
		myFn.invoke({
			url : '/user/settings',
			data : {
				userId : userId,
			},
			success : function(result) {
				if (1 == result.resultCode) {
					DataMap.userSetting[userId]=result.data;
					callback(result.data);
				}
			},
			error : function(result) {
			}
		});
	},
	updateUser:function(obj,callback){
		myFn.invoke({
			url : '/user/update',
			data : obj,
			success : function(result) {
				if (1 == result.resultCode) {
					ownAlert(1,"资料更新成功");
					myData.user=result.data;
					myData.nickname=myData.user.nickname;
					callback(result.data);
					
				} else {
					ownAlert(2,result.resultMsg);
				}
			},
			error : function(result) {
				ownAlert(2,"资料更新失败，请稍后再试！");
			}
		});
	},
	getFriendsList : function(userId,keyword,status,pageIndex, callback) {
		//keyword 关键字搜索
		/*status
			1 单向关注
			2 好友
			0 陌生人
		*/
		if(myFn.isNil(pageIndex))
			pageIndex=0;
		myFn.invoke({
			url : '/friends/page',
			data : {
				userId : userId,
				pageIndex : pageIndex,
				status:status,
				keyword:keyword,
				pageSize : 10
			},
			success : function(result) {
				if (1 == result.resultCode) {
					callback(result.data);
				}
			},
			error : function(result) {
				ownAlert("获取好友失败");
			}
		});
	},
	getFriends : function(toUserId,callback) {
		var value=DataMap.friends[toUserId];
		if(myFn.notNull(value))
			return callback(value);

		myFn.invoke({
			url : '/friends/get',
			data : {
				toUserId : toUserId
			},
			success : function(result) {
				if (1 == result.resultCode) {
					DataMap.friends[toUserId]=result.data;
					callback(result.data);
				}
			},
			error : function(result) {
			}
		});
	},
	getNewFriendsList : function(userId,pageIndex, callback) {
		
		if(myFn.isNil(pageIndex))
			pageIndex=0;
		myFn.invoke({
			url : '/friends/newFriend/list',
			data : {
				userId : userId,
				pageIndex : pageIndex,
				pageSize : 10
			},
			success : function(result) {
				if (1 == result.resultCode) {
					callback(result.data);
				}
			}
		});
	},
	addAttention : function(toUserId,callback) {
		if(toUserId==myData.userId){
			ownAlert(3,"不能加自己为好友!");
			return;
		}
		myFn.invoke({
			url : '/friends/attention/add',
			data : {
				toUserId : toUserId
			},
			success : function(result) {
				if (1 == result.resultCode) {
					//发送新关注 信息
					var msg=null;
					if(1==result.data.type)
						msg=ConversationManager.createMsg(XmppMessage.Type.NEWSEE,"");
					else if(2==result.data.type||4==result.data.type)
						msg=ConversationManager.createMsg(XmppMessage.Type.FRIEND,"");

					if(myFn.notNull(msg))
						UI.sendMsg(msg,myFn.getJid(toUserId));
					callback(result.data);
					UI.changeDetailsBtn(toUserId,0); //更改UI
					DataMap.friends[toUserId]=null;

					// 增加roster的逻辑双向订阅
					console.log("增加roster的逻辑双向订阅");
					mySdk.addRoster(myData.userId+"",toUserId+"",function(result){
						console.log(result);
						return true;
					});
					mySdk.addRoster(toUserId+"",myData.userId+"",function(result){
						console.log(result);
						return true;
					});
				} 
			},
			error : function(result) {
				ownAlert(2,"添加失败,请重试");
			}
		});
	},
	deleteFriends: function(toUserId,callback) {
		//删除好友
		myFn.invoke({
			url : '/friends/delete',
			data : {
				toUserId : toUserId,
			},
			success : function(result) {
				if (1 == result.resultCode) {
					//发送删除好友 信息
					var msg=ConversationManager.createMsg(XmppMessage.Type.DELALL,"");
						UI.sendMsg(msg);
					DataMap.friends[toUserId]=null;
					UI.showFriends(0);
					UI.hideChatBodyAndDetails();
					$("#myMessagesList #friends_"+toUserId).remove();	
					UI.changeDetailsBtn(toUserId,0); //更改UI
					//删除好友后将数据从好友和关注UserId map中清除
					delete DataMap.allFriendsUIds[toUserId];

					// 删除roster的逻辑双向订阅
					console.log("删除roster的逻辑双向订阅");
					mySdk.delRoster(myData.userId+"",toUserId+"",function(result){
						console.log(result);
						return true;
					});
					mySdk.delRoster(toUserId+"",myData.userId+"",function(result){
						console.log(result);
						return true;
					});
				}
			},
			error : function(result) {
			}
		});
	},
	deleteAttention : function(toUserId,callback) { //取消关注
		myFn.invoke({
			url : '/friends/attention/delete',
			data : {
				toUserId : toUserId,
			},
			success : function(result) {
				if (1 == result.resultCode) {
					//发送取消关注 信息
					var msg=ConversationManager.createMsg(XmppMessage.Type.DELSEE,"");
						UI.sendMsg(msg);
					
					DataMap.friends[toUserId]=null;
					
					UI.showFriends(0);
					UI.hideChatBodyAndDetails();	
					$("#myMessagesList #friends_"+toUserId).remove();	
					UI.changeDetailsBtn(toUserId,0); //更改UI
					//取消关注后将数据从好友和关注UserId map中清除
					delete DataMap.allFriendsUIds[toUserId];
				}
			},
			error : function(result) {
			}
		});
	},
	addBlacklist : function(toUserId,callback) {
		myFn.invoke({
			url : '/friends/blacklist/add',
			data : {
				toUserId : toUserId,
			},
			success : function(result) {
				if (1 == result.resultCode) {
					var msg=ConversationManager.createMsg(XmppMessage.Type.BLACK,"");
						UI.sendMsg(msg);

					DataMap.friends[toUserId]=null;
					UI.showFriends(0);
					UI.hideChatBodyAndDetails();
					$("#myMessagesList #friends_"+toUserId).remove();	
					UI.changeDetailsBtn(toUserId,-1); //更改UI
					//加入黑名单后将数据添加到黑名单UserId map中
					DataMap.blackListUIds[toUserId] = toUserId;
				}
			},
			error : function(result) {
			}
		});
	},
	deleteBlacklist : function(toUserId,callback) {
		myFn.invoke({
			url : '/friends/blacklist/delete',
			data : {
				toUserId : toUserId,
			},
			success : function(result) {
				if (1 == result.resultCode) {
					var msg=ConversationManager.createMsg(XmppMessage.Type.BLACK,"");
						UI.sendMsg(msg);

					DataMap.friends[toUserId]=null;
					friendRelation[toUserId] = false;
					UI.showFriends(0);
					UI.hideChatBodyAndDetails();

					UI.changeDetailsBtn(toUserId,1); //更改UI
					//取消加入黑名单后将数据从黑名单UserId map中清除
					delete DataMap.blackListUIds[toUserId];
					//移除黑名单后将该用户从黑名单列表中移除
					$("#blackListManager #blacklist_"+toUserId+"").remove();
				}
			},
			error : function(result) {
			}
		});
	},
	getMyRoom:function(pageIndex,pageSize,callback){
		myFn.invoke({
			url : '/room/list/his',
			data : {
				pageIndex : pageIndex,
				pageSize : pageSize
			},
			success : function(result) {
				if (1 == result.resultCode)
						callback(result.data);
			},
			error : function(result) {
			}
		});
	},
	getAllRoom:function(pageIndex,keyword,callback){
		//keyword 关键字搜索
		myFn.invoke({
			url : '/room/list',
			data : {
				pageIndex : pageIndex,
				pageSize : 10,
				roomName : keyword
			},
			success : function(result) {
				if (1 == result.resultCode)
					callback(result.data);
			},
			error : function(result) {
			}
		});
	},
	getRoom:function(roomId,callback){
		var value=DataMap.rooms[roomId];
		if(myFn.notNull(value))
			return callback(value);
		myFn.invoke({
			url : '/room/get',
			data : {
				roomId : roomId
			},
			success : function(result) {
				if (1 == result.resultCode){
					DataMap.rooms[roomId]=result.data;
					callback(result.data);
				}
			},
			error : function(result) {
			}
		});
	},
	joinRoom:function(roomId,callback){
		myFn.invoke({
				url : '/room/join',
				data : {
					type:3,
					roomId : roomId
				},
				success : function(result) {
					if (1 == result.resultCode) {
						callback();
						
					} else {
						
					}
				},
				error : function(result) {
				}
		});
	},
	exitRoom:function(roomId,callback){
		myFn.invoke({
			url:'/room/member/delete',
			data:{
				roomId:roomId,
				userId:myData.userId
			},
			success:function(result){
				callback();
			},
			error : function(result) {
			}
		});
	},
	deleteFile:function(url,callback){
		//删除文件服务器文件
		$.ajax({
			type:'POST',
			url:AppConfig.deleteFileUrl,
			data:{
				paths:url
			},
			success:function(result){
				callback(result);
			},
			error : function(result) {
			
			}
		});	
		
	},
	locate : function(callback) {
		var script = document.createElement('script');
		if (callback)
			script.src = 'http://api.map.baidu.com/location/ip?ak=OuLCe9EHc0v6Ik5BiAE4oxfN&coor=bd09ll&callback=' + callback;
		else
			script.src = 'http://api.map.baidu.com/location/ip?ak=OuLCe9EHc0v6Ik5BiAE4oxfN&coor=bd09ll&callback=mySdk.locateCallback';
		document.body.appendChild(script);
	},
	locateCallback : function(result) {
		if (0 == result.status) {
			console.log("百度IP定位成功");
			var provinceName = result.content.address_detail.province;
			var cityName = result.content.address_detail.city;
			var provinceId = TB_AREAS[provinceName];
			var cityId = TB_AREAS[cityName];
			var longitude = result.content.point.x;
			var latitude = result.content.point.y;
			myData.locateParams = {
				provinceId : provinceId,
				cityId : cityId,
				longitude : longitude,
				latitude : latitude
			}
		} else
			console.log("百度IP定位失败，请求错误。");
	},
	getAccessToken : function() {
		if (!isNil(myData.access_token))
			return myData.access_token;

		invoke({
			async : false,
			url : '/user/login',
			data : {
				telephone : myData.telephone,
				password : myData.password
			},
			success : function(result) {
				if (1 == result.resultCode) {
					myData.access_token = result.data.access_token;
				}
			},
			error : function(result) {
			}
		});
		return myData.access_token;
	},
	getMember:function(roomId,userId,callback){
		myFn.invoke({
			url:'/room/member/get',
			data:{
				roomId:roomId,
				userId:userId
			},
			success:function(result){
				if(1==result.resultCode)
						callback(result.data);
			}
		});
	},
	getMembersList:function(roomId,keyword,callback){
		//群成员列表
		//keyword 关键字搜索
		myFn.invoke({
			url : '/room/member/list',
			data : {
				roomId : roomId,
				keyword:keyword
			},
			success : function(result) {
				if(1==result.resultCode){
						callback(result.data);
				}
			},
			error:function(result){

			}
		});
	},
	deleteMsg:function(type,del,msgId,callback){
		//删除消息记录
		myFn.invoke({
			    url:'/tigase/deleteMsg',
				data:{
					type:type,
					delete:del,
					messageId:msgId
					},
				success:function(result){
					if(1==result.resultCode){
						callback(result.data);
						DataMap.msgMap[msgId]=null;
					}
				}			
		});	
	},
	getMessage:function(msgId,type,callback){
		var value=DataMap.msgMap[msgId];
		if(myFn.notNull(value))
			return callback(value);
		myFn.invoke({
			    url:'/tigase/getMessage',
				data:{
					messageId:msgId,
					type:type
					},
				success:function(result){
					if(1==result.resultCode){
						DataMap.msgMap[msgId]=result.data;
						callback(result.data);
					}
				}			
		});	
	},
	sendRedPacket:function(type,money,count,greetings,callback){
		//发送红包
		myFn.invoke({
			url:'/redPacket/sendRedPacket',
				data:{
					type:type,
					money:money,
					count:count,
					greetings:greetings
					},
				success:function(result){
					if(1==result.resultCode){
						callback(result.data);
					}
				}			
		});	
	},
	getRedPacket:function(packetId,callback){
		
		$.ajax({
			type:'POST',
			url:AppConfig.apiUrl+'/redPacket/getRedPacket',
			data:{
				id:packetId,
				access_token:myData.access_token
			},
			success:function(result){
				callback(result);
			},
			error:function(result){

			}
		});	
	},
	openRedPacket:function(packetId,callback){
		
		$.ajax({
			type:'POST',
			url:AppConfig.apiUrl+'/redPacket/openRedPacket',
			data:{
				id:packetId,
				access_token:myData.access_token
			},
			success:function(result){
				callback(result);
			},
			error:function(result){

			}			
		});	
	},
	/*getRedReceivesByRedId:function(packetId,callback){//红包领取记录
		$.ajax({
			type:'POST',
			url:AppConfig.apiUrl+'/redPacket/getRedReceivesByRedId',
			data:{
				id:packetId,
				access_token:myData.access_token
			},
			success:fucntion(result){
				callback(result);
			}
		})
	},*/
	loadFriendsOrBlackList : function(type){ // type : "friendList" 获取好友列表和单向关注列表的userId    type : "blackList" 黑名单列表的userId
		myFn.invoke({
			url:'/friends/friendsAndAttention',
			data:{
				userId:myData.userId,
				type:type,
			},
			success:function(result){
				if(1==result.resultCode){
					if('friendList'==type){ //获取好友列表和单向关注列表的userId 
						for (var i = 0; i < result.data.length; i++) {
						 	var fUId = result.data[i];
							DataMap.allFriendsUIds[fUId] = fUId; //存储好友列表和单向关注列表的userId 数据
						}
					}else if('blackList'==type){ //黑名单列表的userId
						for (var j = 0; j < result.data.length; j++) {
						 	var bUId = result.data[j];
							DataMap.blackListUIds[bUId] = bUId; //存储黑名单列表的userId 数据
						}
					}else{
						ownAlert(3,"参数错误");
						return;
					}
				}
			},
			error : function(result) {
			}

		});	

	},
	showLoadHistoryIcon : function(type){ // type:1 查看更多消息   type:2 loading  type:3 没有更多消息了
		var endTime = DataMap.msgEndTime[ConversationManager.fromUserId];
		if (myFn.isNil(endTime)) {
			endTime = 0;
		}
		var logHtml ="<div id='loadHistoryIcon' class='loadHistoryIcon' >";
		if (1==type) { //查看更多消息
			logHtml += "<img src='img/msgHistory.png' style='width:25px; height=25px;display:inline;'>"
					+  "<a href='#' style='font-size: 12px;' onclick='myFn.loadMsgHistory("+endTime+")'>查看更多消息</a>";
		}else if (2==type) { //loading
			logHtml += "<img src='img/loading.gif'>";
		}else if(3==type){ //没有更多消息了
			logHtml += "<span style='font-size: 12px;'>没有更多消息了</span>";
		}			
		logHtml+="</div>";
		//清除原有的历史记录Icon显示
		$("#messageContainer #loadHistoryIcon").remove();
		$("#messageContainer").prepend(logHtml);
		// UI.scrollToEnd();

	}

	

}