// Интерактивные анимации для иконок хедера

document.addEventListener('DOMContentLoaded', function() {
    const actionButtons = document.querySelectorAll('.modern-header__actions .action-btn');

    actionButtons.forEach((btn) => {
        const svg = btn.querySelector('svg');
        const href = btn.getAttribute('href') || '';

        btn.addEventListener('mouseenter', function() {
            // Определяем тип иконки по href
            if (href.includes('compare')) {
                // Сравнение - качание влево-вправо
                svg.style.animation = 'swingHorizontal 0.5s ease-in-out';
            } else if (href.includes('favorites')) {
                // Избранное - пульсация сердца
                svg.style.animation = 'heartBeat 0.6s ease-in-out';
            } else if (href.includes('cart')) {
                // Корзина - подпрыгивание
                svg.style.animation = 'cartBounce 0.5s ease';
            } else if (btn.classList.contains('action-btn--auth')) {
                // Войти - увеличение с вращением
                svg.style.animation = 'rotateScale 0.5s ease';
            }
        });

        btn.addEventListener('animationend', function() {
            svg.style.animation = '';
        });
    });
});

// Добавляем CSS стили для анимаций
const style = document.createElement('style');
style.textContent = `
    /* Красивые цвета для иконок на мобильных */
    @media (max-width: 768px) {
        .modern-header__actions .action-btn svg {
            stroke: var(--brand-primary);
            filter: drop-shadow(0 2px 4px rgba(42, 157, 78, 0.2));
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .modern-header__actions .action-btn:hover svg,
        .modern-header__actions .action-btn:active svg {
            stroke: #ff5b1a;
            filter: drop-shadow(0 4px 8px rgba(255, 91, 26, 0.4));
            transform: scale(1.1);
        }

        /* Особые цвета для каждой иконки */
        .modern-header__actions .action-btn:nth-child(1) svg {
            /* Сравнение - синий */
            stroke: #2196F3;
        }

        .modern-header__actions .action-btn:nth-child(2) svg {
            /* Избранное - красный */
            stroke: #E91E63;
        }

        .modern-header__actions .action-btn:nth-child(3) svg {
            /* Корзина - оранжевый */
            stroke: #ff5b1a;
        }

        .modern-header__actions .action-btn:nth-child(4) svg {
            /* Войти - зеленый */
            stroke: var(--brand-primary);
        }

        /* Активная иконка ярче */
        .modern-header__actions .action-btn:active {
            transform: scale(0.95);
        }
    }

    /* Анимации */
    @keyframes swingHorizontal {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(-15deg); }
        50% { transform: rotate(15deg); }
        75% { transform: rotate(-10deg); }
    }

    @keyframes heartBeat {
        0%, 100% { transform: scale(1); }
        10%, 30% { transform: scale(0.9); }
        20%, 40%, 60%, 80% { transform: scale(1.15); }
        50%, 70% { transform: scale(1.1); }
    }

    @keyframes cartBounce {
        0%, 100% { transform: translateY(0); }
        20% { transform: translateY(-8px); }
        40% { transform: translateY(-4px); }
        60% { transform: translateY(-6px); }
        80% { transform: translateY(-2px); }
    }

    @keyframes rotateScale {
        0% { transform: scale(1) rotate(0deg); }
        50% { transform: scale(1.2) rotate(180deg); }
        100% { transform: scale(1) rotate(360deg); }
    }

    /* Плавное движение при наведении на десктопе */
    @media (min-width: 769px) {
        .action-btn svg {
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .action-btn:hover svg {
            filter: drop-shadow(0 4px 8px rgba(42, 157, 78, 0.3));
        }
    }
`;
document.head.appendChild(style);
