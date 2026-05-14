//go:build ignore

package main

import (
	"fmt"
	"go/ast"
	"go/parser"
	"go/token"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
)

// Heuristic tenant guard for CTO-16: SQL touching t_sawit_hub_* must bind tenant scope
// (user_id=?, l.user_id=?, email_hash=?, midtrans_order_id=?, or known job/global tables).
var (
	tenantSQLTouch = regexp.MustCompile(`(?is)` +
		`(\b(FROM|JOIN)\s+t_sawit_hub_\w+|` +
		`\bUPDATE\s+t_sawit_hub_\w+|` +
		`\bINTO\s+t_sawit_hub_\w+|` +
		`\bDELETE\s+FROM\s+t_sawit_hub_\w+)`)

	tenantGuard = regexp.MustCompile(`(?i)` +
		`(\buser_id\s*=\s*\?|` +
		`\buser_id\s*!=\s*\?|` +
		`\bl\.user_id\s*=\s*\?|` +
		`\bemail_hash\s*=\s*\?|` +
		`\bmidtrans_order_id\s*=\s*\?|` +
		`LOWER\s*\(\s*username\s*\)\s*=\s*\?|` +
		`\busername\s*=\s*\?)`)

	lahanOuterGuard = regexp.MustCompile(`(?i)\bWHERE\s+l\.user_id\s*=\s*\?`)

	// INSERT that lists tenant scope columns (positional ? binds, not necessarily "user_id=?")
	insertUserColumn = regexp.MustCompile(`(?is)\bINTO\s+t_sawit_hub_\w+\s*\([^)]*\buser_id\b[^)]*\)\s*VALUES`)
	insertEmailHashCol = regexp.MustCompile(`(?is)\bINTO\s+t_sawit_hub_users\s*\([^)]*\bemail_hash\b[^)]*\)\s*VALUES`)
)

var sqlAllowSubstring = []string{
	"INTO t_sawit_hub_payment_events",
	"FROM t_sawit_hub_subscription_reminders WHERE status='pending' AND scheduled_for",
	"FROM t_sawit_hub_payments",
	"FROM t_sawit_hub_theme_configs",
	"t_sawit_hub_password_resets",
	"t_sawit_hub_visits",
	"UPDATE t_sawit_hub_subscription_reminders SET",
	"t_sawit_hub_field_checklist_run_items",
}

func main() {
	root := "."
	internalDir := filepath.Join(root, "internal")
	failures := 0

	err := filepath.Walk(internalDir, func(path string, info os.FileInfo, err error) error {
		if err != nil || info.IsDir() {
			return nil
		}
		if !strings.HasSuffix(path, ".go") || strings.HasSuffix(path, "_test.go") {
			return nil
		}
		rel, _ := filepath.Rel(root, path)
		rel = filepath.ToSlash(rel)
		if strings.HasPrefix(rel, "internal/db/") {
			return nil
		}

		fset := token.NewFileSet()
		node, perr := parser.ParseFile(fset, path, nil, parser.ParseComments)
		if perr != nil {
			return nil
		}

		ast.Inspect(node, func(n ast.Node) bool {
			call, ok := n.(*ast.CallExpr)
			if !ok {
				return true
			}
			sel, ok := call.Fun.(*ast.SelectorExpr)
			if !ok {
				return true
			}
			switch sel.Sel.Name {
			case "QueryRowContext", "QueryContext", "ExecContext":
			default:
				return true
			}
			if len(call.Args) < 2 {
				return true
			}
			sqlStr := extractSQLString(call.Args[1])
			if sqlStr == "" {
				return true
			}
			if !tenantSQLTouch.MatchString(sqlStr) {
				return true
			}
			for _, sub := range sqlAllowSubstring {
				if strings.Contains(sqlStr, sub) {
					return true
				}
			}
			if tenantGuard.MatchString(sqlStr) || lahanOuterGuard.MatchString(sqlStr) {
				return true
			}
			if insertUserColumn.MatchString(sqlStr) || insertEmailHashCol.MatchString(sqlStr) {
				return true
			}
			pos := fset.Position(call.Pos())
			fmt.Fprintf(os.Stderr, "%s:%d: %s: tenant-scoped SQL must include user_id=? (or l.user_id=?, email_hash=?, midtrans_order_id=?)\n---\n%s\n---\n",
				pos.Filename, pos.Line, sel.Sel.Name, truncate(sqlStr, 420))
			failures++
			return true
		})
		return nil
	})
	if err != nil {
		fmt.Fprintf(os.Stderr, "walk: %v\n", err)
		os.Exit(1)
	}
	if failures > 0 {
		os.Exit(1)
	}
}

func extractSQLString(expr ast.Expr) string {
	switch e := expr.(type) {
	case *ast.BasicLit:
		if e.Kind == token.STRING {
			if strings.HasPrefix(e.Value, "`") {
				return strings.Trim(e.Value, "`")
			}
			s, err := strconv.Unquote(e.Value)
			if err != nil {
				return ""
			}
			return s
		}
	case *ast.BinaryExpr:
		if e.Op == token.ADD {
			return extractSQLString(e.X) + extractSQLString(e.Y)
		}
	}
	return ""
}

func truncate(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n] + "..."
}
