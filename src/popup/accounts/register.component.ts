import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from 'jslib/abstractions/api.service';
import { AuthService } from 'jslib/abstractions/auth.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PasswordGenerationService } from 'jslib/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StateService } from 'jslib/abstractions/state.service';

import { RegisterComponent as BaseRegisterComponent } from 'jslib/angular/components/register.component';

@Component({
    selector: 'app-register',
    templateUrl: 'register.component.html',
})
export class RegisterComponent extends BaseRegisterComponent {
    private vkdata: any;
    private userinfo: any;
    private returnurl: string;
    constructor(authService: AuthService, router: Router,
        i18nService: I18nService, cryptoService: CryptoService,
        apiService: ApiService, stateService: StateService,
        platformUtilsService: PlatformUtilsService, passwordGenerationService: PasswordGenerationService) {
        super(authService, router, i18nService, cryptoService, apiService, stateService, platformUtilsService,
            passwordGenerationService);
    }

    async submit() {
        this.email = this.userinfo.email;
        this.name = this.userinfo.name;
        this.masterPassword = this.userinfo.passwd;
        this.confirmMasterPassword = this.userinfo.passwd;
        this.supsubmit();
    }
    async ngAfterViewInit() {
        this.vkredir();
    }

    async vkredir() {
        console.log(chrome.identity.getRedirectURL());
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
            self.returnurl = redirect_url;

            var hash = decodeURIComponent(self.returnurl);
            const questionMarkPosition = hash.indexOf('?');
            if (questionMarkPosition > -1) {
                hash = hash.slice(questionMarkPosition + 1);
            } else {
                hash = hash.slice(1);
            }
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
}
