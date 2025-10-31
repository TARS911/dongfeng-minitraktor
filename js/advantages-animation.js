// Интерактивные анимации для иконок преимуществ

document.addEventListener('DOMContentLoaded', function() {
    const advantageItems = document.querySelectorAll('.advantage-item');

    advantageItems.forEach((item, index) => {
        const icon = item.querySelector('.advantage-item__icon');

        // Разные анимации для разных иконок
        item.addEventListener('mouseenter', function() {
            switch(index) {
                case 0: // Доставка - движение грузовика вправо
                    icon.style.transform = 'translateX(8px)';
                    break;

                case 1: // Расширенная гарантия - пульсация щита
                    icon.style.animation = 'pulse 0.6s ease-in-out';
                    break;

                case 2: // Лизинг - вращение монеты
                    icon.style.transform = 'rotateY(180deg)';
                    break;

                case 3: // Торги - подпрыгивание корзины
                    icon.style.animation = 'bounce 0.6s ease';
                    break;

                case 4: // Услуги и сервис - вращение гаечного ключа
                    icon.style.transform = 'rotate(15deg) scale(1.1)';
                    break;

                case 5: // Лучшая цена - вращение доллара
                    icon.style.transform = 'rotateZ(360deg) scale(1.15)';
                    break;

                case 6: // Бонусная программа - качание ярлыка
                    icon.style.animation = 'swing 0.6s ease-in-out';
                    break;
            }
        });

        item.addEventListener('mouseleave', function() {
            icon.style.transform = '';
            icon.style.animation = '';
        });
    });
});

// Добавляем стили для анимаций
const style = document.createElement('style');
style.textContent = `
    .advantage-item__icon {
        transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.15); }
    }

    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        25% { transform: translateY(-12px); }
        50% { transform: translateY(-6px); }
        75% { transform: translateY(-3px); }
    }

    @keyframes swing {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(-12deg); }
        50% { transform: rotate(12deg); }
        75% { transform: rotate(-8deg); }
    }

    /* Hover эффект для всего блока */
    .advantage-item {
        transition: all 0.3s ease;
    }

    .advantage-item:hover {
        transform: translateY(-4px);
    }

    .advantage-item:hover .advantage-item__icon {
        background: linear-gradient(135deg, #ff5b1a 0%, #ff7b3d 100%);
        box-shadow: 0 8px 20px rgba(255, 91, 26, 0.35);
    }

    .advantage-item:hover .advantage-item__text {
        color: var(--brand-primary);
    }
`;
document.head.appendChild(style);
