// ==UserScript==
// @name         Poki 零廣告 + 強制獎勵 (最終版 2025)
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  poki.com 零廣告 + 強制拿獎勵（偽裝adsBlocked false）
// @author       baiyan
// @match        https://poki.com/*
// @match        https://poki.com/zh*
// @match        https://minefun.io/*
// @match        https://swordmasters.io/*
// @grant        none
// @run-at       document-start
// ==/UserScript==
 
(function() {
    'use strict';
 
    // 隱藏廣告元素
    const adStyle = document.createElement('style');
    adStyle.textContent = `
        iframe[src*="ads"], iframe[src*="ad"], 
        div[class*="ad"], div[id*="ad"], div[class*="Ad"], 
        .poki-ad, .commercial-break, .ad-container, 
        .advertisement, .poki-gpt-ad, [data-poki-ad],
        .ad-break, .rewarded-ad, #poki-ads,
        .interstitial, .overlay-ad, .banner-ad {
            display: none !important;
        }
    `;
    (document.head || document.documentElement).appendChild(adStyle);
 
    // 延遲hook，等PokiSDK載入後再偽裝
    const hookSDK = () => {
        if (!window.PokiSDK) return setTimeout(hookSDK, 100);
 
        const originalSDK = window.PokiSDK;
 
        window.PokiSDK = new Proxy(originalSDK, {
            get: function(target, prop) {
                if (prop === 'rewardedBreak') {
                    return function(preCallback) {
                        if (typeof preCallback === 'function') preCallback();
                        console.log('強制獎勵：直接成功！');
                        return Promise.resolve(true);
                    };
                }
                if (prop === 'commercialBreak') {
                    return function(preCallback) {
                        if (typeof preCallback === 'function') preCallback();
                        return Promise.resolve();
                    };
                }
                if (prop === 'adsBlocked') {
                    return () => false;  // 偽裝沒有屏蔽廣告
                }
                return target[prop];
            }
        });
 
        console.log('PokiSDK 已成功hook + 偽裝無廣告屏蔽！');
    };
 
    hookSDK();
})();
