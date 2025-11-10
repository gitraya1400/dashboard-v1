export class RespondenEntity {
    id: number;
    nama: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  
    constructor(partial: Partial<RespondenEntity>) {
      Object.assign(this, partial);
    }
  }