# 云开发WEB实战应用｜基于WEB-RTC实现的视频会议应用

## 一、应用简介
利用浏览器WEB-RTC实现的视频会议WEB应用，具有如下功能：
- 创建房间（自动生成6位数字）
- 加入房间，两端P2P连接，进行录制视频流传输
- 任意一方断开连接，另一端相应
- 创建者断开连接时，自动保留原有房间，数字不变
- 视频小窗可自由切换我方或对方视频

应用的房间管理以及，两端连接的信令交换使用云开发云函数操作云开发数据库进行；
应用的登录使用云开发匿名登录，30天local方式，当用户不主动清缓存，用户身份不变；

## 二、部署说明
- 创建使用云开发按量计费环境，开通静态网站托管服务
- 登录管理打开匿名登录开关
- 云开发数据库创建集合，名称为room
- 将项目目录cloudbaserc.json中envId替换成自己环境ID
- 将项目目录webviews/index.html中27行左右，CloudBase.envId 替换成自己环境ID
- 将项目目录functions内所有云函数部署上传（云端安装依赖）
- 将项目目录webviews内所有文件上传至静态网站托管服务

## 三、作品贡献
- React版本实现[DEMO](https://github.com/feross/simple-peer#connection-does-not-work-on-some-networks)【作者：[booker](https://github.com/binggg)】
- RTC实战[Simple-peer](https://github.com/feross/simple-peer)

## 四、使用注意
本应用只能在两端间网络简单的情况下才可以正常运行，如果两端网络存在NAT穿越（NAT traversal）或防火墙，则不能够正常连接；但是你仍然可以改造此项目，使用TURN中继服务器来进行。
[Simple-peer如何配置TURN](https://github.com/feross/simple-peer#connection-does-not-work-on-some-networks)｜[WEBRTC STUN/TURN服务列表](https://gist.github.com/sagivo/3a4b2f2c7ac6e1b5267c2f1f59ac6c6b)

[![](https://camo.githubusercontent.com/e06d9d72eecca61c1ba39fdf19868f70fcb3a9b3/68747470733a2f2f63646e2e7261776769742e636f6d2f6665726f73732f7374616e646172642f6d61737465722f62616467652e737667)](https://github.com/feross/standard)