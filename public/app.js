// 全局状态
const state = {
    cards: [],
    currentPage: 1,
    cardsPerPage: 2,
    prefsVersion: 'v2-provider-list',
    providerOptions: [],
    providerForm: {
        provider: 'openai',
        model: '',
        baseURL: '',
        apiKey: ''
    }
};

// DOM元素
const elements = {
    inputPage: document.getElementById('inputPage'),
    previewPage: document.getElementById('previewPage'),
    materialInput: document.getElementById('materialInput'),
    cardCount: document.getElementById('cardCount'),
    generateBtn: document.getElementById('generateBtn'),
    exportBtn: document.getElementById('exportBtn'),
    backBtn: document.getElementById('backBtn'),
    cardsContainer: document.getElementById('cardsContainer'),
    pagination: document.getElementById('pagination'),
    statusText: document.getElementById('statusText'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    providerSelect: document.getElementById('providerSelect'),
    modelSelect: document.getElementById('modelSelect'),
    baseUrlInput: document.getElementById('baseUrlInput'),
    apiKeyInput: document.getElementById('apiKeyInput'),
    providerStatus: document.getElementById('providerStatus')
};

// 初始化事件监听
async function init() {
    elements.generateBtn.addEventListener('click', handleGenerate);
    elements.exportBtn.addEventListener('click', handleExport);
    elements.backBtn.addEventListener('click', handleBack);
    elements.materialInput.addEventListener('input', updateCharCount);
    window.addEventListener('languageChanged', updateCharCount);

    elements.providerSelect.addEventListener('change', handleProviderChange);
    elements.modelSelect.addEventListener('change', handleModelSelect);
    elements.baseUrlInput.addEventListener('change', handleBaseUrlInput);
    elements.apiKeyInput.addEventListener('input', handleApiKeyInput);

    updateCharCount();
    await loadProviderOptions();
}

function getProviderMeta(id) {
    return state.providerOptions.find(p => p.id === id);
}

function saveProviderPrefs() {
    const { provider, model, baseURL } = state.providerForm;
    localStorage.setItem('providerPrefs', JSON.stringify({
        version: state.prefsVersion,
        provider,
        model,
        baseURL
    }));
}

function hydrateProviderForm() {
    const meta = getProviderMeta(state.providerForm.provider);
    const fallbackModel = meta?.defaultModel || 'gpt-4o-mini';
    const fallbackBase = meta?.defaultBaseURL || '';

    elements.providerSelect.innerHTML = state.providerOptions.map(option => `
        <option value="${option.id}">
            ${option.name}
        </option>
    `).join('');
    elements.providerSelect.value = state.providerForm.provider;

    // 更新模型选项
    const modelOptions = meta?.models || [];
    elements.modelSelect.innerHTML = modelOptions.map(model => `
        <option value="${model}">${model}</option>
    `).join('');
    elements.modelSelect.value = modelOptions.includes(state.providerForm.model)
        ? state.providerForm.model
        : (modelOptions[0] || fallbackModel);
    state.providerForm.model = elements.modelSelect.value;
    elements.baseUrlInput.value = state.providerForm.baseURL || fallbackBase;
    elements.apiKeyInput.value = state.providerForm.apiKey || '';

    elements.providerStatus.textContent = i18n.t('provider.manualKey') || '请手动输入 API Key（仅用于本次请求，不会保存）';
}

async function loadProviderOptions() {
    try {
        const response = await fetch('/api/providers');
        const data = await response.json();
        state.providerOptions = data.providers || [];

        const saved = JSON.parse(localStorage.getItem('providerPrefs') || '{}');
        const validSaved = saved.version === state.prefsVersion ? saved : {};
        const defaultProvider = saved.provider || data.defaultProvider || state.providerOptions[0]?.id || 'openai';
        state.providerForm.provider = defaultProvider;
        state.providerForm.model = validSaved.model || getProviderMeta(defaultProvider)?.defaultModel || '';
        state.providerForm.baseURL = validSaved.baseURL || getProviderMeta(defaultProvider)?.defaultBaseURL || '';
        state.providerForm.apiKey = '';

        hydrateProviderForm();
    } catch (error) {
        console.error('加载模型配置失败:', error);
    }
}

function handleProviderChange(event) {
    const newProvider = event.target.value;
    const meta = getProviderMeta(newProvider);
    state.providerForm.provider = newProvider;
    state.providerForm.model = meta?.defaultModel || '';
    state.providerForm.baseURL = meta?.defaultBaseURL || '';
    state.providerForm.apiKey = '';
    hydrateProviderForm();
    saveProviderPrefs();
}

function handleModelSelect(event) {
    state.providerForm.model = event.target.value;
    saveProviderPrefs();
}

function handleBaseUrlInput(event) {
    state.providerForm.baseURL = event.target.value.trim();
    saveProviderPrefs();
}

function handleApiKeyInput(event) {
    state.providerForm.apiKey = event.target.value.trim();
}

// 获取当前语言的文本长度限制
function getTextLimits() {
    const currentLang = i18n.currentLang || 'zh';
    if (currentLang.startsWith('en')) {
        return {
            max: 6000,
            warning: 4800
        };
    }
    return {
        max: 4000,
        warning: 3200
    };
}

// 更新字符计数
function updateCharCount() {
    const charCountElement = document.getElementById('charCount');
    const charCountLimitElement = document.getElementById('charLimit');
    const charCounterElement = document.querySelector('.char-counter');
    const length = elements.materialInput.value.length;
    const limits = getTextLimits();

    charCountElement.textContent = length;
    charCountLimitElement.textContent = limits.max;

    if (length > limits.max) {
        charCounterElement.classList.add('error');
        charCounterElement.classList.remove('warning');
    } else if (length > limits.warning) {
        charCounterElement.classList.add('warning');
        charCounterElement.classList.remove('error');
    } else {
        charCounterElement.classList.remove('warning', 'error');
    }
}

function showLoading(show = true) {
    if (show) {
        elements.loadingOverlay.classList.add('active');
    } else {
        elements.loadingOverlay.classList.remove('active');
    }
}

function switchPage(page) {
    if (page === 'input') {
        elements.inputPage.classList.add('active');
        elements.previewPage.classList.remove('active');
    } else if (page === 'preview') {
        elements.inputPage.classList.remove('active');
        elements.previewPage.classList.add('active');
    }
}

async function handleGenerate() {
    const materialText = elements.materialInput.value.trim();
    const cardCount = parseInt(elements.cardCount.value, 10);

    if (!materialText) {
        notify.warning('请先输入学习材料内容', '提示');
        return;
    }

    const limits = getTextLimits();
    if (materialText.length > limits.max) {
        const message = i18n.currentLang.startsWith('en')
            ? `Text too long! Current: ${materialText.length} characters. Please limit to ${limits.max} characters.`
            : `内容太长了！当前 ${materialText.length} 字，请精简到 ${limits.max} 字以内`;
        const title = i18n.currentLang.startsWith('en') ? 'Content Exceeded' : '内容过多';
        notify.warning(message, title);
        return;
    }

    if (Number.isNaN(cardCount) || cardCount < 1 || cardCount > 20) {
        notify.warning('卡片数量应在 1-20 张之间', '数量范围');
        return;
    }

    try {
        showLoading(true);

        const payload = {
            material: materialText,
            cardCount,
            language: i18n.currentLang,
            provider: state.providerForm.provider,
            model: state.providerForm.model,
            baseURL: state.providerForm.baseURL,
            apiKey: state.providerForm.apiKey || undefined,
            demoMode: window.event?.shiftKey || false
        };

        const response = await fetch('/api/generate-cards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || '生成卡片失败');
        }

        if (!data.cards || data.cards.length === 0) {
            throw new Error('未能生成卡片，请重试');
        }

        state.cards = data.cards.map((card, index) => ({
            id: index,
            front: card.front || '',
            back: card.back || '',
            type: card.type || 'basic_qa',
            tags: card.tags || [],
            editing: false
        }));

        state.currentPage = 1;
        switchPage('preview');
        const providerLabel = getProviderMeta(data.provider || state.providerForm.provider)?.name || data.provider || '';
        elements.statusText.textContent = providerLabel ? `卡片生成成功 · ${providerLabel}` : '卡片生成成功';
        elements.exportBtn.disabled = false;
        renderCards();
    } catch (error) {
        console.error('生成卡片错误:', error);
        notify.error(error.message || '生成卡片时遇到了问题，请稍后重试', '生成失败');
    } finally {
        showLoading(false);
    }
}

function renderCards() {
    const startIndex = (state.currentPage - 1) * state.cardsPerPage;
    const endIndex = startIndex + state.cardsPerPage;
    const currentCards = state.cards.slice(startIndex, endIndex);

    elements.cardsContainer.innerHTML = currentCards.map(card => `
        <div class="card-item" data-card-id="${card.id}">
            <div class="card-field">
                <div class="card-field-header">
                    <label>正面：</label>
                    <div class="card-actions">
                        <button class="edit-btn" onclick="toggleEdit(${card.id}, 'front')">
                            ${card.editing === 'front' ? '取消' : '编辑'}
                        </button>
                        ${card.editing === 'front'
            ? `<button class="save-btn" onclick="saveCard(${card.id}, 'front')">保存</button>`
            : ''}
                    </div>
                </div>
                <textarea 
                    class="card-content" 
                    id="front-${card.id}"
                    ${card.editing === 'front' ? '' : 'readonly'}
                >${card.front}</textarea>
            </div>
            
            <div class="card-field">
                <div class="card-field-header">
                    <label>背面：</label>
                    <div class="card-actions">
                        <button class="edit-btn" onclick="toggleEdit(${card.id}, 'back')">
                            ${card.editing === 'back' ? '取消' : '编辑'}
                        </button>
                        ${card.editing === 'back'
            ? `<button class="save-btn" onclick="saveCard(${card.id}, 'back')">保存</button>`
            : ''}
                    </div>
                </div>
                <textarea 
                    class="card-content" 
                    id="back-${card.id}"
                    ${card.editing === 'back' ? '' : 'readonly'}
                >${card.back}</textarea>
            </div>
        </div>
    `).join('');

    renderPagination();
}

function renderPagination() {
    const totalPages = Math.ceil(state.cards.length / state.cardsPerPage);

    if (totalPages <= 1) {
        elements.pagination.innerHTML = '';
        return;
    }

    const pages = [];
    pages.push('<span class="pagination-text">第</span>');

    for (let i = 1; i <= totalPages; i++) {
        pages.push(`
            <button 
                class="pagination-number ${i === state.currentPage ? 'active' : ''}"
                onclick="changePage(${i})"
            >
                ${i}
            </button>
        `);
    }

    pages.push('<span class="pagination-text">页</span>');

    elements.pagination.innerHTML = pages.join('');
}

function toggleEdit(cardId, field) {
    const card = state.cards.find(c => c.id === cardId);
    if (!card) return;

    if (card.editing === field) {
        card.editing = false;
    } else {
        card.editing = field;
    }

    renderCards();
}

function saveCard(cardId, field) {
    const card = state.cards.find(c => c.id === cardId);
    if (!card) return;

    const textarea = document.getElementById(`${field}-${cardId}`);
    if (textarea) {
        card[field] = textarea.value;
        card.editing = false;
        renderCards();
    }
}

function changePage(page) {
    state.currentPage = page;
    renderCards();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function handleExport() {
    if (state.cards.length === 0) {
        notify.warning('还没有生成卡片哦，先去制作一些卡片吧！', '无卡片');
        return;
    }

    try {
        showLoading(true);

        const response = await fetch('/api/export-apkg', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cards: state.cards })
        });

        if (!response.ok) {
            throw new Error('导出失败');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `anki-cards-${Date.now()}.apkg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        notify.success(`已成功导出 ${state.cards.length} 张卡片！`, '导出成功');
    } catch (error) {
        console.error('导出错误:', error);
        notify.error('导出卡片时出现问题，请重试', '导出失败');
    } finally {
        showLoading(false);
    }
}

function handleBack() {
    switchPage('input');
    state.cards = [];
    state.currentPage = 1;
    elements.exportBtn.disabled = true;
}

window.toggleEdit = toggleEdit;
window.saveCard = saveCard;
window.changePage = changePage;

document.addEventListener('DOMContentLoaded', init);
