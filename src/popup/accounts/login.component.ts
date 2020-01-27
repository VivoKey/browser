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
import BrowserPlatformUtilsService from 'src/services/browserPlatformUtils.service';
import { DeviceType } from 'jslib/enums';

@Component({
    selector: 'app-login',
    templateUrl: 'login.component.html',
})
export class LoginComponent extends BaseLoginComponent {
    private vkdata: any;
    private userinfo: any;
    private returnurl: string;
    private devtype: DeviceType;
    private exttype: number;
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
            this.userinfo = null;
            super.submit();
        }
    }

    async vkredir() {
        var redir = browser.identity.getRedirectURL();
        console.log(redir);
        if (this.platformUtilsService.isChrome()) {
            var redirin = "https://bitwarden.vivokey.com:8081/bwauth/webapi/redirectin?state=login&app_type=chrome";
        } else if (this.platformUtilsService.isFirefox()) {
            var redirin = "https://bitwarden.vivokey.com:8081/bwauth/webapi/redirectin?state=login&app_type=firefox";
        }
        var self = this;
        chrome.identity.launchWebAuthFlow({
            url: redirin,
            interactive: true
        }, function (redirect_url: string) {
            console.log(redirect_url);
            self.returnurl = redirect_url;

            var hash = decodeURIComponent(self.returnurl);
            const questionMarkPosition = hash.indexOf('?');
            if (questionMarkPosition > -1) {
                hash = hash.slice(questionMarkPosition + 1);
            } else {
                hash = hash.slice(1);
            }
            console.log(hash);
            self.vkdata = self.parseQueryString(hash);
            self.submit();
            });
    }


    public parseQueryString(queryString: string): object {
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
