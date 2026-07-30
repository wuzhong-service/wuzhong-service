/**
 * 标签活动模块
 * 客户选择自己的档位，显示对应品规和数量
 * 活动品规有底色填充，激励品规无底色
 */

import { escapeHtml } from '../utils.js'
import { getTierRanges, getPackagesByTier } from '../data-service.js'
import { navigate } from '../router.js'

let selectedTier = ''

/**
 * 渲染标签活动页面
 * @param {Object} data
 */
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

  // 分离活动品规和激励品规
  const activityProducts = products.filter(p => p.类型 === '活动品规')
  const incentiveProducts = products.filter(p => p.类型 !== '活动品规')

  // 活动品规按品牌组分，激励品规按品牌分
  const activityGroups = [...new Set(activityProducts.map(p => p.品牌组).filter(Boolean))]
  const incentiveBrands = [...new Set(incentiveProducts.map(p => p.品牌).filter(Boolean))]

  app.innerHTML = `
    <div class="header">
      <div class="header-back" onclick="navigate('home')">← 返回</div>
      <div class="header-title">📦 标签活动</div>
    </div>

    <div class="page active">
      <div class="notice-bar">
        ⚠️ 以下内容仅为系统演示，不代表实际业务安排。
      </div>

      <!-- 选择您的档位 -->
      <div class="card">
        <div class="card-title">选择您的档位</div>
        <div class="card-subtitle">选择您的当前档位，查看对应可订购品规和数量</div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px;">
          ${tiers.map(t => `
            <button class="btn ${selectedTier === t.key ? 'btn-primary' : 'btn-outline'}"
              onclick="selectTier('${t.key}')"
              style="flex: 1; min-width: 80px; padding: 12px 8px; font-size: 15px;">
              ${t.label}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- 品规列表 -->
      ${selectedTier && products.length > 0 ? `
        <div class="result-count">
          共 <strong>${products.length}</strong> 个可订购品规
          <span style="margin-left: 8px; font-size: 12px; color: #999;">
            (活动品规 ${activityProducts.length} · 激励品规 ${incentiveProducts.length})
          </span>
        </div>

        <!-- 活动品规（有底色） -->
        ${activityProducts.length > 0 ? `
          <div style="margin-bottom: 4px; font-size: 14px; font-weight: 600; color: var(--color-primary); padding: 8px 4px;">
            🏷️ 活动品规
          </div>
          ${activityGroups.map(group => {
            const items = activityProducts.filter(p => p.品牌组 === group)
            return `
              <div style="
                background: #e8f4f8;
                border-radius: 12px;
                padding: 6px 12px 12px;
                margin-bottom: 10px;
              ">
                <div style="font-size: 13px; font-weight: 600; color: #2980b9; padding: 4px 0 8px;">
                  ${escapeHtml(group === '组1' ? '组1' : group === '组2' ? '组2' : group === '组3' ? '组3' : group === '组4' ? '组4' : group === '组5' ? '组5' : group)}
                </div>
                ${items.map(p => `
                  <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 0;
                    border-bottom: 1px solid rgba(255,255,255,0.6);
                    font-size: 14px;
                  ">
                    <div style="font-weight: 500;">${escapeHtml(p.品规名称)}</div>
                    <div style="
                      background: rgba(41, 128, 185, 0.15);
                      padding: 3px 12px;
                      border-radius: 20px;
                      font-size: 14px;
                      font-weight: 600;
                      color: #1a5276;
                    ">
                      ${p.数量}条
                    </div>
                  </div>
                `).join('')}
              </div>
            `
          }).join('')}
        ` : ''}

        <!-- 激励品规（无底色） -->
        ${incentiveProducts.length > 0 ? `
          <div style="margin: 12px 0 4px; font-size: 14px; font-weight: 600; color: #666; padding: 8px 4px;">
            🎯 激励品规
          </div>
          ${incentiveBrands.map(brand => {
            const items = incentiveProducts.filter(p => p.品牌 === brand)
            return `
              <div style="
                background: #fff;
                border-radius: 12px;
                padding: 6px 12px 12px;
                margin-bottom: 10px;
                border: 1px solid #eee;
              ">
                <div style="font-size: 13px; font-weight: 600; color: #666; padding: 4px 0 8px;">
                  ${escapeHtml(brand)}
                </div>
                ${items.map(p => `
                  <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 0;
                    border-bottom: 1px solid #f0f0f0;
                    font-size: 14px;
                  ">
                    <div>${escapeHtml(p.品规名称)}</div>
                    <div style="
                      background: #f0f0f0;
                      padding: 3px 12px;
                      border-radius: 20px;
                      font-size: 14px;
                      font-weight: 500;
                      color: #555;
                    ">
                      ${p.数量}条
                    </div>
                  </div>
                `).join('')}
              </div>
            `
          }).join('')}
        ` : ''}

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

// 暴露全局函数
window.selectTier = function(key) {
  selectedTier = key
  const app = document.getElementById('app')
  const tiers = getTierRanges()
  renderPackageContent(app, tiers)
}
