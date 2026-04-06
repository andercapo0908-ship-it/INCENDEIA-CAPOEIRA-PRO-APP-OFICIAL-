const fs = require('fs');

const data = JSON.parse(fs.readFileSync('/migrated_prompt_history/prompt_2026-02-18T06:50:30.771Z.json', 'utf8'));

let appTsxContent = '';

for (const entry of data) {
  if (entry.payload && entry.payload.type === 'generationTable') {
    for (const gen of entry.payload.entries) {
      if (gen.path === 'App.tsx' && gen.diffs && gen.diffs.length > 0) {
        appTsxContent = gen.diffs[0].replacement;
      }
    }
  }
}

fs.writeFileSync('./src/App.tsx', appTsxContent);
console.log('App.tsx restored.');
