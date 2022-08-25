const Koa = require('koa')
const router = require('koa-router')()
const fs = require('fs')

const server = new Koa()

router.get('/', async (ctx, next) => {
    ctx.type = 'html'
    ctx.body = fs.readFileSync('index.html')
})

router.get('/:url', async (ctx, next) => {
    // ctx.
    if (ctx.params.url.indexOf('.js') != -1) {
        ctx.type = 'text/javascript'
    }

    ctx.body = fs.readFileSync(ctx.params.url)
})

server.use(router.routes())

server.listen(5050)
console.log('http://127.0.0.1:5050')
