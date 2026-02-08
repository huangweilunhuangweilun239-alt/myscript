// ==UserScript==
// @name         Poki 零廣告 + 強制獎勵 (修復黑屏版 2026)
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  poki.com 盡量不觸發反偵測 + 強制 rewarded
// @author       baiyan
// @match        https://poki.com/*
// @match        https://poki.com/zh*
// @match        https://minefun.io/*
// @match        https://poki.com/zh/g/combat-online
// @match        https://swordmasters.io/*
// @grant        none
// @run-at       document-start
// ==/UserScript==
 
(function() {
    'use strict';
 
    // 只藏特定廣告容器，避開遊戲 canvas
    const adStyle = document.createElement('style');
    adStyle.textContent = `
        [class*="ad-"], [class*="Ad-"], [id*="ad-"], [id*="Ad-"],
        .poki-ad, .poki-gpt-ad, .commercial-break, .rewarded-ad,
        .ad-container, .advertisement, [data-poki-ad],
        iframe[src*="doubleclick"], iframe[src*="ads"], iframe[src*="adserver"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }
    `;
    (document.head || document.documentElement).appendChild(adStyle);
 
    // 等 SDK 出現再動手，改用 defineProperty 覆寫（比較隱蔽）
    function tryHook() {
        if (!window.PokiSDK) {
            setTimeout(tryHook, 80);
            return;
        }
 
        console.log('[PokiFix] PokiSDK 出現，開始低調 hook');
 
        // 備份原始
        const sdk = window.PokiSDK;
 
        // 只覆寫關鍵方法，不用 Proxy 整個物件
        const originalCommercial = sdk.commercialBreak;
        const originalRewarded   = sdk.rewardedBreak;
        const originalAdsBlocked = sdk.adsBlocked;
 
        Object.defineProperties(sdk, {
            commercialBreak: {
                value: function(callback) {
                    if (typeof callback === 'function') callback();
                    console.log('[PokiFix] commercialBreak → 直接跳過');
                    return Promise.resolve();
                },
                writable: true
            },
            rewardedBreak: {
                value: function(callback) {
                    if (typeof callback === 'function') callback();
                    console.log('[PokiFix] rewardedBreak → 強制成功');
                    return Promise.resolve(true);
                },
                writable: true
            },
            adsBlocked: {
                value: function() {
                    return false;
                },
                writable: true
            }
        });
 
        // 防止有人重新覆寫回去（某些遊戲會檢查）
        const protect = () => {
            if (window.PokiSDK !== sdk) {
                console.warn('[PokiFix] 有人改了 PokiSDK，重新保護');
                window.PokiSDK = sdk;
            }
            if (sdk.adsBlocked.toString().includes('true')) {
                console.warn('[PokiFix] adsBlocked 被改回，強制修正');
                sdk.adsBlocked = () => false;
            }
        };
        setInterval(protect, 1500);
 
        console.log('[PokiFix] hook 完成，低偵測模式');
    }
 
    // 啟動
    tryHook();
 
    // 額外保險：如果 8 秒後還沒 hook 到，就再試一次
    setTimeout(tryHook, 8000);
})();
