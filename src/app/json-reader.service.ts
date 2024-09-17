import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JsonReaderService {

  constructor() { }
  public async readJson(name: string )
  {
    return (await (fetch(`./assets/archivosJson/${name}`))).json()
  }
}
