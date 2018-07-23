const util = require('../../utils/util.js')
var app = getApp()
Page({
  data: {
    showQyInfo:false,
    groupName:'',
    list:[],
    userInfo:{},
    qyInfo:{},
    id:'',
    gid:'',
    showConfig:false,
    keyword:'',
    verSionStatus:false,
    isShowMap:false,
    showAuth:false,
    markers: [
      // {
      //   iconPath: "../../imgs/location.png",
      //   latitude: 31.40527,
      //   longitude: 121.48941,
      //   width: 50,
      //   height: 50
      // }
    ],
    longitude:0,
    latitude:0
  },
  toHome:function(){
    wx.switchTab({
      url: '../index/index'
    })
  },
  bindKeyInput: function (e) {
    var that = this;
    that.setData({
      keyword: e.detail.value
    })
  },
  closeshowConfig: function () {
    var that = this;
    that.setData({
      showConfig: false
    })
  },
  confirm:function(){
    var that =this;
    if (that.data.keyword == ''){
      wx.showToast({
        title: '群昵称不为空',
        icon:'none',
        duration: 2000
      })
      return
    }
    wx.request({
      url: 'https://m.app.shangquanpai.com/api/qyGroup/update',
      data: {
        id: that.data.id,
        nickname: that.data.keyword
      },
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'accessToken': wx.getStorageSync('ACCESS_TOKEN')
      },
      success: function (res) {
        that.setData({
          groupName: that.data.keyword,
          showConfig: false
        });
      }
    })

  },
  showConfigBox:function(){
    var that =this;
    that.setData({
      showConfig:true
    })
  },
  clearGroup:function(){
    var that =this;
    wx.showModal({
      title: '提示',
      content: '清除群信息？',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: 'https://m.app.shangquanpai.com//api/qyGroupUser/exit',
            data: {
              id: that.data.id
            },
            method: 'POST',
            header: {
              'content-type': 'application/json',
              'accessToken': wx.getStorageSync('ACCESS_TOKEN')
            },
            success: function (res) {
              wx.reLaunch({
                url: '../index/index'
              })
            }
          })
        } else if (res.cancel) {
          }
      }
    })
   
  },
  showMap(){
    this.setData({
      isShowMap:true
    })
  },
  closeMap(){
    this.setData({
      isShowMap: false
    })
  },
  onShareAppMessage: function (res) {
    var that = this;
    return {
      title: '我在这儿，快来看看距离你有多远',
      path:'pages/qunyou/qy',
      // path: 'pages/qunyou/qy?id=' + that.data.id + '&name=' + '&gid=' + that.data.gid,
      imageUrl:'../../imgs/bjt.png',
      success: function (res) {
        var shareTickets = res.shareTickets;
        wx.getShareInfo({
          shareTicket: shareTickets,
          success: function (res) {
            wx.request({
              url: 'https://m.app.shangquanpai.com/common/decrypt',
              data: {
                encryptedData: res.encryptedData,
                iv: res.iv,
                sessionKey: wx.getStorageSync('session_key')
              },
              method: 'POST',
              header: {
                'content-type': 'application/json'
              },
              success: function (res) {
                wx.request({
                  url: 'https://m.app.shangquanpai.com/api/qyGroupUser/join',
                  data: {
                    openGid: res.data.data.openGId
                  },
                  method: 'POST',
                  header: {
                    'content-type': 'application/json'
                  },
                  success: function (res) {
                    wx.request({
                      url: 'https://m.app.shangquanpai.com/api/qyGroup/my',
                      data: {
                      },
                      method: 'POST',
                      header: {
                        'content-type': 'application/json'
                      },
                      success: function (res) {
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
      fail: function (res) {

      }
    }
  },
  showControl:function(){
    var that = this;
    if (that.data.verSionStatus){
      return
    }
    wx.navigateTo({
      url: '../person/personInfo'
    })
  },
  showqyInfo: function (event) {
    var that = this;
    if (that.data.verSionStatus) {
      return
    }
    that.setData({
      showQyInfo: true,
      qyInfo:that.data.list[event.currentTarget.dataset.index]
    })
  },
  closeMask:function(){
    var that = this;
    that.setData({
      showQyInfo: false
    }) 
  },
  getList:function(){
    var that = this;
    wx.request({
      url: 'https://m.app.shangquanpai.com/api/qyGroup/members',
      data: {
        id:that.data.id
      },
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'accessToken': wx.getStorageSync('ACCESS_TOKEN')
      },
      success: function (res) {
        let arr = that.data.markers;
        if (res.data.data.length > 0){
          for (let v of res.data.data) {
            v.locationTime = util.formatTime(new Date(v.locationTime))
            if (v.location){
              arr.push({
                iconPath: "../../imgs/location.png",
                latitude: parseFloat(((v.location.split("#"))[0]).substring(0, 7)),
                longitude: parseFloat(((v.location.split("#"))[1]).substring(0, 7)),
                width: 50,
                height: 50
              })
            }
          }
        }
        
        that.setData({
          list: res.data.data,
          markers:arr
        })
      }
    }) 
  },
  goauth: function (e) {
    var that = this;
    if (e.detail.signature){
      that.setData({
        showAuth: false,
      })
    app.getMyDetail(function (list) {
      that.getList(); 
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
    //         // that.getList(); 
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
  onLoad: function (options) {
     var that = this; 
     that.setData({
       groupName: options.name,
       id: options.id,
       gid: options.gid
     })
     wx.getSetting({
       success(res) {
         if (!res.authSetting['scope.userInfo']) {
           that.setData({
             showAuth: true
           })
         } else {
           that.setData({
             showAuth: false
           })
           if (wx.getStorageSync('versionStatus') == 1) {
             that.setData({
               verSionStatus: true
             })
           } else {
             that.setData({
               verSionStatus: false
             })
             app.getMyDetail(function (list) {
               let obj = {
                  iconPath: "../../imgs/location.png",
                  latitude: 0,
                  longitude: 0,
                  width: 50,
                  height: 50
                }
               let arr = that.data.markers;
               if (wx.getStorageSync('address')){
                 obj.latitude = parseFloat(wx.getStorageSync('address').split("#")[0]);
                 obj.longitude = parseFloat(wx.getStorageSync('address').split("#")[1]);
                 arr.push(obj)
               } 
               that.setData({
                 userInfo: list,
                 markers:arr
               })

             })
            //  wx.request({
            //    url: 'https://m.app.shangquanpai.com/api/qyUser/detail',
            //    data: {
            //    },
            //    method: 'POST',
            //    header: {
            //      'content-type': 'application/json',
            //      'accessToken': wx.getStorageSync('ACCESS_TOKEN')
            //    },
            //    success: function (res) {
            //      let arr = that.data.markers
            //      if (res.data.data.location){
            //        arr.push({
            //          iconPath: "../../imgs/location.png",
            //          longitude: parseFloat(res.data.data.location.split("#")[1]),
            //          latitude: parseFloat(res.data.data.location.split("#")[0]),
            //          width: 50,
            //          height: 50
            //        })
            //      }
            //      that.setData({
            //        userInfo: res.data.data,
            //        longitude: parseFloat(res.data.data.location.split("#")[1]),
            //        latitude: parseFloat(res.data.data.location.split("#")[0]),
            //        markers: arr
            //      })
            //    }
            //  })
             that.getList();
           }
         }
       }
     })  
     
     wx.showShareMenu({
       withShareTicket: true
     });
    


    
    
  },
  onReady: function () {
    // 页面渲染完成
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  }
})