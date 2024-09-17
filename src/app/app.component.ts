import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { JsonReaderService } from './json-reader.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {

  title = 'sofia';

  constructor(private jsonReaderService: JsonReaderService) {
    let mapa = new Map();

    for (let i = 0; i < 20; i++) {

      this.jsonReaderService.readJson(`u${i}.json`).then((res) => {
        let authModuleProvider = res.provider.auth_module;
        let contentModuleProvider = res.provider.content_module;
        let user = {
          name: res.name,
          url: `./u${i}.json`
        };
        if (!mapa.has('auth_module')) {
          mapa.set('auth_module', new Map());
        }
        let authMap = mapa.get('auth_module');

        if (authMap.has(authModuleProvider)) {
          authMap.get(authModuleProvider).push(user); 
        } else {
          authMap.set(authModuleProvider, [user]); 
        }

        if (!mapa.has('content_module')) {
          mapa.set('content_module', new Map());
        }
        let contentMap = mapa.get('content_module');

        if (contentMap.has(contentModuleProvider)) {
          contentMap.get(contentModuleProvider).push(user); 
        } else {
          contentMap.set(contentModuleProvider, [user]); 
        }
      });
    }

    //Imprimo el mapa en el formato solicitado
    function printMap(map: Map<string, Map<string, { name: string, url: string }[]>>): void {
      map.forEach((providerMap, moduleType) => {
        console.log(`${moduleType} :`);
        providerMap.forEach((userList, provider) => {
          const urls = userList.map(user => user.url);
          console.log(`${provider}: [${urls.join(', ')}]`);
        });
      });
    }

    // Espera a que se terminen de leer los archivos JSON antes de imprimir el mapa
    setTimeout(() => {
      printMap(mapa);
    }, 5000);

    // Función que devuelve los providers de un módulo
    function getModuleProviders(moduleType: string): string[] {
      let moduleMap = mapa.get(moduleType);
      return Array.from(moduleMap.keys()) as string[];
    }

    // Función que devuelve los nombres de los usuarios de un provider en un módulo
    function getUsersByProviderByModule(moduleType: string, provider: string): string[] {
      let moduleMap = mapa.get(moduleType);
      let users: { name: string, url: string }[] = moduleMap.get(provider);
      return users.map((user: { name: string, url: string }) => user.name);
    }


    //Funcion que cambia el nombre de los Providers
    function changeproviderName(provider: string): string {
      let parts = provider.split('.');
      if (parts.length > 1) {
        provider = parts[1]; 
      }
      provider = provider.replace("provider_", "Module ");
      return provider.charAt(0).toUpperCase() + provider.slice(1);
    }

    // Función que muestra los providers del módulo seleccionado
    function displayProviders(moduleType: string): void {
      document.querySelectorAll('.module-button').forEach(btn => btn.classList.remove('selected'));
      const clickedButton = document.querySelector(`button[onclick*="${moduleType}"]`);
      if (clickedButton) {
        clickedButton.classList.add('selected');
    }
      const providerContainer = document.getElementById('provider-container') as HTMLElement;
      providerContainer.innerHTML = '';

      const providers = getModuleProviders(moduleType);
      providers.sort();

      providers.forEach(provider => {
        const btn = document.createElement('button');
        btn.classList.add('provider-button');
        btn.textContent = changeproviderName(provider);
        btn.onclick = () => {
          document.querySelectorAll('.provider-button').forEach(btn => btn.classList.remove('selected'));
          btn.classList.add('selected');
          displayUsers(moduleType, provider);
        };

        providerContainer.appendChild(btn);
      });
    }

    // Función que muestra los usuarios
    function displayUsers(moduleType: string, provider: string): void {
      const userListContainer = document.getElementById('user-list') as HTMLElement;
      const userCountElement = document.getElementById('user-count') as HTMLElement;
      userListContainer.innerHTML = '';

      const users = getUsersByProviderByModule(moduleType, provider);
      userCountElement.textContent = `Number of users in ${changeproviderName(provider)} :  ${users.length}`;

      if (users.length > 0) {
        users.forEach(user => {
          const li = document.createElement('li');
          li.textContent = user;
          userListContainer.appendChild(li);
        });
      } else {
        const li = document.createElement('li');
        li.textContent = 'No users found.';
        userListContainer.appendChild(li);
      }
    }

    (window as any).displayProviders = displayProviders;
    (window as any).displayUsers = displayUsers;
  }
}
