# 吴中零售客户营销服务

面向持证卷烟零售客户的业务通知、信息查询和经营服务工具。

> ⚠️ 本系统不是面向消费者的卷烟宣传、销售或订购平台。

## 技术栈

- **构建工具**: Vite 5
- **语言**: 原生 HTML、CSS、JavaScript（无框架）
- **数据格式**: Excel → JSON（使用 xlsx 库）
- **运行环境**: Node.js 18+

## 项目结构

```
wuzhong-tobacco-service/
├─ data/
│  └─ 营销信息.xlsx          # 数据源（Excel 模板）
├─ public/
│  ├─ data/
│  │  └─ content.json        # 转换后的 JSON 数据
│  └─ images/                 # 静态图片资源
├─ scripts/
│  ├─ import-excel.js         # Excel → JSON 转换脚本
│  └─ generate-template.js    # Excel 模板生成脚本
├─ src/
│  ├─ main.js                 # 主入口文件
│  ├─ styles.css              # 全局样式
│  ├─ router.js               # 哈希路由
│  ├─ data-service.js         # 数据服务
│  ├─ utils.js                # 工具函数
│  └─ modules/
│     ├─ home.js              # 首页
│     ├─ weekly-package.js    # 本周套餐
│     ├─ cigarette-info.js    # 卷烟信息
│     ├─ order-calendar.js    # 订货日历
│     ├─ live-broadcast.js    # 直播专区
│     ├─ classification.js    # 分档解读
│     ├─ emergency-order.js   # 应急订单
│     └─ service.js           # 服务入口
├─ index.html                 # HTML 入口
├─ package.json
├─ vite.config.js
├─ README.md                  # 本文件
└─ 操作说明.md                 # 面向非技术人员的操作说明
```

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式（手机端可局域网访问）
npm run dev

# 生成 Excel 模板
npm run generate-template

# Excel → JSON 数据转换
npm run import-data

# 构建正式文件
npm run build
```

## 部署

`npm run build` 后，将 `dist/` 目录下的所有文件部署到静态服务器即可。

支持的部署方式：
- 普通静态服务器（Nginx、Apache 等）
- GitHub Pages
- 单位内网服务器
- 对象存储（OSS 等）

## 数据更新流程

1. 修改 `data/营销信息.xlsx`
2. 执行 `npm run import-data`
3. 执行 `npm run build`
4. 部署 `dist/` 目录

详细操作见 `操作说明.md`。

## 合规说明

- 仅面向持证卷烟零售客户
- 不包含在线交易或支付功能
- 不收集个人或经营敏感信息
- 不含广告或用户追踪代码
- 所有演示数据已标注
