package controllers

import (
	"database/sql"

	"github.com/gofiber/fiber/v2"

	"github.com/nekonako/moechat/app/client/events/login"
	"github.com/nekonako/moechat/app/client/events/register"
	"github.com/nekonako/moechat/app/client/events/ws"
	"github.com/nekonako/moechat/app/client/events/ws/handler"
	"github.com/nekonako/moechat/app/middleware"
)

func Init(app *fiber.App, db *sql.DB) {

	hub := ws.NewHub()
	go hub.Run()

	app.Get("/ws/users/:userId", func(c *fiber.Ctx) error {
		return handler.GetWsServiceInUser(c, hub)
	})

	app.Get("/ws/:userId", handler.JoinUser(hub))

	app.Post("/register", func(c *fiber.Ctx) error {
		return register.Handler(c, db)
	})

	app.Post("/login", func(c *fiber.Ctx) error {
		return login.Handler(c, db)
	})

	app.Post("/ws", middleware.JWTAuth, func(c *fiber.Ctx) error {
		return handler.CreateUser(c, hub)
	})

	app.Get("/ws", func(c *fiber.Ctx) error {
		return handler.GetAvailableUsers(c, hub)
	})

}
