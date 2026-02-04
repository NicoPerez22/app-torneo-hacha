export class User {
    id: number;
    email: string;
    userName: string;
    name: string;
    lastName: string;
    rol: string;
    idRol: number;
    dorsal: number;
    team: string;

    constructor(obj?: any){
        this.id = obj && obj.id || 0;
        this.email = obj && obj.email || "";
        this.userName = obj && obj.userName || "";
        this.userName = obj && obj.userName || "";
        this.name = obj && obj.name || "";
        this.rol = obj && obj.rol || "";
        this.idRol = obj && obj.idRol || 0;
        this.dorsal = obj && obj.dorsal || 0;
        this.team = obj && obj.team || "";
    }
}