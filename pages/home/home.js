// pages/home/home.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
		type: 0,  //0：全部；1：群；2：好友
		pageSize: 20,
		pageNum: 1,
		headimgurl: '',
		dataList: [],
		nickname: '',
		locationAddress: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		let qyUser = JSON.parse(wx.getStorageSync('qyUser'));
		let _data = {
			headimgurl: qyUser.headimgurl,
			nickname: qyUser.nickname
		}
		this.setData(_data);
		getApp().queryStatus(()=>{
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
					msg: '定位中...',
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
	},
	/** 获取列表数据 */
	getGroupList() {
		getApp().$http({
			url: 'api/qyGroup/my',
			data: {
				pageNum: this.pageNum,
				pageSize: this.pageSize,
				type: this.type
			}
		}).then(res=>{
			console.log(res);
			if(res.code==200) {
				this.setData({
					dataList: res.data.dataList
				})
			}
		}).catch(err=>{
			console.log(err);
		})
	}

})