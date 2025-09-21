// contentScript.js
(function() {
    'use strict';
    
    const MAX_TOKENS = 128000;
    const CHARS_PER_TOKEN = 4;
    let lastCharCount = 0;
    let correctionFactor = 1;

    // Загружаем коэффициент коррекции из хранилища
    chrome.storage.local.get(['correctionFactor'], function(result) {
        if (result.correctionFactor) {
            correctionFactor = result.correctionFactor;
            console.log('Загружен коэффициент коррекции:', correctionFactor);
        }
    });

    // Функция обновления индикатора
    function updateTokenIndicator() {
        const chatContainer = document.querySelector('[class*="chat"]') || document.body;
        const textNodes = chatContainer.querySelectorAll('p, div, span');
        let totalChars = 0;
        
        textNodes.forEach(node => {
            if (node.offsetParent !== null && node.textContent.length > 5) {
                totalChars += node.textContent.length;
            }
        });
        
        if (Math.abs(totalChars - lastCharCount) < 1000) return;
        lastCharCount = totalChars;
        
        // Применяем коэффициент коррекции
        const correctedChars = totalChars * correctionFactor;
        const usedTokens = Math.round(correctedChars / CHARS_PER_TOKEN);
        const remainingTokens = Math.max(0, MAX_TOKENS - usedTokens);
        const percentage = (remainingTokens / MAX_TOKENS) * 100;
        
        let color = '#4CAF50';
        if (percentage < 20) color = '#F44336';
        else if (percentage < 50) color = '#FF9800';
        
        let indicator = document.getElementById('deepseek-token-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'deepseek-token-indicator';
            indicator.style.cssText = `
                position: fixed; top: 10px; right: 10px; z-index: 10000;
                padding: 8px 12px; background: #333; color: white;
                border-radius: 8px; font-size: 12px; font-weight: bold;
                border: 1px solid #666; cursor: pointer;
            `;
            indicator.title = "Кликните для деталей";
            indicator.addEventListener('click', showTokenDetails);
            document.body.appendChild(indicator);
        }
        
        indicator.innerHTML = `
            <div style="margin-bottom: 4px;">Токены: ${remainingTokens}/${MAX_TOKENS}</div>
            <div style="width: 100px; height: 8px; background: #555; border-radius: 4px;">
                <div style="width: ${percentage}%; height: 100%; background: ${color};"></div>
            </div>
        `;
    }

    // Показ деталей по клику
    function showTokenDetails() {
        alert(`Коэффициент коррекции: ${correctionFactor.toFixed(2)}\nСимволов: ${lastCharCount}`);
    }

    // Обработчик сообщений от popup
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === "calibrate") {
            // Рассчитываем новый коэффициент коррекции
            const actualTokens = MAX_TOKENS; // Фактический лимит
            const estimatedTokens = Math.round(lastCharCount / CHARS_PER_TOKEN);
            correctionFactor = actualTokens / estimatedTokens;
            
            // Сохраняем в хранилище
            chrome.storage.local.set({correctionFactor: correctionFactor});
            
            alert(`Калибровка завершена!\nНовый коэффициент: ${correctionFactor.toFixed(2)}`);
            updateTokenIndicator();
        }
    });

    // Инициализация
    setTimeout(() => {
        updateTokenIndicator();
        const observer = new MutationObserver(() => {
            setTimeout(updateTokenIndicator, 500);
        });
        
        const chatContainer = document.querySelector('[class*="chat"]') || document.body;
        observer.observe(chatContainer, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }, 2000);
})();
