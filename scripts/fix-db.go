package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
)

const (
	SUPABASE_URL = "https://dpsykseeqloturowdyzf.supabase.co"
	SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwc3lrc2VlcWxvdHVyb3dkeXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjUwMjg1MywiZXhwIjoyMDc4MDc4ODUzfQ.wY2VoghxdIhgwEws_kUIUgZX1P3TTw-1PXh84GVbdJ4"
)

type Product struct {
	ID           int     `json:"id"`
	Title        string  `json:"title"`
	Category     *string `json:"category"`
	Manufacturer *string `json:"manufacturer"`
	Brand        *string `json:"brand"`
}

func makeRequest(endpoint string) ([]Product, error) {
	url := SUPABASE_URL + endpoint
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("apikey", SUPABASE_KEY)
	req.Header.Set("Authorization", "Bearer "+SUPABASE_KEY)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var products []Product
	if err := json.Unmarshal(body, &products); err != nil {
		return nil, err
	}

	return products, nil
}

func updateProduct(id int, category string) error {
	url := fmt.Sprintf("%s/rest/v1/products?id=eq.%d", SUPABASE_URL, id)

	data := map[string]string{"category": category}
	jsonData, _ := json.Marshal(data)

	req, err := http.NewRequest("PATCH", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}

	req.Header.Set("apikey", SUPABASE_KEY)
	req.Header.Set("Authorization", "Bearer "+SUPABASE_KEY)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "return=minimal")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 && resp.StatusCode != 204 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("status %d: %s", resp.StatusCode, string(body))
	}

	return nil
}

func main() {
	fmt.Println("================================================================================")
	fmt.Println("🚀 БЫСТРЫЙ АНАЛИЗ И ИСПРАВЛЕНИЕ БД SUPABASE (GO)")
	fmt.Println("================================================================================")
	fmt.Println()

	// 1. Найти все товары с "Двигатель" и "л.с" в названии
	fmt.Println("🔍 ШАГ 1: Поиск всех ДВС...")
	products, err := makeRequest("/rest/v1/products?select=id,title,category&title=ilike.*двигатель*")
	if err != nil {
		fmt.Printf("❌ Ошибка: %v\n", err)
		os.Exit(1)
	}

	// Фильтруем только полные ДВС (с мощностью в л.с.)
	var engines []Product
	for _, p := range products {
		if strings.Contains(strings.ToLower(p.Title), "двигатель") &&
			strings.Contains(strings.ToLower(p.Title), "л.с") &&
			!strings.Contains(strings.ToLower(p.Title), "редуктор") &&
			!strings.Contains(strings.ToLower(p.Title), "вентилятор") {
			engines = append(engines, p)
		}
	}

	fmt.Printf("   Найдено ДВС в сборе: %d\n\n", len(engines))

	// 2. Разделим на правильные и неправильные
	var wrongCategory []Product
	var correctCategory []Product

	for _, e := range engines {
		if e.Category == nil {
			wrongCategory = append(wrongCategory, e)
		} else if strings.Contains(*e.Category, "Запчасти") {
			wrongCategory = append(wrongCategory, e)
		} else if strings.Contains(*e.Category, "ДВС") && strings.Contains(*e.Category, "сборе") {
			correctCategory = append(correctCategory, e)
		} else {
			wrongCategory = append(wrongCategory, e)
		}
	}

	fmt.Println("📊 РЕЗУЛЬТАТЫ:")
	fmt.Printf("   ✅ В правильной категории 'ДВС в сборе': %d\n", len(correctCategory))
	fmt.Printf("   ❌ В неправильной категории: %d\n\n", len(wrongCategory))

	if len(wrongCategory) > 0 {
		fmt.Println("❌ ТОВАРЫ С НЕПРАВИЛЬНОЙ КАТЕГОРИЕЙ:")
		for i, p := range wrongCategory {
			cat := "NULL"
			if p.Category != nil {
				cat = *p.Category
			}
			fmt.Printf("   %2d. ID %5d: %s\n", i+1, p.ID, p.Title)
			fmt.Printf("       Текущая категория: %s\n", cat)
		}
		fmt.Println()

		// 3. Спросить пользователя об исправлении
		fmt.Print("❓ Исправить категории? (yes/no): ")
		var answer string
		fmt.Scanln(&answer)

		if strings.ToLower(answer) == "yes" || strings.ToLower(answer) == "y" {
			fmt.Println("\n🔧 ИСПРАВЛЯЮ КАТЕГОРИИ...")

			fixed := 0
			failed := 0

			for _, p := range wrongCategory {
				err := updateProduct(p.ID, "ДВС в сборе")
				if err != nil {
					fmt.Printf("   ❌ Ошибка обновления ID %d: %v\n", p.ID, err)
					failed++
				} else {
					fmt.Printf("   ✅ ID %d: %s → 'ДВС в сборе'\n", p.ID, p.Title[:50])
					fixed++
				}
			}

			fmt.Println()
			fmt.Printf("✅ Исправлено: %d\n", fixed)
			if failed > 0 {
				fmt.Printf("❌ Ошибок: %d\n", failed)
			}
		} else {
			fmt.Println("⏭️  Пропускаю исправление")
		}
	}

	fmt.Println()
	fmt.Println("================================================================================")
	fmt.Println("✅ ГОТОВО!")
	fmt.Println("================================================================================")
}
