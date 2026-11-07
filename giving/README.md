# Giving · 第二页接入

独立入口：`/giving.html`。应用内在 `ui.js` 的 Giving 分支加载同源 iframe，并沿用应用侧栏导航。除这个接入点和脚本缓存版本外，没有改首页、设置、账号或开场页面。

依据：用户提供的 BAMBOO-PAGE-2-HANDOFF.md。本次检出中尚不存在文档提到的 giving/，因此新建独立实现；没有宣称复用了一个实际未取得的 3D demo。

## 页面与视觉

固定视角的 SVG 插画环境。森林、海岸、沙漠三个主题同时更换天空、远景和地面。正常观看仅显示顶部 streak，以及环境、圆形捐款、普通/全景三个场景操作；返回/侧栏属于必要应用导航。无标题、金额、成长条、感谢弹窗或拖拽控制。

捐款成功后平静生长 1.6 秒。等待返回与成长期间锁定主按钮。失败显示一行错误，不增加成长。减少动态效果时直接呈现最终状态。全景切换立即更新构图，不做飞行或环绕。

## 成长规则

`growthDays` 与 `streak` 是不同输入，视觉层不以 streak 清空植物。

- 0 天无竹子；1–15 天逐渐长高，无叶。
- 16–30 天保持该株高度，逐步展开叶片。
- 第 31 天保留成熟竹子，并开始第二株。
- 每株成熟高度由索引确定、略有变化，但均经历完整 30 天。
- 360 天有 12 株成熟竹子；365 天有第 13 株的五天进度。
- 普通视图突出当前株并保留邻近老竹子的轮廓；全景展示所有已获得的竹子。

## Adapter 合同

在 `app.js` 前设置 `window.BambooGivingAdapter`，即可替换本地 demo：

```js
window.BambooGivingAdapter = {
  async load() {
    return { growthDays: 31, streak: 7, amountCents: 10,
      environment: 'forest', panorama: false };
  },
  async savePreferences({ environment, panorama }) {
    // 仅修改提交的偏好，不重写成长数据。
  },
  async donate({ amountCents, idempotencyKey }) {
    // 等支付/服务器确认后再返回；失败 reject。
    return { growthDays: 32, streak: 8 };
  }
};
```

生产服务决定当天是否计入成长，成功响应也可以返回不变的 growthDays。金额不能改变视觉成长速度。重复请求的幂等、同一天最多增加一次、连续天数与累计成长关系，都由后端负责。前端动画不代表到账。

设置页保存金额的位置：`localStorage['bamboo-giving-settings-v1'] = JSON.stringify({amountCents:10})`。兼容读取现有 `bamboo-ui-v1.donationAmountCents`。当前设置页尚未提供该字段，所以本地演示默认 10 cents；没有在本页增加金额选择，也没有擅自改设置页。每次按按钮前重新读取设置。

默认 adapter 使用 `bamboo-giving-v1` 保存本页模拟成长、streak、环境、视图及模拟捐款记录。首次从当前 app 的 14/15 天演示状态开始。**每次按钮成功模拟一个新的成长日，不是真实日期，不实际扣款。** 为保持队友页面独立，不把这份演示数据写回旧首页资料 fixture。

本地失败验收：`giving.html?simulate=failure`。此入口只模拟失败，不提供第四个场景操作。

## 验证

`npm test` 覆盖 0/1/15/16/30/31/360/365 天、不同金额同速、失败不增长、重复点击锁、幂等、偏好持久化、全景捐款不切回普通视图。

`giving/review.html` 是只读的成长关键帧检查页，不属于正常捐款流程。

## Integrated navigation and widget
The main app now uses five bottom tabs. You → Streak widget opens the teammate's widget design with the current local demo streak; the widget observes giving-state changes. `widget.html` retains isolated illustration controls, while `widget.html?live=1` shows the synced preview. This is not a native iOS/Android widget. The imported source notes are in WIDGET-SOURCE.md.
