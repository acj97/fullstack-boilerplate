package main

import (
	"database/sql"
	"log"
	"time"

	"github.com/acj97/fullstack-boilerplate/internal/api"
	"github.com/acj97/fullstack-boilerplate/internal/config"
	ah "github.com/acj97/fullstack-boilerplate/internal/module/auth/handler"
	ar "github.com/acj97/fullstack-boilerplate/internal/module/auth/repository"
	au "github.com/acj97/fullstack-boilerplate/internal/module/auth/usecase"
	srv "github.com/acj97/fullstack-boilerplate/internal/service/http"
	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	_ = godotenv.Load()

	db, err := sql.Open("sqlite3", "dashboard.db?_foreign_keys=1&_loc=UTC")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	if err := initDB(db); err != nil {
		log.Fatal(err)
	}

	JwtExpiredDuration, err := time.ParseDuration(config.JwtExpired)
	if err != nil {
		panic(err)
	}

	userRepo := ar.NewUserRepo(db)
	paymentRepo := ar.NewPaymentRepo(db)

	authUC := au.NewAuthUsecase(userRepo, config.JwtSecret, JwtExpiredDuration)
	paymentUC := au.NewPaymentUsecase(paymentRepo, config.JwtSecret, JwtExpiredDuration)

	authH := ah.NewAuthHandler(authUC)
	paymentH := ah.NewPaymentHandler(paymentUC)

	apiHandler := &api.APIHandler{
		Auth:    authH,
		Payment: paymentH,
	}

	server := srv.NewServer(apiHandler, config.OpenapiYamlLocation, config.JwtSecret)

	addr := config.HttpAddress
	log.Printf("starting server on %s", addr)
	server.Start(addr)
}

func initDB(db *sql.DB) error {
	// create tables if not exists
	stmts := []string{
		`CREATE TABLE IF NOT EXISTS users (
		  id INTEGER PRIMARY KEY AUTOINCREMENT,
		  email TEXT NOT NULL UNIQUE,
		  password_hash TEXT NOT NULL,
		  role TEXT NOT NULL
		);`,
		`CREATE TABLE IF NOT EXISTS payments (
		  id INTEGER PRIMARY KEY AUTOINCREMENT,
		  merchant_name TEXT NOT NULL,
		  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		  amount TEXT NOT NULL,
		  status TEXT NOT NULL CHECK(status IN ('completed','processing','failed'))
		);`,
	}
	for _, s := range stmts {
		if _, err := db.Exec(s); err != nil {
			return err
		}
	}
	// seed admin user if not exists
	var cnt int
	row := db.QueryRow("SELECT COUNT(1) FROM users")
	if err := row.Scan(&cnt); err != nil {
		return err
	}
	if cnt == 0 {
		hash, err := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		if _, err := db.Exec("INSERT INTO users(email, password_hash, role) VALUES (?, ?, ?)", "cs@test.com", string(hash), "cs"); err != nil {
			return err
		}
		if _, err := db.Exec("INSERT INTO users(email, password_hash, role) VALUES (?, ?, ?)", "operation@test.com", string(hash), "operation"); err != nil {
			return err
		}
	}

	var paymentCnt int
	if err := db.QueryRow("SELECT COUNT(1) FROM payments").Scan(&paymentCnt); err != nil {
		return err
	}
	if paymentCnt == 0 {
		now := time.Now().UTC()
		payments := []struct {
			merchant  string
			amount    string
			status    string
			createdAt time.Time
		}{
			{"Tokopedia", "150000", "completed", now.AddDate(0, 0, -1)},
			{"Shopee", "75000", "processing", now.AddDate(0, 0, -3)},
			{"Gojek", "50000", "failed", now.AddDate(0, 0, -5)},
			{"Grab", "200000", "completed", now.AddDate(0, 0, -7)},
			{"Traveloka", "1200000", "processing", now.AddDate(0, 0, -10)},
			{"Bukalapak", "95000", "failed", now.AddDate(0, 0, -12)},
			{"OVO", "300000", "completed", now.AddDate(0, 0, -15)},
			{"Dana", "60000", "completed", now.AddDate(0, 0, -18)},
			{"LinkAja", "450000", "failed", now.AddDate(0, 0, -20)},
			{"Blibli", "870000", "processing", now.AddDate(0, 0, -25)},
			{"Lazada", "320000", "completed", now.AddDate(0, 0, -27)},
			{"Tiket.com", "990000", "completed", now.AddDate(0, 0, -30)},
			{"Alfamart", "45000", "failed", now.AddDate(0, 0, -33)},
			{"Indomaret", "67000", "processing", now.AddDate(0, 0, -36)},
			{"BCA", "500000", "completed", now.AddDate(0, 0, -38)},
			{"Mandiri", "250000", "failed", now.AddDate(0, 0, -40)},
			{"BRI", "180000", "completed", now.AddDate(0, 0, -43)},
			{"BNI", "420000", "processing", now.AddDate(0, 0, -46)},
			{"CIMB Niaga", "310000", "completed", now.AddDate(0, 0, -48)},
			{"Permata Bank", "130000", "failed", now.AddDate(0, 0, -50)},
			{"Xendit", "780000", "completed", now.AddDate(0, 0, -53)},
			{"Midtrans", "560000", "processing", now.AddDate(0, 0, -56)},
			{"Doku", "90000", "failed", now.AddDate(0, 0, -58)},
			{"iPaymu", "220000", "completed", now.AddDate(0, 0, -60)},
			{"Nicepay", "370000", "processing", now.AddDate(0, 0, -63)},
			{"Espay", "140000", "completed", now.AddDate(0, 0, -65)},
			{"Veritrans", "480000", "failed", now.AddDate(0, 0, -68)},
			{"2C2P", "610000", "completed", now.AddDate(0, 0, -70)},
			{"PayPro", "85000", "processing", now.AddDate(0, 0, -72)},
			{"Cashlez", "195000", "completed", now.AddDate(0, 0, -75)},
		}
		for _, p := range payments {
			if _, err := db.Exec(
				`INSERT INTO payments(merchant_name, amount, status, created_at) VALUES (?, ?, ?, ?)`,
				p.merchant, p.amount, p.status, p.createdAt.Format("2006-01-02 15:04:05"),
			); err != nil {
				return err
			}
		}
	}

	const dbLifetime = time.Minute * 5
	db.SetConnMaxLifetime(dbLifetime)
	return nil
}
