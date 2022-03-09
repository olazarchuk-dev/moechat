package handler

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"github.com/nekonako/moechat/app/device/events/ws"
)

func JoinUser(hub *ws.Hub) fiber.Handler {
	return websocket.New(func(conn *websocket.Conn) {
		id := conn.Query("id")
		username := conn.Params("username")
		deviceName := conn.Query("deviceName")
		messageState := conn.Query("messageState")
		fmt.Println(" ...JoinUser <<<", "id='"+id+"'", "username='"+username+"'", "deviceName='"+deviceName+"'", "messageState='"+messageState+"'")

		wsService := &ws.WsService{
			Conn:       conn,
			Id:         id,
			Username:   username,
			DeviceName: deviceName,
			Something:  make(chan *ws.Something, 10),
		}

		something := ws.Something{
			Id:          wsService.Id,
			Username:    wsService.Username,
			DeviceName:  wsService.DeviceName,
			AppTextarea: "new_device",
			AppRange:    0,
		}

		hub.Register <- wsService
		hub.Broadcast <- &something

		go wsService.WriteSomething()
		wsService.ReadSomething(hub)

	})
}
