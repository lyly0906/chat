$(function() {

	$("#check").prop("checked",true);
	var tel;
	var length;
	$("#btnLogin").click(function() {
		// Begin
		var telephone = $("#telephone").val();
		var password = $("#password").val();
		if($.cookie("password")!=null&&$.cookie("password")!=""){
				password=$.cookie("password");
		}else{
		 	password= $("#password").val();
		 	
		 	password = $.md5(password);
		}
		if (myFn.isNil(telephone)) {
			ownAlert(3,"请填写帐号...");
			return;
		} else if (myFn.isNil(password)) {
			alert(password);
			ownAlert(3,"请填写密码...");
			return;
		} else {

		}
		tel=telephone;
		length=password.length;
		telephone = $.md5(telephone);
		

		login(telephone, password,tel,length);
	});

	//telephone = $.cookie("telephone");
	//password = $.cookie("password");
	//tel=$.cookie("tel");
	//length=$.cookie("length");

	/*if (!myFn.isNil(telephone) && !myFn.isNil(password)) {
		$("#telephone").val(tel);
		$("#password").val(password.substring(0,length));
		    if (confirm("是否自动登录上一次登录的用户？")) {
			login(telephone, password,tel,length);
		    }

	}*/

	document.onkeydown=function(e){
		var ev=document.all?window.event:e;
		if(ev.keyCode==13){
			var telephone = $("#telephone").val();
			var password;
			if($.cookie("password")!=null){
				password=$.cookie("password");
			}else{
			 	password= $("#password").val();
			 	password = $.md5(password);
			}
		if (myFn.isNil(telephone)) {
				ownAlert(3,"请填写帐号...");
				return;
			} else if (myFn.isNil(password)) {
				ownAlert(3,"请填写密码...");
				return;
			} else {

			}
			telephone = $.md5(telephone);
			login(telephone, password,tel,length);
		}
	}
});

function randomNum(n){
	var t='';
	for(var i=0;i<n;i++){
		t+=Math.floor(Math.random()*10);
	}
	return t;
}

function login(telephone, password,tel,length) {
	var rand =
	myFn.invoke({
		url : '/user/login',
		data : {
			telephone : telephone,
			password : password
		},
		success : function(result) {
			if (1 == result.resultCode) {
				var loginData = {};
				// 常用数据缓存
				loginData.userId = result.data.userId;
				loginData.jid = loginData.userId + "@" + AppConfig.boshDomain+"/web";
				//loginData.jid = loginData.userId + "@" + AppConfig.boshDomain;
				loginData.telephone = telephone;
				loginData.password = password;
				loginData.access_token = result.data.access_token;
				loginData.loginResult = result.data;
				loginData.active = result.data.active;
				mySdk.getUser(loginData.userId, function(result) {
					loginData.user = result;

					// ***** Begin *****
					$.cookie("telephone", telephone, {
						expires : 30
					});
					$.cookie("password", password, {
						expires : 30
					});
					$.cookie("tel",tel,{
						expires:30
					});
					$.cookie("length",length,{
						expires:30
					});
					$.cookie("loginData", JSON.stringify(loginData));
					// ***** End *****

					// 登录成功，跳转到主页面
					window.location.href = "index.html";
				});
			} else {

				ownAlert(2,result.resultMsg);
			}
		},
		error : function(result) {
			ownAlert(2,"登录失败！请稍后再试。");
		}
	});
	// End
}