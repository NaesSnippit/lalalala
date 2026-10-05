import type { Character, Playstyle } from './types';

// Editorial game profiles, not canonical typings of the reference characters.
// Types, playstyles, and stat affinities are deliberately easy to revise here.
export const PLAYSTYLES:Record<Playstyle,{name:string;description:string;opposite:Playstyle}>={
  strike:{name:'Direct offense',description:'commit, hit hard, end the threat',opposite:'support'},
  guard:{name:'Hold the line',description:'protect, endure, control the space',opposite:'scheme'},
  scheme:{name:'Find another way',description:'use tools, timing, and unusual angles',opposite:'guard'},
  support:{name:'Make the team work',description:'heal, supply, and coordinate the party',opposite:'strike'},
};
export const ROSTER:Character[]=[
  {id:'asani',name:'Asani',pronouns:'they/them',kind:'mc',type:'INTP',species:'Hyena kemonomimi',playstyle:'scheme',blood:'O+',zodiac:'Rooster',age:'Young adult',stats:{Insight:2,Focus:2},description:"A hyena nerd who likes puzzles and tabletop games. Usually the one checking the rules."},
  {id:'pochi',name:'Pochi',pronouns:'he/him',kind:'mc',type:'ESFP',species:'Humanified tanuki',playstyle:'strike',blood:'A−',zodiac:'Dragon',age:'Young adult',stats:{Agility:2,Might:2},description:"A tanuki with a talent for lockpicking. Tries to keep out of trouble. Gets involved anyway."},
  {id:'kaylani',name:'Kaylani',pronouns:'she/her',kind:'mc',type:'ISFP',species:'Human',playstyle:'guard',blood:'AB+',zodiac:'Monkey',age:'Young adult',stats:{Grit:2,Insight:2},description:"Books, cottage goth clothes, and frog-eye contacts she wears because she likes them."},
  {id:'asteria',name:'Asteria',pronouns:'she/her',kind:'mc',type:'ISTJ',species:'Unicorn humanoid',playstyle:'support',blood:'B−',zodiac:'Ram',age:'Young adult',stats:{Focus:3,Insight:1},description:"A studious Black girl with bubble braids and a unicorn horn. Keeps cards close by, tarot included."},
  {id:'sage',name:'Sage',pronouns:'he/him',kind:'companion',type:'ISTP',species:'Elf',playstyle:'strike',stats:{Might:2,Agility:2},description:"An elf with a sharp tongue and little patience for a bad excuse."},
  {id:'doris',name:'Doris',pronouns:'she/they',kind:'companion',type:'ISFJ',species:'Chipmunk succubus',playstyle:'support',stats:{Charm:2,Grit:2},description:"A gentle chipmunk succubus with a human form. Quiet, but willing to speak up for someone else."},
  {id:'muse',name:'Muse',pronouns:'she/her',kind:'companion',type:'INTJ',species:'Wish dragon',playstyle:'guard',stats:{Insight:3,Focus:1},description:"A fluffy wish dragon who thinks things through before letting anyone know what she wants."},
  {id:'chip',name:'Chip',pronouns:'it/zem',kind:'companion',type:'ESTJ',species:'Alien cat creature',playstyle:'guard',stats:{Grit:2,Focus:2},description:"A blue alien cat with work to do. It expects everyone else to do their part, too."},
  {id:'cirrus',name:'Cirrus',pronouns:'she/her',kind:'companion',type:'ISFP',species:'Cloud humanoid',playstyle:'scheme',stats:{Agility:2,Charm:2},description:"A cloud humanoid with a dry sense of humor. Likes having room to do things her own way."},
  {id:'hel',name:'Hel',pronouns:'she/he',kind:'companion',type:'INTP',species:'Child of Death',playstyle:'guard',stats:{Focus:2,Insight:2},description:"Death's child in a humanoid form. Would appreciate getting through this without a fuss."},
  {id:'vervain',name:'Vervain',pronouns:'she/her',kind:'companion',type:'ENFP',species:'Mantis humanoid',playstyle:'scheme',stats:{Agility:1,Insight:1,Charm:2},description:"A mantis who picks up new skills quickly and wants a chance to use them."},
  {id:'cm17',name:'CM-17',pronouns:'they/he/she',kind:'companion',type:'ENTP',species:'Rogue robot butler',playstyle:'scheme',stats:{Insight:2,Agility:1,Focus:1},description:"A robot butler gone rogue. Has a plan. May need someone to check whether it's a good one."},
  {id:'lou',name:'Lou',pronouns:'he/they',kind:'companion',type:'ENFJ',species:'Rabbit mercenary',playstyle:'support',stats:{Charm:3,Agility:1},description:"A rabbit mercenary with a dramatic streak. Takes looking after people seriously."},
  {id:'hakeem',name:'Hakeem',pronouns:'he/him',kind:'companion',type:'ESFJ',species:'Human',playstyle:'support',stats:{Charm:2,Focus:1,Grit:1},description:"A creative, easygoing Black man who makes time for his friends."},
  {id:'jack',name:'Jack',pronouns:'he/it',kind:'companion',type:'ISTJ',species:'Masked crow deity',playstyle:'strike',stats:{Might:2,Grit:2},description:"A masked crow deity of karma, fertility, and fortune. Keeps his word."},
  {id:'biscuit',name:'Biscuit',pronouns:'he/they',kind:'companion',type:'ENTJ',species:'Deer-goat android',playstyle:'strike',stats:{Might:2,Focus:1,Insight:1},description:"A deer-goat android who takes a game seriously, especially when there's someone to protect."},
];
