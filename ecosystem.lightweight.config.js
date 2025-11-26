module.exports = {
  apps: [{
    name: 'autoanki',
    script: './server.js',
    
    // 单实例模式（适合1核CPU）
    instances: 1,
    exec_mode: 'fork',  // fork模式，不使用cluster
    
    // 环境变量
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      // 限制Node.js最大内存为400MB
      NODE_OPTIONS: '--max-old-space-size=400'
    },
    
    // 内存限制：超过400MB自动重启
    max_memory_restart: '400M',
    
    // 自动重启设置
    autorestart: true,
    max_restarts: 5,           // 10分钟内最多重启5次
    min_uptime: '30s',         // 至少运行30秒才算成功启动
    restart_delay: 3000,       // 重启延迟3秒
    
    // 不监听文件变化
    watch: false,
    
    // 日志配置（轻量级）
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    log_type: 'raw',  // 原始日志，不用json格式（节省空间）
    
    // 定时重启（每天凌晨3点）
    cron_restart: '0 3 * * *',
    
    // 优雅退出
    kill_timeout: 5000,
    listen_timeout: 3000,
    
    // 环境变量文件
    env_file: '.env',
    
    // 忽略的监听文件
    ignore_watch: [
      'node_modules',
      'logs',
      'database',
      'backups',
      '.git'
    ],
    
    // 实例间隔时间（毫秒）
    instance_var: 'INSTANCE_ID',
    
    // 进程标题
    instance_name: 'autoanki-light'
  }]
};


