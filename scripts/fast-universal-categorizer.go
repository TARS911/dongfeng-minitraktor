package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strings"
	"sync"

	"github.com/joho/godotenv"
	"github.com/supabase-community/postgrest-go"
)

type Product struct {
	ID           int64  `json:"id"`
	Name         string `json:"name"`
	Manufacturer string `json:"manufacturer"`
}

type UpdateBatch struct {
	IDs          []int64
	Manufacturer string
}

func main() {
	// Загружаем .env
	godotenv.Load()

	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")

	if supabaseURL == "" || supabaseKey == "" {
		log.Fatal("❌ ОШИБКА: Нет переменных окружения")
	}

	client := postgrest.NewClient(supabaseURL, "", map[string]string{
		"apikey":        supabaseKey,
		"Authorization": fmt.Sprintf("Bearer %s", supabaseKey),
	})

	fmt.Println("====================================================================================================")
	fmt.Println("🚀 БЫСТРАЯ КАТЕГОРИЗАЦИЯ UNIVERSAL (GO)")
	fmt.Println("====================================================================================================")
	fmt.Println()

	// Загружаем все UNIVERSAL товары
	fmt.Println("📦 Загружаем UNIVERSAL товары...")

	var products []Product
	body, count, err := client.From("products").
		Select("id,name,manufacturer", "exact", false).
		Eq("manufacturer", "UNIVERSAL").
		Execute()

	if err != nil {
		log.Fatal(err)
	}

	err = json.Unmarshal(body, &products)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("✅ Найдено UNIVERSAL товаров: %d (count: %d)\n", len(products), count)
	fmt.Println()

	// Маппинг производителей
	manufacturerKeywords := map[string][]string{
		"DongFeng": {"dongfeng", "донгфенг"},
		"Foton":    {"foton", "фотон"},
		"Xingtai":  {"xingtai", "синтай", "уралец"},
		"Jinma":    {"jinma", "джинма"},
		"ZUBR":     {"zubr", "зубр"},
	}

	// Собираем ID для обновления
	updates := make(map[string][]int64)

	for _, product := range products {
		nameLower := strings.ToLower(product.Name)

		for manufacturer, keywords := range manufacturerKeywords {
			found := false
			for _, keyword := range keywords {
				if strings.Contains(nameLower, keyword) {
					updates[manufacturer] = append(updates[manufacturer], product.ID)
					found = true
					break
				}
			}
			if found {
				break
			}
		}
	}

	// Выполняем обновления параллельно
	fmt.Println("🔄 ОБНОВЛЕНИЕ ПРОИЗВОДИТЕЛЕЙ (параллельно):")
	fmt.Println("----------------------------------------------------------------------------------------------------")

	var wg sync.WaitGroup
	totalUpdated := 0

	for manufacturer, ids := range updates {
		if len(ids) == 0 {
			continue
		}

		wg.Add(1)
		go func(mfr string, productIDs []int64) {
			defer wg.Done()

			fmt.Printf("📝 Обновляем %d товаров на manufacturer=%s...\n", len(productIDs), mfr)

			// Батчами по 100
			batchSize := 100
			for i := 0; i < len(productIDs); i += batchSize {
				end := i + batchSize
				if end > len(productIDs) {
					end = len(productIDs)
				}

				batch := productIDs[i:end]

				updateData := map[string]interface{}{
					"manufacturer": mfr,
				}

				_, _, err := client.From("products").
					Update(updateData, "", "").
					In("id", toInterfaceSlice(batch)).
					Execute()

				if err != nil {
					log.Printf("❌ Ошибка обновления: %v", err)
					continue
				}
			}

			fmt.Printf("   ✅ %s - обновлено %d товаров\n", mfr, len(productIDs))
		}(manufacturer, ids)

		totalUpdated += len(ids)
	}

	wg.Wait()

	fmt.Println()
	fmt.Printf("✅ ИТОГО обновлено: %d товаров\n", totalUpdated)
	fmt.Println()

	// Проверяем сколько осталось UNIVERSAL
	_, finalCount, err := client.From("products").
		Select("id", "exact", false).
		Eq("manufacturer", "UNIVERSAL").
		Execute()

	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("====================================================================================================")
	fmt.Println("📊 ФИНАЛЬНАЯ СТАТИСТИКА")
	fmt.Println("====================================================================================================")
	fmt.Printf("Было UNIVERSAL товаров: %d\n", len(products))
	fmt.Printf("Переназначено: %d\n", totalUpdated)
	fmt.Printf("Осталось UNIVERSAL: %d\n", finalCount)
	fmt.Println()
	fmt.Println("✅ ГОТОВО!")
	fmt.Println("====================================================================================================")
}

func toInterfaceSlice(ids []int64) []interface{} {
	result := make([]interface{}, len(ids))
	for i, id := range ids {
		result[i] = id
	}
	return result
}
