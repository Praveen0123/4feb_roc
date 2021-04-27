import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { interestInputForm } from '@app/core/models/interest-page-input-form/interest-page-input-form';


@Injectable({
  providedIn: 'root'
})
export class InterestPageInputFormService
{

  apiKey = 'qrSTy1k90xg2Ay7a';

  apiUrl: string = "https://vantagepointinc.secure.force.com/vpapi/services/apexrest/roc/interest-form";
  constructor(private http: HttpClient) { }

  postinterestInput(myFormData: interestInputForm)
  {
    let headers = new HttpHeaders({ 'AuthorizationToken': this.apiKey });

    headers.append('Content-Type', 'application/json');
    return this.http.post(this.apiUrl, myFormData, { headers: headers });
  }



}
