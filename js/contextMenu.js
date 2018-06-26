


$(function(){
	//消息界面 右键菜单
    $.contextMenu({
        selector: '#messageContainer .chat_content_group',
       	//className: '.chat_content',
       	//trigger: 'hover',
        callback: function(key, opt) {

        },
        items: {
        	forwarding:{
        		name:"转发",
        		icon:"edit",
                disabled:function(){
                    var msgType=$(this).attr("msgType");
                   if(myFn.notNull(msgType)&&28!=msgType)
                        return false;
                     else
                        return true;
                },
        		callback:function(key,opt){
						//var obj =$(this);
						/*var idStr=obj.attr("id");
						var msgId=idStr.split("msg_");*/
						var msgId=$(this).attr("id").split("msg_")[1];
						Temp.msgId=msgId;
                        // Temp.friendListType="forward";
                        Checkbox.cheackedFriends = {};  //清空储存的数据
                        Transpond.showFriendList(0); //加载好友
                        Transpond.showGroupList(0);//加载群组

        		}
        	},
            revoked:{
                name:"撤回",
                icon:"recall",
                disabled:function(){
                    //判断不是自己发送的就隐藏
                    var cla=$(this).attr("class");
                   if(!myFn.isContains(cla,"self"))
                     return true;
                 var msgType=$(this).attr("msgType");
                   if(myFn.notNull(msgType)&&28!=msgType)
                        return false;
                    else
                        return true;
                },
                callback:function(key,opt){
                    var msgId=$(this).attr("id").split("msg_")[1];
                    var msg=DataMap.msgMap[msgId];
                    var time = Math.round(new Date().getTime() / 1000);
                    if((time-msg.timeSend)>300){
                        ownAlert(3,"发送超过五分钟,不能撤回！");
                        return;
                    }
                        UI.deleteMsg(0==ConversationManager.isGroup?1:2,2,msgId);
                        //发送撤回消息协议
                        //var msg=ConversationManager.createMsg(202,msgId);
                        var msg=ConversationManager.createMsg(202,msgId);

                        console.log(msg);
                        UI.sendMsg(msg);
                }
            },
        	/*delete:{
				name:"删除",
        		icon:"delete",
                disabled:function(){
                    return false;
                },
        		callback:function(key,opt){
        			var msgId=$(this).attr("id").split("msg_")[1]
						UI.deleteMsg(0==ConversationManager.isGroup?1:2,1,msgId);
        		}
        	}*/
            /*,
        	"sep1": "---------",
        	quit:{
        		name: "退出",
        		 icon: function($element, key, item)
           			 	  { return 'context-menu-icon context-menu-icon-quit'; }
        	}*/

        }
    });


    //单聊消息界面 右键菜单
    $.contextMenu({
        selector: '#myMessagesList .keeplive',
        //className: '.chat_content',
        //trigger: 'hover',
        callback: function(key, opt) {

        },
        items: {
            delete:{
                name:"删除该会话",
                icon:"delete",
                disabled:function(){
                    return false;
                },
                callback:function(key,opt){
                    $(this).remove();
                    var jid = $(this).attr('id').split('_')[1];
                    if(localStorage.getItem('jid') != ""){
                        var jjid =  localStorage.getItem('jid') + ','+jid;
                    }else{
                        var jjid =  jid;
                    }
                    localStorage.setItem('jid',jjid);

                    // 保存到数据库
                    myFn.invoke({
                        url : '/chatkeep/add',
                        data : {
                            userId : myData.userId,
                            toUserId : jid,
                            jid:0,
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
                    //$('#tabCon_0').hide();
                    ConversationManager.open('10000@www.shiku.co', '系统客服');
                    return true;
                }
            }
        }
    });

    //群聊消息界面 右键菜单
    $.contextMenu({
        selector: '#myMessagesList .groupListChild',
        //className: '.chat_content',
        //trigger: 'hover',
        callback: function(key, opt) {

        },
        items: {
            delete:{
                name:"删除该会话",
                icon:"delete",
                disabled:function(){
                    return false;
                },
                callback:function(key,opt){
                    $(this).remove();
                    var mucjid = $(this).attr('id').split('_')[1];
                    if(localStorage.getItem('mucjid') != ""){
                        var mucjjid =  localStorage.getItem('mucjid') + ','+mucjid;
                    }else{
                        var mucjjid =  mucjid;
                    }
                    localStorage.setItem('mucjid',mucjjid);

                    // 保存到数据库
                    myFn.invoke({
                        url : '/chatkeep/add',
                        data : {
                            userId : myData.userId,
                            toUserId : 0,
                            jid:mucjid,
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
                    //$('#tabCon_0').hide();
                    ConversationManager.open('10000@www.shiku.co', '系统客服');
                    return true;
                }
            }
        }
    });
});


var  Transpond = { //转发相关
    showFriendList : function(pageIndex){
        var tbInviteListHtml = "";
        mySdk.getFriendsList(myData.userId,null,2, pageIndex, function(result) {
            var friendsList = result.pageData;
            var obj=null;
            // var choosedUIds = Checkbox.parseData(); //调用方法获取已勾选的好友
            for(var i = 0; i < friendsList.length; i++){
                 obj = friendsList[i];
                 var inputItem = "<input id='false' name='invite_userId' type='checkbox' value='" + obj.toUserId + "' onclick='Checkbox.checkedAndCancel(this)'/>";
                 if(obj.toUserId==Checkbox.cheackedFriends[obj.toUserId]){
                    inputItem = "<input id='false' name='invite_userId' type='checkbox' checked='checked' value='" + obj.toUserId + "'  onclick='Checkbox.checkedAndCancel(this)'/>";
                 }
                tbInviteListHtml += "<tr style='margin-bottom:10px;'><td><img onerror='this.src=\"img/ic_avatar.png\"' src='" + myFn.getAvatarUrl(obj.toUserId)
                + "' width=30 height=30 class='roundAvatar'/></td><td width=100%>&nbsp;&nbsp;&nbsp;&nbsp;" + obj.toNickname
                + "</td><td>"+inputItem+"</td></tr>";
            }
            var pageHtml = GroupManager.createPager(pageIndex, result.pageData.length,'Transpond.showFriendList');
            $("#msgTranspond #pageFriend").empty().append(pageHtml);
            $("#msgTranspond #friendList").empty();
            $("#msgTranspond #friendList").append(tbInviteListHtml);
            $("#msgTranspond #friendTitle").attr("class","transpond transpondChange");
            $("#msgTranspond").modal('show');
        });
    },
    toggleFriendOrGroup : function (name){ //切换
        if("friend"==name){ //好友
            $("#msgTranspond #keyword").show(); //显示搜索框
            //切换背景
            $("#msgTranspond #friendTitle").attr("class","transpond transpondChange");
            $("#msgTranspond #groupTitle").attr("class","transpond");

            //隐藏群组相关
            $("#msgTranspond #groupList").hide();
            $("#msgTranspond #pageGroup").hide();
            $("#msgTranspond #keywordSearchGroup").hide();

            //显示好友相关
            $("#msgTranspond #friendList").show();
            $("#msgTranspond #pageFriend").show();
            $("#msgTranspond #keywordSearchFrend").show();

        }else if("group"==name){ //群组
            $("#msgTranspond #keyword").hide(); //隐藏搜索框
            //切换背景
            $("#msgTranspond #groupTitle").attr("class","transpond transpondChange");
            $("#msgTranspond #friendTitle").attr("class","transpond");

            //隐藏好友相关
            $("#msgTranspond #friendList").hide();
            $("#msgTranspond #pageFriend").hide();
            $("#msgTranspond #keywordSearchFrend").hide();

            //显示群组相关
            $("#msgTranspond #groupList").show();
            $("#msgTranspond #pageGroup").show();
            $("#msgTranspond #keywordSearchGroup").show();
        }
    },
    confirmTranspond : function(){ //确认转发 
        var userIdArr =Checkbox.parseData();//调用方法获取已勾选的数据
        if (0 == userIdArr.length) {
            ownAlert(3,"请选择要发送的好友");
            return;
        } else {
            var type=1!=ConversationManager.isGroup?1:2;
            mySdk.getMessage(Temp.msgId,type,function(msg){
                    UI.forwardingMsg(msg,userIdArr);
            });
            $("#msgTranspond").modal('hide'); //隐藏面板

        }



    },
    search : function(name){ //搜索

        if("friend"==name){ //好友

           Transpond.searchFriend(0);

        }else if("group"==name){ //群组
            Transpond.searchGroup(0);
        }
    },
    searchFriend : function(pageIndex){
        //搜索好友
        var keyword=$("#msgTranspond #keyword").val();
        if(myFn.isNil(keyword)){
            ownAlert(3,"请输入搜索关键字");
            return;
        }
        //转发搜索
        mySdk.getFriendsList(myData.userId,keyword,2,pageIndex,function(result){
             var tbInviteListHtml = "";
                var friendsList = result.pageData;
                var obj=null;
                for(var i = 0; i < friendsList.length; i++){
                     obj = friendsList[i];
                     var inputItem = "<input id='false' name='invite_userId' type='checkbox' value='" + obj.toUserId + "' onclick='Checkbox.checkedAndCancel(this)'/>";
                     if(obj.toUserId==Checkbox.cheackedFriends[obj.toUserId]){
                        inputItem = "<input id='false' name='invite_userId' type='checkbox' checked='checked' value='" + obj.toUserId + "'  onclick='Checkbox.checkedAndCancel(this)'/>";
                     }
                    tbInviteListHtml += "<tr style='margin-bottom:10px;'><td><img onerror='this.src=\"img/ic_avatar.png\"' src='" + myFn.getAvatarUrl(obj.toUserId)
                    + "' width=30 height=30 class='roundAvatar'/></td><td width=100%>&nbsp;&nbsp;&nbsp;&nbsp;" + obj.toNickname
                    + "</td><td>"+inputItem+"</td></tr>";
                }

                var pageHtml = GroupManager.createPager(pageIndex, result.pageData.length,'Transpond.searchFriend');
                $("#msgTranspond #pageFriend").empty().append(pageHtml);
                $("#msgTranspond #friendList").empty();
                $("#msgTranspond #friendList").append(tbInviteListHtml);
        });
    },
    searchGroup : function(pageIndex){

    },
    showGroupList : function(pageIndex){
        mySdk.getMyRoom(pageIndex,10,function(result){
            var groupHtml = "";
            for (var i = 0; i < result.length; i++) {
                var obj = result[i];

                var inputItem = "<input id='false' name='invite_groupId' type='checkbox' value='" + obj.jid + "' onclick='Checkbox.checkedAndCancel(this)'/>";
                if(obj.jid==Checkbox.cheackedFriends[obj.jid]){ //判断数据是否存在
                    inputItem = "<input id='false' name='invite_groupId' type='checkbox' checked='checked' value='" + obj.jid + "'  onclick='Checkbox.checkedAndCancel(this)'/>";
                }
                groupHtml += "<tr style='margin-bottom:10px;'><td>"
                                 +      "<img onerror='this.src=\"img/ic_avatar.png\"' src='"+ (myFn.getAvatarUrl(obj.userId)) + "' width=30 height=30 class='roundAvatar'/>"
                                 + "</td><td width=100%>"
                                 +      "<h5 class='media-heading groupName'>"+ (myFn.isNil(obj.name) ? "&nbsp;" : obj.name)+"</h5>"
                                 + "</td><td>"+inputItem+"</td></tr>";
            }

            pageHtml = GroupManager.createPager(pageIndex, length, 'Transpond.showGroupList');

            $("#msgTranspond #pageGroup").empty().append(pageHtml);
            $("#msgTranspond #groupList").empty();
            $("#msgTranspond #groupList").append(groupHtml);
        });
    },

};











