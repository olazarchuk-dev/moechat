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
	Username     string `json:"username"`
	UserId       string `json:"userId"`
	Message      chan *Message
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
// TODO: Receive message
func (wsService *WsService) ReadMessage(hub *Hub) {
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

		msg := Msg{}
		json.Unmarshal(data, &msg)
		//fmt.Println("TEST-2  |  messageTxt='" + msg.MessageTxt + "', messageState'" + msg.MessageState + "'")

		message := Message{
			MessageTxt:   msg.MessageTxt,
			MessageState: msg.MessageState,
			ClientId:     wsService.ClientId,
			UserId:       wsService.UserId,
			Username:     wsService.Username,
		}
		hub.Broadcast <- &message
	}
}

// from Hub to websocket Connection
// TODO: Send message
func (wsService *WsService) WriteMessage() {
	defer func() {
		fmt.Println("Connection was closed")
	}()
	for {
		select {
		case message, ok := <-wsService.Message:
			if !ok {
				return
			}
			fmt.Println(message)
			wsService.Conn.WriteJSON(message)
		}
	}
}
