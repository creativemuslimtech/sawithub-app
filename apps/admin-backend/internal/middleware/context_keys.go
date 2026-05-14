package middleware

type contextKey string

const UserIDKey contextKey = "user_id"
const EmailKey contextKey = "email"
const RoleKey contextKey = "role"
const TokenJTIKey contextKey = "token_jti"
const TokenExpKey contextKey = "token_exp"
