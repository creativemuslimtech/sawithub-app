package logger

import (
	"log"
	"os"
)

// Init sets up log to write to stdout only (Docker-compatible).
func Init() {
	log.SetOutput(os.Stdout)
	log.SetFlags(log.Ldate | log.Ltime | log.Lmsgprefix)
}

// Close is a no-op (kept for backward compatibility).
func Close() {
	// No file to close - stdout-only logging
}
