/**
 * 标签活动模块
 * 所有活动风格统一，每个品规标注活动品规/激励品规，颜色区分
 */

import { escapeHtml } from '../utils.js'
import { getTierRanges, getPackagesByTier, getSettings } from '../data-service.js'
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
      <!-- 活动日期 -->
      ${getSettings()['活动日期范围'] ? `
        <div style="
          text-align: center;
          font-size: 20px;
          font-weight: 600;
          color: var(--color-primary);
          padding: 14px 0 6px;
        ">
          ${getSettings()['活动日期范围']} 标签活动
        </div>
      ` : ''}

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
          return `
            <div style="
              background: #fff;
              border-radius: 12px;
              margin-bottom: 12px;
              box-shadow: var(--shadow);
              overflow: hidden;
              border: 1px solid #ddd;
            ">
              <div style="
                padding: 10px 14px;
                background: #f5f5f5;
                font-size: 16px;
                font-weight: 600;
                color: #333;
                border-bottom: 1px solid #ddd;
              ">${group.startsWith('组') ? '江苏中烟 · ' : ''}${escapeHtml(group)}</div>
              <div style="padding: 8px 14px 12px;">
                ${items.map(p => {
                  const isAct = p.类型 === '活动品规'
                  return `
                    <div style="
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      padding: 10px 12px;
                      margin: 5px 0;
                      border-radius: 8px;
                      background: ${isAct ? '#d4edda' : '#fff'};
                      border: ${isAct ? 'none' : '1px solid #ddd'};
                    ">
                      <div style="flex: 1; min-width: 0;">
                        <div style="font-size: 14px; font-weight: 500; color: #333;">
                          ${escapeHtml(p.品规名称)}
                        </div>
                        <div style="
                          display: inline-block;
                          margin-top: 4px;
                          padding: 1px 8px;
                          border-radius: 10px;
                          font-size: 11px;
                          font-weight: 500;
                          background: ${isAct ? '#c3e6cb' : '#e9ecef'};
                          color: ${isAct ? '#155724' : '#495057'};
                        ">
                          ${isAct ? '活动品规' : '激励品规'}
                        </div>
                      </div>
                      <div style="
                        flex-shrink: 0;
                        background: ${isAct ? '#c3e6cb' : '#e9ecef'};
                        padding: 4px 14px;
                        border-radius: 20px;
                        font-size: 15px;
                        font-weight: 600;
                        color: ${isAct ? '#155724' : '#495057'};
                        margin-left: 8px;
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
