const fs = require('fs')
const path = require('path')
const { port, storagePath } = require('../../server/config')
const { STORAGE_DIR } = require('../../nuxt.config').env

fs.writeFileSync(path.join(__dirname, 'nginx.conf'), `
#user  nobody;
worker_processes  auto;

#error_log  logs/error.log;
#error_log  logs/error.log  notice;
#error_log  logs/error.log  info;

#pid        logs/nginx.pid;

worker_rlimit_nofile 100000;

events {
    worker_connections  65535;
    multi_accept on;
}


http {
    include       mime.types;
    default_type  application/octet-stream;

    #log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
    #                  '$status $body_bytes_sent "$http_referer" '
    #                  '"$http_user_agent" "$http_x_forwarded_for"';

    #access_log  logs/access.log  main;

    sendfile        off;
    tcp_nopush     on;
    tcp_nodelay on;

    keepalive_timeout  65;
    client_max_body_size 1G;

    #gzip  on;

    server {
        listen       ${port.nginx};
        server_name  localhost;

        location /${STORAGE_DIR} {
            alias   ${storagePath.root};
            index  index.html;
        }

        location / {
            proxy_pass   http://127.0.0.1:${port.basic};
        }

        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    }
}
`, 'utf8')