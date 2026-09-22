/* 好幫手備忘錄 — Service Worker（接收推播） */
const WORKER_URL = "https://memo-push.ting791126.workers.dev";
const DEVICE = new URL(self.location).searchParams.get("device") || "";

self.addEventListener("push", e => {
  e.waitUntil((async () => {
    let body = "記得查看今天的待辦事項";
    let title = "好幫手備忘錄 🔔";
    let url = "./";
    try {
      const r = await fetch(WORKER_URL + "/pending?device=" + DEVICE);
      const j = await r.json();
      if (j.summary) {
        body = j.summary; // AI 撰寫的早安摘要／每週整理提醒
        if (j.kind === "weekly") { title = "好幫手備忘錄 🧺"; url = "./?review=1"; }
      } else if (j.items && j.items.length) {
        body = j.items.slice(0, 5).map(t => "・" + t).join("\n") + (j.items.length > 5 ? "\n…等 " + j.items.length + " 件" : "");
      }
    } catch (err) {}
    await self.registration.showNotification(title, {
      body,
      tag: url === "./" ? "memo-reminder" : "memo-weekly",
      icon: "icon.png",
      badge: "icon.png",
      data: { url }
    });
  })());
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "./";
  e.waitUntil((async () => {
    const wins = await clients.matchAll({ type: "window", includeUncontrolled: true });
    if (wins.length) {
      try { if (url !== "./" && wins[0].navigate) await wins[0].navigate(url); } catch (err) {}
      return wins[0].focus();
    }
    return clients.openWindow(url);
  })());
});
