#!/usr/bin/env bash
# 打包
zip -r dist.zip api

# 上传
scp dist.zip root@112.74.185.120:/root

# 解压缩
ssh root@112.74.185.120 << EOF
unzip -o /root/dist.zip -d /root/www/cat-app
EOF