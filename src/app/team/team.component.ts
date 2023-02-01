import { AuthService } from 'src/app/service/auth.service';
import { Router } from '@angular/router';
import { TeamService } from './../service/team.service';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, FormControl } from '@angular/forms';
import { Storage, ref, uploadBytes, listAll, getDownloadURL } from '@angular/fire/storage'
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css']
})
export class TeamComponent implements OnInit {

  teamForm
  filesArray: Array<any> = []
  user: any
  teamList: Array<any> = []

  constructor(
    private teamService: TeamService,
    private fb: UntypedFormBuilder,
    private toastr: ToastrService,
    private authService: AuthService,
    private router: Router,
    private storage: Storage
  ){ }

  ngOnInit(): void {
    this.authService.stateUser().subscribe(res => this.user = res);
    this.teamService.getTeam().subscribe((res) => this.teamList = res);
    this.createFormTeam();
  }

  onSubmit(){
    const team = this.prepareSaveFormWarehouse();

    for(let item of this.filesArray){
      team.files.push(item)
    }

    console.log(this.teamList)

    const isTeam = this.teamList.find(elem => elem.nombre.toLowerCase() == team.nombre.toLowerCase())

    console.log(isTeam)

    if(isTeam){
      this.toastr.warning('El equipo que intenta registra ya fue creado anteriormente', 'Ya hay un equipo');
    } else {
      this.teamService.postTeam(team)
      .then(
        (res) => {
          this.toastr.success('Equipo creado con exito, espere la confirmacion de un admin', 'Equipo creado');
          this.router.navigate(['/team/my-team']);
        }
      )
      .catch(error => {
        console.log(error)
        this.toastr.error('No se pudo crear el equipo, comuniquese con un adminisitrador', 'Error');
      })
    }
  }

  selectFile(event: any): void {
    const file = event.target.files[0];
    const imgRef = ref(this.storage, `files/${file.name}`);
    uploadBytes(imgRef, file)
    .then(res => {
      setTimeout(() => {
        this.getImages(res.metadata.name)
      }, 500)
    })
    .catch(error => console.log(error))
  }

  getImages(file){
    getDownloadURL(ref(this.storage, `files/${file}`))
    .then((url) => {
      console.log(url)
      this.filesArray.push(url)
    })
    .catch((error) => {
      console.log(error)
    });
  }

  prepareSaveFormWarehouse(){
    const formValue = this.teamForm.value;

    const saveForm = {
      nombre: formValue.nombre,
      abreviatura: formValue.abreviatura,
      apodo: formValue.apodo,
      nacionalidad: formValue.nacionalidad,
      uid: this.user.uid,
      isRevision: true,
      files: []
    }

    return saveForm;
  }

  createFormTeam(){
    this.teamForm = this.fb.group({
      nombre: [''],
      abreviatura: [''],
      apodo: [''],
      nacionalidad: [''],
    })
  }

  get nombre(): FormControl {
    return this.teamForm.get('nombre')
  }

  get abreviatura(): FormControl {
    return this.teamForm.get('abreviatura')
  }

  get apodo(): FormControl {
    return this.teamForm.get('apodo')
  }

  get nacionalidad(): FormControl {
    return this.teamForm.get('nacionalidad')
  }

}
