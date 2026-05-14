package metrics

import (
	"net/http"
	"strconv"
	"time"

	"SawitHub/internal/observability"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

var (
	httpRequestsTotal = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "sawithub_http_requests_total",
		Help: "Total number of HTTP requests by method and status code",
	}, []string{"method", "status"})

	httpRequestDuration = promauto.NewHistogramVec(prometheus.HistogramOpts{
		Name:    "sawithub_http_request_duration_seconds",
		Help:    "HTTP request duration in seconds",
		Buckets: prometheus.DefBuckets,
	}, []string{"method"})
)

// observabilityCollector bridges the existing in-memory atomic counters to Prometheus.
type observabilityCollector struct {
	cacheHit        *prometheus.Desc
	cacheMiss       *prometheus.Desc
	limiterAllow    *prometheus.Desc
	limiterDeny     *prometheus.Desc
	limiterFallback *prometheus.Desc
	queueProcessed  *prometheus.Desc
	queueRetry      *prometheus.Desc
	queueDLQ        *prometheus.Desc
}

func newObservabilityCollector() *observabilityCollector {
	return &observabilityCollector{
		cacheHit:        prometheus.NewDesc("sawithub_cache_hits_total", "Total Redis cache hits", nil, nil),
		cacheMiss:       prometheus.NewDesc("sawithub_cache_misses_total", "Total Redis cache misses", nil, nil),
		limiterAllow:    prometheus.NewDesc("sawithub_ratelimit_allowed_total", "Total rate limit allowed requests", nil, nil),
		limiterDeny:     prometheus.NewDesc("sawithub_ratelimit_denied_total", "Total rate limit denied requests", nil, nil),
		limiterFallback: prometheus.NewDesc("sawithub_ratelimit_fallback_total", "Total rate limit fallback (in-memory) uses", nil, nil),
		queueProcessed:  prometheus.NewDesc("sawithub_queue_processed_total", "Total email jobs processed successfully", nil, nil),
		queueRetry:      prometheus.NewDesc("sawithub_queue_retry_total", "Total email jobs retried", nil, nil),
		queueDLQ:        prometheus.NewDesc("sawithub_queue_dlq_total", "Total email jobs moved to dead letter queue", nil, nil),
	}
}

func (c *observabilityCollector) Describe(ch chan<- *prometheus.Desc) {
	ch <- c.cacheHit
	ch <- c.cacheMiss
	ch <- c.limiterAllow
	ch <- c.limiterDeny
	ch <- c.limiterFallback
	ch <- c.queueProcessed
	ch <- c.queueRetry
	ch <- c.queueDLQ
}

func (c *observabilityCollector) Collect(ch chan<- prometheus.Metric) {
	snap := observability.Snapshot()
	ch <- prometheus.MustNewConstMetric(c.cacheHit, prometheus.CounterValue, float64(snap["cache_hit"]))
	ch <- prometheus.MustNewConstMetric(c.cacheMiss, prometheus.CounterValue, float64(snap["cache_miss"]))
	ch <- prometheus.MustNewConstMetric(c.limiterAllow, prometheus.CounterValue, float64(snap["limiter_allow"]))
	ch <- prometheus.MustNewConstMetric(c.limiterDeny, prometheus.CounterValue, float64(snap["limiter_deny"]))
	ch <- prometheus.MustNewConstMetric(c.limiterFallback, prometheus.CounterValue, float64(snap["limiter_fallback"]))
	ch <- prometheus.MustNewConstMetric(c.queueProcessed, prometheus.CounterValue, float64(snap["queue_processed"]))
	ch <- prometheus.MustNewConstMetric(c.queueRetry, prometheus.CounterValue, float64(snap["queue_retry"]))
	ch <- prometheus.MustNewConstMetric(c.queueDLQ, prometheus.CounterValue, float64(snap["queue_dlq"]))
}

// Register registers the observability collector with the default Prometheus registry.
func Register() {
	prometheus.MustRegister(newObservabilityCollector())
}

// Handler returns the Prometheus HTTP handler for the /metrics endpoint.
func Handler() http.Handler {
	return promhttp.Handler()
}

// Middleware tracks HTTP request count and duration for every request.
func Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		sw := &statusWriter{ResponseWriter: w, status: http.StatusOK}
		next.ServeHTTP(sw, r)
		httpRequestsTotal.WithLabelValues(r.Method, strconv.Itoa(sw.status)).Inc()
		httpRequestDuration.WithLabelValues(r.Method).Observe(time.Since(start).Seconds())
	})
}

type statusWriter struct {
	http.ResponseWriter
	status int
}

func (sw *statusWriter) WriteHeader(status int) {
	sw.status = status
	sw.ResponseWriter.WriteHeader(status)
}
