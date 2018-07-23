Page({
  data:{
    userInfo:{},
    itype:'',
    showMask:false,
    txtTitle:'',
    inputType:'text',
    keyword:''
  },
  bindKeyInput:function(e){
    var that = this;
    that.setData({
      keyword: e.detail.value
    })
   
  },
  submitEvent:function(key,val){
    var that = this;
    var param= null;
    switch (key) {
      case 'realName':
        param = {
          realName:val
        }
        break;
      case 'phone':
        param = {
          phone: val
        }
        break;
      case 'homeAddress':
        param = {
          homeAddress: val
        }
        break;
      case 'company':
        param = {
          company: val
        }
        break;
      case 'birthday':
        param = {
          birthday: val
        }
        break;  
      case 'jobs':
        param = {
          jobs: val
        }
        break;
      case 'companyAddress':
        param = {
          companyAddress: val
        }
        break;
      case 'email':
        param = {
          email: val
        }
        break;
      case 'introduce':
        param = {
          introduce: val
        }
        break;  
      default:
        break;
    }
    wx.request({
      url: 'https://m.app.shangquanpai.com/api/qyUser/update',
      data: param,
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'accessToken': wx.getStorageSync('ACCESS_TOKEN')
      },
      success: function (res) {
        that.setData({
          showMask: false,
          keyword: ''
        })
        that.getDefaultInfo();
      }
    }) 
  },
  confirm:function(){
    var that = this;
    switch (that.data.itype) {
      case 'headImg':
        break;
      case 'nickname':
        break;
      case 'realName':
        that.submitEvent(that.data.itype, that.data.keyword)
        break;
      case 'phone':
        that.submitEvent(that.data.itype, that.data.keyword)
        break;
      case 'birthday':
        that.submitEvent(that.data.itype, that.data.keyword)
        break;
      case 'homeAddress':
        that.submitEvent(that.data.itype, that.data.keyword)
        break;
      case 'company':
        that.submitEvent(that.data.itype, that.data.keyword)
        break;
      case 'jobs':
        that.submitEvent(that.data.itype, that.data.keyword)
        break;
      case 'companyAddress':
        that.submitEvent(that.data.itype, that.data.keyword)
        break;
      case 'email':
        that.submitEvent(that.data.itype, that.data.keyword)
        break;
      case 'introduce':
        that.submitEvent(that.data.itype, that.data.keyword)
        break;
      default:
        break;
    }
  },
  getDefaultInfo:function(){
     var that = this; 
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
          userInfo:res.data.data
         }) 
       }
     })  
  },
  updata:function(event){
    var that = this;
    that.setData({
      itype :event.currentTarget.dataset.name,
    })
    switch (that.data.itype) {
      case 'headImg':
        that.setData({
          showMask: false
        })
         wx.showToast({
            title: '暂不支持修改头像',
            icon: 'none',
            duration: 2000
          })
        break;
      case 'nickname':
        that.setData({
          showMask: false
        }) 
         wx.showToast({
            title: '暂不支持修改昵称',
            icon: 'none',
            duration: 2000
          })
        break;
      case 'realName':
        that.setData({
          txtTitle:'姓名',
          showMask: true,
          inputType: 'text'
        })
        break;
      case 'phone':
        that.setData({
          txtTitle: '手机',
          showMask: true,
          inputType:'number'
        })
        break;   
      case 'birthday':
        that.setData({
          txtTitle: '生日',
          showMask: true,
          inputType: 'text'
        })
        break;
      case 'homeAddress':
        that.setData({
          txtTitle: '家乡',
          showMask: true,
          inputType: 'text'
        })
        break;   
      case 'company':
        that.setData({
          txtTitle: '公司',
          showMask: true
        })
        break;
      case 'jobs':
        that.setData({
          txtTitle: '职位',
          showMask: true,
          inputType: 'text'
        })
        break; 
      case 'companyAddress':
        that.setData({
          txtTitle: '地址',
          showMask: true,
          inputType: 'text'
        }) 
        break; 
      case 'email':
        that.setData({
          txtTitle: '邮箱',
          showMask: true,
          inputType: 'text'
        })
        break;
      case 'introduce':
        that.setData({
          txtTitle: '简介',
          showMask: true
        }) 
        break;                            
      default:
        break;
    }
   
  },
  closeMask:function(){
    var that = this;
    that.setData({
      showMask: false,
      keyword: ''
    })
  },
  onLoad:function(options){
    var that = this;
    that.getDefaultInfo();
    
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})