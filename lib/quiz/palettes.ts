import type { PersonalityType } from './types';
export type Palette={a:string;b:string;c:string;solid:string;accent:string};
// Low-luminance backgrounds; text sits on a stable, opaque dark surface.
export const PALETTES:Record<PersonalityType,Palette>={
  ISTJ:{a:'#233f55',b:'#343e63',c:'#4b5267',solid:'#303e55',accent:'#b8d5ef'},
  ISFJ:{a:'#244943',b:'#3b5164',c:'#425666',solid:'#304b50',accent:'#bce4da'},
  INFJ:{a:'#363459',b:'#554465',c:'#394c64',solid:'#413e59',accent:'#d6c4ee'},
  INTJ:{a:'#293451',b:'#403d72',c:'#345b6b',solid:'#343e5c',accent:'#c3c6f4'},
  ISTP:{a:'#24494d',b:'#315873',c:'#414763',solid:'#2c4a5a',accent:'#b2dbe7'},
  ISFP:{a:'#414a45',b:'#665057',c:'#405b64',solid:'#4b4f50',accent:'#e1cfca'},
  INFP:{a:'#493654',b:'#63506c',c:'#345a65',solid:'#4c455d',accent:'#e2c7e9'},
  INTP:{a:'#2b3e5d',b:'#454573',c:'#31636a',solid:'#38495e',accent:'#c5d1ef'},
  ESTP:{a:'#564532',b:'#665044',c:'#385a5b',solid:'#514b40',accent:'#e8d5b5'},
  ESFP:{a:'#584151',b:'#75524e',c:'#4b4a6c',solid:'#5c4853',accent:'#f0c7c5'},
  ENFP:{a:'#51406a',b:'#665266',c:'#386168',solid:'#524c66',accent:'#e5caed'},
  ENTP:{a:'#363964',b:'#654b72',c:'#316372',solid:'#494762',accent:'#d7c8f3'},
  ESTJ:{a:'#464b35',b:'#5e5846',c:'#3b555d',solid:'#4b5144',accent:'#d8dfb7'},
  ESFJ:{a:'#435447',b:'#5c6150',c:'#3e5e67',solid:'#4a574d',accent:'#d2e5c6'},
  ENFJ:{a:'#345248',b:'#4e5b72',c:'#56516b',solid:'#415650',accent:'#c4e4da'},
  ENTJ:{a:'#494057',b:'#645063',c:'#335669',solid:'#50475b',accent:'#e2cbdf'},
};
