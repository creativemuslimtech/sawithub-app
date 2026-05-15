package observability

import "sync/atomic"

var cacheHit uint64
var cacheMiss uint64
var limiterAllow uint64
var limiterDeny uint64
var limiterFallback uint64
var queueProcessed uint64
var queueRetry uint64
var queueDLQ uint64

func IncCacheHit()         { atomic.AddUint64(&cacheHit, 1) }
func IncCacheMiss()        { atomic.AddUint64(&cacheMiss, 1) }
func IncLimiterAllow()     { atomic.AddUint64(&limiterAllow, 1) }
func IncLimiterDeny()      { atomic.AddUint64(&limiterDeny, 1) }
func IncLimiterFallback()  { atomic.AddUint64(&limiterFallback, 1) }
func IncQueueProcessed()   { atomic.AddUint64(&queueProcessed, 1) }
func IncQueueRetry()       { atomic.AddUint64(&queueRetry, 1) }
func IncQueueDLQ()         { atomic.AddUint64(&queueDLQ, 1) }

func Snapshot() map[string]uint64 {
	return map[string]uint64{
		"cache_hit":        atomic.LoadUint64(&cacheHit),
		"cache_miss":       atomic.LoadUint64(&cacheMiss),
		"limiter_allow":    atomic.LoadUint64(&limiterAllow),
		"limiter_deny":     atomic.LoadUint64(&limiterDeny),
		"limiter_fallback": atomic.LoadUint64(&limiterFallback),
		"queue_processed":  atomic.LoadUint64(&queueProcessed),
		"queue_retry":      atomic.LoadUint64(&queueRetry),
		"queue_dlq":        atomic.LoadUint64(&queueDLQ),
	}
}

