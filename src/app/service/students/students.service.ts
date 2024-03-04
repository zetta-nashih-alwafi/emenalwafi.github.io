import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Cacheable } from 'ngx-cacheable';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class StudentsService {
  CountryList: [
    { id: '1'; countryName: 'France' },
    { id: '2'; countryName: 'Afghanistan' },
    { id: '3'; countryName: 'South Africa' },
    { id: '4'; countryName: 'Albania' },
    { id: '5'; countryName: 'Algeria' },
    { id: '6'; countryName: 'Germany' },
    { id: '7'; countryName: 'Angola' },
    { id: '8'; countryName: 'Anguilla' },
    { id: '9'; countryName: 'Antarctique' },
    { id: '10'; countryName: 'Antigua and Barbuda' },
    { id: '11'; countryName: 'Netherlands Antilles' },
    { id: '12'; countryName: 'Saudi Arabia' },
    { id: '13'; countryName: 'Argentina' },
    { id: '14'; countryName: 'Armenia' },
    { id: '15'; countryName: 'Aruba' },
    { id: '16'; countryName: 'Australia' },
    { id: '17'; countryName: 'Austria' },
    { id: '18'; countryName: 'Azerbaijan' },
    { id: '19'; countryName: 'Bahamas' },
    { id: '20'; countryName: 'Bahrain' },
    { id: '21'; countryName: 'Bangladesh' },
    { id: '22'; countryName: 'Barbados' },
    { id: '23'; countryName: 'Belarus' },
    { id: '24'; countryName: 'Belgium' },
    { id: '25'; countryName: 'Belize' },
    { id: '26'; countryName: 'Benin' },
    { id: '27'; countryName: 'Bermuda' },
    { id: '28'; countryName: 'Bhutan' },
    { id: '29'; countryName: 'Bolivia' },
    { id: '30'; countryName: 'Bosnia and Herzegovina' },
    { id: '31'; countryName: 'Botswana' },
    { id: '32'; countryName: 'Brazil' },
    { id: '33'; countryName: 'Brunei Darussalam' },
    { id: '34'; countryName: 'Bulgaria' },
    { id: '35'; countryName: 'Burkina Faso' },
    { id: '36'; countryName: 'Cambodia' },
    { id: '37'; countryName: 'Cape Verde' },
    { id: '38'; countryName: 'Chile' },
    { id: '39'; countryName: 'China' },
    { id: '40'; countryName: 'Cyprus' },
    { id: '41'; countryName: 'Colombia' },
    { id: '42'; countryName: 'Costa Rica' },
    { id: '43'; countryName: 'Ivory Coast' },
    { id: '44'; countryName: 'Croatia' },
    { id: '45'; countryName: 'Cuba' },
    { id: '46'; countryName: 'Denmark' },
    { id: '47'; countryName: 'Djibouti' },
    { id: '48'; countryName: 'Dominique' },
    { id: '49'; countryName: 'Egypt' },
    { id: '50'; countryName: 'El Salvador' },
    { id: '51'; countryName: 'United Arab Emirates' },
    { id: '52'; countryName: 'Ecuador' },
    { id: '53'; countryName: 'Eritrea' },
    { id: '54'; countryName: 'Spain' },
    { id: '55'; countryName: 'Estonia' },
    { id: '56'; countryName: 'Federated States of Micronesia' },
    { id: '57'; countryName: 'United States' },
    { id: '58'; countryName: 'Ethiopia' },
    { id: '59'; countryName: 'Russian Federation' },
    { id: '60'; countryName: 'Fiji' },
    { id: '61'; countryName: 'Finland' },
    { id: '62'; countryName: 'Gabon' },
    { id: '63'; countryName: 'Gambia' },
    { id: '64'; countryName: 'Georgia' },
    { id: '65'; countryName: 'Ghana' },
    { id: '66'; countryName: 'Gibraltar' },
    { id: '67'; countryName: 'Greece' },
    { id: '68'; countryName: 'Granada' },
    { id: '69'; countryName: 'Greenland' },
    { id: '70'; countryName: 'Guadeloupe' },
    { id: '71'; countryName: 'Guam' },
    { id: '72'; countryName: 'Guatemala' },
    { id: '73'; countryName: 'Guinea' },
    { id: '74'; countryName: 'Guinea-Bissau' },
    { id: '75'; countryName: 'Equatorial Guinea' },
    { id: '76'; countryName: 'Guyana' },
    { id: '77'; countryName: 'French Guiana' },
    { id: '78'; countryName: 'Haiti' },
    { id: '79'; countryName: 'Honduras' },
    { id: '80'; countryName: 'Hong Kong' },
    { id: '82'; countryName: 'Hungary' },
    { id: '83'; countryName: 'Bouvet Island' },
    { id: '84'; countryName: 'Christmas Island' },
    { id: '85'; countryName: 'Isle of Man' },
    { id: '86'; countryName: 'Norfolk Island' },
    { id: '87'; countryName: 'Islands (malvinas) Falkland' },
    { id: '88'; countryName: 'land Islands' },
    { id: '89'; countryName: 'Cocos (Keeling) Islands' },
    { id: '90'; countryName: 'Cook Islands' },
    { id: '91'; countryName: 'Faroe Islands' },
    { id: '92'; countryName: 'Solomon Islands' },
    { id: '93'; countryName: 'Turks and Caicos Islands' },
    { id: '94'; countryName: 'British Virgin Islands' },
    { id: '95'; countryName: 'United States Virgin Islands' },
    { id: '96'; countryName: 'India' },
    { id: '97'; countryName: 'Indonesia' },
    { id: '98'; countryName: 'Iraq' },
    { id: '99'; countryName: 'Ireland' },
    { id: '100'; countryName: 'Iceland' },
    { id: '101'; countryName: 'Israel' },
    { id: '102'; countryName: 'Italy' },
    { id: '103'; countryName: 'Libyan Arab Jamahiriya' },
    { id: '104'; countryName: 'Jamaica' },
    { id: '105'; countryName: 'Japan' },
    { id: '106'; countryName: 'Jordan' },
    { id: '107'; countryName: 'Kazakhstan' },
    { id: '108'; countryName: 'Kenya' },
    { id: '109'; countryName: 'Kyrgyzstan' },
    { id: '110'; countryName: 'Kiribati' },
    { id: '111'; countryName: 'Kuwait' },
    { id: '112'; countryName: 'Lesotho' },
    { id: '113'; countryName: 'Latvia' },
    { id: '114'; countryName: 'Lebanon' },
    { id: '115'; countryName: 'Liberia' },
    { id: '116'; countryName: 'Liechtenstein' },
    { id: '117'; countryName: 'Lithuania' },
    { id: '118'; countryName: 'Luxembourg' },
    { id: '119'; countryName: 'Macau' },
    { id: '121'; countryName: 'Malaysia' },
    { id: '122'; countryName: 'Malawi' },
    { id: '123'; countryName: 'Maldives' },
    { id: '124'; countryName: 'Mali' },
    { id: '125'; countryName: 'Malta' },
    { id: '126'; countryName: 'Morocco' },
    { id: '127'; countryName: 'Martinique' },
    { id: '128'; countryName: 'Mauritius' },
    { id: '129'; countryName: 'Mauritania' },
    { id: '130'; countryName: 'Mayotte' },
    { id: '131'; countryName: 'Mexico' },
    { id: '132'; countryName: 'Monaco' },
    { id: '133'; countryName: 'Mongolia' },
    { id: '134'; countryName: 'Montserrat' },
    { id: '135'; countryName: 'Mozambique' },
    { id: '136'; countryName: 'Myanmar' },
    { id: '137'; countryName: 'Namibia' },
    { id: '138'; countryName: 'Nauru' },
    { id: '139'; countryName: 'Nepal' },
    { id: '140'; countryName: 'Nicaragua' },
    { id: '141'; countryName: 'Niger' },
    { id: '142'; countryName: 'Nigeria' },
    { id: '143'; countryName: 'Niue' },
    { id: '144'; countryName: 'Norway' },
    { id: '145'; countryName: 'New Caledonia' },
    { id: '146'; countryName: 'New Zealand' },
    { id: '147'; countryName: 'Oman' },
    { id: '148'; countryName: 'Uganda' },
    { id: '149'; countryName: 'Uzbekistan' },
    { id: '150'; countryName: 'Pakistan' },
    { id: '151'; countryName: 'Palau' },
    { id: '152'; countryName: 'Panama' },
    { id: '153'; countryName: 'Papua New Guinea' },
    { id: '154'; countryName: 'Netherlands' },
    { id: '155'; countryName: 'Peru' },
    { id: '156'; countryName: 'Philippines' },
    { id: '157'; countryName: 'Pitcairn' },
    { id: '158'; countryName: 'Poland' },
    { id: '159'; countryName: 'French Polynesia' },
    { id: '160'; countryName: 'Puerto Rico' },
    { id: '161'; countryName: 'Portugal' },
    { id: '162'; countryName: 'Qatar' },
    { id: '163'; countryName: 'Syrian Arab Republic' },
    { id: '164'; countryName: 'Central African Republic' },
    { id: '165'; countryName: 'Republic of Korea' },
    { id: '166'; countryName: 'Republic of Moldova' },
    { id: '167'; countryName: 'Democratic Republic of Congo' },
    { id: '168'; countryName: 'Lao Peoples Democratic Republic' },
    { id: '169'; countryName: 'Dominican Republic' },
    { id: '170'; countryName: 'Islamic Republic of Iran' },
    { id: '171'; countryName: 'Democratic Peoples Republic of Korea' },
    { id: '172'; countryName: 'Czech Republic' },
    { id: '173'; countryName: 'United Republic of Tanzania' },
    { id: '174'; countryName: 'Meeting' },
    { id: '175'; countryName: 'United Kingdom' },
    { id: '176'; countryName: 'Rwanda' },
    { id: '177'; countryName: 'Western Sahara' },
    { id: '178'; countryName: 'Saint Kitts and Nevis' },
    { id: '179'; countryName: 'San Marino' },
    { id: '180'; countryName: 'Holy See (state of Vatican City)' },
    { id: '181'; countryName: 'Saint Vincent and the Grenadines' },
    { id: '182'; countryName: 'Saint Helena' },
    { id: '183'; countryName: 'Saint Lucia' },
    { id: '184'; countryName: 'Samoa' },
    { id: '185'; countryName: 'American Samoa' },
    { id: '186'; countryName: 'Sao Tome and Principe' },
    { id: '187'; countryName: 'Senegal' },
    { id: '188'; countryName: 'Serbia and Montenegro' },
    { id: '189'; countryName: 'Seychelles' },
    { id: '190'; countryName: 'Sierra Leone' },
    { id: '191'; countryName: 'Singapore' },
    { id: '192'; countryName: 'Slovakia' },
    { id: '193'; countryName: 'Slovenia' },
    { id: '194'; countryName: 'Somalia' },
    { id: '195'; countryName: 'Sudan' },
    { id: '196'; countryName: 'Sri Lanka' },
    { id: '197'; countryName: 'Sweden' },
    { id: '198'; countryName: 'Suriname' },
    { id: '199'; countryName: 'Swaziland' },
    { id: '200'; countryName: 'Tajikistan' },
    { id: '201'; countryName: 'Taiwan' },
    { id: '202'; countryName: 'Chad' },
    { id: '203'; countryName: 'Palestinian Territory Occupied' },
    { id: '204'; countryName: 'Thailand' },
    { id: '205'; countryName: 'Timor-Leste' },
    { id: '206'; countryName: 'Togo' },
    { id: '207'; countryName: 'Tokelau' },
    { id: '208'; countryName: 'Tonga' },
    { id: '209'; countryName: 'Trinidad and Tobago' },
    { id: '210'; countryName: 'Tunisia' },
    { id: '211'; countryName: 'Turkmenistan' },
    { id: '212'; countryName: 'Turkey' },
    { id: '213'; countryName: 'Tuvalu' },
    { id: '214'; countryName: 'Ukraine' },
    { id: '215'; countryName: 'Uruguay' },
    { id: '216'; countryName: 'Vanuatu' },
    { id: '217'; countryName: 'Venezuela' },
    { id: '218'; countryName: 'Viet Nam' },
    { id: '219'; countryName: 'Wallis and Futuna' },
    { id: '220'; countryName: 'Yemen' },
    { id: '221'; countryName: 'Zambia' },
    { id: '222'; countryName: 'Zimbabwe' },
    { id: '223'; countryName: 'Cameroon' },
    { id: '224'; countryName: 'Canada' },
    { id: '225'; countryName: 'Comoros' },
    { id: '226'; countryName: 'Paraguay' },
    { id: '227'; countryName: 'Romania' },
    { id: '228'; countryName: 'Saint Pierre and Miquelon' },
    { id: '229'; countryName: 'Switzerland' },
    { id: '230'; countryName: 'Burundi' },
  ];

  nationalitiesList = [
    { id: '1', countryName: 'France' },
    { id: '2', countryName: 'Afghanistan' },
    { id: '3', countryName: 'South Africa' },
    { id: '4', countryName: 'Albania' },
    { id: '5', countryName: 'Algeria' },
    { id: '6', countryName: 'Germany' },
    { id: '7', countryName: 'Angola' },
    { id: '8', countryName: 'Anguilla' },
    { id: '9', countryName: 'Antarctique' },
    { id: '10', countryName: 'Antigua and Barbuda' },
    { id: '11', countryName: 'Netherlands Antilles' },
    { id: '12', countryName: 'Saudi Arabia' },
    { id: '13', countryName: 'Argentina' },
    { id: '14', countryName: 'Armenia' },
    { id: '15', countryName: 'Aruba' },
    { id: '16', countryName: 'Australia' },
    { id: '17', countryName: 'Austria' },
    { id: '18', countryName: 'Azerbaijan' },
    { id: '19', countryName: 'Bahamas' },
    { id: '20', countryName: 'Bahrain' },
    { id: '21', countryName: 'Bangladesh' },
    { id: '22', countryName: 'Barbados' },
    { id: '23', countryName: 'Belarus' },
    { id: '24', countryName: 'Belgium' },
    { id: '25', countryName: 'Belize' },
    { id: '26', countryName: 'Benin' },
    { id: '27', countryName: 'Bermuda' },
    { id: '28', countryName: 'Bhutan' },
    { id: '29', countryName: 'Bolivia' },
    { id: '30', countryName: 'Bosnia and Herzegovina' },
    { id: '31', countryName: 'Botswana' },
    { id: '32', countryName: 'Brazil' },
    { id: '33', countryName: 'Brunei Darussalam' },
    { id: '34', countryName: 'Bulgaria' },
    { id: '35', countryName: 'Burkina Faso' },
    { id: '36', countryName: 'Cambodia' },
    { id: '37', countryName: 'Cape Verde' },
    { id: '38', countryName: 'Chile' },
    { id: '39', countryName: 'China' },
    { id: '40', countryName: 'Cyprus' },
    { id: '41', countryName: 'Colombia' },
    { id: '42', countryName: 'Costa Rica' },
    { id: '43', countryName: 'Ivory Coast' },
    { id: '44', countryName: 'Croatia' },
    { id: '45', countryName: 'Cuba' },
    { id: '46', countryName: 'Denmark' },
    { id: '47', countryName: 'Djibouti' },
    { id: '48', countryName: 'Dominique' },
    { id: '49', countryName: 'Egypt' },
    { id: '50', countryName: 'El Salvador' },
    { id: '51', countryName: 'United Arab Emirates' },
    { id: '52', countryName: 'Ecuador' },
    { id: '53', countryName: 'Eritrea' },
    { id: '54', countryName: 'Spain' },
    { id: '55', countryName: 'Estonia' },
    { id: '56', countryName: 'Federated States of Micronesia' },
    { id: '57', countryName: 'United States' },
    { id: '58', countryName: 'Ethiopia' },
    { id: '59', countryName: 'Russian Federation' },
    { id: '60', countryName: 'Fiji' },
    { id: '61', countryName: 'Finland' },
    { id: '62', countryName: 'Gabon' },
    { id: '63', countryName: 'Gambia' },
    { id: '64', countryName: 'Georgia' },
    { id: '65', countryName: 'Ghana' },
    { id: '66', countryName: 'Gibraltar' },
    { id: '67', countryName: 'Greece' },
    { id: '68', countryName: 'Granada' },
    { id: '69', countryName: 'Greenland' },
    { id: '70', countryName: 'Guadeloupe' },
    { id: '71', countryName: 'Guam' },
    { id: '72', countryName: 'Guatemala' },
    { id: '73', countryName: 'Guinea' },
    { id: '74', countryName: 'Guinea-Bissau' },
    { id: '75', countryName: 'Equatorial Guinea' },
    { id: '76', countryName: 'Guyana' },
    { id: '77', countryName: 'French Guiana' },
    { id: '78', countryName: 'Haiti' },
    { id: '79', countryName: 'Honduras' },
    { id: '80', countryName: 'Hong Kong' },
    { id: '82', countryName: 'Hungary' },
    { id: '83', countryName: 'Bouvet Island' },
    { id: '84', countryName: 'Christmas Island' },
    { id: '85', countryName: 'Isle of Man' },
    { id: '86', countryName: 'Norfolk Island' },
    { id: '87', countryName: 'Islands (malvinas) Falkland' },
    { id: '88', countryName: 'land Islands' },
    { id: '89', countryName: 'Cocos (Keeling) Islands' },
    { id: '90', countryName: 'Cook Islands' },
    { id: '91', countryName: 'Faroe Islands' },
    { id: '92', countryName: 'Solomon Islands' },
    { id: '93', countryName: 'Turks and Caicos Islands' },
    { id: '94', countryName: 'British Virgin Islands' },
    { id: '95', countryName: 'United States Virgin Islands' },
    { id: '96', countryName: 'India' },
    { id: '97', countryName: 'Indonesia' },
    { id: '98', countryName: 'Iraq' },
    { id: '99', countryName: 'Ireland' },
    { id: '100', countryName: 'Iceland' },
    { id: '101', countryName: 'Israel' },
    { id: '102', countryName: 'Italy' },
    { id: '103', countryName: 'Libyan Arab Jamahiriya' },
    { id: '104', countryName: 'Jamaica' },
    { id: '105', countryName: 'Japan' },
    { id: '106', countryName: 'Jordan' },
    { id: '107', countryName: 'Kazakhstan' },
    { id: '108', countryName: 'Kenya' },
    { id: '109', countryName: 'Kyrgyzstan' },
    { id: '110', countryName: 'Kiribati' },
    { id: '111', countryName: 'Kuwait' },
    { id: '112', countryName: 'Lesotho' },
    { id: '113', countryName: 'Latvia' },
    { id: '114', countryName: 'Lebanon' },
    { id: '115', countryName: 'Liberia' },
    { id: '116', countryName: 'Liechtenstein' },
    { id: '117', countryName: 'Lithuania' },
    { id: '118', countryName: 'Luxembourg' },
    { id: '119', countryName: 'Macau' },
    { id: '121', countryName: 'Malaysia' },
    { id: '122', countryName: 'Malawi' },
    { id: '123', countryName: 'Maldives' },
    { id: '124', countryName: 'Maliian' },
    { id: '125', countryName: 'Malta' },
    { id: '126', countryName: 'Morocco' },
    { id: '127', countryName: 'Martinique' },
    { id: '128', countryName: 'Mauritius' },
    { id: '129', countryName: 'Mauritania' },
    { id: '130', countryName: 'Mayotte' },
    { id: '131', countryName: 'Mexico' },
    { id: '132', countryName: 'Monaco' },
    { id: '133', countryName: 'Mongolia' },
    { id: '134', countryName: 'Montserrat' },
    { id: '135', countryName: 'Mozambique' },
    { id: '136', countryName: 'Myanmar' },
    { id: '137', countryName: 'Namibia' },
    { id: '138', countryName: 'Nauru' },
    { id: '139', countryName: 'Nepal' },
    { id: '140', countryName: 'Nicaragua' },
    { id: '141', countryName: 'Niger' },
    { id: '142', countryName: 'Nigeria' },
    { id: '143', countryName: 'Niue' },
    { id: '144', countryName: 'Norway' },
    { id: '145', countryName: 'New Caledonia' },
    { id: '146', countryName: 'New Zealand' },
    { id: '147', countryName: 'Oman' },
    { id: '148', countryName: 'Uganda' },
    { id: '149', countryName: 'Uzbekistan' },
    { id: '150', countryName: 'Pakistan' },
    { id: '151', countryName: 'Palau' },
    { id: '152', countryName: 'Panama' },
    { id: '153', countryName: 'Papua New Guinea' },
    { id: '154', countryName: 'Netherlands' },
    { id: '155', countryName: 'Peru' },
    { id: '156', countryName: 'Philippines' },
    { id: '157', countryName: 'Pitcairn' },
    { id: '158', countryName: 'Poland' },
    { id: '159', countryName: 'French Polynesia' },
    { id: '160', countryName: 'Puerto Rico' },
    { id: '161', countryName: 'Portugal' },
    { id: '162', countryName: 'Qatar' },
    { id: '163', countryName: 'Syrian Arab Republic' },
    { id: '164', countryName: 'Central African Republic' },
    { id: '165', countryName: 'Republic of Korea' },
    { id: '166', countryName: 'Republic of Moldova' },
    { id: '167', countryName: 'Democratic Republic of Congo' },
    { id: '168', countryName: 'Lao Peoples Democratic Republic' },
    { id: '169', countryName: 'Dominican Republic' },
    { id: '170', countryName: 'Islamic Republic of Iran' },
    { id: '171', countryName: 'Democratic Peoples Republic of Korea' },
    { id: '172', countryName: 'Czech Republic' },
    { id: '173', countryName: 'United Republic of Tanzania' },
    { id: '174', countryName: 'Meeting' },
    { id: '175', countryName: 'United Kingdom' },
    { id: '176', countryName: 'Rwanda' },
    { id: '177', countryName: 'Western Sahara' },
    { id: '178', countryName: 'Saint Kitts and Nevis' },
    { id: '179', countryName: 'San Marino' },
    { id: '180', countryName: 'Holy See (state of Vatican City)' },
    { id: '181', countryName: 'Saint Vincent and the Grenadines' },
    { id: '182', countryName: 'Saint Helena' },
    { id: '183', countryName: 'Saint Lucia' },
    { id: '184', countryName: 'Samoa' },
    { id: '185', countryName: 'American Samoa' },
    { id: '186', countryName: 'Sao Tome and Principe' },
    { id: '187', countryName: 'Senegal' },
    { id: '188', countryName: 'Serbia and Montenegro' },
    { id: '189', countryName: 'Seychelles' },
    { id: '190', countryName: 'Sierra Leone' },
    { id: '191', countryName: 'Singapore' },
    { id: '192', countryName: 'Slovakia' },
    { id: '193', countryName: 'Slovenia' },
    { id: '194', countryName: 'Somalia' },
    { id: '195', countryName: 'Sudan' },
    { id: '196', countryName: 'Sri Lanka' },
    { id: '197', countryName: 'Sweden' },
    { id: '198', countryName: 'Suriname' },
    { id: '199', countryName: 'Swaziland' },
    { id: '200', countryName: 'Tajikistan' },
    { id: '201', countryName: 'Taiwan' },
    { id: '202', countryName: 'Chad' },
    { id: '203', countryName: 'Palestinian Territory Occupied' },
    { id: '204', countryName: 'Thailand' },
    { id: '205', countryName: 'Timor-Leste' },
    { id: '206', countryName: 'Togo' },
    { id: '207', countryName: 'Tokelau' },
    { id: '208', countryName: 'Tonga' },
    { id: '209', countryName: 'Trinidad and Tobago' },
    { id: '210', countryName: 'Tunisia' },
    { id: '211', countryName: 'Turkmenistan' },
    { id: '212', countryName: 'Turkey' },
    { id: '213', countryName: 'Tuvalu' },
    { id: '214', countryName: 'Ukraine' },
    { id: '215', countryName: 'Uruguay' },
    { id: '216', countryName: 'Vanuatu' },
    { id: '217', countryName: 'Venezuela' },
    { id: '218', countryName: 'Viet Nam' },
    { id: '219', countryName: 'Wallis and Futuna' },
    { id: '220', countryName: 'Yemen' },
    { id: '221', countryName: 'Zambia' },
    { id: '222', countryName: 'Zimbabwe' },
    { id: '223', countryName: 'Cameroon' },
    { id: '224', countryName: 'Canada' },
    { id: '225', countryName: 'Comoros' },
    { id: '226', countryName: 'Paraguay' },
    { id: '227', countryName: 'Romania' },
    { id: '229', countryName: 'Switzerland' },
    { id: '230', countryName: 'Burundi' },
    { id: '231', countryName: 'American' },
    { id: '232', countryName: 'English' },
    { id: '233', countryName: 'Andorran' },
    { id: '234', countryName: 'Bissau-Guinéenne' },
    { id: '235', countryName: 'British' },
    { id: '236', countryName: 'Burmese' },
    { id: '237', countryName: 'Scotland' },
    { id: '238', countryName: 'Welsh' },
    { id: '239', countryName: 'Hellenic' },
    { id: '240', countryName: 'Herzegovinian' },
    { id: '241', countryName: 'Hollandaise' },
    { id: '242', countryName: 'Iran' },
    { id: '243', countryName: 'Kittitian-and-nevicienne' },
    { id: '244', countryName: 'Kossovienne' },
    { id: '245', countryName: 'Laotian' },
    { id: '246', countryName: 'Macedonian' },
    { id: '247', countryName: 'Malagasy' },
    { id: '248', countryName: 'Marshallaise' },
    { id: '249', countryName: 'Micronesian' },
    { id: '250', countryName: 'Mosotho' },
    { id: '251', countryName: 'North Korea' },
    { id: '253', countryName: 'South Korea' },
    { id: '254', countryName: 'Barbudans' },
    { id: '255', countryName: 'Belarusian' },
    { id: '257', countryName: 'Brazilian' },
    { id: '258', countryName: 'Korean' },
    { id: '259', countryName: 'Ecuadorian' },
    { id: '260', countryName: 'Eritrean' },
    { id: '261', countryName: 'Spanish' },
    { id: '262', countryName: 'East Timorese' },
    { id: '263', countryName: 'Finnish' },
    { id: '264', countryName: 'Maldivan' },
    { id: '265', countryName: 'Moroccan' },
    { id: '266', countryName: 'Mauritian' },
    { id: '267', countryName: 'Moldovan' },
    { id: '268', countryName: 'Salvadoran' },
  ];

  nationalitiesFrList = [
    { id: '1', countryName: 'Française' },
    { id: '2', countryName: 'Afghan' },
    { id: '3', countryName: 'Sud-africaine' },
    { id: '4', countryName: 'Albanaise' },
    { id: '5', countryName: 'Algérienne' },
    { id: '6', countryName: 'Allemagne' },
    { id: '7', countryName: 'Angolaise' },
    { id: '8', countryName: 'Anguilla' },
    { id: '9', countryName: 'Antartique' },
    { id: '10', countryName: 'Antiguaise et barbudienne' },
    { id: '11', countryName: 'Antilles Néerlandaises' },
    { id: '12', countryName: 'Saoudienne' },
    { id: '13', countryName: 'Argentine' },
    { id: '14', countryName: 'Armenienne' },
    { id: '15', countryName: 'Aruba' },
    { id: '16', countryName: 'Australienne' },
    { id: '17', countryName: 'Autrichienne' },
    { id: '18', countryName: 'Azerbaïdjanaise' },
    { id: '19', countryName: 'Bahamienne' },
    { id: '20', countryName: 'Bahreinienne' },
    { id: '21', countryName: 'Bangladaise' },
    { id: '22', countryName: 'Barbadienne' },
    { id: '23', countryName: 'Bielorusse' },
    { id: '24', countryName: 'Belge' },
    { id: '25', countryName: 'Belizienne' },
    { id: '26', countryName: 'Beninoise' },
    { id: '27', countryName: 'Bermudes' },
    { id: '28', countryName: 'Bhoutanaise' },
    { id: '29', countryName: 'Bolivienne' },
    { id: '30', countryName: 'Bosnienne' },
    { id: '31', countryName: 'Botswanaise' },
    { id: '32', countryName: 'Brésilienne' },
    { id: '33', countryName: 'Bruneienne' },
    { id: '34', countryName: 'Bulgare' },
    { id: '35', countryName: 'Burkinabe' },
    { id: '36', countryName: 'Cambodgienne' },
    { id: '37', countryName: 'Cap-verdienne' },
    { id: '38', countryName: 'Chilienne' },
    { id: '39', countryName: 'Chinoise' },
    { id: '40', countryName: 'Chypriote' },
    { id: '41', countryName: 'Colombie' },
    { id: '42', countryName: 'Costaricienne' },
    { id: '43', countryName: 'Ivoirienne' },
    { id: '44', countryName: 'Croate' },
    { id: '45', countryName: 'Cubaine' },
    { id: '46', countryName: 'Danoise' },
    { id: '47', countryName: 'Djiboutienne' },
    { id: '48', countryName: 'Dominique' },
    { id: '49', countryName: 'Égyptienne' },
    { id: '50', countryName: 'El Salvador' },
    { id: '51', countryName: 'Emirienne' },
    { id: '52', countryName: 'Équatorienne' },
    { id: '53', countryName: 'Érythrée' },
    { id: '54', countryName: 'Espagne' },
    { id: '55', countryName: 'Estonie' },
    { id: '56', countryName: 'États Fédérés de Micronésie' },
    { id: '57', countryName: 'États-Unis' },
    { id: '58', countryName: 'Éthiopie' },
    { id: '59', countryName: 'Fédération de Russie' },
    { id: '60', countryName: 'Fidji' },
    { id: '61', countryName: 'Finlande' },
    { id: '62', countryName: 'Gabon' },
    { id: '63', countryName: 'Gambie' },
    { id: '64', countryName: 'Géorgie' },
    { id: '65', countryName: 'Ghana' },
    { id: '66', countryName: 'Gibratlar' },
    { id: '67', countryName: 'Grecque' },
    { id: '68', countryName: 'Grenade' },
    { id: '69', countryName: 'Groenland' },
    { id: '70', countryName: 'Guadeloupe' },
    { id: '71', countryName: 'Guam' },
    { id: '72', countryName: 'Guatémaltèque' },
    { id: '73', countryName: 'Guineenne' },
    { id: '74', countryName: 'Guinée-Bissau' },
    { id: '75', countryName: 'Guinée Équatoriale' },
    { id: '76', countryName: 'Guyanienne' },
    { id: '77', countryName: 'Guyane Française' },
    { id: '78', countryName: 'Haïtienne' },
    { id: '79', countryName: 'Hondurienne' },
    { id: '80', countryName: 'Hong-Kong' },
    { id: '82', countryName: 'Hongroise' },
    { id: '83', countryName: 'Île Bouvet' },
    { id: '84', countryName: 'Île Christmas' },
    { id: '85', countryName: 'Île de Man' },
    { id: '86', countryName: 'Île Norfolk' },
    { id: '87', countryName: 'Îles (malvinas) Falkland' },
    { id: '88', countryName: 'Îles Åland' },
    { id: '89', countryName: 'Îles Cocos (Keeling)' },
    { id: '90', countryName: 'Îles Cook' },
    { id: '91', countryName: 'Îles Féroé' },
    { id: '92', countryName: 'Îles Salomon' },
    { id: '93', countryName: 'Îles Turks et Caïques' },
    { id: '94', countryName: 'Îles Vierges Britanniques' },
    { id: '95', countryName: 'Îles Vierges des États-Unis' },
    { id: '96', countryName: 'Inde' },
    { id: '97', countryName: 'Indonésie' },
    { id: '98', countryName: 'Iraq' },
    { id: '99', countryName: 'Irlande' },
    { id: '100', countryName: 'Islande' },
    { id: '101', countryName: 'Israël' },
    { id: '102', countryName: 'Italie' },
    { id: '103', countryName: 'Jamahiriya Arabe Libyenne' },
    { id: '104', countryName: 'Jamaïque' },
    { id: '105', countryName: 'Japon' },
    { id: '106', countryName: 'Jordanie' },
    { id: '107', countryName: 'Kazakhstan' },
    { id: '108', countryName: 'Kenya' },
    { id: '109', countryName: 'Kirghizistan' },
    { id: '110', countryName: 'Kiribati' },
    { id: '111', countryName: 'Koweït' },
    { id: '112', countryName: 'Lesotho' },
    { id: '113', countryName: 'Lettonie' },
    { id: '114', countryName: 'Liban' },
    { id: '115', countryName: 'Libéria' },
    { id: '116', countryName: 'Liechtenstein' },
    { id: '117', countryName: 'Lituanie' },
    { id: '118', countryName: 'Luxembourg' },
    { id: '119', countryName: 'Macao' },
    { id: '121', countryName: 'Malaisie' },
    { id: '122', countryName: 'Malawi' },
    { id: '123', countryName: 'Maldives' },
    { id: '124', countryName: 'Malienne' },
    { id: '125', countryName: 'Maltaise' },
    { id: '126', countryName: 'Marocaine' },
    { id: '127', countryName: 'Martinique' },
    { id: '128', countryName: 'Maurice' },
    { id: '129', countryName: 'Mauritanienne' },
    { id: '130', countryName: 'Mayotte' },
    { id: '131', countryName: 'Mexicaine' },
    { id: '132', countryName: 'Monaco' },
    { id: '133', countryName: 'Mongole' },
    { id: '134', countryName: 'Montenegrine' },
    { id: '135', countryName: 'Mozambicaine' },
    { id: '136', countryName: 'Birmane' },
    { id: '137', countryName: 'Namibienne' },
    { id: '138', countryName: 'Nauruane' },
    { id: '139', countryName: 'Nepalaise' },
    { id: '140', countryName: 'Nicaraguayenne' },
    { id: '141', countryName: 'Niger' },
    { id: '142', countryName: 'Nigerienne' },
    { id: '143', countryName: 'Niué' },
    { id: '144', countryName: 'Norvégienne' },
    { id: '145', countryName: 'Nouvelle-Calédonie' },
    { id: '146', countryName: 'Nouvelle-Zélande' },
    { id: '147', countryName: 'Oman' },
    { id: '148', countryName: 'Ouganda' },
    { id: '149', countryName: 'Ouzbeke' },
    { id: '150', countryName: 'Pakistan' },
    { id: '151', countryName: 'Palaos' },
    { id: '152', countryName: 'Panama' },
    { id: '153', countryName: 'Papouasie-Nouvelle-Guinée' },
    { id: '154', countryName: 'Pays-Bas' },
    { id: '155', countryName: 'Pérou' },
    { id: '156', countryName: 'Philippines' },
    { id: '157', countryName: 'Pitcairn' },
    { id: '158', countryName: 'Pologne' },
    { id: '159', countryName: 'Polynésie française' },
    { id: '160', countryName: 'Porto Rico' },
    { id: '161', countryName: 'Portugal' },
    { id: '162', countryName: 'Qatar' },
    { id: '163', countryName: 'République arabe syrienne' },
    { id: '164', countryName: 'République centrafricaine' },
    { id: '165', countryName: 'République de Corée' },
    { id: '166', countryName: 'République de Moldova' },
    { id: '167', countryName: 'République Démocratique du Congo' },
    { id: '168', countryName: 'République démocratique populaire lao' },
    { id: '169', countryName: 'République Dominicaine' },
    { id: '170', countryName: 'République islamique d`Iran' },
    { id: '171', countryName: 'République Populaire Démocratique de Corée' },
    { id: '172', countryName: 'République Tchèque' },
    { id: '173', countryName: 'République-Unie de Tanzanie' },
    { id: '174', countryName: 'Réunion' },
    { id: '175', countryName: 'Royaume-Uni' },
    { id: '176', countryName: 'Rwanda' },
    { id: '177', countryName: 'Sahara Occidental' },
    { id: '178', countryName: 'Saint-Kitts-et-Nevis' },
    { id: '179', countryName: 'Saint-Mari' },
    { id: '180', countryName: 'Saint-Siège (État de la Cité du Vatican)' },
    { id: '181', countryName: 'Saint-Vincent-et-les-Grenadines' },
    { id: '182', countryName: 'Sainte-Hélène' },
    { id: '183', countryName: 'Sainte-Lucie' },
    { id: '184', countryName: 'Samoa' },
    { id: '185', countryName: 'Samoa américaines' },
    { id: '186', countryName: 'Sao Tomé et Principe' },
    { id: '187', countryName: 'Sénégal' },
    { id: '188', countryName: 'Serbie et Monténégro' },
    { id: '189', countryName: 'les Seychelles' },
    { id: '190', countryName: 'Sierra Leone' },
    { id: '191', countryName: 'Singapour' },
    { id: '192', countryName: 'Slovaquie' },
    { id: '193', countryName: 'Slovénie' },
    { id: '194', countryName: 'Somalia' },
    { id: '195', countryName: 'Soudan' },
    { id: '196', countryName: 'Sri Lanka' },
    { id: '197', countryName: 'Suède' },
    { id: '198', countryName: 'Suriname' },
    { id: '199', countryName: 'Swaziland' },
    { id: '200', countryName: 'Tadjikistan' },
    { id: '201', countryName: 'Taïwan' },
    { id: '202', countryName: 'Tchad' },
    { id: '203', countryName: 'Territoire palestinien Occupé' },
    { id: '204', countryName: 'Thaïlande' },
    { id: '205', countryName: 'Timor-Leste' },
    { id: '206', countryName: 'Togo' },
    { id: '207', countryName: 'Tokelau' },
    { id: '208', countryName: 'Tonga' },
    { id: '209', countryName: 'Trinité-et-Tobago' },
    { id: '210', countryName: 'Tunisie' },
    { id: '211', countryName: 'Turkménistan' },
    { id: '212', countryName: 'Turquie' },
    { id: '213', countryName: 'Tuvalu' },
    { id: '214', countryName: 'Ukraine' },
    { id: '215', countryName: 'Uruguay' },
    { id: '216', countryName: 'Vanuatu' },
    { id: '217', countryName: 'Venezuela' },
    { id: '218', countryName: 'Viet Nam' },
    { id: '219', countryName: 'Wallis and Futuna' },
    { id: '220', countryName: 'Yémen' },
    { id: '221', countryName: 'Zambia' },
    { id: '222', countryName: 'Zimbabwe' },
    { id: '223', countryName: 'Camerounaise' },
    { id: '224', countryName: 'Canadienne' },
    { id: '225', countryName: 'Comorienne' },
    { id: '226', countryName: 'Paraguayenne' },
    { id: '227', countryName: 'Roumaine' },
    { id: '229', countryName: 'Suisse' },
    { id: '230', countryName: 'Burundaise' },
    { id: '231', countryName: 'Américaine' },
    { id: '232', countryName: 'Anglaise' },
    { id: '233', countryName: 'Andorrane' },
    { id: '234', countryName: 'Bissau-Guinéenne' },
    { id: '235', countryName: 'Britannique' },
    { id: '236', countryName: 'Burmese' },
    { id: '237', countryName: 'Écossais' },
    { id: '238', countryName: 'Gallois' },
    { id: '239', countryName: 'Hellenique' },
    { id: '240', countryName: 'Herzegoviniese' },
    { id: '241', countryName: 'HollandHollandaiseaise' },
    { id: '242', countryName: 'Iraniese' },
    { id: '243', countryName: 'Kittitienne-et-nevicienne' },
    { id: '244', countryName: 'Kossovienne' },
    { id: '245', countryName: 'Laotienne' },
    { id: '246', countryName: 'Macedonienne' },
    { id: '247', countryName: 'Malgache' },
    { id: '248', countryName: 'Marshallaise' },
    { id: '249', countryName: 'Micronesienne' },
    { id: '250', countryName: 'Mosotho' },
    { id: '251', countryName: 'Nord-coréenne' },
    { id: '253', countryName: 'Sud-coréenne' },
    { id: '254', countryName: 'Barbudaine' },
    { id: '255', countryName: 'Belarusian' },
    { id: '257', countryName: 'Brazilian' },
    { id: '258', countryName: 'Coréenne' },
    { id: '259', countryName: 'Équatorienne' },
    { id: '260', countryName: 'Erythreenne' },
    { id: '261', countryName: 'Espagnole' },
    { id: '262', countryName: 'Est-timoraise' },
    { id: '263', countryName: 'Finnish' },
    { id: '264', countryName: 'Maldivienne' },
    { id: '265', countryName: 'Marocaine' },
    { id: '266', countryName: 'Mauritian' },
    { id: '267', countryName: 'Mauricienne' },
    { id: '268', countryName: 'Salvadorienne' },
  ];
  nationalityListFromCSV = [
    { id: '1', countryName: 'Afghan' },
    { id: '2', countryName: 'Albanian' },
    { id: '3', countryName: 'Algerian' },
    { id: '4', countryName: 'American Samoa' },
    { id: '5', countryName: 'Andorran' },
    { id: '6', countryName: 'Angolan' },
    { id: '7', countryName: 'Anguillan' },
    { id: '8', countryName: 'Antarctique' },
    { id: '9', countryName: 'Citizen of Antigua and Barbuda' },
    { id: '10', countryName: 'Argentine' },
    { id: '11', countryName: 'Armenian' },
    { id: '12', countryName: 'Aruba' },
    { id: '13', countryName: 'Australian' },
    { id: '14', countryName: 'Austrian' },
    { id: '15', countryName: 'Azerbaijani' },
    { id: '16', countryName: 'Bahamian' },
    { id: '17', countryName: 'Bahraini' },
    { id: '18', countryName: 'Bangladeshi' },
    { id: '19', countryName: 'Barbadian' },
    { id: '20', countryName: 'Belarusian' },
    { id: '21', countryName: 'Belgian' },
    { id: '22', countryName: 'Belizean' },
    { id: '23', countryName: 'Beninese' },
    { id: '24', countryName: 'Bermudian' },
    { id: '25', countryName: 'Bhutanese' },
    { id: '26', countryName: 'Bolivian' },
    { id: '27', countryName: 'Bonaire, Saint-Eustache et Saba' },
    { id: '28', countryName: 'Citizen of Bosnia and Herzegovina' },
    { id: '29', countryName: 'Botswanan' },
    { id: '30', countryName: 'Bouvet Island' },
    { id: '31', countryName: 'Brazilian' },
    { id: '32', countryName: 'British Indian Ocean Territory' },
    { id: '33', countryName: 'British Virgin Islander' },
    { id: '34', countryName: 'Bruneian' },
    { id: '35', countryName: 'Bulgarian' },
    { id: '36', countryName: 'Burkinan' },
    { id: '37', countryName: 'Burundian' },
    { id: '38', countryName: 'Cape Verdean' },
    { id: '39', countryName: 'Cambodian' },
    { id: '40', countryName: 'Cameroonian' },
    { id: '41', countryName: 'Canadian' },
    { id: '42', countryName: 'Cayman Islander' },
    { id: '43', countryName: 'Central African' },
    { id: '44', countryName: 'Chadian' },
    { id: '45', countryName: 'Chilean' },
    { id: '46', countryName: 'Chinese' },
    { id: '47', countryName: 'Hong Konger' },
    { id: '48', countryName: 'Macau' },
    { id: '49', countryName: 'Christmas Islander' },
    { id: '50', countryName: 'Cocos Island (Keeling) Islander' },
    { id: '51', countryName: 'Colombian' },
    { id: '52', countryName: 'Comoran' },
    { id: '53', countryName: 'Congolese' },
    { id: '54', countryName: 'Cook Islander' },
    { id: '55', countryName: 'Costa Rican' },
    { id: '56', countryName: 'Croatian' },
    { id: '57', countryName: 'Cuban' },
    { id: '58', countryName: 'Curaçaoan' },
    { id: '59', countryName: 'Cypriot' },
    { id: '60', countryName: 'Czech' },
    { id: '61', countryName: 'Ivorian' },
    { id: '62', countryName: 'North Korean' },
    { id: '63', countryName: 'Democratic Republic of Congo' },
    { id: '64', countryName: 'Danish' },
    { id: '65', countryName: 'Djiboutian' },
    { id: '66', countryName: 'Dominican' },
    { id: '67', countryName: 'Dominican Republic' },
    { id: '68', countryName: 'Ecuadorean' },
    { id: '69', countryName: 'Egyptian' },
    { id: '70', countryName: 'Salvadoran' },
    { id: '71', countryName: 'Equatorial Guinean' },
    { id: '72', countryName: 'Eritrean' },
    { id: '73', countryName: 'Estonian' },
    { id: '74', countryName: 'Swazi' },
    { id: '75', countryName: 'Ethiopian' },
    { id: '76', countryName: 'Falkland Islanders' },
    { id: '77', countryName: 'Faroe Islander' },
    { id: '78', countryName: 'Fijian' },
    { id: '79', countryName: 'Finnish' },
    { id: '80', countryName: 'French' },
    { id: '81', countryName: 'French Guianan' },
    { id: '82', countryName: 'French Polynesian' },
    { id: '83', countryName: 'French Southern Territories' },
    { id: '84', countryName: 'Gabonese' },
    { id: '85', countryName: 'Gambian' },
    { id: '86', countryName: 'Georgian' },
    { id: '87', countryName: 'German' },
    { id: '88', countryName: 'Ghanaian' },
    { id: '89', countryName: 'Gibraltarian' },
    { id: '90', countryName: 'Greek' },
    { id: '91', countryName: 'Greenlander' },
    { id: '92', countryName: 'Grenadian' },
    { id: '93', countryName: 'Guadeloupean' },
    { id: '94', countryName: 'Guamanian' },
    { id: '95', countryName: 'Guatemalan' },
    { id: '96', countryName: 'Guernsey' },
    { id: '97', countryName: 'Guinean' },
    { id: '98', countryName: 'Guinea-Bissauan' },
    { id: '99', countryName: 'Guyanese' },
    { id: '100', countryName: 'Haitian' },
    { id: '101', countryName: 'Heard Island and McDonald Islands' },
    { id: '102', countryName: 'Papal' },
    { id: '103', countryName: 'Honduran' },
    { id: '104', countryName: 'Hungarian' },
    { id: '105', countryName: 'Icelander' },
    { id: '106', countryName: 'Indian' },
    { id: '107', countryName: 'Indonesian' },
    { id: '108', countryName: 'Iranian' },
    { id: '109', countryName: 'Iraqi' },
    { id: '110', countryName: 'Irish' },
    { id: '111', countryName: 'Manx' },
    { id: '112', countryName: 'Israeli' },
    { id: '113', countryName: 'Italian' },
    { id: '114', countryName: 'Jamaican' },
    { id: '115', countryName: 'Japanese' },
    { id: '116', countryName: 'Jersey' },
    { id: '117', countryName: 'Jordanian' },
    { id: '118', countryName: 'Kazakh' },
    { id: '119', countryName: 'Kenyan' },
    { id: '120', countryName: 'I-Kiribati' },
    { id: '121', countryName: 'Kuwaiti' },
    { id: '122', countryName: 'Kyrgyz' },
    { id: '123', countryName: 'Laotian' },
    { id: '124', countryName: 'Latvian' },
    { id: '125', countryName: 'Lebanese' },
    { id: '126', countryName: 'Mosotho' },
    { id: '127', countryName: 'Liberian' },
    { id: '128', countryName: 'Libyan' },
    { id: '129', countryName: 'Liechtensteiner' },
    { id: '130', countryName: 'Lithuanian' },
    { id: '131', countryName: 'Luxembourger' },
    { id: '132', countryName: 'Malagasy' },
    { id: '133', countryName: 'Malawian' },
    { id: '134', countryName: 'Malaysian' },
    { id: '135', countryName: 'Maldivian' },
    { id: '136', countryName: 'Malian' },
    { id: '137', countryName: 'Maltese' },
    { id: '138', countryName: 'Marshallese' },
    { id: '139', countryName: 'Martiniquais' },
    { id: '140', countryName: 'Mauritanian' },
    { id: '141', countryName: 'Mauritian' },
    { id: '142', countryName: 'Mahoran' },
    { id: '143', countryName: 'Mexican' },
    { id: '144', countryName: 'Micronesian' },
    { id: '145', countryName: 'Monegasque' },
    { id: '146', countryName: 'Mongolian' },
    { id: '147', countryName: 'Montenegrin' },
    { id: '148', countryName: 'Montserratian' },
    { id: '149', countryName: 'Moroccan' },
    { id: '150', countryName: 'Mozambican' },
    { id: '151', countryName: 'Burmese' },
    { id: '152', countryName: 'Namibian' },
    { id: '153', countryName: 'Nauruan' },
    { id: '154', countryName: 'Nepalese' },
    { id: '155', countryName: 'Dutch' },
    { id: '156', countryName: 'New Caledonian' },
    { id: '157', countryName: 'New Zealander' },
    { id: '158', countryName: 'Nicaraguan' },
    { id: '159', countryName: 'Nigerien' },
    { id: '160', countryName: 'Nigerian' },
    { id: '161', countryName: 'Niuean' },
    { id: '162', countryName: 'Norfolk Islander' },
    { id: '163', countryName: 'Northern Mariana Islander' },
    { id: '164', countryName: 'Norwegian' },
    { id: '165', countryName: 'Omani' },
    { id: '166', countryName: 'Pakistani' },
    { id: '167', countryName: 'Palauan' },
    { id: '168', countryName: 'Panamanian' },
    { id: '169', countryName: 'Papua New Guinean' },
    { id: '170', countryName: 'Paraguayan' },
    { id: '171', countryName: 'Peruvian' },
    { id: '172', countryName: 'Filipino' },
    { id: '173', countryName: 'Pitcairn Islander' },
    { id: '174', countryName: 'Polish' },
    { id: '175', countryName: 'Portuguese' },
    { id: '176', countryName: 'Puerto Rican' },
    { id: '177', countryName: 'Qatari' },
    { id: '178', countryName: 'South Korean' },
    { id: '179', countryName: 'Moldovan' },
    { id: '180', countryName: 'Romanian' },
    { id: '181', countryName: 'Russian' },
    { id: '182', countryName: 'Rwandan' },
    { id: '183', countryName: 'Réunionese' },
    { id: '184', countryName: 'Barthélemois' },
    { id: '185', countryName: 'St Helenian' },
    { id: '186', countryName: 'Kittitian and Nevisian' },
    { id: '187', countryName: 'St Lucian' },
    { id: '188', countryName: 'Saint-Martinois' },
    { id: '189', countryName: 'Saint-Pierrais and Miquelonnais' },
    { id: '190', countryName: 'Vincentian and Grenadinian' },
    { id: '191', countryName: 'Samoan' },
    { id: '192', countryName: 'Sammarinese' },
    { id: '193', countryName: 'Sao Tomean' },
    { id: '194', countryName: 'Sark' },
    { id: '195', countryName: 'Saudi Arabian' },
    { id: '196', countryName: 'Senegalese' },
    { id: '197', countryName: 'Serbian and Montenegrin' },
    { id: '198', countryName: 'Citizen of Seychelles' },
    { id: '199', countryName: 'Sierra Leonean' },
    { id: '200', countryName: 'Singaporean' },
    { id: '201', countryName: 'Sint Maartener' },
    { id: '202', countryName: 'Slovak' },
    { id: '203', countryName: 'Slovenian' },
    { id: '204', countryName: 'Solomon Islander' },
    { id: '205', countryName: 'Somali' },
    { id: '206', countryName: 'South African' },
    { id: '207', countryName: 'South Georgian and South Sandwich Islander' },
    { id: '208', countryName: 'South Sudanese' },
    { id: '209', countryName: 'Spanish' },
    { id: '210', countryName: 'Sri Lankan' },
    { id: '211', countryName: 'Palestinian' },
    { id: '212', countryName: 'Sudanese' },
    { id: '213', countryName: 'Surinamese' },
    { id: '214', countryName: 'Svalbard and Jan Mayen Islands' },
    { id: '215', countryName: 'Swedish' },
    { id: '216', countryName: 'Swiss' },
    { id: '217', countryName: 'Syrian' },
    { id: '218', countryName: 'Tajik' },
    { id: '219', countryName: 'Thai' },
    { id: '220', countryName: 'Macedonian' },
    { id: '221', countryName: 'East Timorese' },
    { id: '222', countryName: 'Togolese' },
    { id: '223', countryName: 'Tokelauan' },
    { id: '224', countryName: 'Tongan' },
    { id: '225', countryName: 'Trinidadian and Tobagonian' },
    { id: '226', countryName: 'Tunisian' },
    { id: '227', countryName: 'Turkish' },
    { id: '228', countryName: 'Turkmen' },
    { id: '229', countryName: 'Turks and Caicos Islander' },
    { id: '230', countryName: 'Tuvaluan' },
    { id: '231', countryName: 'Ugandan' },
    { id: '232', countryName: 'Ukrainian' },
    { id: '233', countryName: 'Emirati' },
    { id: '234', countryName: 'British' },
    { id: '235', countryName: 'Tanzanian' },
    { id: '236', countryName: 'United States Minor Outlying Islands' },
    { id: '237', countryName: 'American Virgin Islander' },
    { id: '238', countryName: 'American' },
    { id: '239', countryName: 'Uruguayan' },
    { id: '240', countryName: 'Uzbek' },
    { id: '241', countryName: 'Citizen of Vanuatu' },
    { id: '242', countryName: 'Venezuelan' },
    { id: '243', countryName: 'Vietnamese' },
    { id: '244', countryName: 'Wallis and Futuna' },
    { id: '245', countryName: 'Western Sahara' },
    { id: '246', countryName: 'Yemeni' },
    { id: '247', countryName: 'Zambian' },
    { id: '248', countryName: 'Zimbabwean' },
    { id: '249', countryName: 'Kosovian' },
    { id: '250', countryName: 'Taiwan' }    
  ];

  // To detect change in student card
  // data when click on rncp title card
  triggerStudentCardSource = new BehaviorSubject<number>(0);
  triggerStudentCard$ = this.triggerStudentCardSource.asObservable();

  triggerStudentCardPosition = new BehaviorSubject<number>(0);
  triggerStudentCardPosition$ = this.triggerStudentCardPosition.asObservable();

  constructor(private httpClient: HttpClient, private apollo: Apollo, private translate: TranslateService) {}
  updateStudentCard(isUpdate: boolean) {
    if (isUpdate) {
      this.triggerStudentCardSource.next(this.triggerStudentCardSource.value + 1);
    }
  }
  updateStudentCardPosition(data: any) {
    if (data) {
      this.triggerStudentCardPosition.next(data);
    }
  }

  resetStudentCardTrigger(isReset: boolean) {
    if (isReset) {
      this.triggerStudentCardSource.next(0);
    }
  }

  resetStudentCardPosition(isReset: boolean) {
    if (isReset) {
      this.triggerStudentCardPosition.next(0);
    }
  }

  getStudentId(userId): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query GetOneUser{
          GetOneUser(_id:"${userId}"){
              _id
              student_id {
                  _id
                  rncp_title {
                    _id
                    short_name
                  }
                  current_class {
                    _id
                    name
                  }
              }
              email
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneUser']));
  }

  getStudentSchool(studentId): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query{
          GetOneStudent(_id:"${studentId}"){
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneUser']));
  }

  CreateActivity(payload) {
    console.log('test create activity');
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateActivity($payload: [StudentActivitiesInput]) {
            CreateActivity(student_activity_input: $payload) {
              _id
              student_id {
                _id
              }
              type_of_activity
              action
              description
              description_en
              description_fr
              count_document
              created_at
            }
          }
        `,
        variables: {
          payload: payload,
        },
      })
      .pipe(map((resp) => resp.data['UpdateStudent']));
  }

  // @Cacheable()
  getAllCandidates(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidates($pagination: PaginationInput, $sort: StudentSorting) {
            GetAllCandidates(pagination: $pagination, sorting: $sort, ${filter}) {
                  _id
                  civility
                  first_name
                  last_name
                  telephone
                  is_admitted
                  student_type
                  school_id
                  email
                  nationality
                  photo
                  announcement_call
                  announcement_email
                  intake_channel
                  profil_rate
                  engagement_level
                  connection
                  personal_information
                  signature
                  method_of_payment
                  payment
                  admission_member_id {
                    _id
                    first_name
                    last_name
                    civility
                    email
                  }
                  student_mentor_id {
                    _id
                    civility
                    first_name
                    last_name
                    email
                  }
                  fixed_phone
                  is_whatsapp
                  participate_in_open_house_day
                  participate_in_job_meeting
                  count_document
                  user_id
                }
              }
              user_id {
                _id
              }
              job_description_id {
                _id
                job_name
                job_description_status
              }
              problematic_id {
                _id
                problematic_status
              }
              mentor_evaluation_id {
                _id
                mentor_evaluation_status
              }
              employability_survey_ids {
                _id
                survey_status
                validator
              }
            }
          }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllStudents']));
  }
  getAllStudentsActive(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllStudents($pagination: PaginationInput, $sort: StudentSorting) {
            GetAllStudents(pagination: $pagination, sorting: $sort, ${filter}, status: active_pending, group_details: true) {
              group_details {
                name
                test {
                  name
                }
              }
              count_document
              incorrect_email
              _id
              civility
              first_name
              last_name
              email
              photo
              date_of_birth
              place_of_birth
              tele_phone
              academic_journey_id {
                diplomas {
                  diploma_photo
                }
              }
              createdAt
              certificate_issuance_status
              identity_verification_status
              is_photo_in_s3
              photo_s3_path
              is_thumbups_green
              status
              school {
                _id
                short_name
              }
              rncp_title {
                _id
                short_name
              }
              current_class {
                _id
                name
              }
              final_transcript_id {
                _id
                status
                final_transcript_status
                certification_status
                jury_decision_for_final_transcript
                input_final_decision_status
                is_validated
                student_decision
                after_final_retake_decision
                has_jury_finally_decided
                retake_test_for_students {
                  test_id {
                    _id
                  }
                }
              }
              user_id {
                _id
              }
              job_description_id {
                _id
                job_name
                job_description_status
              }
              problematic_id {
                _id
                problematic_status
              }
              mentor_evaluation_id {
                _id
                mentor_evaluation_status
              }
              employability_survey_ids {
                _id
                survey_status
                validator
              }
              soft_skill_pro_evaluation {
                status
              }
              academic_pro_evaluation {
                status
              }
              companies {
                company {
                  _id
                  company_name
                }
                status
                mentor {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
              }
            }
          }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllStudents']));
  }
  getAllStudentsCompleted(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllStudents($pagination: PaginationInput, $sort: StudentSorting) {
            GetAllStudents(pagination: $pagination, sorting: $sort, ${filter}, status: completed, group_details: true) {
              group_details {
                name
                test {
                  name
                }
              }
              count_document
              incorrect_email
              _id
              civility
              first_name
              last_name
              email
              photo
              date_of_birth
              place_of_birth
              tele_phone
              academic_journey_id {
                diplomas {
                  diploma_photo
                }
              }
              createdAt
              certificate_issuance_status
identity_verification_status
              is_photo_in_s3
              photo_s3_path
              status
              school {
                _id
                short_name
              }
              rncp_title {
                _id
                short_name
              }
              current_class {
                _id
                name
              }
              soft_skill_pro_evaluation {
                status
              }
              academic_pro_evaluation {
                status
              }
              final_transcript_id {
                _id
                status
                final_transcript_status
                certification_status
                jury_decision_for_final_transcript
                input_final_decision_status
                is_validated
                student_decision
                after_final_retake_decision
                has_jury_finally_decided
                retake_test_for_students {
                  test_id {
                    _id
                  }
                }
              }
              user_id {
                _id
              }
              employability_survey_ids {
                _id
                survey_status
                validator
              }
              companies {
                company {
                  _id
                  company_name
                }
                status
                mentor {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
              }
            }
          }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllStudents']));
  }
  getAllStudentsSuspended(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllStudents($pagination: PaginationInput, $sort: StudentSorting) {
            GetAllStudents(pagination: $pagination, sorting: $sort, ${filter}, status: suspended) {
              group_details {
                name
                test {
                  name
                }
              }
              count_document
              incorrect_email
              _id
              civility
              first_name
              last_name
              email
              photo
              date_of_birth
              place_of_birth
              tele_phone
              academic_journey_id {
                diplomas {
                  diploma_photo
                }
              }
              createdAt
              certificate_issuance_status
              identity_verification_status
              is_photo_in_s3
              photo_s3_path
              is_thumbups_green
              reason_for_resignation
              date_of_resignation
              status
              student_title_status
              school {
                _id
                short_name
              }
              soft_skill_pro_evaluation {
                status
              }
              academic_pro_evaluation {
                status
              }
              rncp_title {
                _id
                short_name
              }
              current_class {
                _id
                name
              }
              final_transcript_id {
                _id
                status
                final_transcript_status
                certification_status
                jury_decision_for_final_transcript
                input_final_decision_status
                is_validated
                student_decision
                after_final_retake_decision
                has_jury_finally_decided
                retake_test_for_students {
                  test_id {
                    _id
                  }
                }
              }
              user_id {
                _id
              }
              job_description_id {
                _id
                job_name
                job_description_status
              }
              problematic_id {
                _id
                problematic_status
              }
              mentor_evaluation_id {
                _id
                mentor_evaluation_status
              }
              employability_survey_ids {
                _id
                survey_status
                validator
              }
              companies {
                company {
                  _id
                  company_name
                }
                status
                mentor {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
              }
            }
          }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllStudents']));
  }
  getAllStudentDeactivated(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetDeactivatedStudents($pagination: PaginationInput, $sort: StudentSorting) {
            GetDeactivatedStudents(pagination: $pagination, sorting: $sort, ${filter}) {
              group_details {
                name
                test {
                  name
                }
              }
              count_document
              incorrect_email
              _id
              civility
              first_name
              last_name
              email
              photo
              date_of_birth
              place_of_birth
              tele_phone
              academic_journey_id {
                diplomas {
                  diploma_photo
                }
              }
              createdAt
              certificate_issuance_status
              identity_verification_status
              is_photo_in_s3
              photo_s3_path
              is_thumbups_green
              reason_for_resignation
              date_of_resignation
              status
              student_title_status
              school {
                _id
                short_name
              }
              rncp_title {
                _id
                short_name
              }
              current_class {
                _id
                name
              }
              final_transcript_id {
                _id
                status
                final_transcript_status
                certification_status
                jury_decision_for_final_transcript
                input_final_decision_status
                is_validated
                student_decision
                after_final_retake_decision
                has_jury_finally_decided
                retake_test_for_students {
                  test_id {
                    _id
                  }
                }
              }
              user_id {
                _id
              }
              soft_skill_pro_evaluation {
                status
              }
              academic_pro_evaluation {
                status
              }
              job_description_id {
                _id
                job_name
                job_description_status
              }
              problematic_id {
                _id
                problematic_status
              }
              mentor_evaluation_id {
                _id
                mentor_evaluation_status
              }
              employability_survey_ids {
                _id
                survey_status
                validator
              }
              companies {
                company {
                  _id
                  company_name
                }
                status
                mentor {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
              }
            }
          }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetDeactivatedStudents']));
  }

  getAllStudentsExport(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllStudents(${filter}, status: active_pending) {
              count_document
              _id
              civility
              first_name
              last_name
              email
              photo
              date_of_birth
              place_of_birth
              createdAt
              certificate_issuance_status
identity_verification_status
              is_photo_in_s3
              photo_s3_path
              is_thumbups_green
              status
              school {
                _id
                short_name
              }
              rncp_title {
                _id
                short_name
              }
              current_class {
                _id
                name
              }
              final_transcript_id {
                _id
                status
                final_transcript_status
                certification_status
                jury_decision_for_final_transcript
                input_final_decision_status
                is_validated
                student_decision
                after_final_retake_decision
                has_jury_finally_decided
                retake_test_for_students {
                  test_id {
                    _id
                  }
                }
              }
              corrected_tests {
                correction {
                  correction_grid {
                    correction {
                      additional_total
                      total
                    }
                  }
                  expected_documents {
                    validation_status
                    document {
                      s3_file_name
                    }
                  }
                  mark_entry_document {
                    s3_file_name
                  }
                }
                test {
                  expected_documents {
                    document_name
                  }
                  correction_status_for_schools {
                    correction_status
                  }
                  correction_grid {
                    correction {
                      total_zone {
                        display_additional_total
                      }
                    }
                  }
                  evaluation_id {
                    _id
                  }
                }
              }
              soft_skill_pro_evaluation {
                status
              }
              academic_pro_evaluation {
                status
              }
              companies {
                company {
                  _id
                  company_name
                }
                status
                mentor {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
              }
              user_id {
                _id
              }
              job_description_id {
                _id
                job_name
                job_description_status
              }
              problematic_id {
                _id
                problematic_status
              }
              mentor_evaluation_id {
                _id
                mentor_evaluation_status
              }
              employability_survey_ids {
                _id
                survey_status
                validator
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllStudents']));
  }
  getAllStudentsExportComplete(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllStudents(${filter}, status: completed) {
              count_document
              _id
              civility
              first_name
              last_name
              email
              photo
              date_of_birth
              place_of_birth
              createdAt
              certificate_issuance_status
identity_verification_status
              is_photo_in_s3
              photo_s3_path
              is_thumbups_green
              status
              school {
                _id
                short_name
              }
              rncp_title {
                _id
                short_name
              }
              current_class {
                _id
                name
              }
              final_transcript_id {
                _id
                status
                final_transcript_status
                certification_status
                jury_decision_for_final_transcript
                input_final_decision_status
                is_validated
                student_decision
                after_final_retake_decision
                has_jury_finally_decided
                retake_test_for_students {
                  test_id {
                    _id
                  }
                }
              }
              soft_skill_pro_evaluation {
                status
              }
              academic_pro_evaluation {
                status
              }
              corrected_tests {
                correction {
                  correction_grid {
                    correction {
                      additional_total
                      total
                    }
                  }
                  expected_documents {
                    validation_status
                    document {
                      s3_file_name
                    }
                  }
                  mark_entry_document {
                    s3_file_name
                  }
                }
                test {
                  expected_documents {
                    document_name
                  }
                  correction_status_for_schools {
                    correction_status
                  }
                  correction_grid {
                    correction {
                      total_zone {
                        display_additional_total
                      }
                    }
                  }
                  evaluation_id {
                    _id
                  }
                }
              }
              companies {
                company {
                  _id
                  company_name
                }
                status
                mentor {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
              }
              user_id {
                _id
              }
              job_description_id {
                _id
                job_name
                job_description_status
              }
              problematic_id {
                _id
                problematic_status
              }
              mentor_evaluation_id {
                _id
                mentor_evaluation_status
              }
              employability_survey_ids {
                _id
                survey_status
                validator
              }
              previous_courses_id {
                rncp_id {
                  _id
                  short_name
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllStudents']));
  }
  getAllStudentsExportSuspended(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllStudents(${filter}, status: suspended) {
              count_document
              _id
              civility
              first_name
              last_name
              email
              photo
              is_photo_in_s3
              photo_s3_path
              is_thumbups_green
              reason_for_resignation
              date_of_resignation
              status
              school {
                _id
                short_name
              }
              rncp_title {
                _id
                short_name
              }
              current_class {
                _id
                name
              }
              soft_skill_pro_evaluation {
                status
              }
              academic_pro_evaluation {
                status
              }
              final_transcript_id {
                _id
                status
                final_transcript_status
                certification_status
                jury_decision_for_final_transcript
                input_final_decision_status
                is_validated
                student_decision
                after_final_retake_decision
                has_jury_finally_decided
                retake_test_for_students {
                  test_id {
                    _id
                  }
                }
              }
              corrected_tests {
                correction {
                  correction_grid {
                    correction {
                      additional_total
                      total
                    }
                  }
                  expected_documents {
                    validation_status
                    document {
                      s3_file_name
                    }
                  }
                  mark_entry_document {
                    s3_file_name
                  }
                }
                test {
                  expected_documents {
                    document_name
                  }
                  correction_status_for_schools {
                    correction_status
                  }
                  correction_grid {
                    correction {
                      total_zone {
                        display_additional_total
                      }
                    }
                  }
                  evaluation_id {
                    _id
                  }
                }
              }
              companies {
                company {
                  _id
                  company_name
                }
                status
                mentor {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
              }
              user_id {
                _id
              }
              job_description_id {
                _id
                job_name
                job_description_status
              }
              problematic_id {
                _id
                problematic_status
              }
              mentor_evaluation_id {
                _id
                mentor_evaluation_status
              }
              employability_survey_ids {
                _id
                survey_status
                validator
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllStudents']));
  }
  getAllStudentsExportDeactivated(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetDeactivatedStudents(${filter}) {
              count_document
              _id
              civility
              first_name
              last_name
              email
              photo
              is_photo_in_s3
              photo_s3_path
              is_thumbups_green
              reason_for_resignation
              date_of_resignation
              status
              school {
                _id
                short_name
              }
              rncp_title {
                _id
                short_name
              }
              current_class {
                _id
                name
              }
              soft_skill_pro_evaluation {
                status
              }
              academic_pro_evaluation {
                status
              }
              final_transcript_id {
                _id
                status
                final_transcript_status
                certification_status
                jury_decision_for_final_transcript
                input_final_decision_status
                is_validated
                student_decision
                after_final_retake_decision
                has_jury_finally_decided
                retake_test_for_students {
                  test_id {
                    _id
                  }
                }
              }
              corrected_tests {
                correction {
                  correction_grid {
                    correction {
                      additional_total
                      total
                    }
                  }
                  expected_documents {
                    validation_status
                    document {
                      s3_file_name
                    }
                  }
                  mark_entry_document {
                    s3_file_name
                  }
                }
                test {
                  expected_documents {
                    document_name
                  }
                  correction_status_for_schools {
                    correction_status
                  }
                  correction_grid {
                    correction {
                      total_zone {
                        display_additional_total
                      }
                    }
                  }
                  evaluation_id {
                    _id
                  }
                }
              }
              companies {
                company {
                  _id
                  company_name
                }
                status
                mentor {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
              }
              user_id {
                _id
              }
              job_description_id {
                _id
                job_name
                job_description_status
              }
              problematic_id {
                _id
                problematic_status
              }
              mentor_evaluation_id {
                _id
                mentor_evaluation_status
              }
              employability_survey_ids {
                _id
                survey_status
                validator
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetDeactivatedStudents']));
  }

  getAllStudentsChiefGroup(pagination, school_ids, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllStudentsChiefGroup($pagination: PaginationInput, $school_ids: [ID], $sort: StudentSorting) {
            GetAllStudents(
              pagination: $pagination,
              school_ids: $school_ids,
              sorting: $sort, ${filter},
              status: active_pending,
              group_details: true
            ) {
              group_details {
                name
                test {
                  name
                }
              }
              count_document
              incorrect_email
              _id
              civility
              first_name
              last_name
              email
              photo
              date_of_birth
              place_of_birth
              tele_phone
              academic_journey_id {
                diplomas {
                  diploma_photo
                }
              }
              soft_skill_pro_evaluation {
                status
              }
              academic_pro_evaluation {
                status
              }
              createdAt
              certificate_issuance_status
              identity_verification_status
              is_photo_in_s3
              photo_s3_path
              is_thumbups_green
              status
              school {
                _id
                short_name
              }
              rncp_title {
                _id
                short_name
              }
              current_class {
                _id
                name
              }
              final_transcript_id {
                _id
                status
                final_transcript_status
                certification_status
                jury_decision_for_final_transcript
                input_final_decision_status
                is_validated
                student_decision
                after_final_retake_decision
                has_jury_finally_decided
                retake_test_for_students {
                  test_id {
                    _id
                  }
                }
              }
              user_id {
                _id
              }
              job_description_id {
                _id
                job_name
                job_description_status
              }
              problematic_id {
                _id
                problematic_status
              }
              mentor_evaluation_id {
                _id
                mentor_evaluation_status
              }
              employability_survey_ids {
                _id
                survey_status
                validator
              }
              companies {
                company {
                  _id
                  company_name
                }
                status
                mentor {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
              }
            }
          }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
          school_ids,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllStudents']));
  }
  getAllStudentsChiefGroupCompleted(pagination, school_ids, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllStudentsChiefGroup($pagination: PaginationInput, $school_ids: [ID], $sort: StudentSorting) {
            GetAllStudents(
              pagination: $pagination,
              school_ids: $school_ids,
              sorting: $sort, ${filter},
              status: completed,
              group_details: true,
            ) {
              group_details {
                name
                test {
                  name
                }
              }
              count_document
              incorrect_email
              _id
              civility
              first_name
              last_name
              email
              photo
              date_of_birth
              place_of_birth
              tele_phone
              academic_journey_id {
                diplomas {
                  diploma_photo
                }
              }
              soft_skill_pro_evaluation {
                status
              }
              academic_pro_evaluation {
                status
              }
              createdAt
              certificate_issuance_status
identity_verification_status
              is_photo_in_s3
              photo_s3_path
              status
              school {
                _id
                short_name
              }
              previous_courses_id {
                rncp_id {
                  _id
                  short_name
                }
              }
              rncp_title {
                _id
                short_name
              }
              current_class {
                _id
                name
              }
              final_transcript_id {
                _id
                status
                final_transcript_status
                certification_status
                jury_decision_for_final_transcript
                input_final_decision_status
                is_validated
                student_decision
                after_final_retake_decision
                has_jury_finally_decided
                retake_test_for_students {
                  test_id {
                    _id
                  }
                }
              }
              user_id {
                _id
              }
              employability_survey_ids {
                _id
                survey_status
                validator
              }
              companies {
                company {
                  _id
                  company_name
                }
                status
                mentor {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
              }
            }
          }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
          school_ids,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllStudents']));
  }
  getAllStudentsChiefGroupSuspended(pagination, school_ids, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllStudentsChiefGroup($pagination: PaginationInput, $school_ids: [ID], $sort: StudentSorting) {
            GetAllStudents(pagination: $pagination, school_ids: $school_ids, sorting: $sort, ${filter}, status: suspended) {
              group_details {
                name
                test {
                  name
                }
              }
              count_document
              incorrect_email
              _id
              civility
              first_name
              last_name
              email
              photo
              date_of_birth
              place_of_birth
              tele_phone
              academic_journey_id {
                diplomas {
                  diploma_photo
                }
              }
              createdAt
              certificate_issuance_status
              identity_verification_status
              is_photo_in_s3
              photo_s3_path
              is_thumbups_green
              reason_for_resignation
              date_of_resignation
              status
              student_title_status
              school {
                _id
                short_name
              }
              rncp_title {
                _id
                short_name
              }
              current_class {
                _id
                name
              }
              soft_skill_pro_evaluation {
                status
              }
              academic_pro_evaluation {
                status
              }
              final_transcript_id {
                _id
                status
                final_transcript_status
                certification_status
                jury_decision_for_final_transcript
                input_final_decision_status
                is_validated
                student_decision
                after_final_retake_decision
                has_jury_finally_decided
                retake_test_for_students {
                  test_id {
                    _id
                  }
                }
              }
              user_id {
                _id
              }
              job_description_id {
                _id
                job_name
                job_description_status
              }
              problematic_id {
                _id
                problematic_status
              }
              mentor_evaluation_id {
                _id
                mentor_evaluation_status
              }
              employability_survey_ids {
                _id
                survey_status
                validator
              }
              companies {
                company {
                  _id
                  company_name
                }
                status
                mentor {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
              }
            }
          }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
          school_ids,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllStudents']));
  }
  getAllStudentsChiefGroupDeactivated(pagination, school_ids, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllStudentsChiefGroup($pagination: PaginationInput, $school_ids: [ID], $sort: StudentSorting) {
          GetDeactivatedStudents(pagination: $pagination, school_ids: $school_ids, sorting: $sort, ${filter}) {
            group_details {
              name
              test {
                name
              }
            }
            count_document
            incorrect_email
            _id
            civility
            first_name
            last_name
            email
            photo
            date_of_birth
            place_of_birth
            tele_phone
            academic_journey_id {
              diplomas {
                diploma_photo
              }
            }
            createdAt
            certificate_issuance_status
            identity_verification_status
            is_photo_in_s3
            photo_s3_path
            is_thumbups_green
            reason_for_resignation
            date_of_resignation
            status
            student_title_status
            school {
              _id
              short_name
            }
            rncp_title {
              _id
              short_name
            }
            current_class {
              _id
              name
            }
            soft_skill_pro_evaluation {
              status
            }
            academic_pro_evaluation {
              status
            }
            final_transcript_id {
              _id
              status
              final_transcript_status
              certification_status
              jury_decision_for_final_transcript
              input_final_decision_status
              is_validated
              student_decision
              after_final_retake_decision
              has_jury_finally_decided
              retake_test_for_students {
                test_id {
                  _id
                }
              }
            }
            user_id {
              _id
            }
            job_description_id {
              _id
              job_name
              job_description_status
            }
            problematic_id {
              _id
              problematic_status
            }
            mentor_evaluation_id {
              _id
              mentor_evaluation_status
            }
            employability_survey_ids {
              _id
              survey_status
              validator
            }
            companies {
              company {
                _id
                company_name
              }
              status
              mentor {
                _id
                first_name
                last_name
                civility
                email
              }
            }
          }
        }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
          school_ids,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetDeactivatedStudents']));
  }

  getAllStudentsCR(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllStudentsCR($pagination: PaginationInput, $sort: StudentSorting) {
            GetAllStudents(pagination: $pagination, ${filter}, sorting: $sort, status: active_pending, group_details: true) {
              group_details {
                name
                test {
                  name
                }
              }
              count_document
              incorrect_email
              _id
              civility
              first_name
              last_name
              photo
              email
              date_of_birth
              place_of_birth
              tele_phone
              academic_journey_id {
                diplomas {
                  diploma_photo
                }
              }
              createdAt
              certificate_issuance_status
              identity_verification_status
              is_photo_in_s3
              photo_s3_path
              is_thumbups_green
              status
              school {
                _id
                short_name
              }
              rncp_title {
                _id
                short_name
              }
              current_class {
                _id
                name
              }
              soft_skill_pro_evaluation {
                status
              }
              academic_pro_evaluation {
                status
              }
              final_transcript_id {
                _id
                status
                final_transcript_status
                certification_status
                jury_decision_for_final_transcript
                input_final_decision_status
                is_validated
                student_decision
                after_final_retake_decision
                has_jury_finally_decided
                retake_test_for_students {
                  test_id {
                    _id
                  }
                }
              }
              user_id {
                _id
              }
              job_description_id {
                _id
                job_name
                job_description_status
              }
              problematic_id {
                _id
                problematic_status
              }
              mentor_evaluation_id {
                _id
                mentor_evaluation_status
              }
              employability_survey_ids {
                _id
                survey_status
                validator
              }
              companies {
                company {
                  _id
                  company_name
                }
                status
                mentor {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
              }
            }
          }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllStudents']));
  }
  getAllStudentsCRCompleted(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllStudentsCR($pagination: PaginationInput, $sort: StudentSorting) {
            GetAllStudents(pagination: $pagination, ${filter}, sorting: $sort, status: completed, group_details: true) {
              group_details {
                name
                test {
                  name
                }
              }
              count_document
              incorrect_email
              _id
              civility
              first_name
              last_name
              photo
              email
              date_of_birth
              place_of_birth
              tele_phone
              academic_journey_id {
                diplomas {
                  diploma_photo
                }
              }
              createdAt
              certificate_issuance_status
identity_verification_status
              is_photo_in_s3
              photo_s3_path
              status
              school {
                _id
                short_name
              }
              soft_skill_pro_evaluation {
                status
              }
              academic_pro_evaluation {
                status
              }
              previous_courses_id {
                rncp_id {
                  _id
                  short_name
                }
              }
              rncp_title {
                _id
                short_name
              }
              current_class {
                _id
                name
              }
              final_transcript_id {
                _id
                status
                final_transcript_status
                certification_status
                jury_decision_for_final_transcript
                input_final_decision_status
                is_validated
                student_decision
                after_final_retake_decision
                has_jury_finally_decided
                retake_test_for_students {
                  test_id {
                    _id
                  }
                }
              }
              user_id {
                _id
              }
              employability_survey_ids {
                _id
                survey_status
                validator
              }
              companies {
                company {
                  _id
                  company_name
                }
                status
                mentor {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
              }
            }
          }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllStudents']));
  }
  getAllStudentsCRSuspended(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllStudentsCR($pagination: PaginationInput, $sort: StudentSorting) {
            GetAllStudents(pagination: $pagination, ${filter}, sorting: $sort, status: suspended) {
              group_details {
                name
                test {
                  name
                }
              }
              count_document
              incorrect_email
              _id
              civility
              first_name
              last_name
              email
              photo
              date_of_birth
              place_of_birth
              tele_phone
              academic_journey_id {
                diplomas {
                  diploma_photo
                }
              }
              createdAt
              certificate_issuance_status
              identity_verification_status
              is_photo_in_s3
              photo_s3_path
              is_thumbups_green
              reason_for_resignation
              date_of_resignation
              status
              student_title_status
              school {
                _id
                short_name
              }
              rncp_title {
                _id
                short_name
              }
              current_class {
                _id
                name
              }
              soft_skill_pro_evaluation {
                status
              }
              academic_pro_evaluation {
                status
              }
              final_transcript_id {
                _id
                status
                final_transcript_status
                certification_status
                jury_decision_for_final_transcript
                input_final_decision_status
                is_validated
                student_decision
                after_final_retake_decision
                has_jury_finally_decided
                retake_test_for_students {
                  test_id {
                    _id
                  }
                }
              }
              user_id {
                _id
              }
              job_description_id {
                _id
                job_name
                job_description_status
              }
              problematic_id {
                _id
                problematic_status
              }
              mentor_evaluation_id {
                _id
                mentor_evaluation_status
              }
              employability_survey_ids {
                _id
                survey_status
                validator
              }
              companies {
                company {
                  _id
                  company_name
                }
                status
                mentor {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
              }
            }
          }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllStudents']));
  }
  getAllStudentsCRDeactivated(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllStudentsCR($pagination: PaginationInput, $sort: StudentSorting) {
          GetDeactivatedStudents(pagination: $pagination, ${filter}, sorting: $sort) {
            group_details {
              name
              test {
                name
              }
            }
            count_document
            incorrect_email
            _id
            civility
            first_name
            last_name
            email
            photo
            date_of_birth
            place_of_birth
            tele_phone
            academic_journey_id {
              diplomas {
                diploma_photo
              }
            }
            createdAt
            certificate_issuance_status
            identity_verification_status
            is_photo_in_s3
            photo_s3_path
            is_thumbups_green
            reason_for_resignation
            date_of_resignation
            status
            student_title_status
            school {
              _id
              short_name
            }
            rncp_title {
              _id
              short_name
            }
            current_class {
              _id
              name
            }
            soft_skill_pro_evaluation {
              status
            }
            academic_pro_evaluation {
              status
            }
            final_transcript_id {
              _id
              status
              final_transcript_status
              certification_status
              jury_decision_for_final_transcript
              input_final_decision_status
              is_validated
              student_decision
              after_final_retake_decision
              has_jury_finally_decided
              retake_test_for_students {
                test_id {
                  _id
                }
              }
            }
            user_id {
              _id
            }
            job_description_id {
              _id
              job_name
              job_description_status
            }
            problematic_id {
              _id
              problematic_status
            }
            mentor_evaluation_id {
              _id
              mentor_evaluation_status
            }
            employability_survey_ids {
              _id
              survey_status
              validator
            }
            companies {
              company {
                _id
                company_name
              }
              status
              mentor {
                _id
                first_name
                last_name
                civility
                email
              }
            }
          }
        }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetDeactivatedStudents']));
  }

  getAllStudentsMentor(pagination, mentor_id, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllStudentsMentor($pagination: PaginationInput, $mentor_id: ID, $sort: StudentSorting) {
            GetAllStudents(
              pagination: $pagination,
              mentor_id: $mentor_id,
              ${filter},
              sorting: $sort,
              status: active_pending,
              group_details: true
            ) {
              group_details {
                name
                test {
                  name
                }
              }
              count_document
              incorrect_email
              _id
              civility
              first_name
              email
              last_name
              photo
              date_of_birth
              place_of_birth
              tele_phone
              academic_journey_id {
                diplomas {
                  diploma_photo
                }
              }
              createdAt
              certificate_issuance_status
              identity_verification_status
              is_photo_in_s3
              photo_s3_path
              is_thumbups_green
              status
              school {
                _id
                short_name
              }
              rncp_title {
                _id
                short_name
              }
              current_class {
                _id
                name
              }
              soft_skill_pro_evaluation {
                status
              }
              academic_pro_evaluation {
                status
              }
              final_transcript_id {
                _id
                status
                final_transcript_status
                certification_status
                jury_decision_for_final_transcript
                input_final_decision_status
                is_validated
                student_decision
                after_final_retake_decision
                has_jury_finally_decided
                retake_test_for_students {
                  test_id {
                    _id
                  }
                }
              }
              user_id {
                _id
              }
              job_description_id {
                _id
                job_name
                job_description_status
              }
              problematic_id {
                _id
                problematic_status
              }
              mentor_evaluation_id {
                _id
                mentor_evaluation_status
              }
              employability_survey_ids {
                _id
                survey_status
                validator
              }
              companies {
                company {
                  _id
                  company_name
                }
                status
                mentor {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
              }
            }
          }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
          mentor_id,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllStudents']));
  }

  getAllStudentsCompany(mentor_id, search): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllStudentsMentor($mentor_id: ID) {
            GetAllStudents(mentor_id: $mentor_id, search: "${search}") {
              count_document
              _id
              civility
              first_name
              email
              last_name
              photo
              is_photo_in_s3
              photo_s3_path
              is_thumbups_green
              status
              school {
                _id
                short_name
              }
              rncp_title {
                _id
                short_name
              }
              current_class {
                _id
                name
              }
              soft_skill_pro_evaluation {
                status
              }
              academic_pro_evaluation {
                status
              }
              final_transcript_id {
                _id
                status
                final_transcript_status
                certification_status
                jury_decision_for_final_transcript
                input_final_decision_status
                is_validated
                student_decision
                after_final_retake_decision
                has_jury_finally_decided
                retake_test_for_students {
                  test_id {
                    _id
                  }
                }
              }
              corrected_tests {
                correction {
                  correction_grid {
                    correction {
                      additional_total
                      total
                    }
                  }
                  expected_documents {
                    validation_status
                    document {
                      s3_file_name
                    }
                  }
                  mark_entry_document {
                    s3_file_name
                  }
                }
                test {
                  expected_documents {
                    document_name
                  }
                  correction_status_for_schools {
                    correction_status
                  }
                  correction_grid {
                    correction {
                      total_zone {
                        display_additional_total
                      }
                    }
                  }
                  evaluation_id {
                    _id
                  }
                }
              }
              companies {
                company {
                  _id
                  company_name
                }
                status
                mentor {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
              }
              user_id {
                _id
              }
              job_description_id {
                _id
                job_name
                job_description_status
              }
              problematic_id {
                _id
                problematic_status
              }
              mentor_evaluation_id {
                _id
                mentor_evaluation_status
              }
              employability_survey_ids {
                _id
                survey_status
                validator
              }
            }
          }
        `,
        variables: {
          mentor_id,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllStudents']));
  }
  getAllStudentsMentorCompleted(pagination, mentor_id, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllStudentsMentor($pagination: PaginationInput, $mentor_id: ID, $sort: StudentSorting) {
            GetAllStudents(
              pagination: $pagination,
              mentor_id: $mentor_id,
              ${filter},
              sorting: $sort,
              status: completed,
              group_details: true
            ) {
              group_details {
                name
                test {
                  name
                }
              }
              count_document
              incorrect_email
              _id
              civility
              first_name
              email
              last_name
              photo
              date_of_birth
              place_of_birth
              tele_phone
              academic_journey_id {
                diplomas {
                  diploma_photo
                }
              }
              soft_skill_pro_evaluation {
                status
              }
              academic_pro_evaluation {
                status
              }
              createdAt
              certificate_issuance_status
identity_verification_status
              is_photo_in_s3
              photo_s3_path
              status
              school {
                _id
                short_name
              }
              previous_courses_id {
                rncp_id {
                  _id
                  short_name
                }
              }
              rncp_title {
                _id
                short_name
              }
              current_class {
                _id
                name
              }
              final_transcript_id {
                _id
                status
                final_transcript_status
                certification_status
                jury_decision_for_final_transcript
                input_final_decision_status
                is_validated
                student_decision
                after_final_retake_decision
                has_jury_finally_decided
                retake_test_for_students {
                  test_id {
                    _id
                  }
                }
              }
              user_id {
                _id
              }
              employability_survey_ids {
                _id
                survey_status
                validator
              }
              companies {
                company {
                  _id
                  company_name
                }
                status
                mentor {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
              }
            }
          }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
          mentor_id,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllStudents']));
  }
  getAllStudentsMentorSuspended(pagination, mentor_id, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllStudentsMentor($pagination: PaginationInput, $mentor_id: ID, $sort: StudentSorting) {
            GetAllStudents(pagination: $pagination, mentor_id: $mentor_id, ${filter}, sorting: $sort, status: suspended) {
              group_details {
                name
                test {
                  name
                }
              }
              count_document
              incorrect_email
              _id
              civility
              first_name
              last_name
              email
              photo
              date_of_birth
              place_of_birth
              tele_phone
              academic_journey_id {
                diplomas {
                  diploma_photo
                }
              }
              soft_skill_pro_evaluation {
                status
              }
              academic_pro_evaluation {
                status
              }
              createdAt
              certificate_issuance_status
              identity_verification_status
              is_photo_in_s3
              photo_s3_path
              is_thumbups_green
              reason_for_resignation
              date_of_resignation
              status
              student_title_status
              school {
                _id
                short_name
              }
              rncp_title {
                _id
                short_name
              }
              current_class {
                _id
                name
              }
              final_transcript_id {
                _id
                status
                final_transcript_status
                certification_status
                jury_decision_for_final_transcript
                input_final_decision_status
                is_validated
                student_decision
                after_final_retake_decision
                has_jury_finally_decided
                retake_test_for_students {
                  test_id {
                    _id
                  }
                }
              }
              user_id {
                _id
              }
              job_description_id {
                _id
                job_name
                job_description_status
              }
              problematic_id {
                _id
                problematic_status
              }
              mentor_evaluation_id {
                _id
                mentor_evaluation_status
              }
              employability_survey_ids {
                _id
                survey_status
                validator
              }
              companies {
                company {
                  _id
                  company_name
                }
                status
                mentor {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
              }
            }
          }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
          mentor_id,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllStudents']));
  }
  getAllStudentsMentorDeactivated(pagination, mentor_id, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllStudentsMentor($pagination: PaginationInput, $mentor_id: ID, $sort: StudentSorting) {
            GetDeactivatedStudents(pagination: $pagination, mentor_id: $mentor_id, ${filter}, sorting: $sort) {
              group_details {
                name
                test {
                  name
                }
              }
              count_document
              incorrect_email
              _id
              civility
              first_name
              last_name
              email
              photo
              date_of_birth
              place_of_birth
              tele_phone
              academic_journey_id {
                diplomas {
                  diploma_photo
                }
              }
              soft_skill_pro_evaluation {
                status
              }
              academic_pro_evaluation {
                status
              }
              createdAt
              certificate_issuance_status
              identity_verification_status
              is_photo_in_s3
              photo_s3_path
              is_thumbups_green
              reason_for_resignation
              date_of_resignation
              status
              student_title_status
              school {
                _id
                short_name
              }
              rncp_title {
                _id
                short_name
              }
              current_class {
                _id
                name
              }
              final_transcript_id {
                _id
                status
                final_transcript_status
                certification_status
                jury_decision_for_final_transcript
                input_final_decision_status
                is_validated
                student_decision
                after_final_retake_decision
                has_jury_finally_decided
                retake_test_for_students {
                  test_id {
                    _id
                  }
                }
              }
              user_id {
                _id
              }
              job_description_id {
                _id
                job_name
                job_description_status
              }
              problematic_id {
                _id
                problematic_status
              }
              mentor_evaluation_id {
                _id
                mentor_evaluation_status
              }
              employability_survey_ids {
                _id
                survey_status
                validator
              }
              companies {
                company {
                  _id
                  company_name
                }
                status
                mentor {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
              }
            }
          }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
          mentor_id,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetDeactivatedStudents']));
  }

  getAllStudentsCRExport(rncp_title_ids, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllStudentsCR($rncp_title_ids: [ID]) {
            GetAllStudents(rncp_title_ids: $rncp_title_ids, ${filter}, status: active_pending) {
              count_document
              _id
              civility
              first_name
              last_name
              photo
              date_of_birth
              place_of_birth
              createdAt
              certificate_issuance_status
identity_verification_status
              is_photo_in_s3
              photo_s3_path
              is_thumbups_green
              status
              school {
                _id
                short_name
              }
              rncp_title {
                _id
                short_name
              }
              current_class {
                _id
                name
              }
              soft_skill_pro_evaluation {
                status
              }
              academic_pro_evaluation {
                status
              }
              final_transcript_id {
                _id
                status
                final_transcript_status
                certification_status
                jury_decision_for_final_transcript
                input_final_decision_status
                is_validated
                student_decision
                after_final_retake_decision
                has_jury_finally_decided
                retake_test_for_students {
                  test_id {
                    _id
                  }
                }
              }
              corrected_tests {
                correction {
                  correction_grid {
                    correction {
                      additional_total
                      total
                    }
                  }
                  expected_documents {
                    validation_status
                    document {
                      s3_file_name
                    }
                  }
                  mark_entry_document {
                    s3_file_name
                  }
                }
                test {
                  expected_documents {
                    document_name
                  }
                  correction_status_for_schools {
                    correction_status
                  }
                  correction_grid {
                    correction {
                      total_zone {
                        display_additional_total
                      }
                    }
                  }
                  evaluation_id {
                    _id
                  }
                }
              }
              user_id {
                _id
              }
              job_description_id {
                _id
                job_name
                job_description_status
              }
              problematic_id {
                _id
                problematic_status
              }
              mentor_evaluation_id {
                _id
                mentor_evaluation_status
              }
              employability_survey_ids {
                _id
                survey_status
                validator
              }
              companies {
                company {
                  _id
                  company_name
                }
                status
                mentor {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
              }
            }
          }
        `,
        variables: {
          rncp_title_ids,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllStudents']));
  }
  getAllStudentsCRExportCompleted(rncp_title_ids, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllStudentsCR($rncp_title_ids: [ID]) {
            GetAllStudents(rncp_title_ids: $rncp_title_ids, ${filter}, status: completed) {
              count_document
              _id
              civility
              first_name
              last_name
              photo
              date_of_birth
              place_of_birth
              createdAt
              certificate_issuance_status
identity_verification_status
              is_photo_in_s3
              photo_s3_path
              is_thumbups_green
              status
              school {
                _id
                short_name
              }
              soft_skill_pro_evaluation {
                status
              }
              academic_pro_evaluation {
                status
              }
              previous_courses_id {
                rncp_id {
                  _id
                  short_name
                }
              }
              rncp_title {
                _id
                short_name
              }
              current_class {
                _id
                name
              }
              final_transcript_id {
                _id
                status
                final_transcript_status
                certification_status
                jury_decision_for_final_transcript
                input_final_decision_status
                is_validated
                student_decision
                after_final_retake_decision
                has_jury_finally_decided
                retake_test_for_students {
                  test_id {
                    _id
                  }
                }
              }
              corrected_tests {
                correction {
                  correction_grid {
                    correction {
                      additional_total
                      total
                    }
                  }
                  expected_documents {
                    validation_status
                    document {
                      s3_file_name
                    }
                  }
                  mark_entry_document {
                    s3_file_name
                  }
                }
                test {
                  expected_documents {
                    document_name
                  }
                  correction_status_for_schools {
                    correction_status
                  }
                  correction_grid {
                    correction {
                      total_zone {
                        display_additional_total
                      }
                    }
                  }
                  evaluation_id {
                    _id
                  }
                }
              }
              user_id {
                _id
              }
              job_description_id {
                _id
                job_name
                job_description_status
              }
              problematic_id {
                _id
                problematic_status
              }
              mentor_evaluation_id {
                _id
                mentor_evaluation_status
              }
              employability_survey_ids {
                _id
                survey_status
                validator
              }
              companies {
                company {
                  _id
                  company_name
                }
                status
                mentor {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
              }
            }
          }
        `,
        variables: {
          rncp_title_ids,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllStudents']));
  }
  getAllStudentsCRExportSuspended(rncp_title_ids, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllStudentsCR($rncp_title_ids: [ID]) {
            GetAllStudents(rncp_title_ids: $rncp_title_ids, ${filter}, status: suspended) {
              count_document
              _id
              civility
              first_name
              last_name
              photo
              is_photo_in_s3
              photo_s3_path
              is_thumbups_green
              reason_for_resignation
              date_of_resignation
              status
              school {
                _id
                short_name
              }
              rncp_title {
                _id
                short_name
              }
              current_class {
                _id
                name
              }
              soft_skill_pro_evaluation {
                status
              }
              academic_pro_evaluation {
                status
              }
              final_transcript_id {
                _id
                status
                final_transcript_status
                certification_status
                jury_decision_for_final_transcript
                input_final_decision_status
                is_validated
                student_decision
                after_final_retake_decision
                has_jury_finally_decided
                retake_test_for_students {
                  test_id {
                    _id
                  }
                }
              }
              corrected_tests {
                correction {
                  correction_grid {
                    correction {
                      additional_total
                      total
                    }
                  }
                  expected_documents {
                    validation_status
                    document {
                      s3_file_name
                    }
                  }
                  mark_entry_document {
                    s3_file_name
                  }
                }
                test {
                  expected_documents {
                    document_name
                  }
                  correction_status_for_schools {
                    correction_status
                  }
                  correction_grid {
                    correction {
                      total_zone {
                        display_additional_total
                      }
                    }
                  }
                  evaluation_id {
                    _id
                  }
                }
              }
              user_id {
                _id
              }
              job_description_id {
                _id
                job_name
                job_description_status
              }
              problematic_id {
                _id
                problematic_status
              }
              mentor_evaluation_id {
                _id
                mentor_evaluation_status
              }
              employability_survey_ids {
                _id
                survey_status
                validator
              }
              companies {
                company {
                  _id
                  company_name
                }
                status
                mentor {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
              }
            }
          }
        `,
        variables: {
          rncp_title_ids,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllStudents']));
  }
  getAllStudentsCRExportDeactivated(rncp_title_ids, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllStudentsCR($rncp_title_ids: [ID]) {
          GetDeactivatedStudents(rncp_title_ids: $rncp_title_ids, ${filter}) {
              count_document
              _id
              civility
              first_name
              last_name
              photo
              is_photo_in_s3
              photo_s3_path
              is_thumbups_green
              reason_for_resignation
              date_of_resignation
              status
              school {
                _id
                short_name
              }
              rncp_title {
                _id
                short_name
              }
              current_class {
                _id
                name
              }
              soft_skill_pro_evaluation {
                status
              }
              academic_pro_evaluation {
                status
              }
              final_transcript_id {
                _id
                status
                final_transcript_status
                certification_status
                jury_decision_for_final_transcript
                input_final_decision_status
                is_validated
                student_decision
                after_final_retake_decision
                has_jury_finally_decided
                retake_test_for_students {
                  test_id {
                    _id
                  }
                }
              }
              corrected_tests {
                correction {
                  correction_grid {
                    correction {
                      additional_total
                      total
                    }
                  }
                  expected_documents {
                    validation_status
                    document {
                      s3_file_name
                    }
                  }
                  mark_entry_document {
                    s3_file_name
                  }
                }
                test {
                  expected_documents {
                    document_name
                  }
                  correction_status_for_schools {
                    correction_status
                  }
                  correction_grid {
                    correction {
                      total_zone {
                        display_additional_total
                      }
                    }
                  }
                  evaluation_id {
                    _id
                  }
                }
              }
              user_id {
                _id
              }
              job_description_id {
                _id
                job_name
                job_description_status
              }
              problematic_id {
                _id
                problematic_status
              }
              mentor_evaluation_id {
                _id
                mentor_evaluation_status
              }
              employability_survey_ids {
                _id
                survey_status
                validator
              }
              companies {
                company {
                  _id
                  company_name
                }
                status
                mentor {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
              }
            }
          }
        `,
        variables: {
          rncp_title_ids,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetDeactivatedStudents']));
  }

  getAllStudentsMentorExport(mentor_id, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllStudentsMentor($mentor_id: ID) {
            GetAllStudents(mentor_id: $mentor_id, ${filter}, status: active_pending) {
              count_document
              _id
              civility
              first_name
              last_name
              photo
              date_of_birth
              place_of_birth
              createdAt
              certificate_issuance_status
identity_verification_status
              is_photo_in_s3
              photo_s3_path
              is_thumbups_green
              status
              school {
                _id
                short_name
              }
              rncp_title {
                _id
                short_name
              }
              current_class {
                _id
                name
              }
              soft_skill_pro_evaluation {
                status
              }
              academic_pro_evaluation {
                status
              }
              final_transcript_id {
                _id
                status
                final_transcript_status
                certification_status
                jury_decision_for_final_transcript
                input_final_decision_status
                is_validated
                student_decision
                after_final_retake_decision
                has_jury_finally_decided
                retake_test_for_students {
                  test_id {
                    _id
                  }
                }
              }
              corrected_tests {
                correction {
                  correction_grid {
                    correction {
                      additional_total
                      total
                    }
                  }
                  expected_documents {
                    validation_status
                    document {
                      s3_file_name
                    }
                  }
                  mark_entry_document {
                    s3_file_name
                  }
                }
                test {
                  expected_documents {
                    document_name
                  }
                  correction_status_for_schools {
                    correction_status
                  }
                  correction_grid {
                    correction {
                      total_zone {
                        display_additional_total
                      }
                    }
                  }
                  evaluation_id {
                    _id
                  }
                }
              }
              user_id {
                _id
              }
              job_description_id {
                _id
                job_name
                job_description_status
              }
              problematic_id {
                _id
                problematic_status
              }
              mentor_evaluation_id {
                _id
                mentor_evaluation_status
              }
              employability_survey_ids {
                _id
                survey_status
                validator
              }
              companies {
                company {
                  _id
                  company_name
                }
                status
                mentor {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
              }
            }
          }
        `,
        variables: {
          mentor_id,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllStudents']));
  }
  getAllStudentsMentorExportCompleted(mentor_id, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllStudentsMentor($mentor_id: ID) {
            GetAllStudents(mentor_id: $mentor_id, ${filter}, status: completed) {
              count_document
              _id
              civility
              first_name
              last_name
              photo
              date_of_birth
              place_of_birth
              createdAt
              certificate_issuance_status
identity_verification_status
              is_photo_in_s3
              photo_s3_path
              is_thumbups_green
              status
              school {
                _id
                short_name
              }
              previous_courses_id {
                rncp_id {
                  _id
                  short_name
                }
              }
              rncp_title {
                _id
                short_name
              }
              soft_skill_pro_evaluation {
                status
              }
              academic_pro_evaluation {
                status
              }
              current_class {
                _id
                name
              }
              final_transcript_id {
                _id
                status
                final_transcript_status
                certification_status
                jury_decision_for_final_transcript
                input_final_decision_status
                is_validated
                student_decision
                after_final_retake_decision
                has_jury_finally_decided
                retake_test_for_students {
                  test_id {
                    _id
                  }
                }
              }
              corrected_tests {
                correction {
                  correction_grid {
                    correction {
                      additional_total
                      total
                    }
                  }
                  expected_documents {
                    validation_status
                    document {
                      s3_file_name
                    }
                  }
                  mark_entry_document {
                    s3_file_name
                  }
                }
                test {
                  expected_documents {
                    document_name
                  }
                  correction_status_for_schools {
                    correction_status
                  }
                  correction_grid {
                    correction {
                      total_zone {
                        display_additional_total
                      }
                    }
                  }
                  evaluation_id {
                    _id
                  }
                }
              }
              user_id {
                _id
              }
              job_description_id {
                _id
                job_name
                job_description_status
              }
              problematic_id {
                _id
                problematic_status
              }
              mentor_evaluation_id {
                _id
                mentor_evaluation_status
              }
              employability_survey_ids {
                _id
                survey_status
                validator
              }
              companies {
                company {
                  _id
                  company_name
                }
                status
                mentor {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
              }
            }
          }
        `,
        variables: {
          mentor_id,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllStudents']));
  }
  getAllStudentsMentorExportSuspended(mentor_id, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllStudentsMentor($mentor_id: ID) {
            GetAllStudents(mentor_id: $mentor_id, ${filter}, status: suspended) {
              count_document
              _id
              civility
              first_name
              last_name
              photo
              is_photo_in_s3
              photo_s3_path
              is_thumbups_green
              reason_for_resignation
              date_of_resignation
              status
              school {
                _id
                short_name
              }
              rncp_title {
                _id
                short_name
              }
              current_class {
                _id
                name
              }
              soft_skill_pro_evaluation {
                status
              }
              academic_pro_evaluation {
                status
              }
              final_transcript_id {
                _id
                status
                final_transcript_status
                certification_status
                jury_decision_for_final_transcript
                input_final_decision_status
                is_validated
                student_decision
                after_final_retake_decision
                has_jury_finally_decided
                retake_test_for_students {
                  test_id {
                    _id
                  }
                }
              }
              corrected_tests {
                correction {
                  correction_grid {
                    correction {
                      additional_total
                      total
                    }
                  }
                  expected_documents {
                    validation_status
                    document {
                      s3_file_name
                    }
                  }
                  mark_entry_document {
                    s3_file_name
                  }
                }
                test {
                  expected_documents {
                    document_name
                  }
                  correction_status_for_schools {
                    correction_status
                  }
                  correction_grid {
                    correction {
                      total_zone {
                        display_additional_total
                      }
                    }
                  }
                  evaluation_id {
                    _id
                  }
                }
              }
              user_id {
                _id
              }
              job_description_id {
                _id
                job_name
                job_description_status
              }
              problematic_id {
                _id
                problematic_status
              }
              mentor_evaluation_id {
                _id
                mentor_evaluation_status
              }
              employability_survey_ids {
                _id
                survey_status
                validator
              }
              companies {
                company {
                  _id
                  company_name
                }
                status
                mentor {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
              }
            }
          }
        `,
        variables: {
          mentor_id,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllStudents']));
  }
  getAllStudentsMentorExportDeactivated(mentor_id, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllStudentsMentor($mentor_id: ID) {
            GetDeactivatedStudents(mentor_id: $mentor_id, ${filter}) {
              count_document
              _id
              civility
              first_name
              last_name
              photo
              is_photo_in_s3
              photo_s3_path
              is_thumbups_green
              reason_for_resignation
              date_of_resignation
              status
              school {
                _id
                short_name
              }
              rncp_title {
                _id
                short_name
              }
              current_class {
                _id
                name
              }
              soft_skill_pro_evaluation {
                status
              }
              academic_pro_evaluation {
                status
              }
              final_transcript_id {
                _id
                status
                final_transcript_status
                certification_status
                jury_decision_for_final_transcript
                input_final_decision_status
                is_validated
                student_decision
                after_final_retake_decision
                has_jury_finally_decided
                retake_test_for_students {
                  test_id {
                    _id
                  }
                }
              }
              corrected_tests {
                correction {
                  correction_grid {
                    correction {
                      additional_total
                      total
                    }
                  }
                  expected_documents {
                    validation_status
                    document {
                      s3_file_name
                    }
                  }
                  mark_entry_document {
                    s3_file_name
                  }
                }
                test {
                  expected_documents {
                    document_name
                  }
                  correction_status_for_schools {
                    correction_status
                  }
                  correction_grid {
                    correction {
                      total_zone {
                        display_additional_total
                      }
                    }
                  }
                  evaluation_id {
                    _id
                  }
                }
              }
              user_id {
                _id
              }
              job_description_id {
                _id
                job_name
                job_description_status
              }
              problematic_id {
                _id
                problematic_status
              }
              mentor_evaluation_id {
                _id
                mentor_evaluation_status
              }
              employability_survey_ids {
                _id
                survey_status
                validator
              }
              companies {
                company {
                  _id
                  company_name
                }
                status
                mentor {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
              }
            }
          }
        `,
        variables: {
          mentor_id,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetDeactivatedStudents']));
  }

  getAllStudentsChiefGroupExport(school_ids, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllStudentsChiefGroup($school_ids: [ID]) {
            GetAllStudents(school_ids: $school_ids, ${filter}, status: active_pending) {
              count_document
              _id
              civility
              first_name
              last_name
              photo
              date_of_birth
              place_of_birth
              createdAt
              certificate_issuance_status
identity_verification_status
              is_photo_in_s3
              photo_s3_path
              is_thumbups_green
              status
              school {
                _id
                short_name
              }
              rncp_title {
                _id
                short_name
              }
              current_class {
                _id
                name
              }
              soft_skill_pro_evaluation {
                status
              }
              academic_pro_evaluation {
                status
              }
              final_transcript_id {
                _id
                status
                final_transcript_status
                certification_status
                jury_decision_for_final_transcript
                input_final_decision_status
                is_validated
                student_decision
                after_final_retake_decision
                has_jury_finally_decided
                retake_test_for_students {
                  test_id {
                    _id
                  }
                }
              }
              corrected_tests {
                correction {
                  correction_grid {
                    correction {
                      additional_total
                      total
                    }
                  }
                  expected_documents {
                    validation_status
                    document {
                      s3_file_name
                    }
                  }
                  mark_entry_document {
                    s3_file_name
                  }
                }
                test {
                  expected_documents {
                    document_name
                  }
                  correction_status_for_schools {
                    correction_status
                  }
                  correction_grid {
                    correction {
                      total_zone {
                        display_additional_total
                      }
                    }
                  }
                  evaluation_id {
                    _id
                  }
                }
              }
              user_id {
                _id
              }
              job_description_id {
                _id
                job_name
                job_description_status
              }
              problematic_id {
                _id
                problematic_status
              }
              mentor_evaluation_id {
                _id
                mentor_evaluation_status
              }
              employability_survey_ids {
                _id
                survey_status
                validator
              }
              companies {
                company {
                  _id
                  company_name
                }
                status
                mentor {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
              }
            }
          }
        `,
        variables: {
          school_ids,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllStudents']));
  }
  getAllStudentsChiefGroupExportCompleted(school_ids, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllStudentsChiefGroup($school_ids: [ID]) {
            GetAllStudents(school_ids: $school_ids, ${filter}, status: completed) {
              count_document
              _id
              civility
              first_name
              last_name
              photo
              date_of_birth
              place_of_birth
              createdAt
              certificate_issuance_status
identity_verification_status
              is_photo_in_s3
              photo_s3_path
              is_thumbups_green
              status
              school {
                _id
                short_name
              }
              previous_courses_id {
                rncp_id {
                  _id
                  short_name
                }
              }
              soft_skill_pro_evaluation {
                status
              }
              academic_pro_evaluation {
                status
              }
              rncp_title {
                _id
                short_name
              }
              current_class {
                _id
                name
              }
              final_transcript_id {
                _id
                status
                final_transcript_status
                certification_status
                jury_decision_for_final_transcript
                input_final_decision_status
                is_validated
                student_decision
                after_final_retake_decision
                has_jury_finally_decided
                retake_test_for_students {
                  test_id {
                    _id
                  }
                }
              }
              corrected_tests {
                correction {
                  correction_grid {
                    correction {
                      additional_total
                      total
                    }
                  }
                  expected_documents {
                    validation_status
                    document {
                      s3_file_name
                    }
                  }
                  mark_entry_document {
                    s3_file_name
                  }
                }
                test {
                  expected_documents {
                    document_name
                  }
                  correction_status_for_schools {
                    correction_status
                  }
                  correction_grid {
                    correction {
                      total_zone {
                        display_additional_total
                      }
                    }
                  }
                  evaluation_id {
                    _id
                  }
                }
              }
              user_id {
                _id
              }
              job_description_id {
                _id
                job_name
                job_description_status
              }
              problematic_id {
                _id
                problematic_status
              }
              mentor_evaluation_id {
                _id
                mentor_evaluation_status
              }
              employability_survey_ids {
                _id
                survey_status
                validator
              }
              companies {
                company {
                  _id
                  company_name
                }
                status
                mentor {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
              }
            }
          }
        `,
        variables: {
          school_ids,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllStudents']));
  }
  getAllStudentsChiefGroupExportSuspended(school_ids, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllStudentsChiefGroup($school_ids: [ID]) {
            GetAllStudents(school_ids: $school_ids, ${filter}, status: suspended) {
              count_document
              _id
              civility
              first_name
              last_name
              photo
              is_photo_in_s3
              photo_s3_path
              is_thumbups_green
              reason_for_resignation
              date_of_resignation
              status
              school {
                _id
                short_name
              }
              rncp_title {
                _id
                short_name
              }
              current_class {
                _id
                name
              }
              soft_skill_pro_evaluation {
                status
              }
              academic_pro_evaluation {
                status
              }
              final_transcript_id {
                _id
                status
                final_transcript_status
                certification_status
                jury_decision_for_final_transcript
                input_final_decision_status
                is_validated
                student_decision
                after_final_retake_decision
                has_jury_finally_decided
                retake_test_for_students {
                  test_id {
                    _id
                  }
                }
              }
              corrected_tests {
                correction {
                  correction_grid {
                    correction {
                      additional_total
                      total
                    }
                  }
                  expected_documents {
                    validation_status
                    document {
                      s3_file_name
                    }
                  }
                  mark_entry_document {
                    s3_file_name
                  }
                }
                test {
                  expected_documents {
                    document_name
                  }
                  correction_status_for_schools {
                    correction_status
                  }
                  correction_grid {
                    correction {
                      total_zone {
                        display_additional_total
                      }
                    }
                  }
                  evaluation_id {
                    _id
                  }
                }
              }
              user_id {
                _id
              }
              job_description_id {
                _id
                job_name
                job_description_status
              }
              problematic_id {
                _id
                problematic_status
              }
              mentor_evaluation_id {
                _id
                mentor_evaluation_status
              }
              employability_survey_ids {
                _id
                survey_status
                validator
              }
              companies {
                company {
                  _id
                  company_name
                }
                status
                mentor {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
              }
            }
          }
        `,
        variables: {
          school_ids,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllStudents']));
  }
  getAllStudentsChiefGroupExportDeactivated(school_ids, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllStudentsChiefGroup($school_ids: [ID]) {
            GetDeactivatedStudents(school_ids: $school_ids, ${filter}) {
              count_document
              _id
              civility
              first_name
              last_name
              photo
              is_photo_in_s3
              photo_s3_path
              is_thumbups_green
              reason_for_resignation
              date_of_resignation
              status
              school {
                _id
                short_name
              }
              rncp_title {
                _id
                short_name
              }
              current_class {
                _id
                name
              }
              soft_skill_pro_evaluation {
                status
              }
              academic_pro_evaluation {
                status
              }
              final_transcript_id {
                _id
                status
                final_transcript_status
                certification_status
                jury_decision_for_final_transcript
                input_final_decision_status
                is_validated
                student_decision
                after_final_retake_decision
                has_jury_finally_decided
                retake_test_for_students {
                  test_id {
                    _id
                  }
                }
              }
              corrected_tests {
                correction {
                  correction_grid {
                    correction {
                      additional_total
                      total
                    }
                  }
                  expected_documents {
                    validation_status
                    document {
                      s3_file_name
                    }
                  }
                  mark_entry_document {
                    s3_file_name
                  }
                }
                test {
                  expected_documents {
                    document_name
                  }
                  correction_status_for_schools {
                    correction_status
                  }
                  correction_grid {
                    correction {
                      total_zone {
                        display_additional_total
                      }
                    }
                  }
                  evaluation_id {
                    _id
                  }
                }
              }
              user_id {
                _id
              }
              job_description_id {
                _id
                job_name
                job_description_status
              }
              problematic_id {
                _id
                problematic_status
              }
              mentor_evaluation_id {
                _id
                mentor_evaluation_status
              }
              employability_survey_ids {
                _id
                survey_status
                validator
              }
              companies {
                company {
                  _id
                  company_name
                }
                status
                mentor {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
              }
            }
          }
        `,
        variables: {
          school_ids,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetDeactivatedStudents']));
  }

  getStudentDropdownBySchoolTitleClass(schoolId: string, titleID: string, classId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
      query getStudentListOfGroupCreation{
        GetAllStudents(
          school: "${schoolId}",
          rncp_title: "${titleID}",
          current_class: "${classId}",
        ) {
          _id
          first_name
          last_name
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllStudents']));
  }

  getAllStudentsDeactive(rncpId, classId, schoolId, pagination?, search?: string): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllStudents($rncpId: ID, $classId: ID, $schoolId: ID, $pagination: PaginationInput, $search: String) {
            GetAllStudents(
              rncp_title: $rncpId
              current_class: $classId
              school: $schoolId
              pagination: $pagination
              search: $search
              status: deactivated
            ) {
              count_document
              _id
              civility
              first_name
              last_name
              photo
              is_photo_in_s3
              photo_s3_path
              is_thumb_up_green
              status
              email
              school {
                _id
                short_name
              }
              rncp_title {
                _id
                short_name
              }
              final_transcript_id {
                final_transcript_status
              }
            }
          }
        `,
        variables: {
          rncpId,
          classId,
          schoolId,
          pagination,
          search,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllStudents']));
  }

  getDeactivatedStudent(rncp_title, current_class, school, pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetDeactivatedStudents(
            $rncp_title: ID
            $current_class: ID
            $school: ID
            $pagination: PaginationInput
            $sorting: StudentSorting
          ) {
            GetDeactivatedStudents(
              ${filter}
              rncp_title: $rncp_title
              current_class: $current_class
              school: $school
              pagination: $pagination
              sorting: $sorting
            ) {
              reason_for_resignation
              date_of_resignation
              count_document
              _id
              civility
              first_name
              last_name
              full_name
              is_thumbups_green
              status
              email
              school {
                _id
                short_name
              }
              rncp_title {
                _id
                short_name
              }
              current_class {
                _id
                name
              }
              final_transcript_id {
                final_transcript_status
              }
              problematic_id {
                problematic_status
              }
              job_description_id {
                job_description_status
              }
              mentor_evaluation_id {
                mentor_evaluation_status
              }
            }
          }
        `,
        variables: {
          rncp_title,
          current_class,
          school,
          pagination,
          sorting: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetDeactivatedStudents']));
  }

  getAllDeactivatedStudent(rncp_title, current_class, school, sortValue, filter): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetDeactivatedStudents(
            $rncp_title: ID
            $current_class: ID
            $school: ID
            $sorting: StudentSorting
          ) {
            GetDeactivatedStudents(
              ${filter}
              rncp_title: $rncp_title
              current_class: $current_class
              school: $school
              sorting: $sorting
            ) {
              count_document
              _id
              civility
              first_name
              last_name
              full_name
              is_thumbups_green
              status
              email
              school {
                _id
                short_name
              }
              rncp_title {
                _id
                short_name
              }
              final_transcript_id {
                final_transcript_status
              }
              problematic_id {
                problematic_status
              }
              job_description_id {
                job_description_status
              }
              mentor_evaluation_id {
                mentor_evaluation_status
              }
            }
          }
        `,
        variables: {
          rncp_title,
          current_class,
          school,
          sorting: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetDeactivatedStudents']));
  }

  validateOrRejectStudentDocumentExpected(
    docId: string,
    studentId: string,
    testId: string,
    testCorrectionId: string,
    validationStatus: string,
    lang: string,
  ): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
      mutation ValidateOrRejectStudentDocumentExpected{
        ValidateOrRejectStudentDocumentExpected(
          doc_id: "${docId}"
          student_id: "${studentId}"
          test_id: "${testId}"
          test_correction_id: "${testCorrectionId}"
          validation_status: ${validationStatus}
          lang: "${lang}"
        ) {
          _id
        }
      }
      `,
      })
      .pipe(map((resp) => resp.data['ValidateOrRejectStudentDocumentExpected']));
  }

  getStudentsbyClassTitle(rncpId, classId, schoolId, status, pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllStudents(
            $rncpId: ID,
            $classId: ID,
            $schoolId: ID,
            $status: EnumFilterStatus,
            $pagination: PaginationInput,
            $sort: StudentSorting,
            $check_visibility: Boolean
          ) {
            GetAllStudents(
              rncp_title: $rncpId
              current_class: $classId
              school: $schoolId
              pagination: $pagination
              status: $status
              sorting: $sort
              check_grand_oral_started: true,
              check_visibility: $check_visibility
              ${filter}
            ) {
              count_document
              _id
              civility
              first_name
              last_name
              photo
              email
              is_photo_in_s3
              photo_s3_path
              is_thumbups_green
              status
              school {
                _id
                short_name
              }
              rncp_title {
                _id
                short_name
              }
              current_class {
                _id
              }
              user_id {
                _id
              }
              problematic_id {
                problematic_status
              }
              job_description_id {
                job_description_status
              }
              mentor_evaluation_id {
                mentor_evaluation_status
              }
              employability_survey_ids {
                _id
                survey_status
                validator
              }
              final_transcript_id {
                _id
                status
                final_transcript_status
                certification_status
                jury_decision_for_final_transcript
                input_final_decision_status
                is_validated
                student_decision
                after_final_retake_decision
                has_jury_finally_decided
                retake_test_for_students {
                  test_id {
                    _id
                  }
                }
              }
              tests_result {
                correction_progress
                test_correction {
                  test {
                    _id
                    correction_grid {
                      correction {
                        total_zone {
                          display_additional_total
                        }
                      }
                    }
                  }
                  correction_grid {
                    correction {
                      total
                      additional_total
                    }
                  }
                }
                evaluation {
                  _id
                }
              }
              corrected_tests {
                correction {
                  _id
                  correction_grid {
                    correction {
                      additional_total
                      total
                    }
                  }
                  expected_documents {
                    document_name
                    validation_status
                    document {
                      s3_file_name
                      _id
                    }
                  }
                  mark_entry_document {
                    s3_file_name
                  }
                }
                test {
                  _id
                  type
                  expected_documents {
                    document_name
                  }
                  correction_status_for_schools {
                    correction_status
                  }
                  correction_grid {
                    correction {
                      total_zone {
                        display_additional_total
                      }
                    }
                  }
                  evaluation_id {
                    _id
                  }
                }
                is_visible
              }
              soft_skill_pro_evaluation {
                status
              }
              academic_pro_evaluation {
                status
              }
              student_cv {
                _id
                s3_file_name
                cv_document_status
                status
                parent_rncp_title{
                  _id
                  short_name
                }
                parent_class_id{
                  _id
                  name
                }
              }
              student_presentation {
                _id
                s3_file_name
                presentation_document_status
                status
                parent_rncp_title{
                  _id
                  short_name
                }
                parent_class_id{
                  _id
                  name
                }
              }
              is_grand_oral_started
            }
          }
        `,
        variables: {
          rncpId,
          classId,
          schoolId,
          status,
          pagination,
          check_visibility: status === 'active_pending' ? true : false,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllStudents']));
  }

  getStudentsbyIDsClassTitle(rncpId, classId, schoolId, status, pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllStudentsIDs(
            $rncpId: ID,
            $classId: ID,
            $schoolId: ID,
            $status: EnumFilterStatus,
            $pagination: PaginationInput,
            $sort: StudentSorting
          ) {
            GetAllStudents(
              rncp_title: $rncpId
              current_class: $classId
              school: $schoolId
              pagination: $pagination
              status: $status
              sorting: $sort
              ${filter}
            ) {
              count_document
              _id
            }
          }
        `,
        variables: {
          rncpId,
          classId,
          schoolId,
          status,
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllStudents']));
  }

  getStudentsCardDataSendToCertifierProblematic(schoolId, rncpId, classId): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
        query GetStudentsCardDataSendToCertifierProblematic{
          GetAllStudents(
          sorting: { last_name: asc },
          school: "${schoolId}",
          rncp_title: "${rncpId}",
          current_class: "${classId}",
          status: active_completed,
          filter: {problematic: sent_to_certifier}
        ) {
            _id
            civility
            first_name
            last_name
            photo
            is_photo_in_s3
            photo_s3_path
            rncp_title {
              _id
              short_name
            }
            current_class {
              _id
              name
            }
            email
            status
            student_title_status
            incorrect_email
            previous_courses_id {
              _id
              rncp_id{
                _id
              }
              class_id {
                _id
              }
            }
          }
        }`,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllStudents']));
  }

  getStudentsCardData(schoolId, rncpId, classId): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetStudentsCardData{
            GetAllStudents(
            sorting: { last_name: asc },
            school: "${schoolId}",
            rncp_title: "${rncpId}",
            current_class: "${classId}",
            status: active_completed
          ) {
            _id
            civility
            first_name
            last_name
            photo
            is_photo_in_s3
            photo_s3_path
            rncp_title {
              _id
              short_name
            }
            current_class {
              _id
              name
            }
            email
            status
            student_title_status
            incorrect_email
            previous_courses_id {
              _id
              rncp_id{
                _id
              }
              class_id {
                _id
              }
              status
              student_title_status
            }
          }
        }`,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllStudents']));
  }

  getOneStudentsCardData(schoolId: string, rncpId: string, classId: string, studentId: string): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
        query GetOneStudent{
          GetAllStudents(
            sorting: { last_name: asc },
            school: "${schoolId}",
            rncp_title: "${rncpId}",
            current_class: "${classId}",
            status: student_card_active_completed,
            student_ids: ["${studentId}"]
          ) {
            _id
            civility
            first_name
            last_name
            photo
            is_photo_in_s3
            photo_s3_path
            rncp_title {
              _id
              short_name
            }
            current_class {
              _id
              name
            }
            email
            status
            student_title_status
            incorrect_email
            previous_courses_id {
              _id
              rncp_id{
                _id
              }
              class_id {
                _id
              }
              status
              student_title_status
            }
          }
        }`,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllStudents']));
  }

  getOneStudent(studentId: string): Observable<any> {
    return this.apollo
      .query<any>({
        query: gql`
        query{
          GetOneStudent(
            _id: "${studentId}"
          ) {
            _id
            email
            first_name
            last_name
            civility
            rncp_title {
              _id
              short_name
              long_name
            }
            photo_s3_path
            photo
            job_description_id {
              _id
              job_name
              company {
                status
                company {
                  company_name
                  company_logo
                  status
                }
              }
              mentor {
                _id
                first_name
                last_name
                civility
              }
              block_of_template_competences {
                competence_templates {
                  competence_template_id {
                    _id
                    ref_id
                  }
                  missions_activities_autonomy {
                    mission
                    activity
                    autonomy_level
                  }
                  is_mission_related_to_competence
                }
              }
            }
            school {
              logo
            }
            companies {
              status
              company {
                status
                _id
                company_name
                company_logo
              }
              mentor {
                _id
                first_name
                last_name
                civility
              }
            }
          }
        }`,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneStudent']));
  }

  getStudentsPdfPersonalized(schoolId: string, rncpId: string, classId: string, studentIds?): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query getStudentsPdfPersonalized($school: ID, $rncp_title: ID, $current_class: ID, $student_ids: [ID]) {
            GetAllStudents(
              sorting: { last_name: asc }
              status: active_completed
              school: $school
              rncp_title: $rncp_title
              current_class: $current_class
              student_ids: $student_ids
            ) {
              _id
              civility
              first_name
              last_name
              school {
                _id
                short_name
              }
              job_description_id {
                block_of_template_competences {
                  block_of_template_competence_id {
                    _id
                  }
                  competence_templates {
                    competence_template_id {
                      _id
                    }
                    is_mission_related_to_competence
                    missions_activities_autonomy {
                      mission
                      activity
                      autonomy_level
                    }
                  }
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          school: schoolId,
          rncp_title: rncpId,
          current_class: classId,
          student_ids: studentIds,
        },
      })
      .pipe(map((resp) => resp.data['GetAllStudents']));
  }

  getAllEvaluation(rncpId: string, classId: string): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
        query{
          GetAllEvaluations(filter: {
            class_id: "${classId}"
            rncp_title_id: "${rncpId}"
          }){
            _id
            evaluation
            retake_evaluation{
              _id
              evaluation
            }
            retake_subject_id{
              _id
              status
            }
          }
        }`,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllEvaluations']));
  }

  GetAllSubjects(rncpId: string, classId: string): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
        query GetAllSubjects{
          GetAllSubjects(filter: {
            class_id: "${classId}"
            rncp_title_id: "${rncpId}"
          }){
            _id
            subject_name
            order
            evaluations {
              _id
              evaluation
              order
              result_visibility
            }
          }
        }`,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllSubjects']));
  }

  getAllBlockCompetence(rncpId, classId): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
        query{
          GetAllBlockOfCompetenceConditions(
            class_id: "${classId}"
            rncp_title_id: "${rncpId}"
            is_retake_by_block: false
          ){
            _id
            block_of_competence_condition
          }
        }`,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllBlockOfCompetenceConditions']));
  }

  getStudentsCourseData(studentId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query GetStudentsCourseData{
          GetOneStudent(_id: "${studentId}"){
            _id
            rncp_title {
              _id
            }
            current_class {
              _id
            }
            specialization {
              _id
              name
            }
            parallel_intake
            email
            is_take_full_prepared_title
            is_have_exemption_block
            partial_blocks {
              _id
              block_of_competence_condition
            }
            exemption_blocks {
              block_id {
                _id
              }
              reason
              rncp_title_in_platform {
                _id
              }
              rncp_title_outside_platform
              justification_document
            }
          }
        }`,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneStudent']));
  }

  getStudentsPreviousCourseData(schoolId: string, rncpId: string, classId: string, studentId: string): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
        query GetStudentsPreviousCourseData{
          GetAllStudents(
            sorting: { last_name: asc },
            school: "${schoolId}",
            rncp_title: "${rncpId}",
            current_class: "${classId}",
            status: student_card_active_completed,
            student_ids: ["${studentId}"]
          ){
            _id
            rncp_title {
              _id
            }
            current_class {
              _id
            }
            specialization {
              _id
              name
            }
            parallel_intake
            email
            is_take_full_prepared_title
            is_have_exemption_block
            partial_blocks {
              _id
              block_of_competence_condition
            }
            exemption_blocks {
              block_id {
                _id
              }
              reason
              rncp_title_in_platform {
                _id
              }
              rncp_title_outside_platform
              justification_document
            }
          }
        }`,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllStudents']));
  }

  getStudentsIdentityData(studentId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query{
          GetOneStudent(_id: "${studentId}"){
            _id
            civility
            first_name
            last_name
            tele_phone
            email
            date_of_birth
            place_of_birth
            nationality
            student_address {
              address
              postal_code
              country
              city
              region
              department
              is_main_address
            }
            job_description_id {
              _id
            }
            photo
            is_photo_in_s3
            photo_s3_path
            academic_journey_id {
              _id
              general_presentation {
                first_name
                photo
              }
            }
            soft_skill_pro_evaluation {
              status
              test_id {
                _id
                send_date_to_mentor {
                  date_utc
                  time_utc
                }
              }
            }
            academic_pro_evaluation {
              status
              test_id {
                _id
                send_date_to_mentor {
                  date_utc
                  time_utc
                }
              }
            }
            companies {
              status
              company {
                status
                _id
                company_name
                company_logo
              }
              mentor {
                _id
                first_name
                last_name
                civility
              }
            }
          }
        }`,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneStudent']));
  }

  getStudentsPreviousCourseIdentityData(schoolId: string, rncpId: string, classId: string, studentId: string): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
        query GetStudentsPreviousCourseIdentityData{
          GetAllStudents(
            sorting: { last_name: asc },
            school: "${schoolId}",
            rncp_title: "${rncpId}",
            current_class: "${classId}",
            status: student_card_active_completed,
            student_ids: ["${studentId}"]
          ) {
            _id
            civility
            first_name
            last_name
            tele_phone
            email
            date_of_birth
            place_of_birth
            nationality
            student_address {
              address
              postal_code
              country
              city
              region
              department
              is_main_address
            }
            job_description_id {
              _id
            }
            photo
            is_photo_in_s3
            photo_s3_path
            academic_journey_id {
              _id
              general_presentation {
                first_name
                photo
              }
            }
            companies {
              status
              company {
                status
                _id
                company_name
                company_logo
              }
              mentor {
                _id
                first_name
                last_name
                civility
              }
            }
          }
        }`,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllStudents']));
  }

  getStudentsJobDescIdentityData(studentId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query GetStudentsJobDescIdentityData{
          GetOneStudent(_id: "${studentId}"){
            _id
            civility
            first_name
            last_name
            tele_phone
            email
            date_of_birth
            place_of_birth
            nationality
            professional_email
            parents{
              relation
              family_name
              name
              civility
              job
              professional_email
              email
              parent_address{
                address
                postal_code
                city
                country
              }
            }
            job_description_id {
              _id
            }
            school {
              _id
              short_name
              long_name
            }
            rncp_title {
              _id
              short_name
              long_name
            }
            current_class {
              name
            }
            student_address {
              address
              postal_code
              country
              city
              region
              department
              is_main_address
            }
            companies {
              company {
                _id
                company_name
              }
            job_description_id {
              _id
            }
            problematic_id {
              _id
            }
            mentor_evaluation_id {
              _id
            }
              is_active
              status
              mentor {
                _id
                first_name
                last_name
                civility
              }
              start_date{
                date
                time
              }
              end_date{
                date
                time
              }
            }
            photo
            is_photo_in_s3
            photo_s3_path
          }
        }`,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneStudent']));
  }

  getStudentsPreviousCourseJobDescIdentityData(schoolId: string, rncpId: string, classId: string, studentId: string): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
        query GetStudentsPreviousCourseJobDescIdentityData{
          GetAllStudents(
            sorting: { last_name: asc },
            school: "${schoolId}",
            rncp_title: "${rncpId}",
            current_class: "${classId}",
            status: student_card_active_completed,
            student_ids: ["${studentId}"]
          ){
            _id
            civility
            first_name
            last_name
            tele_phone
            email
            date_of_birth
            place_of_birth
            nationality
            professional_email
            parents{
              relation
              family_name
              name
              civility
              job
              professional_email
              email
              parent_address{
                address
                postal_code
                city
                country
              }
            }
            job_description_id {
              _id
            }
            school {
              _id
              short_name
              long_name
            }
            rncp_title {
              _id
              short_name
              long_name
            }
            current_class {
              name
            }
            student_address {
              address
              postal_code
              country
              city
              region
              department
              is_main_address
            }
            companies {
              company {
                _id
                company_name
              }
            job_description_id {
              _id
            }
            problematic_id {
              _id
            }
            mentor_evaluation_id {
              _id
            }
              is_active
              status
              mentor {
                _id
                first_name
                last_name
                civility
              }
              start_date{
                date
                time
              }
              end_date{
                date
                time
              }
            }
            photo
            is_photo_in_s3
            photo_s3_path
          }
        }`,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllStudents']));
  }

  getStudentsESDetailData(studentId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query GetStudentsESDetailData{
          GetOneStudent(_id: "${studentId}"){
            _id
            civility
            first_name
            last_name
            tele_phone
            email
            date_of_birth
            place_of_birth
            nationality
            professional_email
            parents{
              relation
              family_name
              name
              civility
              job
              professional_email
              email
              parent_address{
                address
                postal_code
                city
                country
              }
            }
            school {
              _id
              short_name
              long_name
            }
            rncp_title {
              _id
              short_name
              long_name
            }
            current_class {
              name
            }
            student_address {
              address
              postal_code
              country
              city
              region
              department
              is_main_address
            }
            companies {
              company {
                _id
                company_name
              }
              is_active
              status
              mentor {
                _id
                first_name
                last_name
                civility
              }
              start_date{
                date
                time
              }
              end_date{
                date
                time
              }
            }
            photo
            is_photo_in_s3
            photo_s3_path
          }
        }`,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneStudent']));
  }

  getStudentsPreviousESDetailData(schoolId: string, rncpId: string, classId: string, studentId: string): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
        query GetStudentsPreviousESDetailData{
          GetAllStudents(
            sorting: { last_name: asc },
            school: "${schoolId}",
            rncp_title: "${rncpId}",
            current_class: "${classId}",
            status: student_card_active_completed,
            student_ids: ["${studentId}"]
          ){
            _id
            civility
            first_name
            last_name
            tele_phone
            email
            date_of_birth
            place_of_birth
            nationality
            professional_email
            parents{
              relation
              family_name
              name
              civility
              job
              professional_email
              email
              parent_address{
                address
                postal_code
                city
                country
              }
            }
            school {
              _id
              short_name
              long_name
            }
            rncp_title {
              _id
              short_name
              long_name
            }
            current_class {
              name
            }
            student_address {
              address
              postal_code
              country
              city
              region
              department
              is_main_address
            }
            companies {
              company {
                _id
                company_name
              }
              is_active
              status
              mentor {
                _id
                first_name
                last_name
                civility
              }
              start_date{
                date
                time
              }
              end_date{
                date
                time
              }
            }
            photo
            is_photo_in_s3
            photo_s3_path
          }
        }`,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllStudents']));
  }

  getStudentsCompanyData(studentId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
      query GetStudentsCompanyData{
        GetOneStudent(_id: "${studentId}") {
          _id
          certificate_issuance_status
          identity_verification_status
          final_transcript_id {
            final_transcript_status
            certification_status
          }
          companies {
            company {
              _id
              company_name
            }
            start_date {
              date
              time
            }
            end_date {
              date
              time
            }
            contract_closed_date {
              date
              time
            }
            status
            is_active
            mentor {
              _id
              first_name
              last_name
              civility
            }
            job_description_id {
              _id
              job_description_status
              status
              class_id {
                _id
              }
            }
            problematic_id {
              _id
              problematic_status
              status
            }
            mentor_evaluation_id {
              _id
              mentor_evaluation_status
              status
            }
          }
          job_description_id {
            _id
            job_description_status
            status
            class_id {
              _id
            }
          }
          problematic_id {
            _id
            problematic_status
            status
          }
          mentor_evaluation_id {
            _id
            mentor_evaluation_status
            status
          }
          retake_tests {
            _id
          }
          soft_skill_pro_evaluation {
            status
            test_id {
              _id
              send_date_to_mentor {
                date_utc
                time_utc
              }
            }
          }
          academic_pro_evaluation {
            status
            test_id {
              _id
              send_date_to_mentor {
                date_utc
                time_utc
              }
            }
          }
        }
      }`,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneStudent']));
  }

  getStudentsPreviousCourseCompanyData(schoolId: string, rncpId: string, classId: string, studentId: string): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
      query GetStudentsPreviousCourseCompanyData{
        GetAllStudents(
          sorting: { last_name: asc },
          school: "${schoolId}",
          rncp_title: "${rncpId}",
          current_class: "${classId}",
          status: student_card_active_completed,
          student_ids: ["${studentId}"]
        ) {
          _id
          certificate_issuance_status
          identity_verification_status
          final_transcript_id {
            final_transcript_status
            certification_status
          }
          companies {
            company {
              _id
              company_name
            }
            start_date {
              date
              time
            }
            end_date {
              date
              time
            }
            contract_closed_date {
              date
              time
            }
            status
            is_active
            mentor {
              _id
              first_name
              last_name
              civility
            }
            job_description_id {
              _id
              job_description_status
              status
              class_id {
                _id
              }
            }
            problematic_id {
              _id
              problematic_status
              status
            }
            mentor_evaluation_id {
              _id
              mentor_evaluation_status
              status
            }
          }
          job_description_id {
            _id
            job_description_status
            status
            class_id {
              _id
            }
          }
          problematic_id {
            _id
            problematic_status
            status
          }
          mentor_evaluation_id {
            _id
            mentor_evaluation_status
            status
          }
          retake_tests {
            _id
          }
          soft_skill_pro_evaluation {
            status
            test_id {
              _id
              send_date_to_mentor {
                date_utc
                time_utc
              }
            }
          }
          academic_pro_evaluation {
            status
            test_id {
              _id
              send_date_to_mentor {
                date_utc
                time_utc
              }
            }
          }
        }
      }`,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllStudents']));
  }

  getStudentsDetailData(studentId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query GetOneStudentDetails{
          GetOneStudent(_id: "${studentId}"){
            _id
            certificate_issuance_status
            final_transcript_id {
              final_transcript_status
              certification_status
            }
            user_id {
              _id
            }
            companies {
              company {
                _id
                company_name
              }
              start_date {
                date
                time
              }
              end_date {
                date
                time
              }
              status
              is_active
              mentor {
                _id
                first_name
                last_name
                civility
              }
            }
            job_description_id {
              _id
              job_description_status
              status
              class_id {
                _id
              }
            }
            problematic_id {
              _id
              problematic_status
              status
            }
            mentor_evaluation_id {
              _id
              mentor_evaluation_status
              status
            }
            employability_survey_ids{
              _id
            }
            retake_tests {
              _id
            }
          }
        }`,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneStudent']));
  }

  getStudentsPreviousDetailData(schoolId: string, rncpId: string, classId: string, studentId: string): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
        query GetStudentsPreviousDetailData{
          GetAllStudents(
            sorting: { last_name: asc },
            school: "${schoolId}",
            rncp_title: "${rncpId}",
            current_class: "${classId}",
            status: student_card_active_completed,
            student_ids: ["${studentId}"]
          ){
            _id
            certificate_issuance_status
            final_transcript_id {
              final_transcript_status
              certification_status
            }
            user_id {
              _id
            }
            companies {
              company {
                _id
                company_name
              }
              start_date {
                date
                time
              }
              end_date {
                date
                time
              }
              status
              is_active
              mentor {
                _id
                first_name
                last_name
                civility
              }
            }
            job_description_id {
              _id
              job_description_status
              status
              class_id {
                _id
              }
            }
            problematic_id {
              _id
              problematic_status
              status
            }
            mentor_evaluation_id {
              _id
              mentor_evaluation_status
              status
            }
            employability_survey_ids{
              _id
            }
            retake_tests {
              _id
            }
          }
        }`,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllStudents']));
  }

  getCompanyData(studentId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query{
          GetOneStudent(_id: "${studentId}"){
            _id
            companies {
              company {
                _id
                company_name
                company_addresses {
                  address
                  city
                  region
                  postal_code
                  country
                }
              }
              start_date {
                date
                time
              }
              end_date {
                date
                time
              }
              status
              is_active
              mentor {
                _id
                first_name
                last_name
                civility
              }
            }
          }
        }`,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneStudent']));
  }

  getStudentsCertification(studentId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query GetStudentsCertification{
          GetOneStudent(_id: "${studentId}"){
            _id
            first_name
            last_name
            civility
            date_of_birth
            is_thumbups_green
            academic_journey_id {
              diplomas {
                diploma_photo
              }
            }
            rncp_title {
              _id
              short_name
              long_name
              rncp_level
            }
            school {
              _id
              short_name
            }
            certificate_issuance_status
identity_verification_status
            certificate_issued_on {
              year
              month
              date
            }
            final_transcript_pdf_link
            final_transcript_id {
              _id
              status
              final_transcript_status
              certification_status
              final_transcript_generated_on{
                year
                date
                month
                day
              }
              jury_decision_for_final_transcript
              jury_decision_generated_on{
                year
                date
                month
                day
              }
              retake_test_for_students{
                test_id {
                  _id
                }
                name
                position
                is_test_accepted_by_student
              }
              retake_block_for_students{
                test_id{
                  _id
                }
                name
                block_name
                is_test_accepted_by_student
                block_id{
                  _id
                  is_retake_by_block
                  selected_block_retake {
                    _id
                    block_of_competence_condition
                  }
                }
              }
              input_final_decision_status
              is_validated
              student_decision
              student_decision_generated_on{
                year
                date
                month
                day
              }
              after_final_retake_decision
              after_final_retake_decision_generated_on{
                year
                date
                month
                day
              }
              has_jury_finally_decided
            }
          }
        }`,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneStudent']));
  }

  getStudentsPreviousCertification(schoolId: string, rncpId: string, classId: string, studentId: string): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
        query GetStudentsPreviousCertification{
          GetAllStudents(
            sorting: { last_name: asc },
            school: "${schoolId}",
            rncp_title: "${rncpId}",
            current_class: "${classId}",
            status: student_card_active_completed,
            student_ids: ["${studentId}"]
          ){
            _id
            first_name
            last_name
            civility
            date_of_birth
            is_thumbups_green
            academic_journey_id {
              diplomas {
                diploma_photo
              }
            }
            rncp_title {
              _id
              short_name
              long_name
              rncp_level
            }
            school {
              _id
              short_name
            }
            certificate_issuance_status
identity_verification_status
            certificate_issued_on {
              year
              month
              date
            }
            final_transcript_pdf_link
            final_transcript_id {
              _id
              status
              final_transcript_status
              certification_status
              final_transcript_generated_on{
                year
                date
                month
                day
              }
              jury_decision_for_final_transcript
              jury_decision_generated_on{
                year
                date
                month
                day
              }
              retake_test_for_students{
                test_id {
                  _id
                }
                name
                position
                is_test_accepted_by_student
              }
              retake_block_for_students{
                test_id{
                  _id
                }
                name
                block_name
                is_test_accepted_by_student
                block_id{
                  _id
                  is_retake_by_block
                  selected_block_retake {
                    _id
                    block_of_competence_condition
                  }
                }
              }
              input_final_decision_status
              is_validated
              student_decision
              student_decision_generated_on{
                year
                date
                month
                day
              }
              after_final_retake_decision
              after_final_retake_decision_generated_on{
                year
                date
                month
                day
              }
              has_jury_finally_decided
            }
          }
        }`,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllStudents']));
  }

  getStudentsDetailCertification(studentId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query GetStudentsDetailCertification{
          GetOneStudent(_id: "${studentId}"){
            _id
            first_name
            last_name
            civility
            sex
            email
            date_of_birth
            place_of_birth
            nationality
            tele_phone
            student_address {
              address
              postal_code
              city
              region
              department
              country
              is_main_address
            }
            certificate_issuance_status
            identity_verification_status
            certificate_issued_on {
              year
              month
              date
            }
            school {
              short_name
              long_name
              school_address {
                address1
                address2
                postal_code
                city
                region
                department
                country
              }
              country
              preparation_center_ats {
                rncp_title_id {
                  _id
                  short_name
                }
                selected_specializations {
                  _id
                  name
                }
              }
              certifier_ats {
                _id
                short_name
              }
              school_ref_id
              status
            }
            rncp_title {
              _id
              short_name
              long_name
              rncp_code
              rncp_level
              journal_text
              journal_date
            }
          }
        }`,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneStudent']));
  }

  getStudentsPrevCourseDetailCertification(schoolId: string, rncpId: string, classId: string, studentId: string): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
        query GetStudentsPrevCourseDetailCertification{
          GetAllStudents(
            sorting: { last_name: asc },
            school: "${schoolId}",
            rncp_title: "${rncpId}",
            current_class: "${classId}",
            status: student_card_active_completed,
            student_ids: ["${studentId}"]
          ){
            _id
            first_name
            last_name
            civility
            sex
            email
            date_of_birth
            place_of_birth
            nationality
            tele_phone
            student_address {
              address
              postal_code
              city
              region
              department
              country
              is_main_address
            }
            certificate_issuance_status
            identity_verification_status
            certificate_issued_on {
              year
              month
              date
            }
            school {
              short_name
              long_name
              school_address {
                address1
                address2
                postal_code
                city
                region
                department
                country
              }
              country
              preparation_center_ats {
                rncp_title_id {
                  _id
                  short_name
                }
                selected_specializations {
                  _id
                  name
                }
              }
              certifier_ats {
                _id
                short_name
              }
              school_ref_id
              status
            }
            rncp_title {
              _id
              short_name
              long_name
              rncp_code
              rncp_level
              journal_text
              journal_date
            }
          }
        }`,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllStudents']));
  }

  getStudentsParentData(studentId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query GetStudentsParentData{
          GetOneStudent(_id: "${studentId}"){
            email
            student_address {
              address
              postal_code
              country
              city
              region
              department
              is_main_address
            }
            parents {
              relation
              family_name
              name
              civility
              tele_phone
              email
              is_same_address
              parent_address {
                address
                postal_code
                country
                city
                region
                department
                is_main_address
              }
            }
          }
        }`,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneStudent']));
  }

  getStudentsESData(studentId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query GetOneStudentDetails{
          GetOneStudent(_id: "${studentId}"){
            _id
            first_name
            last_name
            employability_survey_ids{
              _id
              send_date
              send_time
              questionnaire_id{
                _id
                questionnaire_name
              }
              survey_status
              validator
              employability_survey_process_id {
                _id
              }
              employability_survey_parameter_id {
                send_date
                send_time
                expiration_date
                expiration_time
              }
            }
          }
        }`,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneStudent']));
  }

  getStudentsPreviousESData(schoolId: string, rncpId: string, classId: string, studentId: string): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
        query GetStudentsPreviousESData{
          GetAllStudents(
            sorting: { last_name: asc },
            school: "${schoolId}",
            rncp_title: "${rncpId}",
            current_class: "${classId}",
            status: student_card_active_completed,
            student_ids: ["${studentId}"]
          ){
            _id
            first_name
            last_name
            employability_survey_ids{
              _id
              send_date
              send_time
              questionnaire_id{
                _id
                questionnaire_name
              }
              survey_status
              validator
            }
          }
        }`,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllStudents']));
  }

  updateStudentData(studentId: string, payload): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateStudent($studentId: ID!, $payload: StudentInput) {
            UpdateStudent(_id: $studentId, student_input: $payload) {
              _id
            }
          }
        `,
        variables: {
          studentId,
          payload,
        },
      })
      .pipe(map((resp) => resp.data['UpdateStudent']));
  }

  IsFinalTranscriptStarted(rncp_id, class_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation IsFinalTranscriptStarted{
            IsFinalTranscriptStarted(rncp_id: "${rncp_id}", class_id: "${class_id}")
          }
        `,
      })
      .pipe(map((resp) => resp.data['IsFinalTranscriptStarted']));
  }

  SendStudentIdentityVerification(student_ids): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SendStudentIdentityVerification($student_ids: [ID], $lang: String) {
            SendStudentIdentityVerification(student_ids: $student_ids, lang: $lang)
          }
        `,
        variables: {
          student_ids,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['SendStudentIdentityVerification']));
  }

  UpdateStudentIdentityVerificationStatus(student_id, identity_verification_status): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateStudentIdentityVerificationStatus(
            $student_id: ID
            $identity_verification_status: EnumCertificateIssuanceStatus
            $lang: String
          ) {
            UpdateStudentIdentityVerificationStatus(
              student_id: $student_id
              identity_verification_status: $identity_verification_status
              lang: $lang
            ) {
              _id
              certificate_issuance_status
              identity_verification_status
            }
          }
        `,
        variables: {
          student_id,
          identity_verification_status,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['UpdateStudentIdentityVerificationStatus']));
  }

  reactivateStudent(studentId: string, date: string, reason: string) {
    return this.apollo
      .mutate({
        mutation: gql`
        mutation {
          ReactivateStudent(
            student_id: "${studentId}"
            date_of_reactivation: "${date}"
            reason_for_reactivation: "${reason}"
          ) {
            _id
          }
        }
      `,
      })
      .pipe(map((resp) => resp.data['ReactivateStudent']));
  }

  sendJobDesc(payload): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateJobDescription($job_desc_input: JobDescriptionInput, $lang: String) {
            CreateJobDescription(job_desc_input: $job_desc_input, lang: $lang) {
              _id
              job_name
            }
          }
        `,
        variables: {
          job_desc_input: payload,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['CreateJobDescription']));
  }

  updateCourseStudentData(studentId: string, payload): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateStudent($studentId: ID!, $payload: StudentInput) {
            UpdateStudent(_id: $studentId, student_input: $payload) {
              _id
              rncp_title {
                _id
              }
              current_class {
                _id
              }
            }
          }
        `,
        variables: {
          studentId,
          payload,
        },
      })
      .pipe(map((resp) => resp.data['UpdateStudent']));
  }

  RequestStudentEmailChange(studentId: string, rncpId: string, schoolId: string): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
      mutation {
        RequestStudentEmailChange(
          student_id: "${studentId}"
          rncp_id: "${rncpId}"
          school_id: "${schoolId}"
          lang: "${this.translate.currentLang.toLowerCase()}"
        )
      }
      `,
    });
  }

  closeContractStudent(studentId: string, companyId: string, mentorId: string): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
      mutation DeativateStudentCompanyContract{
        DeativateStudentCompanyContract (
          student_id: "${studentId}"
          company_id: "${companyId}"
          mentor_id: "${mentorId}"
        ) {
          _id
          first_name
          last_name
          civility
        }
      }
      `,
    });
  }

  deactivateStudent(studentId: string, reason: string, date: string): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
      mutation {
        DeativateStudent(student_id: "${studentId}", reason_for_resignation: "${reason}", date_of_resignation: "${date}") {
          _id
          first_name
          last_name
          email
        }
      }
      `,
      })
      .pipe(map((resp) => resp.data['DeativateStudent']));
  }

  transferStudentToDifferentSchoolSameTitle(studentId: string, schoolId: string, lang: string): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
      mutation TransferStudentToDifferentSchool{
        TransferStudentToDifferentSchool(
          student_id: "${studentId}",
          school_id: "${schoolId}",
          lang: "${lang}",
        ) {
          _id
        }
      }
      `,
        errorPolicy: 'all',
      })
      .pipe(map((resp) => resp));
  }

  transferStudent(studentId: string, titleId: string, classId: string, schoolId: string, lang: string): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
      mutation {
        TransferStudent(
          student_id: "${studentId}",
          rncp_title_id: "${titleId}",
          class_id: "${classId}",
          school_id: "${schoolId}",
          lang: "${lang}",
        ) {
          _id
        }
      }
      `,
        errorPolicy: 'all',
      })
      .pipe(map((resp) => resp));
  }

  getAllDeactivatedAndSuspendedStudentsChiefGroup(pagination, school_ids, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query getAllDeactivatedAndSuspendedStudentsChiefGroup($pagination: PaginationInput, $school_ids: [ID], $sort: StudentSorting) {
            GetDeactivatedAndSuspendedStudents(
              pagination: $pagination,
              school_ids: $school_ids,
              sorting: $sort, ${filter},
            ) {
              count_document
              incorrect_email
              _id
              civility
              first_name
              last_name
              email
              photo
              date_of_birth
              place_of_birth
              tele_phone
              academic_journey_id {
                diplomas {
                  diploma_photo
                }
              }
              createdAt
              certificate_issuance_status
              identity_verification_status
              is_photo_in_s3
              photo_s3_path
              is_thumbups_green
              reason_for_resignation
              date_of_resignation
              status
              student_title_status
              school {
                _id
                short_name
              }
              rncp_title {
                _id
                short_name
              }
              current_class {
                _id
                name
              }
              final_transcript_id {
                _id
                status
                final_transcript_status
                certification_status
                jury_decision_for_final_transcript
                input_final_decision_status
                is_validated
                student_decision
                after_final_retake_decision
                has_jury_finally_decided
                retake_test_for_students {
                  test_id {
                    _id
                  }
                }
              }
              user_id {
                _id
              }
              job_description_id {
                _id
                job_name
                job_description_status
              }
              problematic_id {
                _id
                problematic_status
              }
              mentor_evaluation_id {
                _id
                mentor_evaluation_status
              }
              employability_survey_ids {
                _id
                survey_status
                validator
              }
              companies {
                company {
                  _id
                  company_name
                }
                status
                mentor {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
              }
            }
          }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
          school_ids,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetDeactivatedAndSuspendedStudents']));
  }

  getAllDeactivatedAndSuspendedStudentsCR(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query getAllDeactivatedAndSuspendedStudentsCR($pagination: PaginationInput, $sort: StudentSorting) {
            GetDeactivatedAndSuspendedStudents(
              pagination: $pagination, ${filter}, sorting: $sort
            ) {
              count_document
              incorrect_email
              _id
              civility
              first_name
              last_name
              email
              photo
              date_of_birth
              place_of_birth
              tele_phone
              academic_journey_id {
                diplomas {
                  diploma_photo
                }
              }
              createdAt
              certificate_issuance_status
              identity_verification_status
              is_photo_in_s3
              photo_s3_path
              is_thumbups_green
              reason_for_resignation
              date_of_resignation
              status
              student_title_status
              school {
                _id
                short_name
              }
              rncp_title {
                _id
                short_name
              }
              current_class {
                _id
                name
              }
              final_transcript_id {
                _id
                status
                final_transcript_status
                certification_status
                jury_decision_for_final_transcript
                input_final_decision_status
                is_validated
                student_decision
                after_final_retake_decision
                has_jury_finally_decided
                retake_test_for_students {
                  test_id {
                    _id
                  }
                }
              }
              user_id {
                _id
              }
              job_description_id {
                _id
                job_name
                job_description_status
              }
              problematic_id {
                _id
                problematic_status
              }
              mentor_evaluation_id {
                _id
                mentor_evaluation_status
              }
              employability_survey_ids {
                _id
                survey_status
                validator
              }
              companies {
                company {
                  _id
                  company_name
                }
                status
                mentor {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
              }
            }
          }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetDeactivatedAndSuspendedStudents']));
  }

  getAllDeactivatedAndSuspendedStudentsMentor(pagination, mentor_id, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query getAllDeactivatedAndSuspendedStudentsMentor($pagination: PaginationInput, $mentor_id: ID, $sort: StudentSorting) {
            GetDeactivatedAndSuspendedStudents(
              pagination: $pagination,
              mentor_id: $mentor_id,
              ${filter},
              sorting: $sort,
            ) {
              count_document
              incorrect_email
              _id
              civility
              first_name
              last_name
              email
              photo
              date_of_birth
              place_of_birth
              tele_phone
              academic_journey_id {
                diplomas {
                  diploma_photo
                }
              }
              createdAt
              certificate_issuance_status
              identity_verification_status
              is_photo_in_s3
              photo_s3_path
              is_thumbups_green
              reason_for_resignation
              date_of_resignation
              status
              student_title_status
              school {
                _id
                short_name
              }
              rncp_title {
                _id
                short_name
              }
              current_class {
                _id
                name
              }
              final_transcript_id {
                _id
                status
                final_transcript_status
                certification_status
                jury_decision_for_final_transcript
                input_final_decision_status
                is_validated
                student_decision
                after_final_retake_decision
                has_jury_finally_decided
                retake_test_for_students {
                  test_id {
                    _id
                  }
                }
              }
              user_id {
                _id
              }
              job_description_id {
                _id
                job_name
                job_description_status
              }
              problematic_id {
                _id
                problematic_status
              }
              mentor_evaluation_id {
                _id
                mentor_evaluation_status
              }
              employability_survey_ids {
                _id
                survey_status
                validator
              }
              companies {
                company {
                  _id
                  company_name
                }
                status
                mentor {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
              }
            }
          }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
          mentor_id,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetDeactivatedAndSuspendedStudents']));
  }

  getAllDeactivatedAndSuspendedStudents(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query getAllDeactivatedAndSuspendedStudents($pagination: PaginationInput, $sort: StudentSorting) {
            GetDeactivatedAndSuspendedStudents(pagination: $pagination, sorting: $sort, ${filter}) {
              count_document
              incorrect_email
              _id
              civility
              first_name
              last_name
              email
              photo
              date_of_birth
              place_of_birth
              tele_phone
              academic_journey_id {
                diplomas {
                  diploma_photo
                }
              }
              createdAt
              certificate_issuance_status
              identity_verification_status
              is_photo_in_s3
              photo_s3_path
              is_thumbups_green
              reason_for_resignation
              date_of_resignation
              status
              student_title_status
              school {
                _id
                short_name
              }
              rncp_title {
                _id
                short_name
              }
              current_class {
                _id
                name
              }
              final_transcript_id {
                _id
                status
                final_transcript_status
                certification_status
                jury_decision_for_final_transcript
                input_final_decision_status
                is_validated
                student_decision
                after_final_retake_decision
                has_jury_finally_decided
                retake_test_for_students {
                  test_id {
                    _id
                  }
                }
              }
              user_id {
                _id
              }
              job_description_id {
                _id
                job_name
                job_description_status
              }
              problematic_id {
                _id
                problematic_status
              }
              mentor_evaluation_id {
                _id
                mentor_evaluation_status
              }
              employability_survey_ids {
                _id
                survey_status
                validator
              }
              companies {
                company {
                  _id
                  company_name
                }
                status
                mentor {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
              }
            }
          }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetDeactivatedAndSuspendedStudents']));
  }

  // ----------------------------------------------------------
  // ===================== DUMMY DATA =========================
  // ----------------------------------------------------------

  @Cacheable()
  getStudents(): Observable<any[]> {
    return this.httpClient.get<any[]>('assets/data/students.json');
  }

  @Cacheable()
  getCorrectionData(): Observable<any> {
    return this.httpClient.get<any[]>('assets/data/eval-pro-correction.json');
  }

  getNationalitiesList() {
    return this.nationalitiesList;
  }
  getNationalitiesListFromCsv() {
    return this.nationalityListFromCSV;
  }

  getNationalitiesFrList() {
    return this.nationalitiesFrList;
  }

  getCountriesList() {
    return this.CountryList;
  }

  getDummyStudent() {
    let tempRead;
    return (tempRead = [
      {
        _id: '5aaa5ad06a853f0fddecbd2b',
        first_name: 'Arnaud',
        last_name: 'Goujon',
        photo: '',
        is_photo_in_s3: false,
        photo_s3_path: null,
        is_thumb_up_green: null,
        status: 'active',
        school: {
          _id: '5a87023d3de35a550ae3ab6f',
          short_name: 'ALTEA',
        },
        rncp_title: {
          _id: '5a44b48e87c22c6b63007207',
          short_name: 'S-DMOE Sep2016',
        },
        final_transcript_id: null,
      },
    ]);
  }
  
  getAllNationalities(): Observable<Array<{ _id: string, nationality_en: string }>> {
    return this.apollo.query({
      query: gql`
      query GetAllNationalities {
        GetAllNationalities {
          _id
          nationality_en
        }
      }
      `,
    }).pipe(map(response => response.data['GetAllNationalities']));
  }

  getAllCountries(): Observable<Array<{ _id: string, country_code: string, country: string }>> {
    return this.apollo.query({
      query: gql`
      query GetAllCountries {
        GetAllCountries {
          _id
          country
          country_code
        }
      }
      `,
    }).pipe(map(response => response.data['GetAllCountries']));
  }

  checkCountryValidity(countryList: any[], value: string, allowEmptyValue: boolean = false): boolean {
    if (!value && allowEmptyValue) {
      return true;
    }
    const translated = (str: string) => this.translate.instant(`COUNTRY.${str}`);
    const valid = countryList.find(nationality => {
      if (!nationality?.country) return false;
      return translated(nationality.country) === translated(value);
    })
    return Boolean(valid);
  }

  checkNationalityValidity(nationalityList: any[], value: string, allowEmptyValue: boolean = false): boolean {
    if (!value && allowEmptyValue) {
      return true;
    }
    const translated = (str: string) => this.translate.instant(`NATIONALITY.${str}`);
    const valid = nationalityList.find(nationality => {
      if (!nationality?.nationality_en) return false;
      return translated(nationality.nationality_en) === translated(value);
    })
    return Boolean(valid);
  }

  validateOrRejectStudentCvPresentation(docId: string, validationStatus: string, lang: string): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
      mutation ValidateOrRejectCvAndPresentation{
        ValidateOrRejectCvAndPresentation(
          doc_id: "${docId}"
          validation_status: ${validationStatus}
          lang: "${lang}"
        ) {
          _id
        }
      }
      `,
      })
      .pipe(map((resp) => resp.data['ValidateOrRejectCvAndPresentation']));
  }

  getLimitationForDocument(docId): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query GetLimitationForRejectDocument{
          GetLimitationForRejectDocument(doc_id: "${docId}"){
            operator_allow
            acad_allow
          }
        }`,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetLimitationForRejectDocument']));
  }

  GenerateFinalTranscriptPDF(transcript_process_id, student_id): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation GenerateFinalTranscriptPDF($transcript_process_id: ID!, $student_id: ID!) {
            GenerateFinalTranscriptPDF(transcript_process_id: $transcript_process_id, student_id: $student_id)
          }
        `,
        variables: {
          transcript_process_id,
          student_id,
        },
      })
      .pipe(map((resp) => resp.data['GenerateFinalTranscriptPDF']));
  }

  checkStudentWithinSameClassAndTitle(filter) {
    return this.apollo
      .query({
        query: gql`
          query GetAllEligibleStudentESProcess{
            GetAllEligibleStudentESProcess(${filter}){
              rncp_title {
                _id
              }
              class_id {
                _id
              }
              students {
                _id
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((resp) => {
          return resp.data['GetAllEligibleStudentESProcess'];
        }),
      );
  }

  SendOneTimeEmployabilitySurvey(employability_survey_process_input) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SendOneTimeEmployabilitySurvey($employability_survey_process_input: SendOneTimeEmployabilitySurveyProcessInput) {
            SendOneTimeEmployabilitySurvey(employability_survey_process_input: $employability_survey_process_input) {
              _id
            }
          }
        `,
        variables: {
          employability_survey_process_input,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['SendOneTimeEmployabilitySurvey']));
  }

  getClassList(): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllClasses {
            GetAllClasses {
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((resp) => {
          return resp.data['GetAllClasses'];
        }),
      );
  }

  getClassListFilter(rncp_id): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllClasses($rncp_id: String) {
            GetAllClasses(rncp_id: $rncp_id) {
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          rncp_id,
        },
      })
      .pipe(
        map((resp) => {
          return resp.data['GetAllClasses'];
        }),
      );
  }
  getAllMydocument(pagination, conditonalGraphl, candidate_id, filter, sorting, type_of_documents, lang): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllStudentDocuments(
            $pagination: PaginationInput
            $candidate_id: ID
            $filter: StudentDocumentsFilterInput
            $sorting: StudentDocumentsSortingInput
            $type_of_documents: [String]
            $columnDocumentName: Boolean!
            $columnType: Boolean!
            $columnUploadDate: Boolean!
            $lang: String
          ) {
            GetAllStudentDocuments(
              pagination: $pagination
              candidate_id: $candidate_id
              filter: $filter
              sorting: $sorting
              type_of_documents: $type_of_documents
              lang: $lang
            ) {
              _id
              count_document
              document_name @include(if: $columnDocumentName)
              type_of_document @include(if: $columnType)
              s3_file_name
              created_at @include(if: $columnUploadDate)
              document_status
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          pagination,
          candidate_id,
          filter,
          sorting,
          type_of_documents,
          columnDocumentName: conditonalGraphl.documentName,
          columnType: conditonalGraphl.type,
          columnUploadDate: conditonalGraphl.uploadDate,
          lang,
        },
      })
      .pipe(
        map((resp) => {
          return resp.data['GetAllStudentDocuments'];
        }),
      );
  }

  getStudentVisaDocument(pagination, conditionalGraphql, candidate_id, sorting, filter, type_of_documents, program_id): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllStudentDocuments(
            $pagination: PaginationInput
            $candidate_id: ID
            $sorting: StudentDocumentsSortingInput
            $filter: StudentDocumentsFilterInput
            $type_of_documents: [String]
            $program_id: ID
            $columnDocumentName: Boolean!
            $columnDateAdded: Boolean!
            $columnDateOfValidity: Boolean!
            $columnStatus: Boolean!
          ) {
            GetAllStudentDocuments(
              pagination: $pagination
              candidate_id: $candidate_id
              sorting: $sorting
              filter: $filter
              type_of_documents: $type_of_documents
              program_id: $program_id
            ) {
              _id
              count_document
              document_name @include(if: $columnDocumentName)
              type_of_document
              created_at @include(if: $columnDateAdded)
              date_of_expired @include(if: $columnDateOfValidity) {
                date
                time
              }
              document_status @include(if: $columnStatus)
              s3_file_name
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          pagination,
          candidate_id,
          sorting,
          filter,
          type_of_documents,
          program_id,
          columnDocumentName: conditionalGraphql.documentName,
          columnDateAdded: conditionalGraphql.dateAdded,
          columnDateOfValidity: conditionalGraphql.dateOfValidity,
          columnStatus: conditionalGraphql.status,
        },
      })
      .pipe(
        map((resp) => {
          return resp.data['GetAllStudentDocuments'];
        }),
      );
  }

  askVisaDocument(filter, user_type_ids) {
    return this.apollo.mutate({
      mutation: gql`
        mutation AskCandidateVisa($lang: String, $filter: CandidateFilterInput, $user_type_ids: [ID]) {
          AskCandidateVisa(lang: $lang, filter: $filter, user_type_ids: $user_type_ids) {
            amount_not_sent {
              status_not_completed
              status_not_required
              status_waiting_for_validation
              status_validated
            }
            amount_sent {
              status_rejected
              status_not_sent
              status_expired
            }
          }
        }
      `,
      variables: {
        lang: this.translate.currentLang,
        filter,
        user_type_ids,
      },
    }).pipe(
      map((resp) => {
        return resp.data['AskCandidateVisa'];
      }),
    );
  }

  getAllStudentTrombinoscope(pagination, filter, type_of_group_name, type_of_group_id, group_or_class_id, user_type_ids) {
    return this.apollo
      .query({
        query: gql`
          query GetAllStudentTrombinoscope(
            $pagination: PaginationInput
            $filter: FilterStudent
            $type_of_group_name: EnumTypeOfGroup
            $type_of_group_id: ID
            $group_or_class_id: ID
            $user_type_ids: [ID]
            $lang: String
          ) {
            GetAllStudents(
              pagination: $pagination
              filter: $filter
              type_of_group_name: $type_of_group_name
              type_of_group_id: $type_of_group_id
              group_or_class_id: $group_or_class_id
              user_type_ids: $user_type_ids
              sorting: { full_name: asc }
              lang: $lang
            ) {
              _id
              candidate_id {
                _id
                first_name
                last_name
                civility
                email
                candidate_admission_status
                school_mail
                payment_supports {
                  relation
                  family_name
                  name
                  civility
                  email
                }
              }
              photo_s3_path
              is_photo_in_s3
              photo
              program {
                _id
                program
              }
              student_number
              civility
              first_name
              last_name
              email
              school_mail
              tele_phone
              count_document
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          filter,
          pagination,
          type_of_group_name,
          type_of_group_id,
          group_or_class_id,
          user_type_ids,
          lang: this.translate.currentLang,
        },
      })
      .pipe(
        map((resp) => {
          return resp.data['GetAllStudents'];
        }),
      );
  }

  getAllProgramSequence(filter) {
    return this.apollo
      .query({
        query: gql`
          query GetAllProgramSequence($filter: FilterProgramSequnceInput) {
            GetAllProgramSequence(filter: $filter) {
              _id
              name
              program_sequence_groups {
                group_class_types {
                  _id
                  name
                  group_classes_id {
                    _id
                    name
                  }
                }
                student_classes {
                  _id
                  name
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          filter,
        },
      })
      .pipe(
        map((resp) => {
          return resp.data['GetAllProgramSequence'];
        }),
      );
  }

  getProgramDataTrombinoscope(filter, user_type_logins) {
    return this.apollo
      .query({
        query: gql`
          query getProgramDataTrombinoscope($filter: ProgramFilterInput, $user_type_logins: [ID]) {
            GetAllPrograms(filter: $filter, user_type_logins: $user_type_logins) {
              _id
              program
              school_id {
                _id
                short_name
              }
              campus {
                _id
                name
              }
              level {
                _id
                name
              }
              scholar_season_id {
                _id
                scholar_season
              }
              sector_id {
                _id
                name
              }
              speciality_id {
                _id
                name
              }
            }
          }
        `,
        variables: {
          filter,
          user_type_logins,
        },
      })
      .pipe(map((resp) => resp.data['GetAllPrograms']));
  }

  createPDFTrombinoscope(
    scholar_season_id,
    program_id,
    user_type_ids?,
    sequence_id?,
    type_of_group_name?,
    type_of_group_id?,
    group_or_class_id?,
  ) {
    return this.apollo.mutate({
      mutation: gql`
        mutation CreatePDFTrombinoscope(
          $is_registered_table: Boolean
          $scholar_season_id: ID
          $program_id: ID
          $user_type_ids: [ID]
          $sequence_id: ID
          $type_of_group_name: EnumTypeOfGroup
          $type_of_group_id: ID
          $group_or_class_id: ID
          $lang: String
        ) {
          CreatePDFTrombinoscope(
            is_registered_table: $is_registered_table
            scholar_season_id: $scholar_season_id
            program_id: $program_id
            user_type_ids: $user_type_ids
            sequence_id: $sequence_id
            type_of_group_name: $type_of_group_name
            type_of_group_id: $type_of_group_id
            group_or_class_id: $group_or_class_id
            lang: $lang
          )
        }
      `,
      variables: {
        is_registered_table: true,
        scholar_season_id,
        program_id,
        user_type_ids,
        sequence_id,
        type_of_group_name,
        type_of_group_id,
        group_or_class_id,
        lang: this.translate.currentLang,
      },
    });
  }

  createPDFTrombinoscopeAll(
    scholar_season_id,
    program_id,
    user_type_ids?,
    school_ids?,
    campus_ids?,
    level_ids?,
    sector_ids?,
    specialities?,
  ) {
    return this.apollo.mutate({
      mutation: gql`
        mutation CreatePDFTrombinoscope(
          $is_registered_table: Boolean
          $scholar_season_id: ID
          $program_id: ID
          $user_type_ids: [ID]
          $school_ids: [ID]
          $campus_ids: [ID]
          $level_ids: [ID]
          $sector_ids: [ID]
          $specialities: [String]
          $lang: String
        ) {
          CreatePDFTrombinoscope(
            is_registered_table: $is_registered_table
            scholar_season_id: $scholar_season_id
            program_id: $program_id
            user_type_ids: $user_type_ids
            school_ids: $school_ids
            campus_ids: $campus_ids
            level_ids: $level_ids
            sector_ids: $sector_ids
            specialities: $specialities
            lang: $lang
          )
        }
      `,
      variables: {
        is_registered_table: true,
        scholar_season_id,
        program_id,
        user_type_ids,
        school_ids,
        campus_ids,
        level_ids,
        sector_ids,
        specialities,
        lang: this.translate.currentLang,
      },
    });
  }
  getOneCandidateTag(_id): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetOneCandidate($_id: ID!) {
            GetOneCandidate(_id: $_id) {
              _id
              civility
              first_name
              last_name
              tag_ids {
                _id
                name
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['GetOneCandidate']));
  }
  getAllTags(): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllTags {
            GetAllTags {
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllTags']));
  }
  createTag(tag_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateTag($tag_input: TagInput!) {
            CreateTag(tag_input: $tag_input) {
              _id
              name
            }
          }
        `,
        variables: {
          tag_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateTag']));
  }
  updateCandidateTag(_id, candidate_input, is_save_identity_student?): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateCandidate($_id: ID!, $candidate_input: CandidateInput!, $lang: String, $is_save_identity_student: Boolean) {
            UpdateCandidate(
              _id: $_id
              candidate_input: $candidate_input
              lang: $lang
              is_save_identity_student: $is_save_identity_student
            ) {
              _id
            }
          }
        `,
        variables: {
          _id,
          candidate_input,
          is_save_identity_student,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['UpdateCandidate']));
  }
  modifyCandidatesTag(user_type_ids, filter, tag_ids, remove_tag, add_tag): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ModifyCandidatesTag(
            $user_type_ids: [ID]
            $filter: CandidateFilterInput
            $tag_ids: [ID]
            $remove_tag: Boolean
            $add_tag: Boolean
          ) {
            ModifyCandidatesTag(
              user_type_ids: $user_type_ids
              filter: $filter
              tag_ids: $tag_ids
              remove_tag: $remove_tag
              add_tag: $add_tag
            )
          }
        `,
        variables: {
          user_type_ids,
          filter,
          tag_ids,
          remove_tag,
          add_tag,
        },
      })
      .pipe(map((resp) => resp.data['ModifyCandidatesTag']));
  }
  updateCandidate(_id, candidate_input, is_save_identity_student?): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateCandidate($_id: ID!, $candidate_input: CandidateInput!, $lang: String, $is_save_identity_student: Boolean) {
            UpdateCandidate(
              _id: $_id
              candidate_input: $candidate_input
              lang: $lang
              is_save_identity_student: $is_save_identity_student
            ) {
              _id
            }
          }
        `,
        variables: {
          _id,
          candidate_input,
          is_save_identity_student,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['UpdateCandidate']));
  }
  validateOrRejectAcadDocument(payload, sender_user_type_ids?, sender_user_id?): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ValidateOrRejectAcadDocument(
            $acad_doc_id: ID!
            $validation_status: EnumValidationStatus
            $reason: String
            $sender_user_type_ids: [ID]
            $sender_user_id: ID
            $lang: String
          ) {
            ValidateOrRejectAcadDocument(
              acad_doc_id: $acad_doc_id
              validation_status: $validation_status
              reason: $reason
              sender_user_type_ids: $sender_user_type_ids
              sender_user_id: $sender_user_id
              lang: $lang
            ) {
              _id
            }
          }
        `,
        variables: {
          lang: this.translate?.currentLang ? this.translate.currentLang : 'fr',
          acad_doc_id: payload?._id,
          validation_status: payload?.validationStatus,
          reason: payload?.reason,
          sender_user_type_ids,
          sender_user_id,
        },
      })
      .pipe(map((resp) => resp.data['ValidateOrRejectAcadDocument']));
  }

  sendReminderVisaDocument(payload, filter?): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SendReminderVisaDocument($lang: String, $filter: CandidateFilterInput, $userTypeIds: [ID]) {
            SendReminderVisaDocument(lang: $lang, filter: $filter, user_type_ids: $userTypeIds)
          }
        `,
        variables: {
          lang: this.translate?.currentLang ? this.translate.currentLang : 'fr',
          filter,
          userTypeIds: payload,
        },
      })
      .pipe(map((resp) => resp.data['SendReminderVisaDocument']));
  }
}
