import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'environments/environment';

@Component({
  selector: 'ms-language-drop-down',
  templateUrl: './language-drop-down.component.html',
  styleUrls: ['./language-drop-down.component.scss'],
})
export class LanguageDropDownComponent implements OnInit {
  currentLang = 'en';
  selectImage = 'assets/img/en.png';
  isShowIndonesian = environment.apiUrl === 'https://api.poc-edh.zetta-demo.space/graphql' ? true : false;
  langArray: any[] = [
    {
      img: 'assets/img/en.png',
      name: 'English',
      value: 'en',
    },
    {
      img: 'assets/img/france.png',
      name: 'French',
      value: 'fr',
    },
    {
      img: 'assets/img/spain.png',
      name: 'Spanish',
      value: 'es',
    },
    // {
    //   img: 'assets/img/id.png',
    //   name: 'Indonesian',
    //   value: 'id',
    // },
    /* {
         img: 'assets/img/he.png',
         name: 'Hebrew',
         value: 'he'
      },
      {
         img: 'assets/img/ru.png',
         name: 'Russian',
         value: 'ru'
      },
      {
         img: 'assets/img/ar.png',
         name: 'Arabic',
         value: 'ar'
      },
      {
         img: 'assets/img/china.png',
         name: 'Chinese',
         value: 'zh'
      },
      {
         img: 'assets/img/german.png',
         name: 'German',
         value: 'de'
      },
      {
         img: 'assets/img/spanish.jpg',
         name: 'Spanish',
         value: 'es'
      },
      {
         img: 'assets/img/japan.jpeg',
         name: 'Japanese',
         value: 'ja'
      },
      {
         img: 'assets/img/korean.jpg',
         name: 'Korean',
         value: 'ko'
      },
      {
         img: 'assets/img/italian.png',
         name: 'Italian',
         value: 'it'
      },
      {
         img: 'assets/img/hungary.png',
         name: 'Hungarian',
         value: 'hu'
      } */
  ];

  constructor(public translate: TranslateService) {}

  ngOnInit() {
    if (this.isShowIndonesian) {
      this.langArray.push({
        img: 'assets/img/id.png',
        name: 'Indonesian',
        value: 'id',
      });
    }
    const lang = localStorage.getItem('currentLang'); // Get currentLang which saved on localStorage
    if (!lang) {
      // Check if any currentLang saved on LocalStorage
      let info = '';
      if (navigator) {
        info = navigator.language;
      }
      // If not any, check of browser language used
      console.log(info);
      if (info.includes('fr')) {
        // If browser lang is france
        localStorage.setItem('currentLang', 'fr'); // set currentLang to france on localStorage
        this.translate.use('fr'); // set translate service to france
      } else if (info.includes('es')) {
        // If browser lang is spain
        localStorage.setItem('currentLang', 'es'); // set currentLang to spain on localStorage
        this.translate.use('es'); // set translate service to spain
      } else if (info.includes('id')) {
        // If browser lang is indonesian
        localStorage.setItem('currentLang', 'id'); // set currentLang to indonesian on localStorage
        this.translate.use('id'); // set translate service to indonesian
      } else {
        // If langauage is other than spain and france
        localStorage.setItem('currentLang', 'en'); // set currentLang to english on localStorage
        this.translate.use('en'); // set translate service to english
      }
    } else {
      this.translate.use(lang.toString());
      localStorage.setItem('currentLang', lang.toString());
    }
    if (this.translate.currentLang === 'fr') {
      this.selectImage = 'assets/img/france.png';
    } else if (this.translate.currentLang === 'es') {
      // check if currentLang now is spain
      this.selectImage = 'assets/img/spain.png'; // then set the flag image on translation dropdown to spain
    } else if (this.translate.currentLang === 'id') {
      // check if currentLang now is indonesian
      this.selectImage = 'assets/img/id.png'; // then set the flag image on translation dropdown to indonesian
    } else {
      this.selectImage = 'assets/img/en.png';
    }
    console.log('current Lang', this.translate.currentLang, this.selectImage);
  }

  setLang(lang) {
    for (const data of this.langArray) {
      if (data.value === lang) {
        this.selectImage = data.img;
        break;
      }
    }
    localStorage.setItem('currentLang', lang);
    this.translate.use(lang);
    console.log('setLang', this.translate.currentLang, this.selectImage);
  }
}
