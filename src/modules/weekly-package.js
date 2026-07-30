/**
 * 标签活动模块
 * 客户选择档位 → 按品牌显示所有品规
 * 活动品规（有底色填充）激励品规（无底色）混排，明确标注
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

  // 按品牌分组
  const brandOrder = ['上烟集团', '江苏中烟', '云南中烟', '福建中烟']
  const brands = [...new Set(products.map(p => p.品牌).filter(Boolean))]
  brands.sort((a, b) => {
    const ia = brandOrder.indexOf(a)
    const ib = brandOrder.indexOf(b)
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

      <!-- 品规列表 -->
      ${selectedTier && products.length > 0 ? `
        <div style="font-size: 13px; color: #999; margin: 8px 0;">共 ${products.length} 个品规</div>

        ${brands.map(brand => {
          const brandProducts = products.filter(p => p.品牌 === brand)
          return `
            <div style="margin-bottom: 12px;">
              <div style="
                font-size: 15px; font-weight: 600; color: var(--color-primary);
                padding: 8px 4px 6px; border-bottom: 2px solid var(--color-primary-light);
              ">${escapeHtml(brand)}</div>
              ${brandProducts.map(p => {
                const isActivity = p.类型 === '活动品规'
                return `
                  <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 12px;
                    margin: 4px 0;
                    border-radius: 8px;
                    background: ${isActivity ? '#e8f4f8' : '#fff'};
                    border: ${isActivity ? 'none' : '1px solid #eee'};
                  ">
                    <div style="flex: 1;">
                      <div style="font-size: 15px; font-weight: 500;">${escapeHtml(p.品规名称)}</div>
                      <div style="font-size: 11px; color: ${isActivity ? '#2980b9' : '#999'}; margin-top: 2px;">
                        ${isActivity ? '🏷️ 活动品规' : '🎯 激励品规'}
                      </div>
                    </div>
                    <div style="
                      background: ${isActivity ? 'rgba(41,128,185,0.15)' : '#f0f0f0'};
                      padding: 4px 14px;
                      border-radius: 20px;
                      font-size: 16px;
                      font-weight: 600;
                      color: ${isActivity ? '#1a5276' : '#555'};
                    ">
                      ${p.数量}条
                    </div>
                  </div>
                `
              }).join('')}
            </div>
          `
        }).join('')}

        <div style="
          text-align: center;
          padding: 16px;
          margin-top: 8px;
          font-size: 14px;
          font-weight: 600;
          color: var(--color-primary);
          background: var(--color-tag-bg);
          border-radius: 12px;
          border: 1px solid #d6eaf8;
        ">
          完全叫做标签活动
        </div>

        <div class="legal-notice" style="margin-top: 12px;">
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
