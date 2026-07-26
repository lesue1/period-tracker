# 经期记录软件 — 设计文档

## 1. 要解决什么问题

陈洪新的女朋友需要一个私密、可靠的经期追踪工具。现有的经期 App（大姨妈、Flo 等）要么广告多，要么把数据传到云端有隐私风险。她要的是一个**纯本地存储、清爽无广告、苹果风格**的经期日历，能准确预测周期、记录身体症状、在合适的时间提醒她。

## 2. 核心流程

```
1. 打开网页 → 看到月视图日历，今天高亮，经期日标红
2. 点某个日期 → 弹出记录面板，标记经期开始/结束、选症状、记体温
3. 系统自动计算周期、预测下次经期和排卵日
4. 经期前一天 → 手机收到推送通知"预计明天来姨妈"
5. 切到统计页 → 看周期趋势图、症状频率、体温曲线
```

## 3. 技术选型

| 项目 | 选择 | 原因 |
|------|------|------|
| 框架 | React 19 + Vite | 组件化清晰，PWA 插件成熟，生态好 |
| 样式 | Tailwind CSS | 原子化 CSS，快速出苹果风格界面 |
| 图标 | Lucide React | 轻量、苹果风格、tree-shakable |
| 图表 | Recharts | React 原生，API 简洁 |
| 存储 | Dexie.js (IndexedDB 封装) | 本地存储 API 比原生 IndexedDB 好用太多 |
| PWA | vite-plugin-pwa | 一行配置，离线可用，可装到手机 |
| 部署 | Cloudflare Pages / Vercel | 免费、全球 CDN、一键部署 |

## 4. V0 做什么不做什么

✅ V0 要做：
- 月视图日历组件（支持翻月、今日定位）
- 点击日期标记经期开始/结束
- 自动计算周期长度，预测下次经期
- 排卵日 + 受孕窗口估算（标准公式）
- 每日症状记录（预设标签 + 自定义）
- 基础体温记录（数字输入 + 单位切换 °C/°F）
- 流量强度记录（1-5 级）
- 周期长度趋势折线图
- 症状频率统计饼图
- 基础体温曲线图
- 经期前一天浏览器推送通知
- PWA 配置（可添加到手机主屏幕）
- 数据导出/导入 JSON 备份
- 苹果风格 UI（淡粉白底、毛玻璃、圆角卡片、底部 Tab）

❌ V0 不做：
- 用户账号系统（纯本地不需要）
- 云端同步
- 备孕高级算法（如宫颈黏液、排卵试纸等）
- 多语言支持（先中文）
- 暗黑模式（以后加，V0 不做）
- 多用户切换

## 5. 数据模型

### CycleRecord
```
{
  id: string (uuid),
  startDate: string (ISO date, e.g. "2026-07-01"),
  endDate: string | null,     // null = 进行中
  symptoms: string[],         // ["cramps", "headache", "fatigue", ...]
  mood: string[],             // ["happy", "irritable", "sad", ...]
  bbt: { date: string, temp: number }[],  // 基础体温
  notes: string,
  flow: 1 | 2 | 3 | 4 | 5,   // 1=极少 5=极多
}
```

### AppSettings
```
{
  cycleLength: number,        // 默认周期天数 (默认 28)
  periodLength: number,       // 默认经期天数 (默认 5)
  lutealPhase: number,        // 黄体期长度 (默认 14)
  reminderEnabled: boolean,
  reminderTime: string,       // "09:00"
  tempUnit: "celsius" | "fahrenheit",
}
```

### 计算逻辑
- **周期长度** = 本次经期开始日 - 上次经期开始日（天）
- **下次经期预测** = 最近一次经期开始日 + 平均周期长度
- **排卵日** = 下次经期预测日 - 黄体期长度(14天)
- **受孕窗口** = 排卵日前 5 天 ~ 排卵日 + 1 天
- 历史不足 2 个周期时使用默认值（周期 28 天、经期 5 天）

## 6. 组件树

```
App
├── TabBar (日历 | 统计 | 设置)
├── CalendarPage
│   ├── MonthHeader (← 2026年7月 →)
│   ├── WeekdayRow (日一二三四五六)
│   ├── CalendarGrid
│   │   └── DayCell × 28~31
│   │       ├── 日期数字
│   │       ├── 经期标记 (红色圆点)
│   │       ├── 预测标记 (粉色圆环)
│   │       └── 排卵标记 (蓝色小点)
│   ├── LegendRow (经期 · 预测 ● 排卵 ●)
│   └── PeriodEditSheet (底部弹出)
│       ├── 开始/结束日期选择器
│       ├── 流量强度滑块
│       ├── 症状多选标签
│       ├── 情绪多选标签
│       ├── 基础体温输入
│       └── 备注文本框
├── StatsPage
│   ├── CycleLengthChart (折线图)
│   ├── SymptomPieChart (饼图)
│   └── BBTChart (折线图 + 散点)
└── SettingsPage
    ├── 周期默认设置
    ├── 提醒开关
    ├── 导出数据按钮
    └── 导入数据按钮
```

## 7. 路由与页面

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | CalendarPage | 默认首页，月历视图 |
| `/stats` | StatsPage | 统计图表 |
| `/settings` | SettingsPage | 设置与数据管理 |

底部 Tab 切换，无页面刷新。

## 8. 提醒机制

使用浏览器 Notification API + Service Worker：
1. Service Worker 后台定时检查（每小时一次）
2. 检测到"明天是预测经期日" → 推送通知
3. 通知内容："预计明天是经期第一天，提前做好准备哦 🌸"
4. 点击通知 → 打开 App 到日历页

## 9. 非功能需求

- **性能**：首次加载 < 3 秒（Lighthouse 90+）
- **离线**：完全离线可用，PWA Service Worker 缓存
- **隐私**：零数据上传，纯 IndexedDB 本地存储
- **兼容性**：iOS Safari 15+、Android Chrome 90+、桌面 Chrome/Firefox
- **包体积**：JS bundle < 200KB gzipped
