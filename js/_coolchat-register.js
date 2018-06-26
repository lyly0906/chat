$(function() {
	// // 初始化uploadify
	// $('#avatar').uploadify({
	// 	'formData' : {},
	// 	'swf' : 'js/uploadify/uploadify.swf',
	// 	'uploader' : myData.uploadAvatarUrl,
	// 	'height' : 30,
	// 	'fileTypeExts' : '*.gif; *.jpg; *.png',
	// 	'fileObjName' : 'file',
	// 	buttonText : '选择文件',
	// 	'onUploadStart' : function(file) {
	// 		var param = {};
	// 		param.userId = getUserId();
	// 		$("#avatar").uploadify("settings", "formData", param);
	// 	},
	// 	'onUploadSuccess' : function(file, data, response) {
	// 		var obj = eval("(" + data + ")");
	// 		if (1 == obj.resultCode) {
	// 			ownAlert(1,"头像上传成功！");
	// 			$("#avatar_preview").attr("src", obj.data.oUrl);
	// 			$("#avatar_preview").show();
	// 		} else {
	// 			ownAlert(2,"头像上传失败！请重试。");
	// 		}
	// 	},
	// 	'onUploadError' : function(file, errorCode, errorMsg, errorString) {
	// 		ownAlert(2,"头像上传失败！请重试。");
	// 	}
	// });
	

	// 初始化表单验证
	$("#form3").validate({
		ignore : "",
		debug : true,
		submitHandler : function(form) {
			register();
		},
		rules : {
			telephone : {
				required : true,
				isMobile : true
			},
			password : {
				required : true,
				minlength : 6
			},
			password2 : {
				required : true,
				equalTo : "#password"
			},
			nickname : {
				required : true
			},
			sex : {
				required : true
			}
		},
		errorPlacement: function(error, element) {
			// $( element ).closest( "form" ).find( "label[for='" + element.attr( "id" ) + "']" ).append( error );
			// error.appendTo(element.parent());  
			$(element).siblings(".help-block").after(error);
		},
		messages : {
			telephone : {
				required : "请输入正确的手机号码"
			},
			password : "密码长度不足6位，或使用了非法字符",
			password2 : {
				required : "密码长度不足6位，或使用了非法字符",
				equalTo : "两次输入的密码不一致"

			},
			nickname : "必填项",
			sex : "必填项"
		}


	});
	// // 初始化bootstrap日期选择器
	// $('#birthday').datepicker({
	// 	format : 'yyyy/mm/dd',
	// 	language : 'zh-CN',
	// 	pickDate : true,
	// 	pickTime : true,
	// 	hourStep : 1,
	// 	minuteStep : 15,
	// 	secondStep : 30,
	// 	inputMask : true
	// });


	// $("#btnToLogin").click(function() {
	// 	window.location.href = "login.html";
	// });
	jQuery.validator.addMethod("isMobile", function(value, element) {
		var length = value.length;
		return this.optional(element) || (length == 11 && /^(((13[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/.test(value));
	}, "请输入正确的手机号码");
})
function register() {
	var obj ={};
	obj["telephone"]=$("#telephone").val();
	obj["password"]=$("#password").val();
	obj["nickname"]=$("#nickname").val();
	obj["sex"]=$("#sex:checked").val();
	obj["cityId"]=$("#cityId").val();
	//var birthday = obj["birthday"];
	//var timestamp = Math.round(new Date(birthday).getTime() / 1000);
	//obj["birthday"] = timestamp;
	obj["password"] = $.md5(obj["password"]);

	myFn.invoke({
		url : '/user/register',
		data : obj,
		success : function(result) {
			if (1 == result.resultCode) {
				$.cookie("telephone", obj["telephone"]);
				$.cookie("tel", obj["telephone"]);
				$.cookie("password", obj["password"]);
				_userId = result.data.userId;
				//$('#addModal').modal('show');

				ejabberdreg(_userId,obj["password"],obj["nickname"]);
				window.location.href = "login.html";
			} else {
				ownAlert(2,"用户注册失败，请稍后再试！原因：" + result.resultMsg);
			}
		},
		error : function(result) {
			ownAlert(2,"用户注册失败，请稍后再试");
		}
	});
}
var _userId = 0;
function getUserId() {
	return _userId;
}

$(document).ready(function(){
		//readURL(this);
    
});
function ejabberdreg(userid,password,nickname){
	console.log(_userId+'|'+nickname);
	$.ajax({
		type: "POST", //提交方式
		url: "http://139.224.80.158:5280/api/register",//路径
		data: JSON.stringify({
			"host": "139.224.80.158",
			"user": userid+"",
			"password": password
		}),//数据，这里使用的是Json格式进行传输
		dataType: "json",
		success: function (result) {//返回数据根据结果进行相应的处理
			console.log(result);
		},
		beforeSend: function (xhr) {
			xhr.setRequestHeader("Authorization", "Basic dGVzdHhtcHBAMTM5LjIyNC44MC4xNTg6Mzk3MTI2ODQ1");
		},
		error : function(XMLHttpRequest, textStatus, errorThrown) {//这个error函数调试时非常有用，如果解析不正确，将会弹出错误框　　　　

		}
	});
    if(nickname){
		$.ajax({
			type: "POST", //提交方式
			url: "http://139.224.80.158:5280/api/set_nickname",//路径
			data: JSON.stringify({
				"host": "139.224.80.158",
				"user": userid+"",
				"nickname": nickname
			}),//数据，这里使用的是Json格式进行传输
			dataType: "json",
			success: function (result) {//返回数据根据结果进行相应的处理
				console.log(result);
			},
			beforeSend: function (xhr) {
				xhr.setRequestHeader("Authorization", "Basic dGVzdHhtcHBAMTM5LjIyNC44MC4xNTg6Mzk3MTI2ODQ1");
			},
			error : function(XMLHttpRequest, textStatus, errorThrown) {//这个error函数调试时非常有用，如果解析不正确，将会弹出错误框　　　　

			}
		});
	}

}

function readURL(input) { //头像上传相关
	var url = myData.uploadAvatarUrl;
	var image = '';
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#wizardPicturePreview').attr('src', e.target.result).fadeIn('slow');
            image = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    }
    $.ajax({
		type:'POST',
		url: url, 
		data: {image: image},
		async: false,
		dataType: 'json',
	 	success: function(data){
			if(data.success){
				ownAlert(1,'上传成功');
				window.location.href = "login.html";
			}else{
				ownAlert(2,'上传失败');
			}
		},
	 	error: function(err){
			ownAlert(2,'网络故障');
		}

	});

}

function init() {

	
}