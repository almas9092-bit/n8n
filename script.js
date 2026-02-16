// ========================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ========================================

let selectedFile = null;

// ========================================
// ЭЛЕМЕНТЫ DOM
// ========================================

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const selectFileBtn = document.getElementById('selectFileBtn');
const removeFileBtn = document.getElementById('removeFileBtn');
const fileSelected = document.getElementById('fileSelected');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const submitBtn = document.getElementById('submitBtn');
const statusSection = document.getElementById('statusSection');
const statusLoading = document.getElementById('statusLoading');
const statusError = document.getElementById('statusError');
const statusSuccess = document.getElementById('statusSuccess');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const folderLink = document.getElementById('folderLink');

// ========================================
// ОБРАБОТЧИКИ DRAG & DROP
// ========================================

// Предотвращаем открытие файла в браузере
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Подсветка зоны при перетаскивании
['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.add('drag-over');
    });
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.remove('drag-over');
    });
});

// Обработка Drop
dropZone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelect(files[0]);
    }
});

// ========================================
// ОБРАБОТЧИКИ КНОПОК
// ========================================

// Клик по зоне загрузки
dropZone.addEventListener('click', () => {
    fileInput.click();
});

// Клик по кнопке "Выбрать файл"
selectFileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
});

// Выбор файла через input
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
    }
});

// Удаление файла
removeFileBtn.addEventListener('click', () => {
    clearFile();
});

// Отправка формы
submitBtn.addEventListener('click', () => {
    handleSubmit();
});

// ========================================
// ФУНКЦИИ РАБОТЫ С ФАЙЛАМИ
// ========================================

/**
 * Обработка выбранного файла
 * @param {File} file - Выбранный файл
 */
function handleFileSelect(file) {
    // Валидация формата файла
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
        showError('Допустимы только .xlsx или .xls файлы');
        return;
    }

    // Валидация размера файла (10 МБ)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        showError('Файл не должен превышать 10 МБ');
        return;
    }

    // Сохраняем файл
    selectedFile = file;

    // Показываем информацию о файле
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);

    // Переключаем UI
    dropZone.style.display = 'none';
    fileSelected.style.display = 'flex';
    submitBtn.disabled = false;

    // Скрываем статус
    hideAllStatus();
}

/**
 * Очистка выбранного файла
 */
function clearFile() {
    selectedFile = null;
    fileInput.value = '';

    // Переключаем UI
    dropZone.style.display = 'block';
    fileSelected.style.display = 'none';
    submitBtn.disabled = true;

    // Скрываем статус
    hideAllStatus();
}

/**
 * Форматирование размера файла
 * @param {number} bytes - Размер в байтах
 * @returns {string} - Форматированный размер
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Байт';

    const k = 1024;
    const sizes = ['Байт', 'КБ', 'МБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ========================================
// ОТПРАВКА ДАННЫХ
// ========================================

/**
 * Обработка отправки формы
 */
async function handleSubmit() {
    // Проверка наличия файла
    if (!selectedFile) {
        showError('Пожалуйста, выберите файл');
        return;
    }

    // Получаем выбранный тип претензии
    const claimType = document.querySelector('input[name="claimType"]:checked').value;

    // Показываем статус загрузки
    showLoading();

    // Отключаем кнопку
    submitBtn.disabled = true;

    try {
        // Создаем FormData
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('claimType', claimType);
        formData.append('apiToken', CONFIG.API_TOKEN);

        // Отправляем запрос
        const response = await fetch(CONFIG.WEBHOOK_URL, {
            method: 'POST',
            body: formData
        });

        // Проверяем статус ответа
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        // Парсим JSON ответ
        const result = await response.json();

        // Обрабатываем ответ
        if (result.success) {
            showSuccess(result);
        } else {
            showError(result.message || 'Произошла неизвестная ошибка');
        }

    } catch (error) {
        console.error('Ошибка при отправке:', error);
        showError('Не удалось отправить файл. Проверьте подключение к интернету и попробуйте снова.');
    } finally {
        // Включаем кнопку
        submitBtn.disabled = false;
    }
}

// ========================================
// ФУНКЦИИ УПРАВЛЕНИЯ СТАТУСОМ
// ========================================

/**
 * Скрыть все блоки статуса
 */
function hideAllStatus() {
    statusSection.style.display = 'none';
    statusLoading.style.display = 'none';
    statusError.style.display = 'none';
    statusSuccess.style.display = 'none';
}

/**
 * Показать статус загрузки
 */
function showLoading() {
    hideAllStatus();
    statusSection.style.display = 'block';
    statusLoading.style.display = 'block';
}

/**
 * Показать ошибку
 * @param {string} message - Текст ошибки
 */
function showError(message) {
    hideAllStatus();
    statusSection.style.display = 'block';
    statusError.style.display = 'block';
    errorMessage.textContent = message;

    // Автоматически скрыть через 10 секунд
    setTimeout(() => {
        hideAllStatus();
    }, 10000);
}

/**
 * Показать успех
 * @param {Object} result - Результат от сервера
 */
function showSuccess(result) {
    hideAllStatus();
    statusSection.style.display = 'block';
    statusSuccess.style.display = 'block';

    // Формируем сообщение
    const message = `Готово! Успешно создано ${result.documentsCount} ${getDocumentWord(result.documentsCount)}.`;
    successMessage.textContent = message;

    // Устанавливаем ссылку на папку
    folderLink.href = result.folderUrl;

    // Очищаем форму для новой загрузки
    setTimeout(() => {
        clearFile();
    }, 1000);
}

/**
 * Склонение слова "документ"
 * @param {number} count - Количество документов
 * @returns {string} - Правильная форма слова
 */
function getDocumentWord(count) {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return 'документов';
    }

    if (lastDigit === 1) {
        return 'документ';
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
        return 'документа';
    }

    return 'документов';
}

// ========================================
// ИНИЦИАЛИЗАЦИЯ
// ========================================

// Проверяем наличие конфигурации
if (typeof CONFIG === 'undefined') {
    console.error('ОШИБКА: Не найден файл config.js или не определен объект CONFIG');
    showError('Ошибка конфигурации. Обратитесь к администратору.');
}

// Проверяем наличие необходимых параметров
if (CONFIG && (!CONFIG.WEBHOOK_URL || !CONFIG.API_TOKEN)) {
    console.error('ОШИБКА: В config.js не указаны WEBHOOK_URL или API_TOKEN');
    showError('Ошибка конфигурации. Обратитесь к администратору.');
}

console.log('Генератор досудебных претензий загружен успешно');
