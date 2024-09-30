import { $ } from 'zx'

await $`date`

async function buildPolaris() {
    // 构建应用
    await $`npm install`
    await $`npm run build`
    await $`docker build -t polaris-worker -f Dockerfile .`

    // 集成环境下重启容器
    await $`docker rm -f polaris-worker`
    await $`docker run -d --restart=always \
            --name polaris-worker \
            -v /home/azureuser/projects/blog:/data/blog \
            -p 8101:8101 \
            polaris-worker`
}

await buildPolaris()
