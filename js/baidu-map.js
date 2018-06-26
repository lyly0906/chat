	Map={
		map:null,//百度地图对象
		marker:null,
		markerMenu:null,
		myGeo:null,
		point:null,
		lng:null,//经度
		lat:null, //纬度
		imgApiUrl:"http://api.map.baidu.com/staticimage?width=320&height=240&&zoom=15&markers="
		//
		//http://api.map.baidu.com/staticimage?width=480&height=320&center=114.1212,24.333&zoom=8

	}
var map=null;
	$(function() {
		//位置
		
		mapInit();

		$("#place").click(function(){
			$("#map").modal('show');
			$("#mapSubmit").show();
			getLocation();
		});
		
		
		$("#mapSubmit").click(function(){
			if(myFn.isNil(Map.lng)||myFn.isNil(Map.lat)){
				ownAlert(3,"请先选择位置!");
				return;
			}

			getAddress(Map.point,function(address){
				var content=Map.imgApiUrl+Map.lng+","+Map.lat+"&zoom=15"
				var msg=ConversationManager.createMsg(4,content);
				msg.location_x=Map.lat;
				msg.location_y=Map.lng;
				msg.objectId=address;
				UI.sendMsg(msg);
				$("#map").modal('hide');
			});
			
		});
		

	});
	
	function mapInit(){

			 map = new BMap.Map("baiduMap",
			 	{minZoom:4,maxZoom:18,enableMapClick:false});
			Map.map=map;
			Map.myGeo = new BMap.Geocoder();
			map.addEventListener("click", mapClick);
			
			var po=new BMap.Point(116.4035,39.915);
			map.centerAndZoom(po,15);
			 //启用滚轮放大缩小  
		    map.enableScrollWheelZoom(true); 

		    map.addControl(new BMap.NavigationControl()); 
		    //启用键盘操作  
		    map.enableKeyboard(true);

		   

			
			//禁用地图拖拽  
		    //map.disableDragging(true);  
		    //禁用滚轮放大缩小  
		    //map.disableScrollWheelZoom(true);  

			


			 
			
			
	}

	function getLocation(){
		var geolocation = new BMap.Geolocation();

			geolocation.getCurrentPosition(function(r){
				if(this.getStatus() == BMAP_STATUS_SUCCESS){
					Map.lat=r.point.lat;
					Map.lng=r.point.lng;
					addMarker(r.point);
		 			mapPanTo(r.point);
				}
				else {
					ownAlert(2,'failed'+this.getStatus());
				}        
			},{enableHighAccuracy: true})
	}


	function mapClick (e){
		addMarker(e.point);
		Map.lat=e.point.lat;
		Map.lng=e.point.lng;
		Map.point=e.point;
	}
	function addMarker(point){
		var marker = new BMap.Marker(point);
	 			removeMarker();
	 			Map.marker=marker;
	 			Map.point=point;
	 			map.addOverlay(marker);
	 			marker.setAnimation(BMAP_ANIMATION_BOUNCE);
	 			
	 			//map.panTo();
	}
	function removeMarker(){
		if(myFn.notNull(Map.marker))
			map.removeOverlay(Map.marker);
	}
	function getAddress(pt,cb){
		if(myFn.isNil(Map.myGeo)){
			Map.myGeo = new BMap.Geocoder();
		}

		Map.myGeo.getLocation(pt, function(rs){
			var addComp = rs.addressComponents;
			var address=addComp.city + ", " + addComp.district + ", " +
			 addComp.street + ", " + addComp.streetNumber;
			cb(address);
		}); 
	}
	function showToMap(obj){
		var thisObj=$(obj);

			$("#map").modal('show');
			$("#mapSubmit").hide();
			
			var lat=parseFloat(thisObj.attr("lat")); 
			var lng=parseFloat(thisObj.attr("lng"));
			var point=new BMap.Point(lat,lng);
			addMarker(point);
			mapPanTo(point);
	}
	function mapPanTo(point){
		setTimeout(function () {  
        		map.panTo(point);
    		}, 2000);
	}