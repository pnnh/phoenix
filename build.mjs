#!/usr/bin/env -S deno run --allow-env --allow-run --allow-read --allow-write

import {$, cd} from 'https://deno.land/x/zx_deno/mod.mjs'

await $`date`

async function buildPolaris() {
    // 构建应用
    await $`npm install`
    await $`npm run build`
    await $`docker build -t polaris-nextjs -f Dockerfile .`

    // 集成环境下重启容器
    await $`docker rm -f polaris-nextjs`
    await $`docker run -d --restart=always \
            --name polaris-nextjs \
            -v /home/azureuser/projects/blog:/data/blog \
            -p 8100:8100 \
            polaris-nextjs`
}

await buildPolaris()
