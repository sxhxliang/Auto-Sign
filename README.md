=====
Auto sign sstmlt and zairenku

非常简单粗暴的自动签到，技术上基本就是api堆积，难点反而是在分析目标网站上

说到底不过是获取登陆后的cookie，然后看看签到需要的参数，特别是那些特殊的参数，有的需要解析一下HTML或是直接正则出来。最后再模拟以个请求发送到服务器，再给个邮件提醒。

虽然我想基本上不会有人来访问的，但是

    Config 里面是填写账号密码相关信息的，当然你可以直接写死
    然后会有几个依赖库
    1. nodemailer
    2. node-schedule
    写到这里突然想起来我为什么不写一个package.json呢..... =.=|



 nohup node main.js > slog.log &
