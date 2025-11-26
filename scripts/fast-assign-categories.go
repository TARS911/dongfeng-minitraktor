package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"sync"
	"sync/atomic"
)

type Product struct {
	ID             int                    `json:"id"`
	CategoryID     *int                   `json:"category_id"`
	Specifications map[string]interface{} `json:"specifications"`
}

type Category struct {
	ID   int    `json:"id"`
	Slug string `json:"slug"`
}

var (
	supabaseURL string
	supabaseKey string
	categoryMap = make(map[string]int)
	updated     int64
	skipped     int64
)

func main() {
	supabaseURL = os.Getenv("SUPABASE_URL")
	if supabaseURL == "" {
		supabaseURL = os.Getenv("NEXT_PUBLIC_SUPABASE_URL")
	}
	supabaseKey = os.Getenv("SUPABASE_SERVICE_ROLE_KEY")

	fmt.Println(strings.Repeat("=", 80))
	fmt.Println("⚡ БЫСТРОЕ ПРИСВОЕНИЕ CATEGORY_ID (GO)")
	fmt.Println(strings.Repeat("=", 80))
	fmt.Println()

	// Загружаем категории
	fmt.Println("📦 Загрузка категорий...")
	if err := loadCategories(); err != nil {
		panic(err)
	}
	fmt.Printf("✅ Загружено %d категорий\n\n", len(categoryMap))

	// Загружаем товары батчами
	fmt.Println("📊 Обработка товаров...")
	offset := 0
	batchSize := 1000
	totalProducts := 0

	for {
		products, err := fetchProducts(offset, batchSize)
		if err != nil {
			panic(err)
		}

		if len(products) == 0 {
			break
		}

		// Обрабатываем батч конкурентно
		processBatch(products)

		totalProducts += len(products)
		fmt.Printf("   Обработано: %d товаров (обновлено: %d, пропущено: %d)\n",
			totalProducts, atomic.LoadInt64(&updated), atomic.LoadInt64(&skipped))

		if len(products) < batchSize {
			break
		}

		offset += batchSize
	}

	fmt.Println()
	fmt.Println(strings.Repeat("=", 80))
	fmt.Println("📊 РЕЗУЛЬТАТ:")
	fmt.Println(strings.Repeat("=", 80))
	fmt.Printf("✅ Обновлено:  %6d товаров\n", atomic.LoadInt64(&updated))
	fmt.Printf("⏭️  Пропущено:  %6d товаров\n", atomic.LoadInt64(&skipped))
	fmt.Println(strings.Repeat("=", 80))
}

func loadCategories() error {
	url := fmt.Sprintf("%s/rest/v1/categories?select=id,slug", supabaseURL)

	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Authorization", "Bearer "+supabaseKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	var categories []Category
	if err := json.NewDecoder(resp.Body).Decode(&categories); err != nil {
		return err
	}

	for _, cat := range categories {
		categoryMap[cat.Slug] = cat.ID
	}

	return nil
}

func fetchProducts(offset, limit int) ([]Product, error) {
	url := fmt.Sprintf("%s/rest/v1/products?select=id,category_id,specifications&offset=%d&limit=%d",
		supabaseURL, offset, limit)

	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Authorization", "Bearer "+supabaseKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var products []Product
	if err := json.NewDecoder(resp.Body).Decode(&products); err != nil {
		return nil, err
	}

	return products, nil
}

func processBatch(products []Product) {
	var wg sync.WaitGroup
	semaphore := make(chan struct{}, 50) // 50 конкурентных запросов

	for _, product := range products {
		wg.Add(1)
		go func(p Product) {
			defer wg.Done()
			semaphore <- struct{}{}
			defer func() { <-semaphore }()

			processProduct(p)
		}(product)
	}

	wg.Wait()
}

func processProduct(p Product) {
	specs, ok := p.Specifications["category"]
	if !ok {
		atomic.AddInt64(&skipped, 1)
		return
	}

	categorySlug, ok := specs.(string)
	if !ok {
		atomic.AddInt64(&skipped, 1)
		return
	}

	correctCatID, exists := categoryMap[categorySlug]
	if !exists {
		atomic.AddInt64(&skipped, 1)
		return
	}

	if p.CategoryID != nil && *p.CategoryID == correctCatID {
		atomic.AddInt64(&skipped, 1)
		return
	}

	// Обновляем category_id
	if err := updateProduct(p.ID, correctCatID); err == nil {
		atomic.AddInt64(&updated, 1)
	} else {
		atomic.AddInt64(&skipped, 1)
	}
}

func updateProduct(id, categoryID int) error {
	url := fmt.Sprintf("%s/rest/v1/products?id=eq.%d", supabaseURL, id)

	payload := map[string]int{"category_id": categoryID}
	jsonData, _ := json.Marshal(payload)

	req, _ := http.NewRequest("PATCH", url, bytes.NewBuffer(jsonData))
	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "return=minimal")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("update failed: %s", body)
	}

	return nil
}
