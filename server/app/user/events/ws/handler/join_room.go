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

		client := &ws.Client{
			Username:     username,
			Conn:         conn,
			RoomId:       roomId,
			ClientId:     clientId,
			Message:      make(chan *ws.Message, 10),
			MessageState: messageState,
		}

		message := ws.Message{
			MessageTxt:   "new_user",
			MessageState: "0",
			ClientId:     client.ClientId,
			RoomId:       client.RoomId,
			Username:     username,
		}

		hub.Register <- client
		hub.Broadcast <- &message

		go client.WriteMessage()
		client.ReadMessage(hub)

	})
}
