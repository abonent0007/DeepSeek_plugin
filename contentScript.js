// contentScript.js
(function () {
  'use strict';
  
  // Настройки (предполагаем, что максимальный контекст ~128k токенов)
  const MAX_TOKENS = 128000;
  // Коэффициент приблизительного перевода символов в токены (для русского/английского ~1 токен = 4 символа)
  const CHARS_PER_TOKEN = 4;
  
  // Функция для создания и обновления индикатора
  function updateTokenIndicator() {
    // Находим все элементы с сообщениями (селектор может потребовать уточнения)
    const messageElements = document.querySelectorAll('.message');
    // Ищем именно наш индикатор на странице
    let indicator = document.getElementById('deepseek-token-indicator');
    
    // Если индикатора еще нет, создаем его
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'deepseek-token-indicator';
      indicator.style.position = 'fixed';
      indicator.style.top = '10px';
      indicator.style.right = '10px';
      indicator.style.zIndex = '10000';
      indicator.style.padding = '8px 12px';
      indicator.style.backgroundColor = '#333';
      indicator.style.color = 'white';
      indicator.style.borderRadius = '8px';
      indicator.style.fontSize = '12px';
      indicator.style.fontWeight = 'bold';
      document.body.appendChild(indicator);
    }
    
    // Считаем общее количество символов во всех сообщениях
    let totalChars = 0;
    messageElements.forEach(el => {
      totalChars += el.textContent.length;
    });
    
    // Переводим символы в приблизительное количество токенов
    const usedTokens = Math.round(totalChars / CHARS_PER_TOKEN);
    const remainingTokens = MAX_TOKENS - usedTokens;
    const percentage = (remainingTokens / MAX_TOKENS) * 100;
    
    // Определяем цвет полоски
    let color;
    if (percentage > 50) {
      color = '#4CAF50'; // Зеленый
    } else if (percentage > 20) {
      color = '#FF9800'; // Оранжевый
    } else {
      color = '#F44336'; // Красный
    }
    
    // Обновляем текст и цвет индикатора
    indicator.innerHTML = `
      <div style="margin-bottom: 4px;">Токены: ${remainingTokens.toLocaleString()} / ${MAX_TOKENS.toLocaleString()}</div>
      <div style="width: 100px; height: 8px; background: #555; border-radius: 4px; overflow: hidden;">
        <div style="width: ${percentage}%; height: 100%; background: ${color}; transition: width 0.3s;"></div>
      </div>
    `;
  }
  
  // Создаем наблюдатель за изменениями DOM, чтобы обновлять индикатор при новых сообщениях
  const observer = new MutationObserver(updateTokenIndicator);
  
  // Запускаем наблюдение за всем документом с дочерними элементами и изменениями текста
  observer.observe(document.body, { 
    childList: true, 
    subtree: true,
    characterData: true 
  });
  
  // Первоначальное создание индикатора
  updateTokenIndicator();
})();
