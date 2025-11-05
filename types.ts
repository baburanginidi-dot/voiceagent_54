
export enum Speaker {
  User = 'User',
  Maya = 'Maya',
}

export interface Message {
  speaker: Speaker;
  text: string;
}

export interface Stage {
    id: number;
    title: string;
}
