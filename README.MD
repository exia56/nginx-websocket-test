# server

### startup

自訂 `PORT` 設定。
> PORT=PORT npx ts-node server/app.ts

### api

* /ws/:pid
  * websocket 連線。
  * 需要加上 header 的 cid 欄位。
* /info
  * 取得 server 已連線的資訊。

# client

多連線程式。

> npx ts-node clients/batch-clients.ts -p PORT [-s STATION_ID_PREFIX] [-c DEVICE_ID_PREFIX] [-cc DEVICE_COUNT] [-sc STATION_COUNT]

example:

* 連線到 80 port， 共 50個 station， 每個 station 10個 device。
  * npx ts-node clients/batch-clients.ts -p 80 -sc 50 -cc 10

# 測試流程

測試過程中，自行連線到相應的 server 的 /info api 取得連線的 station & device 數量。（不經過 nginx load balancer）

1. 2台 server， 50個 station， 每個 station 有10個 device 連線。
    * 同樣 station 的 device 應該都連到同樣的 server。
1. 新增一台 server， 更新 nginx.conf， 增加一個 server 的 ip & port。
    * reload nginx 後，目前有的 websocket 連線沒有斷線。
1. 額外增加30個 station（station id 一樣）， 每個 station 有10個 device 連線到目前3台 server。
    * 預計不會有 device 連線到第3台 server。
    * **但實際情況出現，一部分連線到對的server， 一部分連線到第3台 server。**
1. 再增加不同的 30個 station， 每個 station 有 10個 device 連線。
    * 同樣 station 的 device 應該都連到同樣的 server。
1. 減少一台 server， 更新 nginx.conf， 增加一個 server 的 ip & port。
    * reload nginx 後，目前有的 websocket 連線沒有斷線。
    * 舊有的 device 連線，重新連線後需要依照 station id 連線到對的 server。
