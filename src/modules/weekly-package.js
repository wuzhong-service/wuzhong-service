/**
 * 标签活动模块
 * 每个组（组1~组5）作为独立活动，从上到下展示
 * 每个活动内分 活动品规（蓝底）和 激励品规（白底）
 */

import { escapeHtml } from '../utils.js'
import { getTierRanges, getPackagesByTier } from '../data-service.js'
import { navigate } from '../router.js'

let selectedTier = ''

export function renderPackage(data) {
  const app = document.getElementById('app')
  const tiers = getTierRanges()
  if (!selectedTier && tiers.length > 0) {
    selectedTier = tiers[0].key
  }
  renderPackageContent(app, tiers)
}

function renderPackageContent(app, tiers) {
  const products = getPackagesByTier(selectedTier)

  // 按 品牌组 分组（每个组是一个独立活动）
  const groupOrder = ['组1', '组2', '组3', '组4', '组5', '上烟集团', '云南中烟', '福建中烟']
  const groups = [...new Set(products.map(p => p.品牌组).filter(Boolean))]
  groups.sort((a, b) => {
    const ia = groupOrder.indexOf(a)
    const ib = groupOrder.indexOf(b)
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
  })

  app.innerHTML = `
    <div class="header">
      <div class="header-back" onclick="navigate('home')">← 返回</div>
      <div class="header-title">📦 标签活动</div>
    </div>

    <div class="page active">
      <div class="notice-bar">
        ⚠️ 以下内容仅为系统演示，不代表实际业务安排。
      </div>

      <!-- 档位选择 -->
      <div class="card" style="padding: 14px;">
        <div style="font-size: 15px; font-weight: 600; margin-bottom: 10px;">选择您的档位</div>
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          ${tiers.map(t => `
            <button class="btn ${selectedTier === t.key ? 'btn-primary' : 'btn-outline'}"
              onclick="selectTier('${t.key}')"
              style="flex: 1; min-width: 72px; padding: 10px 6px; font-size: 14px;">
              ${t.label}
            </button>
          `).join('')}
        </div>
      </div>

      ${selectedTier && products.length > 0 ? `
        <div style="font-size: 13px; color: #999; margin: 8px 0;">共 ${products.length} 个品规</div>

        ${groups.map(group => {
          const groupProducts = products.filter(p => p.品牌组 === group)
          const activityItems = groupProducts.filter(p => p.类型 === '活动品规')
          const incentiveItems = groupProducts.filter(p => p.类型 !== '活动品规')
          const isActivityGroup = group.startsWith('组')

          return `
            <div style="
              background: #fff;
              border-radius: 12px;
              margin-bottom: 14px;
              box-shadow: var(--shadow);
              overflow: hidden;
              border: 1px solid ${isActivityGroup ? '#d6eaf8' : '#eee'};
            ">
              <!-- 活动标题 -->
              <div style="
                padding: 12px 14px;
                background: ${isActivityGroup ? 'linear-gradient(135deg, #e8f4f8, #d6eaf8)' : '#f9f9f9'};
                font-size: 16px;
                font-weight: 600;
                color: ${isActivityGroup ? '#1a5276' : '#666'};
                border-bottom: 1px solid ${isActivityGroup ? '#c5e1f0' : '#eee'};
              ">
                ${isActivityGroup ? '🏷️ ' : '🎯 '}${escapeHtml(group)}
              </div>

              <!-- 活动品规 -->
              ${activityItems.length > 0 ? `
                <div style="padding: 8px 14px 4px;">
                  <div style="font-size: 12px; font-weight: 600; color: #2980b9; margin-bottom: 4px;">活动品规：</div>
                  ${activityItems.map(p => `
                    <div style="
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      padding: 8px 10px;
                      margin: 3px 0;
                      border-radius: 8px;
                      background: #e8f4f8;
                    ">
                      <div style="font-size: 14px; font-weight: 500;">${escapeHtml(p.品规名称)}</div>
                      <div style="
                        background: rgba(41,128,185,0.15);
                        padding: 3px 12px;
                        border-radius: 20px;
                        font-size: 14px;
                        font-weight: 600;
                        color: #1a5276;
                      ">${p.数量}条</div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}

              <!-- 激励品规 -->
              ${incentiveItems.length > 0 ? `
                <div style="padding: 8px 14px 12px;">
                  <div style="font-size: 12px; font-weight: 600; color: #666; margin-bottom: 4px;">激励品规：</div>
                  ${incentiveItems.map(p => `
                    <div style="
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      padding: 8px 10px;
                      margin: 3px 0;
                      border-radius: 8px;
                      background: #fff;
                      border: 1px solid #eee;
                    ">
                      <div style="font-size: 14px;">${escapeHtml(p.品规名称)}</div>
                      <div style="
                        background: #f0f0f0;
                        padding: 3px 12px;
                        border-radius: 20px;
                        font-size: 14px;
                        font-weight: 500;
                        color: #555;
                      ">${p.数量}条</div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          `
        }).join('')}

        <div class="legal-notice">
          ⚠️ 以上品规和数量以正式业务通知为准。
        </div>
      ` : selectedTier ? `
        <div class="empty-state">
          <div class="empty-state-icon">📦</div>
          <p>该档位暂无可用品规</p>
        </div>
      ` : `
        <div class="empty-state">
          <div class="empty-state-icon">👆</div>
          <p>请先选择您的档位</p>
        </div>
      `}

      <div class="footer-notice">
        <p>本页面展示内容为标签活动，具体以正式通知为准</p>
      </div>
    </div>
  `
}

window.selectTier = function(key) {
  selectedTier = key
  const app = document.getElementById('app')
  const tiers = getTierRanges()
  renderPackageContent(app, tiers)
}
