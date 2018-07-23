//app.js
App({

  getIndexPageList: function(cb) {
    var that = this;
    var loocationState = null;
    wx.login({
      success: function(res) {
        var code = res.code;
        wx.getUserInfo({
          success: function(data) {
            var iv = data.iv;
            var encryptedData = data.encryptedData;
            wx.request({
              url: 'https://m.app.shangquanpai.com/common/auth',
              data: {
                code: code,
                iv: iv,
                encryptedData: encryptedData,
                versionCode: "1.0.6"
              },
              method: 'POST',
              header: {
                'content-type': 'application/json' // 默认值
              },
              success: function(res) {
                // if (res.data.data.versionStatus == 1){
                //   wx.reLaunch({
                //     url: '../qunyou/qy?id=0' + '&name=暂无名称' 
                //   })
                // }
                wx.setStorageSync('versionStatus', res.data.data.versionStatus);
                wx.setStorageSync('session_key', res.data.data.session_key);
                wx.setStorageSync('ACCESS_TOKEN', res.data.data.ACCESS_TOKEN);
                loocationState = res.data.data.locationStatus;
                wx.request({
                  url: 'https://m.app.shangquanpai.com/api/qyGroup/my',
                  data: {},
                  method: 'POST',
                  header: {
                    'content-type': 'application/json',
                    'accessToken': wx.getStorageSync('ACCESS_TOKEN')
                  },
                  success: function(res) {
                    if (res.data.data && res.data.data.dataList && res.data.data.dataList.length > 0) {
                      that.globalData.list = res.data.data.dataList;
                    } else {
                      that.globalData.list = [];
                    }
                    typeof cb == "function" && cb(that.globalData.list)

                  }
                })
                if (loocationState == 1) {
                  wx.getLocation({
                    type: 'wgs84',
                    success: function(res) {
                      var latitude = res.latitude
                      var longitude = res.longitude
                      wx.setStorageSync('address', latitude + '#' + longitude);
                      wx.request({
                        url: 'https://m.app.shangquanpai.com/api/qyUser/location',
                        data: {
                          location: latitude + '#' + longitude,
                          locationStatus: 1
                        },
                        method: 'POST',
                        header: {
                          'content-type': 'application/json',
                          'accessToken': wx.getStorageSync('ACCESS_TOKEN')
                        },
                        success: function(res) {

                        }
                      })
                    },
                    fail: function(res) {

                    }
                  })
                }
                wx.getSystemInfo({
                  success: function(res) {
                    wx.request({
                      url: 'https://m.app.shangquanpai.com/api/qyUser/update',
                      data: {
                        phoneBrand: res.brand,
                        phoneModel: res.model
                      },
                      method: 'POST',
                      header: {
                        'content-type': 'application/json',
                        'accessToken': wx.getStorageSync('ACCESS_TOKEN')
                      },
                      success: function(res) {}
                    })
                  }
                })

              }
            })
          }
        })
      }
    })
  },

  getMyDetail: function(cb) {
    var that = this;
    that.getIndexPageList()
    setTimeout(function() {
      wx.request({
        url: 'https://m.app.shangquanpai.com/api/qyUser/detail',
        data: {},
        method: 'POST',
        header: {
          'content-type': 'application/json',
          'accessToken': wx.getStorageSync('ACCESS_TOKEN')
        },
        success: function(res) {
          typeof cb == "function" && cb(res.data.data)
        }
      })
    }, 500)
  },

	$http(parmas) {
		return new Promise((resolve, reject) => {
			wx.request({
				url: 'https://m.app.shangquanpai.com/' + parmas.url,
				data: parmas.data,
				method: parmas.method || 'POST',
				header: parmas.header,
				success(res) {
					resolve(res.data);
				},
				fail(res) {
					reject(res.data);
				}
			})
		})
	},

  onLaunch: function(options) {},

  onShow: function(options) {
    var that = this;
    if (options.shareTicket) {
      var gid = null;
      wx.getShareInfo({
        shareTicket: options.shareTicket,
        success: function(res) {
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
            success: function(res) {
              gid = res.data.data.openGId;
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
                success: function(res) {
                  wx.reLaunch({
                    url: '../qunyou/qy?id=' + res.data.data + '&name=未命名群聊' + '&gid=' + gid
                  })

                }
              })
            }
          })
        },
        fail: function(res) {}
      })
    }
  },
  globalData: {
    list: []
  }
})