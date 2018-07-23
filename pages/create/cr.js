Page({
  data: {
    keyword:''
  },

  onLoad: function (options) {
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  bindKeyInput:function(e){
    var that = this;
    that.setData({
      keyword: e.detail.value
    })
  },
  createGroup:function(){
    var that = this;
    if (that.data.keyword == ''){
      wx.showToast({
        title: '群名称不为空',
        icon: 'none',
        duration: 2000
      })
      return
    }
    wx.request({
      url: 'https://m.app.shangquanpai.com/api/qyGroup/add',
      data: {
        nickname: that.data.keyword
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

  }
})