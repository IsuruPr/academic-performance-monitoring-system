import fs from 'fs';
import path from 'path';

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Revert back to dark theme components
  content = content.replaceAll('bg-[#f8fafc]', 'bg-[#121212]');
  content = content.replaceAll('bg-white', 'bg-[#1a1a1a]');
  content = content.replaceAll('bg-[#f1f5f9]', 'bg-[#232323]');
  content = content.replaceAll('border-[#e2e8f0]', 'border-[#333333]');
  
  // Text colors
  content = content.replaceAll('text-slate-900', 'text-white');
  content = content.replaceAll('text-slate-500', 'text-white/50');
  content = content.replaceAll('text-slate-600', 'text-white/60');
  content = content.replaceAll('text-slate-700', 'text-white/70');
  
  fs.writeFileSync(filePath, content, 'utf8');
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      replaceInFile(fullPath);
    }
  }
}

processDirectory('./src/components');
processDirectory('./src/pages');
