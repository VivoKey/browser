import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { AuthService } from 'jslib/abstractions/auth.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StateService } from 'jslib/abstractions/state.service';
import { StorageService } from 'jslib/abstractions/storage.service';
import { SyncService } from 'jslib/abstractions/sync.service';

import { LoginComponent as BaseLoginComponent } from 'jslib/angular/components/login.component';

@Component({
    selector: 'app-login',
    templateUrl: 'login.component.html',
})
export class LoginComponent extends BaseLoginComponent {
    private vkdata: any;
    private userinfo: any;
    constructor(authService: AuthService, router: Router,
        platformUtilsService: PlatformUtilsService, i18nService: I18nService,
        syncService: SyncService, storageService: StorageService,
        stateService: StateService, private http: HttpClient) {
        super(authService, router, platformUtilsService, i18nService, storageService, stateService);
        console.log("Constructing LoginComponent started.");
        super.onSuccessfulLogin = () => {
            return syncService.fullSync(true);
        };
        super.successRoute = '/tabs/vault';
        console.log("Constructing LoginComponent finished.");
    }

    async submit() {

        if (this.vkdata.code != null) {
            try {
                console.log("Valid code");
                let infotok = await this.http.get<any>("https://bitwarden.vivokey.com:8081/bwauth/webapi/getauth?code=" + this.vkdata.code).toPromise();

                this.userinfo = {
                    'name': infotok.name,
                    'email': infotok.email,
                    'passwd': infotok.passwd
                };
            } catch (err) {
            }
            this.email = this.userinfo.email;
            this.masterPassword = this.userinfo.passwd;
            super.submit();
        }
    }

    async vkredir() {
        console.log("Vkredir triggered.");
        var returnurl: string = await chrome.identity.launchWebAuthFlow({
            url: "https://bitwarden.vivokey.com:8081/bwauth/webapi/redirectin?state=login&app_type=chrome",
            interactive: true
        });
        var hash = decodeURIComponent(returnurl);



        const questionMarkPosition = hash.indexOf('?');

        if (questionMarkPosition > -1) {
            hash = hash.slice(questionMarkPosition + 1);
        } else {
            hash = hash.slice(1);
        }


        this.vkdata = this.parseQueryString(hash);
    }


    private parseQueryString(queryString: string): object {
        const data: any = {};
        let
            pairs,
            pair,
            separatorIndex,
            escapedKey,
            escapedValue,
            key,
            value;

        if (queryString === null) {
            return data;
        }

        pairs = queryString.split('&');

        for (let i = 0; i < pairs.length; i++) {
            pair = pairs[i];
            separatorIndex = pair.indexOf('=');

            if (separatorIndex === -1) {
                escapedKey = pair;
                escapedValue = null;
            } else {
                escapedKey = pair.substr(0, separatorIndex);
                escapedValue = pair.substr(separatorIndex + 1);
            }

            key = decodeURIComponent(escapedKey);
            value = decodeURIComponent(escapedValue);

            if (key.substr(0, 1) === '/') { key = key.substr(1); }

            data[key] = value;
        }

        return data;
    }
    settings() {
        this.router.navigate(['environment']);
    }
}
