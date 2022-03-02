package ws

import (
	"fmt"
	"strings"
	"time"

	"github.com/gofiber/websocket/v2"
)

type Client struct {
	Conn     *websocket.Conn
	ClientId string `json:"clientId"`
	Username string `json:"username"`
	RoomId   string `json:"roomId"`
	Message  chan *Message
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
func (client *Client) ReadMessage(hub *Hub) {
	defer func() {
		hub.Unregister <- client
		client.Conn.Close()
	}()

	for {
		_, messageTxt, err := client.Conn.ReadMessage()
		if err != nil {
			fmt.Println(err)
			if strings.Contains(err.Error(), "websocket: close") {
				fmt.Println("close Connection")
			}
			break
		}
		message := Message{
			MessageTxt: string(messageTxt),
			ClientId:   client.ClientId,
			RoomId:     client.RoomId,
			Username:   client.Username,
		}
		hub.Broadcast <- &message
	}
}

// from Hub to websocket Connection
func (client *Client) WriteMessage() {
	defer func() {
		fmt.Println("Connection was closed")
	}()
	for {
		select {
		case message, ok := <-client.Message:
			if !ok {
				return
			}
			client.Conn.WriteJSON(message)
		}
	}
}
