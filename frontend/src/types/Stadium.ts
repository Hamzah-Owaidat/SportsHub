// types/Stadium.ts
export interface Stadium {
  _id: string;
  ownerId: {
    _id: string;
    username: string;
    email?: string;
  };
  name: string;
  location: string;
  photos: string[];
  pricePerMatch: number;
  maxPlayers: number;
  penaltyPolicy: {
    hoursBefore: string;
  };
  workingHours: {
    start: string;
    end: string;
  };
}
