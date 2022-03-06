package handler

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"github.com/nekonako/moechat/app/client/events/ws"
)

func JoinUser(hub *ws.Hub) fiber.Handler {
	return websocket.New(func(conn *websocket.Conn) {
		clientId := conn.Query("clientId")
		userId := conn.Params("userId")
		username := conn.Query("username")
		messageState := conn.Query("messageState")

		fmt.Println(userId, clientId)

		wsService := &ws.WsService{
			Username:     username,
			Conn:         conn,
			UserId:       userId,
			ClientId:     clientId,
			Something:    make(chan *ws.Something, 10),
			MessageState: messageState,
		}

		something := ws.Something{
			MessageTxt:   "new_client",
			MessageState: 0,
			ClientId:     wsService.ClientId,
			UserId:       wsService.UserId,
			Username:     username,
		}

		hub.Register <- wsService
		hub.Broadcast <- &something

		go wsService.WriteSomething()
		wsService.ReadSomething(hub)

	})
}
