package http

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/acj97/fullstack-boilerplate/internal/middleware"
	"github.com/acj97/fullstack-boilerplate/internal/openapigen"
	"github.com/getkin/kin-openapi/openapi3filter"
	"github.com/go-chi/chi/v5"
	oapinethttpmw "github.com/oapi-codegen/nethttp-middleware"
)

type Server struct {
	router http.Handler
}

const (
	readTimeout  = 10
	writeTimeout = 10
	idleTimeout  = 60
)

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func NewServer(apiHandler openapigen.ServerInterface, openapiYamlPath string, jwtSecret []byte) *Server {
	swagger, err := openapigen.GetSwagger()
	if err != nil {
		log.Fatalf("failed to load swagger: %v", err)
	}

	r := chi.NewRouter()

	r.Use(corsMiddleware)
	r.Use(oapinethttpmw.OapiRequestValidatorWithOptions(
		swagger,
		&oapinethttpmw.Options{
			DoNotValidateServers:  true,
			SilenceServersWarning: true,
			Options: openapi3filter.Options{
				AuthenticationFunc: func(_ context.Context, _ *openapi3filter.AuthenticationInput) error {
					return nil
				},
			},
			ErrorHandler: func(w http.ResponseWriter, message string, statusCode int) {
				log.Printf("oapi validation error (%d): %s", statusCode, message)
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(statusCode)
				fmt.Fprintf(w, `{"code":"validation_error","message":%q}`, message)
			},
		},
	))

	r.Post("/dashboard/v1/auth/login", apiHandler.PostDashboardV1AuthLogin)

	r.Group(func(protected chi.Router) {
		protected.Use(middleware.JWTAuth(jwtSecret))
		protected.Get("/dashboard/v1/payments", func(w http.ResponseWriter, r *http.Request) {
			var params openapigen.GetDashboardV1PaymentsParams
			if s := r.URL.Query().Get("status"); s != "" {
				status := openapigen.GetDashboardV1PaymentsParamsStatus(s)
				params.Status = &status
			}
			if s := r.URL.Query().Get("sort"); s != "" {
				params.Sort = &s
			}
			apiHandler.GetDashboardV1Payments(w, r, params)
		})
	})

	return &Server{
		router: r,
	}
}

func (s *Server) Start(addr string) {
	service := &http.Server{
		Addr:         addr,
		Handler:      s.router,
		ReadTimeout:  readTimeout * time.Second,
		WriteTimeout: writeTimeout * time.Second,
		IdleTimeout:  idleTimeout * time.Second,
	}
	go func() {
		log.Printf("listening on %s", addr)
		err := service.ListenAndServe()
		if err != nil {
			log.Fatal(err.Error())
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)

	<-stop
	log.Println("Shutting down gracefully...")

	// Timeout for shutdown
	const shutdownTimeout = 10 * time.Second
	ctx, cancel := context.WithTimeout(context.Background(), shutdownTimeout)
	defer cancel()

	if err := service.Shutdown(ctx); err != nil {
		log.Fatalf("Forced shutdown: %v", err)
	}

	log.Println("Server stopped cleanly ✔")
}

func (s *Server) Routes() http.Handler {
	return s.router
}
