import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
import ts from 'typescript';
const directory=fs.mkdtempSync(path.join(os.tmpdir(),'party-questions-'));
try {
 const file=path.join(directory,'questions.cjs');
 fs.writeFileSync(file,ts.transpileModule(fs.readFileSync('lib/quiz/questions.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText);
 const {QUESTIONS}=createRequire(import.meta.url)(file);
 const sections=[['Personality questions',q=>q.kind==='personality'&&!q.parent],['Follow-up questions',q=>!!q.parent],['Party questions',q=>q.kind==='party']];
 let text='# The 100 questions\n\nThese are the complete authored questions and their four choices. Every question also offers **other (i have an answer)**, which opens the only free-text field. Choice order is shuffled during play.\n\nEdit `lib/quiz/questions.ts`, then run `pnpm export:questions` to refresh this reading copy.\n';
 for(const [title,filter] of sections){text+=`\n## ${title}\n`;for(const q of QUESTIONS.filter(filter)){text+=`\n### ${q.id} — ${q.prompt}\n\n`;if(q.parent)text+=`Only after **${q.parent}**. The player's actual earlier answer is quoted above this question.\n\n`;q.choices.forEach(c=>text+=`- ${c.text}\n`);}}
 fs.writeFileSync('QUESTIONS.md',text);
 console.log(`Exported ${QUESTIONS.length} questions to QUESTIONS.md.`);
}finally{fs.rmSync(directory,{recursive:true,force:true});}
