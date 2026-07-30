/**
 * 标签活动模块
 * 根据Excel表格展示：活动品规（蓝底）、激励品规（白底）
 * 按品牌组分组展示
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

  // 按品牌组分组
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
          const items = products.filter(p => p.品牌组 === group)
          const isActivity = items.some(p => p.类型 === '活动品规')
          return `
            <div style="
              background: #fff;
              border-radius: 12px;
              margin-bottom: 12px;
              box-shadow: var(--shadow);
              overflow: hidden;
              border: 1px solid ${isActivity ? '#b8dff0' : '#e0e0e0'};
            ">
              <div style="
                padding: 10px 14px;
                background: ${isActivity ? '#d4edf7' : '#f0f0f0'};
                font-size: 15px;
                font-weight: 600;
                color: ${isActivity ? '#0d4f7a' : '#555'};
                border-bottom: 1px solid ${isActivity ? '#b8dff0' : '#e0e0e0'};
              ">
                ${isActivity ? '🏷️ ' : ''}${escapeHtml(group)}
              </div>
              <div style="padding: 6px 14px 10px;">
                ${items.map(p => {
                  const isAct = p.类型 === '活动品规'
                  return `
                    <div style="
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      padding: 8px 10px;
                      margin: 4px 0;
                      border-radius: 8px;
                      background: ${isAct ? '#e8f4f8' : '#fff'};
                      border: ${isAct ? 'none' : '1px solid #eee'};
                    ">
                      <div style="font-size: 14px; font-weight: ${isAct ? '500' : 'normal'};
                        color: ${isAct ? '#0d4f7a' : '#333'};
                      ">${escapeHtml(p.品规名称)}</div>
                      <div style="
                        background: ${isAct ? 'rgba(13,79,122,0.12)' : '#eee'};
                        padding: 3px 12px;
                        border-radius: 20px;
                        font-size: 14px;
                        font-weight: 600;
                        color: ${isAct ? '#0d4f7a' : '#555'};
                      ">${p.数量}条</div>
                    </div>
                  `
                }).join('')}
              </div>
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
        <p>具体活动内容以正式业务通知为准</p>
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
