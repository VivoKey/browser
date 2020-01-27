import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { CryptoService } from 'jslib/abstractions/crypto.service';
import { EnvironmentService } from 'jslib/abstractions/environment.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { LockService } from 'jslib/abstractions/lock.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StateService } from 'jslib/abstractions/state.service';
import { StorageService } from 'jslib/abstractions/storage.service';
import { UserService } from 'jslib/abstractions/user.service';
import { HttpClient } from '@angular/common/http';

import { LockComponent as BaseLockComponent } from 'jslib/angular/components/lock.component';

@Component({
    selector: 'app-lock',
    templateUrl: 'lock.component.html',
})
export class LockComponent extends BaseLockComponent {
    private vkdata: any;
    private userinfo: any;
    private returnurl: string;
    constructor(router: Router, i18nService: I18nService,
        platformUtilsService: PlatformUtilsService, messagingService: MessagingService,
        userService: UserService, cryptoService: CryptoService,
        storageService: StorageService, lockService: LockService,
        environmentService: EnvironmentService, stateService: StateService, private http: HttpClient) {
        super(router, i18nService, platformUtilsService, messagingService, userService, cryptoService,
            storageService, lockService, environmentService, stateService);
        this.successRoute = '/tabs/current';
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
            this.masterPassword = this.userinfo.passwd;
            this.userinfo = null;
            super.submit();
        }
    }
    async vkredir() {
        var self = this;
        console.log(browser.identity.getRedirectUrl());
        chrome.identity.launchWebAuthFlow({
            url: "https://bitwarden.vivokey.com:8081/bwauth/webapi/redirectin?state=login&app_type=chrome",
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
    async ngOnInit() {
        await super.ngOnInit();
        window.setTimeout(() => {
            document.getElementById(this.pinLock ? 'pin' : 'masterPassword').focus();
        }, 100);
    }
}
