import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./migrated_prompt_history/prompt_2026-02-18T06:50:30.771Z.json', 'utf8'));

let appTsxContent = '';
let typesTsContent = '';
let flameButtonContent = '';
let geminiStudioContent = '';
let indexHtmlContent = '';

let aiChatContent = '';
let liveSessionContent = '';
let bottomNavContent = '';
let geminiServiceContent = '';

for (const entry of data) {
  if (entry.payload && entry.payload.type === 'generationTable') {
    for (const gen of entry.payload.entries) {
      if (gen.path === 'App.tsx' && gen.diffs && gen.diffs.length > 0) {
        appTsxContent = gen.diffs[0].replacement;
      }
      if (gen.path === 'types.ts' && gen.diffs && gen.diffs.length > 0) {
        typesTsContent = gen.diffs[0].replacement;
      }
      if (gen.path === 'components/FlameButton.tsx' && gen.diffs && gen.diffs.length > 0) {
        flameButtonContent = gen.diffs[0].replacement;
      }
      if (gen.path === 'components/GeminiStudio.tsx' && gen.diffs && gen.diffs.length > 0) {
        geminiStudioContent = gen.diffs[0].replacement;
      }
      if (gen.path === 'index.html' && gen.diffs && gen.diffs.length > 0) {
        indexHtmlContent = gen.diffs[0].replacement;
      }
      if (gen.path === 'components/AIChat.tsx' && gen.diffs && gen.diffs.length > 0) {
        aiChatContent = gen.diffs[0].replacement;
      }
      if (gen.path === 'components/LiveSession.tsx' && gen.diffs && gen.diffs.length > 0) {
        liveSessionContent = gen.diffs[0].replacement;
      }
      if (gen.path === 'components/BottomNav.tsx' && gen.diffs && gen.diffs.length > 0) {
        bottomNavContent = gen.diffs[0].replacement;
      }
      if (gen.path === 'services/geminiService.ts' && gen.diffs && gen.diffs.length > 0) {
        geminiServiceContent = gen.diffs[0].replacement;
      }
    }
  }
}

fs.writeFileSync('./src/App.tsx', appTsxContent);
fs.writeFileSync('./src/types.ts', typesTsContent);
fs.mkdirSync('./src/components', { recursive: true });
fs.mkdirSync('./src/services', { recursive: true });
fs.writeFileSync('./src/components/FlameButton.tsx', flameButtonContent);
if (geminiStudioContent) fs.writeFileSync('./src/components/GeminiStudio.tsx', geminiStudioContent);
if (aiChatContent) fs.writeFileSync('./src/components/AIChat.tsx', aiChatContent);
if (liveSessionContent) fs.writeFileSync('./src/components/LiveSession.tsx', liveSessionContent);
if (bottomNavContent) fs.writeFileSync('./src/components/BottomNav.tsx', bottomNavContent);
if (geminiServiceContent) fs.writeFileSync('./src/services/geminiService.ts', geminiServiceContent);
if (indexHtmlContent) fs.writeFileSync('./index.html', indexHtmlContent);
console.log('Files restored.');
