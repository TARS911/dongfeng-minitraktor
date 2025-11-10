"use client";

import { useState, useEffect } from "react";
import { getVariant, trackConversion } from "../lib/abTesting";
import Link from "next/link";

interface ABTestButtonProps {
  experimentId: string;
  href: string;
  className?: string;
  conversionType?: string;
}

/**
 * Кнопка с A/B тестированием
 * Автоматически использует разные варианты текста и стиля
 */
export default function ABTestButton({
  experimentId,
  href,
  className = "",
  conversionType = "click",
}: ABTestButtonProps) {
  const [buttonData, setButtonData] = useState<any>(null);
  const [variantId, setVariantId] = useState<string | null>(null);

  useEffect(() => {
    // Получаем вариант только на клиенте
    const variant = getVariant(experimentId);
    if (variant) {
      setButtonData(variant.data);
      setVariantId(variant.id);
    }
  }, [experimentId]);

  const handleClick = () => {
    if (variantId) {
      trackConversion(experimentId, conversionType);
    }
  };

  // Если еще не загрузили вариант, показываем дефолтную кнопку
  if (!buttonData) {
    return (
      <Link href={href} className={className}>
        Перейти в каталог
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={className}
      onClick={handleClick}
      style={{
        backgroundColor: buttonData.color || undefined,
      }}
    >
      {buttonData.text}
    </Link>
  );
}
