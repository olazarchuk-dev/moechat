package handler

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"github.com/nekonako/moechat/app/user/events/ws"
)

func JoinRoom(hub *ws.Hub) fiber.Handler {
	return websocket.New(func(conn *websocket.Conn) {

		roomId := conn.Params("roomId")
		clientId := conn.Query("userId")
		username := conn.Query("username")
		messageState := conn.Query("messageState")

		fmt.Println(roomId, clientId)

		wsService := &ws.WsService{
			Username:     username,
			Conn:         conn,
			RoomId:       roomId,
			ClientId:     clientId,
			Message:      make(chan *ws.Message, 10),
			MessageState: messageState,
		}

		message := ws.Message{
			MessageTxt:   "new_client",
			MessageState: 0,
			ClientId:     wsService.ClientId,
			RoomId:       wsService.RoomId,
			Username:     username,
		}

		hub.Register <- wsService
		hub.Broadcast <- &message

		go wsService.WriteMessage()
		wsService.ReadMessage(hub)

	})
}
