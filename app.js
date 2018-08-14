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

  /** 封装的request接口 */
  $http(parmas, hideLoading, hideBarLoading) {
		let that = this;
    // if (!hideLoading) {
    //   wx.showLoading({
    //     title: parmas.msg || '加载中',
    //     mask: true
    //   })
    // }
		if (!hideBarLoading) {
			wx.showNavigationBarLoading();
		}
    return new Promise((resolve, reject) => {
			wx.checkSession({
				success() {
					wx.request({
						url: 'https://m.app.shangquanpai.com/' + parmas.url,
						data: parmas.data,
						method: parmas.method || 'POST',
						header: {
							accessToken: wx.getStorageSync('ACCESS_TOKEN') || '',
							...parmas.header
						},
						success(res) {
							resolve(res.data);
						},
						fail(res) {
							reject(res.data);
						},
						complete() {
							// if (!hideLoading) {
							//   wx.hideLoading();
							// }
							if (!hideBarLoading) {
								wx.hideNavigationBarLoading();
							}
						}
					})
				},
				fail() {
					that.getAuth(() => {
						let _data = parmas.data;
						_data.sessionKey = wx.getStorageSync('session_key');
						wx.request({
							url: 'https://m.app.shangquanpai.com/' + parmas.url,
							data: _data,
							method: parmas.method || 'POST',
							header: {
								accessToken: wx.getStorageSync('ACCESS_TOKEN') || '',
								...parmas.header
							},
							success(res) {
								resolve(res.data);
							},
							fail(res) {
								reject(res.data);
							},
							complete() {
								// if (!hideLoading) {
								//   wx.hideLoading();
								// }
								if (!hideBarLoading) {
									wx.hideNavigationBarLoading();
								}
							}
						})
					})
				}
			})
    })
  },

  /** 查询当前登录态 */
  queryStatus(callBack) {
    if (wx.getStorageSync('ACCESS_TOKEN')) {
      callBack()
    } else {
      setTimeout(() => {
        this.queryStatus(callBack)
      }, 200);
    }
  },

  /** 登陆授权 */
  getAuth(callback) {
    wx.login({
      success: (res) => {
        getApp().$http({
          url: 'common/auth',
          data: {
            code: res.code
          }
        }, true).then(res => {
          if (res.code == 200) {
            wx.setStorageSync('openid', res.data.openid);
            wx.setStorageSync('session_key', res.data.session_key);
            wx.setStorageSync('ACCESS_TOKEN', res.data.ACCESS_TOKEN);
            wx.setStorageSync('headimgurl', res.data.qyUser.headimgurl);
            wx.setStorageSync('qyUser', JSON.stringify(res.data.qyUser));
						if(callback) {
							callback()
						}
          }
        }).catch(err => {
          console.log(err);
        })
      }
    })
  },

  /** 处理时间戳 */
  handleTimestamp(timestamp) {
    let time = timestamp ? new Date(timestamp) : new Date();
    let y = time.getFullYear();
    let m = time.getMonth() + 1;
    let d = time.getDate();
    let H = time.getHours();
    H = H <= 9 ? ('0' + H) : H;
    let M = time.getMinutes();
    M = M <= 9 ? ('0' + M) : M;
    let S = time.getSeconds();
    S = S <= 9 ? ('0' + S) : S;
    return (y + '/' + m + '/' + d + ' ' + H + ':' + M + ':' + S);
  },

	/** 判断是否是今天 */
	isToday(timestamp) {
		let today = this.handleTimestamp().split(' ');
		let time = this.handleTimestamp(timestamp).split(' ');
		return today[0] == time[0]
	},


  onLaunch: function(options) {
		console.log(this.handleTimestamp())
    this.getAuth();
  },

  onShow: function(options) {
    const that = this;
    console.log(options)
		if ((options.scene == 1044 || options.scene == 1007) && options.path == 'pages/home/home' ) {
			if (options.shareTicket) {
				let gid = null;
				wx.getShareInfo({
					shareTicket: options.shareTicket,
					success: function (res) {
						that.queryStatus(() => {
							that.$http({
								url: 'api/common/decrypt',
								data: {
									encryptedData: res.encryptedData,
									iv: res.iv,
								}
							}, true).then(res => {
								console.log('解密', res)
								if (res.code == 200) {
									gid = res.data.openGId
									that.$http({
										url: 'api/qyGroupUser/join',
										data: {
											openGId: gid,
											type: 1,
											shareUserId: +options.query.shareUserId
										}
									}, true).then(res => {
										console.log(res.data + '群友')
										if (res.code == 200) {
											if (res.data > 0) {
												// 群友页面
												wx.navigateTo({
													url: '/pages/group/group?groupId=' + res.data + '&openGid=' + gid,
												})

											} else if (res.data == -1) {
												wx.showToast({
													title: '群组已存在，您不在该群组中',
													icon: 'none',
													duration: 2000
												})
											} else if (res.data == -2) {
												wx.showToast({
													title: '好友尚未点击进入',
													icon: 'none',
													duration: 2000
												})
											} else if (res.data == -3) {
												wx.showToast({
													title: '好友已解除关联，请重新邀请',
													icon: 'none'
												})
											}
										}
									}).catch(err => {
										console.log(err);
									})
								}
							}).catch(err => {
								console.log(err);
							})

						})
					},
					fail: function (res) { }
				})
			} else {
				that.$http({
					url: 'api/qyGroupUser/join',
					data: {
						openGId: options.query.gid,
						type: 2,
						shareUserId: +options.query.shareUserId
					}
				}, true).then(res => {
					if (res.code == 200) {
						console.log(res.data + '好友')
						console.log(res.data == -2)
						if (res.data > 0) {
							// 好友页面
							wx.navigateTo({
								url: '/pages/friend/friend?groupId=' + res.data,
							})
						} else if (res.data == -1) {
							wx.showToast({
								title: '群组已存在，您不在该群组中',
								icon: 'none'
							})
						} else if (res.data == -2) {
							wx.showToast({
								title: '好友尚未点击进入',
								icon: 'none'
							})
						} else if (res.data == -3) {
							wx.showToast({
								title: '好友已解除关联，请重新邀请',
								icon: 'none'
							})
						}
					}
				}).catch(err => {
					console.log(err);
				})
			}
		} else {
			console.log('走这里了')
		}
  },
  globalData: {
    list: []
  }
})