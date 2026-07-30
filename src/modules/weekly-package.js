/**
 * 本周套餐模块
 * 客户选择自己的档位，显示对应品规和数量
 */

import { escapeHtml } from '../utils.js'
import { getTierRanges, getPackagesByTier, getBrandGroups } from '../data-service.js'
import { navigate } from '../router.js'

let selectedTier = ''

/**
 * 渲染套餐页面
 * @param {Object} data
 */
export function renderPackage(data) {
  const app = document.getElementById('app')
  const tiers = getTierRanges()
  // 默认选中第一个档位
  if (!selectedTier && tiers.length > 0) {
    selectedTier = tiers[0].key
  }
  renderPackageContent(app, tiers)
}

function renderPackageContent(app, tiers) {
  const products = getPackagesByTier(selectedTier)
  const brandGroups = [...new Set(products.map(p => p.品牌组).filter(Boolean))]

  app.innerHTML = `
    <div class="header">
      <div class="header-back" onclick="navigate('home')">← 返回</div>
      <div class="header-title">📦 本周套餐</div>
    </div>

    <div class="page active">
      <div class="notice-bar">
        ⚠️ 以下内容仅为系统演示，不代表实际业务安排。
      </div>

      <!-- 选择您的档位 -->
      <div class="card">
        <div class="card-title">选择您的档位</div>
        <div class="card-subtitle">请选择您的当前档位，查看对应可订购品规和数量</div>
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
        </div>

        ${brandGroups.map(group => {
          const groupProducts = products.filter(p => p.品牌组 === group)
          return `
            <div class="card" style="margin-bottom: 12px;">
              <div class="card-title" style="font-size: 16px; margin-bottom: 12px;">${escapeHtml(group)}</div>
              ${groupProducts.map(p => `
                <div style="
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  padding: 10px 0;
                  border-bottom: 1px solid #f0f0f0;
                  font-size: 15px;
                ">
                  <div>
                    <div style="font-weight: 500;">${escapeHtml(p.品规名称)}</div>
                    <div style="font-size: 12px; color: #999;">${escapeHtml(p.品牌)}</div>
                  </div>
                  <div style="
                    background: var(--color-tag-bg);
                    padding: 4px 14px;
                    border-radius: 20px;
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--color-primary);
                  ">
                    ${p.数量}条
                  </div>
                </div>
              `).join('')}
            </div>
          `
        }).join('')}

        <div class="legal-notice">
          ⚠️ 以上品规和数量以正式业务通知为准。
        </div>
      ` : selectedTier ? `
        <div class="empty-state">
          <div class="empty-state-icon">📦</div>
          <p>该档位暂无可用套餐</p>
        </div>
      ` : `
        <div class="empty-state">
          <div class="empty-state-icon">👆</div>
          <p>请先选择您的档位</p>
        </div>
      `}

      <div class="footer-notice">
        <p>具体套餐内容以正式业务通知为准</p>
      </div>
    </div>
  `
}

// 暴露全局函数供 onclick 使用
window.selectTier = function(key) {
  selectedTier = key
  const app = document.getElementById('app')
  const tiers = getTierRanges()
  renderPackageContent(app, tiers)
}
