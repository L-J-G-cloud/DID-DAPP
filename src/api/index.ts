import {request} from '../utils/axios'

// 获取签名数据
export function getSignData() {
    return request({
      url: '/user/login/getSignData',
      method: 'post',
    })
}


// 登录
export function login(data:object) {
    return request({
      url: '/user/login/login',
      method: 'post',
      data,
    })
}

// 判断是否注册
export function isRegister(data:object) {
  return request({
    url: '/user/login/isRegister',
    method: 'post',
    data,
  })
}

/----- DID start -----/

//获取用户余额及节点锁仓did信息
export function getUserBalance(data?:object) {
  return request({
    url: '/asset/asset/getUserBalance',
    method: 'post',
    data,
  })
}

//获取用户流水
export function getRecordList(data:object) {
  return request({
    url: '/asset/asset/getRecordList',
    method: 'post',
    data,
  })
}

//获取直推列表
export function getDirectRecommendationUserList(data:object) {
  return request({
    url: '/user/user/getDirectRecommendationUserList',
    method: 'post',
    data,
  })
}

//获取用户信息
export function getUserData(data?:object) {
  return request({
    url: '/user/user/getUserData',
    method: 'post',
    data,
  })
}


//购买算力
export function buyDIDPower(data:object) {
  return request({
    url: '/power/power/buyPower',
    method: 'post',
    data,
  })
}


//算力入金记录
export function powerList(data:object) {
  return request({
    url: '/power/power/powerList',
    method: 'post',
    data,
  })
}


//身份铸造记录
export function buyPowerRecord(data:object) {
  return request({
    url: '/scan/data/buyPowerRecord',
    method: 'post',
    data,
  })
}

//兑换码兑换
export function exchange(data:object) {
  return request({
    url: '/power/exchange/exchange',
    method: 'post',
    data,
  })
}

//兑换码兑换记录
export function exchangeList(data:object) {
  return request({
    url: '/power/exchange/exchangeList',
    method: 'post',
    data,
  })
}

//算力明细
export function powerDetail(data?:object) {
  return request({
    url: '/power/data/powerDetail',
    method: 'post',
    data,
  })
}

// 提现
export function withdrawal(data:object) {
  return request({
    url: '/asset/asset/withdrawal',
    method: 'post',
    data,
  })
}

export function getFee(data?:object) {
  return request({
    url: '/asset/asset/getFee',
    method: 'post',
    data,
  })
}


// 我的邀请记录
export function myInviteDetail(data?:object) {
  return request({
    url: '/user/user/myInviteDetail',
    method: 'post',
    params:data,
  })
}

/----- DID end -----/


// 质押赎回
export function withdraw(data:object) {
  return request({
    url: '/business/withdraw',
    method: 'post',
    data,
  })
}

// 质押记录
export function getDepositList(data:object) {
  return request({
    url: '/deposit/deposit/getDepositList',
    method: 'post',
    data,
  })
}

// 获取合约地址
export function getSystemConfig() {
  return request({
    url: '/system/system/getSystemConfig',
    method: 'post'
  })
}


// 抵押
export function deposit(data:object) {
  return request({
    url: '/deposit/deposit/deposit',
    method: 'post',
    data,
  })
}

// 获取抵押类型
export function getDepositConfig(data:object) {
  return request({
    url: '/asset/getDepositConfig',
    method: 'post',
    data,
  })
}


// // 获取用户流水记录
// export function getRecordList(data:object) {
//   return request({
//     url: '/asset/getRecordList',
//     method: 'post',
//     data,
//   })
// }

// // 获取用户余额
// export function getUserBalance() {
//   return request({
//     url: '/asset/getUserBalance',
//     method: 'post'
//   })
// }

// // 提现
// export function withdrawal(data:object) {
//   return request({
//     url: '/asset/withdrawal',
//     method: 'post',
//     data,
//   })
// }

// 获取用户信息
// export function getUserData() {
//   return request({
//     url: '/user/getUserData',
//     method: 'post'
//   })
// }

// 注册
export function register(data:object) {
  return request({
    url: '/user/login/register',
    method: 'post',
    data,
  })
}

// // 我的邀请记录
// export function getDirectRecommendationUserList(data:object) {
//   return request({
//     url: '/user/user/getDirectRecommendationUserList',
//     method: 'post',
//     data,
//   })
// }

// // 我的邀请记录列表
// export function getDirectRecommendationUserList(data:object) {
//   return request({
//     url: '/user/getDirectRecommendationUserList',
//     method: 'post',
//     data,
//   })
// }

// 获取节点超级节点推广记录
export function incomeRecord(data:object) {
  return request({
    url: '/user/incomeRecord',
    method: 'post',
    data,
  })
}

// 获取节点超级节点列表
export function setSuperNodeList(data:object) {
  return request({
    url: '/super/super/setSuperNodeList',
    method: 'post',
    data,
  })
}

// 设置超级节点
export function setSuperNode(data:object) {
  return request({
    url: '/super/super/setSuperNode',
    method: 'post',
    data,
  })
}



// 设置超级节点
export function delSuperNode(data:object) {
  return request({
    url: '/super/super/delSuperNode',
    method: 'post',
    data,
  })
}


// 获取系统维修状态
export function getSystemStatus(data?:object) {
  return request({
    url: '/system/system/systemStatus',
    method: 'post',
    data
  })
}


// 获取用户抵押
export function getDepositData() {
  return request({
    url: '/deposit/deposit/getDepositData',
    method: 'post'
  })
}

// 是否在黑名单
export function isBlackList() {
  return request({
    url: '/asset/isBlackList',
    method: 'post'
  })
}

// 销毁池信息
export function destroyData() {
  return request({
    url: '/asset/destroyData',
    method: 'post'
  })
}


// 释放提现-选择销毁配置
export function withdrawReleaseConfig() {
  return request({
    url: '/asset/withdrawReleaseConfig',
    method: 'post'
  })
}

// 已释放提现
export function withdrawalReleased(data:object) {
  return request({
    url: '/asset/withdrawalReleased',
    method: 'post',
    data
  })
}

// 释放提现
export function withdrawalRelease(data:object) {
  return request({
    url: '/asset/withdrawalRelease',
    method: 'post',
    data
  })
}



// 待释放余额明细
export function waitReleaseList(data:object) {
  return request({
    url: '/asset/waitReleaseList',
    method: 'post',
    data
  })
}


// 购买记录
export function buyNodeRecord(data:object) {
  return request({
    url: '/user/buyNodeRecord',
    method: 'get',
    params:data
  })
}

// 已购买数量
export function buyNodeNum(data:object) {
  return request({
    url: '/user/buyNodeNum',
    method: 'get',
    params:data
  })
}

// 获取免费名额
export function getFreeNum() {
  return request({
    url: '/user/getFreeNum',
    method: 'post'
  })
}

// 报名
export function signUp(data:object) {
  return request({
    url: '/user/signUp',
    method: 'post',
    data
  })
}

// 报名记录
export function signUpRecord(data:object) {
  return request({
    url: '/user/signUpRecord',
    method: 'post',
    data
  })
}


// 购买节点
export function buyNode(data:object) {
  return request({
    url: '/node/buyNode',
    method: 'post',
    data
  })
}

// 获取节点列表
export function getNodeList(data?:object) {
  return request({
    url: '/node/getBuyNodeRecord',
    method: 'post',
    data
  })
}


// 42Force时光机统计
export function getSystemStatics(params?:object) {
  return request({
    url: '/system/getSystemStatics',
    method: 'get',
    params
  })
}

// 获取节点数据
export function getNodeData() {
  return request({
    url: '/system/getNodeData',
    method: 'get',
  })
}

// 获取超级节点和超级社区的余额
export function getSystemAddressBalance() {
  return request({
    url: '/system/getSystemAddressBalance',
    method: 'post',
  })
}


// 系统在维护，白名单
export function getAddressWhiteList(data:object) {
  return request({
    url: '/system/system/addressWhiteList',
    method: 'post',
    data
  })
}


// 经济建设生态池
export function ecosystemDevelopmentList(data:object) {
  return request({
    url: '/asset/ecosystemDevelopmentList',
    method: 'post',
    data
  })
}

// 获取用户火星计划数据
export function sparkStatics(data:object) {
  return request({
    url: '/node/sparkStatics',
    method: 'post',
    data
  })
}

// 获取质押详情
export function businessDetail(data?:object) {
  return request({
    url: '/business/businessDEtail',
    method: 'post',
    data
  })
}

// 获取质押列表
export function depositList(data?:object) {
  return request({
    url: '/business/depositList',
    method: 'post',
    data
  })
}


// 库存节点
export function getNodeInventory(data?:object) {
  return request({
    url: '/business/nodeInventory',
    method: 'post',
    data
  })
}




// 节点转送记录
export function nodeTransferRecord(data?:object) {
  return request({
    url: '/business/nodeTransferRecord',
    method: 'post',
    data
  })
}

// 节点开启
export function openNode(data?:object) {
  return request({
    url: '/business/openNode',
    method: 'post',
    data
  })
}


// 获取节点转送记录
export function transferNode(data?:object) {
  return request({
    url: '/business/transferNode',
    method: 'post',
    data
  })
}

// 质押中心接口
export function businessDeposit(data?:object) {
  return request({
    url: '/business/businessDeposit',
    method: 'post',
    data
  })
}


// 销毁记录
export function deadRecord(data?:object) {
  return request({
    url: '/badge/deadRecord',
    method: 'post',
    data
  })
}

// 合成大洲社区地球社区
export function conflate(data?:object) {
  return request({
    url: '/badge/conflate',
    method: 'post',
    data
  })
}

// 徽章详情
export function badgeDetail(data?:object) {
  return request({
    url: '/badge/badgeDetail',
    method: 'post',
    data
  })
}

// 徽章列表
export function badgeList(data?:object) {
  return request({
    url: '/badge/badgeList',
    method: 'post',
    data
  })
}

// 购买徽章
export function buyBadge(data?:object) {
  return request({
    url: '/badge/buyBadge',
    method: 'post',
    data
  })
}

// 转赠徽章
export function transferBadge(data?:object) {
  return request({
    url: '/badge/transferBadge',
    method: 'post',
    data
  })
}

// 转赠记录
export function badgeTransferRecord(data?:object) {
  return request({
    url: '/badge/badgeTransferRecord',
    method: 'post',
    data
  })
}

// 超级节点详情
export function superNodeDetail(data?:object) {
  return request({
    url: '/badge/superNodeDetail',
    method: 'post',
    data
  })
}

// 购买超级节点列表
export function buySuperNodeList(data?:object) {
  return request({
    url: '/badge/buySuperNodeList',
    method: 'post',
    data
  })
}

// 购买超级节点
export function buySuperNode(data?:object) {
  return request({
    url: '/badge/buySuperNode',
    method: 'post',
    data
  })
}