// 🎨 自定义通知系统

class NotificationSystem {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // 创建通知容器
        this.container = document.createElement('div');
        this.container.className = 'notification-container';
        document.body.appendChild(this.container);
    }

    // 显示通知
    show(options) {
        const {
            type = 'info',
            title = '',
            message = '',
            duration = 3000,
            closable = true
        } = options;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        // 图标映射
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        notification.innerHTML = `
            <div class="notification-icon">${icons[type] || icons.info}</div>
            <div class="notification-content">
                ${title ? `<div class="notification-title">${title}</div>` : ''}
                <div class="notification-message">${message}</div>
            </div>
            ${closable ? '<button class="notification-close" aria-label="关闭">×</button>' : ''}
        `;

        this.container.appendChild(notification);

        // 关闭按钮事件
        if (closable) {
            const closeBtn = notification.querySelector('.notification-close');
            closeBtn.addEventListener('click', () => this.remove(notification));
        }

        // 自动关闭
        if (duration > 0) {
            setTimeout(() => this.remove(notification), duration);
        }

        return notification;
    }

    // 移除通知
    remove(notification) {
        notification.classList.add('hiding');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    // 成功通知
    success(message, title = '成功') {
        return this.show({
            type: 'success',
            title,
            message
        });
    }

    // 错误通知
    error(message, title = '错误') {
        return this.show({
            type: 'error',
            title,
            message,
            duration: 4000
        });
    }

    // 警告通知
    warning(message, title = '警告') {
        return this.show({
            type: 'warning',
            title,
            message
        });
    }

    // 信息通知
    info(message, title = '提示') {
        return this.show({
            type: 'info',
            title,
            message
        });
    }

    // 确认对话框
    confirm(options) {
        return new Promise((resolve) => {
            const {
                type = 'warning',
                title = '确认',
                message = '确定要执行此操作吗？',
                confirmText = '确定',
                cancelText = '取消',
                danger = false
            } = options;

            // 创建遮罩层
            const overlay = document.createElement('div');
            overlay.className = 'confirm-dialog-overlay';

            // 图标映射
            const icons = {
                warning: '⚠',
                error: '✕',
                info: 'ℹ'
            };

            overlay.innerHTML = `
                <div class="confirm-dialog ${type}">
                    <div class="confirm-dialog-icon">${icons[type] || icons.info}</div>
                    <div class="confirm-dialog-title">${title}</div>
                    <div class="confirm-dialog-message">${message}</div>
                    <div class="confirm-dialog-buttons">
                        <button class="confirm-dialog-button secondary" data-action="cancel">${cancelText}</button>
                        <button class="confirm-dialog-button ${danger ? 'danger' : 'primary'}" data-action="confirm">${confirmText}</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            // 按钮事件
            const buttons = overlay.querySelectorAll('.confirm-dialog-button');
            buttons.forEach(button => {
                button.addEventListener('click', () => {
                    const action = button.getAttribute('data-action');
                    overlay.style.animation = 'fadeOut 0.2s ease-out';
                    setTimeout(() => {
                        document.body.removeChild(overlay);
                        resolve(action === 'confirm');
                    }, 200);
                });
            });

            // 点击遮罩层关闭
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.style.animation = 'fadeOut 0.2s ease-out';
                    setTimeout(() => {
                        document.body.removeChild(overlay);
                        resolve(false);
                    }, 200);
                }
            });
        });
    }
}

// 创建全局实例
const notify = new NotificationSystem();

// 添加 fadeOut 动画
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 导出为全局变量
window.notify = notify;


