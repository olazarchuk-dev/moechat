package ws

import (
	"fmt"
	"strconv"
)

type Hub struct {
	Broadcast  chan *Message
	Register   chan *WebsocketService
	Unregister chan *WebsocketService
	Rooms      map[string]*Room
}

func (hub *Hub) Run() {
	for {
		select {
		case client := <-hub.Register:
			fmt.Println("Register client")
			if _, isRoomExist := hub.Rooms[client.RoomId]; !isRoomExist {
				hub.Rooms[client.RoomId] = &Room{
					RoomId:  client.RoomId,
					Clients: make(map[string]*WebsocketService),
				}
			}
			room := hub.Rooms[client.RoomId]
			if _, isCLientExist := room.Clients[client.ClientId]; !isCLientExist {
				room.Clients[client.ClientId] = client
			}

		case client := <-hub.Unregister:

			if _, isCLientExist := hub.Rooms[client.RoomId].Clients[client.ClientId]; isCLientExist {
				fmt.Println("delete connection")
				if len(hub.Rooms[client.RoomId].Clients) != 0 {
					hub.Broadcast <- &Message{
						MessageTxt: "disconnect_user",
						ClientId:   client.ClientId,
						RoomId:     client.RoomId,
						Username:   client.Username,
					}
				}
				delete(hub.Rooms[client.RoomId].Clients, client.ClientId)
				close(client.Message)
			}

			// remove room if no one clinet
			clients := hub.Rooms[client.RoomId].Clients
			if len(clients) == 0 {
				delete(hub.Rooms, client.RoomId)
			}

		case message := <-hub.Broadcast:
			if _, exist := hub.Rooms[message.RoomId]; exist {
				for _, client := range hub.Rooms[message.RoomId].Clients {
					if client.RoomId == message.RoomId {
						client.Message <- message // TODO: MessageTxt, MessageState, ClientId, RoomId, Username
						//fmt.Println(message)
						fmt.Println("Receive <<<  User_ID = '" + message.RoomId + "'  |  Client_ID = '" + message.Username + "'  |  Message_TXT = '" + message.MessageTxt + "'  |  Message_STATE = " + strconv.Itoa(message.MessageState))
					}
				}

			}
		}
	}
}

func NewHub() *Hub {
	return &Hub{
		Broadcast:  make(chan *Message, 5),
		Register:   make(chan *WebsocketService),
		Unregister: make(chan *WebsocketService),
		Rooms:      make(map[string]*Room),
	}
}
