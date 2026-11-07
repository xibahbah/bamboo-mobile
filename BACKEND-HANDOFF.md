# Bamboo 后端交接：直接按这份开工

Private repo：https://github.com/xibahbah/bamboo-mobile

这是独立的手机社区应用，不是 Aksharam。前端已经能演示，当前所有帖子、捐款和聊天只存在浏览器 localStorage。**后端同学需要实现下面的服务，不要把现在的前端状态当作可信数据。**

## 分工与交付顺序

**同学 B：社区。** 负责登录/演示身份、用户资料、帖子、点赞、收藏、地点、消息请求。先交用户和帖子，再交点赞与资料；聊天最后。负责建立 profiles 基表，把 user ID 约定告诉 C。

**同学 C：共同资金池。** 负责模拟捐款、账本、streak、私人帮助申请、管理员预留/拨付、善意墙。先交模拟捐款 + growth + finance，再做申请与管理。与 B 共用用户身份，不能再建一套 users。

两人只改自己的服务/数据库文件，不改 `ui.css`、`quiet.css`、`assets/`。约定 45 分钟给可联调接口，60 分钟开始串联，90 分钟冻结新功能。

## 前端在哪里接

- `ui.js` 当前 `state` / `persist()` 是本地演示实现，需要换成一个请求 API 的 adapter。
- 页面入口为 `render()`；不要每个页面另建身份状态。
- 钱必须由响应更新 UI；动效、按钮点击、客户端传入的 streak 都不能代表到账。
- 五个页面：Home、Map、Giving、Inbox、You。手机优先。
- 给 Keith 一份 base URL、演示账户进入方式、实际 JSON 响应、迁移和种子数据命令；不要把凭据放 Git。

## 共用约定

- 同源 `/api`。身份从服务端会话获取，忽略客户端自报的 authorId / userId / admin。
- 钱统一为 USD 的整数 cents。日期用 UTC 时间戳存储、America/Los_Angeles 捐款日计算。
- 只接模拟支付。响应必须包含 `mode:"demo"`，真实收款后置。
- JSON 错误统一 `{error:{code,message}}`：400 输入非法，401 未登录，403 无权限，404 不存在，409 冲突。
- 列表使用 `{items,nextCursor}`；文字字段按纯文本存取，禁止把用户内容当 HTML。
- 登录/权限仍需后端实现，前端显示和隐藏按钮不算鉴权。

## B 的接口与表

| 接口 | 输入 / 输出与约束 |
|---|---|
| GET /api/me | `{id,displayName,bio,avatarUrl}` |
| PATCH /api/me | `{displayName,bio}`；名称 trim 后 1–40 字；简介 ≤240 字 |
| GET /api/posts?kind=&cursor= | 每条含 `{id,author:{id,displayName,avatarUrl},kind,body,createdAt,likeCount,likedByMe,savedByMe}` |
| POST /api/posts | `{kind:"story"|"recipe"|"culture",body}`；trim 后 1–1200 字；服务端赋作者 |
| DELETE /api/posts/:id | 仅本人；建议软删除，返回可恢复截止时间 |
| POST /api/posts/:id/restore | 仅本人，在恢复窗口内撤回删除 |
| PUT /api/posts/:id/like | `{liked:boolean}`；重复相同请求结果不变 |
| PUT /api/posts/:id/save | `{saved:boolean}`；本人收藏私密 |
| GET /api/me/saved | 与帖子列表相同结构 |
| GET /api/profiles/:id | 仅公开资料与帖子；不含受助状态和捐款记录 |
| GET /api/places | `{items:[{id,name,kind,lat,lng,description,isDemo}]}`；只展示公开服务地点 |
| GET /api/conversations | 本人可见的会话 |
| POST /api/message-requests | `{recipientId,body,clientRequestId}`；首次发言创建请求、不能直接视为已接受会话 |
| POST /api/message-requests/:id/accept | 只有接收者可接受 |
| GET /api/conversations/:id/messages | 只有参与者可读 |
| POST /api/conversations/:id/messages | `{body,clientRequestId}`；已接受会话、参与者才可发送；1–500 字 |

表：profiles、posts、post_likes（唯一 post_id + user_id）、post_saves（同样唯一）、places、message_requests、conversations、conversation_members、messages。实时推送可后置，用刷新获取消息。上线前还需屏蔽/举报、限流与内容审核。

## C 的接口与表

| 接口 | 输入 / 输出与约束 |
|---|---|
| GET /api/growth | `{currentStreak,bestStreak,lastDonationDate,todayCompleted,visualDay,groveCount}` |
| POST /api/demo/donations | `{amountCents,idempotencyKey,simulateResult:"success"|"failure"}` → `{donation,growth,pool,mode:"demo"}` |
| GET /api/finance | `{myDonations,pool:{receivedCents,feesCents,paidCents,reservedCents,availableCents},mode:"demo"}` |
| POST /api/help-requests | `{category,description}`；仅工作人员和本人可见 |
| GET /api/me/help-requests | 本人的申请、状态与下一步 |
| POST /api/admin/allocations | `{caseId,amountCents,idempotencyKey}`；管理员，核实后原子预留 |
| PATCH /api/admin/allocations/:id | `{status:"paid",evidenceRef}`；管理员，预留转拨付 |
| PUT /api/me/wall | `{visible:boolean}`；公开需本人明确同意和达到门槛 |
| GET /api/wall | 只含主动公开的名称和头像，不返回捐款金额 |

表：donations（user_id、amount_cents、status、idempotency_key 唯一、created_at、succeeded_at）、help_requests、allocations、ledger_entries、wall_preferences、story_consents。一次事务完成 donation 成功记录和 ledger 入账；失败不入账。

金额边界：本轮 demo 1–1,000,000 cents。API-CONTRACT.md 旧上限以本文件为准。

**余额计算：** 到账 − 费用 − 已拨付 − 已预留。预留转拨付时不能再扣一次可用余额。并发申请也不能透支；用数据库事务/锁或原子条件更新。不能仅在应用层先读余额再写。

**幂等：** 同一个 key、相同参数重复提交只返回原结果；同 key 不同参数返回 409。已拨付重复执行不再次扣款。失败重试规则明确：原 key 返回原失败，新的支付尝试使用新 key。

**Streak：** 只计 succeeded 的不同本地日期；一天多笔最多一天；今天/昨天仍连续；跨过一天未捐则归零，下一次从 1 开始；bestStreak 保留。金额不影响成长速度。前端当前固定 14→15 是演示 fixture，后端必须实际计算。

**成长素材：** 1–30 天映射 assets/days/day-NN.png；0 天显示“尚未开始”，不能显示虚假的第 1 天。第 30 天成林；每满 30 天增加一片。建议用 bestStreak 保留已获得成长，当前连续天数单独显示。这项规则需团队确认，但不要让多捐金额加速。

**故事与尊严：** 获得帮助不要求捐款、发帖或公开身份。公开“帮助近况”需独立且针对具体内容的同意记录；撤回后停止公开。个人自主分享食谱不等于同意公开其受助经历。

## 联调必须过的验收

1. 同一帖子连续两次点赞请求不会 +2；取消后回到原数。
2. A 不能编辑 B 的资料/帖子、读取 B 的收藏或私聊。
3. 发布后的帖子刷新仍存在，纯文本内容不能执行脚本。
4. 同一捐款请求发两次，余额只加一次。
5. 当天第二笔成功捐款会增加余额，但不增加 streak。
6. 失败捐款不加余额，不加 streak。
7. LA 日期边界和断一天后重启正确，包括夏令时附近。
8. 两个管理员同时分配最后一笔可用余额，最多一笔成功。
9. 预留转拨付不重复减少可用余额；同一拨付重试幂等。
10. 达到 15 天不自动公开；主动选择后公开，撤回后消失。
11. 受助用户不发帖仍可申请和收到帮助。
12. demo 字样持续可见，不会实际扣款或发送通知。

## 本轮优先级

P0：会话身份、帖子/点赞/资料、模拟捐款/账本/growth。

P1：收藏、帮助申请、管理员分配、上墙同意。

P2：真实地图服务、消息请求后端、推送、原生 app/Widget。来不及就保留明确的本地演示，不假装已经连通。
