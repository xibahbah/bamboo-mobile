# Duolingo → Bamboo UI 方向

查阅日期：2026-11-07；本版沿用本地原型与已有竹子素材。

## 官方来源与转化

| 官方设计观察 | 本项目的设计决定 |
|---|---|
| [Shape language](https://blog.duolingo.com/shape-language-duolingos-art-style/)：圆润轮廓、尽量少的必要细节、给插画留白，让小屏幕上也易于辨认。 | 保留原创竹子，少量插画；按钮圆润，有清楚的文字与按压反馈。 |
| [Core tabs redesign](https://blog.duolingo.com/core-tabs-redesign/)：官方展示过 Soft、Modular、Flat 等探索；最终强调一致标题、少量字体层级、合理留白。Soft 是探索方向，不等于所有现行页面。 | 奶油背景、竹叶绿、浅黄成长区。五个页面使用相同标题和导航；不把每一行都套卡片。 |
| [Streak milestone animation](https://blog.duolingo.com/streak-milestone-design-animation/)：把里程碑设计为可见的角色变化，结合动画和分享。 | 第 15 天成长和自愿上墙，第 30 天竹林；成功只庆祝一次，平时轻微摇摆。 |
| [Widget design](https://blog.duolingo.com/widget-feature/)：以插画表达当日完成状态。 | 顶部明确写今天是否完成；保留温柔状态，不采用逼迫或羞耻式催捐。 |

以上是我们对官网的设计解读，颜色值与界面组件为本项目设计，不声称来自 Duolingo 官方 token。

## UI tokens

- 背景 #F8F9F3；卡片 #FFFFFF；文字 #283F32。
- 主绿 #507946；深绿 #365C2E；浅绿 #EDF3E6。
- 成长暖黄 #F6E8B8；桃色 #F5E4D9；边线 #E2E8DC。
- 正文 15–16px；卡片标题 20px；主页主标题 32px。
- 主按钮圆角 14px，向下 3px 的实色阴影，点击时下移。
- 卡片圆角 22–26px；触摸目标至少 44px。

## 首版实现

`index.html` / `ui.css` / `ui.js`：可交互的前端 UI，复用 assets。五个入口：Home / Map / Giving / Inbox / You。地图与聊天明确为演示。界面用英文，适合 SD hackathon 演示。

同一个账号可以发帖、点赞、申请帮助和捐款。主页顶部固定 streak；帖子中的故事、文化与食谱不带受助身份标签。照片为生成的演示配图。

本版状态保存在当前浏览器本地；不能充当真实支付、身份授权或后端账本。对接 API 时用 API-CONTRACT.md 中服务器数据替换本地 demo adapter。
