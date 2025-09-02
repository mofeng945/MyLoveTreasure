// 缓存名称和版本
const CACHE_NAME = 'finance-app-cache-v1';
const CACHE_FILES = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json'
];

// 安装Service Worker，缓存必要的文件
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('打开缓存:', CACHE_NAME);
        return cache.addAll(CACHE_FILES);
      })
  );
  self.skipWaiting();
});

// 激活Service Worker，清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 拦截网络请求，提供缓存响应
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果缓存中有匹配的响应，则返回缓存的响应
        if (response) {
          return response;
        }

        // 克隆请求，因为请求只能被消费一次
        const fetchRequest = event.request.clone();

        // 尝试从网络获取资源
        return fetch(fetchRequest).then((response) => {
          // 检查响应是否有效
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // 克隆响应，因为响应只能被消费一次
          const responseToCache = response.clone();

          // 将新获取的资源添加到缓存中
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        }).catch(() => {
          // 网络请求失败时的处理
          // 对于导航请求，可以返回一个备用页面
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// 监听消息事件，可以从主线程接收消息
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 添加sync事件监听器，用于在恢复网络连接后同步数据
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-finance-data') {
    event.waitUntil(
      // 这里可以添加数据同步逻辑
      // 例如：将本地存储的数据发送到服务器
      // 由于这是一个纯客户端应用，这里只是记录同步尝试
      console.log('尝试同步财务数据...')
    );
  }
});