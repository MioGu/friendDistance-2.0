// pages/home/home.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
		type: 0,  //0：全部；1：群友；2：好友
		pageSize: 20,
		pageNum: 1,
		headimgurl: '',
		dataList: [],
		nickname: '',
		locationAddress: '',
		allLoaded: false,
		dataLoading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		getApp().queryStatus(() => {
			let qyUser = JSON.parse(wx.getStorageSync('qyUser'));
			let _data = {
				headimgurl: qyUser.headimgurl,
				nickname: qyUser.nickname
			}
			this.setData(_data);
			this.getGroupList();
		})
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
		getApp().queryStatus(() => {
			this.getLocationAuth();
		})
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
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
		if (!this.data.allLoaded && !this.data.dataLoading) {
			this.setData({
				pageNum: this.data.pageNum++
			})
			this.getGroupList();
		}
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
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
		wx.getLocation({
			type: 'gcj02',
			success: function(res) {
				getApp().$http({
					msg: '正在定位...',
					url: 'api/qyUser/location',
					data: {
						locationStatus: 1,
						location: res.latitude + '#' + res.longitude
					}
				}).then(res=>{
					if(res.code==200) {
						that.setData({
							locationAddress: res.data
						})
					}
				}).catch(err=>{
					console.log(err);
				})
			},
		})
	},
	/** 更新用户信息 */
	updateUserInfo(e) {
		if (e.detail.encryptedData) {
			getApp().$http({
				url: 'api/qyUser/updateWxInfo',
				data: {
					encryptedData: e.detail.encryptedData,
					iv: e.detail.iv,
					session_key: wx.getStorageSync('session_key')
				}
			}).then(res=>{
				if(res.code==200) {
					console.log(res)
					wx.setStorageSync("headimgurl", res.data.headimgurl);
					wx.setStorageSync('qyUser', JSON.stringify(res.data));
					this.setData({
						headimgurl: res.data.headimgurl,
						nickname: res.data.nickname
					})
				}
			}).catch(err=>{
				console.log(err);
			})
		}
	},
	/** 获取列表数据 */
	getGroupList() {
		this.setData({
			dataLoading: true
		})
		getApp().$http({
			url: 'api/qyGroup/my',
			data: {
				pageNum: this.data.pageNum,
				pageSize: this.data.pageSize,
				type: this.data.type
			}
		}).then(res=>{
			if(res.code==200) {
				let _dataList = res.data.dataList;
				_dataList.forEach((val, index)=>{
					let time = new Date(val.createTime);
					let y = time.getFullYear();
					let m = time.getMonth() + 1;
					let d = time.getDate();
					let H = time.getHours();
					let M = time.getMinutes();
					let S = time.getSeconds();
					val.createTime = y + '/' + m + '/' +d + ' ' + H + ':' + M + ':' + S;
				})

				// 判断当前为最后一页
				if (res.data.dataList.length < this.data.pageSize) {
					this.setData({
						allLoaded: true
					})
				}

				this.setData({
					dataList: this.data.dataList.concat(_dataList),
					dataLoading: false
				})
			}
		}).catch(err=>{
			console.log(err);
		})
	},

	/** actionsheet组件相关 */
	openActionsheet() {
		let that = this;
		wx.showActionSheet({
			itemList: ['全部', '群友', '好友'],
			success: function (res) {
				if (!res.cancel) {
					console.log(res.tapIndex);
					that.toggleType(res.tapIndex);
				}
			}
		});
	},
	/** 切换数据种类 */
	toggleType(tapIndex) {
		this.setData({
			//TODO
			type: tapIndex,
			pageNum: 1,
			dataList: []
		})

		this.getGroupList();
	}
})