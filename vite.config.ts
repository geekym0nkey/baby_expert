import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

export default defineConfig(({ mode }) => {
  const root = process.cwd();
  // 載入環境變數
  const env = loadEnv(mode, root, '');
  
  // 【除錯專用】實體檔案檢查
  const envLocalPath = path.resolve(root, '.env.local');
  const envPath = path.resolve(root, '.env');
  const envLocalExists = fs.existsSync(envLocalPath);
  const envExists = fs.existsSync(envPath);

  console.log(`\n[BabyZen 診斷] -------------------------`);
  console.log(`[運作目錄]: ${root}`);
  console.log(`[.env.local 檔案]: ${envLocalExists ? '✅ 存在' : '❌ 不存在'}`);
  console.log(`[.env 檔案]: ${envExists ? '✅ 存在' : '❌ 不存在'}`);
  
  let apiKey = env.API_KEY || "";
  
  // 如果檔案存在但抓不到 API_KEY，嘗試直接讀取檔案內容（最後手段）
  if (!apiKey && envLocalExists) {
    try {
      const content = fs.readFileSync(envLocalPath, 'utf-8');
      const match = content.match(/API_KEY\s*=\s*([^\s]+)/);
      if (match && match[1]) {
        apiKey = match[1].replace(/['";]/g, ''); // 移除可能的引號
        console.log(`[手動抓取]: 已從檔案內容直接提取金鑰`);
      }
    } catch (e) {
      console.error(`[讀取失敗]: ${e}`);
    }
  }

  if (apiKey) {
    console.log(`[API 狀態]: ✅ 已就緒 (前綴: ${apiKey.substring(0, 6)}...)`);
  } else {
    console.warn(`[API 狀態]: ❌ 找不到 API_KEY 變數`);
    console.warn(`請確保檔案內有這一行: API_KEY=你的金鑰`);
  }
  console.log(`---------------------------------------\n`);

  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(apiKey)
    },
    server: {
      port: 3000,
      open: true
    }
  };
});