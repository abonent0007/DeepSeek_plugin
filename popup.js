// popup.js
document.addEventListener('DOMContentLoaded', function() {
    // Кнопка калибровки
    document.getElementById('calibrate').addEventListener('click', function() {
        // Отправляем сообщение content-скрипту
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "calibrate"});
        });
    });

    // Кнопка сброса
    document.getElementById('reset').addEventListener('click', function() {
        chrome.storage.local.remove(['correctionFactor'], function() {
            alert('Настройки сброшены!');
        });
    });
});