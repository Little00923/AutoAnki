// 国际化工具
const i18n = {
    // 当前语言
    currentLang: localStorage.getItem('language') || 'en',
    
    // 语言数据
    messages: {
        'zh-CN': null,
        'en-US': null
    },
    
    // 初始化
    async init() {
        // 如果没有保存的语言偏好，根据IP检测
        if (!localStorage.getItem('language')) {
            await this.detectLanguageByIP();
        }
        
        // 加载语言文件
        await this.loadLanguage(this.currentLang);
        
        // 应用翻译
        this.applyTranslations();
        
        // 更新语言选择器
        this.updateLanguageSelector();
    },
    
    // 根据IP检测语言
    async detectLanguageByIP() {
        try {
            const response = await fetch('/api/detect-language');
            const data = await response.json();
            if (data.language) {
                this.currentLang = data.language;
            }
        } catch (error) {
            console.log('IP检测失败，使用默认语言:', error);
            // 默认英文
            this.currentLang = 'en';
        }
    },
    
    // 加载语言文件
    async loadLanguage(lang) {
        const langCode = lang === 'zh' || lang === 'zh-CN' ? 'zh-CN' : 'en-US';
        
        if (this.messages[langCode]) {
            return; // 已加载
        }
        
        try {
            const response = await fetch(`/locales/${langCode}.json`);
            this.messages[langCode] = await response.json();
        } catch (error) {
            console.error('加载语言文件失败:', error);
            // 如果是中文失败，尝试英文
            if (langCode === 'zh-CN') {
                const response = await fetch('/locales/en-US.json');
                this.messages['en-US'] = await response.json();
                this.currentLang = 'en';
            }
        }
    },
    
    // 获取翻译文本
    t(key, params = {}) {
        const langCode = this.currentLang === 'zh' || this.currentLang === 'zh-CN' ? 'zh-CN' : 'en-US';
        const keys = key.split('.');
        let value = this.messages[langCode];
        
        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                return key; // 找不到翻译，返回key
            }
        }
        
        // 替换参数
        if (typeof value === 'string' && Object.keys(params).length > 0) {
            return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
                return params[paramKey] !== undefined ? params[paramKey] : match;
            });
        }
        
        return value || key;
    },
    
    // 应用翻译到页面元素
    applyTranslations() {
        // 翻译所有带 data-i18n 属性的元素
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.t(key);
        });
        
        // 翻译所有带 data-i18n-placeholder 属性的元素
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });
        
        // 翻译所有带 data-i18n-title 属性的元素
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.t(key);
        });
    },
    
    // 切换语言
    async switchLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('language', lang);
        
        // 加载语言文件
        await this.loadLanguage(lang);
        
        // 应用翻译
        this.applyTranslations();
        
        // 更新语言选择器
        this.updateLanguageSelector();
        
        // 触发自定义事件
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
    },
    
    // 更新语言选择器状态
    updateLanguageSelector() {
        const selector = document.getElementById('languageSelector');
        if (selector) {
            selector.value = this.currentLang;
        }
        
        // 更新按钮状态
        document.querySelectorAll('.lang-btn').forEach(btn => {
            if (btn.dataset.lang === this.currentLang || 
                (btn.dataset.lang === 'zh' && this.currentLang === 'zh-CN') ||
                (btn.dataset.lang === 'en' && this.currentLang === 'en-US')) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    },
    
    // 获取当前语言
    getCurrentLanguage() {
        return this.currentLang;
    }
};

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => i18n.init());
} else {
    i18n.init();
}


