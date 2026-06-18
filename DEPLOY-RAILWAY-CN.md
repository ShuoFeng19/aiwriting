# 单流程网站线上部署：Railway + Volume

这个简化版本不需要配置数据库。Railway 负责运行网站，Volume 负责长期保存学生数据。
部署完成后，学生可以直接打开公开网址，你的电脑不需要保持开机。

## 准备

需要：

1. 一个 GitHub 账号
2. 一个 Railway 账号
3. 一个 OpenAI API key

学生数据建议只使用匿名 Student ID，不要填写姓名。

## 第一步：上传代码到 GitHub

1. 解压项目压缩包。
2. 登录 [GitHub](https://github.com/)。
3. 新建一个 **Private repository**，例如 `ai-writing-single-flow-app`。
4. 把解压后的项目文件上传到这个 repository。
5. 不要上传 `.env.local`。这个文件可能包含 API key。

## 第二步：在 Railway 部署

1. 登录 [Railway](https://railway.com/)。
2. 点击 **New Project**。
3. 选择 **Deploy from GitHub repo**。
4. 选择刚才创建的 private repository。
5. Railway 会自动读取 `railway.json`，执行构建并启动网站。

## 第三步：填写环境变量

在 Railway 的网站服务中打开 **Variables** 页面，添加：

```text
OPENAI_API_KEY=你的 OpenAI API key
OPENAI_MODEL=gpt-5.4-mini
ADMIN_PASSWORD=你设置的教师端密码
```

保存变量并确认重新部署。

## 第四步：挂载 Volume 保存学生数据

这一步非常重要。没有 Volume，重新部署后学生记录可能丢失。

1. 在 Railway 项目画布中找到你的网站服务。
2. 给这个服务添加或挂载一个 **Volume**。
3. Mount path 填写：

```text
/data
```

4. 保存后等待 Railway 自动重新部署。

程序会自动读取 Railway 提供的 `RAILWAY_VOLUME_MOUNT_PATH`，不需要另外设置
`DATA_DIR`。

## 第五步：生成学生访问网址

1. 打开网站服务的 **Settings**。
2. 找到 **Networking**。
3. 点击 **Generate Domain**。
4. Railway 会生成一个公开网址，例如：

```text
https://your-app-name.up.railway.app
```

学生打开这个网址即可使用。

教师导出页面是：

```text
https://your-app-name.up.railway.app/admin
```

## 正式实验前检查

1. 用一个测试 Student ID 保存一条记录。
2. 打开 `/admin`，输入教师密码。
3. 确认可以看到测试记录。
4. 点击 **Export CSV**，确认可以下载 CSV。
5. 删除测试记录前，可以重新部署一次网站并确认记录仍然存在。这样可以验证
   Volume 已正确挂载。

## 数据提醒

- 使用匿名 Student ID。
- 不要公开教师密码。
- 不要把 OpenAI API key 写进网页代码、GitHub 或发给学生。
- 定期从 `/admin` 导出 CSV 作为备份。

## 官方文档

- [Railway 部署 Next.js](https://docs.railway.com/guides/nextjs)
- [Railway Volumes](https://docs.railway.com/develop/volumes)
- [Railway Variables](https://docs.railway.com/variables)
