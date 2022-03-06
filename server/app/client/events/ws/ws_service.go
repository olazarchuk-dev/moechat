package ws

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/gofiber/websocket/v2"
)

type WsService struct {
	Conn         *websocket.Conn
	ClientId     string `json:"clientId"`
	UserId       string `json:"userId"`
	Username     string `json:"username"`
	Something    chan *Something
	MessageState string `json:"messageState"`
}

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 512
)

// from webscoket Connections to Hub
// TODO: Receive something
func (wsService *WsService) ReadSomething(hub *Hub) {
	defer func() {
		hub.Unregister <- wsService
		wsService.Conn.Close()
	}()

	for {
		_, data, err := wsService.Conn.ReadMessage()
		if err != nil {
			fmt.Println(err)
			if strings.Contains(err.Error(), "websocket: close") {
				fmt.Println("close Connection")
			}
			break
		}

		msg := Msg{} // TODO: Msg as (Something...)
		json.Unmarshal(data, &msg)

		something := Something{
			ClientId:     wsService.ClientId,
			UserId:       wsService.UserId,
			Username:     wsService.Username,
			MessageTxt:   msg.MessageTxt,
			MessageState: msg.MessageState,
		}
		hub.Broadcast <- &something
	}
}

// from Hub to websocket Connection
// TODO: Send something
func (wsService *WsService) WriteSomething() {
	defer func() {
		fmt.Println("Connection was closed")
	}()
	for {
		select {
		case something, ok := <-wsService.Something:
			if !ok {
				return
			}
			fmt.Println(something)
			wsService.Conn.WriteJSON(something)
		}
	}
}
