//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    list:[],
    isShowShare:false,
    showAuth:false
  },
  //事件处理函数
   toQunYou:function(event){
    wx.navigateTo({
      url: '../qunyou/qy?id=' + event.currentTarget.dataset.id + '&name=' + event.currentTarget.dataset.name + '&gid=' + event.currentTarget.dataset.gid
     })
   },
   goCreate:function(){
     wx.navigateTo({
       url: '../create/cr'
     })
   },
   onShow:function(){
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
          
         }
       }
     })  
     app.getIndexPageList(function (list) {
       if (list.length > 0) {
         that.setData({
           list: list,
           isShowShare: false,
         })
       } else {
         that.setData({
           list: [],
           isShowShare: true
         })
       }
     })
   },
   onLoad: function () {
     var that = this;
     wx.showShareMenu({
       withShareTicket: true
     });
     
   },
   goauth:function(e){
     var that = this;
     if (e.detail.signature){
      that.setData({
        showAuth: false
      })
      app.getIndexPageList(function (list) {
        if (list.length > 0) {
          that.setData({
            list: list,
            isShowShare: false
          })
        } else {
          that.setData({
            list: [],
            isShowShare: true
          })
        }
      })
     }else{
      that.setData({
        showAuth: true,
        list: [],
        isShowShare: false
      })
     }
    //  wx.openSetting({
    //    success: (res) => {
    //      if (res.authSetting["scope.userInfo"]) {
    //        that.setData({
    //          showAuth: false
    //        })
    //        app.getIndexPageList(function (list) {
    //          if (list.length > 0) {
    //            that.setData({
    //              list: list,
    //              isShowShare: false
    //            })
    //          } else {
    //            that.setData({
    //              list: [],
    //              isShowShare: true
    //            })
    //          }
    //        })
    //      }else{
    //        that.setData({
    //          showAuth: true
    //        })
    //      }
    //    }
    //  })
   },
  //  onReady: function (options) {
  //    var that = this; 
  //    app.getIndexPageList(function (list) {
  //      if (list.length>0){
  //        that.setData({
  //          list: list,
  //          isShowShare:false
  //        })
  //      }else{
  //        that.setData({
  //          list: [],
  //          isShowShare:true
  //        })
  //      }
  //    })
  
  //  },
   onShareAppMessage: function (res) {
    var that = this;  
    wx.showShareMenu({
      withShareTicket: true
    })
    return {
      title: '我在这儿，快来看看距离你有多远',
      path: 'pages/index/index',
      imageUrl:'../../imgs/bjt.png',
      success: function(res) {
        var shareTickets = res.shareTickets; 
        wx.getShareInfo({
           shareTicket: shareTickets,
           success: function (res) {
             wx.request({
               url: 'https://m.app.shangquanpai.com/api/common/decrypt',
               data: {
                 encryptedData:res.encryptedData,
                 iv: res.iv,
               },
               method: 'POST',
               header: {
                 'content-type': 'application/json'
               },
               success: function (res) {
                 wx.request({
                   url: 'https://m.app.shangquanpai.com/api/qyGroupUser/join',
                   data: {
                     openGId: res.data.data.openGId
                   },
                   method: 'POST',
                   header: {
                     'content-type': 'application/json',
                     'accessToken': wx.getStorageSync('ACCESS_TOKEN')
                   },
                   success: function (res) {
                     wx.request({
                       url: 'https://m.app.shangquanpai.com/api/qyGroup/my',
                       data: {
                       },
                       method: 'POST',
                       header: {
                         'content-type': 'application/json',
                         'accessToken': wx.getStorageSync('ACCESS_TOKEN')
                       },
                       success: function (res) {
                         that.setData({
                           list: res.data.data.dataList,
                           isShowShare: false
                         })
                       }
                     }) 
                   }
                 }) 
               }
             }) 
           },
         fail: function (res) {  
         }  
        })
      },
      fail: function(res) {
       
      }
    }
  }
})
