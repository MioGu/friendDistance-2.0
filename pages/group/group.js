// pages/group/group.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
		userId: '',
		updateTime: '',
		headimgurl: '',
		nickname: '',
		device: '',
		locationAddress: '',
		groupId: '',
		memberList: [],
		markers: [],
		isShowMap: false,
		showQyInfo: false,
		qyInfo: {},
		gender: '',
		showLocationAuth: true,
		shareTitle: '',
		shareImg: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
	onLoad: function (options) {
		if(options.groupId) {
			this.setData({
				groupId: options.groupId,
				openGid: options.openGid
			})
		}
		getApp().queryStatus(() => {
			let qyUser = JSON.parse(wx.getStorageSync('qyUser'));
			let _timeArr = getApp().handleTimestamp(qyUser.updateTime).split(' ')[0].split('/');
			let _data = {
				gender: qyUser.gender,
				userId: qyUser.id,
				headimgurl: qyUser.headimgurl,
				nickname: qyUser.nickname,
				device: qyUser.phoneModel,
				updateTime: _timeArr[1] + '月' + _timeArr[2] + '日'
			}
			this.setData(_data);

			this.getMemberList();
			this.getLocationAuth();
			this.getShareInfo();
		})

		wx.showShareMenu({
			withShareTicket: true
		})
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
	onShow: function () {
		getApp().queryStatus(() => {
			// this.getLocationAuth();
			// this.getMemberList();
		})
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
	onShareAppMessage: function () {
		let gid = Date.parse(new Date()) + parseInt(Math.random() * 20000000000);
		return {
			title: this.data.shareTitle,
			path: 'pages/home/home?shareUserId=' + this.data.userId + '&gid=' + gid,
			imageUrl: this.data.shareImg
		}
	},

	/** 获取分享标题和图片 */
	getShareInfo() {
		getApp().$http({
			url: 'common/shareInfo'
		}).then(res => {
			if (res.code == 200) {
				this.setData({
					shareTitle: res.data.title,
					shareImg: res.data.img
				})
			}
		}).catch(err => {
			console.log(err);
		})
	},

	showqyInfo: function (event) {
		var that = this;
		if (that.data.verSionStatus) {
			return
		}
		that.setData({
			showQyInfo: true,
			qyInfo: that.data.memberList[event.currentTarget.dataset.index]
		})
	},
	closeMask: function () {
		var that = this;
		that.setData({
			showQyInfo: false
		})
	},

	/** 回到首页 */
	goHomePage() {
		wx.reLaunch({
			url: '/pages/home/home',
		})
	},
	/** 更新用户信息 */
	updateUserInfo(e) {
		if (e.detail.encryptedData) {
			let that = this;
			wx.getSystemInfo({
				success: function (ret) {
					getApp().$http({
						url: 'api/qyUser/update',
						data: {
							phoneBrand: ret.brand,
							phoneModel: ret.model
						}
					}).then(res=>{
						console.log(res)
						if(res.code==200) {
							that.setData({
								device: ret.model
							})
						}
					}).catch(err=>{
						console.log(err);
					})
				}
			})
			getApp().$http({
				url: 'api/qyUser/updateWxInfo',
				data: {
					encryptedData: e.detail.encryptedData,
					iv: e.detail.iv,
					session_key: wx.getStorageSync('session_key')
				}
			}).then(res => {
				if (res.code == 200) {
					console.log(res)
					wx.setStorageSync("headimgurl", res.data.headimgurl);
					wx.setStorageSync('qyUser', JSON.stringify(res.data));
					let _timeArr = getApp().handleTimestamp(res.data.updateTime).split(' ')[0].split('/');
					this.setData({
						headimgurl: res.data.headimgurl,
						nickname: res.data.nickname,
						updateTime: _timeArr[1] + '月' + _timeArr[2] + '日'
					})
				}
			}).catch(err => {
				console.log(err);
			})
		}
	},
	/** 获取地理位置授权 */
	getLocationAuth() {
		let that = this;
		wx.getSetting({
			success(res) {
				if (!res.authSetting["scope.userLocation"]) {
					// 未获得对应权限
					wx.authorize({
						scope: "scope.userLocation",
						success(res) {
							that.getAddress();
						},
						fail(res) {
							console.log(res);
							wx.showToast({
								icon: "none",
								title: "无法获得您的位置"
							});
						}
					});
				} else {
					that.getAddress();
				}
			}
		})
	},
	/** 重新获取位置权限 */
	openLocationAuth(e) {
		console.log(e)
		let that = this;
		if (!e.detail.authSetting["scope.userLocation"]) {
			wx.showToast({
				icon: "none",
				title: "无法获得您的位置"
			});
		} else {
			that.getAddress();
		}
	},
	/** 获取具体地址 */
	getAddress() {
		let that = this;
		that.setData({
			showLocationAuth: false
		})
		wx.getLocation({
			type: 'gcj02',
			success: function (res) {
				let markersArr = that.data.markers;
				markersArr.push({
					iconPath: '../../imgs/location.png',
					latitude: parseFloat(res.latitude),
					longitude: parseFloat(res.longitude),
					width: 50,
					height: 50
				})
				that.setData({
					markers: markersArr
				})
				getApp().$http({
					msg: '正在定位...',
					url: 'api/qyUser/location',
					data: {
						location: res.latitude + '#' + res.longitude
					}
				}).then(res => {
					if (res.code == 200) {
						that.setData({
							locationAddress: res.data
						})
					}
				}).catch(err => {
					console.log(err);
				})
			},
		})
	},
	/** 获取当前群成员 */
	getMemberList() {
		getApp().$http({
			url: 'api/qyGroup/members',
			data: {
				id: this.data.groupId
			}
		}).then(res=>{
			if(res.code==200) {
				console.log(this.data.markers);
				let _memberList = res.data;
				let markersArr = [];
				_memberList.forEach((val, index)=>{
					let _timeArr = getApp().handleTimestamp(val.updateTime).split(' ')[0].split('/');
					let _hoursArr = getApp().handleTimestamp(val.updateTime).split(' ')[1].split(':');
					val.updateTime = !getApp().isToday(val.updateTime) ? (_timeArr[1] + '月' + _timeArr[2] + '日') : (_hoursArr[0] + ':' + _hoursArr[1]) ;
					markersArr.push({
						iconPath: '../../imgs/location.png',
						latitude: val.location ? parseFloat(((val.location.split("#"))[0])) : '' ,
						longitude: val.location ? parseFloat(((val.location.split("#"))[1])) : '' ,
						width: 50,
						height: 50
					})
				})
				let _markers = markersArr.concat(this.data.markers);
				this.setData({
					memberList: _memberList,
					markers: _markers
				})
			}
		}).catch(err=>{
			console.log(err);
		})
	},
	/** 地图组件的展示隐藏 */
	showMap() {
		console.log(this.data.markers)
		getApp().$http({
			url: 'api/qyUser/detail'
		}).then(res=>{
			if(res.code==200) {
				if (res.data.locationStatus==2) {
					wx.showToast({
						title: '请先开启位置显示',
						icon: 'none'
					})
				} else {
					this.setData({
						isShowMap: true
					})
				}
			}
		})
	},
	closeMap() {
		this.setData({
			isShowMap: false
		})
	},
	/** 进入个人信息页面 */
	goSetting() {
		wx.navigateTo({
			url: '/pages/person/personInfo',
		})
	},
	/** 解除关联 */
	exitGroup() {
		let that = this;
		wx.showModal({
			title: '提示',
			content: '确认与当前群组解除关联',
			success: function (res) {
				if (res.confirm) {
					getApp().$http({
						url: 'api/qyGroupUser/exit',
						data: {
							id: that.data.groupId
						}
					}).then(res => {
						console.log(res)
						if (res.code == 200) {
							wx.showToast({
								title: '操作成功',
								icon: 'none'
							})
							setTimeout(() => {
								wx.reLaunch({
									url: '/pages/home/home',
								})
							}, 1500)
						}
					}).catch(err => {
						console.log(err);
					})

				} else if (res.cancel) {
					console.log('xxx')
				}
			}
		})
	}
})