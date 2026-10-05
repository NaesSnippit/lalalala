import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import ts from 'typescript';
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'party-quiz-check-'));
try {
  for(const file of fs.readdirSync('lib/quiz').filter(f=>f.endsWith('.ts'))){
    const compiled=ts.transpileModule(fs.readFileSync(`lib/quiz/${file}`,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
    fs.writeFileSync(path.join(temporary,file.replace(/\.ts$/,'.js')),compiled.outputText);
  }
  const require=createRequire(import.meta.url);
  const E=require(path.join(temporary,'engine.js')),Q=require(path.join(temporary,'questions.js')),R=require(path.join(temporary,'roster.js')),P=require(path.join(temporary,'palettes.js'));
  assert.equal(Q.QUESTIONS.length,100);
  assert.equal(new Set(Q.QUESTIONS.map(q=>q.id)).size,100);
  assert.equal(new Set(Q.QUESTIONS.map(q=>q.prompt)).size,100);
  assert.equal(Q.QUESTIONS.filter(q=>q.kind==='party').length,20);
  assert.equal(Q.QUESTIONS.filter(q=>q.parent).length,20);
  for(const q of Q.QUESTIONS){assert.equal(q.choices.length,4);assert.equal(new Set(q.choices.map(c=>c.text)).size,4);assert(q.prompt.endsWith('?'));if(q.parent)assert(Q.getQuestion(q.parent));}
  assert.equal(R.ROSTER.length,16);assert.equal(new Set(R.ROSTER.map(c=>c.id)).size,16);
  assert.equal(R.ROSTER.filter(c=>c.kind==='mc').length,4);
  assert.equal(R.ROSTER.filter(c=>c.kind==='companion').length,12);
  assert.equal(Object.keys(P.PALETTES).length,16);
  assert.equal(new Set(Object.values(P.PALETTES).map(p=>[p.a,p.b,p.c].join())).size,16);
  const seen=new Set(),mcs=new Set(),companions=new Set();
  for(let seed=0;seed<512;seed++){
    let run=E.createRun(seed);const rng=E.random(seed,'test-answer');let callbacks=0;
    for(let i=0;i<20;i++){
      const q=Q.getQuestion(run.currentId);assert(q);seen.add(q.id);
      assert.equal(q.kind,i<15?'personality':'party');
      assert.equal(E.partyFor(run).length,0,'No premature result.');
      if(q.parent){assert(run.answers.some(a=>a.questionId===q.parent));assert(E.callbackFor(run,q));callbacks++;}
      const useOther=seed%17===0||(i+seed)%19===0;
      const next=E.submitAnswer(run,useOther?'other':q.choices[Math.floor(rng()*4)].id,useOther?'i would check what everyone wants first.':'');
      assert.deepEqual(E.rewindRun(next),run,'Back returns to the exact prior question.');
      run=next;
      if(i===8||i===19)assert.deepEqual(E.restoreRun(JSON.stringify(run)),run);
    }
    assert.equal(run.answers.length,20);assert.equal(new Set(run.answers.map(a=>a.questionId)).size,20);assert.equal(run.currentId,null);assert.equal(callbacks,4);
    const {evidence}=E.scoresFor(run);if(seed%17!==0)assert(Object.values(evidence).every(n=>n<=4));
    const party=E.partyFor(run),[main,challenge,seeded,scratch]=party;
    assert.equal(party.length,4);assert.equal(new Set(party.map(s=>s.character.id)).size,4);
    assert.equal(main.character.kind,'mc');assert(party.slice(1).every(s=>s.character.kind==='companion'));
    const opposite=[...E.personalityFor(run)].map((letter,i)=>E.AXES[i].replace(letter,'')).join('');
    const mismatch=c=>[...c.type].filter((letter,i)=>letter!==opposite[i]).length;
    assert.equal(mismatch(main.character),Math.min(...R.ROSTER.filter(c=>c.kind==='mc').map(mismatch)));
    assert.equal(scratch.character.type,[...main.character.type].map((letter,i)=>E.AXES[i].replace(letter,'')).join(''));
    assert.notEqual(challenge.character.playstyle,E.comfortFor(run).style);
    const stats=E.playerStats(seed);assert(Object.values(stats).every(n=>Number.isInteger(n)&&n>=1&&n<=10));
    const eligible=R.ROSTER.filter(c=>c.kind==='companion'&&c.id!==scratch.character.id&&c.id!==challenge.character.id);
    assert.equal(E.statFit(seeded.character,stats),Math.max(...eligible.map(c=>E.statFit(c,stats))));
    assert.deepEqual(E.partyFor(E.restoreRun(JSON.stringify(run))),party);
    assert.throws(()=>E.submitAnswer(run,'a'));
    mcs.add(main.character.id);party.slice(1).forEach(s=>companions.add(s.character.id));
  }
  assert.equal(seen.size,100,'All 100 questions are reachable.');assert.equal(mcs.size,4);assert.equal(companions.size,12);
  const empty=E.createRun(123);
  assert.throws(()=>E.submitAnswer(empty,'unknown'));assert.throws(()=>E.submitAnswer(empty,'other','   '));assert.throws(()=>E.submitAnswer(empty,'other','a'.repeat(401)));
  assert.equal(E.restoreRun('{bad json'),null);assert.equal(E.restoreRun(JSON.stringify({...empty,seed:-1})),null);
  assert.equal(E.restoreRun(JSON.stringify({...empty,currentId:'p01'})),null);
  const typed=E.submitAnswer(empty,'other','<script>alert(1)</script>');assert.equal(typed.answers[0].text,'<script>alert(1)</script>');assert.deepEqual(E.scoresFor(typed).scores,E.scoresFor(empty).scores);
  const roll=E.playerStats(123);E.choiceOrder(empty,Q.getQuestion(empty.currentId));assert.deepEqual(E.playerStats(123),roll);
  console.log('PASS: 100 reachable authored questions, 512 complete runs, 15 + 5 split, four unique members, opposite MC, playstyle contrast, independent seeded stats, exact post-scratch, callbacks, back/resume, and invalid-input handling.');
} finally {fs.rmSync(temporary,{recursive:true,force:true});}
