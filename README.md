# Koa2-Blog

> 基于 `NodeJS+Koa2+MongoDB+PM2+EJS` 架构开发的响应式博客网站

* NodeJS+Koa2：进行请求的监听与处理
* MongoDB：进行数据存储以及大文件存储
* PM2：进行网站的部署与管理
* EJS：模板引擎

## 安装使用

### 下载依赖
```bash
npm install
```

### 启动应用
```bash
npm run start
```

### 构建应用
```bash
npm run build
```

### 部署应用
```bash
npm run deploy:setup 
# 仅初次部署需要先setup，运行完后，后期只需要update
npm run deploy:update
```

### MongoDB配置
```bash
将 mongodb.config.js.template 重命名为 mongodb.config.js
并配置对应xxx的信息
```

### PM2配置
```bash
将 ecosystem.config.js.template 重命名为 ecosystem.config.js
并配置对应xxx的信息
```

## 博客编写

通过`markdown`进行编写

编写完成后，在`blogInfo.json`中对显示数据进行设置

然后通过`updateBlog.js`脚本，将 blogInfo.json 中的数据写入到mongodb数据库中