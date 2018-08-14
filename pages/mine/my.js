// pages/my/my.js
var app = getApp()
Page({
  data:{
    userInfo:{},
    showAuth:false,
    locationStatus:2
  },
	switchLocation() {
		let locationStatus = this.data.userInfo.locationStatus == 1 ? 2 : 1;
		console.log(locationStatus)
		app.$http({
			url: 'api/qyUser/location',
			data: {
				location: this.data.userInfo.location,
				locationStatus: locationStatus
			}
		}).then(res=>{
			if(res.code==200) {
				console.log(res)
				let _key = 'userInfo.locationStatus'
				this.setData({
					[_key]: locationStatus
				})
			}
		}).catch(err=>{
			console.log(err);
		})
	},
  toPersonInfo:function(){
    wx.navigateTo({
      url: '../person/personInfo'
    })
  },
  goauth: function (e) {
    var that = this;
    if (e.detail.signature){
      that.setData({
        showAuth: false,
      })
      app.getMyDetail(function (list) {
        that.setData({
          userInfo: list     
        })
      })
    }else{
      that.setData({
        showAuth: true
      })
    }
    // wx.openSetting({
    //   success: (res) => {
    //     if (res.authSetting["scope.userInfo"]) {
    //       that.setData({
    //         showAuth: false,
    //       })
    //       app.getMyDetail(function (list) {
    //         that.setData({
    //           userInfo: list     
    //         })
    //       })
    //     } else {
    //       that.setData({
    //         showAuth: true
    //       })
    //     }
    //   }
    // })
  },
  getLocationAuth:function(){
    var that = this;
    wx.openSetting({
      success: (res) => {
        if (res.authSetting["scope.userLocation"]) {
          wx.request({
            url: 'https://m.app.shangquanpai.com/api/qyUser/location',
            data: {
              locationStatus: 1
            },
            method: 'POST',
            header: {
              'content-type': 'application/json',
              'accessToken': wx.getStorageSync('ACCESS_TOKEN')
            },
            success: function (res) {

            }
          })
          app.getMyDetail(function (list) {
            that.setData({
              userInfo: list,
              locationStatus: 1
            })
          })
        } else {
          wx.request({
            url: 'https://m.app.shangquanpai.com/api/qyUser/location',
            data: {
              locationStatus: 2
            },
            method: 'POST',
            header: {
              'content-type': 'application/json',
              'accessToken': wx.getStorageSync('ACCESS_TOKEN')
            },
            success: function (res) {

            }
          })
          that.setData({
            locationStatus: 2
          })
          // that.getLocationAuth();
        }
      }
    })
  },
  changeLocationAuth: function (e){
    var that = this;
    var status = e.detail.value?1:2
    if (e.detail.value){
      that.getLocationAuth();
    }else{
      wx.request({
        url: 'https://m.app.shangquanpai.com/api/qyUser/location',
        data: {
          locationStatus: 2
        },
        method: 'POST',
        header: {
          'content-type': 'application/json',
          'accessToken': wx.getStorageSync('ACCESS_TOKEN')
        },
        success: function (res) {

        }
      })
    }
   
  },
  onShow:function(options){
    var that = this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userInfo']) {
          that.setData({
            showAuth: true
          })
        }else{
          that.setData({
            showAuth: false
          })
          wx.request({
            url: 'https://m.app.shangquanpai.com/api/qyUser/detail',
            data: {
            },
            method: 'POST',
            header: {
              'content-type': 'application/json',
              'accessToken': wx.getStorageSync('ACCESS_TOKEN')
            },
            success: function (res) {
              that.setData({
                userInfo: res.data.data,
                locationStatus: res.data.data.locationStatus
              })
            }
          })  
        }
      }
    })  
  },
  onReady:function(){
    // 页面渲染完成
  },
  // onShow:function(){
  //   // 页面显示
  // },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})