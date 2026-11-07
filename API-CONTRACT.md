# 最小接口约定 v2

这是给两名后端同学的实现合同，不是已部署的 API。统一 JSON、同源 /api、金额 USD cents、日期 YYYY-MM-DD，服务器时区 America/Los_Angeles。演示模式必须标注 mode: "demo"。

最新 UX：混合主页 + 左侧导航 + 个人 Stories / Recipes / Culture。完整约束以 `BACKEND-HANDOFF.md` 为准。

## B：社区

- GET /api/me → {id, displayName, bio, avatarUrl,accountType}
- PATCH /api/me {displayName,bio} → 更新后的本人资料
- GET /api/posts?feed=all|organizations|stories&cursor=... → {items:[{id,author:{id,displayName,avatarUrl,accountType},kind,body,createdAt,likeCount,likedByMe}],nextCursor}
- POST /api/posts {kind:"story"|"recipe"|"culture",body} → 新个人帖子（服务器赋作者；不得发布 need / update）
- POST /api/organization/posts {kind:"need"|"update",title,body,detail,caseId?,consentId?} → 仅核验组织成员可发布，后端校验组织归属与公开同意
- GET /api/profiles/:id/posts?kind=story|recipe|culture&cursor=... → 个人内容分栏；首页不混入 recipe / culture
- PUT /api/posts/:id/like {liked:true|false} → {likeCount,likedByMe}；使用设置状态而非盲目 toggle，方便重试。
- GET /api/profiles/:id → {id,displayName,bio,posts}；不泄露私人申请和捐款金额。
- GET /api/places → {items:[{id,name,kind,lat,lng,description,isDemo:true}]}

## C：资金与成长

- GET /api/growth → {currentStreak,bestStreak,lastDonationDate,todayCompleted,visualDay,groveCount}
- POST /api/demo/donations {amountCents,idempotencyKey,simulateResult:"success"|"failure"} → {donation:{id,status,amountCents},growth,pool,mode:"demo"}
- GET /api/finance → {myDonations,pool:{receivedCents,feesCents,paidCents,reservedCents,availableCents},mode:"demo"}
- POST /api/admin/allocations {caseId,amountCents,idempotencyKey} → {allocation,pool}；只允许管理员，原子检查余额并预留。
- PATCH /api/admin/allocations/:id {status:"paid"} → {allocation,pool}；重复执行不能重复扣款。

余额 = 到账 − 费用 − 已拨付 − 已预留；预留改拨付时可用余额不再扣第二遍。

统一错误：{error:{code,message}}；无会话 401，无权限 403，金额非法 400，资金不足 409。同一幂等键不同请求参数返回 409。失败捐款可以保留记录，但不能算到账。

## Streak 和视觉

只有成功捐款计日；同一天最多增加一次。最近捐款为今天或昨天时保留连续天数，否则 currentStreak=0。隔日连续 +1，断日重新 1；bestStreak 永不降低。日期由服务器计算，不接受浏览器指定日期。

为了不让已获得的竹林消失，建议 visualDay=min(max(bestStreak,1),30)；当前 streak 与已获得的成长分别显示。这是建议规则，请 Keith 在前 10 分钟确认。没有任何成功捐款时显示独立的未开始状态，不伪造第 1 天。

第 30 天完整竹林；之后每完成 30 天增加一片竹林。groveCount=floor(bestStreak/30)，当前新一片的进度为 bestStreak % 30；30 的倍数显示完整竹林。前端展示最多三片缩略竹林，更多用“×N”，不要无限堆图。

视觉只读取服务器结果，不能用动效结束事件增加钱或 streak。发帖、点赞和聊天均不改变捐款 streak。
