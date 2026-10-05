'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { getQuestion } from '@/lib/quiz/questions';
import { PALETTES } from '@/lib/quiz/palettes';
import { PLAYSTYLES } from '@/lib/quiz/roster';
import { OTHER_LIMIT, STATS, TOTAL_ANSWERS, callbackFor, choiceOrder, comfortFor, createRun, moodType, partyFor, personalityFor, playerStats, restoreRun, rewindRun, submitAnswer, type Run } from '@/lib/quiz/engine';

const SAVE_KEY='waiting-room:party-quiz:v4';
const SETTINGS_KEY='waiting-room:display:v3';
function freshRun(){const seed=new Uint32Array(1);crypto.getRandomValues(seed);return createRun(seed[0]);}

export default function Home(){
  const [run,setRun]=useState<Run|null>(null);
  const [selection,setSelection]=useState('');
  const [custom,setCustom]=useState('');
  const [gradient,setGradient]=useState(true);
  const [reset,setReset]=useState(false);
  const [error,setError]=useState('');
  const [storageError,setStorageError]=useState(false);
  const heading=useRef<HTMLHeadingElement>(null);
  const otherInput=useRef<HTMLTextAreaElement>(null);
  const locked=useRef(false);
  const answered=run?.answers.length??0;
  const q=getQuestion(run?.currentId??null);
  const mood=PALETTES[moodType(run)];
  const choices=useMemo(()=>run&&q?choiceOrder(run,q):[],[run,q]);
  const echo=run&&q?callbackFor(run,q):null;
  const party=useMemo(()=>run?partyFor(run):[],[run]);
  const profile=run?personalityFor(run):'INTP';
  const comfort=run?comfortFor(run):null;
  const stats=run?playerStats(run.seed):null;

  useEffect(()=>{
    let restored:Run|null=null;
    try{
      const display=localStorage.getItem(SETTINGS_KEY);
      if(display)setGradient(JSON.parse(display).gradient!==false);
      const raw=sessionStorage.getItem(SAVE_KEY);
      if(raw){
        const data=JSON.parse(raw);restored=restoreRun(JSON.stringify(data.run));
        const draft=data.draft,current=getQuestion(restored?.currentId??null);
        if(current&&draft&&typeof draft.selection==='string'&&typeof draft.custom==='string'&&
          (draft.selection==='other'||current.choices.some(c=>c.id===draft.selection))){
          setSelection(draft.selection);setCustom(draft.custom.slice(0,OTHER_LIMIT));
        }
      }
    }catch{setStorageError(true);}
    setRun(restored??freshRun());
  },[]);
  useEffect(()=>{
    if(!run)return;
    try{localStorage.setItem(SETTINGS_KEY,JSON.stringify({gradient}));}catch{setStorageError(true);}
  },[gradient,run]);
  useEffect(()=>{
    if(!run)return;
    try{sessionStorage.setItem(SAVE_KEY,JSON.stringify({run,draft:{selection,custom}}));}catch{setStorageError(true);}
  },[run,selection,custom]);
  useEffect(()=>{
    locked.current=false;setError('');heading.current?.focus({preventScroll:true});
  },[run?.currentId]);
  useEffect(()=>{if(selection==='other')otherInput.current?.focus({preventScroll:true});},[selection]);

  function answer(){
    if(!run||!selection||locked.current||reset)return;
    try{
      const next=submitAnswer(run,selection,custom);locked.current=true;
      setRun(next);setSelection('');setCustom('');window.scrollTo({top:0,behavior:'instant'});
    }catch(e){setError(e instanceof Error?e.message:'That answer could not be saved. Try again.');}
  }
  function back(){
    if(!run||!run.answers.length)return;
    const a=run.answers.at(-1)!;setRun(rewindRun(run));setSelection(a.choiceId);setCustom(a.text);
    window.scrollTo({top:0,behavior:'instant'});
  }
  function begin(){setRun(freshRun());setSelection('');setCustom('');setReset(false);setError('');locked.current=false;window.scrollTo({top:0,behavior:'instant'});}
  const partyDownload=run&&party.length?`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify({format:'waiting-room-party-v3',seed:run.seed,playerType:profile,playerStats:stats,comfortStyle:comfort?.hasEvidence?comfort.style:null,party:party.map(s=>({role:s.role,character:s.character,reason:s.reason}))},null,2))}`:undefined;

  return <div className={`room ${gradient?'':'solid-mode'}`} style={{'--tone-a':mood.a,'--tone-b':mood.b,'--tone-c':mood.c,'--tone-solid':mood.solid,'--accent':mood.accent} as CSSProperties}>
    <div className="backdrop" aria-hidden="true"><div className="gradient-layer"/></div>
    <div className="quiz-shell">
      <header className="quiz-header"><span className="wordmark">Party quiz</span><label className="display-toggle"><input type="checkbox" checked={gradient} onChange={e=>setGradient(e.target.checked)}/>Gradient</label></header>
      <main>
        {!run&&<p role="status">Loading…</p>}
        {run&&q&&<form onSubmit={e=>{e.preventDefault();answer();}} aria-label="Party quiz">
          <p className="counter">Question {answered+1} / {TOTAL_ANSWERS}</p>
          {echo&&<blockquote className="callback"><span>Earlier, you said:</span>“{echo}”</blockquote>}
          <h1 id="question-title" ref={heading} tabIndex={-1}>{q.prompt}</h1>
          <RadioGroup value={selection} onValueChange={setSelection} aria-labelledby="question-title" className="answers">
            {choices.map(c=><label className={`answer ${selection===c.id?'selected':''}`} htmlFor={`${q.id}-${c.id}`} key={c.id}><RadioGroupItem value={c.id} id={`${q.id}-${c.id}`}/><span>{c.text}</span></label>)}
            <label className={`answer ${selection==='other'?'selected':''}`} htmlFor={`${q.id}-other`}><RadioGroupItem value="other" id={`${q.id}-other`}/><span>Other.</span></label>
          </RadioGroup>
          {selection==='other'&&<div className="other-field"><label htmlFor="custom-answer">Your answer</label><textarea id="custom-answer" ref={otherInput} value={custom} onChange={e=>setCustom(e.target.value)} maxLength={OTHER_LIMIT} rows={3} required aria-describedby="other-note"/><p id="other-note">{custom.length} / {OTHER_LIMIT}</p></div>}
          {error&&<p className="error" role="alert">{error}</p>}
          <div className="actions"><button type="button" className="back" onClick={back} disabled={answered===0}>Back</button><button type="submit" className="primary" disabled={!selection||(selection==='other'&&!custom.trim())||reset}>{answered===19?'See your party':'Next'}</button></div>
        </form>}
        {run&&party.length>0&&stats&&<section aria-label="Your result">
          <p className="counter">20 / 20</p><h1 ref={heading} tabIndex={-1}>Your party</h1>
          <p className="profile">Your type: <strong>{profile}</strong></p>
          <ol className="party-list">{party.map(slot=>{const c=slot.character;return <li key={c.id}>
            <p className="role">{slot.role}</p><h2>{c.name} <span>{c.pronouns}</span></h2>
            <p>{c.description}</p><details><summary>Why {c.name}?</summary><p>{slot.reason}</p><p>{c.type} · {c.species} · {PLAYSTYLES[c.playstyle].name}</p>{c.kind==='mc'&&<p>{c.age} · {c.blood} · Year of the {c.zodiac}</p>}</details>
          </li>;})}</ol>
          <details className="stats-details"><summary>Your player stats</summary><p>Rolled for you, separate from your MC.</p><dl className="stats">{STATS.map(stat=><div key={stat}><dt>{stat}</dt><dd>{stats[stat]} / 10</dd></div>)}</dl><p className="seed">Seed: {run.seed.toString(16).toUpperCase().padStart(8,'0')}</p></details>
          <div className="actions result-actions"><a href={partyDownload} download={`my-party-${run.seed}.json`} className="download">Save party</a><button onClick={()=>setReset(true)}>New run</button><button className="back" onClick={back}>Back</button></div>
        </section>}
      </main>
      {(reset||storageError)&&<footer>
        {reset&&<div className="reset-prompt" role="alert"><p>Replace this run and start again?</p><div className="actions"><button onClick={()=>setReset(false)}>Keep this run</button><button onClick={begin}>Start over</button></div></div>}
        {storageError&&<p className="error" role="status">This browser couldn't save your place. You can still finish the quiz here.</p>}
      </footer>}
    </div>
  </div>;
}
