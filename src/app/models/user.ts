export class User {
    id: number;
    email: string;
    userName: string;
    displayName: string;
    rol: string;
    idRol: number;
    dorsal: number;
    team: string;
    nacionalidad: string;
    idNacionalidad: number;
    imageProfile: string;

    constructor(obj?: any){
        this.id = obj && obj.id || 0;
        this.email = obj && obj.email || "";
        this.userName = obj && obj.userName || "";
        this.displayName = obj && obj.displayName || "";
        this.rol = obj && obj.rol || "";
        this.idRol = obj && obj.idRol || 0;
        this.dorsal = obj && obj.dorsal || 0;
        this.team = obj && obj.team || "";
        this.nacionalidad = obj && obj.nacionalidad || "";
        this.idNacionalidad = obj && obj.idNacionalidad || 0;
        this.imageProfile = obj && obj.imageProfile || 0
    }
}