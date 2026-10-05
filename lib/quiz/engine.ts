import { QUESTIONS, getQuestion } from './questions';
import { PLAYSTYLES, ROSTER } from './roster';
import type { Answer, Axis, Character, Facet, PartySlot, PersonalityType, Playstyle, Question, Run, Stat } from './types';
export type { Run } from './types';
export const TOTAL_ANSWERS=20;
export const PERSONALITY_ANSWERS=15;
export const OTHER_LIMIT=400;
export const AXES:Axis[]=['EI','SN','TF','JP'];
export const STATS:Stat[]=['Might','Grit','Agility','Insight','Focus','Charm'];
const FACETS:Facet[]=['opening','pressure','resources','teamwork','payoff'];
const STYLES:Playstyle[]=['strike','guard','scheme','support'];

/** Independent streams prevent UI ordering, characters, or answers changing a stat roll. */
export function random(seed:number, stream:string):()=>number {
  let value=seed>>>0;
  for(let i=0;i<stream.length;i++)value=Math.imul(value^stream.charCodeAt(i),16777619)>>>0;
  return ()=>{value+=0x6D2B79F5;let n=value;n=Math.imul(n^(n>>>15),n|1);n^=n+Math.imul(n^(n>>>7),n|61);return ((n^(n>>>14))>>>0)/4294967296;};
}
function shuffled<T>(values:T[],rng:()=>number):T[]{
  const result=[...values];
  for(let i=result.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
  return result;
}
export function choiceOrder(run:Run,q:Question){return shuffled(q.choices,random(run.seed,`choices:${q.id}`));}
export function scoresFor(run:Run){
  const scores:Record<Axis,number>={EI:0,SN:0,TF:0,JP:0};
  const evidence:Record<Axis,number>={EI:0,SN:0,TF:0,JP:0};
  for(const a of run.answers){const q=getQuestion(a.questionId);const c=q?.choices.find(c=>c.id===a.choiceId);if(q?.axis&&c){scores[q.axis]+=c.score??0;evidence[q.axis]++;}}
  return {scores,evidence};
}
export function personalityFor(run:Run):PersonalityType {
  const {scores}=scoresFor(run);
  return AXES.map(axis=>scores[axis]>0?axis[0]:scores[axis]<0?axis[1]:axis[random(run.seed,`type-tie:${axis}`)()<.5?0:1]).join('') as PersonalityType;
}
export function opposite(type:PersonalityType):PersonalityType {
  return AXES.map((axis,i)=>axis[0]===type[i]?axis[1]:axis[0]).join('') as PersonalityType;
}
export function distance(a:PersonalityType,b:PersonalityType){return [...a].reduce((sum,c,i)=>sum+Number(c!==b[i]),0);}

function nextQuestion(run:Run):string|null {
  const n=run.answers.length;
  if(n>=TOTAL_ANSWERS)return null;
  const seen=new Set(run.answers.map(a=>a.questionId));
  if(n>=PERSONALITY_ANSWERS){
    const pool=QUESTIONS.filter(q=>q.facet===FACETS[n-PERSONALITY_ANSWERS]);
    return shuffled(pool,random(run.seed,`party-question:${n}`))[0].id;
  }
  const axis=shuffled(AXES,random(run.seed,'axis-order'))[n%4];
  const parents=run.answers.filter(a=>getQuestion(a.questionId)?.axis===axis&&!getQuestion(a.questionId)?.parent);
  const callback=QUESTIONS.find(q=>q.axis===axis&&q.parent&&!seen.has(q.id)&&parents.some(a=>a.questionId===q.parent));
  if(n>=4&&n<8&&callback)return callback.id;
  let pool=QUESTIONS.filter(q=>q.axis===axis&&!q.parent&&!seen.has(q.id));
  if(n<4)pool=pool.filter(q=>Number(q.id.slice(1))<=5);
  // Prior choice changes later question paths, without inventing new questions.
  const history=parents.map(a=>`${a.questionId}:${a.choiceId}`).join('|');
  return shuffled(pool,random(run.seed,`question:${n}:${history}`))[0].id;
}
export function createRun(seed:number):Run {
  if(!Number.isInteger(seed)||seed<0||seed>0xffffffff)throw new Error('Invalid run seed.');
  const run:Run={version:3,seed,answers:[],currentId:null};
  run.currentId=nextQuestion(run);return run;
}
export function submitAnswer(run:Run,choiceId:string,text=''):Run {
  const q=getQuestion(run.currentId);
  if(!q||run.answers.length>=TOTAL_ANSWERS)throw new Error('This run is already complete.');
  if(choiceId!=='other'&&!q.choices.some(c=>c.id===choiceId))throw new Error('Pick one of the available answers.');
  const custom=text.trim();
  if(choiceId==='other'&&(!custom||custom.length>OTHER_LIMIT))throw new Error(`Write an answer between 1 and ${OTHER_LIMIT} characters.`);
  const next:Run={...run,answers:[...run.answers,{questionId:q.id,choiceId,text:choiceId==='other'?custom:''}]};
  next.currentId=nextQuestion(next);return next;
}
export function rewindRun(run:Run):Run {
  if(!run.answers.length)return run;
  const next={...run,answers:run.answers.slice(0,-1)};next.currentId=nextQuestion(next);return next;
}
export function restoreRun(raw:string):Run|null {
  try{
    const data=JSON.parse(raw);
    if(!data||data.version!==3||!Array.isArray(data.answers)||data.answers.length>TOTAL_ANSWERS)return null;
    let run=createRun(data.seed);
    for(const answer of data.answers){
      if(!answer||answer.questionId!==run.currentId||typeof answer.choiceId!=='string'||typeof answer.text!=='string')return null;
      run=submitAnswer(run,answer.choiceId,answer.text);
    }
    if(run.currentId!==data.currentId)return null;
    return run;
  }catch{return null;}
}
export function answerText(answer:Answer){return answer.choiceId==='other'?answer.text:getQuestion(answer.questionId)?.choices.find(c=>c.id===answer.choiceId)?.text??'';}
export function callbackFor(run:Run,q:Question):string|null {
  const parent=run.answers.find(a=>a.questionId===q.parent);return parent?answerText(parent):null;
}
export function comfortFor(run:Run){
  const scores:Record<Playstyle,number>={strike:0,guard:0,scheme:0,support:0};
  for(const a of run.answers){const style=getQuestion(a.questionId)?.choices.find(c=>c.id===a.choiceId)?.style;if(style)scores[style]++;}
  const order=shuffled(STYLES,random(run.seed,'comfort-tie'));
  const style=order.reduce((best,s)=>scores[s]>scores[best]?s:best,order[0]);
  return {style,scores,hasEvidence:Object.values(scores).some(Boolean),tied:STYLES.filter(s=>scores[s]===scores[style]).length>1};
}
export function playerStats(seed:number):Record<Stat,number>{
  const rng=random(seed,'player-stats-v1');
  return Object.fromEntries(STATS.map(stat=>[stat,1+Math.floor(rng()*10)])) as Record<Stat,number>;
}
export function statFit(character:Character,stats:Record<Stat,number>){
  const entries=Object.entries(character.stats) as [Stat,number][];
  return entries.reduce((sum,[stat,weight])=>sum+stats[stat]*weight,0)/entries.reduce((sum,[,weight])=>sum+weight,0);
}
function best<T>(items:T[],score:(value:T)=>number,seed:number,stream:string):T {
  if(!items.length)throw new Error('The roster cannot fill this slot.');
  const ranked=shuffled(items,random(seed,stream));
  return ranked.reduce((a,b)=>score(b)>score(a)?b:a);
}
export function partyFor(run:Run):PartySlot[]{
  if(run.answers.length!==TOTAL_ANSWERS)return [];
  const playerType=personalityFor(run),target=opposite(playerType);
  const mc=best(ROSTER.filter(c=>c.kind==='mc'),c=>-distance(c.type,target),run.seed,'main-character');
  const members=ROSTER.filter(c=>c.kind==='companion');
  const flip=opposite(mc.type);
  // Reserve the scratch match first so the other roles cannot steal it.
  const scratch=best(members,c=>-distance(c.type,flip),run.seed,'post-scratch');
  const comfort=comfortFor(run),challengeStyle=PLAYSTYLES[comfort.style].opposite;
  const challenge=best(members.filter(c=>c.id!==scratch.id&&c.playstyle===challengeStyle),c=>-distance(c.type,playerType),run.seed,'challenge');
  const stats=playerStats(run.seed);
  const seeded=best(members.filter(c=>c.id!==scratch.id&&c.id!==challenge.id),c=>statFit(c,stats),run.seed,'seed-pick');
  const relevant=(Object.keys(seeded.stats) as Stat[]).sort((a,b)=>stats[b]-stats[a]).slice(0,2).map(stat=>`${stat.toLowerCase()} ${stats[stat]}`).join(' and ');
  return [
    {role:'Main character',character:mc,targetType:target,reason:distance(mc.type,target)===0?`${playerType} flips to ${target}. ${mc.name} is the exact opposite type in this cast.`:`${playerType} flips to ${target}. Of the four MCs, ${mc.name}'s ${mc.type} matches ${4-distance(mc.type,target)} of those four letters, the best fit available among the MCs.`},
    {role:'Out of your comfort zone',character:challenge,reason:comfort.hasEvidence?`Your answers lean toward ${PLAYSTYLES[comfort.style].name.toLowerCase()}${comfort.tied?' (a tied preference, settled by your seed)':''}. ${challenge.name} brings ${PLAYSTYLES[challengeStyle].name.toLowerCase()}: ${PLAYSTYLES[challengeStyle].description}.`:`You left your playstyle open. Your seed chose ${PLAYSTYLES[challengeStyle].name.toLowerCase()} as the style to try with ${challenge.name}.`},
    {role:'The seed pick',character:seeded,reason:`Your player roll includes ${relevant}. Among the remaining companions, ${seeded.name}'s stat affinities fit your roll best. These are your stats, separate from ${mc.name}.`},
    {role:'Post-scratch',character:scratch,targetType:flip,reason:`${mc.name}'s ${mc.type} becomes ${flip}: every letter flips. ${scratch.name} ${scratch.type===flip?'matches that new type exactly':`is the closest available match at ${scratch.type}`}.`},
  ];
}
export const SECTIONS=['getting a feel for you','picking things back up','how you handle things','your playstyle'];
export function sectionFor(answered:number){return Math.min(3,Math.floor(answered/5));}
/** Update the mood at section boundaries, then settle on the final type. */
export function moodType(run:Run|null):PersonalityType{
  if(!run||run.answers.length<5)return 'INTP';
  const n=run.answers.length>=20?20:Math.floor(run.answers.length/5)*5;
  return personalityFor({...run,answers:run.answers.slice(0,n)});
}
