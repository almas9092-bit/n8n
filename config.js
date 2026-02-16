// ========================================
// КОНФИГУРАЦИЯ ПРИЛОЖЕНИЯ
// ========================================

/**
 * ВАЖНО: После деплоя n8n workflow необходимо:
 * 1. Получить URL вашего webhook в n8n
 * 2. Заменить значение WEBHOOK_URL ниже
 * 3. Установить свой секретный токен в API_TOKEN
 * 4. Убедиться, что тот же токен указан в n8n workflow
 */

const CONFIG = {
    /**
     * URL webhook из n8n
     * Формат: https://your-n8n-instance.com/webhook/generate-claims
     *
     * Как получить:
     * 1. Откройте ваш workflow в n8n
     * 2. Нажмите на узел "Webhook"
     * 3. Скопируйте "Production URL" или "Test URL"
     */
    WEBHOOK_URL: "https://your-n8n.com/webhook/generate-claims",

    /**
     * Секретный токен для аутентификации
     * Используйте длинную случайную строку
     *
     * ВАЖНО: Тот же токен должен быть указан в n8n workflow
     * в переменной SECRET_TOKEN
     *
     * Пример генерации токена:
     * - Онлайн: https://www.uuidgenerator.net/
     * - Командная строка: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     */
    API_TOKEN: "your-secret-token-here"
};

// Экспортируем для использования в script.js
// (не требуется при подключении через <script>, но полезно для документации)
