export class Team {
  id: number;
  name: string;
  idLogo: number;

  constructor(obj?) {
    this.id = obj?.id ?? null;
    this.name = obj?.name ?? null;
    this.idLogo = obj?.idLogo ?? null;
  }
}
