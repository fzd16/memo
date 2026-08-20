/* 好幫手備忘錄 — Service Worker（接收推播） */
const WORKER_URL = "https://memo-push.ting791126.workers.dev";
const DEVICE = new URL(self.location).searchParams.get("device") || "";

self.addEventListener("push", e => {
  e.waitUntil((async () => {
    let body = "記得查看今天的待辦事項";
    try {
      const r = await fetch(WORKER_URL + "/pending?device=" + DEVICE);
      const j = await r.json();
      if (j.summary) {
        body = j.summary; // AI 早安摘要
      } else if (j.items && j.items.length) {
        body = j.items.slice(0, 5).map(t => "・" + t).join("\n") + (j.items.length > 5 ? "\n…等 " + j.items.length + " 件" : "");
      }
    } catch (err) {}
    await self.registration.showNotification("好幫手備忘錄 🔔", {
      body,
      tag: "memo-reminder",
      icon: "icon.png",
      badge: "icon.png"
    });
  })());
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil((async () => {
    const wins = await clients.matchAll({ type: "window", includeUncontrolled: true });
    if (wins.length) { wins[0].focus(); } else { clients.openWindow("./"); }
  })());
});
