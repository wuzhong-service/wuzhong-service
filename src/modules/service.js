/**
 * 服务综合入口模块
 * 直播专区、分档解读、应急订单的统一入口
 */

import { navigate } from '../router.js'
import { getLiveBroadcasts, getClassifications, getEmergencyOrders, getSettings } from '../data-service.js'

/**
 * 渲染服务入口页面
 * @param {Object} data
 */
export function renderService(data) {
  const app = document.getElementById('app')
  const broadcasts = data.liveBroadcasts || []
  const classifications = data.classifications || []
  const emergencies = data.emergencyOrders || []

  // 统计各模块数量
  const activeBroadcasts = broadcasts.filter(b => b.状态 === '即将开始' || b.状态 === '直播中').length
  const activeEmergencies = emergencies.filter(e => e.当前状态 === '进行中' || e.当前状态 === '待开始').length

  app.innerHTML = `
    <!-- 顶部标题 -->
    <div class="header">
      <div class="header-back" onclick="navigate('home')">← 返回</div>
      <div class="header-title">📋 客户服务</div>
    </div>

    <div class="page active">
      <!-- 演示提示 -->
      <div class="notice-bar">
        ⚠️ 以下内容仅为系统演示，不代表实际业务安排。
      </div>

      <!-- 直播专区 -->
      <div class="service-card" onclick="navigate('broadcast')">
        <div class="service-card-icon">📺</div>
        <div class="service-card-info">
          <div class="service-card-title">直播专区
            ${activeBroadcasts > 0 ? `<span class="badge">${activeBroadcasts}场待播</span>` : ''}
          </div>
          <div class="service-card-desc">每周四直播安排、回看入口</div>
        </div>
        <span style="color: #999;">›</span>
      </div>

      <!-- 分档解读 -->
      <div class="service-card" onclick="navigate('classification')">
        <div class="service-card-icon">📋</div>
        <div class="service-card-info">
          <div class="service-card-title">分档制度解读</div>
          <div class="service-card-desc">通俗解释卷烟零售客户分档规则</div>
        </div>
        <span style="color: #999;">›</span>
      </div>

      <!-- 应急订单 -->
      <div class="service-card" onclick="navigate('emergency')">
        <div class="service-card-icon">⚡</div>
        <div class="service-card-info">
          <div class="service-card-title">应急订单
            ${activeEmergencies > 0 ? `<span class="badge">${activeEmergencies}个进行中</span>` : ''}
          </div>
          <div class="service-card-desc">应急订单安排、支付截止提醒</div>
        </div>
        <span style="color: #999;">›</span>
      </div>

      <div class="footer-notice">
        <p>本页面仅面向持证卷烟零售客户提供业务信息查询和服务提醒</p>
        <p>具体业务安排以正式通知为准</p>
      </div>
    </div>
  `
}
