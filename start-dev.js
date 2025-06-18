const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 启动开发环境...\n');

// 启动后端
console.log('📦 启动后端服务...');
const backend = spawn('npm', ['start'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
});

// 等待后端启动
setTimeout(() => {
  console.log('🌐 启动前端服务...');
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'frontend'),
    stdio: 'inherit',
    shell: true
  });

  // 处理进程退出
  process.on('SIGINT', () => {
    console.log('\n🛑 正在关闭服务...');
    backend.kill();
    frontend.kill();
    process.exit();
  });

  frontend.on('close', (code) => {
    console.log(`前端服务已退出，退出码: ${code}`);
    backend.kill();
  });
}, 3000);

backend.on('close', (code) => {
  console.log(`后端服务已退出，退出码: ${code}`);
});

console.log('✅ 服务启动中，请稍候...');
console.log('📝 后端地址: http://localhost:3000');
console.log('🌐 前端地址: http://localhost:5173');
console.log('⏹️  按 Ctrl+C 停止所有服务\n'); 