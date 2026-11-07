# 柔和视觉与成长参考

查阅日期：2026-11-07。以下是官网内容与设计提案，不声称逐像素复刻了现有网站，也未复用其品牌素材。

1. [Too Good To Go](https://www.toogoodtogo.com/en-us)：把附近的行动拆成发现、确认、领取、完成。可借鉴：地图发现和“我做了一件有意义的小事”的完成反馈。本项目采用奶油底、深绿文字、圆润卡片是我们的设计提案。
2. [Finch](https://finchcare.com/)：通过照顾自己来照顾虚拟伙伴。可借鉴：每天的小动作对应可感知的伙伴成长，反馈温和且简短。
3. [Forest](https://www.forestapp.cc/)：把投入的时间变成树木与累计森林。可借鉴：从单株到群落的长期记录。我们的方案保留已获得的成长，避免一次中断就摧毁植物。
4. [Apple WidgetKit](https://developer.apple.com/documentation/widgetkit/) 与 [Widget 数据更新动画](https://developer.apple.com/documentation/widgetkit/animating-data-updates-in-widgets-and-live-activities)：原生 Widget 有自己的时间线与更新动画机制。导出 PNG 是素材准备，不等于已完成 iPhone Widget；不能承诺把网页 GIF 原样放进 Widget 就能持续循环。

## 我们的视觉方向

奶油底 #F8F5EB；深绿文字 #214E3B；鼠尾草绿 #91AA83；暖黄 #E8CB78。圆角 20–28px，正文清晰，按钮至少 44px。竹子占一小块稳定区域；阅读帖子时不播放大型成长动画。

首次进入：小竹笋温柔展开。日常：轻微摇摆，提供静止状态。捐款成功：只播放一次当前日到下一日的成长过渡。第 30 天：第一片竹林完成。减少动态效果时使用对应日静态 PNG。

30 张图片指 30 个日成长状态；GIF 的播放帧可以更多，用来衔接过渡。成长状态不是 GIF 播放到哪一帧，更不能依赖 GIF 来判断真实 streak。
