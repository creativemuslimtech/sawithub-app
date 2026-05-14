package logger

import (
	"bytes"
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"sync"
	"time"
)

type lokiEntry struct {
	level   string
	message string
	fields  map[string]string
}

type lokiShipper struct {
	url      string
	username string
	password string
	service  string
	env      string
	ch       chan lokiEntry
	wg       sync.WaitGroup
	client   *http.Client
}

var shipper *lokiShipper

// InitLoki starts the async Loki log shipper. No-op if url is empty.
func InitLoki(url, username, password, service, env string) {
	if url == "" {
		return
	}
	s := &lokiShipper{
		url:      url + "/loki/api/v1/push",
		username: username,
		password: password,
		service:  service,
		env:      env,
		ch:       make(chan lokiEntry, 2000),
		client:   &http.Client{Timeout: 5 * time.Second},
	}
	shipper = s
	s.wg.Add(1)
	go s.run()
}

// CloseLoki flushes and shuts down the shipper.
func CloseLoki() {
	if shipper == nil {
		return
	}
	close(shipper.ch)
	shipper.wg.Wait()
}

func (s *lokiShipper) run() {
	defer s.wg.Done()
	batch := make([]lokiEntry, 0, 100)
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case e, ok := <-s.ch:
			if !ok {
				if len(batch) > 0 {
					s.flush(batch)
				}
				return
			}
			batch = append(batch, e)
			if len(batch) >= 100 {
				s.flush(batch)
				batch = batch[:0]
			}
		case <-ticker.C:
			if len(batch) > 0 {
				s.flush(batch)
				batch = batch[:0]
			}
		}
	}
}

func (s *lokiShipper) flush(entries []lokiEntry) {
	type logValue [2]string
	type stream struct {
		Stream map[string]string `json:"stream"`
		Values []logValue        `json:"values"`
	}
	type payload struct {
		Streams []stream `json:"streams"`
	}

	byLevel := map[string][]lokiEntry{}
	for _, e := range entries {
		byLevel[e.level] = append(byLevel[e.level], e)
	}

	var streams []stream
	ts := strconv.FormatInt(time.Now().UnixNano(), 10)
	for level, group := range byLevel {
		values := make([]logValue, 0, len(group))
		for _, e := range group {
			line, _ := json.Marshal(map[string]interface{}{
				"msg":    e.message,
				"fields": e.fields,
			})
			values = append(values, logValue{ts, string(line)})
		}
		streams = append(streams, stream{
			Stream: map[string]string{
				"service":     s.service,
				"environment": s.env,
				"level":       level,
			},
			Values: values,
		})
	}

	body, err := json.Marshal(payload{Streams: streams})
	if err != nil {
		return
	}

	req, err := http.NewRequestWithContext(context.Background(), "POST", s.url, bytes.NewReader(body))
	if err != nil {
		return
	}
	req.Header.Set("Content-Type", "application/json")
	req.SetBasicAuth(s.username, s.password)

	resp, err := s.client.Do(req)
	if err != nil {
		log.Printf("WARN: loki push failed: %v", err)
		return
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 400 {
		log.Printf("WARN: loki push status %d", resp.StatusCode)
	}
}

// ship enqueues a log entry non-blocking — drops silently if buffer is full.
func ship(level, message string, fields map[string]string) {
	if shipper == nil {
		return
	}
	select {
	case shipper.ch <- lokiEntry{level: level, message: message, fields: fields}:
	default:
	}
}

// Info logs at info level to stdout and ships to Loki.
func Info(message string, fields map[string]string) {
	log.Printf("[INFO] %s %v", message, fields)
	ship("info", message, fields)
}

// Error logs at error level to stdout and ships to Loki.
func Error(message string, fields map[string]string) {
	log.Printf("[ERROR] %s %v", message, fields)
	ship("error", message, fields)
}

// Warn logs at warn level to stdout and ships to Loki.
func Warn(message string, fields map[string]string) {
	log.Printf("[WARN] %s %v", message, fields)
	ship("warn", message, fields)
}

// Request ships an HTTP request log entry to Loki.
func Request(method, path string, status int, duration time.Duration, userID string) {
	fields := map[string]string{
		"method":   method,
		"path":     path,
		"status":   strconv.Itoa(status),
		"duration": duration.String(),
	}
	if userID != "" {
		fields["user_id"] = userID
	}
	level := "info"
	if status >= 500 {
		level = "error"
	} else if status >= 400 {
		level = "warn"
	}
	ship(level, "http request", fields)
}
