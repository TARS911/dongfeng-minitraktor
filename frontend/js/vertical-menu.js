// Управление вертикальным боковым меню

// Переключение sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebarMenu');
    const overlay = document.getElementById('sidebarOverlay');
    const body = document.body;

    if (sidebar) {
        sidebar.classList.toggle('active');
    }

    if (overlay) {
        overlay.classList.toggle('active');
    }

    // На мобильных устройствах блокируем скролл
    if (window.innerWidth <= 1024) {
        body.style.overflow = sidebar && sidebar.classList.contains('active') ? 'hidden' : '';
    }
}

// Закрытие sidebar
function closeSidebar() {
    const sidebar = document.getElementById('sidebarMenu');
    const overlay = document.getElementById('sidebarOverlay');
    const body = document.body;

    if (sidebar) {
        sidebar.classList.remove('active');
    }

    if (overlay) {
        overlay.classList.remove('active');
    }

    body.style.overflow = '';
}

// Переключение выбора города в sidebar
function toggleSidebarCitySelector() {
    const dropdown = document.getElementById('sidebarCityDropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

// Выбор города в sidebar
function selectSidebarCity(city) {
    const selectedCity = document.getElementById('sidebarSelectedCity');
    if (selectedCity) {
        selectedCity.textContent = city;
    }

    // Также обновляем основной селектор города, если он есть
    if (window.selectCity) {
        window.selectCity(city);
    }

    // Закрываем dropdown
    toggleSidebarCitySelector();

    // Сохраняем выбор в localStorage
    localStorage.setItem('selectedCity', city);
}

// Закрытие sidebar при клике на overlay
document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('sidebarOverlay');
    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }

    // Загружаем сохраненный город
    const savedCity = localStorage.getItem('selectedCity');
    if (savedCity) {
        const selectedCity = document.getElementById('sidebarSelectedCity');
        if (selectedCity) {
            selectedCity.textContent = savedCity;
        }
    }

    // Подсвечиваем активную страницу
    highlightActiveMenuItem();
});

// Подсветка активного пункта меню
function highlightActiveMenuItem() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const menuLinks = document.querySelectorAll('.sidebar-menu__link');

    menuLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// Закрытие dropdown при клике вне его
document.addEventListener('click', function(event) {
    const citySelector = document.querySelector('.sidebar-city-selector');
    const dropdown = document.getElementById('sidebarCityDropdown');

    if (citySelector && dropdown && !citySelector.contains(event.target)) {
        dropdown.classList.remove('active');
    }
});

// Адаптация при изменении размера окна
window.addEventListener('resize', function() {
    if (window.innerWidth > 1024) {
        const sidebar = document.getElementById('sidebarMenu');
        const overlay = document.getElementById('sidebarOverlay');

        if (sidebar) {
            sidebar.classList.remove('active');
        }
        if (overlay) {
            overlay.classList.remove('active');
        }

        document.body.style.overflow = '';
    }
});
