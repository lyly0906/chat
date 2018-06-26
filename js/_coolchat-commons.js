var AppConfig = {
	boshDomain : "livechat.ulyncbiz.com",// XMPP主机IP或域名
	mucJID : "muc.livechat.ulyncbiz.com",// muc.+XMPP主机IP或域名
	boshUrl : "http://180.76.184.72:5280/http-bind",// http://+（XMPP主机IP或域名）+（:5280）
	apiUrl : "http://180.76.184.72:8093",// 接口地址（修改“114.119.6.150”即可）
	authUrl : "http://180.76.184.72:5280/api/get_last",
	addrosterUrl : "http://180.76.184.72:5280/api/add_rosteritem",
	delrosterUrl : "http://180.76.184.72:5280/api/delete_rosteritem",
	
	// boshDomain : "192.168.0.168",// XMPP主机IP或域名
	// mucJID : "muc.192.168.0.168",// muc.+XMPP主机IP或域名
	// boshUrl : "http://192.168.0.168:5280",// http://+（XMPP主机IP或域名）+（:5280）
	//apiUrl : "http://127.0.0.1:8092",// 接口地址（修改“114.119.6.150”即可）
	/*
	uploadAvatarUrl : "http://upload.youjob.co/upload/UploadifyAvatarServlet",// 头像上传URL（修改“www.shiku.co”即可）
	uploadUrl : "http://upload.youjob.co/upload/UploadifyServlet",// 文件上传URL（修改“www.shiku.co”即可）
	deleteFileUrl:"http://upload.youjob.co/upload/deleteFileServlet",//删除文件接口*/
	
	uploadAvatarUrl : "http://180.76.184.72:8080/upload/UploadifyAvatarServlet",// 头像上传URL（修改“www.shiku.co”即可）
	uploadUrl : "http://180.76.184.72:8080/upload/UploadServlet",// 文件上传URL（修改“www.shiku.co”即可）
	deleteFileUrl:"http://180.76.184.72:8080/upload/deleteFileServlet",//删除文件接口
	defaultAvatarUrl : "http://180.76.184.72:8081/avatar/t/47/10047.jpg",// 默认头像地址（）
	avatarBase : "http://180.76.184.72:8081/avatar/o/",// 头像父目录（修改“file.shiku.co”即可）
	defAvatar : 'http://180.76.184.72:8081/image/ic_avatar.png',
	authorization : 'YWRtaW5AbG9jYWxob3N0OjM5NzEyNjg0NQ=='
}

var myData = {
	isEncrypt:0,
	isReadDel:0,

	jid : null,
	_connection : null,
	messageReceiver : null,
	successCallback : null,
	failureCallback : null,
	init : function(successCallback, failureCallback, messageReceiver) {
		this.successCallback = successCallback;
		this.failureCallback = failureCallback;
		this.messageReceiver = messageReceiver;

		this._connection = new Strophe.Connection(this.boshUrl);
		this._connection.connect(this.jid, this.password, this.callback);
	},
	callback : function(status) {
		if (status == Strophe.Status.CONNECTED) {
			// 登录成功后发送一个空<presence>给服务器
			this._connection.send($pres().tree());
			// 当接收到<message>节，调用onMessage回调函数
			var _handler = this._connection.addHandler(this.messageReceiver, null, 'message', null, null, null);
			this.successCallback.call();
		} else if (status = Strophe.Status.CONNECTING) {

		} else {
			this.failureCallback.call();
		}
	},
	send : function(elem) {
		this._connection.send(elem);
	},

	userId : null,
	telephone : null,
	password : null,
	access_token : null,
	loginResult : null,
	user : null,
	nickname:null,

	locateParams : null,
	//friendListPage : 0,   //记录好友列表的当前页码
	//friendListNum : 0, //记录好友列表当前页的好友数量
	//friendListUserIds : [], //记录当前页好友的userId
	charArray : '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
}
var DataMap={
	userMap:{},
	userSetting:{},
	friends:{},
	msgMap:{},
	msgNum:{},
	myRooms:[],
	newmyRooms:[],
	friendsOnlineStatus:[],
	rooms:[],
	allFriendsUIds:{}, //存放所有的好友和单向关注用户的userId    key:userId  value :userId
	blackListUIds:{},  //存放已加入黑名单的userId    key:userId  value :userId
	msgStatus:{}, //存方发送消息的状态   key messageId  value 1:送达 2:已读  
	unReadMsg : {}, //存放未读消息    key : 发送方的userId  value: Array[] 存放该用户的所有未读消息(保证先后顺序)
	msgEndTime : {}, //存放消息记录的结束时间   key: 发送方的userId   value: 结束时间
	 
}
var Constant={
	loginData:"loginData"
	
}

var myConnection = null;

//临时变量
var Temp={
	user:null,
	friend:null,
	toJid:null,
	toUserId:null,
	toNickname:null,
	msgId:null,
	message:null,
	file:null,
	//上传文件操作 标识  sendImg 发送图片 //  sendFile 发送文件  uploadFile 群文件上传 
	uploadType:"sendImg",
	//弹出好友列表 标识  sendCard 发送名片  @Member @群成员
	//  forward  转发消息
	friendListType:"sendCard", 
	//左边菜单栏标识 当前在哪个菜单
	////messages  聊天列表界面
	leftTitle:"messages",
	//当前列表页面  列表标识  当前在哪个列表
	//messageList  聊天列表界面
	nowList:"messageList",

	

	setJid:function(userId){
		this.toUserId=userId;
		this.toJid=userId+"@"+AppConfig.boshDomain;
	}
}


var myFn = {
	invoke : function(obj) {
		jQuery.support.cors = true;
		var params = {
			type : "POST",
			url : obj.url,
			data : obj.data,
			contentType : 'application/x-www-form-urlencoded; charset=UTF-8',
			dataType : 'JSON',
			success : function(result) {
				if(1!=result.resultCode&&myFn.notNull(result.resultMsg)){
					ownAlert(3,result.resultMsg);
					return;
				}else if(myFn.notNull(result.resultMsg)){
					ownAlert(3,result.resultMsg);
				}
				obj.success(result);
			},
			error : function(result) {
				ownAlert(2,result.resultMsg);
				obj.error(result);
			},
			complete : function() {
			}
		};
		//$.extend(params, obj);
		params.url = AppConfig.apiUrl + params.url;
		params.data["access_token"] = myData.access_token;
		$.ajax(params);
	},
	getAvatarUrl : function(userId) {
		if(myFn.isNil(userId))
			userId=myData.userId;
		if(10000==userId)
			return "img/im_10000.png";
		var imgUrl = AppConfig.avatarBase + (parseInt(userId) % 10000) + "/" + userId + ".jpg";
		return imgUrl;
	},
	getUserId : function(jid) {
		
	},
	getUserIdFromJid : function(jid) {
		if(myFn.isNil(jid))
			return "";
		var userId = jid.substr(0, jid.indexOf("@"));
		return userId;
	},
	getJid : function(userId) {
		var reg = /^[0-9]*$/;
		if(reg.test(userId))
			return userId + "@" + AppConfig.boshDomain;
		else 
			return userId + "@" + AppConfig.mucJID;
	},
	isContains: function(str, substr) {
    	return str.indexOf(substr) >= 0;
	},
	isNil : function(s) {
		return undefined == s || null == s || $.trim(s) == "" || $.trim(s) == "null";
	},
	notNull : function(s) {
		return undefined != s && null != s && $.trim(s) != "" && $.trim(s) != "null";
	},
	strToJson : function(str) {
		return eval("(" + str + ")");
	},
	setCookie:function(key,value){
		$.cookie(key,JSON.stringify(value));
	},
	getCookie:function(key){
		var value=$.cookie(key);
		return myFn.strToJson(value);
	},
	removeCookie:function(key){
		return $.removeCookie(key);
	},
	switchEncrypt:function(key){
		if(key==1){
			myData.isEncrypt=1;
		}else{
			myData.isEncrypt=0;
		}
		/*var isEncrypt = myData.isEncrypt;  //是否为加密  false:不是  true:是
			myData.isEncrypt=!isEncrypt;
			ownAlert(3,myData.isEncrypt);*/
			
	},
	isEncrypt:function(msg){
		var isEncrypt = 0;  //是否为加密  0:不是  1:是
			if(myFn.isNil(msg.content))
				return false;
			if(null!=msg.isEncrypt)
				isEncrypt=msg.isEncrypt;
			if(isEncrypt=="1"||1==isEncrypt)
				return true;
			else false;
	},
	switchReadDel:function(){
		var isReadDel = myData.isReadDel;  //是否为阅后即焚消息  0:不是  1:是
			if(isReadDel==1){
				$("#Snapchat").removeClass("Snapchat");
				ownAlert(3,"已取消阅后即焚");
				myData.isReadDel=0;
			}else{
				$("#Snapchat").addClass("Snapchat");
				ownAlert(3,"当前状态为阅后即焚，对方看完您发送的图片和语音以及视频消息后会立即删除");
				myData.isReadDel=1;
			}
			
			
	},
	isReadDel:function(msg){
		var isReadDel = 0;  //是否为阅后即焚消息  0:不是  1:是
			if(null!=msg.isReadDel)
				isReadDel=msg.isReadDel;
			if(isReadDel=="1"||1==isReadDel){  
				$("#Snapchat").addClass("Snapchat");
				return true;
			}else{
				$("#Snapchat").removeClass("Snapchat");
				return false;
			} 
	},
	randomUUID : function() {
		var chars = myData.charArray, uuid = new Array(36), rnd = 0, r;
		for (var i = 0; i < 36; i++) {
			if (i == 8 || i == 13 || i == 18 || i == 23) {
				uuid[i] = '-';
			} else if (i == 14) {
				uuid[i] = '4';
			} else {
				if (rnd <= 0x02)
					rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
				r = rnd & 0xf;
				rnd = rnd >> 4;
				uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
			}
		}
		return uuid.join('').replace(/-/gm, '').toLowerCase();
	},
	toDateTime : function(timestamp) {
		return (new Date(timestamp * 1000)).format("yyyy-MM-dd hh:mm");
	},
	toDate : function(timestamp) {
		return (new Date(timestamp * 1000)).format("yyyy-MM-dd");
	},
	getAudioPlayer : function(passedOptions) {
		var playerpath = "/js/";

		// passable options
		var options = {
			"filepath" : "", // path to MP3 file (default: current directory)
			"backcolor" : "", // background color
			"forecolor" : "ffffff", // foreground color (buttons)
			"width" : "25", // width of player
			"repeat" : "no", // repeat mp3?
			"volume" : "50", // mp3 volume (0-100)
			"autoplay" : "false", // play immediately on page load?
			"showdownload" : "true", // show download button in player
			"showfilename" : "true" // show .mp3 filename after player
		};

		if (passedOptions) {
			jQuery.extend(options, passedOptions);
		}
		var filename = options.filepath;
		var mp3html = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" ';
		mp3html += 'width="' + options.width + '" height="20" ';
		mp3html += 'codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab">';
		mp3html += '<param name="movie" value="' + playerpath + 'singlemp3player.swf?';
		mp3html += 'showDownload=' + options.showdownload + '&file=' + filename + '&autoStart=' + options.autoplay;
		mp3html += '&backColor=' + options.backcolor + '&frontColor=' + options.forecolor;
		mp3html += '&repeatPlay=' + options.repeat + '&songVolume=' + options.volume + '" />';
		mp3html += '<param name="wmode" value="transparent" />';
		mp3html += '<embed wmode="transparent" width="' + options.width + '" height="20" ';
		mp3html += 'src="' + playerpath + 'singlemp3player.swf?'
		mp3html += 'showDownload=' + options.showdownload + '&file=' + filename + '&autoStart=' + options.autoplay;
		mp3html += '&backColor=' + options.backcolor + '&frontColor=' + options.forecolor;
		mp3html += '&repeatPlay=' + options.repeat + '&songVolume=' + options.volume + '" ';
		mp3html += 'type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" />';
		mp3html += '</object>';
		console.log(mp3html);
		return mp3html;
	},
	parseContent : function(content) {
		var emojlKeys = new Array();
		if(myFn.isNil(content))
			return content;
		var s = content;
		var fromIndex = 0;
		while (fromIndex != -1) {
			fromIndex = s.indexOf("[", fromIndex);
			if (fromIndex == -1)
				break;
			else {
				var stop = s.indexOf("]", fromIndex);
				if (stop == -1)
					break;
				else {
					var emojlKey = s.substring(fromIndex, stop + 1);
					emojlKeys.push(emojlKey);
					fromIndex = fromIndex + 1;
				}
			}
		}
		//表情
		if (emojlKeys.length != 0) {
			for (var i = 0; i < emojlKeys.length; i++) {
				var key = emojlKeys[i];
				s = s.replace(key, "<img src='" + _emojl[key] + "' width='25' height='25' />");
			}
			return s;
		}
		//支持 网站
		if(myFn.isContains(content,"http:")||
			myFn.isContains(content,"https:")){
			content="<a target='_blank' href='"+content+"'> "+content+ "</a>";
			return content;
			
		}else if(myFn.isContains(content,"www.")){
			content="<a target='_blank' href='http://"+content+"'> "+content+ "</a>";
			return content;
		}
		return content;
		
	},
	loadMsgHistory : function(endTime){ //加载聊天的历史记录
		
		mySdk.showLoadHistoryIcon(2);
 		var type = msgHistory["type"];
 		var from = msgHistory["from"];
 		var index = msgHistory["index"];
 		
 		var chatType=1==type?"chat":"groupchat";
 		ConversationManager.showHistory(false, type, from, index, function(status, result) {
 			if(0==status){
 				var pageMsgHtml = "";  //一页(10条)的消息记录
				var length = result.length - 1;
				var unReadMsgs = DataMap.unReadMsg[ConversationManager.fromUserId];
				if (myFn.isNil(unReadMsgs)) {//空值检查
					unReadMsgs = new Array();
				}
				var floot = false;
				for (var i = length; i >= 0; i--) {
					var o = result[i];
					var msg=eval("(" + o.body.replace(/&quot;/gm, '"') + ")");
					//去除重复
					for (var j = 0; j < unReadMsgs.length; j++) {
						if (unReadMsgs[j].id == msg.messageId) {
							floot = true;
						}
					}
					if(floot) //如有重复，则不重复添加
						continue;

					msg.id=o.messageId;
					msg.chatType=chatType;
					if(myFn.isEncrypt(msg)){  //判断是否为加密消息
						
						ConversationManager.decrypt(msg,function(contentType,text){
							msg.type=contentType;
							msg.content=text;
							//将一页要显示的消息拼装为整体
							pageMsgHtml += creatMsgHistory(type,o,msg);
						});
						
					}else{
						pageMsgHtml += creatMsgHistory(type,o,msg);
					}
				}
				if(myFn.isNil(pageMsgHtml)){
					mySdk.showLoadHistoryIcon(3); //调用方法显示消息记录翻页相关状态 3:没有更多记录了
					return;
				}
				//将拼装完成的消息显示到页面,拼接在标签里的最上方
				pageMsgHtml += "<div id='msgAnchor'></div>";   //为滚动条添加锚点
				$("#messageContainer").prepend(pageMsgHtml);
				mySdk.showLoadHistoryIcon(1);
				//让滚动条移动翻页之前的消息位置
				$("#messagePanel").scrollTo('#messageContainer #msgAnchor',1);
				//清除此次翻页的锚点
				$("#messageContainer #msgAnchor").remove();
			} else
				ownAlert(2,result);
			},endTime
		);
	},
	getAvatar : function (){
		$("#avatarForm #avatar").click();
		// document.getElementsById["photo"].click();
	},
	getPicture : function(){
		$("#uploadFileModal #myfile").click();
	},
	getFile : function(){

	},
	deleteReadDelMsg : function(messageId){ //删除缓存未读消息中的某条阅后即焚消息
		var unReadMsg = DataMap.unReadMsg[ConversationManager.fromUserId]; //获取缓存的消息
		if(myFn.isNil(unReadMsg) || 0 == unReadMsg.length)
			return;
		for (var i = 0; i < unReadMsg.length; i++) {
			var msg = unReadMsg[i];
			if (messageId==msg.id) {
				DataMap.unReadMsg[ConversationManager.fromUserId].splice(i, 1);
			}
		}
	},


}

$(function() {
	
	
});


var _emojl = {
	"[smile]" : "emojl/e-01.png",
	"[joy]" : "emojl/e-02.png",
	"[heart-eyes]" : "emojl/e-03.png",
	"[sweat_smile]" : "emojl/e-04.png",
	"[laughing]" : "emojl/e-05.png",
	"[wink]" : "emojl/e-06.png",
	"[yum]" : "emojl/e-07.png",
	"[relieved]" : "emojl/e-08.png",
	"[fearful]" : "emojl/e-09.png",
	"[ohYeah]" : "emojl/e-10.png",
	"[cold-sweat]" : "emojl/e-11.png",
	"[scream]" : "emojl/e-12.png",
	"[kissing_heart]" : "emojl/e-13.png",
	"[smirk]" : "emojl/e-14.png",
	"[angry]" : "emojl/e-15.png",
	"[sweat]" : "emojl/e-16.png",
	"[stuck]" : "emojl/e-17.png",
	"[rage]" : "emojl/e-18.png",
	"[etriumph]" : "emojl/e-19.png",
	"[mask]" : "emojl/e-20.png",
	"[confounded]" : "emojl/e-21.png",
	"[sunglasses]" : "emojl/e-22.png",
	"[sob]" : "emojl/e-23.png",
	"[blush]" : "emojl/e-24.png",
	"[doubt]" : "emojl/e-26.png",
	"[flushed]" : "emojl/e-27.png",
	"[sleepy]" : "emojl/e-28.png",
	"[sleeping]" : "emojl/e-29.png",
	"[disappointed_relieved]" : "emojl/e-30.png",
	"[tire]" : "emojl/e-31.png",
	"[astonished]" : "emojl/e-32.png",
	"[buttonNose]" : "emojl/e-33.png",
	"[frowning]" : "emojl/e-34.png",
	"[shutUp]" : "emojl/e-35.png",
	"[expressionless]" : "emojl/e-36.png",
	"[confused]" : "emojl/e-37.png",
	"[tired_face]" : "emojl/e-38.png",
	"[grin]" : "emojl/e-39.png",
	"[unamused]" : "emojl/e-40.png",
	"[persevere]" : "emojl/e-41.png",
	"[relaxed]" : "emojl/e-42.png",
	"[pensive]" : "emojl/e-43.png",
	"[no_mouth]" : "emojl/e-44.png",
	"[worried]" : "emojl/e-45.png",
	"[cry]" : "emojl/e-46.png",
	"[pill]" : "emojl/e-47.png",
	"[celebrate]" : "emojl/e-48.png",
	"[gift]" : "emojl/e-49.png",
	"[birthday]" : "emojl/e-50.png",
	"[paray]" : "emojl/e-51.png",
	"[ok_hand]" : "emojl/e-52.png",
	"[first]" : "emojl/e-53.png",
	"[v]" : "emojl/e-54.png",
	"[punch]" : "emojl/e-55.png",
	"[thumbsup]" : "emojl/e-56.png",
	"[thumbsdown]" : "emojl/e-57.png",
	"[muscle]" : "emojl/e-58.png",
	"[maleficeent]" : "emojl/e-59.png",
	"[broken_heart]" : "emojl/e-60.png",
	"[heart]" : "emojl/e-61.png",
	"[taxi]" : "emojl/e-62.png",
	"[eyes]" : "emojl/e-63.png",
	"[rose]" : "emojl/e-64.png",
	"[ghost]" : "emojl/e-65.png",
	"[lip]" : "emojl/e-66.png",
	"[fireworks]" : "emojl/e-67.png",
	"[balloon]" : "emojl/e-68.png",
	"[clasphands]" : "emojl/e-69.png",
	"[bye]" : "emojl/e-70.png"
};

function ownAlert(type,infoText){  //自定义的弹框  
	//type : 1 成功 2:失败 3：提示 
	if(type==1)
		window.wxc.xcConfirm(infoText, window.wxc.xcConfirm.typeEnum.success);
	if(type==2)
		window.wxc.xcConfirm(infoText, window.wxc.xcConfirm.typeEnum.error);
	if(type==3)
		window.wxc.xcConfirm(infoText, window.wxc.xcConfirm.typeEnum.info);
};




var Checkbox = {
	/*用于存储被选中的好友的userId  key:userId  value:userId 
	 用于解决checkbox翻页后上一页的选中数据无法记录的问题*/
	cheackedFriends : {}, 
	checkedNames:[],
	checkedAndCancel : function(that) {  //checkbox选中与取消选中
		// ownAlert(3,"点击选中与取消");
	    if (that.checked) {//判断是否为选中状态
	        Checkbox.checked(that);
	    } else {
	        Checkbox.cancel(that.value,that.id);
	    }
		
	},
	checked : function (that) {  //checkbox选中事件
		
		var userId=that.value;
		var showAreaId=that.id;
		if(Checkbox.cheackedFriends[userId]==userId){  //判断是否存在
			return;
		}
		Checkbox.cheackedFriends[userId] = userId; //选中后将userId 存到map中
		var nickname=$(that).attr("nickname");
		
		if(!myFn.isNil(nickname)){
			Checkbox.checkedNames[userId+"uId"]=nickname; 
			Checkbox.checkedNames.length+=1;
		}
		var imgUrl = myFn.getAvatarUrl(userId);
		var avatarHtml = "<img id='img_"+userId+"' onerror='this.src=\"img/ic_avatar.png\"'  src='" + imgUrl + "' class='roundAvatar checked_avatar' />"
		if("areadyChooseFriends"==showAreaId){
			$("#addEmployee  #"+showAreaId+"").append(avatarHtml);
		}else if ("setAdminShowArea"==showAreaId) {
			$("#setAdmin  #"+showAreaId+"").append(avatarHtml);
		}else if ("false"==showAreaId) {
			//id 为 false 则不显示已选头像 
		}else{
			$("#"+showAreaId+"").append(avatarHtml);
		}
	},
	cancel : function (userId,showAreaId) {  //checkbox取消选中事件
		delete Checkbox.cheackedFriends[userId]; //取消选中后将userId 从map中移除
		if(!myFn.isNil(Checkbox.checkedNames[userId+"uId"])){
			delete Checkbox.checkedNames[userId+"uId"];
			Checkbox.checkedNames.length-=1;
		}
		if(!myFn.isNil(showAreaId))
			$("#"+ showAreaId +" #img_"+userId+"").remove();
	},
	parseData : function(){ //解析 cheackedFriends 中的数据
		if(myFn.isNil(Checkbox.cheackedFriends)){ //判断是否存在数据
			return null;
		}
		var invitees = new Array();
		for(var key in Checkbox.cheackedFriends){  //通过定义一个局部变量key遍历获取到了cheackedFriends中所有的key值  
		  
		   invitees.push(Checkbox.cheackedFriends[key]); //获取key所对应的value的值,并存入数组  
		}
		// return JSON.stringify(invitees);
		return invitees;
	}

};

$(function () { //消息输入区按钮提示
		
   $("#btnEmojl").tooltip({ //鼠标移动弹出提示
         trigger:'hover',
         html:true,
         title:'表情',
         placement:'top'
    });
   $("#btnGif").tooltip({ //鼠标移动弹出提示
         trigger:'hover',
         html:true,
         title:'动图',
         placement:'top'
    });
   $("#btnImg").tooltip({ //鼠标移动弹出提示
         trigger:'hover',
         html:true,
         title:'图片',
         placement:'top'
    });

   $("#btnFile").tooltip({ //鼠标移动弹出提示
         trigger:'hover',
         html:true,
         title:'文件',
         placement:'top'
    });

   $("#btnmin").tooltip({ //鼠标移动弹出提示
         trigger:'hover',
         html:true,
         title:'名片',
         placement:'top'
    });

   $("#place").tooltip({ //鼠标移动弹出提示
         trigger:'hover',
         html:true,
         title:'位置',
         placement:'top'
    });
   
   $("#redback").tooltip({ //鼠标移动弹出提示
         trigger:'hover',
         html:true,
         title:'红包',
         placement:'top'
    });

   $("#rightTopMnue #blackListImg").tooltip({ //右上角菜单提示
         trigger:'hover',
         html:true,
         title:'黑名单',
         placement:'bottom'
    });

   $("#rightTopMnue #helpImg").tooltip({ //右上角菜单提示
         trigger:'hover',
         html:true,
         title:'帮助',
         placement:'bottom'
    });

   $("#rightTopMnue #quitImg").tooltip({ //右上角菜单提示
         trigger:'hover',
         html:true,
         title:'退出',
         placement:'bottom'
    });

   $("#rightTopMnue #privacyImg").tooltip({ //右上角菜单提示
   		trigger:'hover',
   		html:true,
   		title:'隐私',
   		placement:'bottom'
   });

   $("#rightTopMnue #passwordImg").tooltip({ //右上角菜单提示
   		trigger:'hover',
   		html:true,
   		title:'密码',
   		placement:'bottom'
   });

   $("#photo #myAvatar").tooltip({ //右上角菜单提示
   		trigger:'hover',
   		html:true,
   		title:'个人资料',
   		placement:'bottom'
   });


   $("#avatarForm #avatar_preview").tooltip({ //右上角菜单提示
   		trigger:'hover',
   		html:true,
   		title:'点击更换头像',
   		placement:'bottom'
   });

});




