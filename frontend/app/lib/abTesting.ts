/**
 * A/B Testing система для оптимизации конверсии
 * Позволяет тестировать разные варианты CTA кнопок, заголовков и т.д.
 */

/**
 * Типы экспериментов
 */
export enum ExperimentType {
  CTA_BUTTON = "cta_button",
  HERO_TITLE = "hero_title",
  PRICING_LAYOUT = "pricing_layout",
  PRODUCT_CARD = "product_card",
}

/**
 * Варианты эксперимента
 */
export interface Variant {
  id: string;
  name: string;
  weight: number; // Вес для распределения трафика (0-100)
  data: any; // Данные варианта (текст кнопки, цвет и т.д.)
}

/**
 * Конфигурация эксперимента
 */
export interface Experiment {
  id: string;
  name: string;
  type: ExperimentType;
  variants: Variant[];
  active: boolean;
}

/**
 * Хранилище экспериментов (в production должно быть в БД)
 */
const EXPERIMENTS: Experiment[] = [
  {
    id: "cta_catalog_button",
    name: "Тест текста кнопки 'Перейти в каталог'",
    type: ExperimentType.CTA_BUTTON,
    active: true,
    variants: [
      {
        id: "control",
        name: "Контрольная (оригинал)",
        weight: 50,
        data: {
          text: "Перейти в каталог",
          color: "#0066cc",
        },
      },
      {
        id: "variant_a",
        name: "Вариант A - более убедительный",
        weight: 50,
        data: {
          text: "Смотреть товары со скидкой",
          color: "#f44336",
        },
      },
    ],
  },
  {
    id: "hero_title",
    name: "Тест заголовка на главной",
    type: ExperimentType.HERO_TITLE,
    active: false, // Отключен по умолчанию
    variants: [
      {
        id: "control",
        name: "Контрольный заголовок",
        weight: 50,
        data: {
          title: "БелТехФермЪ",
          subtitle: "Надежная техника для вашего хозяйства",
        },
      },
      {
        id: "variant_a",
        name: "Вариант с выгодой",
        weight: 50,
        data: {
          title: "Сэкономьте на сельхозтехнике до 30%",
          subtitle: "Официальный дилер с гарантией качества",
        },
      },
    ],
  },
];

/**
 * Получить вариант эксперимента для пользователя
 * Использует localStorage для консистентности
 */
export function getVariant(experimentId: string): Variant | null {
  // Находим эксперимент
  const experiment = EXPERIMENTS.find((exp) => exp.id === experimentId);

  if (!experiment || !experiment.active) {
    // Если эксперимент не найден или неактивен, возвращаем контрольный вариант
    return experiment?.variants.find((v) => v.id === "control") || null;
  }

  // Проверяем, был ли пользователь уже назначен в этот эксперимент
  const storageKey = `ab_${experimentId}`;
  const storedVariantId = localStorage.getItem(storageKey);

  if (storedVariantId) {
    const variant = experiment.variants.find((v) => v.id === storedVariantId);
    if (variant) {
      return variant;
    }
  }

  // Назначаем пользователя в вариант на основе весов
  const selectedVariant = selectVariantByWeight(experiment.variants);

  // Сохраняем выбор для консистентности
  localStorage.setItem(storageKey, selectedVariant.id);

  // Отправляем событие в аналитику
  trackExperimentView(experimentId, selectedVariant.id);

  return selectedVariant;
}

/**
 * Выбрать вариант на основе весов
 */
function selectVariantByWeight(variants: Variant[]): Variant {
  const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
  let random = Math.random() * totalWeight;

  for (const variant of variants) {
    random -= variant.weight;
    if (random <= 0) {
      return variant;
    }
  }

  // Fallback на первый вариант
  return variants[0];
}

/**
 * Отследить конверсию (клик на кнопку, покупку и т.д.)
 */
export function trackConversion(
  experimentId: string,
  conversionType: string = "click",
  value?: number
) {
  const storageKey = `ab_${experimentId}`;
  const variantId = localStorage.getItem(storageKey);

  if (!variantId) {
    console.warn(`No variant found for experiment ${experimentId}`);
    return;
  }

  // Отправляем событие в Google Analytics
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "ab_test_conversion", {
      experiment_id: experimentId,
      variant_id: variantId,
      conversion_type: conversionType,
      value: value,
    });
  }

  // Можно также отправить в свою аналитику
  console.log("A/B Test Conversion:", {
    experimentId,
    variantId,
    conversionType,
    value,
  });
}

/**
 * Отследить просмотр варианта
 */
function trackExperimentView(experimentId: string, variantId: string) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "ab_test_view", {
      experiment_id: experimentId,
      variant_id: variantId,
    });
  }

  console.log("A/B Test View:", { experimentId, variantId });
}

/**
 * Получить все активные эксперименты
 */
export function getActiveExperiments(): Experiment[] {
  return EXPERIMENTS.filter((exp) => exp.active);
}

/**
 * Проверить, участвует ли пользователь в эксперименте
 */
export function isInExperiment(experimentId: string): boolean {
  const storageKey = `ab_${experimentId}`;
  return localStorage.getItem(storageKey) !== null;
}

/**
 * Сбросить все A/B тесты (для разработки)
 */
export function resetAllExperiments() {
  EXPERIMENTS.forEach((exp) => {
    const storageKey = `ab_${exp.id}`;
    localStorage.removeItem(storageKey);
  });
  console.log("All A/B tests reset");
}

/**
 * React Hook для использования A/B теста
 */
export function useABTest(experimentId: string): Variant | null {
  if (typeof window === "undefined") {
    // SSR: возвращаем контрольный вариант
    const experiment = EXPERIMENTS.find((exp) => exp.id === experimentId);
    return experiment?.variants.find((v) => v.id === "control") || null;
  }

  return getVariant(experimentId);
}
