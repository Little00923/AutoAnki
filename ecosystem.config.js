module.exports = {
  apps: [{
    name: 'autoanki',
    script: './server.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false,
    // 进程崩溃后重启延迟
    restart_delay: 4000,
    // 最大重启次数（10分钟内）
    max_restarts: 10,
    min_uptime: '10s',
    // 优雅退出超时时间
    kill_timeout: 5000,
    // 监听进程异常退出
    listen_timeout: 3000,
    // 环境变量文件
    env_file: '.env'
  }]
};


