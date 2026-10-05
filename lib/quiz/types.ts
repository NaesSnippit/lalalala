export type Axis = 'EI' | 'SN' | 'TF' | 'JP';
export type PersonalityType = `${'E'|'I'}${'S'|'N'}${'T'|'F'}${'J'|'P'}`;
export type Playstyle = 'strike' | 'guard' | 'scheme' | 'support';
export type Stat = 'Might' | 'Grit' | 'Agility' | 'Insight' | 'Focus' | 'Charm';
export type Facet = 'opening' | 'pressure' | 'resources' | 'teamwork' | 'payoff';
export type Choice = { id:string; text:string; score?:number; style?:Playstyle };
export type Question = {
  id:string; kind:'personality'|'party'; prompt:string; choices:Choice[];
  axis?:Axis; facet?:Facet; parent?:string;
};
export type Answer = { questionId:string; choiceId:string; text:string };
export type Run = { version:3; seed:number; answers:Answer[]; currentId:string|null };
export type Character = {
  id:string; name:string; pronouns:string; kind:'mc'|'companion'; type:PersonalityType;
  species:string; description:string; playstyle:Playstyle;
  stats:Partial<Record<Stat,number>>; blood?:string; zodiac?:string; age?:string;
};
export type PartySlot = { role:'Main character'|'Out of your comfort zone'|'The seed pick'|'Post-scratch'; character:Character; reason:string; targetType?:PersonalityType };
