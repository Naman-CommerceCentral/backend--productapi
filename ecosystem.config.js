// ecosystem.config.js
export default {
    apps: [
        {
            name: "aap1",
            script: "aap1.js",
            watch: true,
            ignore_watch: ["node_modules", ".data", "client/build"],
            env: {
                NODE_ENV: "development",
            },
            env_production: {
                NODE_ENV: "production",
            },
        },
    ],
};
