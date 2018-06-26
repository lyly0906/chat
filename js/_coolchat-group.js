$(function() {
	$("#btnCreateGroup").click(function() {
		GroupManager.createGroup();
	});
	// 删除群组
	$("#btnDelete").click(function() {
		if (GroupManager.roomData.userId = myData.userId) {

			window.wxc.xcConfirm("是否确认删除本群组？", window.wxc.xcConfirm.typeEnum.confirm,{
				onOk:function(){ //点击确定后执行

					myFn.invoke({
						url : '/room/delete',
						data : {
							roomId : GroupManager.roomData.id
						},
						success : function(result) {
							if (1 != result.resultCode) {
								ownAlert(2,"群组删除失败，请稍后再试。");
								return;
							}
							$("#myRoomList").find("#groups_"+GroupManager.roomData.id).remove();
							//$("#myMessagesList").find("#groups_"+GroupManager.roomData.id).remove();
							$("#myMessagesList #groups_"+GroupManager.roomData.jid).remove();
							//console.log(GroupManager.roomData.jid);
							ownAlert(1,"群组删除成功！");
							GroupManager.showMyRoom(0);
							$("#chatPanel").hide();
							$("#tab").hide();

							ConversationManager.isOpen = false;
							ConversationManager.from = null;
						},
						error : function(result) {
							ownAlert(2,"群组删除失败，请稍后再试");
						}
					});
					
				}
		    });

		} else {
			ownAlert(3,"权限不足！");
			return;
		}
		
	});
	$("#seek").click(function(){
		var name=$("#seekkey").val();
		mySdk.getFriendsList(myData.userId,name,2, 0,function(result) {

					var html = "";
					var tbInviteListHtml = "";
					var friendsList = result.pageData;
					//alert(friendsList);
					console.log(friendsList);
					console.log(friendsList.length);
					// 获取成员列表
					myFn.invoke({
						url : '/room/member/list',
						data : {
							roomId : GroupManager.roomData.id,

						},
						success : function(result) {
							if (1 == result.resultCode) {
								var memberList = result.data;
								var length = memberList.length;
								console.log(memberList)
								for (var i = 0; i < friendsList.length; i++) {
									var obj = friendsList[i];
									var isMember = false;

									for (var j = 0; j < memberList.length; j++) {
										if (memberList[j].userId == friendsList[i].toUserId) {
											isMember = true;
											break;
										}
									}

									if (!isMember)
										tbInviteListHtml += "<tr><td><img src='" + myFn.getAvatarUrl(obj.toUserId)
												+ "' width=30 height=30 /></td><td width=100%>&nbsp;&nbsp;&nbsp;&nbsp;" + obj.toNickname
												+ "</td><td><input id='invite_userId' name='invite_userId' type='checkbox' value='" + obj.toUserId
												+ "' /></td></tr>";

								}
								if ("" == tbInviteListHtml) {
									ownAlert(3,"没有可被邀请的好友！");
								} else {
									$("#tbInviteList").empty();
									$("#tbInviteList").append(tbInviteListHtml);
									$("#memberInviteDialog").modal('show');
								}
							}
						},
						error : function(result) {
						}
					});

				});
	});
	// 屏蔽消息
	$("#btnShield").click(function() {
		var isFilter = GroupManager.filters[GroupManager.roomData.jid];
		$("#btnShield div p").empty();
		$("#btnShield div p").append(isFilter ? "屏蔽消息" : "取消屏蔽");
		GroupManager.filters[GroupManager.roomData.jid] = !isFilter;
	});
	// 群成员管理
	$("#btnKicking").click(function() {
		mySdk.getMembersList(GroupManager.roomData.id,null,function(obj){
			var tbMemberListHtml = "";
			var role;

			for (var i = 0; i < obj.length; i++) {
				if (myData.userId == obj[i].userId) {
					role = obj[i].role;
					break;
				}
			}      
			// 成员角色：1=创建者、2=管理员、3=成员
			for (var i = 0; i < obj.length; i++) {

				tbMemberListHtml += "<tr id='tr_member_" + obj[i].userId + "'><td width=30><img onerror='this.src=\"img/ic_avatar.png\"' src='" + myFn.getAvatarUrl(obj[i].userId)
						+ "' width=30 height=30  class='roundAvatar'/></td><td>&nbsp;&nbsp;&nbsp;&nbsp;" + obj[i].nickname + "</td>";
				if (1 == role) { //判断我的身份 我是创建者
					if(2==obj[i].role){ //管理员

						tbMemberListHtml += "<td id='replace_"+obj[i].userId+"'><a href='javascript:GroupManager.setAdmin(\""+GroupManager.roomData.id+"\","+obj[i].userId+","+3+")'>取消管理员</a></td><td><a href='javascript:GroupManager.removeMember(\"" + GroupManager.roomData.id + "\","
							+ obj[i].userId + ",\"" + obj[i].nickname
							+ "\");'>踢出</a></td><td width=50><a href='javascript:GroupManager.setTalkTime(\"" + GroupManager.roomData.id + "\","
							+ obj[i].userId + ",\"" + obj[i].nickname + "\");'>禁言</a></td>";

					}else if(1==obj[i].role){ //创建者自己

						tbMemberListHtml += "<td></td><td id='replace_"+obj[i].userId+"' colspan='3'>"
										 +   "<img src='img/creater.png' class='groupMenberIdent'>"
										 +"</td>";

					}else{ //普通用户
						tbMemberListHtml += "<td id='replace_"+obj[i].userId+"'><a href='javascript:GroupManager.setAdmin(\""+GroupManager.roomData.id+"\","+obj[i].userId+","+2+")'>设为管理员</a></td><td><a href='javascript:GroupManager.removeMember(\"" + GroupManager.roomData.id + "\","
							+ obj[i].userId + ",\"" + obj[i].nickname
							+ "\");'>踢出</a></td><td width=50><a href='javascript:GroupManager.setTalkTime(\"" + GroupManager.roomData.id + "\","
							+ obj[i].userId + ",\"" + obj[i].nickname + "\");'>禁言</a></td>";
					}
						
				} else if (2 == role) { //我是管理员
						//判断成员身份
						if(2==obj[i].role){ //管理员
							
							tbMemberListHtml += "<td id='replace_"+obj[i].userId+"' colspan='3'>"
										 +   "<img src='img/admin.png' class='groupMenberIdent'>"
										 +"</td>";
						}else if(1==obj[i].role){ //创建者

							tbMemberListHtml += "<td id='replace_"+obj[i].userId+"' colspan='3'>"
										 +   "<img src='img/creater.png' class='groupMenberIdent'>"
										 +"</td>";

						} else {
							tbMemberListHtml += "<td width=50><a href='javascript:GroupManager.removeMember(\"" + GroupManager.roomData.id + "\","
								+ obj[i].userId + ",\"" + obj[i].nickname
								+ "\");'>踢出</a></td><td width=50><a href='javascript:GroupManager.removeMember(\"" + GroupManager.roomData.id + "\","
								+ obj[i].userId + ",\"" + obj[i].nickname + "\");'>禁言</a></td>";
						}
						
				} else if (3 == role) { //我是普通成员
						//判断成员身份
						if(2==obj[i].role){ //管理员
							
							tbMemberListHtml += "<td id='replace_"+obj[i].userId+"' colspan='3'>"
										 +   "<img src='img/admin.png' class='groupMenberIdent'>"
										 +"</td>";
						}else if(1==obj[i].role){ //创建者

							tbMemberListHtml += "<td id='replace_"+obj[i].userId+"' colspan='3'>"
										 +   "<img src='img/creater.png' class='groupMenberIdent'>"
										 +"</td>";

						} 
				}
				
				
				tbMemberListHtml += "</tr>";
			}
			$("#tbMemberList").empty();
			$("#tbMemberList").append(tbMemberListHtml);
			$("#memberManagerDialog").modal('show');
			});

		});
	//群组重命名
	/*$("#chengRoomname").click(function(){
		var name=$("#chatTitle").html();
		var tbInviteListHtml = "";
		tbInviteListHtml += "<tr><td width=100%>" +"<input id='newgroupname' value='"+name+"'>"
		+ "</td></tr>";
		$("#guname").empty();
		$("#guname").append(tbInviteListHtml);
		$("#groupname").modal('show');
	});*/
	//提交群组新名称
	$("#submit").click(function(){

		var roomName=$("#newgroupname").val();
		if(GroupManager.roomData.userId == myData.userId){
			myFn.invoke({
				url:'/room/update',
				data:{
					roomId:GroupManager.roomData.id,
					roomName:roomName
				},
				success:function(result){
					ownAlert(1,"群组名更新成功");
					$("#groupname").modal('hide');
					GroupManager.showAllRoom(0);
				}
			});
		}else{
			ownAlert(2,"权限不足");
		}
	});
	//修改群组说明
	$("#btndesc").click(function(){
		var desc=$("#newdesc").val();
		if(desc==""){
			ownAlert(3,"请输入群组说明");
		}
		myFn.invoke({
			url:'/room/update',
			data:{
				roomId:GroupManager.roomData.id,
				desc:desc
			},
			success:function(result){
				$("#groupdesc").modal();
				$("#gdesc").empty();
				$("#gdesc").append(desc);
				ownAlert(1,"修改群组说明成功");

			}
		})
	});
	//修改公告
	$("#btnNotice").click(function(){
		var notice=$("#newNotice").val();
		if(notice==""){
			ownAlert(3,"请输入新公告");
		}
		myFn.invoke({
			url:'/room/update',
			data:{
				roomId:GroupManager.roomData.id,
				notice:notice
			},
			success:function(result){
				$("#groupnotice").modal("hide");
				$("#gnotice").empty();
				$("#gnotice").append(notice);
				ownAlert(1,"修改公告成功");
			}
		});
	});
	//修改群昵称
	$("#btnNickname").click(function(){
		var nickname=$("#newNickname").val();
		
		if(nickname==""){
			ownAlert(3,"请输入新昵称");
		}
		myFn.invoke({
			url:'/room/member/update',
			data:{
				roomId:GroupManager.roomData.id,
				nickname:nickname,
				userId:myData.userId
			},
			success:function(result){
				$("#updategname").modal("hide");
				$("#gnickname").empty();
				$("#gnickname").append(nickname);
				ownAlert(1,"修改昵称成功")
			}
		});
	});
	// 邀请好友
	$("#btnInvite").click(function() {
				// 获取好友列表
				mySdk.getFriendsList(myData.userId,null,2, 0,function(result) {
					var html = "";
					var tbInviteListHtml = "";
					var friendsList = result.pageData;
					console.log(friendsList.length+"   "+friendsList);
					// 获取成员列表
					mySdk.getMembersList(GroupManager.roomData.id,null,function(memberList){
						var length = memberList.length;
						
						for (var i = 0; i < friendsList.length; i++) {
							var obj = friendsList[i];
							var isMember = false;

							for (var j = 0; j < memberList.length; j++) {
								if (memberList[j].userId == friendsList[i].toUserId) {
									isMember = true;
									break;
								}
							}
							if (!isMember)
								tbInviteListHtml += "<tr><td><img src='" + myFn.getAvatarUrl(obj.toUserId)
										+ "' width=30 height=30 /></td><td width=100%>&nbsp;&nbsp;&nbsp;&nbsp;" + obj.toNickname
										+ "</td><td><input id='invite_userId' name='invite_userId' type='checkbox' value='" + obj.toUserId
										+ "' /></td></tr>";

						}
						if ("" == tbInviteListHtml) {
							ownAlert(3,"没有可被邀请的好友！");
						} else {
							$("#tbInviteList").empty();
							$("#tbInviteList").append(tbInviteListHtml);
							$("#memberInviteDialog").modal('show');
						}
							
					});

				});
			});
});
//群文件
function groupfile(){
		var tbInviteListHtml = "";
		myFn.invoke({
			url:'/room/share/find',
			data:{
				roomId:GroupManager.roomData.id
			},
			success:function(result){

				var fileList=result.data;
				for(var i=0;i<fileList.length;i++){
					var obj=fileList[i];
					tbInviteListHtml += "<tr><td width=100%>" +obj.name
					+ "</td><td><button class='btn btn-default' onclick='GroupManager.deletefile(\""+obj.shareId+"\")'>删除</button></td>"
					+ "<td><a href='"+obj.url+"' target='_blank' style='color:white'><button class='btn btn-default'>查看</button></a></td>"
					+ "</tr>";
				}
				$("#gfile").empty();
				$("#gfile").append(tbInviteListHtml);
				$("#findgroupfile").modal('show');
			}
		});
}
//群昵称
function gNickname(){
	$("#newNickname").val($("#gnickname").html());
	$("#updategname").modal("show");
}
//群公告
function notice(){
	$("#newNotice").val($("#gnotice").html());
	$("#groupnotice").modal("show");
}
//群组说明
function roomstate(){
	$("#newdesc").val($("#gdesc").html());
	$("#groupdesc").modal("show");
}
//群名称
function chengRoomname(){
	$("#newgroupname").val($("#gname").html());
	$("#groupname").modal("show");
}
//退出群聊
function exitgrounp(){
	
	window.wxc.xcConfirm("确认退出该群组吗？", window.wxc.xcConfirm.typeEnum.confirm,{
			onOk:function(){
				GroupManager.exitRoom();
			}
		});
	
}
var GroupManager = {
	roomData : null,
	filters : {},
	//显示所有群组
	showAllRoom : function(pageIndex) {
		$("#myRoomList").hide();
		$("#btnMyRoom").removeClass("border");
		$("#btnAllRoom").addClass("border");
		var keyword=$("#btnAllRoom #_keyword").val();
		mySdk.getAllRoom(pageIndex,keyword,function(result){
					var html = "";
					var length = result.length;
					for (var i = 0; i < length; i++) {
						var obj = result[i];
						DataMap.rooms[obj.id]=obj;
						html += GroupManager.createItem(obj);
					}
				html += GroupManager.createPager(pageIndex, length, 'GroupManager.showAllRoom');
					$("#_allRoomList").empty();
					$("#_allRoomList").append(html);
					$("#allRoomList").show();
					$("#btnMyRoom").removeClass("border");
					$("#btnAllRoom").addClass("border");
		});
	},
	//显示我的群组
	showMyRoom : function(pageIndex) {
		$("#allRoomList").hide();
		$("#o").show();
		$("#privacy").hide();
		UI.hideChatBodyAndDetails();
		$("#prop").hide();
		$("#setPassword").hide();
		$("#btnAllRoom").removeClass("border");
		$("#btnMyRoom").addClass("border");

		mySdk.getMyRoom(pageIndex,10,function(result){
			var html = "";

			if(result != null){
				var length = result.length;
				var roomId=null;
				for (var i = 0; i < length; i++) {
					var obj = result[i];
					DataMap.myRooms[obj.jid]=obj;
					DataMap.rooms[obj.id]=obj;
					html += GroupManager.createMyItem(obj);
				}

				html += GroupManager.createPager(pageIndex, length, 'GroupManager.showMyRoom');

				$("#myRoomList").empty();
				$("#myRoomList").append(html);
				$("#myRoomList").show();
			}else{
				$("#myRoomList").empty();
			}

		});
	},
	//加入我的群组
	joinMyRoom :function(){
		var rooms=DataMap.myRooms;
		if(0==rooms.length){
			mySdk.getMyRoom(0,100,function(result){
				if(myFn.isNil(result))
					return;
					var obj=null;
					for (var i = 0; i < result.length; i++) {
						obj=result[i];
						DataMap.rooms[obj.id]=obj;
						DataMap.myRooms[obj.jid]=obj;
						DataMap.newmyRooms[i] = obj.jid;
						//console.log("加入我的群组  "+obj.name);
						GroupManager._XEP_0045_037(obj.jid, myData.userId);
					}
			});	
		}else {
			for (var i = 0; i < rooms.length; i++) {
						obj=rooms[i];
						//console.log("加入我的群组  "+obj.name);
						GroupManager._XEP_0045_037(obj.jid, myData.userId);
			}
		}
		

	},
	
	//下载文件
	downfile:function(){
		alert("down");
	},
	//删除文件
	deletefile:function(shareId){
			myFn.invoke({
				url:'/room/share/delete',
				data:{
					roomId:GroupManager.roomData.id,
					shareId:shareId,
					userId:myData.userId
				},
				success:function(result){
					ownAlert(1,"删除成功");
					groupfile();
				}
			});	
	},
	//上传
	uploadFile:function(){
		$("#uploadFileModal").modal('show');
		$("#myImgPreview").hide();
		Temp.uploadType="uploadFile";
		$("#uploadModalLabel").html("文件上传");
		$("#btnSendFileCancel").html("取消上传");
		$("#btnSendFileOK").html("确认上传");
		 $("#myImgPreview").attr("src","");
		 $("#myFileUrl").val("");
		 $("#myfile").val("");
	},
	//添加群文件
	addGroupFile:function(obj){

		var fileUrl=obj.url;
		
		var fileExt=fileUrl.substr(fileUrl.lastIndexOf(".")).toLowerCase();
		var type;
		if(fileExt==".jpg"||fileExt==".png"||fileExt==".jpeg"){//图片
			type=1;
		}else if(fileExt==".mp3"||fileExt==".arm"||fileExt==".wav"){//声音
			type=2;
		}else if(fileExt==".mp4"||fileExt==".avi"||fileExt==".rm"||fileExt==".rmvb"){//视频
			type=3;
		}else if(fileExt==".ppt"){
			type=4;
		}else if(fileExt==".xlsx"||fileExt==".xls"){//excel
			type=5;
		}else if(fileExt==".doc"||fileExt==".docx"){//word
			type=6;
		}else if(fileExt==".zip"){//压缩包
			type=7;
		}else if(fileExt=="txt"){//文本文档
			type=8;
		}else if(fileExt=="pdf"){//pdf
			type=10;
		}else{
			type=9;
		}
		myFn.invoke({
			url:'/room/add/share',
			data:{
				roomId:GroupManager.roomData.id,
				type:type,
				size:obj.size,
				userId:myData.userId,
				url:obj.url,
				name:obj.name
			},
			success:function(result){
				ownAlert(1,"上传成功");
				groupfile();
			},
			error:function(result){
				ownAlert(2,"上传失败");
			}
		});
	},
	/*updateNotice:function(){
		var notice=$("#newNotice").val();
		alert(notice);
	}*/
	//设置管理员
	setAdmin:function(roomId,userId,type){
		myFn.invoke({
			url:'/room/set/admin',
			data:{
				roomId:roomId,
				touserId:userId,
				type:type,
			},
			success:function(result){
				ownAlert(1,"设置成功");
				if(type==2){
					$("#replace_"+userId).empty();
					$("#replace_"+userId).append("<a href='javascript:GroupManager.setAdmin(\""+GroupManager.roomData.id+"\","+userId+","+3+")'>取消管理员</a>");
				}else{
					$("#replace_"+userId).empty();
					$("#replace_"+userId).append("<a href='javascript:GroupManager.setAdmin(\""+GroupManager.roomData.id+"\","+userId+","+2+")'>设置管理员</a>");
				}
				
			}
		});
	},
	createMyItem : function(obj) {
		var itemHtml = "<div id='groups_"+obj.jid+"' class='groupListChild' style='border-bottom:1px solid #eeeeee;' onclick='GroupManager.isChoose(\"" +obj.jid + "\");'>"
				+          "<a href='javascript:;' style='cursor: pointer; margin-right: 10px;' class='pull-left'>"
				+               "<img onerror='this.src=\"img/ic_avatar.png\"' width='40' height='40' alt='' src='"+ (myFn.getAvatarUrl(obj.userId))+ "' class='roundAvatar'>"
				+          "</a> "
				+          "<div onclick='GroupManager.createGroupChat(\""+ (obj.id)+ "\",\"" + obj.userId + "\");' style='cursor: pointer;' class='media-body'>"
				+               "<h5 class='media-heading groupName'>"+ (myFn.isNil(obj.name) ? "&nbsp;" : obj.name)+"</h5>"
				+" <div id='msgNum_"+obj.jid+"' class='news' style='float:right;display:none'><span id='span' style='background-color: #FA6A43;border-radius: 12px;padding:0 4px;color:white'>"
				    +1+"</span></div>"
				+               "<div style='color:#7E7979'>"+ (myFn.isNil(obj.desc) ? "无" : obj.desc)+"</div>"
				+          "</div>"
				+      "</div>";

		return itemHtml;
	},
	createItem : function(obj) {
		var itemHtml = "<div id='groups_"+obj.jid+"' class='groupListChild' style='border-bottom:1px solid #eeeeee;' onclick='GroupManager.isChoose(\"" + obj.jid + "\");'>"
				+          "<a href='javascript:;' style='cursor: pointer; margin-right: 10px;' class='pull-left'>"
				+               "<img onerror='this.src=\"img/ic_avatar.png\"' width='40' height='40' alt='' src='"+ (myFn.getAvatarUrl(obj.userId))+ "' class='roundAvatar'>"
				+          "</a> ";
				//GroupManager.createGroupChat(\""+ (obj.id)+ "\");
				if(myFn.notNull(DataMap.myRooms[obj.jid]))
					itemHtml=itemHtml+"<div onclick='GroupManager.createGroupChat(\""+ (obj.id)+ "\");' style='cursor: pointer;' class='media-body'>";
				else 
					itemHtml=itemHtml+"<div onclick='' style='cursor: pointer;' class='media-body'>";

				itemHtml=itemHtml+ "<h5 class='media-heading'>"+ (myFn.isNil(obj.name) ? "&nbsp;" : obj.name)+"</h5>"
				+               "<div class=''>"+ (myFn.isNil(obj.desc) ? "无" : obj.desc)+"</div>";

			if(myFn.isNil(DataMap.myRooms[obj.jid]))
				itemHtml=itemHtml+"<a href='javascript:GroupManager.joinRoom(\"" + obj.id +"\");' style='float:right;z-index:5;margin-top:-25px;'> 加入群</a>";
				
				itemHtml=itemHtml+          "</div>"
				+      "</div>";

		return itemHtml;
	},
	converGroupMsg : function(msg) {
		var content =null;
		msg.text=msg.content;
			switch(msg.type){

				case 401:
				  msg.content=msg.fromUserName+" 上传了群文件 "+msg.content;
				  break;
				case 402:
				  msg.content=msg.fromUserName+" 删除了群文件 "+msg.content;
				  break;
				case 901:
				  msg.content=msg.fromUserName+" 群昵称修改为 "+msg.content;
				  break;
				case 902:
				   msg.content="群组名称修改为： "+msg.content;
				  break;
				case 903:
				   msg.content="群组被删除";
				  break;
				case 904:
				   msg.content=msg.toUserName+" 已退出群组";
					if(msg.toUserId==myData.userId && msg.fromUserId != myData.userId) {
						UI.showMsgNum(10001);
					}
				  break;
				case 905:
				   msg.content="新公告为: "+msg.content;
				  break;
				case 906:
				   msg.content=msg.toUserName+" 已被禁言 ";
					if(msg.fromUserId!=myData.userId) {
						UI.showMsgNum(10001);
					}
				  break;
				case 907:
					if(msg.fromUserId==msg.toUserId){
						msg.content=msg.fromUserName+" 已加入群组";
					}else{
						msg.content=msg.fromUserName+" 邀请 "+msg.toUserName+" 加入群组";
						if(msg.toUserId==myData.userId) {
							UI.showMsgNum(10001);
						}
					}
				  break;
				default:
				 return null;
			}
		msg.contentType=msg.type;
		msg.type=10;
		msg.content+="  ("+myFn.toDateTime(msg.timeSend)+")";
		console.log(msg.content);
		return msg;
	},
	showGroupLog: function (msg){ //用于显示群组日志
		if(msg.objectId==ConversationManager.fromUserId){
			var logHtml ="<div class='logContent' >"
						+"	<span>"+msg.content+"</span> "
						+"</div>";
			$("#messageContainer").append(logHtml);
			UI.scrollToEnd();
		}
		switch(msg.contentType){
			case 901:

				GroupManager._XEP_0045_037(msg.objectId,myData.userId);
			  break;
			case 902:
			    $("#myRoomList #groups_"+msg.objectId+" .groupName").html(msg.text);
			  	$("#chatPanel #chatTitle").html(msg.text);  
			  break;
			case 903:
			  GroupManager.showMyRoom(0);
			  	
			  break;
			case 904:
				//  被踢了
 			  if(myData.userId==msg.toUserId){
			  	delete DataMap.myRooms[msg.objectId];
				$("#myMessagesList #groups_"+msg.objectId).remove();
				if(msg.objectId==ConversationManager.fromUserId)
					UI.hideChatBodyAndDetails();
				    $('#groups_'+msg.objectId).remove();
				//GroupManager.showMyRoom(0);
			  }
			  break;
			case 905:
			  GroupManager._XEP_0045_037(msg.objectId,myData.userId);
			  break;
			case 906:
			  GroupManager._XEP_0045_037(msg.objectId,myData.userId);
			  break;
			case 907:
				//被邀请  加入群
				if(myData.userId==msg.toUserId){
					mySdk.getRoom(msg.fileName,function(obj){
				  		DataMap.myRooms[obj.jid]=obj;
				  	});
				  	GroupManager._XEP_0045_037(msg.objectId,myData.userId);

				  }
			  
			  break;
			default:
			 return null;
		}
		
	},
	createPager : function(pageIndex, length, fnName) {
		var pagerHtml = "<div class='pageTurning'>";  //margin-top:80px;
		if (pageIndex == 0) {
			pagerHtml += "<a href='#'>"
			             +"<img width='15' height='15' alt='' src='img/on1.png'>"
			             +"</a>";
		} else {
			pagerHtml += "<a href='javascript:" + fnName + "(" + (pageIndex - 1) + ")" + "'>"
			             +"<img width='15' height='15' alt='' src='img/on.png'>"
			             +"</a>";
		}
		pagerHtml += "<div class='pageIndex'>" + (pageIndex + 1) + "</div>";
		if (length < 10) {
			pagerHtml += "";
		} else {
			pagerHtml += "<a href='javascript:" + fnName + "(" + (pageIndex + 1) + ")" + "'> <img width='15' height='15' alt='' src='img/next.png'> </a>";
		}
		return pagerHtml;
	},
	/**
	 * 
	 * @param userId
	 * @param groupName
	 * @param groupData
	 */
	createGroupChat : function(groupId,userId) {  //groupId :群组id    userId：创建者的userId
		DataMap.rooms[groupId]=null;
		// 修改全局最后登录时间
		var loginData = $.cookie("loginData");
		loginDataObj = eval("(" + loginData + ")");
		loginDataObj.active = new Date().getTime();
		console.log("修改最后登录时间："+loginDataObj.active);
		$.cookie("loginData", JSON.stringify(loginDataObj));
		mySdk.getRoom(groupId,function(obj){
			console.log(obj);
			GroupManager.roomData = obj;
			DataMap.myRooms[obj.jid]=obj;
			// GroupManager.filters[GroupManager.roomData.jid] = false;
			
			ConversationManager.open(obj.jid + "@" + AppConfig.mucJID, obj.name);
			
			ConversationManager.showAvatar(userId);//显示聊天窗口顶部头像(群聊)

			// 成员角色：1=创建者、2=管理员、3=成员
			var role = 3;
			var tbMemberListHtml = "";
			for (var i = 0; i < obj.members.length; i++) {
				tbMemberListHtml += "<tr id='tr_member_" + obj.members[i].userId + "'><td width=30><img src='"
						+ myFn.getAvatarUrl(obj.members[i].userId) + "' width=30 height=30 /></td><td>&nbsp;&nbsp;&nbsp;&nbsp;"
						+ obj.members[i].nickname + "</td><td width=50><a href='javascript:GroupManager.removeMember(\"" + obj.id + "\","
						+ obj.members[i].userId + ",\"" + obj.members[i].nickname + "\");'>删除</a></td></tr>";
				if (myData.userId == obj.members[i].userId) {
					role = obj.members[i].role;
				}
			}
			$("#tbMemberList").empty();
			$("#tbMemberList").append(tbMemberListHtml);
			$("#btnShield div p").empty();
			$("#btnShield div p").append("<div><p style='float: left;margin-top: 2.5%;margin-left: 10px'>"+GroupManager.filters[GroupManager.roomData.jid] ? '屏蔽消息' : '取消屏蔽'+"</p></div>");
			if (3 == role) {
				$("#btnDelete").hide();
				$("#btnexit").show();
				$("#btnKicking_1").empty();
				$("#btnKicking_1").append("成员列表");
			} else if (2 == role) {
				$("#btnDelete").hide();
				$("#btnexit").show();
				$("#btnKicking_1").empty();
				$("#btnKicking_1").append("成员管理");
			} else if (1 == role) {
				$("#btnDelete").show();
				$("#btnexit").hide();
				$("#btnKicking_1").empty();
				$("#btnKicking_1").append("成员管理");
			}
				
		});
	},
	createGroup : function() {
		var groupName = $("#roomName").val();
		var groupDesc = $("#roomDesc").val();
		var groupId = myFn.randomUUID();
		var membersText = GroupManager.getMembersText();
		var params = {
			jid : groupId,
			name : groupName,
			desc : groupDesc,
			text : membersText
		};

		if (myFn.isNil(groupName)) {
			ownAlert(3,"请输入群组名称")
			return;
		} else if (myFn.isNil(groupDesc)) {
			ownAlert(3,"请输入群组备注")
			return;
		}
		 var array = eval(membersText);
		 //alert(array);
		$("#btnCreateGroup").hide();
		$("#loading_1").show();
		GroupManager._XEP_0045_143(groupId, groupName, groupDesc, myData.userId, function(status, reason) {
			if (0 == status) {
				$.extend(params, myData.locateParams);
				myFn.invoke({
					url : '/room/add',
					data : params,
					success : function(result) {
						if (1 == result.resultCode) {
							ownAlert(1,"群组创建成功！");
							$("#newRoomModal").modal('hide');
							GroupManager.showMyRoom(0);
						} else {
							ownAlert(2,result.resultMsg);
						}
					},
					error : function(result) {
						ownAlert(2,"创建失败！请稍后再试。");
					}
				});
			} else {
				ownAlert(2,reason);
			}
			$("#loading_1").hide();
			$("#btnCreateGroup").show();
		});
	},
	//加入群聊
	joinRoom:function(roomId){
		mySdk.joinRoom(roomId,function(){
			ownAlert(3,"加入群成功！");
			//加入群聊
			var obj=DataMap.rooms[roomId];
			GroupManager._XEP_0045_037(obj.jid, obj.userId);
			GroupManager.createGroupChat(roomId);
			GroupManager.showMyRoom(0);
		});
	},
	//退出群聊
	exitRoom:function(jid){
		mySdk.exitRoom(GroupManager.roomData.id,function(){
				ownAlert(1,"退出成功");
				var jid=GroupManager.roomData.jid;
				delete DataMap.myRooms[GroupManager.roomData.jid];
				$("#myMessagesList #groups_"+jid).remove();
				GroupManager.showMyRoom(0);
				GroupManager._XEP_0045_038(GroupManager.roomData.jid,myData.userId);
				GroupManager.roomData=null;
		});
		
	},
	//移出成员
	removeMember : function(groupId, userId, nickname) {
		if (GroupManager.roomData.userId == myData.userId) {
			if (confirm('是否确认踢出成员\"' + nickname + '\"？')) {
				myFn.invoke({
					url : '/room/member/delete',
					data : {
						roomId : groupId,
						userId : userId
					},
					success : function(result) {
						if (1 == result.resultCode) {
							ownAlert(1,"成员踢出成功。");
							$("#memberManagerDialog").modal('hide');
						} else {
							ownAlert(2,"成员踢出失败，请稍后再试。")
						}
					},
					error : function(result) {
					}
				});
			}
		} else {
			ownAlert(3,"权限不足！");
		}
	},
	//禁言
	setTalkTime : function(groupId, userId, nickname) {
		if (GroupManager.roomData.userId == myData.userId) {

			window.wxc.xcConfirm('是否确认禁言成员\"' + nickname + '\"？', window.wxc.xcConfirm.typeEnum.confirm,{
				onOk:function(){
					
					myFn.invoke({
						url : '/room/member/update',
						data : {
							roomId : groupId,
							userId : userId,
							talkTime : (Math.round(new Date().getTime() / 1000) + 300)
						},
						success : function(result) {
							if (1 == result.resultCode) {
								ownAlert(1,"成员禁言成功");
							} else {
								ownAlert(2,"成员踢禁言失败，请稍后再试");
							}
						},
						error : function(result) {
						}
					});
				}
			});

		} else {
			ownAlert(3,"权限不足！");
		}
	},
	doMemberInvite : function() {//确认邀请好友
		var myArray = new Array();
		$('input[name="invite_userId"]:checked').each(function() {
			myArray.push(parseInt($(this).val()));
		});
		var text = JSON.stringify(myArray);
		if (0 == myArray.length) {
			ownAlert(3,"请选择要邀请的好友！");
			return;
		} else {
			myFn.invoke({
				url : '/room/member/update',
				data : {
					roomId : GroupManager.roomData.id,
					text : text
				},
				success : function(result) {
					if (1 == result.resultCode) {
						ownAlert(1,"邀请成功。");
						$("#memberInviteDialog").modal('hide');
					} else {
						ownAlert(2,"邀请失败，请稍后再试。");
					}
				},
				error : function(result) {
					ownAlert(2,"邀请失败，请稍后再试。");
				}
			});
		}
	},
	showMemberList:function(){

	},
	destoryGroup : function(groupId) {
		if (GroupManager.roomData.userId == myData.userId) {

		} else {
			ownAlert(3,"权限不足！");
		}
	},
	isChoose : function(groupId){ //群组列表选中状态切换
      $("#groups_"+groupId+"").addClass("fActive");
      $("#groups_"+groupId+"").siblings().removeClass("fActive");
	},
	_XEP_0045_018 : function(to) {
		var id = GroupManager.getId();
		var pres = $pres({
			id : id,
			to : to
		}).c("x", {
			xmlns : "http://jabber.org/protocol/muc"
		});
		// 发送报文
		GroupManager.getCon().send(pres.tree());
	},
	_XEP_0045_018 : function(groupId, userId) {
		var id = GroupManager.getId();
		var to = GroupManager.getGroupAddr(groupId)+ "/" + userId;
		var pres = $pres({
			id : id,
			to : to
		}).c("x", {
			xmlns : "http://jabber.org/protocol/muc"
		});
		// 发送报文
		GroupManager.getCon().send(pres.tree());
	},
	/**
	 * [_XEP_0045_0137 用户请求不发送历史消息]
	 * @param  {[type]} groupId [群组JID]
	 * @param  {[type]} userId [用户userId]
	 * @return {[type]}         [description]
	 */
	_XEP_0045_037 : function(groupId,userId) {
		var id = GroupManager.getId();
		var to = GroupManager.getGroupAddr(groupId)+ "/" + userId;
		var pres = $pres({
			id : id,
			to : to
		}).c("x", {
			xmlns : "http://jabber.org/protocol/muc"
		}).c("history",{maxchars:'0',seconds:'0'});
		// 发送报文
		GroupManager.getCon().sendIQ(pres.tree(),function(stanza){
				 console.log("sendIQ result "+Strophe.serialize(stanza));
		},function(){
			 console.log("sendIQ error "+Strophe.serialize(stanza));
		},null);
		//console.log(" 037 "+pres.tree());
	},
	/**
	 * [_XEP_0045_038 退出群聊]
	 * @param  {[type]} groupId [群组JID]
	 * @param  {[type]} userId  [用户userId]
	 * @return {[type]}         [description]
	 */
	_XEP_0045_038 : function(groupId,userId) {
		var id = GroupManager.getId();
		var to = GroupManager.getGroupAddr(groupId) + "/" + userId;
		var pres = $pres({
			id : id,
			to : to,
			type : 'unavailable'
		});
		// 发送报文
		GroupManager.getCon().send(pres.tree());
		
	},
	/**
	 * 143. Jabber用户新建一个群组并声明对多用户聊天的支持
	 * 
	 * @param groupId
	 * @param groupName
	 * @param groupDesc
	 * @param userId
	 * @param cb
	 */
	_XEP_0045_143 : function(groupId, groupName, groupDesc, userId, cb) {
		var id = GroupManager.getId();
		var to = GroupManager.getGroupAddr(groupId) + "/" + userId;
		var pres = $pres({
			id : id,
			to : to
		}).c("x", {
			xmlns : "http://jabber.org/protocol/muc"
		});
		// 监听回调
		var handler = GroupManager.getCon().addHandler(function(stanza) {
			// 回调成功
			GroupManager._XEP_0045_144(groupId, groupName, groupDesc, userId, cb);
		}, null, 'presence', null, id, null, null);
		// 发送报文
		GroupManager.getCon().send(pres.tree());
	},
	/**
	 * 144. 服务承认群组新建成功
	 * 
	 * @param groupId
	 * @param groupName
	 * @param groupDesc
	 * @param userId
	 * @param cb
	 */
	_XEP_0045_144 : function(groupId, groupName, groupDesc, userId, cb) {
		// 服务承认群组新建成功
		GroupManager._XEP_0045_146(groupId, groupName, groupDesc, userId, cb);
	},
	/**
	 * 146. 所有者请求配置表单
	 * 
	 * @param groupId
	 * @param groupName
	 * @param groupDesc
	 * @param userId
	 * @param cb
	 */
	_XEP_0045_146 : function(groupId, groupName, groupDesc, userId, cb) {
		var id = GroupManager.getId();
		var to = GroupManager.getGroupAddr(groupId);

		var iq = $iq({
			id : id,
			to : to,
			type : "get"
		}).c("query", {
			xmlns : "http://jabber.org/protocol/muc#owner"
		}, null);
		GroupManager.getCon().sendIQ(iq, function(stanza) {
			// 147. 服务发送配置表单
			// 148. 服务通知所有者没有配置可用
			GroupManager._XEP_0045_149(groupId, groupName, groupDesc, userId, cb);
		}, function(stanza) {
			// 请求配置表单失败
			cb(1, "请求配置表单失败1");
		});
	},
	/**
	 * 149. 所有者提交配置表单
	 * 
	 * @param groupId
	 * @param groupName
	 * @param groupDesc
	 * @param userId
	 * @param cb
	 */
	_XEP_0045_149 : function(groupId, groupName, groupDesc, userId, cb) {
		var x = $build("x", {
			xmlns : "jabber:x:data",
			type : "submit"
		});

		var to = userId+"@"+AppConfig.boshDomain;
		var id = GroupManager.getId();
		var from = GroupManager.getGroupAddr(groupId);
		var iq = $iq({
			id : id,
			to : from,
			type : 'set'
		}).c("query", {
			xmlns : "http://jabber.org/protocol/muc#owner"
		}, null).cnode(x.tree());
        console.log(iq.tree());
		GroupManager.getCon().sendIQ(iq.tree(), function(stanza) {

			// 150. 服务通知新群组所有者成功
			// 151. 服务通知所有者请求的配置选项不被接受
			cb(0, "");
		}, function(stanza) {
			cb(1, "提交配置表单失败2");
		});
	},
	getMembersList : function() {
		var invitee = new Array();
		$('input[name="userId"]:checked').each(function() {
			invitee.push(parseInt($(this).val()));
		});
		return invitee;
	},
	getMembersText : function() {
		return JSON.stringify(Checkbox.parseData());
	},
	getId : function() {
		return Math.round(new Date().getTime() / 1000) + Math.floor(Math.random() * 1000);
	},
	getCon : function() {
		return myConnection;
	},
	getGroupAddr : function(groupId) {
		return groupId + "@" + AppConfig.mucJID;
	}
};
